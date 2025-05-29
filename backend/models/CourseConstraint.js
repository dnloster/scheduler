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
    start_date: {
        type: Date,
        required: false,
    },
    requires_consecutive_hours: {
        type: Boolean,
        default: false,
    },
    min_days_before_exam: {
        type: Number,
        default: 0,
    },
    exam_duration_hours: {
        type: Number,
        default: 0,
    },
    exam_phases: {
        type: Number,
        default: 1,
    },
    // Fields for paired courses like V30/V31
    is_paired_course: {
        type: Boolean,
        default: false,
    },
    paired_course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        default: null,
    },
    combined_total_hours: {
        type: Number,
        default: null, // Total hours for both courses combined (V30+V31 = 552)
    },
    phase_hour_thresholds: [
        {
            phase: Number,
            cumulative_hours: Number, // Hours from both courses combined
        },
    ],
    grouped_classes: String, // Format: "1,2|3,4|5,6" for groups A-B, C-D, E-F
    notes: String,
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("CourseConstraint", courseConstraintSchema);
