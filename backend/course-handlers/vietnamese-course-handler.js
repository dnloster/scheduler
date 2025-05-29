/**
 * V30/V31 Vietnamese Course Handler
 *
 * Handles the specific requirements for V30/V31 paired Vietnamese courses:
 * - Paired course logic with cumulative hours tracking
 * - 5-phase periodic testing system (phases 1-4 are periodic tests, phase 5 is final exam)
 * - Synchronized exam scheduling between V30 and V31
 */

const BaseCourseHandler = require("./base-course-handler");

class VietnameseCourseHandler extends BaseCourseHandler {
    constructor() {
        super("V30/V31", "Vietnamese Language Courses");
        this.pairedCourses = ["V30", "V31"];
        this.phaseThresholds = [132, 231, 367, 446, 527]; // Cumulative hours for each phase
        this.totalCombinedHours = 552; // V30: 246 + V31: 306
    }

    static matches(courseCode) {
        return ["V30", "V31"].includes(courseCode);
    }

    getPriority() {
        return 10; // High priority for paired course processing
    }

    isGroupHandler() {
        return true; // This handler processes multiple courses together
    }

    getSpecificConstraints() {
        return {
            is_paired_course: true,
            requires_cumulative_tracking: true,
            combined_total_hours: this.totalCombinedHours,
            phase_hour_thresholds: this.phaseThresholds.map((hours, index) => ({
                phase: index + 1,
                cumulative_hours: hours,
                description: index === 4 ? "Thi hết môn" : `Kiểm tra định kỳ lần ${index + 1}`,
            })),
            exam_phases: 5,
            synchronized_exams: true,
        };
    }

    getExamStrategy() {
        return {
            type: "periodic_tests",
            phases: 5,
            requirements: [
                "Must complete cumulative hours thresholds",
                "Phases 1-4 are periodic tests",
                "Phase 5 is final comprehensive exam",
                "Synchronized with paired course",
            ],
            phase_descriptions: [
                "Kiểm tra định kỳ lần 1",
                "Kiểm tra định kỳ lần 2",
                "Kiểm tra định kỳ lần 3",
                "Kiểm tra định kỳ lần 4",
                "Thi hết môn",
            ],
        };
    }

    processSchedules(schedules, context) {
        // Mark schedules for paired course processing
        return schedules.map((schedule) => ({
            ...schedule,
            requires_paired_processing: true,
            course_handler: "vietnamese",
        }));
    }

    /**
     * Determine which phase should be triggered based on cumulative hours
     * @param {number} cumulativeHours - Total cumulative hours
     * @returns {number|null} Phase number to trigger, or null if no phase ready
     */
    getTriggeredPhase(cumulativeHours) {
        for (let i = this.phaseThresholds.length - 1; i >= 0; i--) {
            if (cumulativeHours >= this.phaseThresholds[i]) {
                return i + 1;
            }
        }
        return null;
    }

    /**
     * Process paired course schedules with cumulative hour tracking
     * @param {Array} schedules - All schedules for both V30 and V31
     * @param {Object} context - Processing context
     * @returns {Array} Modified schedules with paired course logic applied
     */
    processPairedSchedules(schedules, context) {
        const pairedSchedules = schedules.filter((schedule) => this.pairedCourses.includes(schedule.course_code));

        if (pairedSchedules.length === 0) return schedules;

        // Sort by chronological order for cumulative tracking
        pairedSchedules.sort((a, b) => {
            if (a.week_number !== b.week_number) {
                return a.week_number - b.week_number;
            }
            return a.day_of_week - b.day_of_week;
        });

        // Calculate cumulative hours and mark phases
        let cumulativeHours = 0;
        pairedSchedules.forEach((schedule) => {
            // Calculate session hours
            const sessionHours = this.calculateSessionHours(schedule.start_time, schedule.end_time);
            cumulativeHours += sessionHours;

            // Mark schedule with cumulative tracking
            schedule.cumulative_hours = cumulativeHours;
            schedule.is_paired_course = true;
            schedule.paired_group = "V30-V31";
            schedule.course_handler = "vietnamese";

            // Check for phase triggers
            const triggeredPhase = this.getTriggeredPhase(cumulativeHours);
            if (triggeredPhase) {
                schedule.exam_phase_ready = triggeredPhase;
            }
        });

        return schedules;
    }

    /**
     * Calculate hours between start and end time
     * @param {string} startTime - Start time in HH:MM:SS format
     * @param {string} endTime - End time in HH:MM:SS format
     * @returns {number} Hours difference
     */
    calculateSessionHours(startTime, endTime) {
        const start = new Date(`1970-01-01T${startTime}`);
        const end = new Date(`1970-01-01T${endTime}`);
        return (end - start) / (1000 * 60 * 60);
    }

    /**
     * Check if courses should be processed as a paired group
     * @param {string} courseCode1 - First course code
     * @param {string} courseCode2 - Second course code
     * @returns {boolean} True if courses are paired
     */
    isPairedWith(courseCode1, courseCode2) {
        return (
            this.pairedCourses.includes(courseCode1) &&
            this.pairedCourses.includes(courseCode2) &&
            courseCode1 !== courseCode2
        );
    }

    /**
     * Generate exam notes based on phase
     * @param {number} phase - Exam phase (1-5)
     * @returns {string} Exam description
     */
    getExamDescription(phase) {
        const strategy = this.getExamStrategy();
        return strategy.phase_descriptions[phase - 1] || `Thi giai đoạn ${phase}`;
    }
}

module.exports = VietnameseCourseHandler;
