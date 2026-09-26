const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, default: 'Yame Agent', trim: true },
        status: {
            type: String,
            enum: ['Active', 'Inactive', 'Maintenance'],
            default: 'Active'
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Owner',
            required: true
        },
        capabilities: [{ type: String, trim: true }]
        ,
        constraints: [{
            type: String,
            trim: true
        }],
        learningMode: {
            type: String,
            enum: ['user-feedback-only', 'disabled'],
            default: 'user-feedback-only'
        },
        instructions: [{
            type: String,
            trim: true
        }],
        knowledge: [{
            topic: { type: String, required: true, trim: true },
            content: { type: String, required: true, trim: true },
            source: { type: String, enum: ['user', 'diagnostic'], default: 'user' },
            approved: { type: Boolean, default: false }
        }],
        feedback: [{
            question: { type: String, required: true, trim: true },
            answer: { type: String, required: true, trim: true },
            correction: { type: String, trim: true },
            approved: { type: Boolean, default: false }
        }]
    },
    { timestamps: true }
);

module.exports = mongoose.model('Agent', agentSchema);
