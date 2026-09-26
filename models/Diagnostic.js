const mongoose = require('mongoose');

const diagnosticSchema = new mongoose.Schema(
    {
        car: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Car',
            required: true
        },
        agent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Agent'
        },
        issueDescription: { type: String, required: true, trim: true },
        errorCodes: [{ type: String, uppercase: true, trim: true }],
        status: {
            type: String,
            enum: ['Pending', 'In progress', 'Resolved'],
            default: 'Pending'
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Diagnostic', diagnosticSchema);
