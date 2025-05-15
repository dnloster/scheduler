const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
    },
    day_of_week: {
        type: Number, // 1 = Monday, 2 = Tuesday, etc.
        required: true,
        min: 1,
        max: 7,
    },
    week_number: {
        type: Number,
        required: true,
    },
    start_time: {
        type: String, // Format: "HH:MM:SS"
        required: true,
    },
    end_time: {
        type: String, // Format: "HH:MM:SS"
        required: true,
    },
    is_practical: {
        type: Boolean,
        default: false,
    },
    is_exam: {
        type: Boolean,
        default: false,
    },
    is_self_study: {
        type: Boolean,
        default: false,
    },
    special_event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SpecialEvent",
        default: null,
    },
    notes: String,
    actual_date: {
        type: Date,
        default: null,
    },
    exam_phase: {
        type: Number,
        default: 1,
    },
    total_phases: {
        type: Number,
        default: 1,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Schedule", scheduleSchema);
