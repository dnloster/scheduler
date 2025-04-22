const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: String,
    director: String,
    contactInfo: String,
    startDate: Date,
    endDate: Date,
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Department", departmentSchema);
