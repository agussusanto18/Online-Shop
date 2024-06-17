
exports.index = async (req, res) => {
    res.render('admin/index', {
        success_msg: req.flash('success_msg')[0] || null,
        error_msg: req.flash('error_msg')[0] || null
    })
}