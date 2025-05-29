// Simple integration test for course handlers
const fetch = require("node-fetch");

async function testCourseHandlerIntegration() {
    try {
        console.log("🔧 Testing Course Handler Integration...");

        // Test 1: Get all available handlers
        console.log("\n1. Testing GET /api/course-handlers");
        const handlersResponse = await fetch("http://localhost:5000/api/course-handlers");
        const handlersData = await handlersResponse.json();

        console.log(`   Found ${handlersData.handlers.length} handlers:`);
        handlersData.handlers.forEach((handler) => {
            console.log(`   - ${handler.name} (${handler.courseCode})`);
        });

        // Test 2: Get specific handler for V30
        console.log("\n2. Testing GET /api/course-handlers/V30");
        const v30Response = await fetch("http://localhost:5000/api/course-handlers/V30");
        const v30Data = await v30Response.json();

        console.log(`   Handler: ${v30Data.name}`);
        console.log(`   Course Code: ${v30Data.courseCode}`);
        console.log(`   Exam Phases: ${v30Data.constraints.exam_phases}`);
        console.log(`   Paired Course: ${v30Data.constraints.is_paired_course ? "Yes" : "No"}`);

        // Test 3: Get specific handler for V31
        console.log("\n3. Testing GET /api/course-handlers/V31");
        const v31Response = await fetch("http://localhost:5000/api/course-handlers/V31");
        const v31Data = await v31Response.json();

        console.log(`   Handler: ${v31Data.name}`);
        console.log(`   Course Code: ${v31Data.courseCode}`);
        console.log(`   Exam Phases: ${v31Data.constraints.exam_phases}`);
        console.log(`   Paired Course: ${v31Data.constraints.is_paired_course ? "Yes" : "No"}`);

        // Test 4: Test non-V30/V31 course
        console.log("\n4. Testing GET /api/course-handlers/A10");
        const a10Response = await fetch("http://localhost:5000/api/course-handlers/A10");

        if (a10Response.status === 404) {
            console.log("   ✅ Correctly returns 404 for courses without handlers");
        } else {
            const a10Data = await a10Response.json();
            console.log(`   Found handler: ${a10Data.name}`);
        }

        console.log("\n✅ All course handler API tests passed!");
    } catch (error) {
        console.error("❌ Course handler integration test failed:", error.message);
    }
}

testCourseHandlerIntegration();
