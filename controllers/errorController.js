import ApiError from "../utils/apiErrors";

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path} : ${err.value}`;
    return new ApiError(message, 404)
};
const handleDuplicateError = err => {
    let key = Object.keys(err.keyValue)[0];
    const message = `This ${key} with value ${err.keyValue[key]} already have been used`;
    return new ApiError(message, 404)

};

const handleSwitchAction = (error) => {
    switch (error.name || error.code) {
        case 'CastError':
            return handleCastErrorDB(error);
        case '11000':
            return handleDuplicateError(error);
        case 'ValidationError':
            return handleValidationError(error);
        case 'JsonWebTokenError':
            return handleJSONWebTokenError(error);
        case 'TokenExpiredError':
            return handleJSONWebTokenExpireError(error);
        default :
           return error
    }
}

const handleValidationError = err => {
    const message = `Validation errors`;
    const data = Object.values(err.errors).map(el =>  {
      return {[el.path]:el.message}
    } );
    return new ApiError(message, 400, data);
};
const handleJSONWebTokenError = _ => {
    const message = `Incorrect JWT TOKEN`;
    return new ApiError(message, 400);
};
const handleJSONWebTokenExpireError = _ => {
    const message = `JWT Token has expired`;
    return new ApiError(message, 400);
};
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status:err.status,
        message: err.message,
        stack: err.stack,
    })
};

const sendErrorProd = (err, res) => {
    console.log(err)
    if(err.data){
        res.send({[err.message] : err.data})
    }
    else if (err.isOperational){
        res.status(err.statusCode).json({
            status:err.status,
            message: err.message,
            error:err.error
        })
    } else {
        res.status(500).json({
            status:'error',
            message:'Something went wrong!'
        })
    }
};

export const errorController = ((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
     if(process.env.NODE_ENV === 'dev') {
         sendErrorDev(err, res);
     } else if(process.env.NODE_ENV === 'prod') {
         let error = {...err};
         error.message = err.message;
         error = handleSwitchAction(error);
         sendErrorProd(error, res);
     }
 });


export const catchAsync = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next)
    } ;
};
