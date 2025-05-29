const mongoose = require("mongoose");

const specialEventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: String,
    date: {
        type: Date,
        required: function () {
            // Date is required if start_date is not provided
            return !this.start_date;
        },
    },
    start_date: {
        type: Date,
        required: function () {
            // start_date is required if date is not provided
            return !this.date;
        },
    },
    end_date: {
        type: Date,
        // Optional - will be calculated from start_date + duration_days if not provided
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
    type: {
        type: String,
        enum: ["periodic", "special"],
        default: "special",
    },
    timeConfigType: {
        type: String,
        enum: ["single", "range"],
        default: "single",
    },
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

// Pre-save middleware to handle date calculations
specialEventSchema.pre("save", function (next) {
    // If we have start_date but no date, set date to start_date
    if (this.start_date && !this.date) {
        this.date = this.start_date;
    }

    // If we have date but no start_date, set start_date to date
    if (this.date && !this.start_date) {
        this.start_date = this.date;
    }

    // Calculate end_date if not provided
    if (this.start_date && !this.end_date && this.duration_days > 1) {
        const endDate = new Date(this.start_date);
        endDate.setDate(endDate.getDate() + this.duration_days - 1);
        this.end_date = endDate;
    }

    // If we have end_date but no start_date/date, this is an error
    if (this.end_date && !this.start_date && !this.date) {
        return next(new Error("start_date or date is required when end_date is provided"));
    }

    // Recalculate duration_days if we have both start and end dates
    if (this.start_date && this.end_date) {
        const timeDiff = this.end_date.getTime() - this.start_date.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
        if (daysDiff > 0) {
            this.duration_days = daysDiff;
        }
    }

    next();
});

module.exports = mongoose.model("SpecialEvent", specialEventSchema);
