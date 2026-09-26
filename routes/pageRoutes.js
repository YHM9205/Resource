const express = require('express');
const { showHome, showParts } = require('../controllers/pageController');
const { requireUser } = require('../controllers/authController');

const router = express.Router();

router.get('/', showHome);
router.get('/parts', requireUser, showParts);
module.exports = router;
