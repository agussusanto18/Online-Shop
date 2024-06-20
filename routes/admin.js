var express = require('express');
var router = express.Router();
const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const transactionController = require('../controllers/transactionController');
const auth = require('../utils/auth')

router.get('', auth.isAuthenticated, adminController.index);
router.get('/categories', auth.isAuthenticated, categoryController.getAllCategories);
router.get('/categories/:id/delete', auth.isAuthenticated, categoryController.deleteCategory);
router.get('/categories/export-pdf', categoryController.exportCategoriesToPDF);
router.get('/categories/export-csv', categoryController.exportCategoriesToCSV);
router.get('/categories/create', auth.isAuthenticated, categoryController.createCategory);
router.post('/categories/create', auth.isAuthenticated, categoryController.createCategoryPost);
router.get('/categories/:id/update', auth.isAuthenticated, categoryController.updateCategory);
router.post('/categories/:id/update', auth.isAuthenticated, categoryController.updateCategoryPost);

router.get('/products', auth.isAuthenticated, productController.index);
router.get('/products/:id/delete', auth.isAuthenticated, productController.deleteProduct);

router.get('/transactions', auth.isAuthenticated, transactionController.index);

module.exports = router;
