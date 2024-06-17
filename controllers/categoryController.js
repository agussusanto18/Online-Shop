const Category = require('../models/category'); // Import the Category model
const PDFDocument = require('pdfkit');
const fs = require('fs');
const json2csv = require('json2csv').Parser;

// Get all categories and render the index page
exports.getAllCategories = async (req, res) => {
    try {
        const ITEMS_PER_PAGE = +req.query.items || 10;
        const page = +req.query.page || 1; // Current page number, default to 1 if not provided
        const searchQuery = req.query.search || '';
        let totalItems;
        let categories;

        if (searchQuery) {
            const regex = new RegExp(searchQuery, 'i');
            totalItems = await Category.countDocuments({ name: regex });
            categories = await Category.find({ name: regex })
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        } else {
            totalItems = await Category.countDocuments();
            categories = await Category.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        }

        res.render('admin/category/index', { 
            categories,
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
        req.flash('error_msg', 'Failed to load categories');
        res.redirect('/admin');
    }
};

exports.deleteCategory = async (req, res) => {
    const categoryId = req.params.id;

    try {
        await Category.findByIdAndDelete(categoryId);
        req.flash('success_msg', 'Category deleted successfully');
        res.redirect('/admin/categories'); 
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to delete category');
        res.redirect('/admin/categories'); 
    }
};

exports.exportCategoriesToPDF = async (req, res) => {
    try {
        const categories = await Category.find();
        res.render('admin/category/print', { 
            categories
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to export categories to PDF');
        res.redirect('/admin/categories'); // Redirect to categories list with error message
    }
};

exports.exportCategoriesToCSV = async (req, res) => {
    try {
        const categories = await Category.find();

        const fields = ['name', 'tags', 'slug', 'totalProducts', 'status'];
        const opts = { fields, header: true };

        const parser = new json2csv(opts);
        const csv = parser.parse(categories);

        res.setHeader('Content-disposition', 'attachment; filename=categories.csv');
        res.set('Content-Type', 'text/csv');
        res.status(200).send(csv);
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to export categories to CSV');
        res.redirect('/categories'); // Redirect to categories list with error message
    }
};