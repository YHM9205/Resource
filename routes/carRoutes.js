const express = require('express');
const { requireUser } = require('../controllers/authController');
const {
    showGarage,
    createCar,
    showEditCar,
    updateCar,
    deleteCar
} = require('../controllers/carController');

const router = express.Router();

router.get('/garage', requireUser, showGarage);
router.post('/garage', requireUser, createCar);
router.get('/garage/:id/edit', requireUser, showEditCar);
router.post('/garage/:id/update', requireUser, updateCar);
router.post('/garage/:id/delete', requireUser, deleteCar);

module.exports = router;
