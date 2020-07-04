import mongoose from 'mongoose'

const CategorySchema = new mongoose.Schema(
    {
        name: {
            type:String,
            required: [true, 'Категория должна иметь название'],
            unique:true,
            maxlength:[40, 'Название не должно привышать более 40 символов'],
            minlength:[5, 'Название не должно быть менее 5 символов']
        },
        description: {
            type:String,
            required: true,
            maxlength:[500, 'Название не должно привышать более 500 символов'],
        },
        image: {
            type:String
        }
    }
);

module.exports = mongoose.model('Categories', CategorySchema);
