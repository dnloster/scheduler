import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Box,
    Typography,
    Paper,
    Stepper,
    Step,
    StepLabel,
    Button,
    Alert,
    CircularProgress,
} from "@mui/material";
import dayjs from "dayjs";

// Import API services
import { getDepartments } from "../../api/departmentService";
import { getClasses } from "../../api/classService";
import { getCourses, updateCourse } from "../../api/courseService";
import { generateSchedule } from "../../api/scheduleService";
import { createEvent, getEvents } from "../../api/eventService";

// Import helpers
import { mapClassesById, findClassId, findCourseId } from "../../utils/objectIdHelper";

// Import enhanced helpers that can handle edge cases better
import enhancedHelper from "../../utils/enhancedObjectIdHelper";
import payloadHelper from "../../utils/payloadHelper";

// Import Step components
import Step1Department from "./steps/Step1DepartmentTime";
import Step2Events from "./steps/Step2SpecialEvents";
import Step3Courses from "./steps/Step3CourseConfig";
import Step4Constraints from "./steps/Step4Constraints";
import Step5Summary from "./steps/Step5Summary";

const ScheduleGenerator = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Step 1: Department and Date Range Selection
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [startDate, setStartDate] = useState(dayjs("2025-06-09"));
    const [endDate, setEndDate] = useState(dayjs("2025-11-14"));
    const [totalWeeks, setTotalWeeks] = useState(22);

    // Step 2: Special Events
    const [eventsData, setEventsData] = useState([]);
    const [customEvents, setCustomEvents] = useState([]);

    // Step 3: Course Config
    const [selectedCourseForConfig, setSelectedCourseForConfig] = useState(null);
    const [courseConfigs, setCourseConfigs] = useState([]); // Step 4: Constraints
    const [constraints, setConstraints] = useState([]);
    const [teachers] = useState([
        { id: 1, name: "Giảng viên A" },
        { id: 2, name: "Giảng viên B" },
        { id: 3, name: "Giảng viên C" },
    ]);
    const [balanceHoursBetweenClasses, setBalanceHoursBetweenClasses] = useState(true);
    const [avoidEmptySlots, setAvoidEmptySlots] = useState(true);
    const [prioritizeMorningClasses, setPrioritizeMorningClasses] = useState(true);
    const [selfStudyInAfternoon, setSelfStudyInAfternoon] = useState(false);

    // Data states
    const [departments, setDepartments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [isDataLoading, setIsDataLoading] = useState(false);
    const [dataError, setDataError] = useState(null);

    const steps = [
        "Chọn chuyên ngành và thời gian",
        "Cài đặt sự kiện đặc biệt",
        "Cấu hình môn học",
        "Ràng buộc bổ sung",
        "Tổng hợp và tạo lịch",
    ];

    // Fetch initial data (departments, courses, classes) from API
    useEffect(() => {
        const fetchData = async () => {
            setIsDataLoading(true);
            setDataError(null);

            try {
                // Fetch departments data
                const departmentsData = await getDepartments();
                if (departmentsData && departmentsData.length > 0) {
                    setDepartments(departmentsData);
                    setSelectedDepartment(departmentsData[0]._id);
                } else {
                    // Fallback to sample data
                    setDepartments([{ id: 1, name: "Sơ cấp báo vụ" }]);
                }

                // Fetch classes data
                const classesData = await getClasses();
                if (classesData && classesData.length > 0) {
                    setClasses(classesData);
                } else {
                    // Fallback to sample data
                    setClasses([
                        { id: 1, name: "A" },
                        { id: 2, name: "B" },
                        { id: 3, name: "C" },
                        { id: 4, name: "D" },
                        { id: 5, name: "E" },
                        { id: 6, name: "F" },
                    ]);
                }

                // Fetch courses data
                const coursesData = await getCourses();
                if (coursesData && coursesData.length > 0) {
                    setCourses(coursesData);

                    // Set course configurations based on the courses data
                    const initialCourseConfigs = coursesData.map((course, index) => {
                        return {
                            id: course.id || course._id || `course_${index}`,
                            code: course.code,
                            name: course.name,
                            parent_course: course.parent_course || null,
                            totalHours: course.total_hours || 0,
                            theory_hours: course.theory_hours || 0,
                            practical_hours: course.practical_hours || 0,
                            groupedClasses: null,
                            maxHoursPerWeek: course.max_hours_per_week || null,
                            maxHoursPerDay: course.max_hours_per_day || null,
                            maxMorningHours: course.max_morning_hours || null,
                            maxAfternoonHours: course.max_afternoon_hours || null,
                            minDaysBeforeExam: course.min_days_before_exam || 0,
                            examDuration: course.exam_duration || 0,
                            hasPracticalComponent: course.hasPracticalComponent || false,
                        };
                    });

                    setCourseConfigs(initialCourseConfigs);
                }

                // Fetch events
                const events = await getEvents();
                setEventsData(events || []);
            } catch (error) {
                console.error("Error fetching initial data:", error);
                setDataError("Không thể tải dữ liệu. Đang sử dụng dữ liệu mẫu.");
            } finally {
                setIsDataLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter events based on selected department
    const filteredEvents = React.useMemo(() => {
        if (!eventsData || eventsData.length === 0) return [];

        return eventsData.filter((event) => {
            return !event.department || event.department === selectedDepartment;
        });
    }, [eventsData, selectedDepartment]);

    // Handle constraint management
    const handleAddConstraint = (type) => {
        let newConstraint = { id: Date.now(), type };

        switch (type) {
            case "time":
                newConstraint.subtype = "preferred_days";
                newConstraint.value = [];
                break;
            case "class":
                newConstraint.subtype = "sequential_classes";
                newConstraint.classes = [];
                break;
            case "teacher":
                newConstraint.subtype = "preferred_days";
                newConstraint.teacher = teachers[0]?.id || 1;
                newConstraint.value = [];
                break;
            default:
                break;
        }

        setConstraints([...constraints, newConstraint]);
    };

    const handleUpdateConstraint = (index, field, value) => {
        const updatedConstraints = [...constraints];
        updatedConstraints[index] = {
            ...updatedConstraints[index],
            [field]: value,
        };
        setConstraints(updatedConstraints);
    };

    const handleRemoveConstraint = (index) => {
        setConstraints(constraints.filter((_, i) => i !== index));
    };

    // Define selected classes for constraints
    const selectedClasses = React.useMemo(() => {
        return classes.filter((cls) => {
            return cls.department_id === selectedDepartment || cls.departmentId === selectedDepartment;
        });
    }, [classes, selectedDepartment]);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
        setSuccess(false);
    };

    const handleAddCustomEvent = (eventData) => {
        setCustomEvents([...customEvents, eventData]);
    };

    const handleRemoveCustomEvent = (id) => {
        setCustomEvents(customEvents.filter((event) => event.id !== id));
    };
    const handleUpdateCourseConfig = async (id, field, value) => {
        // Update local state immediately for responsive UI
        setCourseConfigs((prevConfigs) =>
            prevConfigs.map((config) => {
                return config.id === id ? { ...config, [field]: value } : config;
            })
        );

        // Save to database if it's a constraint field
        const constraintFields = [
            "maxHoursPerWeek",
            "maxHoursPerDay",
            "maxMorningHours",
            "maxAfternoonHours",
            "minDaysBeforeExam",
            "examDuration",
            "totalHours",
            "theory_hours",
            "practical_hours",
        ];

        if (constraintFields.includes(field)) {
            try {
                // Map frontend field names to backend field names
                const fieldMapping = {
                    maxHoursPerWeek: "max_hours_per_week",
                    maxHoursPerDay: "max_hours_per_day",
                    maxMorningHours: "max_morning_hours",
                    maxAfternoonHours: "max_afternoon_hours",
                    minDaysBeforeExam: "min_days_before_exam",
                    examDuration: "exam_duration",
                    totalHours: "total_hours",
                };

                const backendField = fieldMapping[field] || field;
                const updateData = { [backendField]: value };

                await updateCourse(id, updateData);
                console.log(`Saved ${field} = ${value} for course ${id}`);
            } catch (error) {
                console.error("Failed to save course configuration:", error);
                // Optionally show user notification about save failure
            }
        }
    };

    const handleGenerateSchedule = async () => {
        setLoading(true);
        setError(null);

        try {
            // Create any custom events first
            const eventPromises = customEvents.map((event) =>
                createEvent({
                    name: event.name,
                    description: "Custom event",
                    date: event.date.format("YYYY-MM-DD"),
                    duration_days: event.duration,
                })
            );

            if (eventPromises.length > 0) {
                await Promise.all(eventPromises);
            }

            // Define time slots for scheduling
            const timeSlots = [
                { start: "07:30:00", end: "09:00:00", label: "Tiết 1-2" },
                { start: "09:10:00", end: "10:40:00", label: "Tiết 3-4" },
                { start: "10:50:00", end: "12:20:00", label: "Tiết 5-6" },
                { start: "13:30:00", end: "15:00:00", label: "Tiết 7-8" },
                { start: "15:10:00", end: "16:40:00", label: "Tiết 9-10" },
            ];

            // Prepare detailed class schedules
            const classesForScheduling = classes.filter((cls) => {
                return cls.departmentId === selectedDepartment || cls.department_id === selectedDepartment;
            }); // Xử lý thông tin lớp ghép từ courseConfigs và map MongoDB IDs
            const classesMapping = mapClassesById(classesForScheduling);

            // Tạo các mục lịch học chi tiết dựa trên thông tin đã cung cấp
            const scheduleDetails = [];

            // Tạo lịch học cho mỗi môn học
            courseConfigs.forEach((course) => {
                // Xử lý lớp ghép nếu có
                const groupedClassesList = [];
                if (course.groupedClasses) {
                    const groups = course.groupedClasses.split("|");
                    groups.forEach((group) => {
                        const classIds = group
                            .split(",")
                            .map((id) => parseInt(id.trim()))
                            .filter((id) => !isNaN(id));
                        if (classIds.length > 0) {
                            groupedClassesList.push(classIds);
                        }
                    });
                }

                // Nếu không có thông tin lớp ghép, sử dụng tất cả lớp của chuyên ngành
                if (groupedClassesList.length === 0) {
                    groupedClassesList.push(classesForScheduling.map((cls) => cls.id));
                }

                // Phân bổ giờ học vào các ngày và lớp học
                groupedClassesList.forEach((classGroup) => {
                    // Số tiết cần phân bổ cho mỗi lớp/nhóm lớp
                    let remainingHours = course.totalHours;
                    const daysOfWeek = [1, 2, 3, 4, 5]; // thứ 2 - thứ 6
                    let week = 1;

                    while (remainingHours > 0 && week <= totalWeeks) {
                        for (const day of daysOfWeek) {
                            if (remainingHours <= 0) break;

                            // Ưu tiên buổi sáng nếu được chọn
                            let preferredTimeSlots = [...timeSlots];
                            if (prioritizeMorningClasses) {
                                preferredTimeSlots.sort((a, b) => {
                                    const aHour = parseInt(a.start.split(":")[0]);
                                    const bHour = parseInt(b.start.split(":")[0]);
                                    return aHour - bHour;
                                });
                            }

                            // Thêm yêu cầu lịch học
                            for (const classId of classGroup) {
                                if (remainingHours <= 0) break;

                                // Chọn time slot phù hợp theo ưu tiên
                                for (const slot of preferredTimeSlots) {
                                    if (remainingHours <= 0) break; // Kiểm tra ràng buộc maxHoursPerDay và maxHoursPerWeek nếu có
                                    const hoursToSchedule = Math.min(remainingHours, course.maxHoursPerDay || 4, 3);
                                    if (hoursToSchedule > 0) {
                                        // Get valid MongoDB ObjectIDs using our enhanced helper functions
                                        let validClassId = findClassId(classesMapping[classId] || classId, classes);

                                        let validCourseId = findCourseId(course, courses);

                                        // Additional debug logging for ID resolution
                                        if (!validClassId) {
                                            console.warn(
                                                `Unable to resolve valid class_id from: ${classId}, trying additional methods...`
                                            );
                                            // Try using class name if available
                                            const className = classesMapping[classId]
                                                ? classesMapping[classId].name
                                                : null;
                                            if (className) {
                                                validClassId = findClassId({ name: className }, classes);
                                                if (validClassId) {
                                                    console.log(
                                                        `Successfully resolved class ID using name: ${className} -> ${validClassId}`
                                                    );
                                                }
                                            }

                                            // Last resort - direct search in classes array
                                            if (!validClassId) {
                                                for (const cls of classes) {
                                                    if (cls.id === classId || String(cls.id) === String(classId)) {
                                                        validClassId = findClassId(cls, classes);
                                                        if (validClassId) {
                                                            console.log(
                                                                `Found class by direct ID match: ${classId} -> ${validClassId}`
                                                            );
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                        }

                                        if (!validCourseId) {
                                            console.warn(
                                                `Unable to resolve valid course_id from: ${JSON.stringify(
                                                    course
                                                )}, trying additional methods...`
                                            );

                                            // Try direct lookup by known attributes
                                            if (course.code) {
                                                validCourseId = findCourseId(course.code, courses);
                                                if (validCourseId) {
                                                    console.log(
                                                        `Found course by code: ${course.code} -> ${validCourseId}`
                                                    );
                                                }
                                            }

                                            if (!validCourseId && course.name) {
                                                validCourseId = findCourseId(course.name, courses);
                                                if (validCourseId) {
                                                    console.log(
                                                        `Found course by name: ${course.name} -> ${validCourseId}`
                                                    );
                                                }
                                            }

                                            // Last resort - direct search in courses array
                                            if (!validCourseId) {
                                                for (const c of courses) {
                                                    if (c.id === course.id || String(c.id) === String(course.id)) {
                                                        validCourseId = findCourseId(c, courses);
                                                        if (validCourseId) {
                                                            console.log(
                                                                `Found course by direct ID match: ${course.id} -> ${validCourseId}`
                                                            );
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                        }

                                        // Log IDs for debugging
                                        console.log(`Using class_id: ${validClassId}, course_id: ${validCourseId}`);

                                        scheduleDetails.push({
                                            class_id: validClassId,
                                            course_id: validCourseId,
                                            day_of_week: day,
                                            week_number: week,
                                            start_time: slot.start,
                                            end_time: slot.end,
                                            is_practical: course.hasPracticalComponent || false,
                                            is_exam: false,
                                            is_self_study: false,
                                            special_event_id: null,
                                            notes: `Auto-scheduled: ${course.code} - ${course.name}`,
                                        });

                                        remainingHours -= hoursToSchedule;
                                    }
                                }
                            }
                        }
                        week++;
                    }
                });
            }); // Prepare schedule generation parameters
            let scheduleParams = {
                department_id: selectedDepartment,
                start_date: startDate.format("YYYY-MM-DD"),
                end_date: endDate.format("YYYY-MM-DD"),
                total_weeks: totalWeeks,
                events: eventsData.filter((event) => event.selected !== false),
                courses: courseConfigs.map((course) => ({
                    id: course.id,
                    total_hours: course.totalHours,
                    grouped_classes: course.groupedClasses,
                    max_hours_per_week: course.maxHoursPerWeek,
                    max_hours_per_day: course.maxHoursPerDay,
                    max_morning_hours: course.maxMorningHours,
                    max_afternoon_hours: course.maxAfternoonHours,
                    min_days_before_exam: course.minDaysBeforeExam,
                    exam_duration: course.examDuration,
                    is_practical: course.hasPracticalComponent || false,
                })),
                constraints: {
                    custom_constraints: constraints,
                    balance_hours: balanceHoursBetweenClasses,
                    avoid_empty_slots: avoidEmptySlots,
                    prioritize_morning: prioritizeMorningClasses,
                    self_study_afternoon: selfStudyInAfternoon,
                },
                schedule_details: scheduleDetails,
            }; // Validate the schedule details before sending            // Save reference to original details for emergency repair if needed
            const originalDetailCount = scheduleParams.schedule_details.length;

            console.log(`Pre-validation: Schedule has ${originalDetailCount} entries`);

            // Log sample of what we're sending for validation
            if (scheduleParams.schedule_details.length > 0) {
                console.log(
                    "Sample schedule entry before validation:",
                    JSON.stringify(scheduleParams.schedule_details[0])
                );
            }

            // First try with enhanced helper with lenient mode
            scheduleParams.schedule_details = enhancedHelper.validateScheduleDetails(
                scheduleParams.schedule_details,
                classes,
                courses,
                { lenientMode: true, debug: true }
            );

            let validatedDetailCount = scheduleParams.schedule_details.length;
            console.log(
                `Schedule validation: ${originalDetailCount} original entries, ${validatedDetailCount} valid entries`
            ); // If validation resulted in zero valid entries, try emergency repair
            if (scheduleParams.schedule_details.length === 0) {
                console.warn("🚨 ACTIVATING EMERGENCY REPAIR MODE - All schedule details were invalid!");

                // Try the repair in stages with multiple fallbacks

                // Step 1: Try to repair the original schedule details if they exist
                if (scheduleDetails && scheduleDetails.length > 0) {
                    console.log(`Emergency repair working with ${scheduleDetails.length} original entries`);

                    scheduleParams.schedule_details = enhancedHelper.emergencyRepairSchedule(
                        scheduleDetails,
                        classes,
                        courses
                    );
                }
                // Step 2: If we still don't have valid entries or original details were also empty
                if (scheduleParams.schedule_details.length === 0) {
                    console.warn("⚠️ Emergency repair couldn't fix existing entries, creating basic schedule");

                    scheduleParams.schedule_details = enhancedHelper.createBasicSchedule(classes, courses, {
                        weeks: totalWeeks,
                    });
                }

                validatedDetailCount = scheduleParams.schedule_details.length;
                console.log(`After emergency repair: ${validatedDetailCount} valid entries`);

                // If still no valid entries, throw error
                if (scheduleParams.schedule_details.length === 0) {
                    throw new Error(
                        "No valid schedule entries could be created. Please check class and course configurations."
                    );
                } else {
                    console.log("Schedule saved using emergency repair mode!");
                }
            }

            if (validatedDetailCount < originalDetailCount) {
                console.warn(
                    `WARNING: ${
                        originalDetailCount - validatedDetailCount
                    } schedule entries were removed during validation`
                );
            }

            // Print detailed validation stats
            console.log(
                `Valid schedule entries: ${validatedDetailCount}/${originalDetailCount} (${Math.round(
                    (validatedDetailCount / originalDetailCount) * 100
                )}%)`
            ); // Call the API to generate the schedule
            console.log("Sending schedule parameters:", {
                department_id: scheduleParams.department_id,
                start_date: scheduleParams.start_date,
                end_date: scheduleParams.end_date,
                total_weeks: scheduleParams.total_weeks,
                schedule_count: scheduleParams.schedule_details.length,
            }); // Check the size of the payload to avoid "Payload Too Large" errors
            const payloadStatus = payloadHelper.checkPayloadSize(scheduleParams);
            console.log(`Payload size: ${payloadStatus.formattedSize}`);

            // If payload is too large, we need to optimize it
            if (payloadStatus.isLarge) {
                console.warn(`⚠️ Payload is large (${payloadStatus.formattedSize}). Attempting to optimize...`);

                // Use our payload optimizer to reduce the size
                const originalSize = scheduleParams.schedule_details.length;
                scheduleParams = payloadHelper.optimizeSchedulePayload(scheduleParams);

                if (scheduleParams.payload_limited) {
                    console.warn(
                        `Payload was optimized and limited. Original: ${originalSize} entries, Optimized: ${scheduleParams.schedule_details.length} entries`
                    );
                    setError(
                        `Lịch được tạo với dữ liệu rút gọn do kích thước quá lớn. Chỉ ${scheduleParams.schedule_details.length}/${originalSize} mục được gửi đi.`
                    );
                }
            }

            // Show sample entries for debugging
            console.log(
                "Sample schedule details:",
                scheduleParams.schedule_details.slice(0, 3).map((detail) => ({
                    class: detail.class_id,
                    course: detail.course_id,
                    day: detail.day_of_week,
                    week: detail.week_number,
                    time: `${detail.start_time}-${detail.end_time}`,
                }))
            );

            const result = await generateSchedule(scheduleParams);
            console.log("Schedule generation result:", result);

            setSuccess(true);

            // Delay before redirecting to allow the user to see the success message
            setTimeout(() => {
                // Navigate to the schedule view page
                navigate("/schedule");
            }, 2000);
        } catch (error) {
            console.error("Error generating schedule:", error);
            let errorMessage;

            // Improved error handling with more specific messages
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                errorMessage =
                    error.response.data?.error ||
                    error.response.data?.message ||
                    `Server error: ${error.response.status}`;
                console.error("Server error details:", error.response.data);
            } else if (error.request) {
                // The request was made but no response was received
                errorMessage = "Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối.";
                console.error("No response received:", error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                errorMessage = error.message || "Lỗi không xác định";
                console.error("Request setup error:", error.message);
            }

            setError(`Không thể tạo lịch học: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Step1Department
                        selectedDepartment={selectedDepartment}
                        setSelectedDepartment={setSelectedDepartment}
                        startDate={startDate}
                        setStartDate={setStartDate}
                        endDate={endDate}
                        setEndDate={setEndDate}
                        totalWeeks={totalWeeks}
                        setTotalWeeks={setTotalWeeks}
                        departments={departments}
                        classes={classes}
                        courses={courses}
                        formatDate={(date) => dayjs(date).format("DD/MM/YYYY")}
                    />
                );
            case 1:
                return (
                    <Step2Events
                        filteredEvents={filteredEvents}
                        eventsData={eventsData}
                        setEventsData={setEventsData}
                        customEvents={customEvents}
                        handleAddCustomEvent={handleAddCustomEvent}
                        handleRemoveCustomEvent={handleRemoveCustomEvent}
                        formatDate={(date) => dayjs(date).format("DD/MM/YYYY")}
                    />
                );
            case 2:
                return (
                    <Step3Courses
                        courseConfigs={courseConfigs}
                        selectedCourseForConfig={selectedCourseForConfig}
                        setSelectedCourseForConfig={setSelectedCourseForConfig}
                        handleUpdateCourseConfig={handleUpdateCourseConfig}
                    />
                );
            case 3:
                return (
                    <Step4Constraints
                        constraints={constraints}
                        handleAddConstraint={handleAddConstraint}
                        handleUpdateConstraint={handleUpdateConstraint}
                        handleRemoveConstraint={handleRemoveConstraint}
                        selectedClasses={selectedClasses}
                        teachers={teachers}
                        balanceHoursBetweenClasses={balanceHoursBetweenClasses}
                        setBalanceHoursBetweenClasses={setBalanceHoursBetweenClasses}
                        avoidEmptySlots={avoidEmptySlots}
                        setAvoidEmptySlots={setAvoidEmptySlots}
                        prioritizeMorningClasses={prioritizeMorningClasses}
                        setPrioritizeMorningClasses={setPrioritizeMorningClasses}
                        selfStudyInAfternoon={selfStudyInAfternoon}
                        setSelfStudyInAfternoon={setSelfStudyInAfternoon}
                    />
                );
            case 4:
                return (
                    <Step5Summary
                        departments={departments}
                        selectedDepartment={selectedDepartment}
                        startDate={startDate}
                        endDate={endDate}
                        totalWeeks={totalWeeks}
                        eventsData={eventsData}
                        customEvents={customEvents}
                        courseConfigs={courseConfigs}
                        loading={loading}
                        success={success}
                        handleGenerateSchedule={handleGenerateSchedule}
                        handleReset={handleReset}
                        navigate={navigate}
                        formatDate={(date) => dayjs(date).format("DD/MM/YYYY")}
                    />
                );
            default:
                return "Unknown step";
        }
    };
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }} data-intro="schedule-generator-main">
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h4" align="center" gutterBottom data-intro="schedule-generator-title">
                    Tạo lịch học
                </Typography>

                {isDataLoading ? (
                    <Box display="flex" justifyContent="center" my={4}>
                        <CircularProgress />
                        <Typography sx={{ ml: 2 }}>Đang tải dữ liệu...</Typography>
                    </Box>
                ) : (
                    <>
                        {dataError && (
                            <Alert severity="warning" sx={{ mb: 3 }}>
                                {dataError}
                            </Alert>
                        )}{" "}
                        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }} data-intro="schedule-steps">
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}
                        <Box sx={{ mb: 2 }} data-intro="schedule-config">
                            {getStepContent(activeStep)}
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                            {activeStep !== 0 && (
                                <Button onClick={handleBack} sx={{ mr: 1 }}>
                                    Quay lại
                                </Button>
                            )}

                            {activeStep < steps.length - 1 && (
                                <Button variant="contained" onClick={handleNext}>
                                    Tiếp theo
                                </Button>
                            )}
                        </Box>
                    </>
                )}
            </Paper>
        </Container>
    );
};

export default ScheduleGenerator;
