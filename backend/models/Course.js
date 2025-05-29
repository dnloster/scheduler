const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    parent_course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        default: null,
    },
    total_hours: {
        type: Number,
        required: true,
    },
    theory_hours: {
        type: Number,
        default: 0,
    },
    practical_hours: {
        type: Number,
        default: 0,
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true,
    },
    description: String,
    // Course scheduling constraints
    max_hours_per_week: {
        type: Number,
        default: null,
    },
    max_hours_per_day: {
        type: Number,
        default: null,
    },
    max_morning_hours: {
        type: Number,
        default: null,
    },
    max_afternoon_hours: {
        type: Number,
        default: null,
    },
    min_days_before_exam: {
        type: Number,
        default: 0,
    },
    exam_duration: {
        type: Number,
        default: 0,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Course", courseSchema);
