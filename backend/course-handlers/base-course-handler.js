/**
 * Base Course Handler - Abstract class for course-specific logic
 *
 * This provides a framework for implementing course-specific behaviors
 * without cluttering the general configuration interface.
 */

class BaseCourseHandler {
    constructor(courseCode, courseName) {
        this.courseCode = courseCode;
        this.courseName = courseName;
    }

    /**
     * Get course-specific constraints that override general rules
     * @returns {Object} Course-specific constraints
     */
    getSpecificConstraints() {
        return {};
    }

    /**
     * Apply course-specific schedule processing
     * @param {Array} schedules - Current schedules for this course
     * @param {Object} context - Processing context (other courses, constraints, etc.)
     * @returns {Array} Modified schedules
     */
    processSchedules(schedules, context) {
        return schedules;
    }

    /**
     * Determine exam/assessment strategy for this course
     * @returns {Object} Exam configuration
     */
    getExamStrategy() {
        return {
            type: "standard", // 'standard', 'periodic_tests', 'final_only', 'practical_focused'
            phases: 1,
            requirements: [],
        };
    }

    /**
     * Apply practical session constraints
     * @param {Array} practicalSchedules - Practical session schedules
     * @param {Array} theorySchedules - Theory session schedules
     * @returns {Array} Modified practical schedules
     */
    processPracticalSessions(practicalSchedules, theorySchedules) {
        return practicalSchedules;
    }

    /**
     * Check if course code matches this handler
     * @param {string} courseCode - Course code to check
     * @returns {boolean} True if this handler should process the course
     */
    static matches(courseCode) {
        return false;
    }

    /**
     * Get display name for this course type
     * @returns {string} Display name
     */
    getDisplayName() {
        return this.courseName || this.courseCode;
    }

    /**
     * Get course handler priority (lower numbers processed first)
     * @returns {number} Priority level
     */
    getPriority() {
        return 100; // Default priority
    }

    /**
     * Check if this handler applies to course combinations
     * @returns {boolean} True if this handler processes multiple courses together
     */
    isGroupHandler() {
        return false;
    }
}

module.exports = BaseCourseHandler;
