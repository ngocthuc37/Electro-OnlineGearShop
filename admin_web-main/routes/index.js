var express = require('express');
var router = express.Router();
const passport = require('passport');

var homeControllers = require('../controller/home-controllers');
var productControllers = require('../controller/product-controllers');
var orderControllers = require('../controller/order-controllers');
var userControllers = require('../controller/user-controllers');
var storeControllers = require('../controller/store-controllers');
const upload = require('../uploadMiddleware');
const { ensureAuthenticated } = require('../config/auth');

/* GET home page. */
router.get('/',ensureAuthenticated, homeControllers.index);

router.get('/home',ensureAuthenticated, homeControllers.index);

// Product
router.get('/product', productControllers.displayProducts);
router.post('/product/add',upload.single('image'), productControllers.addProduct);
router.post('/product/edit',upload.single('image'), productControllers.editProduct);
router.get('/product/delete/:id', productControllers.deleteProduct);

// Order
router.get('/order', ensureAuthenticated, orderControllers.displayOrder);
router.post('/order/update-status-order', orderControllers.updateOrder);

// Customer
router.get('/user',ensureAuthenticated, userControllers.displayUser);
router.post('/user/edit',userControllers.editUser);
router.get('/user/autho',ensureAuthenticated, userControllers.AuthoUser);
router.get('/user/lock',ensureAuthenticated, userControllers.lockUser);
router.get('/user/unlock',ensureAuthenticated, userControllers.unlockUser);
router.get('/user/delete/:id',ensureAuthenticated, userControllers.deleteUser);

// Store
router.get('/store', ensureAuthenticated, storeControllers.displayStore);
router.post('/store/add',upload.single('image'), storeControllers.addStore);
router.get('/store/delete/:id', ensureAuthenticated, storeControllers.deleteStore);

module.exports = router;
