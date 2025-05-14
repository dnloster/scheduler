// Test script to verify improved ObjectID helper functions
// filepath: d:\congviec\sang_kien\2025\scheduler\frontend\src\tests\test-improved-helpers.js

import { findClassId, findCourseId } from "../utils/objectIdHelper";
import axios from "axios";

// Define API endpoints
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

async function runTest() {
    try {
        console.log("Fetching test data from API...");

        // Fetch classes and courses data
        const classesResponse = await axios.get(`${API_BASE_URL}/classes`);
        const coursesResponse = await axios.get(`${API_BASE_URL}/courses`);

        const classes = classesResponse.data;
        const courses = coursesResponse.data;

        console.log(`Fetched ${classes.length} classes and ${courses.length} courses`);

        // Test different types of inputs for class ID lookup
        const classIdTests = [
            // MongoDB ObjectIDs
            { input: classes[0]._id, expected: classes[0]._id, description: "Direct ObjectID string" },

            // Numeric IDs
            { input: classes[0].id, expected: classes[0]._id, description: "Numeric ID" },
            { input: String(classes[0].id), expected: classes[0]._id, description: "String numeric ID" },

            // Objects
            { input: classes[0], expected: classes[0]._id, description: "Full class object" },
            { input: { id: classes[0].id }, expected: classes[0]._id, description: "Object with numeric ID" },
            { input: { name: classes[0].name }, expected: classes[0]._id, description: "Object with name" },

            // Name lookup
            { input: classes[0].name, expected: classes[0]._id, description: "Class name string" },
        ];

        // Test different types of inputs for course ID lookup
        const courseIdTests = [
            // MongoDB ObjectIDs
            { input: courses[0]._id, expected: courses[0]._id, description: "Direct ObjectID string" },

            // Numeric IDs
            { input: courses[0].id, expected: courses[0]._id, description: "Numeric ID" },
            { input: String(courses[0].id), expected: courses[0]._id, description: "String numeric ID" },

            // Objects
            { input: courses[0], expected: courses[0]._id, description: "Full course object" },
            { input: { id: courses[0].id }, expected: courses[0]._id, description: "Object with numeric ID" },
            { input: { code: courses[0].code }, expected: courses[0]._id, description: "Object with code" },
            { input: { name: courses[0].name }, expected: courses[0]._id, description: "Object with name" },

            // Code and name lookups
            { input: courses[0].code, expected: courses[0]._id, description: "Course code string" },
            { input: courses[0].name, expected: courses[0]._id, description: "Course name string" },
        ];

        console.log("\n==== CLASS ID LOOKUP TESTS ====");

        // Run class ID tests
        for (const test of classIdTests) {
            const result = findClassId(test.input, classes);
            const success = result === test.expected;
            console.log(
                `${success ? "✓" : "✗"} ${test.description}:`,
                `Input: ${JSON.stringify(test.input)}`,
                `Expected: ${test.expected}`,
                `Result: ${result}`
            );
        }

        console.log("\n==== COURSE ID LOOKUP TESTS ====");

        // Run course ID tests
        for (const test of courseIdTests) {
            const result = findCourseId(test.input, courses);
            const success = result === test.expected;
            console.log(
                `${success ? "✓" : "✗"} ${test.description}:`,
                `Input: ${JSON.stringify(test.input)}`,
                `Expected: ${test.expected}`,
                `Result: ${result}`
            );
        }

        console.log("\n==== TESTING WITH ACTUAL SCHEDULE DATA ====");

        // Test with a simulated schedule generation output
        // Create some test schedule entries with various ID formats
        const testScheduleDetails = [
            // Entry with MongoDB ObjectIDs
            {
                class_id: classes[0]._id,
                course_id: courses[0]._id,
                day_of_week: 1,
                week_number: 1,
                start_time: "07:30:00",
                end_time: "09:00:00",
            },

            // Entry with numeric IDs
            {
                class_id: classes[1].id,
                course_id: courses[1].id,
                day_of_week: 2,
                week_number: 1,
                start_time: "09:10:00",
                end_time: "10:40:00",
            },

            // Entry with name/code
            {
                class_id: classes[0].name,
                course_id: courses[0].code,
                day_of_week: 3,
                week_number: 1,
                start_time: "10:50:00",
                end_time: "12:20:00",
            },
        ];

        console.log("Test schedule details:");
        testScheduleDetails.forEach((detail, i) => {
            const classId = findClassId(detail.class_id, classes);
            const courseId = findCourseId(detail.course_id, courses);

            console.log(`Entry ${i + 1}:`, {
                original: {
                    class_id: detail.class_id,
                    course_id: detail.course_id,
                },
                resolved: {
                    class_id: classId,
                    course_id: courseId,
                },
                valid: Boolean(classId && courseId),
            });
        });
    } catch (error) {
        console.error("Test error:", error);
    }
}

runTest();
