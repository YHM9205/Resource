const diagnosticResults = {
    P0000: {
        name: 'No fault detected',
        status: 'Optimal',
        explanation: 'The vehicle scanner did not detect an active fault.',
        solution: 'No repair is required. Clear the stored code and monitor the vehicle.'
    },
    P0119: {
        name: 'Engine coolant temperature sensor',
        status: 'Check required',
        explanation: 'The coolant temperature sensor signal is intermittent.',
        solution: 'Inspect the sensor connector and wiring, then test or replace the sensor.',
        part: 'Engine coolant temperature sensor',
        location: 'Usually fitted near the thermostat housing or on the cylinder head coolant outlet.',
        function: 'Measures coolant temperature and sends the reading to the engine control unit.',
        replacement: [
            'Let the engine cool completely and disconnect the battery.',
            'Locate the sensor near the thermostat housing and disconnect its electrical connector.',
            'Remove the old sensor, install the replacement with a new seal, and reconnect it.',
            'Reconnect the battery, clear the code, and check for coolant leaks.'
        ]
    },
    P0920: {
        name: 'Gear shift actuator circuit',
        status: 'Repair required',
        explanation: 'The transmission control system detected a problem with the gear shift actuator circuit.',
        solution: 'Do not keep driving if shifting is unsafe. Inspect the actuator wiring and have the clutch and actuator tested.',
        part: 'Gear shift actuator',
        location: 'Mounted on the transmission gearbox, connected to the gear selection mechanism.',
        function: 'Moves the transmission selector so the control unit can select the requested gear.',
        replacement: [
            'Park safely, apply the parking brake, and disconnect the battery.',
            'Identify the actuator on the gearbox and inspect its connector and wiring first.',
            'Remove the actuator mounting bolts, install the replacement, and reconnect the wiring.',
            'Run a transmission calibration procedure with a suitable diagnostic scanner.'
        ]
    }
}

const vehicleTypes = {
    sedan: {
        label: 'Sedan',
        description: 'Everyday passenger car',
        image: '/images/vehicles/sedan.svg'
    },
    suv: {
        label: 'SUV',
        description: 'Sport utility vehicle',
        image: '/images/vehicles/suv.svg'
    },
    pickup: {
        label: 'Pickup',
        description: 'Pickup truck',
        image: '/images/vehicles/pickup.svg'
    },
    hatchback: {
        label: 'Hatchback',
        description: 'Compact hatchback',
        image: '/images/vehicles/hatchback.svg'
    }
}

const vehicleModels = {
    ram1500: {
        label: 'RAM 1500',
        type: 'pickup',
        description: 'Full-size pickup truck',
        image: '/images/vehicles/pickup.svg'
    },
    rangeRover: {
        label: 'Range Rover',
        type: 'suv',
        description: 'Luxury sport utility vehicle',
        image: '/images/vehicles/suv.svg'
    },
    fordTaurus: {
        label: 'Ford Taurus',
        type: 'sedan',
        description: 'Passenger sedan',
        image: '/images/vehicles/sedan.svg'
    },
    mazdaCx9: {
        label: 'Mazda CX-9',
        type: 'suv',
        description: 'Family SUV',
        image: '/images/vehicles/suv.svg'
    }
}

const normalizeCode = (value) => {
    return String(value || '').trim().toUpperCase()
}

const getDiagnosticPage = (req, res) => {
    const code = normalizeCode(req.query.code)
    const vehicleType = String(req.query.vehicle || 'sedan').toLowerCase()
    const model = String(req.query.model || 'ram1500')
    const selectedModel = vehicleModels[model] || vehicleModels.ram1500
    res.render('system', {
        code,
        result: code ? diagnosticResults[code] || null : null,
        vehicle: vehicleTypes[vehicleType] || vehicleTypes.sedan,
        vehicleType: vehicleTypes[vehicleType] ? vehicleType : 'sedan',
        vehicleTypes,
        vehicleModels,
        model: vehicleModels[model] ? model : 'ram1500',
        selectedModel,
        system: Object.entries(diagnosticResults).map(([diagnosticCode, result]) => ({
            code: diagnosticCode,
            ...result
        }))
    })
}

const checkDiagnostic = (req, res) => {
    const code = normalizeCode(req.body.code)
    const vehicle = String(req.body.vehicle || 'sedan').toLowerCase()
    const model = String(req.body.model || 'ram1500')
    const query = new URLSearchParams()
    if (code) query.set('code', code)
    if (vehicleTypes[vehicle]) query.set('vehicle', vehicle)
    if (vehicleModels[model]) query.set('model', model)
    res.redirect(`/system?${query.toString()}`)
}

module.exports = { getDiagnosticPage, checkDiagnostic }
