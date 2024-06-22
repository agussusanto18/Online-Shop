const Product = require('../models/product'); // Import the Product model
const Category = require('../models/category'); // Import the Category model
const PDFDocument = require('pdfkit');
const fs = require('fs');
const json2csv = require('json2csv').Parser;

exports.index = async (req, res) => {
    try {
        const ITEMS_PER_PAGE = +req.query.items || 10;
        const page = +req.query.page || 1; // Current page number, default to 1 if not provided
        const searchQuery = req.query.search || '';
        let totalItems;
        let products;

        if (searchQuery) {
            const regex = new RegExp(searchQuery, 'i');
            totalItems = await Product.countDocuments({ productName: regex });
            products = await Product.find({ productName: regex })
                .populate('category')
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        } else {
            totalItems = await Product.countDocuments();
            products = await Product.find()
                .populate('category')
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        }

        res.render('admin/product/index', {
            products,
            searchQuery,
            currentPage: page,
            itemPerPage: ITEMS_PER_PAGE,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPrevPage: page > 1,
            nextPage: page + 1,
            prevPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
            success_msg: req.flash('success_msg')[0] || null,
            error_msg: req.flash('error_msg')[0] || null,
        });
    } catch (error) {
        req.flash('error_msg', 'Failed to load products');
        res.redirect('/admin');
    }
}

exports.deleteProduct = async (req, res) => {
    const productId = req.params.id;

    try {
        await Product.findByIdAndDelete(productId);
        req.flash('success_msg', 'Product deleted successfully');
        res.redirect('/admin/products');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to delete product');
        res.redirect('/admin/products');
    }
};

exports.createProduct = async (req, res) => {
    try {
        const categories = await Category.find({ status: 'active' })

        res.render('admin/product/form', {
            categories,
            isUpdate: false,
            productName: "", category: "", productPrice: "", condition: "", productDescription: "", productStock: "", productWeight: "", productSize: "", status: "",
            status: null,
            success_msg: req.flash('success_msg')[0] || null,
            error_msg: req.flash('error_msg')[0] || null,
        });
    } catch (error) {
        req.flash('error_msg', 'Failed to load products');
        res.redirect('/admin/products');
    }
};

exports.createProductPost = async (req, res) => {
    try {
        
        let { submit_value, productName, category, productPrice, condition, productDescription, productStock, productWeight, productSize, status } = req.body;
        let error_msg = "";

        console.log(req.body);
        if (!productName || !category || !productPrice || !condition || !productDescription || !productStock || !productWeight || !productSize || !status) {
            error_msg = 'Please fill in all fields';
        }

        if (error_msg) {
            const categories = await Category.find({ status: 'active' })
            return res.render('admin/product/form', {
                categories,
                isUpdate: false,
                error_msg,
                success_msg: '',
                productName, category, productPrice, condition, productDescription, productStock, productWeight, productSize, status
            });
        }

        const productPhotos = [
            'https://m.media-amazon.com/images/I/71kBeFDgCkL._AC_UF894,1000_QL80_.jpg',
            'https://img1.gadgetsnow.com/gd/images/products/original/G451574.jpg'
        ]
        const newProduct = new Product({ productName, category, productPhotos, productPrice, condition, productDescription, productStock, productWeight, productSize, status });
        await newProduct.save();

        req.flash('success_msg', 'Product created successfully');
        if (submit_value === 'save_add_new') {
            res.redirect('/admin/products/create');
        } else {
            res.redirect('/admin/products');
        }
    } catch (error) {
        console.log(error);
        req.flash('error_msg', 'Failed to create product');
        res.redirect('/admin/products');
    }
};
