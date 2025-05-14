/**
 * Enhanced MongoDB Debug Helper
 *
 * Run this script with: node check-schedules.js
 * It will show detailed information about schedules in the database
 */
const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
mongoose
    .connect("mongodb://localhost:27017/scheduler_db")
    .then(() => {
        console.log("MongoDB Connected: localhost");
        checkSchedules();
    })
    .catch((err) => {
        console.error("MongoDB Connection Error:", err);
        process.exit(1);
    });

// Load models
const Schedule = mongoose.model(
    "Schedule",
    new mongoose.Schema({
        class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        day_of_week: Number,
        week_number: Number,
        start_time: String,
        end_time: String,
        is_practical: Boolean,
        is_exam: Boolean,
        is_self_study: Boolean,
        special_event: { type: mongoose.Schema.Types.ObjectId, ref: "SpecialEvent" },
        notes: String,
        created_at: { type: Date, default: Date.now },
    })
);

const Class = mongoose.model(
    "Class",
    new mongoose.Schema({
        name: String,
        studentCount: Number,
        department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
        created_at: { type: Date, default: Date.now },
    })
);

const Course = mongoose.model(
    "Course",
    new mongoose.Schema({
        code: String,
        name: String,
        parent_course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
        total_hours: Number,
        theory_hours: Number,
        practical_hours: Number,
        department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
        description: String,
        created_at: { type: Date, default: Date.now },
    })
);

// Main function to check schedules
async function checkSchedules() {
    try {
        // Count documents in each collection
        const scheduleCount = await Schedule.countDocuments();
        console.log(`\n📆 Schedules in database: ${scheduleCount}`);

        // Get recent schedules
        if (scheduleCount > 0) {
            const schedules = await Schedule.find()
                .sort({ created_at: -1 })
                .limit(10)
                .populate("class", "name")
                .populate("course", "code name");

            console.log(`\n📋 Most recent ${schedules.length} schedules:`);
            schedules.forEach((schedule, i) => {
                console.log(`\n--- Schedule ${i + 1} ---`);
                console.log(`ID: ${schedule._id}`);
                console.log(`Class: ${schedule.class ? schedule.class.name : "MISSING"}`);
                console.log(`Course: ${schedule.course ? schedule.course.name : "MISSING"}`);
                console.log(`Time: Day ${schedule.day_of_week}, Week ${schedule.week_number}`);
                console.log(`Hours: ${schedule.start_time} - ${schedule.end_time}`);
                console.log(`Created: ${schedule.created_at}`);
                console.log(`Notes: ${schedule.notes || "None"}`);
            });

            // Check if any schedules have invalid references
            const brokenSchedules = await Schedule.find({
                $or: [{ class: { $exists: false } }, { class: null }, { course: { $exists: false } }, { course: null }],
            });

            if (brokenSchedules.length > 0) {
                console.log(`\n⚠️ Found ${brokenSchedules.length} schedules with missing references!`);
                brokenSchedules.forEach((schedule, i) => {
                    console.log(`Broken Schedule ${i + 1}: ID ${schedule._id}`);
                });
            } else {
                console.log(`\n✅ All schedules have valid references.`);
            }
        }

        console.log("\nDone checking schedules.");
    } catch (error) {
        console.error("Error checking schedules:", error);
    } finally {
        mongoose.disconnect();
        console.log("MongoDB connection closed.");
    }
}
