// filepath: d:\congviec\sang_kien\2025\scheduler\frontend\src\tests\test-schedule-validation.js

import React from "react";
import enhancedHelper from "../utils/enhancedObjectIdHelper";
import * as originalHelper from "../utils/objectIdHelper";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

/**
 * Test function to validate a generated schedule
 */
async function testScheduleValidation() {
    try {
        // Fetch data from API
        console.log("📂 Fetching data from API...");
        const [departmentsResponse, classesResponse, coursesResponse] = await Promise.all([
            axios.get(`${API_BASE_URL}/departments`),
            axios.get(`${API_BASE_URL}/classes`),
            axios.get(`${API_BASE_URL}/courses`),
        ]);

        const departments = departmentsResponse.data;
        const classes = classesResponse.data;
        const courses = coursesResponse.data;

        console.log(`Fetched ${departments.length} departments, ${classes.length} classes, ${courses.length} courses`);

        // Log sample data
        console.log("Sample class:", classes[0]);
        console.log("Sample course:", courses[0]);

        // Create sample schedule details
        const sampleScheduleDetails = generateSampleScheduleDetails(classes, courses);

        // Test validation with both helpers
        console.group("🔍 Testing Original Helper");
        const originalValidResults = originalHelper.validateScheduleDetails(sampleScheduleDetails, classes, courses);
        console.log(
            `Original helper validation: ${originalValidResults.length}/${sampleScheduleDetails.length} valid entries`
        );
        console.groupEnd();

        console.group("🔍 Testing Enhanced Helper - Normal Mode");
        const enhancedValidResults = enhancedHelper.validateScheduleDetails(sampleScheduleDetails, classes, courses, {
            debug: true,
        });
        console.log(
            `Enhanced helper validation: ${enhancedValidResults.length}/${sampleScheduleDetails.length} valid entries`
        );
        console.groupEnd();

        console.group("🔍 Testing Enhanced Helper - Lenient Mode");
        const lenientValidResults = enhancedHelper.validateScheduleDetails(sampleScheduleDetails, classes, courses, {
            lenientMode: true,
            debug: true,
        });
        console.log(
            `Enhanced helper (lenient) validation: ${lenientValidResults.length}/${sampleScheduleDetails.length} valid entries`
        );
        console.groupEnd();

        // Test individual functions
        testIdResolution(classes, courses);
    } catch (error) {
        console.error("Error during test:", error);
    }
}

/**
 * Generate varied sample schedule details for testing
 */
function generateSampleScheduleDetails(classes, courses) {
    if (!classes.length || !courses.length) {
        console.error("No classes or courses available for test data generation");
        return [];
    }

    const details = [];

    // Create different types of entries to test different lookup methods

    // 1. Entry with MongoDB ObjectIDs (should work with all helpers)
    if (classes[0]._id && courses[0]._id) {
        details.push({
            class_id: classes[0]._id,
            course_id: courses[0]._id,
            day_of_week: 1,
            week_number: 1,
            start_time: "07:30:00",
            end_time: "09:00:00",
        });
    }

    // 2. Entry with numeric IDs (problematic for strict validation)
    if (classes[0].id !== undefined && courses[0].id !== undefined) {
        details.push({
            class_id: classes[0].id,
            course_id: courses[0].id,
            day_of_week: 2,
            week_number: 1,
            start_time: "09:10:00",
            end_time: "10:40:00",
        });
    }

    // 3. Entry with object references
    details.push({
        class_id: classes[0],
        course_id: courses[0],
        day_of_week: 3,
        week_number: 1,
        start_time: "10:50:00",
        end_time: "12:20:00",
    });

    // 4. Entry with name/code lookup
    if (classes[0].name && courses[0].code) {
        details.push({
            class_id: classes[0].name,
            course_id: courses[0].code,
            day_of_week: 4,
            week_number: 1,
            start_time: "13:30:00",
            end_time: "15:00:00",
        });
    }

    // 5. Entry with missing fields (should fail)
    details.push({
        class_id: classes[0]._id,
        day_of_week: 5,
        week_number: 1,
        start_time: "15:10:00",
        end_time: "16:40:00",
    });

    return details;
}

/**
 * Test ID resolution for classes and courses
 */
function testIdResolution(classes, courses) {
    console.group("🧪 Testing Class ID Resolution");

    if (classes.length > 0) {
        const classToTest = classes[0];
        console.log("Test class:", classToTest);

        // Test different inputs
        const classInputs = [
            classToTest._id,
            classToTest.id,
            String(classToTest.id),
            classToTest.name,
            classToTest,
            { id: classToTest.id },
            { name: classToTest.name },
        ];

        classInputs.forEach((input) => {
            console.log(`Input: ${JSON.stringify(input)}`);

            const originalResult = originalHelper.findClassId(input, classes);
            const enhancedResult = enhancedHelper.findClassId(input, classes);
            const lenientResult = enhancedHelper.findClassId(input, classes, { lenientMode: true });

            console.log(`  Original:  ${originalResult || "null"}`);
            console.log(`  Enhanced:  ${enhancedResult || "null"}`);
            console.log(`  Lenient:   ${lenientResult || "null"}`);
        });
    }
    console.groupEnd();

    console.group("🧪 Testing Course ID Resolution");

    if (courses.length > 0) {
        const courseToTest = courses[0];
        console.log("Test course:", courseToTest);

        // Test different inputs
        const courseInputs = [
            courseToTest._id,
            courseToTest.id,
            String(courseToTest.id),
            courseToTest.code,
            courseToTest.name,
            courseToTest,
            { id: courseToTest.id },
            { code: courseToTest.code },
            { name: courseToTest.name },
        ];

        courseInputs.forEach((input) => {
            console.log(`Input: ${JSON.stringify(input)}`);

            const originalResult = originalHelper.findCourseId(input, courses);
            const enhancedResult = enhancedHelper.findCourseId(input, courses);
            const lenientResult = enhancedHelper.findCourseId(input, courses, { lenientMode: true });

            console.log(`  Original:  ${originalResult || "null"}`);
            console.log(`  Enhanced:  ${enhancedResult || "null"}`);
            console.log(`  Lenient:   ${lenientResult || "null"}`);
        });
    }
    console.groupEnd();
}

// Start the test
testScheduleValidation();
