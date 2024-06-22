const Category = require('../../models/category'); // Import the Category model

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

        res.status(200).send(categories);
    } catch (error) {
        console.error('failed to load categories');
        res.status(500).send('Error sending email');
    }
};