import mongoose from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

const UserSchema = new mongoose.Schema(
    {
        username: {
            type:String,
            required:[true, 'Please provide your username'],
            maxlength:[10, 'Username can contain only 10 characters']
        },
        email: {
            type:String,
            required:[true, 'Please provide your email'],
            unique:true,
            validate:[validator.isEmail, 'please provide a valid Email']
        },
        password: {
            type:String,
            required: [true, 'Please provide password'],
            minLength:6
        },
        role: {
            type: String,
            enum:['user', 'guide', 'lead-guide', 'admin'],
            default:'user'
        },
        subscriptions: {
          type:Boolean,
          default: false
        },
        active: {
            type:Boolean,
            default: true,
            select:false
        },
        passwordConfirm: {
            type:String,
            required:[true, 'Please confirm your password'],
             //WORKS ONLY ON SAVE && CREATE
            validate: {
                validator: function (el) {
                    return el === this.password; // 12345 === 12345
                },
                message:'Password are not the same'
            }
        },
        passwordChangedAt:Date,
        passwordResetToken:String,
        passwordResetExpires:Date
    }
);

UserSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConfirm = undefined;

    next();
});

UserSchema.pre('save', function (next) {

    if(!this.isModified('password')) return next();

    this.passwordChangedAt = Date.now() - 1000;

    next();

});

UserSchema.pre(/^find/, function (next) {

   this.find({active: {$ne: false}});

   next();
});

UserSchema.methods.correctPassword = async function(
    candidatePassword, userPassword
){
  return bcrypt.compare(candidatePassword, userPassword)
};

UserSchema.methods.changedPasswordAfter =  function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000, 10)
        return JWTTimestamp < changedTimestamp;
    }
    return false
};


UserSchema.methods.createPasswordResetToken = function(){

    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken
};

module.exports = mongoose.model('User', UserSchema);
