/**
 * Debug utility for the scheduler issue
 * Run this script to identify problems with ObjectIDs and classes/courses lookups
 */

// Mock data for testing
const classes = [
    { _id: "6802140acf7fab6f85e1d31c", id: 1, name: "BV25A", department_id: "6802140acf7fab6f85e1d31a" },
    { _id: "6802140acf7fab6f85e1d31d", id: 2, name: "BV25B", department_id: "6802140acf7fab6f85e1d31a" },
];

const courses = [
    { _id: "6802140acf7fab6f85e1d323", id: 101, code: "A10", name: "Chính trị 1" },
    { _id: "6802140acf7fab6f85e1d324", id: 102, code: "Q10", name: "Quân sự" },
];

// Test different types of IDs that might be encountered in the application
const testIds = [
    // String ObjectIDs
    "6802140acf7fab6f85e1d31c",
    "6802140acf7fab6f85e1d323",

    // Numeric IDs
    1,
    101,

    // Invalid IDs
    "invalid_id",
    undefined,
    null,

    // Objects with IDs
    { _id: "6802140acf7fab6f85e1d31c" },
    { id: 1 },
    { id: "1" },
];

// Logging utility
function log(message, obj = "") {
    if (obj) {
        console.log(`${message}:`, typeof obj === "object" ? JSON.stringify(obj, null, 2) : obj);
    } else {
        console.log(message);
    }
}

// Enhanced isObjectIdLike function
function isObjectIdLike(str) {
    if (!str) return false;

    // Convert to string if it's not already
    const idStr = typeof str === "string" ? str : String(str);

    // Check if it matches MongoDB ObjectID pattern (24 hex characters)
    return /^[0-9a-fA-F]{24}$/.test(idStr);
}

// Enhanced getObjectId function
function getObjectId(item) {
    // Handle null/undefined
    if (!item) return null;

    // Handle string IDs
    if (typeof item === "string") {
        return isObjectIdLike(item) ? item : null;
    }

    // Handle direct numeric IDs (not valid MongoDB IDs but used in the app)
    if (typeof item === "number") {
        return null; // Numeric IDs need to be looked up in collections
    }

    // Handle objects with ID fields
    if (typeof item === "object") {
        // Check common ID fields in order of likelihood
        const fields = ["_id", "id", "objectId"];

        for (const field of fields) {
            if (item[field] !== undefined) {
                // If it's already a string and valid ObjectID format, return it
                if (typeof item[field] === "string" && isObjectIdLike(item[field])) {
                    return item[field];
                }

                // Try to convert numbers to string and check
                if (typeof item[field] === "number" || typeof item[field] === "bigint") {
                    // Can't convert numeric ID directly to ObjectId
                    return null;
                }
            }
        }
    }

    return null;
}

// Enhanced lookup function for classes
function findClassId(classInput, classes) {
    // If input is already a valid ObjectID string, return it
    if (isObjectIdLike(classInput)) {
        return classInput;
    }

    // If we have a numeric ID or string that's not an ObjectID
    let matchingClass = null;

    // Case 1: Direct numeric ID matching
    if (typeof classInput === "number" || (typeof classInput === "string" && !isNaN(parseInt(classInput)))) {
        const numericId = parseInt(classInput);
        matchingClass = classes.find((c) => c.id === numericId);
    }

    // Case 2: If input is an object with an id property
    if (!matchingClass && typeof classInput === "object" && classInput) {
        if (classInput._id && isObjectIdLike(classInput._id)) {
            return classInput._id;
        }

        // Check if it has id field
        if (classInput.id) {
            matchingClass = classes.find((c) => c.id === classInput.id || c.id === parseInt(classInput.id));
        }

        // Check if it has name field
        if (!matchingClass && classInput.name) {
            matchingClass = classes.find((c) => c.name === classInput.name);
        }
    }

    // Case 3: String matching by name
    if (!matchingClass && typeof classInput === "string" && !isObjectIdLike(classInput)) {
        matchingClass = classes.find((c) => c.name === classInput);
    }

    return matchingClass ? matchingClass._id : null;
}

// Enhanced lookup function for courses
function findCourseId(courseInput, courses) {
    // If input is already a valid ObjectID string, return it
    if (isObjectIdLike(courseInput)) {
        return courseInput;
    }

    // If we have a numeric ID or string that's not an ObjectID
    let matchingCourse = null;

    // Case 1: Direct numeric ID matching
    if (typeof courseInput === "number" || (typeof courseInput === "string" && !isNaN(parseInt(courseInput)))) {
        const numericId = parseInt(courseInput);
        matchingCourse = courses.find((c) => c.id === numericId);
    }

    // Case 2: If input is an object with properties
    if (!matchingCourse && typeof courseInput === "object" && courseInput) {
        if (courseInput._id && isObjectIdLike(courseInput._id)) {
            return courseInput._id;
        }

        // Check if it has id field
        if (courseInput.id) {
            matchingCourse = courses.find((c) => c.id === courseInput.id || c.id === parseInt(courseInput.id));
        }

        // Check if it has code field
        if (!matchingCourse && courseInput.code) {
            matchingCourse = courses.find((c) => c.code === courseInput.code);
        }

        // Check if it has name field
        if (!matchingCourse && courseInput.name) {
            matchingCourse = courses.find((c) => c.name === courseInput.name);
        }
    }

    // Case 3: String matching by code or name
    if (!matchingCourse && typeof courseInput === "string" && !isObjectIdLike(courseInput)) {
        matchingCourse = courses.find((c) => c.code === courseInput || c.name === courseInput);
    }

    return matchingCourse ? matchingCourse._id : null;
}

// Validation function tests
function runTests() {
    log("----- ID FORMAT TESTS -----");
    testIds.forEach((id) => {
        log(`Input '${id}'`, {
            isObjectIdLike: isObjectIdLike(id),
            getObjectId: getObjectId(id),
        });
    });

    log("\n----- CLASS LOOKUP TESTS -----");
    testIds.forEach((id) => {
        log(`Class input '${id}'`, {
            found: findClassId(id, classes),
        });
    });

    log("\n----- COURSE LOOKUP TESTS -----");
    testIds.forEach((id) => {
        log(`Course input '${id}'`, {
            found: findCourseId(id, courses),
        });
    });

    log("\n----- MOCK SCHEDULE DETAIL VALIDATION -----");
    const mockDetails = [
        {
            class_id: "6802140acf7fab6f85e1d31c",
            course_id: "6802140acf7fab6f85e1d323",
            day_of_week: 1,
            week_number: 1,
            start_time: "07:30:00",
            end_time: "09:00:00",
        },
        {
            class_id: 1, // Numeric ID instead of ObjectId
            course_id: 101, // Numeric ID instead of ObjectId
            day_of_week: 2,
            week_number: 1,
            start_time: "09:10:00",
            end_time: "10:40:00",
        },
        {
            class_id: "BV25A", // Name instead of ID
            course_id: "A10", // Code instead of ID
            day_of_week: 3,
            week_number: 1,
            start_time: "10:50:00",
            end_time: "12:20:00",
        },
    ];

    mockDetails.forEach((detail, i) => {
        const validClassId = findClassId(detail.class_id, classes);
        const validCourseId = findCourseId(detail.course_id, courses);

        log(`Detail ${i + 1} validation:`, {
            original: {
                class_id: detail.class_id,
                course_id: detail.course_id,
            },
            resolved: {
                class_id: validClassId,
                course_id: validCourseId,
            },
            isValid: Boolean(validClassId && validCourseId),
        });
    });
}

runTests();
