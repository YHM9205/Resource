const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
    {
        car: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Car',
            required: true
        },
        serviceType: { type: String, required: true, trim: true },
        cost: { type: Number, required: true, min: 0 },
        partsUsed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Part' }],
        notes: { type: String, trim: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Maintenance', maintenanceSchema);
