/**
 * Comprehensive test script for ObjectID handling
 * Run with Node.js to test the helpers without the frontend
 */

// Since we're using ES modules in the original file but running this with Node.js,
// we need to recreate the functions here for testing purposes

// Helper function to check if string looks like MongoDB ObjectID
const isObjectIdLike = (str) => {
    if (!str || typeof str !== "string") return false;
    return /^[0-9a-fA-F]{24}$/.test(str);
};

// Helper function to extract ObjectID from different formats
const getObjectId = (item) => {
    if (!item) return null;

    // If item is a string that looks like an ObjectID
    if (typeof item === "string") {
        return isObjectIdLike(item) ? item : null;
    }

    // If item is not an object, we can't extract an ID
    if (typeof item !== "object" || item === null) {
        return null;
    }

    // Check common ID properties in order of priority
    const idFields = ["_id", "id", "objectId", "mongoid"];

    for (const field of idFields) {
        if (item[field]) {
            const idValue = typeof item[field] === "string" ? item[field] : String(item[field]);
            if (isObjectIdLike(idValue)) {
                return idValue;
            }
        }
    }

    // If we still don't have an ID, log and return null
    console.warn("Could not extract ObjectId from", item);
    return null;
};

// Helper function to map classes by different ID types
const mapClassesById = (classes) => {
    const mapping = {};

    if (!classes || !Array.isArray(classes)) return mapping;

    classes.forEach((cls) => {
        // Handle numeric IDs
        if (cls.id) {
            mapping[cls.id] = cls;
        }

        // Store by _id as well
        if (cls._id) {
            mapping[cls._id] = cls;
        }

        // Store by name for fallback lookup
        if (cls.name) {
            mapping[cls.name] = cls;
        }

        // For legacy code that might use departmentId instead of department_id
        if (cls.departmentId) {
            cls.department_id = cls.departmentId;
        } else if (cls.department_id) {
            cls.departmentId = cls.department_id;
        }
    });

    console.log("Class mapping created with keys:", Object.keys(mapping));
    return mapping;
};

// Set up test data
const testData = {
    // Valid ObjectID strings
    validIds: [
        "6802140acf7fab6f85e1d31c",
        "6802140acf7fab6f85e1d31d",
        "6802140acf7fab6f85e1d323",
        "6802140acf7fab6f85e1d324",
    ],

    // Invalid ObjectID formats
    invalidIds: [
        "123",
        "not-an-object-id",
        "gggggggggggggggggggggggg", // Invalid hex characters
        "6802140acf7fab6f85e1d31", // Too short
        "6802140acf7fab6f85e1d31cc", // Too long
    ],

    // Test objects with ID fields
    objectsWithIds: [
        { _id: "6802140acf7fab6f85e1d31c", name: "Test Class A" },
        { id: "6802140acf7fab6f85e1d31d", name: "Test Class B" },
        { objectId: "6802140acf7fab6f85e1d323", name: "Test Course A" },
        { mongoid: "6802140acf7fab6f85e1d324", name: "Test Course B" },
    ],

    // Test class objects
    classes: [
        { _id: "6802140acf7fab6f85e1d31c", id: 1, name: "BV25A", department_id: "6802140acf7fab6f85e1d31a" },
        { _id: "6802140acf7fab6f85e1d31d", id: 2, name: "BV25B", departmentId: "6802140acf7fab6f85e1d31a" },
    ],

    // Test course objects
    courses: [
        { _id: "6802140acf7fab6f85e1d323", id: 101, code: "CT101", name: "Chính trị 1" },
        { _id: "6802140acf7fab6f85e1d324", id: 102, code: "QS102", name: "Quân sự cơ bản" },
    ],

    // Test schedule details
    scheduleDetails: [
        {
            // All valid
            class_id: "6802140acf7fab6f85e1d31c",
            course_id: "6802140acf7fab6f85e1d323",
            day_of_week: 1,
            week_number: 1,
            start_time: "07:30:00",
            end_time: "09:00:00",
        },
        {
            // Valid numeric IDs that should be converted
            class_id: 1,
            course_id: 101,
            day_of_week: 2,
            week_number: 1,
            start_time: "09:10:00",
            end_time: "10:40:00",
        },
        {
            // Invalid class_id
            class_id: "invalid-id",
            course_id: "6802140acf7fab6f85e1d324",
            day_of_week: 3,
            week_number: 1,
            start_time: "10:50:00",
            end_time: "12:20:00",
        },
        {
            // Invalid course_id
            class_id: "6802140acf7fab6f85e1d31d",
            course_id: "not-a-valid-id",
            day_of_week: 4,
            week_number: 1,
            start_time: "13:30:00",
            end_time: "15:00:00",
        },
        {
            // Missing required fields
            class_id: "6802140acf7fab6f85e1d31c",
            course_id: "6802140acf7fab6f85e1d323",
            day_of_week: 5,
            // Missing week_number
            start_time: "15:10:00",
            end_time: "16:40:00",
        },
        {
            // Names instead of IDs
            class_name: "BV25A",
            course_name: "Chính trị 1",
            day_of_week: 1,
            week_number: 2,
            start_time: "07:30:00",
            end_time: "09:00:00",
        },
    ],
};

// Test functions
function testIsObjectIdLike() {
    console.log("\n=== Testing isObjectIdLike ===");

    testData.validIds.forEach((id) => {
        const result = isObjectIdLike(id);
        console.log(`${id}: ${result ? "✅ Valid" : "❌ Invalid"}`);
    });

    testData.invalidIds.forEach((id) => {
        const result = isObjectIdLike(id);
        console.log(`${id}: ${result ? "❌ Should be invalid" : "✅ Correctly rejected"}`);
    });
}

function testGetObjectId() {
    console.log("\n=== Testing getObjectId ===");

    console.log("\nTesting with string IDs:");
    testData.validIds.forEach((id) => {
        const result = getObjectId(id);
        console.log(`${id} => ${result ? "✅ " + result : "❌ Failed"}`);
    });

    console.log("\nTesting with invalid string IDs:");
    testData.invalidIds.forEach((id) => {
        const result = getObjectId(id);
        console.log(`${id} => ${result ? "❌ Should fail" : "✅ Correctly returned null"}`);
    });

    console.log("\nTesting with objects containing IDs:");
    testData.objectsWithIds.forEach((obj) => {
        const result = getObjectId(obj);
        console.log(`${JSON.stringify(obj)} => ${result ? "✅ " + result : "❌ Failed"}`);
    });
}

function testMapClassesById() {
    console.log("\n=== Testing mapClassesById ===");

    const mapping = mapClassesById(testData.classes);
    console.log("Created mapping:", Object.keys(mapping));

    // Test lookups
    console.log("\nTesting lookups by different IDs:");
    console.log("Lookup by MongoDB ID:", mapping["6802140acf7fab6f85e1d31c"] ? "✅ Found" : "❌ Not found");
    console.log("Lookup by numeric ID:", mapping["1"] ? "✅ Found" : "❌ Not found");
    console.log("Lookup by name:", mapping["BV25A"] ? "✅ Found" : "❌ Not found");
}

// Validate schedule details function
const validateScheduleDetails = (scheduleDetails, classes, courses) => {
    if (!scheduleDetails || !Array.isArray(scheduleDetails)) return [];
    if (!classes || !Array.isArray(classes)) classes = [];
    if (!courses || !Array.isArray(courses)) courses = [];

    // Create lookup maps for classes and courses
    const classesMap = mapClassesById(classes);
    const coursesMap = {};

    // Map courses by ID and name
    courses.forEach((course) => {
        if (course._id) coursesMap[course._id] = course;
        if (course.id) coursesMap[course.id] = course;
        if (course.code) coursesMap[course.code] = course;
        if (course.name) coursesMap[`name:${course.name}`] = course;
    });

    console.log("Validating schedule details:", scheduleDetails.length);
    console.log("Available classes:", Object.keys(classesMap).length);
    console.log("Available courses:", Object.keys(coursesMap).length);

    return scheduleDetails.filter((detail) => {
        // Try to ensure we have valid IDs
        let classId = getObjectId(detail.class_id);
        let courseId = getObjectId(detail.course_id);

        // If we couldn't get IDs directly, try looking them up by name/other identifiers
        if (!classId && detail.class_name) {
            // Try to find class by name
            const foundClass = Object.values(classesMap).find(
                (c) => c.name === detail.class_name || c.name === detail.className
            );
            if (foundClass) {
                classId = getObjectId(foundClass);
                console.log(`Found class by name: ${detail.class_name} -> ${classId}`);
            }
        }

        if (!courseId && detail.course_name) {
            // Try to find course by name or code
            const foundCourse = Object.values(coursesMap).find(
                (c) => c.name === detail.course_name || c.code === detail.course_code
            );
            if (foundCourse) {
                courseId = getObjectId(foundCourse);
                console.log(`Found course by name: ${detail.course_name} -> ${courseId}`);
            }
        }

        // Skip entries without valid IDs
        if (!classId || !courseId) {
            console.warn("Skipping invalid schedule detail:", {
                original: detail,
                parsedClassId: classId,
                parsedCourseId: courseId,
            });
            return false;
        }

        // Update the IDs in the detail object to ensure they're valid ObjectIDs
        detail.class_id = classId;
        detail.course_id = courseId;

        // Additional validation for other fields
        if (!detail.day_of_week || detail.day_of_week < 1 || detail.day_of_week > 7) {
            console.warn("Skipping detail with invalid day_of_week:", detail);
            return false;
        }

        if (!detail.week_number || detail.week_number < 1) {
            console.warn("Skipping detail with invalid week_number:", detail);
            return false;
        }

        if (!detail.start_time || !detail.end_time) {
            console.warn("Skipping detail with missing time values:", detail);
            return false;
        }

        return true;
    });
};

function testValidateScheduleDetails() {
    console.log("\n=== Testing validateScheduleDetails ===");

    console.log("\nInput schedule details:", testData.scheduleDetails.length);
    const validated = validateScheduleDetails(testData.scheduleDetails, testData.classes, testData.courses);
    console.log("Valid schedule details:", validated.length);

    console.log("\nValidated schedule details:");
    validated.forEach((detail, i) => {
        console.log(`\nDetail ${i + 1}:`);
        console.log(`Class ID: ${detail.class_id}`);
        console.log(`Course ID: ${detail.course_id}`);
        console.log(`Day/Week: ${detail.day_of_week}/${detail.week_number}`);
        console.log(`Time: ${detail.start_time} - ${detail.end_time}`);
    });
}

// Run all tests
function runAllTests() {
    console.log("STARTING OBJECTID HELPER TESTS\n");

    testIsObjectIdLike();
    testGetObjectId();
    testMapClassesById();
    testValidateScheduleDetails();

    console.log("\nALL TESTS COMPLETE");
}

// Execute tests
runAllTests();
