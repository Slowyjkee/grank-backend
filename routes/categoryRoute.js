import express from 'express'
const router = express.Router();
import {
    getAllCategories,
    createCategory, getCategory, deleteCategory, updateCategory
} from '../controllers/categoryController'
import {restrictTo, RouteProtect} from '../controllers/authController'
import {uploadImage} from "../utils/upload";
import {deleteProduct, updateProduct} from "../controllers/productController";
router
    .route('/')
    .get(RouteProtect, getAllCategories)
    .post(RouteProtect, restrictTo('admin', 'leader-guide', 'guide'), uploadImage, createCategory);

router
    .route('/:id')
    .get(getCategory)
    .delete(RouteProtect, restrictTo('admin', 'leader-guide', 'guide'),deleteCategory)
    .patch(RouteProtect, restrictTo('admin', 'leader-guide', 'guide'), uploadImage,  updateCategory);


module.exports = router;
