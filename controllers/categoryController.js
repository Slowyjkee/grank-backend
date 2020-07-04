import Category from '../models/categorySchema'
import ApiFeatures from "../utils/apiFeatures";
import {catchAsync} from "./errorController";
import ApiError from '../utils/apiErrors'
import Product from "../models/productSchema";

export const getAllCategories = catchAsync(async (req, res, next) => {

    const apiFeatures = new ApiFeatures(Category.find().select('-__v'), req.query)
        .filter()
        .pagination()
        .limitFields();

    const categories = await apiFeatures.query;

    res.status(200).json({
        categories
    })
});

export const createCategory = catchAsync(async (req, res, next) => {
    let image;
    if(req.file) image = req.file.filename;
    const newCategory = await Category.create({
        name:req.body.name,
        description:req.body.description,
        image:image,
    });
    res.status(200).json({[newCategory._id]: newCategory})
});

export const getCategory = catchAsync(async (req, res, next) => {

    const product = await Category.findById(req.params.id);
    if(!product) return next(new ApiError(`No category with ${req.params.id}, ID`, 404));

    res.status(200).json({
        status:'success',
        data: product
    })

});

export const deleteCategory = catchAsync(async (req, res, next) => {

    const category = await Category.findByIdAndDelete(req.params.id);
    if(!category) return next(new ApiError(`No category with ${req.params.id}, ID`, 404));

    res.status(200).json({
        status:'success',
        data: null
    })

});


export const updateCategory = catchAsync(async (req, res, next) => {
    const {id} = req.params;
    let image;
    if(req.file) image = req.file.filename;

    const categoryBody = {
        name:req.body.name,
        description:req.body.description,
        image:image,
    };
    const updatedCategory = await Category
        .findByIdAndUpdate(id, categoryBody, {
            new:true
        }).select('-__v');

    res.status(200).json({
        [updatedCategory._id]:updatedCategory
    })

});



