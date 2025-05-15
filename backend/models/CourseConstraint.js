const mongoose = require("mongoose");

const courseConstraintSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    max_hours_per_week: Number,
    max_hours_per_day: Number,
    can_be_morning: {
        type: Boolean,
        default: true,
    },
    can_be_afternoon: {
        type: Boolean,
        default: true,
    },
    requires_consecutive_hours: {
        type: Boolean,
        default: false,
    },
    min_days_before_exam: {
        type: Number,
        default: 0,
    },    exam_duration_hours: {
        type: Number,
        default: 0,
    },
    exam_phases: {
        type: Number,
        default: 1,
    },
    grouped_classes: String, // Format: "1,2|3,4|5,6" for groups A-B, C-D, E-F
    notes: String,
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("CourseConstraint", courseConstraintSchema);
