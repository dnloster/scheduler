/**
 * Test script to verify schedule date calculations
 */
const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
const constraintProcessor = require("./constraint-processor");

// Database connection URI
const uri = "mongodb://localhost:27017/scheduler_db";

async function testScheduleDates() {
    try {
        console.log("Testing schedule date calculations...");

        // Test basic date calculation
        const startDate = "2025-06-09"; // This should be our correct start date
        console.log(`Using start date: ${startDate}`);

        // Calculate dates for different weeks and days
        console.log("\nCalculating actual dates for various weeks:");

        for (let week = 1; week <= 20; week += 5) {
            for (let day = 1; day <= 5; day++) {
                const actualDate = constraintProcessor.calculateActualDate(week, day, startDate);
                console.log(`Week ${week}, Day ${day}: ${actualDate.toISOString().split("T")[0]}`);
            }
            console.log("-----");
        }

        // Connect to the database
        console.log("\nChecking actual dates in database...");

        const client = await MongoClient.connect(uri);
        console.log("Connected to MongoDB");

        const db = client.db();
        const schedules = await db.collection("schedules").find().sort({ actual_date: 1 }).limit(10).toArray();

        console.log(`Found ${schedules.length} schedule entries:`);

        if (schedules.length > 0) {
            const earliestDate = new Date(schedules[0].actual_date);
            console.log(`\nEarliest schedule date: ${earliestDate.toISOString().split("T")[0]}`);

            // Check if the date correctly starts from June
            if (earliestDate.getMonth() === 5) {
                // JavaScript months are 0-based, so 5 = June
                console.log("✓ Schedules correctly start from June");
            } else {
                console.log(
                    `✗ Schedules do NOT start from June, instead they start from month ${earliestDate.getMonth() + 1}`
                );
            }

            // Check several schedules
            schedules.forEach((schedule, index) => {
                console.log(`\n--- Schedule ${index + 1} ---`);

                // Calculate expected date
                const expectedDate = constraintProcessor.calculateActualDate(
                    schedule.week_number,
                    schedule.day_of_week,
                    startDate
                );

                const actualDate = new Date(schedule.actual_date);

                console.log(`Week ${schedule.week_number}, Day ${schedule.day_of_week}`);
                console.log(`Expected date: ${expectedDate.toISOString().split("T")[0]}`);
                console.log(`Actual stored date: ${actualDate.toISOString().split("T")[0]}`);

                if (expectedDate.toISOString().split("T")[0] === actualDate.toISOString().split("T")[0]) {
                    console.log("✓ Dates match correctly");
                } else {
                    console.log("✗ Dates do NOT match");
                }
            });
        } else {
            console.log("No schedules found in database");
        }

        await client.close();
        console.log("\nMongoDB connection closed");
    } catch (error) {
        console.error("Error:", error);
    }
}

testScheduleDates();
