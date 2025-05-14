/**
 * Test file for the emergency repair functionality
 * This tests the emergency repair mode of the enhanced object ID helper
 */

import enhancedHelper from "../utils/enhancedObjectIdHelper";

// Sample data for testing
const sampleClasses = [
    { _id: "5f8d5a6d1f9e3a2e7c8b4567", id: 1, name: "Class A" },
    { _id: "5f8d5a6d1f9e3a2e7c8b4568", id: 2, name: "Class B" },
    { _id: "5f8d5a6d1f9e3a2e7c8b4569", id: 3, name: "Class C" },
];

const sampleCourses = [
    { _id: "5f8d5a6d1f9e3a2e7c8b4570", id: 101, name: "Course X", code: "CSE101" },
    { _id: "5f8d5a6d1f9e3a2e7c8b4571", id: 102, name: "Course Y", code: "CSE102" },
    { _id: "5f8d5a6d1f9e3a2e7c8b4572", id: 103, name: "Course Z", code: "CSE103" },
];

// Test case 1: Normal schedule details
console.log("=== Test Case 1: Normal schedule details ===");
const normalScheduleDetails = [
    {
        class_id: "5f8d5a6d1f9e3a2e7c8b4567",
        course_id: "5f8d5a6d1f9e3a2e7c8b4570",
        day_of_week: 1,
        week_number: 1,
        start_time: "08:00:00",
        end_time: "09:30:00",
    },
    {
        class_id: "5f8d5a6d1f9e3a2e7c8b4568",
        course_id: "5f8d5a6d1f9e3a2e7c8b4571",
        day_of_week: 2,
        week_number: 1,
        start_time: "10:00:00",
        end_time: "11:30:00",
    },
];

const result1 = enhancedHelper.emergencyRepairSchedule(normalScheduleDetails, sampleClasses, sampleCourses);
console.log(`Result 1: ${result1.length} repaired entries`);

// Test case 2: Missing class_id
console.log("\n=== Test Case 2: Missing class_id ===");
const missingClassIdSchedule = [
    {
        course_id: "5f8d5a6d1f9e3a2e7c8b4570",
        day_of_week: 1,
        week_number: 1,
        start_time: "08:00:00",
        end_time: "09:30:00",
    },
];

const result2 = enhancedHelper.emergencyRepairSchedule(missingClassIdSchedule, sampleClasses, sampleCourses);
console.log(`Result 2: ${result2.length} repaired entries`);
console.log(`Repaired class_id: ${result2[0].class_id}`);

// Test case 3: Missing course_id
console.log("\n=== Test Case 3: Missing course_id ===");
const missingCourseIdSchedule = [
    {
        class_id: "5f8d5a6d1f9e3a2e7c8b4567",
        day_of_week: 1,
        week_number: 1,
        start_time: "08:00:00",
        end_time: "09:30:00",
    },
];

const result3 = enhancedHelper.emergencyRepairSchedule(missingCourseIdSchedule, sampleClasses, sampleCourses);
console.log(`Result 3: ${result3.length} repaired entries`);
console.log(`Repaired course_id: ${result3[0].course_id}`);

// Test case 4: Empty schedule details (critical case that caused the original bug)
console.log("\n=== Test Case 4: Empty schedule details ===");
const emptyScheduleDetails = [];
const result4 = enhancedHelper.emergencyRepairSchedule(emptyScheduleDetails, sampleClasses, sampleCourses);
console.log(`Result 4: ${result4.length} entries created`);

// Test case 5: Completely invalid IDs
console.log("\n=== Test Case 5: Invalid IDs ===");
const invalidIdSchedule = [
    {
        class_id: "invalid_id_1",
        course_id: "invalid_id_2",
        day_of_week: 1,
        week_number: 1,
        start_time: "08:00:00",
        end_time: "09:30:00",
    },
];

const result5 = enhancedHelper.emergencyRepairSchedule(invalidIdSchedule, sampleClasses, sampleCourses);
console.log(`Result 5: ${result5.length} repaired entries`);
console.log(`Original vs Repaired: ${invalidIdSchedule[0].class_id} -> ${result5[0].class_id}`);

// Test case 6: scheduleDetails is undefined (edge case)
console.log("\n=== Test Case 6: scheduleDetails is undefined ===");
try {
    const result6 = enhancedHelper.emergencyRepairSchedule(undefined, sampleClasses, sampleCourses);
    console.log(`Result 6: ${result6.length} entries created`);
} catch (error) {
    console.error(`Error: ${error.message}`);
}

// Output results summary
console.log("\n=== Test Summary ===");
console.log(`Test 1 (Normal): ${result1.length} entries`);
console.log(`Test 2 (Missing class_id): ${result2.length} entries`);
console.log(`Test 3 (Missing course_id): ${result3.length} entries`);
console.log(`Test 4 (Empty array): ${result4.length} entries`);
console.log(`Test 5 (Invalid IDs): ${result5.length} entries`);
