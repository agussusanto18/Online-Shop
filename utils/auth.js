
exports.isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/auth/signin');
    }
}

exports.isNotAuthenticated = (req, res, next) => {
    if (req.session.user) {
        res.redirect('/admin');
    } else {
        return next();
    }
}
