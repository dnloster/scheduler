const axios = require("axios");
const mongoose = require("mongoose");
require("./models/Schedule");

const API_URL = "http://localhost:5000/api";

// Sample schedule data for testing
const testData = {
    department_id: "6802140acf7fab6f85e1d31a", // Use a real department ID from your database
    start_date: "2025-06-01",
    end_date: "2025-12-01",
    total_weeks: 24,
    events: [],
    courses: [],
    constraints: {},
    schedule_details: [
        {
            class_id: "6802140acf7fab6f85e1d31c", // Use a real class ID from your database
            course_id: "6802140acf7fab6f85e1d323", // Use a real course ID from your database
            day_of_week: 1,
            week_number: 1,
            start_time: "07:30:00",
            end_time: "09:00:00",
            is_practical: false,
            is_exam: false,
            is_self_study: false,
            special_event_id: null,
            notes: "Test schedule entry",
        },
    ],
};

// Connect to MongoDB to verify the results
async function connectToMongo() {
    try {
        await mongoose.connect("mongodb://localhost:27017/scheduler_db");
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
}

// Function to send test data to the schedule generation endpoint
async function testScheduleGeneration() {
    try {
        console.log("Sending schedule generation request...");
        console.log("API URL:", API_URL);
        console.log("Test data:", JSON.stringify(testData, null, 2));

        const response = await axios.post(`${API_URL}/schedule/generate`, testData, {
            headers: { "Content-Type": "application/json" },
            timeout: 15000, // 15 seconds timeout
        });
        console.log("Response from API:", response.data);

        // Check if schedules were actually created
        const Schedule = mongoose.model("Schedule");
        const savedSchedules = await Schedule.find();
        console.log(`Found ${savedSchedules.length} schedules in the database`);

        if (savedSchedules.length > 0) {
            console.log("Sample schedule:", savedSchedules[0]);
        }

        return savedSchedules.length;
    } catch (error) {
        console.error("Error testing schedule generation:");
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("Server returned error:", error.response.status);
            console.error("Error data:", error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error("No response received, check if server is running");
            console.error(error.request);
        } else {
            // Something happened in setting up the request
            console.error("Request setup error:", error.message);
        }
        return 0;
    } finally {
        await mongoose.connection.close();
        console.log("MongoDB connection closed");
    }
}

// Run the test
(async () => {
    await connectToMongo();
    const count = await testScheduleGeneration();
    console.log(`Test completed. ${count} schedules generated.`);
    process.exit(0);
})();
