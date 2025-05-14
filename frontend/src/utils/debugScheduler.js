// filepath: d:\congviec\sang_kien\2025\scheduler\frontend\src\utils\debugScheduler.js
/**
 * Debug utility to analyze schedule generation
 * Run this script through browser console to diagnose issues with schedule generation
 */

/**
 * Analyze the schedule details and validation results
 * @param {Array} scheduleDetails - Original schedule details
 * @param {Array} validatedDetails - Validated schedule details
 * @param {Array} classes - Available classes
 * @param {Array} courses - Available courses
 */
export function analyzeScheduleValidation(scheduleDetails, validatedDetails, classes, courses) {
    console.group("🔍 Schedule Validation Analysis");

    console.log(`Total Schedule Entries: ${scheduleDetails.length}`);
    console.log(`Valid Entries: ${validatedDetails.length}`);
    console.log(`Invalid Entries: ${scheduleDetails.length - validatedDetails.length}`);

    if (scheduleDetails.length === 0) {
        console.error("❌ No schedule entries were created!");
        console.groupEnd();
        return;
    }

    if (validatedDetails.length === 0) {
        console.error("❌ All schedule entries were invalidated during validation!");

        // Analyze the first few entries to see why they failed
        const samplesToAnalyze = Math.min(5, scheduleDetails.length);
        console.group("📊 Sample Invalid Entries Analysis");

        for (let i = 0; i < samplesToAnalyze; i++) {
            const detail = scheduleDetails[i];
            console.group(`🔍 Entry ${i + 1}`);

            // Check class_id
            const classInput = detail.class_id;
            console.log("Class ID input:", classInput);

            // Check if class exists in classes array
            const matchingClasses = findMatchingEntities(classInput, classes);
            console.log("Matching classes:", matchingClasses);

            // Check course_id
            const courseInput = detail.course_id;
            console.log("Course ID input:", courseInput);

            // Check if course exists in courses array
            const matchingCourses = findMatchingEntities(courseInput, courses);
            console.log("Matching courses:", matchingCourses);

            // Check for other required fields
            checkRequiredField(detail, "day_of_week", "Day of week", (value) => value >= 1 && value <= 7);
            checkRequiredField(detail, "week_number", "Week number", (value) => value >= 1);
            checkRequiredField(detail, "start_time", "Start time");
            checkRequiredField(detail, "end_time", "End time");

            console.groupEnd();
        }

        console.groupEnd();
    }

    console.groupEnd();
}

/**
 * Find entities that match the given input using various matching strategies
 * @param {any} input - Input to match against
 * @param {Array} entities - Array of entities to search through
 * @returns {Array} - Matching entities
 */
function findMatchingEntities(input, entities) {
    if (!input || !entities || !Array.isArray(entities)) {
        return [];
    }

    const matches = [];

    if (typeof input === "string" || typeof input === "number") {
        // Direct ID match
        const directMatches = entities.filter(
            (e) =>
                e._id === input || e.id === input || String(e._id) === String(input) || String(e.id) === String(input)
        );

        if (directMatches.length > 0) {
            matches.push(
                ...directMatches.map((e) => ({
                    entity: e,
                    matchType: "direct-id",
                }))
            );
        }

        // Name or code match for string inputs
        if (typeof input === "string") {
            const nameMatches = entities.filter((e) => e.name === input);
            const codeMatches = entities.filter((e) => e.code === input);

            if (nameMatches.length > 0) {
                matches.push(
                    ...nameMatches.map((e) => ({
                        entity: e,
                        matchType: "name",
                    }))
                );
            }

            if (codeMatches.length > 0) {
                matches.push(
                    ...codeMatches.map((e) => ({
                        entity: e,
                        matchType: "code",
                    }))
                );
            }
        }
    } else if (typeof input === "object" && input !== null) {
        // Match by ID in object
        if (input._id) {
            const idMatches = entities.filter((e) => e._id === input._id);
            if (idMatches.length > 0) {
                matches.push(
                    ...idMatches.map((e) => ({
                        entity: e,
                        matchType: "object-_id",
                    }))
                );
            }
        }

        if (input.id) {
            const idMatches = entities.filter((e) => e.id === input.id);
            if (idMatches.length > 0) {
                matches.push(
                    ...idMatches.map((e) => ({
                        entity: e,
                        matchType: "object-id",
                    }))
                );
            }
        }

        // Match by name
        if (input.name) {
            const nameMatches = entities.filter((e) => e.name === input.name);
            if (nameMatches.length > 0) {
                matches.push(
                    ...nameMatches.map((e) => ({
                        entity: e,
                        matchType: "object-name",
                    }))
                );
            }
        }

        // Match by code (for courses)
        if (input.code) {
            const codeMatches = entities.filter((e) => e.code === input.code);
            if (codeMatches.length > 0) {
                matches.push(
                    ...codeMatches.map((e) => ({
                        entity: e,
                        matchType: "object-code",
                    }))
                );
            }
        }
    }

    return matches;
}

/**
 * Check if a required field exists and is valid
 * @param {Object} detail - Schedule detail object
 * @param {string} field - Field name to check
 * @param {string} label - Human-readable label for the field
 * @param {Function} validator - Optional validation function
 */
function checkRequiredField(detail, field, label, validator = null) {
    if (detail[field] === undefined || detail[field] === null) {
        console.error(`❌ Missing required field: ${label} (${field})`);
        return false;
    }

    if (validator && !validator(detail[field])) {
        console.error(`❌ Invalid value for ${label} (${field}): ${detail[field]}`);
        return false;
    }

    return true;
}

/**
 * Wrapper for findClassId and findCourseId to debug why IDs aren't being found
 * @param {any} classInput - Class input to find
 * @param {Array} classes - Available classes
 * @param {any} courseInput - Course input to find
 * @param {Array} courses - Available courses
 */
export function debugIdLookup(classInput, classes, courseInput, courses) {
    console.group("🔍 Debug ID Lookup");

    // Debug class lookup
    console.group("🏫 Class Lookup");
    console.log("Input:", classInput);
    console.log("Available classes:", classes);
    console.log(
        "Class types:",
        classes.map((c) => ({ id: c.id, type: typeof c.id }))
    );
    console.log(
        "First few class IDs:",
        classes.slice(0, 3).map((c) => ({ _id: c._id, id: c.id, name: c.name }))
    );
    console.groupEnd();

    // Debug course lookup
    console.group("📚 Course Lookup");
    console.log("Input:", courseInput);
    console.log("Available courses:", courses);
    console.log(
        "Course types:",
        courses.map((c) => ({ id: c.id, type: typeof c.id }))
    );
    console.log(
        "First few course IDs:",
        courses.slice(0, 3).map((c) => ({ _id: c._id, id: c.id, code: c.code, name: c.name }))
    );
    console.groupEnd();

    console.groupEnd();
}

// Export utility for debugging schedule validation issues
export default {
    analyzeScheduleValidation,
    debugIdLookup,
};
