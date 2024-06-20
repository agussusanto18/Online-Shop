
exports.index = async (req, res) => {
    res.render('admin/transaction/index', {
        success_msg: req.flash('success_msg')[0] || null,
        error_msg: req.flash('error_msg')[0] || null
    })
}