// filepath: d:\congviec\sang_kien\2025\scheduler\frontend\src\utils\enhancedObjectIdHelper.js
/**
 * Enhanced helper functions for ObjectID handling with improved validation and lookup
 */

/**
 * Checks if a string looks like a MongoDB ObjectID
 * @param {string} str - The string to check
 * @returns {boolean} True if the string looks like a valid MongoDB ObjectID
 */
export const isObjectIdLike = (str) => {
    if (!str || typeof str !== "string") return false;
    return /^[0-9a-fA-F]{24}$/.test(str);
};

/**
 * Safely extracts a MongoDB ObjectID from an object or string
 * @param {Object|string} item - The object containing an _id field or a string _id
 * @returns {string|null} The ObjectID as a string or null if not found
 */
export const getObjectId = (item) => {
    if (!item) return null;

    // If item is a string that looks like an ObjectID
    if (typeof item === "string") {
        return isObjectIdLike(item) ? item : null;
    }

    // If item is a number, we can't directly extract an ObjectID
    if (typeof item === "number") {
        return null; // Numeric IDs need special handling with lookups
    }

    // If item is not an object, we can't extract an ID
    if (typeof item !== "object" || item === null) {
        return null;
    }

    // Check common ID properties in order of priority
    const idFields = ["_id", "id", "objectId", "mongoid"];

    for (const field of idFields) {
        if (item[field]) {
            // If the field value is already an ObjectID string
            if (typeof item[field] === "string" && isObjectIdLike(item[field])) {
                return item[field];
            }

            // Try to convert numbers to string and check
            if (typeof item[field] !== "undefined") {
                const idValue = String(item[field]);
                if (isObjectIdLike(idValue)) {
                    return idValue;
                }
            }
        }
    }

    // If we still don't have an ID, log and return null
    console.warn("Could not extract ObjectId from", item);
    return null;
};

/**
 * Maps classes from API to a lookup table with numeric IDs as keys
 * @param {Array} classes - List of class objects
 * @returns {Object} Lookup table mapping numeric IDs to class objects with MongoDB ObjectIDs
 */
export const mapClassesById = (classes) => {
    const mapping = {};

    if (!classes || !Array.isArray(classes)) return mapping;

    classes.forEach((cls) => {
        // Handle numeric IDs
        if (cls.id !== undefined) {
            mapping[cls.id] = cls;
            mapping[String(cls.id)] = cls;
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

    console.log("Class mapping created with keys:", Object.keys(mapping).length);
    return mapping;
};

/**
 * Maps courses from API to comprehensive lookup tables
 * @param {Array} courses - List of course objects
 * @returns {Object} Advanced lookup tables for courses
 */
export const mapCoursesById = (courses) => {
    const mapping = {
        byId: {},
        byNumericId: {},
        byMongoId: {},
        byCode: {},
        byName: {},
    };

    if (!courses || !Array.isArray(courses)) return mapping;

    courses.forEach((course) => {
        // Handle all IDs
        if (course._id) {
            mapping.byMongoId[course._id] = course;
            mapping.byId[course._id] = course;
        }

        if (course.id !== undefined) {
            mapping.byNumericId[course.id] = course;
            mapping.byNumericId[String(course.id)] = course;
            mapping.byId[course.id] = course;
            mapping.byId[String(course.id)] = course;
        }

        // Handle code and name
        if (course.code) {
            mapping.byCode[course.code] = course;
        }

        if (course.name) {
            mapping.byName[course.name] = course;
        }
    });

    console.log("Course mapping created", {
        totalCourses: courses.length,
        byId: Object.keys(mapping.byId).length,
        byCode: Object.keys(mapping.byCode).length,
        byName: Object.keys(mapping.byName).length,
    });

    return mapping;
};

/**
 * Enhanced function to find a valid class ID
 * @param {any} classInput - Input that could identify a class
 * @param {Array} classes - Available classes
 * @param {Object} options - Additional options
 * @returns {string|null} Valid MongoDB ObjectID if found
 */
export const findClassId = (classInput, classes, options = {}) => {
    if (!classInput || !classes || !Array.isArray(classes)) return null;
    const { lenientMode = false } = options;

    // Already a valid ObjectID
    if (isObjectIdLike(classInput)) {
        return classInput;
    }

    // Create comprehensive lookup maps
    const classMap = {
        byId: {},
        byNumericId: {},
        byName: {},
    };

    classes.forEach((cls) => {
        if (cls._id) classMap.byId[cls._id] = cls;

        if (cls.id !== undefined) {
            classMap.byNumericId[cls.id] = cls;
            classMap.byNumericId[String(cls.id)] = cls;
            classMap.byId[cls.id] = cls;
        }

        if (cls.name) {
            classMap.byName[cls.name] = cls;
        }
    });

    let match = null;

    // Check string inputs (ObjectID was already checked)
    if (typeof classInput === "string") {
        // Try as numeric ID
        if (classMap.byNumericId[classInput]) {
            match = classMap.byNumericId[classInput];
        }
        // Try as name
        else if (classMap.byName[classInput]) {
            match = classMap.byName[classInput];
        }
        // Direct lookup
        else if (classMap.byId[classInput]) {
            match = classMap.byId[classInput];
        }
    }
    // Check numeric IDs
    else if (typeof classInput === "number") {
        if (classMap.byNumericId[classInput]) {
            match = classMap.byNumericId[classInput];
        }
    }
    // Check object with various ID fields
    else if (typeof classInput === "object" && classInput !== null) {
        if (classInput._id && isObjectIdLike(classInput._id)) {
            return classInput._id;
        }

        if (classInput._id && classMap.byId[classInput._id]) {
            match = classMap.byId[classInput._id];
        }

        if (!match && classInput.id !== undefined) {
            if (classMap.byNumericId[classInput.id] || classMap.byNumericId[String(classInput.id)]) {
                match = classMap.byNumericId[classInput.id] || classMap.byNumericId[String(classInput.id)];
            }
        }

        if (!match && classInput.name) {
            if (classMap.byName[classInput.name]) {
                match = classMap.byName[classInput.name];
            }
        }

        if (!match && classInput.class_name) {
            if (classMap.byName[classInput.class_name]) {
                match = classMap.byName[classInput.class_name];
            }
        }

        if (!match && classInput.className) {
            if (classMap.byName[classInput.className]) {
                match = classMap.byName[classInput.className];
            }
        }
    }

    // If we found a match, try to extract the MongoDB ObjectID
    if (match) {
        if (match._id && isObjectIdLike(match._id)) {
            return match._id;
        }

        // In lenient mode, accept numeric IDs
        if (lenientMode && match.id !== undefined) {
            return match.id;
        }
    }

    // Fallback: manual scan through classes
    for (const cls of classes) {
        // Try exact match by id
        if (cls.id !== undefined && (cls.id === classInput || String(cls.id) === String(classInput))) {
            return cls._id || (lenientMode ? cls.id : null);
        }

        // Try name match
        if (
            cls.name &&
            ((typeof classInput === "string" && cls.name === classInput) ||
                (typeof classInput === "object" &&
                    classInput &&
                    (cls.name === classInput.name ||
                        cls.name === classInput.class_name ||
                        cls.name === classInput.className)))
        ) {
            return cls._id || (lenientMode ? cls.id : null);
        }
    }

    return null;
};

/**
 * Enhanced function to find a valid course ID
 * @param {any} courseInput - Input that could identify a course
 * @param {Array} courses - Available courses
 * @param {Object} options - Additional options
 * @returns {string|null} Valid MongoDB ObjectID if found
 */
export const findCourseId = (courseInput, courses, options = {}) => {
    if (!courseInput || !courses || !Array.isArray(courses)) return null;
    const { lenientMode = false } = options;

    // Already a valid ObjectID
    if (isObjectIdLike(courseInput)) {
        return courseInput;
    }

    // Create comprehensive lookup maps
    const courseMap = {
        byId: {},
        byNumericId: {},
        byCode: {},
        byName: {},
    };

    courses.forEach((course) => {
        if (course._id) {
            courseMap.byId[course._id] = course;
        }

        if (course.id !== undefined) {
            courseMap.byNumericId[course.id] = course;
            courseMap.byNumericId[String(course.id)] = course;
            courseMap.byId[course.id] = course;
        }

        if (course.code) {
            courseMap.byCode[course.code] = course;
        }

        if (course.name) {
            courseMap.byName[course.name] = course;
        }
    });

    let match = null;

    // Check string inputs (ObjectID was already checked)
    if (typeof courseInput === "string") {
        // Try as numeric ID
        if (courseMap.byNumericId[courseInput]) {
            match = courseMap.byNumericId[courseInput];
        }
        // Try as code
        else if (courseMap.byCode[courseInput]) {
            match = courseMap.byCode[courseInput];
        }
        // Try as name
        else if (courseMap.byName[courseInput]) {
            match = courseMap.byName[courseInput];
        }
        // Direct lookup
        else if (courseMap.byId[courseInput]) {
            match = courseMap.byId[courseInput];
        }
    }
    // Check numeric IDs
    else if (typeof courseInput === "number") {
        if (courseMap.byNumericId[courseInput]) {
            match = courseMap.byNumericId[courseInput];
        }
    }
    // Check object with various ID fields
    else if (typeof courseInput === "object" && courseInput !== null) {
        if (courseInput._id && isObjectIdLike(courseInput._id)) {
            return courseInput._id;
        }

        if (courseInput._id && courseMap.byId[courseInput._id]) {
            match = courseMap.byId[courseInput._id];
        }

        if (!match && courseInput.id !== undefined) {
            if (courseMap.byNumericId[courseInput.id] || courseMap.byNumericId[String(courseInput.id)]) {
                match = courseMap.byNumericId[courseInput.id] || courseMap.byNumericId[String(courseInput.id)];
            }
        }

        if (!match && courseInput.code) {
            if (courseMap.byCode[courseInput.code]) {
                match = courseMap.byCode[courseInput.code];
            }
        }

        if (!match && courseInput.name) {
            if (courseMap.byName[courseInput.name]) {
                match = courseMap.byName[courseInput.name];
            }
        }

        if (!match && courseInput.course_code) {
            if (courseMap.byCode[courseInput.course_code]) {
                match = courseMap.byCode[courseInput.course_code];
            }
        }

        if (!match && courseInput.course_name) {
            if (courseMap.byName[courseInput.course_name]) {
                match = courseMap.byName[courseInput.course_name];
            }
        }
    }

    // If we found a match, try to extract the MongoDB ObjectID
    if (match) {
        if (match._id && isObjectIdLike(match._id)) {
            return match._id;
        }

        // In lenient mode, accept numeric IDs
        if (lenientMode && match.id !== undefined) {
            return match.id;
        }
    }

    // Fallback: manual scan through courses
    for (const course of courses) {
        // Try exact match by id
        if (course.id !== undefined && (course.id === courseInput || String(course.id) === String(courseInput))) {
            return course._id || (lenientMode ? course.id : null);
        }

        // Try name match
        if (
            course.name &&
            ((typeof courseInput === "string" && course.name === courseInput) ||
                (typeof courseInput === "object" &&
                    courseInput &&
                    (course.name === courseInput.name || course.name === courseInput.course_name)))
        ) {
            return course._id || (lenientMode ? course.id : null);
        }

        // Try code match
        if (
            course.code &&
            ((typeof courseInput === "string" && course.code === courseInput) ||
                (typeof courseInput === "object" &&
                    courseInput &&
                    (course.code === courseInput.code || course.code === courseInput.course_code)))
        ) {
            return course._id || (lenientMode ? course.id : null);
        }
    }

    return null;
};

/**
 * Enhanced schedule validation with comprehensive ID lookup and lenient mode
 * @param {Array} scheduleDetails - Schedule details to validate
 * @param {Array} classes - Available classes
 * @param {Array} courses - Available courses
 * @param {Object} options - Additional options
 * @returns {Array} Valid schedule details
 */
export const validateScheduleDetails = (scheduleDetails, classes, courses, options = {}) => {
    if (!scheduleDetails || !Array.isArray(scheduleDetails)) return [];
    if (!classes || !Array.isArray(classes)) classes = [];
    if (!courses || !Array.isArray(courses)) courses = [];

    const { lenientMode = false, debug = false } = options;

    // Debug info
    if (debug) {
        console.log("DEBUG: First class entry:", classes.length > 0 ? classes[0] : "No classes");
        console.log("DEBUG: First course entry:", courses.length > 0 ? courses[0] : "No courses");
        console.log(
            "DEBUG: First schedule detail:",
            scheduleDetails.length > 0 ? scheduleDetails[0] : "No schedule details"
        );
        console.log("DEBUG: Classes count:", classes.length);
        console.log("DEBUG: Courses count:", courses.length);
    }

    // Enhanced class and course maps
    const classesMap = mapClassesById(classes);
    const coursesMap = mapCoursesById(courses);

    const validationResults = [];
    let forcedLenientMode = lenientMode;

    // Check if we need to force lenient mode because all details would fail
    if (!forcedLenientMode && scheduleDetails.length > 0) {
        let allWouldFail = true;

        // Check a sample of entries
        const sampleSize = Math.min(5, scheduleDetails.length);
        for (let i = 0; i < sampleSize; i++) {
            const detail = scheduleDetails[i];
            const classId = findClassId(detail.class_id, classes);
            const courseId = findCourseId(detail.course_id, courses);

            if (classId && courseId) {
                allWouldFail = false;
                break;
            }
        }

        if (allWouldFail) {
            console.warn("⚠️ All schedule entries would fail validation - enabling lenient mode");
            forcedLenientMode = true;
        }
    }

    // Validate schedule details
    const validScheduleDetails = scheduleDetails.filter((detail, index) => {
        try {
            // Format entry ID for clearer logs
            const entryId = `#${index + 1}/${scheduleDetails.length}`;

            // Try to resolve class and course IDs with the current mode (strict or lenient)
            const options = { lenientMode: forcedLenientMode };
            let classId = findClassId(detail.class_id, classes, options);
            let courseId = findCourseId(detail.course_id, courses, options); // If using lenient mode and still couldn't find IDs, try direct ID passing
            if (forcedLenientMode) {
                if (!classId && detail.class_id !== undefined) {
                    classId = detail.class_id;
                    console.log(`[${entryId}] LENIENT MODE: Using direct class_id: ${classId}`);
                }

                if (!courseId && detail.course_id !== undefined) {
                    courseId = detail.course_id;
                    console.log(`[${entryId}] LENIENT MODE: Using direct course_id: ${courseId}`);
                }

                // Last resort - if we still don't have IDs but classes and courses exist, try to use the first available ones
                // THIS IS EXTREME FALLBACK MODE - only used when everything else fails
                if (!classId && classes.length > 0 && detail.day_of_week && detail.week_number) {
                    classId = classes[0]._id || classes[0].id;
                    console.warn(`[${entryId}] EXTREME FALLBACK: Using first available class: ${classId}`);
                }

                if (!courseId && courses.length > 0 && detail.day_of_week && detail.week_number) {
                    courseId = courses[0]._id || courses[0].id;
                    console.warn(`[${entryId}] EXTREME FALLBACK: Using first available course: ${courseId}`);
                }
            }

            // Log validation result
            validationResults.push({
                index,
                entryId,
                input: {
                    class_id: detail.class_id,
                    course_id: detail.course_id,
                    class_name: detail.class_name || detail.className,
                    course_name: detail.course_name || detail.courseName,
                    course_code: detail.course_code,
                },
                resolved: {
                    class_id: classId,
                    course_id: courseId,
                    lenientMode: forcedLenientMode,
                },
                fields: {
                    day_of_week: Boolean(detail.day_of_week && detail.day_of_week >= 1 && detail.day_of_week <= 7),
                    week_number: Boolean(detail.week_number && detail.week_number >= 1),
                    start_time: Boolean(detail.start_time),
                    end_time: Boolean(detail.end_time),
                },
            });

            // Skip entries without valid IDs
            if (!classId || !courseId) {
                if (debug) {
                    console.warn(`[${entryId}] Invalid schedule detail:`, {
                        classId: classId,
                        courseId: courseId,
                        original: { class_id: detail.class_id, course_id: detail.course_id },
                    });
                }
                return false;
            }

            // Update the IDs in the detail object
            detail.class_id = classId;
            detail.course_id = courseId;

            // Additional validation for other fields
            if (!detail.day_of_week || detail.day_of_week < 1 || detail.day_of_week > 7) {
                if (debug) {
                    console.warn(`[${entryId}] Invalid day_of_week:`, detail.day_of_week);
                }
                return false;
            }

            if (!detail.week_number || detail.week_number < 1) {
                if (debug) {
                    console.warn(`[${entryId}] Invalid week_number:`, detail.week_number);
                }
                return false;
            }

            if (!detail.start_time || !detail.end_time) {
                if (debug) {
                    console.warn(`[${entryId}] Missing time values`);
                }
                return false;
            }

            return true;
        } catch (error) {
            console.error(`Error validating entry ${index}:`, error);
            return false;
        }
    });

    // Log validation summary
    console.log("Validation summary:", {
        total: scheduleDetails.length,
        valid: validScheduleDetails.length,
        invalid: scheduleDetails.length - validScheduleDetails.length,
        lenientMode: forcedLenientMode,
    });

    if (validScheduleDetails.length === 0) {
        console.error("‼️ All schedule details were invalid!");
        console.error("Sample validation results:", validationResults.slice(0, 3));

        if (debug) {
            // Log sample data for debugging
            console.log("Sample classes:", classes.slice(0, 2));
            console.log("Sample courses:", courses.slice(0, 2));
            console.log("Sample schedule details:", scheduleDetails.slice(0, 2));
        }
    }

    return validScheduleDetails;
};

/**
 * Emergency mode to ensure schedule can be created regardless of ID format issues
 * This function performs a deep repair on schedule details to fix any issues with IDs
 * @param {Array} scheduleDetails - Schedule details to repair
 * @param {Array} classes - Available classes
 * @param {Array} courses - Available courses
 * @returns {Array} Repaired schedule details
 */
export const emergencyRepairSchedule = (scheduleDetails, classes, courses) => {
    // Enhanced error handling with more detailed diagnostics
    if (!scheduleDetails) {
        console.error("😱 No schedule details to repair! scheduleDetails is undefined or null");
        return [];
    }

    if (!Array.isArray(scheduleDetails)) {
        console.error(`😱 scheduleDetails is not an array! Type: ${typeof scheduleDetails}`);
        // Try to convert to array if possible
        if (typeof scheduleDetails === "object") {
            console.log("Attempting to convert object to array...");
            scheduleDetails = [scheduleDetails];
        } else {
            return [];
        }
    }

    if (scheduleDetails.length === 0) {
        console.error("😱 scheduleDetails array is empty!");
        return [];
    }

    // Log sample of what we're working with
    console.log(`📊 First schedule detail entry: ${JSON.stringify(scheduleDetails[0])}`);

    if (!classes || !Array.isArray(classes) || classes.length === 0) {
        console.error("😱 No classes available for repair!");
        console.log(
            `classes parameter: ${classes ? typeof classes : "undefined"}, length: ${
                classes ? (Array.isArray(classes) ? classes.length : "not an array") : "N/A"
            }`
        );
        return [];
    }

    if (!courses || !Array.isArray(courses) || courses.length === 0) {
        console.error("😱 No courses available for repair!");
        console.log(
            `courses parameter: ${courses ? typeof courses : "undefined"}, length: ${
                courses ? (Array.isArray(courses) ? courses.length : "not an array") : "N/A"
            }`
        );
        return [];
    }

    console.log("🚨 EMERGENCY REPAIR MODE ACTIVATED 🚨");
    console.log(`Attempting to repair ${scheduleDetails.length} schedule details`);

    // Ensure all classes and courses have consistent ID fields
    classes.forEach((cls, i) => {
        if (cls._id && !cls.id) cls.id = cls._id;
        if (cls.id && !cls._id) cls._id = cls.id;
        if (!cls._id && !cls.id) {
            cls.id = `class_${i + 1}`;
            cls._id = cls.id;
        }
    });

    courses.forEach((course, i) => {
        if (course._id && !course.id) course.id = course._id;
        if (course.id && !course._id) course._id = course.id;
        if (!course._id && !course.id) {
            course.id = `course_${i + 1}`;
            course._id = course.id;
        }
    });

    // Create a default schedule that assigns courses to classes sequentially
    // This is purely a fallback when all else fails
    if (scheduleDetails.every((detail) => !detail.class_id || !detail.course_id)) {
        console.warn("🚨 Creating completely new schedule from scratch!");

        const repairedDetails = [];
        const daysOfWeek = [1, 2, 3, 4, 5];
        const timeSlots = [
            { start: "07:30:00", end: "09:00:00" },
            { start: "09:10:00", end: "10:40:00" },
            { start: "10:50:00", end: "12:20:00" },
            { start: "13:30:00", end: "15:00:00" },
            { start: "15:10:00", end: "16:40:00" },
        ];

        let slotIndex = 0;
        let dayIndex = 0;
        let weekNumber = 1;

        // Assign each course to each class in a round-robin fashion
        for (let i = 0; i < Math.min(classes.length * courses.length, 50); i++) {
            const classIndex = i % classes.length;
            const courseIndex = Math.floor(i / classes.length) % courses.length;

            repairedDetails.push({
                class_id: classes[classIndex]._id || classes[classIndex].id,
                course_id: courses[courseIndex]._id || courses[courseIndex].id,
                day_of_week: daysOfWeek[dayIndex],
                week_number: weekNumber,
                start_time: timeSlots[slotIndex].start,
                end_time: timeSlots[slotIndex].end,
                is_practical: false,
                is_exam: false,
                notes: "Emergency generated schedule",
            });

            slotIndex = (slotIndex + 1) % timeSlots.length;
            if (slotIndex === 0) {
                dayIndex = (dayIndex + 1) % daysOfWeek.length;
                if (dayIndex === 0) {
                    weekNumber++;
                }
            }
        }

        return repairedDetails;
    }

    // Repair each detail
    return scheduleDetails.map((detail, index) => {
        // Deep copy to avoid mutating the original
        const repairedDetail = { ...detail };

        // Try to find valid class_id
        if (!detail.class_id) {
            if (classes.length > 0) {
                repairedDetail.class_id = classes[index % classes.length]._id || classes[index % classes.length].id;
                console.log(`[Repair] Assigned class_id ${repairedDetail.class_id} to entry ${index}`);
            }
        }

        // Try to find valid course_id
        if (!detail.course_id) {
            if (courses.length > 0) {
                repairedDetail.course_id = courses[index % courses.length]._id || courses[index % courses.length].id;
                console.log(`[Repair] Assigned course_id ${repairedDetail.course_id} to entry ${index}`);
            }
        }

        // Ensure all required fields exist
        if (!repairedDetail.day_of_week) repairedDetail.day_of_week = (index % 5) + 1;
        if (!repairedDetail.week_number) repairedDetail.week_number = Math.floor(index / 5) + 1;
        if (!repairedDetail.start_time) repairedDetail.start_time = "08:00:00";
        if (!repairedDetail.end_time) repairedDetail.end_time = "09:30:00";

        return repairedDetail;
    });
};

/**
 * Create a basic schedule from scratch when no valid schedule details exist
 * This is the ultimate fallback when everything else fails
 * @param {Array} classes - Available classes
 * @param {Array} courses - Available courses
 * @param {Object} options - Additional options
 * @returns {Array} Basic generated schedule
 */
export const createBasicSchedule = (classes, courses, options = {}) => {
    if (!classes || !Array.isArray(classes) || classes.length === 0) {
        console.error("Cannot create basic schedule: No classes available");
        return [];
    }

    if (!courses || !Array.isArray(courses) || courses.length === 0) {
        console.error("Cannot create basic schedule: No courses available");
        return [];
    }

    const { weeks = 4, hoursPerDay = 6 } = options;
    console.log(`Creating basic schedule for ${classes.length} classes and ${courses.length} courses`);

    const basicSchedule = [];
    const daysOfWeek = [1, 2, 3, 4, 5];
    const timeSlots = [
        { start: "07:30:00", end: "09:00:00" },
        { start: "09:10:00", end: "10:40:00" },
        { start: "10:50:00", end: "12:20:00" },
        { start: "13:30:00", end: "15:00:00" },
        { start: "15:10:00", end: "16:40:00" },
    ];

    // Assign courses to classes in a round-robin fashion
    for (let week = 1; week <= weeks; week++) {
        for (const day of daysOfWeek) {
            for (let slotIndex = 0; slotIndex < Math.min(timeSlots.length, hoursPerDay); slotIndex++) {
                for (let classIndex = 0; classIndex < classes.length; classIndex++) {
                    const courseIndex = (classIndex + week + day + slotIndex) % courses.length;

                    basicSchedule.push({
                        class_id: classes[classIndex]._id || classes[classIndex].id,
                        course_id: courses[courseIndex]._id || courses[courseIndex].id,
                        day_of_week: day,
                        week_number: week,
                        start_time: timeSlots[slotIndex].start,
                        end_time: timeSlots[slotIndex].end,
                        is_practical: false,
                        is_exam: false,
                        notes: "Auto-generated by emergency system",
                    });
                }
            }
        }
    }

    console.log(`Created ${basicSchedule.length} schedule entries`);
    return basicSchedule;
};

export default {
    isObjectIdLike,
    getObjectId,
    mapClassesById,
    mapCoursesById,
    findClassId,
    findCourseId,
    validateScheduleDetails,
    emergencyRepairSchedule,
    createBasicSchedule,
};
