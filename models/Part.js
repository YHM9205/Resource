const mongoose = require('mongoose');

const partSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        partNumber: { type: String, required: true, unique: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        stock: { type: Number, default: 0, min: 0 },
        referenceUrl: { type: String, trim: true },
        replacementGuideUrl: { type: String, trim: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Part', partSchema);
