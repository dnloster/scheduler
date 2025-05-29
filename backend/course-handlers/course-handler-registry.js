/**
 * Course Handler Registry
 *
 * Manages registration and discovery of course handlers.
 * Provides a centralized way to process courses based on their specific requirements.
 */

const BaseCourseHandler = require("./base-course-handler");

class CourseHandlerRegistry {
    constructor() {
        this.handlers = new Map();
        this.groupHandlers = new Map();
        this.initialized = false;
    }

    /**
     * Initialize the registry with available handlers
     */
    initialize() {
        if (this.initialized) return;

        try {
            // Register Vietnamese Course Handler
            const VietnameseCourseHandler = require("./vietnamese-course-handler");
            this.registerHandler("vietnamese", new VietnameseCourseHandler());

            // Register Q-Course Handler
            const QCourseHandler = require("./q-course-handler");
            this.registerHandler("q_course", new QCourseHandler());

            this.initialized = true;
            console.log(`✅ Course Handler Registry initialized with ${this.handlers.size} handlers`);
        } catch (error) {
            console.error("❌ Error initializing Course Handler Registry:", error);
        }
    }

    /**
     * Register a course handler
     * @param {string} name - Handler name
     * @param {BaseCourseHandler} handler - Handler instance
     */
    registerHandler(name, handler) {
        if (!(handler instanceof BaseCourseHandler)) {
            throw new Error(`Handler ${name} must extend BaseCourseHandler`);
        }

        this.handlers.set(name, handler);

        if (handler.isGroupHandler()) {
            this.groupHandlers.set(name, handler);
        }

        console.log(`📝 Registered course handler: ${name} (${handler.getDisplayName()})`);
    }

    /**
     * Find appropriate handler for a course code
     * @param {string} courseCode - Course code to check
     * @returns {BaseCourseHandler|null} Matching handler or null
     */
    getHandlerForCourse(courseCode) {
        this.initialize();

        for (const [name, handler] of this.handlers) {
            if (handler.constructor.matches(courseCode)) {
                return handler;
            }
        }

        return null;
    }

    /**
     * Get all registered handlers sorted by priority
     * @returns {Array} Array of {name, handler} objects sorted by priority
     */
    getAllHandlers() {
        this.initialize();

        return Array.from(this.handlers.entries())
            .map(([name, handler]) => ({ name, handler }))
            .sort((a, b) => a.handler.getPriority() - b.handler.getPriority());
    }

    /**
     * Get handlers that process multiple courses together
     * @returns {Array} Array of group handlers
     */
    getGroupHandlers() {
        this.initialize();

        return Array.from(this.groupHandlers.values()).sort((a, b) => a.getPriority() - b.getPriority());
    }

    /**
     * Process schedules using appropriate handlers
     * @param {Array} schedules - Schedules to process
     * @param {Object} context - Processing context
     * @returns {Array} Processed schedules
     */
    processSchedules(schedules, context = {}) {
        this.initialize();

        if (!Array.isArray(schedules) || schedules.length === 0) {
            return schedules;
        }

        let processedSchedules = [...schedules];

        // First, apply group handlers (e.g., paired courses)
        const groupHandlers = this.getGroupHandlers();
        for (const handler of groupHandlers) {
            if (handler.processPairedSchedules) {
                processedSchedules = handler.processPairedSchedules(processedSchedules, context);
            } else {
                processedSchedules = handler.processSchedules(processedSchedules, context);
            }
        }

        // Then, apply individual course handlers
        const courseScheduleMap = new Map();
        processedSchedules.forEach((schedule) => {
            const courseCode = schedule.course_code;
            if (!courseScheduleMap.has(courseCode)) {
                courseScheduleMap.set(courseCode, []);
            }
            courseScheduleMap.get(courseCode).push(schedule);
        });

        // Process each course group
        courseScheduleMap.forEach((courseSchedules, courseCode) => {
            const handler = this.getHandlerForCourse(courseCode);
            if (handler && !handler.isGroupHandler()) {
                // Replace schedules with processed versions
                const processedCourseSchedules = handler.processSchedules(courseSchedules, context);
                courseSchedules.forEach((schedule, index) => {
                    if (processedCourseSchedules[index]) {
                        Object.assign(schedule, processedCourseSchedules[index]);
                    }
                });
            }
        });

        return processedSchedules;
    }

    /**
     * Get specific constraints for a course
     * @param {string} courseCode - Course code
     * @returns {Object} Course-specific constraints
     */
    getConstraintsForCourse(courseCode) {
        const handler = this.getHandlerForCourse(courseCode);
        return handler ? handler.getSpecificConstraints() : {};
    }

    /**
     * Get exam strategy for a course
     * @param {string} courseCode - Course code
     * @returns {Object} Exam strategy
     */
    getExamStrategyForCourse(courseCode) {
        const handler = this.getHandlerForCourse(courseCode);
        return handler ? handler.getExamStrategy() : { type: "standard", phases: 1 };
    }

    /**
     * Check if a course needs special handling
     * @param {string} courseCode - Course code
     * @returns {boolean} True if course has a specific handler
     */
    hasHandlerForCourse(courseCode) {
        return this.getHandlerForCourse(courseCode) !== null;
    }

    /**
     * Get display information for all course types
     * @returns {Array} Array of course type info
     */
    getCourseTypeInfo() {
        this.initialize();

        return Array.from(this.handlers.values()).map((handler) => ({
            code: handler.courseCode,
            name: handler.getDisplayName(),
            examStrategy: handler.getExamStrategy(),
            isGroupHandler: handler.isGroupHandler(),
            priority: handler.getPriority(),
        }));
    }
    /**
     * Get available handlers
     * @returns {Array} Array of handler instances
     */
    getAvailableHandlers() {
        this.initialize();
        return Array.from(this.handlers.values());
    }

    /**
     * Get a specific handler by course code (alias for getHandlerForCourse)
     * @param {string} courseCode - Course code
     * @returns {BaseCourseHandler|null} Handler instance or null
     */
    getHandler(courseCode) {
        return this.getHandlerForCourse(courseCode);
    }

    /**
     * Process practical sessions with course-specific logic
     * @param {Array} practicalSchedules - Practical schedules
     * @param {Array} theorySchedules - Theory schedules
     * @returns {Array} Processed practical schedules
     */
    processPracticalSessions(practicalSchedules, theorySchedules) {
        this.initialize();

        let processedSchedules = [...practicalSchedules];

        // Group by course and apply handlers
        const practicalByCourse = new Map();
        processedSchedules.forEach((schedule) => {
            const courseCode = schedule.course_code;
            if (!practicalByCourse.has(courseCode)) {
                practicalByCourse.set(courseCode, []);
            }
            practicalByCourse.get(courseCode).push(schedule);
        });

        practicalByCourse.forEach((sessions, courseCode) => {
            const handler = this.getHandlerForCourse(courseCode);
            if (handler) {
                const courseTheorySchedules = theorySchedules.filter((s) => s.course_code === courseCode);
                const processedSessions = handler.processPracticalSessions(sessions, courseTheorySchedules);

                // Update original schedules
                sessions.forEach((session, index) => {
                    if (processedSessions[index]) {
                        Object.assign(session, processedSessions[index]);
                    }
                });
            }
        });

        return processedSchedules;
    }
}

// Create singleton instance
const registry = new CourseHandlerRegistry();

module.exports = registry;
