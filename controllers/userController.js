import ApiFeatures from "../utils/apiFeatures";
import {catchAsync} from "./errorController";
import ApiError from '../utils/apiErrors'
import User from "../models/userSchema";


const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj) .forEach(el => {
      if(allowedFields.includes(el)) newObj[el] = obj[el]
  }) ;
  return newObj
};

export const getAllUsers = catchAsync(async (req, res, next) => {

    const apiFeatures = new ApiFeatures(User.find(), req.query)
        .filter()
        .pagination()
        .limitFields();

    const products = await apiFeatures.query;

    res.status(200).json({
        status:'success',
        data:products
    })
});

export const createUser = catchAsync(async (req, res, next) => {

    const newUser = await User.create(req.body);
    res.status(200).json({status:'success', data:newUser})
});

export const getUser = catchAsync(async (req, res, next) => {

    const user = await User.findById(req.params.id);
    if(!user) return next(new ApiError(`No user with ${req.params.id}, ID`, 404));

    res.status(200).json({
        status:'success',
        data: user
    })

});

export const updateUser = catchAsync(async (req, res, next) => {
    const {id} = req.params;

    const updatedUser = await User
        .findByIdAndUpdate(id, req.body, {
            new:true,
            runValidators:true
        });

    res.status(200).json({
        status:'success',
        data: updatedUser
    })

});

export const updateCurrentUser = catchAsync( async (req, res, next) => {
    if(req.body.password || req.body.passwordConfirm){
        return next(new ApiError('This route not for updating password, please use /updatePassword route', 400))
    }
    const filteredBody = filterObj(req.body, 'username', 'email');

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
            new: true,
            runValidators:true
        });

    res.status(200).json({
        status:'success',
        data: {
            user:updatedUser
        }
    });

});

export const deleteCurrentUser = catchAsync( async (req, res, next) => {
   await User.findByIdAndUpdate(req.user.id, {active: false});

    res.status(204).json({
        status:'success',
        data:null
    })

});

export const deleteUser = catchAsync(async (req, res, next) => {

    const {id} = req.params;

    await User.findByIdAndDelete(id);

    res.status(204).json({
        status: 'success',
        result: null
    })

});
