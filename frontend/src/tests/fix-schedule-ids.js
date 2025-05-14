// filepath: d:\congviec\sang_kien\2025\scheduler\frontend\src\tests\fix-schedule-ids.js

import React from "react";
import axios from "axios";
import enhancedHelper from "../utils/enhancedObjectIdHelper";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

/**
 * Utility to diagnose and fix schedule ID issues
 * This tool will:
 * 1. Fetch all necessary data from API
 * 2. Analyze ID formats and relationships
 * 3. Check if schedule entries can be validated
 * 4. Apply fixes where needed
 */

async function diagnoseAndFixScheduleIssues() {
    try {
        console.log("🔍 SCHEDULE ID DIAGNOSIS TOOL");
        console.log("-----------------------------");

        // 1. Fetch data
        console.log("Fetching data from API...");
        const [departmentsRes, classesRes, coursesRes, schedulesRes] = await Promise.all([
            axios.get(`${API_BASE_URL}/departments`),
            axios.get(`${API_BASE_URL}/classes`),
            axios.get(`${API_BASE_URL}/courses`),
            axios.get(`${API_BASE_URL}/schedules`),
        ]);

        const departments = departmentsRes.data;
        const classes = classesRes.data;
        const courses = coursesRes.data;
        const schedules = schedulesRes.data;

        console.log(
            `Found: ${departments.length} departments, ${classes.length} classes, ${courses.length} courses, ${schedules.length} schedules`
        );

        // 2. Analyze ID formats
        analyzeIdFormats(classes, "Classes");
        analyzeIdFormats(courses, "Courses");
        if (schedules.length > 0) {
            analyzeIdFormats(schedules, "Schedules");
        }

        // 3. Check schedule details if any schedules exist
        if (schedules.length > 0 && schedules[0].schedule_details) {
            const scheduleDetails = schedules[0].schedule_details;
            console.log(`\nAnalyzing schedule details from first schedule (${scheduleDetails.length} entries):`);

            // Test validation with standard approach
            const validatedDetails = enhancedHelper.validateScheduleDetails(scheduleDetails, classes, courses, {
                debug: true,
            });

            console.log(
                `Standard validation result: ${validatedDetails.length}/${scheduleDetails.length} valid entries`
            );

            // Test validation with lenient mode
            const lenientValidatedDetails = enhancedHelper.validateScheduleDetails(scheduleDetails, classes, courses, {
                lenientMode: true,
                debug: true,
            });

            console.log(
                `Lenient validation result: ${lenientValidatedDetails.length}/${scheduleDetails.length} valid entries`
            );

            // Check if there's a reference issue by checking if IDs in schedule actually exist in classes and courses
            checkReferenceIntegrity(scheduleDetails, classes, courses);
        } else {
            console.log("\nNo schedule details found to analyze.");
        }

        // 4. Test emergency repair function
        if (schedules.length > 0 && schedules[0].schedule_details) {
            const scheduleDetails = schedules[0].schedule_details;
            console.log("\n🚨 Testing emergency repair function:");

            const repairedDetails = enhancedHelper.emergencyRepairSchedule(scheduleDetails, classes, courses);

            console.log(`Emergency repair result: ${repairedDetails.length} entries`);

            if (repairedDetails.length > 0) {
                console.log("Sample repaired details:", repairedDetails.slice(0, 2));
            }
        }

        // 5. Suggest fixes
        console.log("\n💡 RECOMMENDATIONS:");

        if (classes.some((c) => !c._id || !isValidMongoId(c._id))) {
            console.log("- Classes need proper MongoDB ObjectIDs");
        }

        if (courses.some((c) => !c._id || !isValidMongoId(c._id))) {
            console.log("- Courses need proper MongoDB ObjectIDs");
        }

        if (schedules.length > 0 && schedules[0].schedule_details) {
            const scheduleDetails = schedules[0].schedule_details;

            if (scheduleDetails.some((d) => !d.class_id || !d.course_id)) {
                console.log("- Some schedule details are missing class_id or course_id");
            }

            if (
                scheduleDetails.some((d) => d.class_id && !isValidMongoId(d.class_id)) ||
                scheduleDetails.some((d) => d.course_id && !isValidMongoId(d.course_id))
            ) {
                console.log("- Some schedule details have non-MongoDB ObjectID references");
            }
        }

        console.log("\n✅ FINAL SOLUTION:");
        console.log("Use the enhancedObjectIdHelper.js module with emergency repair feature when needed");
        console.log("The system will now accept numeric IDs in lenient mode when ObjectIDs are not available");
    } catch (error) {
        console.error("Error during diagnosis:", error);
    }
}

// Helper functions

function analyzeIdFormats(items, label) {
    if (!items || !Array.isArray(items) || items.length === 0) return;

    const idTypes = {};
    const idFormats = {};

    items.forEach((item, i) => {
        if (i < 5) {
            // Only check first 5 items
            if (item._id) {
                const type = typeof item._id;
                idTypes[`_id:${type}`] = (idTypes[`_id:${type}`] || 0) + 1;

                if (type === "string") {
                    if (isValidMongoId(item._id)) {
                        idFormats["_id:mongodb"] = (idFormats["_id:mongodb"] || 0) + 1;
                    } else {
                        idFormats["_id:other_string"] = (idFormats["_id:other_string"] || 0) + 1;
                    }
                }
            }

            if (item.id) {
                const type = typeof item.id;
                idTypes[`id:${type}`] = (idTypes[`id:${type}`] || 0) + 1;

                if (type === "string") {
                    if (isValidMongoId(item.id)) {
                        idFormats["id:mongodb"] = (idFormats["id:mongodb"] || 0) + 1;
                    } else if (!isNaN(Number(item.id))) {
                        idFormats["id:numeric_string"] = (idFormats["id:numeric_string"] || 0) + 1;
                    } else {
                        idFormats["id:other_string"] = (idFormats["id:other_string"] || 0) + 1;
                    }
                } else if (type === "number") {
                    idFormats["id:number"] = (idFormats["id:number"] || 0) + 1;
                }
            }
        }
    });

    console.log(`\n${label} ID Analysis (first 5 items):`);
    console.log("ID Types:", idTypes);
    console.log("ID Formats:", idFormats);
    console.log("Sample:", items[0]?._id, items[0]?.id);
}

function isValidMongoId(id) {
    if (!id || typeof id !== "string") return false;
    return /^[0-9a-fA-F]{24}$/.test(id);
}

function checkReferenceIntegrity(scheduleDetails, classes, courses) {
    const classIds = new Set(classes.map((c) => c._id));
    const courseIds = new Set(courses.map((c) => c._id));

    // Add numeric IDs as strings for comparison
    classes.forEach((c) => {
        if (c.id !== undefined) classIds.add(String(c.id));
    });

    courses.forEach((c) => {
        if (c.id !== undefined) courseIds.add(String(c.id));
    });

    let missingClassRefs = 0;
    let missingCourseRefs = 0;

    scheduleDetails.forEach((detail, i) => {
        if (i < 20) {
            // Only check first 20 for brevity
            if (detail.class_id && !classIds.has(detail.class_id) && !classIds.has(String(detail.class_id))) {
                missingClassRefs++;
                if (missingClassRefs <= 3) {
                    console.log(`Reference issue: class_id ${detail.class_id} not found in classes`);
                }
            }

            if (detail.course_id && !courseIds.has(detail.course_id) && !courseIds.has(String(detail.course_id))) {
                missingCourseRefs++;
                if (missingCourseRefs <= 3) {
                    console.log(`Reference issue: course_id ${detail.course_id} not found in courses`);
                }
            }
        }
    });

    console.log(
        `Reference check: ${missingClassRefs} missing class references, ${missingCourseRefs} missing course references (first 20 entries)`
    );
}

// Run the diagnosis
diagnoseAndFixScheduleIssues();
