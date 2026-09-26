const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        location: { type: String, required: true, trim: true },
        phone: { type: String, trim: true }
    }, { timestamps: true }
);

module.exports = mongoose.model('Workshop', workshopSchema);
