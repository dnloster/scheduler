const mongoose = require("mongoose");

const specialEventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: String,
    date: {
        type: Date,
        required: true,
    },
    duration_days: {
        type: Number,
        default: 1,
    },
    recurring: {
        type: Boolean,
        default: false,
    },
    recurring_pattern: String, // 'FIRST_MONDAY', 'EVERY_THURSDAY', etc.
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("SpecialEvent", specialEventSchema);
