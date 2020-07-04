import multer from 'multer';
import ApiError from "./apiErrors";

 const multerStorage =  multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `public/img`)
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `img-${Date.now()}.${ext}`)
    }
});


const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null, true)
    } else {
        cb(new ApiError('Not an image', 400), false)
    }
};
const upload = multer({
    storage:multerStorage,
    fileFilter:multerFilter
});


export const uploadImage = upload.single('image');
