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
import { getCourses } from "../../api/courseService";
import { generateSchedule } from "../../api/scheduleService";
import { createEvent, getEvents } from "../../api/eventService";

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
    const [courseConfigs, setCourseConfigs] = useState([]);

    // Step 4: Constraints
    const [constraints, setConstraints] = useState([]);
    const [teachers, setTeachers] = useState([
        { id: 1, name: "Giảng viên A" },
        { id: 2, name: "Giảng viên B" },
        { id: 3, name: "Giảng viên C" },
    ]);
    const [balanceHoursBetweenClasses, setBalanceHoursBetweenClasses] = useState(true);
    const [avoidEmptySlots, setAvoidEmptySlots] = useState(true);
    const [prioritizeMorningClasses, setPrioritizeMorningClasses] = useState(true);
    const [selfStudyInAfternoon, setSelfStudyInAfternoon] = useState(true);

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
                            groupedClasses: null,
                            maxHoursPerWeek: course.max_hours_per_week || null,
                            maxHoursPerDay: course.max_hours_per_day || null,
                            minDaysBeforeExam: course.min_days_before_exam || 0,
                            examDuration: course.exam_duration || 0,
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

    const handleUpdateCourseConfig = (id, field, value) => {
        setCourseConfigs((prevConfigs) =>
            prevConfigs.map((config) => {
                return config.id === id ? { ...config, [field]: value } : config;
            })
        );
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
            });

            // Xử lý thông tin lớp ghép từ courseConfigs
            const classesMapping = {};
            classesForScheduling.forEach((cls) => {
                classesMapping[cls.id] = cls;
            });

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
                                    if (remainingHours <= 0) break;

                                    // Kiểm tra ràng buộc maxHoursPerDay và maxHoursPerWeek nếu có
                                    const hoursToSchedule = Math.min(remainingHours, course.maxHoursPerDay || 4, 3);

                                    if (hoursToSchedule > 0) {
                                        scheduleDetails.push({
                                            class_id: classId,
                                            course_id: course.id,
                                            day_of_week: day,
                                            week_number: week,
                                            start_time: slot.start,
                                            end_time: slot.end,
                                            is_practical: false,
                                            is_exam: false,
                                            is_self_study: false,
                                            special_event_id: null,
                                            notes: null,
                                        });

                                        remainingHours -= hoursToSchedule;
                                    }
                                }
                            }
                        }
                        week++;
                    }
                });
            });

            // Prepare schedule generation parameters
            const scheduleParams = {
                department_id: selectedDepartment,
                start_time: startDate.format("YYYY-MM-DD"),
                end_time: endDate.format("YYYY-MM-DD"),
                total_weeks: totalWeeks,
                events: eventsData.filter((event) => event.selected !== false),
                courses: courseConfigs.map((course) => ({
                    id: course.id,
                    total_hours: course.totalHours,
                    grouped_classes: course.groupedClasses,
                    max_hours_per_week: course.maxHoursPerWeek,
                    max_hours_per_day: course.maxHoursPerDay,
                    min_days_before_exam: course.minDaysBeforeExam,
                    exam_duration: course.examDuration,
                })),
                constraints: {
                    custom_constraints: constraints,
                    balance_hours: balanceHoursBetweenClasses,
                    avoid_empty_slots: avoidEmptySlots,
                    prioritize_morning: prioritizeMorningClasses,
                    self_study_afternoon: selfStudyInAfternoon,
                },
                schedule_details: scheduleDetails,
            };

            console.log("Generating schedule with params:", scheduleParams);

            // Call the API to generate the schedule
            await generateSchedule(scheduleParams);

            setSuccess(true);
        } catch (error) {
            console.error("Error generating schedule:", error);
            setError("Không thể tạo lịch học. Vui lòng thử lại sau.");
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
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h4" align="center" gutterBottom>
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
                        )}

                        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
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

                        <Box sx={{ mb: 2 }}>{getStepContent(activeStep)}</Box>

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
