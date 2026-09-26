const express = require('express');
const {
    getDiagnosticPage,
    checkDiagnostic
} = require('../controllers/diagnosticController');
const { requireUser } = require('../controllers/authController');

const router = express.Router();

router.get('/system', requireUser, getDiagnosticPage);
router.post('/system/check', requireUser, checkDiagnostic);

module.exports = router;
