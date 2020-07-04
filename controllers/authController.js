import User from '../models/userSchema'
import {catchAsync} from "./errorController";
import jwt from 'jsonwebtoken'
import ApiError from "../utils/apiErrors";
import {promisify} from 'util'
import {sendEmail} from "../utils/email";
import crypto from 'crypto'

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES
    });
};

const createSendToken = (user, statusCode, res) => {

    const token = signToken(user._id);

    const cookieOptions =  {
        expires:  new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 1000),
        httpOnly:true
    };

    res.cookie('jwt', token, cookieOptions);

    res.status(statusCode).json({
        user
    })
};

export const signup  = catchAsync(async (req, res, next) => {

    const newUser = await User.create({
        username:req.body.username,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm,
        passwordChangedAt:req.body.passwordChangedAt,
        role:req.body.role
    });

    createSendToken(newUser, 201, res)

});




export const signIn  = catchAsync(async (req, res, next) => {

    const {email, password} = req.body;

    if(!email || !password){
      return next(new ApiError(`please provide email and password`, 400))
    }

    const user = await User.findOne({email}).select('+password');

    const correct = await user.correctPassword(password, user.password);

    if(!user  || !correct){
        return next(new ApiError('incorrect email or password', 400))
    }
    createSendToken(user, 200, res)

});

export const RouteProtect = catchAsync(async (req, res, next) => {
    let token;
    let authHeaders = req.headers.authorization || req.cookies.jwt;
    if(authHeaders && authHeaders.startsWith('Bearer')){
        token = authHeaders.split(' ')[1]
    } else {
        token = authHeaders;
    }
    if(!token) return next(new ApiError('Access! Please login to get access', 401));

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const enabledUser = await User.findById(decoded.id);

    if(!enabledUser) return next(new ApiError('User is not exists'), 401);

    if(enabledUser.changedPasswordAfter(decoded.iat)){
        return next(
            new ApiError('User recently changed password, please log in again', 401)
        )
    }
    req.user =enabledUser;

    next()
});

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new ApiError('You dont have permissions to do this'))
        }
        next();
    }
};

export const forgotPassword = catchAsync( async (req, res ,next) => {

    const user = await User.findOne({email:req.body.email});
    if(!user){
        return next(new ApiError('There is no with email address', 404))
    }
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave:false});

    const resetUrl  = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH req with your new password and passConfirm to:${resetUrl}`;

    try {

        await sendEmail({
            email:user.email,
            subject:'Your password reset token (valid 10 min)',
            message
        });

        res.status(200).json({
            status:'success',
            message: 'Token sent to email!'
        })
    }catch (e) {
        console.trace(e)
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});
        return next(new ApiError(('There was an error sending to email. Try again later')))
    }

});


export const checkStatus = catchAsync( async (req, res, next) => {

    const user = await User.findById(req.user.id);
    if(!user) next(new ApiError('Token is invalid'));
    console.log(req.user)
    res.status(200).json({
        status:true
    })

});

export const resetPassword = catchAsync( async (req, res, next) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne(({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gt: Date.now()}
    }));
    if(!user){
        return next(new ApiError('Token is invalid or expired', 400))
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token
    });
});

export const updatePassword = catchAsync( async (req, res, next) => {

    const user = await User.findById(req.user.id).select('+password');

    if(!user.correctPassword(req.body.passwordCurrent, user.password)) return next(new ApiError('User password is incorrect'));

    user.password = req.body.password;

    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();

    createSendToken(user, 200, res)

});


