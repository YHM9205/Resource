const Car = require('../models/Car')
const Owner = require('../models/Owner')
const mongoose = require('mongoose')

async function getOwner(user) {
    return Owner.findOneAndUpdate(
        { user: user.id },
        { $setOnInsert: { user: user.id, fullName: user.username, phone: 'Not provided' } },
        { new: true, upsert: true }
    )
}

function carData(body) {
    return {
        make: String(body.make || '').trim(),
        model: String(body.model || '').trim(),
        year: Number(body.year),
        vin: String(body.vin || '').trim().toUpperCase() || undefined
    }
}

function validCar(data) {
    const validVin = !data.vin || /^[A-HJ-NPR-Z0-9]{17}$/.test(data.vin)
    return data.make && data.model && data.make.length <= 60 && data.model.length <= 60 && Number.isInteger(data.year) && data.year >= 1886 && data.year <= new Date().getFullYear() + 1 && validVin
}

function validCarId(id) {
    return mongoose.isValidObjectId(id)
}

async function showGarage(req, res) {
    try {
        const owner = await getOwner(req.session.user)
        const cars = await Car.find({ owner: owner.id }).sort({ createdAt: -1 })
        return res.render('garage', { cars, editingCar: null, error: '', message: req.query.message || '' })
    } catch (error) {
        console.error('Garage load failed:', error.message)
        return res.status(503).render('garage', { cars: [], editingCar: null, error: 'Garage storage is unavailable. Start MongoDB and try again.', message: '' })
    }
}

async function createCar(req, res) {
    const data = carData(req.body)
    if (!validCar(data)) {
        return res.status(400).render('garage', { cars: [], editingCar: data, error: 'Enter a valid make, model, and year.', message: '' })
    }
    try {
        const owner = await getOwner(req.session.user)
        await Car.create({ ...data, owner: owner.id })
        return res.redirect('/garage?message=Vehicle%20added%20successfully')
    } catch (error) {
        console.error('Vehicle creation failed:', error.message)
        return res.status(400).render('garage', { cars: [], editingCar: data, error: 'Vehicle could not be added. Check the VIN is not already registered.', message: '' })
    }
}

async function showEditCar(req, res) {
    if (!validCarId(req.params.id)) return res.status(404).send('Vehicle not found.')
    try {
        const owner = await getOwner(req.session.user)
        const [cars, editingCar] = await Promise.all([
            Car.find({ owner: owner.id }).sort({ createdAt: -1 }),
            Car.findOne({ _id: req.params.id, owner: owner.id })
        ])
        if (!editingCar) return res.status(404).render('garage', { cars, editingCar: null, error: 'Vehicle not found.', message: '' })
        return res.render('garage', { cars, editingCar, error: '', message: '' })
    } catch (error) {
        console.error('Vehicle edit load failed:', error.message)
        return res.status(503).send('Garage storage is unavailable.')
    }
}

async function updateCar(req, res) {
    if (!validCarId(req.params.id)) return res.status(404).send('Vehicle not found.')
    const data = carData(req.body)
    if (!validCar(data)) return res.redirect(`/garage/${req.params.id}/edit`)
    try {
        const owner = await getOwner(req.session.user)
        const car = await Car.findOneAndUpdate({ _id: req.params.id, owner: owner.id }, data, { new: true, runValidators: true })
        if (!car) return res.status(404).send('Vehicle not found.')
        return res.redirect('/garage?message=Vehicle%20updated%20successfully')
    } catch (error) {
        console.error('Vehicle update failed:', error.message)
        return res.status(400).send('Vehicle could not be updated.')
    }
}

async function deleteCar(req, res) {
    if (!validCarId(req.params.id)) return res.status(404).send('Vehicle not found.')
    try {
        const owner = await getOwner(req.session.user)
        const car = await Car.findOneAndDelete({ _id: req.params.id, owner: owner.id })
        if (!car) return res.status(404).send('Vehicle not found.')
        return res.redirect('/garage?message=Vehicle%20deleted')
    } catch (error) {
        console.error('Vehicle deletion failed:', error.message)
        return res.status(400).send('Vehicle could not be deleted.')
    }
}

module.exports = { showGarage, createCar, showEditCar, updateCar, deleteCar }
