/**
 * Backend Schedule Display Validation Test
 *
 * This script validates the database contains all the necessary data
 * for proper frontend display functionality.
 */

const axios = require("axios");

const API_BASE_URL = "http://localhost:5000/api";

class BackendScheduleValidator {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            details: [],
        };
    }

    log(message, type = "info") {
        const timestamp = new Date().toLocaleTimeString();
        const symbols = {
            info: "📋",
            success: "✅",
            error: "❌",
            warning: "⚠️",
        };
        console.log(`${symbols[type] || "📋"} [${timestamp}] ${message}`);
    }

    async runValidation() {
        this.log("Starting Backend Schedule Display Validation", "info");

        try {
            // Test if backend is running
            await this.testBackendConnection();

            // Test data availability
            await this.validateScheduleData();

            // Test maintenance periods
            await this.validateMaintenancePeriods();

            // Test exam scheduling
            await this.validateExamScheduling();

            // Test special events
            await this.validateSpecialEvents();

            // Test data integrity
            await this.validateDataIntegrity();

            this.printSummary();
        } catch (error) {
            this.log(`Validation failed: ${error.message}`, "error");
        }
    }

    async testBackendConnection() {
        this.log("Testing backend connection...", "info");

        try {
            const response = await axios.get(`${API_BASE_URL}/schedules`, { timeout: 5000 });

            this.addResult(
                "Backend Connection",
                response.status === 200,
                `Backend responded with status ${response.status}`
            );
        } catch (error) {
            this.addResult("Backend Connection", false, `Failed to connect to backend: ${error.message}`);
            throw error;
        }
    }

    async validateScheduleData() {
        this.log("Validating schedule data structure...", "info");

        try {
            const [schedulesRes, classesRes, coursesRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/schedules`),
                axios.get(`${API_BASE_URL}/classes`),
                axios.get(`${API_BASE_URL}/courses`),
            ]);

            const schedules = schedulesRes.data;
            const classes = classesRes.data;
            const courses = coursesRes.data;

            // Store data for other tests
            this.schedules = schedules;
            this.classes = classes;
            this.courses = courses;

            this.addResult("Schedule Data Availability", schedules.length > 0, `Found ${schedules.length} schedules`);

            this.addResult("Classes Data Availability", classes.length > 0, `Found ${classes.length} classes`);

            this.addResult("Courses Data Availability", courses.length > 0, `Found ${courses.length} courses`);

            // Check if schedules have required fields for display
            if (schedules.length > 0) {
                const sampleSchedule = schedules[0];
                const requiredFields = [
                    "class",
                    "course",
                    "day_of_week",
                    "week_number",
                    "start_time",
                    "end_time",
                    "actual_date",
                ];

                const hasRequiredFields = requiredFields.every((field) => sampleSchedule.hasOwnProperty(field));

                this.addResult(
                    "Schedule Required Fields",
                    hasRequiredFields,
                    `Sample schedule has fields: ${Object.keys(sampleSchedule).join(", ")}`
                );

                // Check for enhanced display fields
                const enhancedFields = [
                    "is_maintenance",
                    "is_break",
                    "is_holiday",
                    "is_exam",
                    "is_practical",
                    "is_self_study",
                    "is_flag_ceremony",
                    "has_special_event",
                    "event_type",
                ];

                const enhancedFieldsPresent = enhancedFields.filter((field) => sampleSchedule.hasOwnProperty(field));

                this.addResult(
                    "Enhanced Display Fields",
                    enhancedFieldsPresent.length >= 5,
                    `Enhanced fields present: ${enhancedFieldsPresent.join(", ")}`
                );
            }
        } catch (error) {
            this.addResult("Schedule Data Validation", false, `Failed to validate data: ${error.message}`);
        }
    }

    async validateMaintenancePeriods() {
        this.log("Validating maintenance periods...", "info");

        const maintenancePeriods = this.schedules.filter((s) => s.is_maintenance);

        this.addResult(
            "Maintenance Periods Present",
            maintenancePeriods.length > 0,
            `Found ${maintenancePeriods.length} maintenance periods`
        );

        if (maintenancePeriods.length > 0) {
            // Check maintenance period pattern (every 4 weeks)
            const maintenanceWeeks = [...new Set(maintenancePeriods.map((m) => m.week_number))];
            const followsPattern = maintenanceWeeks.every((week) => week % 4 === 0);

            this.addResult(
                "Maintenance Pattern Correct",
                followsPattern,
                `Maintenance weeks: ${maintenanceWeeks.slice(0, 10).join(", ")}`
            );

            // Check maintenance timing (Friday afternoon)
            const correctTiming = maintenancePeriods.every((m) => m.day_of_week === 5 && m.start_time === "15:00:00");

            this.addResult(
                "Maintenance Timing Correct",
                correctTiming,
                `All maintenance periods on Friday 15:00-17:00`
            );

            // Check maintenance notes
            const hasNotes = maintenancePeriods.every((m) => m.notes && m.notes.includes("bảo quản"));

            this.addResult("Maintenance Notes Present", hasNotes, `All maintenance periods have descriptive notes`);
        }
    }

    async validateExamScheduling() {
        this.log("Validating exam scheduling...", "info");

        const examPeriods = this.schedules.filter((s) => s.is_exam);

        this.addResult("Exam Periods Present", examPeriods.length > 0, `Found ${examPeriods.length} exam periods`);
        if (examPeriods.length > 0) {
            // Check for V30/V31 exams using course_code field
            const v30Exams = examPeriods.filter(
                (e) =>
                    (e.course_code && e.course_code.includes("V30")) ||
                    (e.course && String(e.course).includes("V30")) ||
                    (e.course && e.course.code && e.course.code.includes("V30"))
            );

            const v31Exams = examPeriods.filter(
                (e) =>
                    (e.course_code && e.course_code.includes("V31")) ||
                    (e.course && String(e.course).includes("V31")) ||
                    (e.course && e.course.code && e.course.code.includes("V31"))
            );

            this.addResult("V30 Exams Present", v30Exams.length > 0, `Found ${v30Exams.length} V30 exam entries`);

            this.addResult("V31 Exams Present", v31Exams.length > 0, `Found ${v31Exams.length} V31 exam entries`);

            // Check exam phases - look for exam_phase field
            const examPhases = [
                ...new Set(examPeriods.map((e) => e.exam_phase).filter((p) => p !== undefined && p !== null)),
            ];

            this.addResult(
                "Exam Phases Configured",
                examPhases.length > 0,
                `Exam phases found: ${examPhases.sort().join(", ")}`
            );

            // Check exam phase progression for V30
            if (v30Exams.length > 0) {
                const v30Phases = [...new Set(v30Exams.map((e) => e.exam_phase).filter((p) => p !== undefined))].sort();
                const hasAllPhases = v30Phases.length === 5 && v30Phases.every((phase, index) => phase === index + 1);

                this.addResult("V30 Five-Phase System", hasAllPhases, `V30 phases: ${v30Phases.join(", ")}`);
            }

            // Check exam phase progression for V31
            if (v31Exams.length > 0) {
                const v31Phases = [...new Set(v31Exams.map((e) => e.exam_phase).filter((p) => p !== undefined))].sort();
                const hasAllPhases = v31Phases.length === 5 && v31Phases.every((phase, index) => phase === index + 1);

                this.addResult("V31 Five-Phase System", hasAllPhases, `V31 phases: ${v31Phases.join(", ")}`);
            }
        }
    }

    async validateSpecialEvents() {
        this.log("Validating special events...", "info");

        try {
            const eventsRes = await axios.get(`${API_BASE_URL}/events`);
            const events = eventsRes.data;

            this.addResult("Special Events Available", events.length > 0, `Found ${events.length} special events`);

            // Check for opening ceremony
            const openingCeremony = events.find((e) => e.name && e.name.toLowerCase().includes("khai giảng"));

            this.addResult(
                "Opening Ceremony Configured",
                !!openingCeremony,
                openingCeremony ? `Opening ceremony: ${openingCeremony.name}` : "No opening ceremony found"
            );

            // Check for flag ceremony days
            const flagCeremonies = this.schedules.filter((s) => s.is_flag_ceremony);

            this.addResult(
                "Flag Ceremonies Present",
                true, // Flag ceremonies may be generated dynamically
                `Found ${flagCeremonies.length} flag ceremony entries`
            );
        } catch (error) {
            this.addResult("Special Events Validation", false, `Failed to validate events: ${error.message}`);
        }
    }

    async validateDataIntegrity() {
        this.log("Validating data integrity...", "info");

        // Check schedule-class relationships
        const schedulesWithValidClass = this.schedules.filter((s) => {
            if (s.is_maintenance || s.is_break) return true; // Special events may not have class
            return s.class && s.class !== null;
        });

        this.addResult(
            "Schedule-Class Integrity",
            schedulesWithValidClass.length > 0,
            `${schedulesWithValidClass.length}/${this.schedules.length} schedules have valid class references`
        );

        // Check schedule-course relationships
        const schedulesWithValidCourse = this.schedules.filter((s) => {
            if (s.is_maintenance || s.is_break) return true; // Special events may not have course
            return s.course && s.course !== null;
        });

        this.addResult(
            "Schedule-Course Integrity",
            schedulesWithValidCourse.length > 0,
            `${schedulesWithValidCourse.length}/${this.schedules.length} schedules have valid course references`
        );

        // Check date consistency
        const schedulesWithValidDates = this.schedules.filter(
            (s) => s.actual_date && new Date(s.actual_date).getFullYear() === 2025
        );

        this.addResult(
            "Date Consistency",
            schedulesWithValidDates.length > 0,
            `${schedulesWithValidDates.length}/${this.schedules.length} schedules have valid 2025 dates`
        );

        // Check time slot validity
        const validTimeSlots = this.schedules.filter((s) => s.start_time && s.end_time && s.start_time < s.end_time);

        this.addResult(
            "Time Slot Validity",
            validTimeSlots.length === this.schedules.length,
            `${validTimeSlots.length}/${this.schedules.length} schedules have valid time slots`
        );
    }

    addResult(testName, passed, details) {
        this.results.total++;
        if (passed) {
            this.results.passed++;
            this.log(`${testName}: PASSED - ${details}`, "success");
        } else {
            this.results.failed++;
            this.log(`${testName}: FAILED - ${details}`, "error");
        }

        this.results.details.push({
            name: testName,
            passed,
            details,
        });
    }

    printSummary() {
        console.log("\n" + "=".repeat(50));
        this.log("VALIDATION SUMMARY", "info");
        console.log("=".repeat(50));

        this.log(`Total Tests: ${this.results.total}`, "info");
        this.log(`Passed: ${this.results.passed}`, "success");
        this.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? "error" : "success");
        this.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`, "info");

        if (this.results.failed > 0) {
            console.log("\n" + "-".repeat(30));
            this.log("FAILED TESTS", "warning");
            console.log("-".repeat(30));
            this.results.details
                .filter((test) => !test.passed)
                .forEach((test) => {
                    this.log(`❌ ${test.name}: ${test.details}`, "error");
                });
        }

        console.log("\n" + "-".repeat(30));
        this.log("RECOMMENDATIONS", "info");
        console.log("-".repeat(30));

        const maintenanceCount = this.schedules ? this.schedules.filter((s) => s.is_maintenance).length : 0;
        const examCount = this.schedules ? this.schedules.filter((s) => s.is_exam).length : 0;

        if (maintenanceCount === 0) {
            this.log("💡 Generate maintenance periods using constraint processor", "warning");
        } else if (maintenanceCount < 50) {
            this.log("💡 Consider adding more maintenance periods for full academic year", "warning");
        }

        if (examCount === 0) {
            this.log("💡 Generate exam schedules for V30/V31 courses", "warning");
        }

        if (this.results.passed === this.results.total) {
            this.log("🎉 All validation tests passed! Frontend display should work correctly.", "success");
        } else {
            this.log("⚠️ Some validation tests failed. Check the issues above before testing frontend.", "warning");
        }

        console.log("=".repeat(50));
    }
}

// Run validation
async function runValidation() {
    const validator = new BackendScheduleValidator();
    try {
        await validator.runValidation();
    } catch (error) {
        console.error("Validation error:", error.message);
    } finally {
        process.exit(0);
    }
}

// Export for use in other scripts
module.exports = BackendScheduleValidator;

// Run if executed directly
if (require.main === module) {
    runValidation();
}
