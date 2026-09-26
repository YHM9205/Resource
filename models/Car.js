const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
    {
        make: { type: String, required: true, trim: true },
        model: { type: String, required: true, trim: true },
        year: { type: Number, required: true, min: 1886 },
        vin: { type: String, trim: true, uppercase: true, unique: true, sparse: true },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Owner',
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Car', carSchema);
