import Product from '../models/productSchema'
import ApiFeatures from "../utils/apiFeatures";
import {catchAsync} from "./errorController";
import ApiError from '../utils/apiErrors'


export const getCheapestProducts = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = 'price';
    req.query.fields = 'title, price, duration';
    next();
};

export const getAllProducts = catchAsync(async (req, res, next) => {

        const apiFeatures = new ApiFeatures(Product.find(), req.query)
            .filter()
            .pagination()
            .limitFields();

        const products = await apiFeatures.query;

        res.status(200).json({
            products
        })
});

export const createProduct = catchAsync(async (req, res, next) => {
    let image;
    if(req.file) image = req.file.filename;
    const newProduct = await Product.create({
        price:req.body.price,
        description:req.body.description,
        image:image,
        title:req.body.title,
        isMix:req.body.isMix,
        mixes:req.body.mixes,
        category:req.body.category
    });
    res.status(200).json({[newProduct._id]: newProduct})
});

export const getProduct = catchAsync(async (req, res, next) => {

    const product = await Product.findById(req.params.id);
    if(!product) return next(new ApiError(`No product with ${req.params.id}, ID`, 404));

    res.status(200).json({
        status:'success',
        data: null
    })

});

export const updateProduct = catchAsync(async (req, res, next) => {
    const {id} = req.params;
    console.log('body')
    console.log(req.body)
    const updatedProduct = await Product
        .findByIdAndUpdate(id, req.body, {
        new:true
    });

    res.status(200).json({
        [updatedProduct._id]:updatedProduct
    })

});

export const deleteProduct = catchAsync(async (req, res, next) => {
    const {id} = req.params;

    await Product.findByIdAndDelete(id);

    res.status(204).json({
        status: 'success',
        result: null
    })

});
