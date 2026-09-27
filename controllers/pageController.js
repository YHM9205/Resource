const showHome = (req, res) => {
    res.render('home', { user: req.session.user || null });
}

const showParts = (req, res) => {
    res.render('parts');
}

module.exports = { showHome, showParts };
