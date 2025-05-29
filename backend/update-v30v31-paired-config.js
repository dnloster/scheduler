/**
 * Script to update V30/V31 constraints to use paired course configuration
 * This addresses the issue where V30 and V31 are currently configured as separate courses
 * instead of being treated as a combined course pair for exam scheduling.
 */

const mongoose = require("mongoose");
const connectDB = require("./database");
const Course = require("./models/Course");
const CourseConstraint = require("./models/CourseConstraint");

// Connect to database
connectDB();

async function updateV30V31PairedConfig() {
    try {
        console.log("🔍 Updating V30/V31 paired course configuration...");

        // Find V30 and V31 courses
        const v30Course = await Course.findOne({ code: "V30" });
        const v31Course = await Course.findOne({ code: "V31" });

        if (!v30Course || !v31Course) {
            console.error("❌ Cannot find V30 or V31 courses");
            return;
        }

        console.log(`✅ Found courses: V30 (${v30Course._id}) and V31 (${v31Course._id})`);

        // Combined hour thresholds based on V30 (246h) + V31 (306h) = 552h total
        const phaseHourThresholds = [
            { phase: 1, cumulative_hours: 132 }, // After 132 cumulative hours
            { phase: 2, cumulative_hours: 231 }, // After 231 cumulative hours
            { phase: 3, cumulative_hours: 367 }, // After 367 cumulative hours
            { phase: 4, cumulative_hours: 446 }, // After 446 cumulative hours
            { phase: 5, cumulative_hours: 527 }, // After 527 cumulative hours (end of course)
        ];

        // Update V30 constraint to paired course configuration
        console.log("⚙️ Updating V30 constraint...");
        const v30Constraint = await CourseConstraint.findOneAndUpdate(
            { course: v30Course._id },
            {
                $set: {
                    is_paired_course: true,
                    paired_course: v31Course._id,
                    combined_total_hours: 552, // V30 (246h) + V31 (306h)
                    phase_hour_thresholds: phaseHourThresholds,
                    exam_phases: 5,
                    min_days_before_exam: 3,
                    exam_duration_hours: 4,
                    notes: "V30 học song song với V31 - Kiểm tra theo số tiết tích lũy kết hợp (V30+V31)",
                },
            },
            { upsert: true, new: true }
        );

        // Update V31 constraint to paired course configuration
        console.log("⚙️ Updating V31 constraint...");
        const v31Constraint = await CourseConstraint.findOneAndUpdate(
            { course: v31Course._id },
            {
                $set: {
                    is_paired_course: true,
                    paired_course: v30Course._id,
                    combined_total_hours: 552, // V30 (246h) + V31 (306h)
                    phase_hour_thresholds: phaseHourThresholds,
                    exam_phases: 5,
                    min_days_before_exam: 3,
                    exam_duration_hours: 4,
                    notes: "V31 học song song với V30 - Kiểm tra theo số tiết tích lũy kết hợp (V30+V31)",
                },
            },
            { upsert: true, new: true }
        );

        console.log("✅ Successfully updated V30/V31 paired course configuration:");
        console.log(`   V30 constraint ID: ${v30Constraint._id}`);
        console.log(`   V31 constraint ID: ${v31Constraint._id}`);
        console.log("   Combined total hours: 552");
        console.log("   Phase thresholds: 132, 231, 367, 446, 527 hours");
        console.log("   Exam phases: 5");

        console.log("\n📋 Verification - V30 Constraint:");
        console.log({
            is_paired_course: v30Constraint.is_paired_course,
            paired_course: v30Constraint.paired_course,
            combined_total_hours: v30Constraint.combined_total_hours,
            phase_hour_thresholds: v30Constraint.phase_hour_thresholds,
            exam_phases: v30Constraint.exam_phases,
        });

        console.log("\n📋 Verification - V31 Constraint:");
        console.log({
            is_paired_course: v31Constraint.is_paired_course,
            paired_course: v31Constraint.paired_course,
            combined_total_hours: v31Constraint.combined_total_hours,
            phase_hour_thresholds: v31Constraint.phase_hour_thresholds,
            exam_phases: v31Constraint.exam_phases,
        });
    } catch (error) {
        console.error("❌ Error updating V30/V31 paired configuration:", error);
    } finally {
        mongoose.connection.close();
    }
}

updateV30V31PairedConfig();
