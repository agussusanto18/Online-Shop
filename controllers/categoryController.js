const Category = require('../models/category'); // Import the Category model
const PDFDocument = require('pdfkit');
const fs = require('fs');
const json2csv = require('json2csv').Parser;
const axios = require('axios');

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


// Get all categories and render the index page
exports.createCategory = async (req, res) => {
    try {
        res.render('admin/category/form', {
            isUpdate: false,
            name: '',
            slug: '',
            tags: '',
            status: null,
            success_msg: req.flash('success_msg')[0] || null,
            error_msg: req.flash('error_msg')[0] || null,
        });
    } catch (error) {
        req.flash('error_msg', 'Failed to load categories');
        res.redirect('/admin/categories');
    }
};

exports.createCategoryPost = async (req, res) => {
    try {
        let { submit_value, name, slug, tags, status } = req.body;
        let error_msg = "";

        if (!name || !slug || !tags) {
            error_msg = 'Please fill in all fields';
        }

        if (error_msg) {
            return res.render('admin/category/form', {
                isUpdate: false,
                error_msg,
                success_msg: '',
                name,
                slug,
                tags,
                status
            });
        }

        let totalProducts = 0;
        status = status ? 'active' : 'inactive';
        const newCategory = new Category({ name, tags, slug, totalProducts, status });
        await newCategory.save();

        req.flash('success_msg', 'Category created successfully');
        if (submit_value === 'save_add_new') {
            res.redirect('/admin/categories/create');
        } else {
            res.redirect('/admin/categories');
        }
    } catch (error) {
        req.flash('error_msg', 'Failed to create category');
        res.redirect('/admin/categories');
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const _id = req.params.id;
        const category = await Category.findOne({ _id });

        res.render('admin/category/form', {
            isUpdate: true,
            _id,
            name: category.name,
            slug: category.slug,
            tags: category.tags,
            status: category.status === 'active' ? 'active' : null,
            success_msg: req.flash('success_msg')[0] || null,
            error_msg: req.flash('error_msg')[0] || null,
        });
    } catch (error) {
        req.flash('error_msg', 'Failed to load categories');
        res.redirect('/admin/categories');
    }
};

exports.updateCategoryPost = async (req, res) => {
    try {
        const _id = req.params.id;
        let { name, slug, tags, status } = req.body;
        let error_msg = "";

        if (!name || !slug || !tags) {
            error_msg = 'Please fill in all fields';
        }

        if (error_msg) {
            return res.render('admin/category/form', {
                _id,
                isUpdate: true,
                error_msg,
                success_msg: '',
                name,
                slug,
                tags,
                status
            });
        }

        status = status ? 'active' : 'inactive';
        const category = await Category.findOne({ _id });
        category.name = name;
        category.slug = slug;
        category.tags = tags;
        category.status = status;
        await category.save();

        req.flash('success_msg', 'Category updated successfully');
        res.redirect('/admin/categories');
    } catch (error) {
        req.flash('error_msg', 'Failed to update category');
        res.redirect('/admin/categories');
    }
};

exports.getCategoriesAPI = async (req, res) => {
    try {
        const response = await axios.get('http://localhost:3000/admin/api/categories');
        res.status(200).json(response.data);
    } catch (error) {
        next(error);
    }
};