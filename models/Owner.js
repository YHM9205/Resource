const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        garageName: {
            type: String,
            trim: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Owner', ownerSchema);
