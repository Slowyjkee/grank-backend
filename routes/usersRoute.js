import express from 'express'
const router = express.Router();
import {
    checkStatus,
    forgotPassword,
    resetPassword,
    RouteProtect,
    signIn,
    signup,
    updatePassword
} from '../controllers/authController'
import {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getUser,
    updateCurrentUser, deleteCurrentUser
} from '../controllers/userController'

router.post('/signup', signup);
router.post('/signIn', signIn);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updateMyPassword', RouteProtect, updatePassword);
router.patch('/updateCurrentUser', RouteProtect, updateCurrentUser);
router.patch('/deleteCurrentUser', RouteProtect, deleteCurrentUser);
router.get('/checkStatus', RouteProtect, checkStatus);
router
    .route('/')
    .get(getAllUsers)
    .post(createUser);

router
    .route('/:id')
    .get(getUser)
    .delete(deleteUser)
    .patch(updateUser);

module.exports = router;
