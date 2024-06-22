var express = require('express');
var router = express.Router();
const categoryController = require('../../controllers/api/categoryController');
const auth = require('../../utils/auth')

router.get('/categories', categoryController.getAllCategories);

module.exports = router;
