/**
 * Helper functions to ensure proper handling of MongoDB ObjectID values
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

/**
 * Validates schedule details to ensure they have proper MongoDB ObjectIDs
 * @param {Array} scheduleDetails - The schedule details to validate
 * @param {Array} classes - Available classes to use for validation
 * @param {Array} courses - Available courses to use for validation
 * @returns {Array} Validated schedule details with proper MongoDB ObjectIDs
 */
/**
 * Enhanced lookup function for classes
 * @param {any} classInput - Class input (could be MongoDB ObjectID, numeric ID, name, or object)
 * @param {Array} classes - Available classes to look up from
 * @returns {string|null} MongoDB ObjectID as string if found, null otherwise
 */
export const findClassId = (classInput, classes) => {
    // If input is already a valid ObjectID string, return it
    if (isObjectIdLike(classInput)) {
        return classInput;
    }

    // Create a map for faster lookups
    const classMap = {};
    classes.forEach((c) => {
        if (c._id) classMap[c._id] = c;
        if (c.id) classMap[c.id] = c;
        if (c.name) classMap[c.name] = c;
    });

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
            const id = typeof classInput.id === "string" ? parseInt(classInput.id) : classInput.id;
            matchingClass = classes.find((c) => c.id === id);
        }

        // Check if it has name field
        if (!matchingClass && classInput.name) {
            matchingClass = classes.find((c) => c.name === classInput.name);
        }

        // Check if it has class_name field (format used in schedule details)
        if (!matchingClass && classInput.class_name) {
            matchingClass = classes.find((c) => c.name === classInput.class_name);
        }

        // Check if it has className field (camelCase variant)
        if (!matchingClass && classInput.className) {
            matchingClass = classes.find((c) => c.name === classInput.className);
        }
    }

    // Case 3: String matching by name (when string is not an ObjectID or numeric ID)
    if (
        !matchingClass &&
        typeof classInput === "string" &&
        !isObjectIdLike(classInput) &&
        isNaN(parseInt(classInput))
    ) {
        matchingClass = classes.find((c) => c.name === classInput);
    }

    // Direct lookup in map if we still don't have a match
    if (!matchingClass && classInput && classMap[classInput]) {
        matchingClass = classMap[classInput];
    }

    return matchingClass && matchingClass._id ? matchingClass._id : null;
};

/**
 * Enhanced lookup function for courses
 * @param {any} courseInput - Course input (could be MongoDB ObjectID, numeric ID, code, name, or object)
 * @param {Array} courses - Available courses to look up from
 * @returns {string|null} MongoDB ObjectID as string if found, null otherwise
 */
export const findCourseId = (courseInput, courses) => {
    // If input is already a valid ObjectID string, return it
    if (isObjectIdLike(courseInput)) {
        return courseInput;
    }

    // Create a map for faster lookups
    const courseMap = {};
    courses.forEach((c) => {
        if (c._id) courseMap[c._id] = c;
        if (c.id) courseMap[c.id] = c;
        if (c.code) courseMap[c.code] = c;
        if (c.name) courseMap[`name:${c.name}`] = c;
    });

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
            const id = typeof courseInput.id === "string" ? parseInt(courseInput.id) : courseInput.id;
            matchingCourse = courses.find((c) => c.id === id);
        }

        // Check if it has code field
        if (!matchingCourse && courseInput.code) {
            matchingCourse = courses.find((c) => c.code === courseInput.code);
        }

        // Check if it has name field
        if (!matchingCourse && courseInput.name) {
            matchingCourse = courses.find((c) => c.name === courseInput.name);
        }

        // Check if it has course_name field (format used in schedule details)
        if (!matchingCourse && courseInput.course_name) {
            matchingCourse = courses.find((c) => c.name === courseInput.course_name);
        }

        // Check if it has course_code field (format used in schedule details)
        if (!matchingCourse && courseInput.course_code) {
            matchingCourse = courses.find((c) => c.code === courseInput.course_code);
        }
    }

    // Case 3: String matching by code or name
    if (
        !matchingCourse &&
        typeof courseInput === "string" &&
        !isObjectIdLike(courseInput) &&
        isNaN(parseInt(courseInput))
    ) {
        matchingCourse = courses.find((c) => c.code === courseInput || c.name === courseInput);
    }

    // Direct lookup in map if we still don't have a match
    if (!matchingCourse && courseInput) {
        if (courseMap[courseInput]) {
            matchingCourse = courseMap[courseInput];
        } else if (courseInput.toString && courseMap[courseInput.toString()]) {
            matchingCourse = courseMap[courseInput.toString()];
        }
    }

    return matchingCourse && matchingCourse._id ? matchingCourse._id : null;
};

export const validateScheduleDetails = (scheduleDetails, classes, courses) => {
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

    // Create a validation results array to collect validation status
    const validationResults = [];

    const validScheduleDetails = scheduleDetails.filter((detail, index) => {
        // Try to ensure we have valid IDs using our enhanced lookup functions
        let classId = findClassId(detail.class_id, classes);
        let courseId = findCourseId(detail.course_id, courses);

        // If still no valid class ID, try alternative lookups
        if (!classId) {
            // Try by class_name
            if (detail.class_name || detail.className) {
                const className = detail.class_name || detail.className;
                classId = findClassId(className, classes);
            }

            // Last resort - try to match any numeric ID from classes array
            if (!classId && typeof detail.class_id === "number") {
                const matchingClass = classes.find((c) => c.id === detail.class_id);
                if (matchingClass) {
                    classId = getObjectId(matchingClass);
                }
            }
        }

        // If still no valid course ID, try alternative lookups
        if (!courseId) {
            // Try by course_name or course_code
            if (detail.course_name) {
                courseId = findCourseId(detail.course_name, courses);
            }

            if (!courseId && detail.course_code) {
                courseId = findCourseId(detail.course_code, courses);
            }

            // Last resort - try to match any numeric ID from courses array
            if (!courseId && typeof detail.course_id === "number") {
                const matchingCourse = courses.find((c) => c.id === detail.course_id);
                if (matchingCourse) {
                    courseId = getObjectId(matchingCourse);
                }
            }
        }

        // Log validation result for debugging
        validationResults.push({
            index,
            input: {
                class_id: detail.class_id,
                course_id: detail.course_id,
                class_name: detail.class_name || detail.className,
                course_name: detail.course_name,
                course_code: detail.course_code,
            },
            resolved: {
                class_id: classId,
                course_id: courseId,
            },
            isValid: Boolean(
                classId && courseId && detail.day_of_week && detail.week_number && detail.start_time && detail.end_time
            ),
        });

        // Skip entries without valid IDs
        if (!classId || !courseId) {
            console.warn(`[Entry ${index}] Skipping invalid schedule detail:`, {
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
            console.warn(`[Entry ${index}] Skipping detail with invalid day_of_week:`, detail);
            return false;
        }

        if (!detail.week_number || detail.week_number < 1) {
            console.warn(`[Entry ${index}] Skipping detail with invalid week_number:`, detail);
            return false;
        }

        if (!detail.start_time || !detail.end_time) {
            console.warn(`[Entry ${index}] Skipping detail with missing time values:`, detail);
            return false;
        }

        return true;
    });

    // Log validation summary
    console.log("Validation summary:", {
        total: scheduleDetails.length,
        valid: validScheduleDetails.length,
        invalid: scheduleDetails.length - validScheduleDetails.length,
    });

    if (validScheduleDetails.length === 0) {
        console.error("All schedule details were invalid! Validation results:", validationResults);
    }

    return validScheduleDetails;
};
