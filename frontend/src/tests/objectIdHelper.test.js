import { validateScheduleDetails } from "../utils/objectIdHelper";

// Test data for validation
const testClasses = [
    { _id: "6802140acf7fab6f85e1d31c", name: "BV25A" },
    { _id: "6802140acf7fab6f85e1d31d", name: "BV25B" },
];

const testCourses = [
    { _id: "6802140acf7fab6f85e1d323", code: "A10", name: "Chính trị" },
    { _id: "6802140acf7fab6f85e1d324", code: "Q10", name: "Quân sự" },
];

const testScheduleDetails = [
    {
        // Valid IDs
        class_id: "6802140acf7fab6f85e1d31c",
        course_id: "6802140acf7fab6f85e1d323",
        day_of_week: 1,
        week_number: 1,
        start_time: "07:30:00",
        end_time: "09:00:00",
    },
    {
        // Invalid class_id
        class_id: "invalid_id",
        course_id: "6802140acf7fab6f85e1d324",
        day_of_week: 2,
        week_number: 1,
        start_time: "09:10:00",
        end_time: "10:40:00",
    },
    {
        // Invalid course_id
        class_id: "6802140acf7fab6f85e1d31d",
        course_id: "not_a_valid_id",
        day_of_week: 3,
        week_number: 1,
        start_time: "10:50:00",
        end_time: "12:20:00",
    },
    {
        // Both IDs invalid
        class_id: 1,
        course_id: 2,
        day_of_week: 4,
        week_number: 1,
        start_time: "13:30:00",
        end_time: "15:00:00",
    },
];

// Function to run the test
function runTest() {
    console.log("Running validation test...");
    console.log("Original schedule details:", testScheduleDetails);

    const validatedDetails = validateScheduleDetails(testScheduleDetails, testClasses, testCourses);

    console.log("Validated schedule details:", validatedDetails);
    console.log(`Validation reduced ${testScheduleDetails.length} items to ${validatedDetails.length} valid items`);

    return validatedDetails;
}

// Execute the test
runTest();

// Export for use in other tests
export { runTest };
