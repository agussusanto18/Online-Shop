const Product = require('../models/product'); // Import the Category model
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