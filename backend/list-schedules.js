const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");

// Database connection URI
const uri = "mongodb://localhost:27017/scheduler_db";

async function listSchedules() {
    try {
        const client = await MongoClient.connect(uri);
        console.log("Connected to MongoDB");

        const db = client.db();
        const schedules = await db.collection("schedules").find().limit(10).toArray();

        console.log(`Found ${schedules.length} schedule entries:`);

        if (schedules.length > 0) {
            schedules.forEach((schedule, index) => {
                console.log(`\n--- Schedule ${index + 1} ---`);
                console.log(`ID: ${schedule._id}`);
                console.log(`Class: ${schedule.class}`);
                console.log(`Course: ${schedule.course}`);
                console.log(`Day of Week: ${schedule.day_of_week}`);
                console.log(`Week Number: ${schedule.week_number}`);
                console.log(`Time: ${schedule.start_time} - ${schedule.end_time}`);
                console.log(`Practical: ${schedule.is_practical}`);
                console.log(`Exam: ${schedule.is_exam}`);
                console.log(`Notes: ${schedule.notes}`);
            });
        } else {
            console.log("No schedules found in database");
        }

        await client.close();
        console.log("MongoDB connection closed");
    } catch (error) {
        console.error("Error:", error);
    }
}

listSchedules();
