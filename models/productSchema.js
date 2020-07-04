import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            required: [true, 'Товар должен иметь название'],
            unique: true,
            maxlength: [40, 'Название не должно привышать более 40 символов'],
            minlength: [5, 'Название не должно привышать более 40 символов']

        },
        description: {
            type: String,
            required: true,
            maxlength: [500, 'Название не должно привышать более 500 символов'],
        },
        price: {
            type: Number,
            required: true,
        },
        date: {
            type: Date,
            select: false,
            default: Date.now()
        },
        isMix: {
            type:Boolean,
            default: false
        },
        category:{
            type:mongoose.Schema.ObjectId,
            ref:'Categories'
        },
        mixes: [
            {
                separateId: {
                    type:mongoose.Schema.ObjectId,
                    ref:'Products'
                },
                percent: {
                    type:String
                }
            }
        ],
        image: String

    },
    {
        versionKey: false
    }


);

ProductSchema.pre(/^find/, function (next) {

   this.populate({
       path:'category',
       select: '-__v -description -image',

   });
   next()

});

module.exports = mongoose.model('Products', ProductSchema);
