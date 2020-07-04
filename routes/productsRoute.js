import express from 'express'
import multer from 'multer'

const upload = multer({dest:'public/img'})

const router = express.Router();
import {
    getAllProducts,
    createProduct,
    getProduct,
    updateProduct,
    deleteProduct, getCheapestProducts
} from '../controllers/productController'
import {restrictTo, RouteProtect} from '../controllers/authController'
import {uploadImage} from "../utils/upload";
router
    .route('/cheapest')
    .get(getCheapestProducts, getAllProducts);

router
    .route('/')
    .get(getAllProducts)
    .post(RouteProtect, restrictTo('admin', 'leader-guide', 'guide'), uploadImage, createProduct);

router
    .route('/:id')
    .get(getProduct)
    .patch(RouteProtect, restrictTo('admin', 'leader-guide', 'guide'), uploadImage,  updateProduct)
    .delete(RouteProtect, restrictTo('admin', 'leader-guide', 'guide'),deleteProduct);



module.exports = router;
