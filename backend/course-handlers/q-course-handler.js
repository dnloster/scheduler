/**
 * Q-Course Handler
 *
 * Handles Q-courses that have practical components with specific constraints:
 * - Theory sessions must come before practical sessions
 * - Practical sessions prefer afternoon or early morning slots
 * - Theory and practical may have different grouping requirements
 */

const BaseCourseHandler = require("./base-course-handler");

class QCourseHandler extends BaseCourseHandler {
    constructor() {
        super("Q", "Q-Courses with Practical Components");
        this.coursePrefix = "Q";
    }

    static matches(courseCode) {
        return courseCode.startsWith("Q") && courseCode.length >= 2;
    }

    getPriority() {
        return 20; // Medium priority
    }

    getSpecificConstraints() {
        return {
            has_practical_component: true,
            theory_first_required: true,
            practical_timing_constraints: {
                preferred_sessions: ["afternoon", "early_morning"],
                avoid_sessions: ["late_morning"],
            },
            requires_sequential_scheduling: true, // Theory before practical
        };
    }

    getExamStrategy() {
        return {
            type: "practical_focused",
            phases: 2, // Theory exam + Practical exam
            requirements: [
                "Theory exam must precede practical exam",
                "Practical exam requires equipment setup time",
                "Both theory and practical must pass",
            ],
            phase_descriptions: ["Thi lý thuyết", "Thi thực hành"],
        };
    }

    processSchedules(schedules, context) {
        const qCourseSchedules = schedules.filter((schedule) => this.matches(schedule.course_code));

        if (qCourseSchedules.length === 0) return schedules;

        // Separate theory and practical sessions
        const theorySchedules = qCourseSchedules.filter((s) => !s.is_practical);
        const practicalSchedules = qCourseSchedules.filter((s) => s.is_practical);

        // Apply theory-first constraint
        this.enforceTheoryFirst(theorySchedules, practicalSchedules);

        // Apply practical timing constraints
        this.applyPracticalTimingConstraints(practicalSchedules);

        return schedules;
    }

    /**
     * Ensure theory sessions are scheduled before practical sessions
     * @param {Array} theorySchedules - Theory session schedules
     * @param {Array} practicalSchedules - Practical session schedules
     */
    enforceTheoryFirst(theorySchedules, practicalSchedules) {
        if (theorySchedules.length === 0 || practicalSchedules.length === 0) return;

        // Find the latest theory session
        const latestTheoryWeek = Math.max(...theorySchedules.map((s) => s.week_number));

        // Ensure all practical sessions start after theory completion
        practicalSchedules.forEach((schedule) => {
            if (schedule.week_number <= latestTheoryWeek) {
                schedule.scheduling_note = "Delayed: Must start after theory completion";
                schedule.earliest_start_week = latestTheoryWeek + 1;
            }
        });
    }

    /**
     * Apply timing constraints for practical sessions
     * @param {Array} practicalSchedules - Practical session schedules
     */
    applyPracticalTimingConstraints(practicalSchedules) {
        practicalSchedules.forEach((schedule) => {
            const hour = parseInt(schedule.start_time?.split(":")[0] || "8");

            // Prefer afternoon (13:00-17:00) or early morning (7:00-9:00)
            if (hour >= 13 && hour <= 17) {
                schedule.scheduling_preference = "optimal_afternoon";
            } else if (hour >= 7 && hour <= 9) {
                schedule.scheduling_preference = "optimal_early_morning";
            } else if (hour >= 10 && hour <= 12) {
                schedule.scheduling_preference = "avoid_late_morning";
                schedule.scheduling_note = "Late morning not preferred for practical";
            }

            // Mark as requiring special equipment/setup
            schedule.requires_practical_setup = true;
            schedule.course_handler = "q_course";
        });
    }

    processPracticalSessions(practicalSchedules, theorySchedules) {
        // Group practical sessions by course
        const practicalByCourse = new Map();
        practicalSchedules.forEach((schedule) => {
            const courseId = schedule.course_id;
            if (!practicalByCourse.has(courseId)) {
                practicalByCourse.set(courseId, []);
            }
            practicalByCourse.get(courseId).push(schedule);
        });

        // Process each course's practical sessions
        practicalByCourse.forEach((sessions, courseId) => {
            // Find corresponding theory sessions
            const courseTheorySchedules = theorySchedules.filter((s) => s.course_id === courseId);

            // Apply theory-first constraint
            this.enforceTheoryFirst(courseTheorySchedules, sessions);

            // Apply timing preferences
            this.applyPracticalTimingConstraints(sessions);

            // Add course-specific notes
            sessions.forEach((session) => {
                session.handler_notes = `Q-Course practical: ${session.course_code}`;
                session.requires_equipment = true;
            });
        });

        return practicalSchedules;
    }

    /**
     * Get recommended grouping strategy for Q-courses
     * @returns {Object} Grouping recommendations
     */
    getGroupingStrategy() {
        return {
            theory: {
                can_group_classes: true,
                recommended_groups: "A,B|C,D|E,F",
                reason: "Theory can accommodate larger groups",
            },
            practical: {
                can_group_classes: false,
                recommended_groups: "",
                reason: "Practical requires individual class sessions for equipment access",
            },
        };
    }
}

module.exports = QCourseHandler;
