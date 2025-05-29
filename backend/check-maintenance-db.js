/**
 * Check database directly for maintenance periods
 */
const mongoose = require("mongoose");
const connectDB = require("./database");
const Schedule = require("./models/Schedule");

connectDB();

async function checkMaintenanceInDB() {
    try {
        console.log("=== CHECKING DATABASE FOR MAINTENANCE PERIODS ===");

        const allSchedules = await Schedule.find({}).sort({ week_number: 1, day_of_week: 1 });
        console.log(`Total schedules: ${allSchedules.length}`);

        const maintenanceSchedules = allSchedules.filter((s) => s.is_maintenance === true);
        console.log(`Maintenance schedules: ${maintenanceSchedules.length}`);

        const breakSchedules = allSchedules.filter((s) => s.is_break === true);
        console.log(`Break schedules: ${breakSchedules.length}`);

        const nullClassSchedules = allSchedules.filter((s) => !s.class);
        console.log(`Schedules with null class: ${nullClassSchedules.length}`);

        const nullCourseSchedules = allSchedules.filter((s) => !s.course);
        console.log(`Schedules with null course: ${nullCourseSchedules.length}`);

        // Show all schedules with null class or course
        const specialSchedules = allSchedules.filter((s) => !s.class || !s.course);
        console.log(`\nSpecial schedules (null class/course): ${specialSchedules.length}`);

        if (specialSchedules.length > 0) {
            specialSchedules.forEach((schedule, i) => {
                console.log(`\nSpecial Schedule ${i + 1}:`);
                console.log(`  Week: ${schedule.week_number}, Day: ${schedule.day_of_week}`);
                console.log(`  Time: ${schedule.start_time} - ${schedule.end_time}`);
                console.log(`  Class: ${schedule.class || "NULL"}`);
                console.log(`  Course: ${schedule.course || "NULL"}`);
                console.log(`  Is maintenance: ${schedule.is_maintenance}`);
                console.log(`  Is break: ${schedule.is_break}`);
                console.log(`  Event type: ${schedule.event_type || "none"}`);
                console.log(`  Notes: ${schedule.notes || "none"}`);
            });
        }

        // Check if we have any schedules with the maintenance flag
        const hasMaintenanceField = allSchedules.some((s) => s.hasOwnProperty("is_maintenance"));
        console.log(`\nSchedules have is_maintenance field: ${hasMaintenanceField}`);

        // Show sample schedule structure
        if (allSchedules.length > 0) {
            console.log("\nSample schedule structure:");
            console.log(Object.keys(allSchedules[0].toObject()));
        }
    } catch (error) {
        console.error("Error checking database:", error);
    } finally {
        await mongoose.connection.close();
        console.log("\nMongoDB connection closed");
    }
}

checkMaintenanceInDB();
