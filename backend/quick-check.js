/**
 * Quick database check for maintenance periods
 */
const mongoose = require("mongoose");

async function quickCheck() {
    try {
        await mongoose.connect("mongodb://localhost:27017/scheduler_db");
        console.log("Connected to MongoDB");

        const db = mongoose.connection.db;
        const collection = db.collection("schedules");

        const total = await collection.countDocuments();
        console.log(`Total schedules: ${total}`);

        const maintenance = await collection.countDocuments({ is_maintenance: true });
        console.log(`Maintenance schedules: ${maintenance}`);

        if (maintenance > 0) {
            const maintenanceSchedules = await collection.find({ is_maintenance: true }).toArray();
            console.log("\nMaintenance schedules found:");
            maintenanceSchedules.forEach((s, i) => {
                console.log(`${i + 1}. Week ${s.week_number}, Day ${s.day_of_week}, ${s.start_time}-${s.end_time}`);
                console.log(`   Notes: ${s.notes}`);
                console.log(`   Type: ${s.event_type}`);
            });
        }

        await mongoose.connection.close();
        console.log("Connection closed");
    } catch (error) {
        console.error("Error:", error);
    }
}

quickCheck();
