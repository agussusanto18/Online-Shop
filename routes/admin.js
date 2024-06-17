var express = require('express');
var router = express.Router();
const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController');
const auth = require('../utils/auth')

router.get('', auth.isAuthenticated, adminController.index);
router.get('/categories', auth.isAuthenticated, categoryController.getAllCategories);
router.get('/categories/:id/delete', auth.isAuthenticated, categoryController.deleteCategory);
router.get('/categories/export-pdf', categoryController.exportCategoriesToPDF);
router.get('/categories/export-csv', categoryController.exportCategoriesToCSV);

module.exports = router;
