/**
 * Test script to simulate and verify large payload handling
 * This can be run in Node.js to test the payload size handling
 */

// Import the payload helper to test optimization functions
const payloadHelper = require("../utils/payloadHelper").default;

// Create a large test dataset
function generateTestSchedule(size = 5000) {
    const scheduleDetails = [];

    for (let i = 0; i < size; i++) {
        scheduleDetails.push({
            class_id: "5f8d5a6d1f9e3a2e7c8b4567",
            course_id: "5f8d5a6d1f9e3a2e7c8b4568",
            day_of_week: (i % 5) + 1,
            week_number: Math.floor(i / 25) + 1,
            start_time: "08:00:00",
            end_time: "09:30:00",
            is_practical: false,
            is_exam: false,
            is_self_study: false,
            special_event_id: null,
            notes: `Test schedule item ${i} with some extra text to make it larger`,
        });
    }

    return {
        department_id: "5f8d5a6d1f9e3a2e7c8b4569",
        start_date: "2025-06-01",
        end_date: "2025-12-31",
        total_weeks: 22,
        events: [],
        courses: [],
        constraints: {},
        schedule_details: scheduleDetails,
    };
}

// Test different payload sizes
async function testPayloadSizes() {
    console.log("==== Testing Payload Size Handling ====");

    for (const size of [100, 1000, 5000, 10000]) {
        const testPayload = generateTestSchedule(size);
        const sizeInfo = payloadHelper.checkPayloadSize(testPayload);

        console.log(`\nTest with ${size} schedule details:`);
        console.log(`- Payload size: ${sizeInfo.formattedSize}`);
        console.log(`- Is considered large: ${sizeInfo.isLarge}`);
        console.log(`- Is dangerous: ${sizeInfo.isDangerous}`);

        if (sizeInfo.isLarge) {
            console.log("\nOptimizing payload...");
            const optimizedPayload = payloadHelper.optimizeSchedulePayload(testPayload);
            const optimizedSizeInfo = payloadHelper.checkPayloadSize(optimizedPayload);

            console.log(`- Original details count: ${testPayload.schedule_details.length}`);
            console.log(`- Optimized details count: ${optimizedPayload.schedule_details.length}`);
            console.log(`- Size reduction: ${sizeInfo.formattedSize} -> ${optimizedSizeInfo.formattedSize}`);
            console.log(
                `- Percentage saved: ${Math.round((1 - optimizedSizeInfo.sizeInBytes / sizeInfo.sizeInBytes) * 100)}%`
            );
        }
    }

    console.log("\n==== Test Complete ====");
}

// Run the tests
testPayloadSizes().catch(console.error);

module.exports = {
    generateTestSchedule,
    testPayloadSizes,
};
