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
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    FormControlLabel,
    Checkbox,
    Divider,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Card,
    CardHeader,
    Tooltip,
    IconButton,
    CardContent,
    Autocomplete,
    Chip,
    AlertTitle,
    InputAdornment,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import {
    ExpandMore as ExpandMoreIcon,
    School as SchoolIcon,
    Event as EventIcon,
    Check as CheckIcon,
    Help as HelpIcon,
    Warning as WarningIcon,
    Search as SearchIcon,
    Add as AddIcon,
    Clear as ClearIcon,
    Refresh as RefreshIcon,
    InfoOutlined as InfoOutlinedIcon,
    FormatListBulleted as FormatListBulletedIcon,
    SearchOff as SearchOffIcon,
    AccessTime as AccessTimeIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    TipsAndUpdates as TipsAndUpdatesIcon,
    AddCircle as AddCircleIcon,
    Class as ClassIcon,
} from "@mui/icons-material";

// Import API services
import { getDepartments } from "../../api/departmentService";
import { getClasses } from "../../api/classService";
import { getCourses } from "../../api/courseService";
import { generateSchedule } from "../../api/scheduleService";
import { createEvent, getEvents } from "../../api/eventService";

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

    // Filter states for Step 1
    const [departmentFilter, setDepartmentFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCourses, setSelectedCourses] = useState([]);

    // For Step 3 constraints
    const [constraints, setConstraints] = useState([]);
    const [teachers, setTeachers] = useState([
        { id: 1, name: "Giảng viên A" },
        { id: 2, name: "Giảng viên B" },
        { id: 3, name: "Giảng viên C" },
    ]);

    // Step 2: Special Events and Constraints
    const [flagRaising, setFlagRaising] = useState(true);
    const [thursdayMaintenance, setThursdayMaintenance] = useState(true);

    // Special events with dates
    const [nationalHoliday, setNationalHoliday] = useState(true);
    const [nationalHolidayDate, setNationalHolidayDate] = useState(dayjs("2025-09-02"));

    const [openingCeremony, setOpeningCeremony] = useState(true);
    const [openingCeremonyDate, setOpeningCeremonyDate] = useState(dayjs("2025-09-15"));

    const [staffTraining, setStaffTraining] = useState(true);
    const [staffTrainingDate, setStaffTrainingDate] = useState(dayjs("2025-08-05"));
    const [staffTrainingDuration, setStaffTrainingDuration] = useState(3);

    const [teacherDay, setTeacherDay] = useState(true);
    const [teacherDayDate, setTeacherDayDate] = useState(dayjs("2025-11-20"));

    const [customEvents, setCustomEvents] = useState([]);
    const [newEventName, setNewEventName] = useState("");
    const [newEventDate, setNewEventDate] = useState(null);
    const [newEventDuration, setNewEventDuration] = useState(1);
    const [eventsData, setEventsData] = useState([]); // State to store fetched events

    // Data states
    const [departments, setDepartments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [isDataLoading, setIsDataLoading] = useState(false);
    const [dataError, setDataError] = useState(null);

    // Step 3: Course Configuration
    const [courseConfigs, setCourseConfigs] = useState([
        // Sample data until real data is loaded
        {
            id: 1,
            code: "A10",
            name: "Môn A10",
            totalHours: 160,
            groupedClasses: "1,2|3,4|5,6",
            maxHoursPerWeek: 10,
            maxHoursPerDay: 4,
            minDaysBeforeExam: 5,
            examDuration: 3,
        },
        {
            id: 2,
            code: "Q10",
            name: "Môn Q10",
            totalHours: 100,
            groupedClasses: null,
            maxHoursPerWeek: null,
            maxHoursPerDay: null,
            minDaysBeforeExam: 2,
            examDuration: 6,
        },
        {
            id: 3,
            code: "V30",
            name: "Môn V30",
            totalHours: 240,
            groupedClasses: null,
            maxHoursPerWeek: null,
            maxHoursPerDay: null,
            minDaysBeforeExam: 0,
            examDuration: 0,
        },
    ]);

    // Step 4: Additional Constraints
    const [balanceHoursBetweenClasses, setBalanceHoursBetweenClasses] = useState(true);
    const [avoidEmptySlots, setAvoidEmptySlots] = useState(true);
    const [prioritizeMorningClasses, setPrioritizeMorningClasses] = useState(true);
    const [selfStudyInAfternoon, setSelfStudyInAfternoon] = useState(true);

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
                        console.log(`Mapping course: ${course.name} with ID: ${course.id || course._id}`);
                        return {
                            id: course.id || course._id || `course_${index}`, // Đảm bảo ID luôn có giá trị duy nhất
                            code: course.code,
                            name: course.name,
                            totalHours: course.total_hours || 0,
                            groupedClasses: null,
                            maxHoursPerWeek: course.max_hours_per_week || null,
                            maxHoursPerDay: course.max_hours_per_day || null,
                            minDaysBeforeExam: course.min_days_before_exam || 0,
                            examDuration: course.exam_duration || 0,
                        };
                    });

                    console.log("Initialized course configs:", initialCourseConfigs);
                    setCourseConfigs(initialCourseConfigs);
                }
            } catch (error) {
                console.error("Error fetching initial data:", error);
                setDataError("Không thể tải dữ liệu. Đang sử dụng dữ liệu mẫu.");
            } finally {
                setIsDataLoading(false);
            }
        };

        fetchData();
    }, []);

    // Reset selected courses when department filter changes
    useEffect(() => {
        setSelectedCourses([]);
    }, [departmentFilter]);

    // Fetch events data from the API
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const events = await getEvents();
                setEventsData(events);
                console.log("Fetched events:", events);
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };

        fetchEvents();
    }, []);

    // Filter events based on selected department
    const filteredEvents = React.useMemo(() => {
        if (!eventsData || eventsData.length === 0) return [];

        return eventsData.filter((event) => {
            // Include events with matching department or department-independent events (like national holidays)
            return !event.department || event.department === selectedDepartment; // Always include holidays
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
            // Filter classes based on selected department
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

    // Format date for display
    const formatDate = (date) => {
        if (!date) return "";
        return dayjs(date).format("DD/MM/YYYY");
    };

    const handleAddCustomEvent = () => {
        if (newEventName && newEventDate) {
            setCustomEvents([
                ...customEvents,
                {
                    id: Date.now(),
                    name: newEventName,
                    date: newEventDate,
                    duration: newEventDuration,
                },
            ]);
            setNewEventName("");
            setNewEventDate(null);
            setNewEventDuration(1);
        }
    };

    const handleRemoveCustomEvent = (id) => {
        setCustomEvents(customEvents.filter((event) => event.id !== id));
    };

    const handleUpdateCourseConfig = (id, field, value) => {
        setCourseConfigs((prevConfigs) =>
            prevConfigs.map((config) => {
                console.log(`Course ID: ${config.id} comparing with ${id}`);
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
            const selectedClasses = classes.filter((cls) => {
                // Chỉ lấy lớp thuộc chuyên ngành đã chọn
                return cls.departmentId === selectedDepartment || cls.department_id === selectedDepartment;
            });

            // Xử lý thông tin lớp ghép từ courseConfigs
            const classesMapping = {};
            selectedClasses.forEach((cls) => {
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
                    groupedClassesList.push(selectedClasses.map((cls) => cls.id));
                }

                // Phân bổ giờ học vào các ngày và lớp học
                groupedClassesList.forEach((classGroup) => {
                    // Số tiết cần phân bổ cho mỗi lớp/nhóm lớp
                    let remainingHours = course.totalHours;

                    // Ưu tiên phân bổ các ngày trong tuần
                    const daysOfWeek = [1, 2, 3, 4, 5]; // thứ 2 - thứ 6

                    // Phân bổ giờ học cho đến khi đủ tổng số tiết
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
                                    const hoursToSchedule = Math.min(
                                        remainingHours,
                                        course.maxHoursPerDay || 4, // Mặc định tối đa 4 tiết/ngày nếu không có ràng buộc
                                        3 // Mỗi time slot thông thường là 2-3 tiết
                                    );

                                    if (hoursToSchedule > 0) {
                                        scheduleDetails.push({
                                            class_id: classId,
                                            course_id: course.id,
                                            day_of_week: day, // Đổi tên từ day sang day_of_week
                                            week_number: week, // Đổi tên từ week sang week_number
                                            start_time: slot.start,
                                            end_time: slot.end,
                                            is_practical: false, // Giả sử mặc định là tiết lý thuyết
                                            is_exam: false, // Thêm trường is_exam
                                            is_self_study: false, // Thêm trường is_self_study
                                            special_event_id: null, // Thêm trường special_event_id
                                            notes: null, // Thêm trường notes
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
                events: {
                    flag_raising: flagRaising,
                    thursday_maintenance: thursdayMaintenance,
                    national_holiday: nationalHoliday,
                    opening_ceremony: openingCeremony,
                    staff_training: staffTraining,
                    teacher_day: teacherDay,
                },
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
                    balance_hours: balanceHoursBetweenClasses,
                    avoid_empty_slots: avoidEmptySlots,
                    prioritize_morning: prioritizeMorningClasses,
                    self_study_afternoon: selfStudyInAfternoon,
                },
                // Thêm chi tiết lịch học đã tính toán
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
                    <Box>
                        <Paper elevation={1} sx={{ p: 3, mb: 3, borderLeft: "4px solid #1976d2" }}>
                            <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>
                                Chọn chuyên ngành và thời gian
                            </Typography>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                                        <InputLabel>Chuyên ngành</InputLabel>
                                        <Select
                                            value={selectedDepartment}
                                            onChange={(e) => setSelectedDepartment(e.target.value)}
                                            label="Chuyên ngành"
                                        >
                                            <MenuItem value="">
                                                <em>Chọn chuyên ngành</em>
                                            </MenuItem>
                                            {departments.map((dept) => (
                                                <MenuItem key={dept._id} value={dept._id}>
                                                    {dept.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Thông tin chuyên ngành
                                    </Typography>
                                    {selectedDepartment ? (
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Số lớp:{" "}
                                                {classes.filter((c) => c.department._id === selectedDepartment).length}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Số môn học:{" "}
                                                {courses.filter((c) => c.department?._id === selectedDepartment).length}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box
                                            sx={{
                                                p: 2,
                                                bgcolor: "background.paper",
                                                borderRadius: 1,
                                                border: "1px dashed grey",
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ fontStyle: "italic" }}
                                            >
                                                Vui lòng chọn chuyên ngành
                                            </Typography>
                                        </Box>
                                    )}
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>
                                Khoảng thời gian
                            </Typography>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={4}>
                                    <DatePicker
                                        label="Ngày bắt đầu"
                                        value={startDate}
                                        onChange={(newValue) => {
                                            setStartDate(newValue);
                                            if (newValue && endDate) {
                                                // Calculate total weeks between start and end dates
                                                const weeks = Math.ceil(endDate.diff(newValue, "day") / 7);
                                                setTotalWeeks(weeks);
                                            }
                                        }}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                helperText: "Ngày bắt đầu học kỳ",
                                            },
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <DatePicker
                                        label="Ngày kết thúc"
                                        value={endDate}
                                        onChange={(newValue) => {
                                            setEndDate(newValue);
                                            if (startDate && newValue) {
                                                // Calculate total weeks between start and end dates
                                                const weeks = Math.ceil(newValue.diff(startDate, "day") / 7);
                                                setTotalWeeks(weeks);
                                            }
                                        }}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                helperText: "Ngày kết thúc học kỳ",
                                            },
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        label="Tổng số tuần"
                                        type="number"
                                        value={totalWeeks}
                                        onChange={(e) => setTotalWeeks(parseInt(e.target.value) || 0)}
                                        fullWidth
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">tuần</InputAdornment>,
                                        }}
                                        disabled
                                        helperText="Tổng số tuần học trong học kỳ"
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 3, p: 2, bgcolor: "primary.light", borderRadius: 1, color: "white" }}>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <EventIcon sx={{ mr: 1 }} />
                                    <Typography variant="subtitle1">Thông tin thời gian</Typography>
                                </Box>
                                <Box sx={{ mt: 1 }}>
                                    <Typography variant="body2">
                                        Học kỳ bắt đầu từ {formatDate(startDate)} đến {formatDate(endDate)}
                                    </Typography>
                                    <Typography variant="body2">Tổng số tuần học: {totalWeeks} tuần</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                );
            case 1:
                return (
                    <Box>
                        <Paper elevation={1} sx={{ p: 3, mb: 3, borderLeft: "4px solid #ff9800" }}>
                            <Typography variant="h6" gutterBottom color="warning.main">
                                Sự kiện định kỳ cố định
                            </Typography>
                            <Grid container spacing={2}>
                                {filteredEvents
                                    .filter(
                                        (event) =>
                                            event.type === "periodic" &&
                                            (event.name.toLowerCase().includes("chào cờ") ||
                                                event.name.toLowerCase().includes("bảo quản") ||
                                                event.name.toLowerCase().includes("ngày nhà giáo") ||
                                                event.recurring_pattern)
                                    )
                                    .map((event) => (
                                        <Grid item xs={12} md={6} key={event._id}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={event.selected !== false} // Default to true if not set
                                                        onChange={(e) => {
                                                            // Update event selection state
                                                            setEventsData(
                                                                eventsData.map((e) =>
                                                                    e._id === event._id
                                                                        ? {
                                                                              ...e,
                                                                              selected:
                                                                                  e.selected === false ? true : false,
                                                                          }
                                                                        : e
                                                                )
                                                            );
                                                        }}
                                                        color="warning"
                                                    />
                                                }
                                                label={
                                                    event.name + (event.description ? ` (${event.description})` : "")
                                                }
                                            />
                                        </Grid>
                                    ))}
                                {filteredEvents.filter(
                                    (event) =>
                                        event.type === "periodic" &&
                                        (event.name.toLowerCase().includes("chào cờ") ||
                                            event.name.toLowerCase().includes("bảo quản") ||
                                            event.name.toLowerCase().includes("ngày nhà giáo") ||
                                            event.recurring_pattern)
                                ).length === 0 && (
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                                            Không có sự kiện định kỳ cố định nào từ cơ sở dữ liệu
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>

                        <Paper elevation={1} sx={{ p: 3, mb: 3, borderLeft: "4px solid #673ab7" }}>
                            <Typography variant="h6" gutterBottom sx={{ color: "#673ab7" }}>
                                Sự kiện đặc biệt có ngày cụ thể
                            </Typography>
                            <Grid container spacing={2}>
                                {filteredEvents
                                    .filter(
                                        (event) =>
                                            (event.type === "periodic" &&
                                                !event.name.toLowerCase().includes("chào cờ") &&
                                                !event.name.toLowerCase().includes("bảo quản") &&
                                                !event.name.toLowerCase().includes("ngày nhà giáo") &&
                                                !event.recurring_pattern) ||
                                            event.type === "special"
                                    )
                                    .map((event) => (
                                        <Grid item xs={12} md={6} key={event._id}>
                                            <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 1, p: 2, mb: 1 }}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={event.selected !== false} // Default to true if not set
                                                            onChange={(e) => {
                                                                // Update event selection state
                                                                setEventsData(
                                                                    eventsData.map((e) =>
                                                                        e._id === event._id
                                                                            ? {
                                                                                  ...e,
                                                                                  selected:
                                                                                      e.selected === false
                                                                                          ? true
                                                                                          : false,
                                                                              }
                                                                            : e
                                                                    )
                                                                );
                                                            }}
                                                            sx={{ color: "#673ab7" }}
                                                        />
                                                    }
                                                    label={<Typography fontWeight="medium">{event.name}</Typography>}
                                                />
                                                <Grid container spacing={2} sx={{ mt: 1, pl: 4 }}>
                                                    <Grid item xs={12} md={6}>
                                                        <DatePicker
                                                            label="Ngày diễn ra"
                                                            value={event.date ? dayjs(event.date) : null}
                                                            onChange={(newValue) => {
                                                                setEventsData(
                                                                    eventsData.map((e) =>
                                                                        e._id === event._id
                                                                            ? {
                                                                                  ...e,
                                                                                  date: newValue
                                                                                      ? newValue.format("YYYY-MM-DD")
                                                                                      : null,
                                                                              }
                                                                            : e
                                                                    )
                                                                );
                                                            }}
                                                            slotProps={{
                                                                textField: {
                                                                    fullWidth: true,
                                                                    helperText: "Chọn ngày cho sự kiện đặc biệt",
                                                                    required: true,
                                                                    size: "small",
                                                                },
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField
                                                            label="Số ngày"
                                                            type="number"
                                                            value={event.duration_days || 1}
                                                            onChange={(e) => {
                                                                const value = parseInt(e.target.value) || 1;
                                                                setEventsData(
                                                                    eventsData.map((ev) =>
                                                                        ev._id === event._id
                                                                            ? {
                                                                                  ...ev,
                                                                                  duration_days: value < 1 ? 1 : value,
                                                                              }
                                                                            : ev
                                                                    )
                                                                );
                                                            }}
                                                            fullWidth
                                                            InputProps={{ inputProps: { min: 1 } }}
                                                            size="small"
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </Grid>
                                    ))}
                                {filteredEvents.filter(
                                    (event) =>
                                        (event.type === "periodic" &&
                                            !event.name.toLowerCase().includes("chào cờ") &&
                                            !event.name.toLowerCase().includes("bảo quản") &&
                                            !event.name.toLowerCase().includes("ngày nhà giáo") &&
                                            !event.recurring_pattern) ||
                                        event.type === "special"
                                ).length === 0 && (
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                                            Không có sự kiện đặc biệt nào từ cơ sở dữ liệu
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>

                        <Paper elevation={1} sx={{ p: 3, borderLeft: "4px solid #f44336" }}>
                            <Typography variant="h6" gutterBottom color="error.main">
                                Ngày nghỉ lễ
                            </Typography>
                            <Grid container spacing={2}>
                                {filteredEvents
                                    .filter((event) => event.type === "holiday")
                                    .map((event) => (
                                        <Grid item xs={12} md={6} key={event._id}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={event.selected !== false} // Default to true if not set
                                                        onChange={(e) => {
                                                            // Update event selection state
                                                            setEventsData(
                                                                eventsData.map((e) =>
                                                                    e._id === event._id
                                                                        ? {
                                                                              ...e,
                                                                              selected:
                                                                                  e.selected === false ? true : false,
                                                                          }
                                                                        : e
                                                                )
                                                            );
                                                        }}
                                                        color="error"
                                                    />
                                                }
                                                label={`${event.name}${
                                                    event.date ? ` (${formatDate(event.date)})` : ""
                                                }${event.duration_days > 1 ? ` - ${event.duration_days} ngày` : ""}`}
                                            />
                                        </Grid>
                                    ))}
                                {filteredEvents.filter((event) => event.type === "holiday").length === 0 && (
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                                            Không có ngày nghỉ lễ nào từ cơ sở dữ liệu
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>

                        <Paper elevation={1} sx={{ p: 3, borderLeft: "4px solid #9c27b0" }}>
                            <Typography variant="h6" gutterBottom color="secondary.main">
                                Thêm sự kiện tùy chỉnh
                            </Typography>
                            <Grid container spacing={3} alignItems="center">
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        label="Tên sự kiện"
                                        value={newEventName}
                                        onChange={(e) => setNewEventName(e.target.value)}
                                        fullWidth
                                        InputProps={{
                                            startAdornment: <EventIcon color="secondary" sx={{ mr: 1 }} />,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <DatePicker
                                        label="Ngày diễn ra"
                                        value={newEventDate}
                                        onChange={(newValue) => setNewEventDate(newValue)}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        label="Số ngày"
                                        type="number"
                                        value={newEventDuration}
                                        onChange={(e) => setNewEventDuration(parseInt(e.target.value) || 1)}
                                        fullWidth
                                        InputProps={{ inputProps: { min: 1 } }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={1}>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={handleAddCustomEvent}
                                        disabled={!newEventName || !newEventDate}
                                        sx={{ height: "56px", width: "100%" }}
                                    >
                                        Thêm
                                    </Button>
                                </Grid>
                            </Grid>

                            {customEvents.length > 0 && (
                                <Box sx={{ mt: 3, border: "1px dashed #9c27b0", borderRadius: 1, p: 2 }}>
                                    <Typography variant="subtitle2" color="secondary" gutterBottom>
                                        Danh sách sự kiện đã thêm
                                    </Typography>
                                    <List dense>
                                        {customEvents.map((event) => (
                                            <ListItem
                                                key={event.id}
                                                secondaryAction={
                                                    <Button
                                                        onClick={() => handleRemoveCustomEvent(event.id)}
                                                        color="error"
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<WarningIcon />}
                                                    >
                                                        Xóa
                                                    </Button>
                                                }
                                                sx={{
                                                    mb: 1,
                                                    backgroundColor: "rgba(156, 39, 176, 0.08)",
                                                    borderRadius: 1,
                                                }}
                                            >
                                                <ListItemIcon>
                                                    <EventIcon color="secondary" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={<Typography fontWeight="medium">{event.name}</Typography>}
                                                    secondary={`Ngày: ${formatDate(event.date)} (${
                                                        event.duration
                                                    } ngày)`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}
                        </Paper>
                    </Box>
                );
            case 2:
                return (
                    <Box>
                        <Paper elevation={1} sx={{ p: 3, mb: 3, borderLeft: "4px solid #2196f3" }}>
                            <Typography variant="h6" gutterBottom color="info.main">
                                Cấu hình môn học
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Cấu hình chi tiết cho từng môn học để tối ưu hóa việc xếp lịch. Mỗi thay đổi sẽ ảnh
                                hưởng đến kết quả lịch học cuối cùng.
                            </Typography>

                            {courseConfigs.map((course) => (
                                <Accordion
                                    key={course.id}
                                    sx={{
                                        mb: 2,
                                        "&:before": { display: "none" },
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        sx={{
                                            bgcolor: "rgba(33, 150, 243, 0.08)",
                                            "&:hover": { bgcolor: "rgba(33, 150, 243, 0.12)" },
                                        }}
                                    >
                                        <Grid container alignItems="center">
                                            <SchoolIcon color="info" sx={{ mr: 1.5 }} />
                                            <Typography variant="subtitle1" fontWeight="medium">
                                                {course.code} - {course.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                                                ({course.totalHours} tiết)
                                            </Typography>
                                        </Grid>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 3 }}>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Tổng số tiết"
                                                    type="number"
                                                    value={course.totalHours}
                                                    onChange={(e) =>
                                                        handleUpdateCourseConfig(
                                                            course.id,
                                                            "totalHours",
                                                            parseInt(e.target.value) || 0
                                                        )
                                                    }
                                                    fullWidth
                                                    InputProps={{
                                                        startAdornment: <EventIcon color="info" sx={{ mr: 1 }} />,
                                                    }}
                                                    helperText="Tổng số tiết cho môn học này trong học kỳ"
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Ghép lớp"
                                                    value={course.groupedClasses || ""}
                                                    onChange={(e) =>
                                                        handleUpdateCourseConfig(
                                                            course.id,
                                                            "groupedClasses",
                                                            e.target.value
                                                        )
                                                    }
                                                    fullWidth
                                                    helperText="Định dạng: 'A,B|C,D|E,F' để ghép lớp A với B, C với D, E với F"
                                                />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Divider sx={{ my: 2 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Ràng buộc học tập
                                                    </Typography>
                                                </Divider>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Số tiết tối đa mỗi tuần"
                                                    type="number"
                                                    value={course.maxHoursPerWeek || ""}
                                                    onChange={(e) =>
                                                        handleUpdateCourseConfig(
                                                            course.id,
                                                            "maxHoursPerWeek",
                                                            e.target.value ? parseInt(e.target.value) : null
                                                        )
                                                    }
                                                    fullWidth
                                                    helperText="Để trống nếu không có giới hạn"
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Số tiết tối đa mỗi ngày"
                                                    type="number"
                                                    value={course.maxHoursPerDay || ""}
                                                    onChange={(e) =>
                                                        handleUpdateCourseConfig(
                                                            course.id,
                                                            "maxHoursPerDay",
                                                            e.target.value ? parseInt(e.target.value) : null
                                                        )
                                                    }
                                                    fullWidth
                                                    helperText="Để trống nếu không có giới hạn"
                                                />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Divider sx={{ my: 2 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Thông tin thi
                                                    </Typography>
                                                </Divider>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Số ngày tối thiểu trước khi thi"
                                                    type="number"
                                                    value={course.minDaysBeforeExam}
                                                    onChange={(e) =>
                                                        handleUpdateCourseConfig(
                                                            course.id,
                                                            "minDaysBeforeExam",
                                                            parseInt(e.target.value) || 0
                                                        )
                                                    }
                                                    fullWidth
                                                    helperText="Số ngày nghỉ tối thiểu trước khi thi"
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Thời gian thi (tiết)"
                                                    type="number"
                                                    value={course.examDuration}
                                                    onChange={(e) =>
                                                        handleUpdateCourseConfig(
                                                            course.id,
                                                            "examDuration",
                                                            parseInt(e.target.value) || 0
                                                        )
                                                    }
                                                    fullWidth
                                                    helperText="Số tiết dành cho thi môn học này"
                                                />
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Paper>

                        {courseConfigs.length > 0 && (
                            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                                <Alert severity="info" icon={<HelpIcon />} sx={{ width: "100%" }}>
                                    <Typography variant="subtitle2">Mẹo:</Typography>
                                    <Typography variant="body2">
                                        Nhấn vào từng môn học để mở rộng và điều chỉnh cấu hình chi tiết. Nếu không có
                                        yêu cầu đặc biệt cho môn nào đó, bạn có thể để mặc định.
                                    </Typography>
                                </Alert>
                            </Box>
                        )}
                    </Box>
                );
            case 3:
                return (
                    <Box>
                        <Paper elevation={1} sx={{ p: 3, mb: 3, borderLeft: "4px solid #ff9800" }}>
                            <Typography variant="h6" gutterBottom color="warning.main">
                                Ràng buộc bổ sung
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Thiết lập các ràng buộc đặc biệt cho lịch học. Các ràng buộc này giúp tối ưu hóa lịch
                                học theo nhu cầu cụ thể của bạn.
                            </Typography>

                            <Box sx={{ mb: 4 }}>
                                <Card variant="outlined" sx={{ mb: 3, bgcolor: "rgba(255, 152, 0, 0.05)" }}>
                                    <CardHeader
                                        title="Ràng buộc về thời gian"
                                        titleTypographyProps={{ variant: "subtitle1", fontWeight: "medium" }}
                                        avatar={<AccessTimeIcon color="warning" />}
                                        action={
                                            <Tooltip title="Thêm ràng buộc thời gian">
                                                <IconButton onClick={() => handleAddConstraint("time")}>
                                                    <AddCircleIcon color="warning" />
                                                </IconButton>
                                            </Tooltip>
                                        }
                                    />
                                    <Divider />
                                    <CardContent sx={{ p: 2 }}>
                                        {constraints.filter((c) => c.type === "time").length > 0 ? (
                                            constraints
                                                .filter((c) => c.type === "time")
                                                .map((constraint, index) => (
                                                    <Card
                                                        key={index}
                                                        sx={{ mb: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
                                                    >
                                                        <CardContent sx={{ py: 2 }}>
                                                            <Grid container spacing={2} alignItems="center">
                                                                <Grid item xs={12} sm={5}>
                                                                    <FormControl fullWidth size="small">
                                                                        <InputLabel>Loại ràng buộc</InputLabel>
                                                                        <Select
                                                                            value={constraint.subtype || ""}
                                                                            onChange={(e) =>
                                                                                handleUpdateConstraint(
                                                                                    index,
                                                                                    "subtype",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            label="Loại ràng buộc"
                                                                        >
                                                                            <MenuItem value="preferred_days">
                                                                                Ngày ưu tiên
                                                                            </MenuItem>
                                                                            <MenuItem value="avoid_days">
                                                                                Ngày cần tránh
                                                                            </MenuItem>
                                                                            <MenuItem value="preferred_slots">
                                                                                Khung giờ ưu tiên
                                                                            </MenuItem>
                                                                            <MenuItem value="avoid_slots">
                                                                                Khung giờ cần tránh
                                                                            </MenuItem>
                                                                        </Select>
                                                                    </FormControl>
                                                                </Grid>
                                                                <Grid item xs={12} sm={5}>
                                                                    <Autocomplete
                                                                        multiple
                                                                        size="small"
                                                                        options={
                                                                            constraint.subtype?.includes("days")
                                                                                ? [
                                                                                      "Thứ 2",
                                                                                      "Thứ 3",
                                                                                      "Thứ 4",
                                                                                      "Thứ 5",
                                                                                      "Thứ 6",
                                                                                      "Thứ 7",
                                                                                  ]
                                                                                : [
                                                                                      "Sáng sớm (Tiết 1-3)",
                                                                                      "Giữa buổi (Tiết 4-7)",
                                                                                      "Chiều tối (Tiết 8-10)",
                                                                                  ]
                                                                        }
                                                                        value={constraint.value || []}
                                                                        onChange={(e, newValue) =>
                                                                            handleUpdateConstraint(
                                                                                index,
                                                                                "value",
                                                                                newValue
                                                                            )
                                                                        }
                                                                        renderInput={(params) => (
                                                                            <TextField
                                                                                {...params}
                                                                                label={
                                                                                    constraint.subtype?.includes("days")
                                                                                        ? "Chọn ngày"
                                                                                        : "Chọn khung giờ"
                                                                                }
                                                                                placeholder="Chọn..."
                                                                            />
                                                                        )}
                                                                        renderTags={(value, getTagProps) =>
                                                                            value.map((option, index) => (
                                                                                <Chip
                                                                                    size="small"
                                                                                    label={option}
                                                                                    {...getTagProps({ index })}
                                                                                    sx={{
                                                                                        bgcolor:
                                                                                            constraint.subtype?.includes(
                                                                                                "prefer"
                                                                                            )
                                                                                                ? "success.light"
                                                                                                : "error.light",
                                                                                        color: "#fff",
                                                                                    }}
                                                                                />
                                                                            ))
                                                                        }
                                                                    />
                                                                </Grid>
                                                                <Grid
                                                                    item
                                                                    xs={12}
                                                                    sm={2}
                                                                    sx={{ display: "flex", justifyContent: "flex-end" }}
                                                                >
                                                                    <Tooltip title="Xóa ràng buộc">
                                                                        <IconButton
                                                                            color="error"
                                                                            onClick={() =>
                                                                                handleRemoveConstraint(index)
                                                                            }
                                                                            size="small"
                                                                        >
                                                                            <DeleteIcon />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Grid>
                                                            </Grid>
                                                        </CardContent>
                                                    </Card>
                                                ))
                                        ) : (
                                            <Box sx={{ py: 2, textAlign: "center" }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Chưa có ràng buộc về thời gian. Nhấn vào nút "+" để thêm.
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card variant="outlined" sx={{ mb: 3, bgcolor: "rgba(255, 152, 0, 0.05)" }}>
                                    <CardHeader
                                        title="Ràng buộc về lớp học"
                                        titleTypographyProps={{ variant: "subtitle1", fontWeight: "medium" }}
                                        avatar={<ClassIcon color="warning" />}
                                        action={
                                            <Tooltip title="Thêm ràng buộc lớp học">
                                                <IconButton onClick={() => handleAddConstraint("class")}>
                                                    <AddCircleIcon color="warning" />
                                                </IconButton>
                                            </Tooltip>
                                        }
                                    />
                                    <Divider />
                                    <CardContent sx={{ p: 2 }}>
                                        {constraints.filter((c) => c.type === "class").length > 0 ? (
                                            constraints
                                                .filter((c) => c.type === "class")
                                                .map((constraint, index) => (
                                                    <Card
                                                        key={index}
                                                        sx={{ mb: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
                                                    >
                                                        <CardContent sx={{ py: 2 }}>
                                                            <Grid container spacing={2} alignItems="center">
                                                                <Grid item xs={12} sm={5}>
                                                                    <FormControl fullWidth size="small">
                                                                        <InputLabel>Loại ràng buộc</InputLabel>
                                                                        <Select
                                                                            value={constraint.subtype || ""}
                                                                            onChange={(e) =>
                                                                                handleUpdateConstraint(
                                                                                    constraints.findIndex(
                                                                                        (c) => c === constraint
                                                                                    ),
                                                                                    "subtype",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            label="Loại ràng buộc"
                                                                        >
                                                                            <MenuItem value="sequential_classes">
                                                                                Lớp học liên tiếp
                                                                            </MenuItem>
                                                                            <MenuItem value="class_spacing">
                                                                                Khoảng cách giữa các lớp
                                                                            </MenuItem>
                                                                            <MenuItem value="same_day_classes">
                                                                                Lớp học cùng ngày
                                                                            </MenuItem>
                                                                        </Select>
                                                                    </FormControl>
                                                                </Grid>
                                                                <Grid item xs={12} sm={5}>
                                                                    <Autocomplete
                                                                        multiple
                                                                        size="small"
                                                                        options={selectedClasses.map((c) => c.name)}
                                                                        value={constraint.classes || []}
                                                                        onChange={(e, newValue) =>
                                                                            handleUpdateConstraint(
                                                                                constraints.findIndex(
                                                                                    (c) => c === constraint
                                                                                ),
                                                                                "classes",
                                                                                newValue
                                                                            )
                                                                        }
                                                                        renderInput={(params) => (
                                                                            <TextField
                                                                                {...params}
                                                                                label="Chọn lớp"
                                                                                placeholder="Chọn lớp"
                                                                            />
                                                                        )}
                                                                        renderTags={(value, getTagProps) =>
                                                                            value.map((option, index) => (
                                                                                <Chip
                                                                                    size="small"
                                                                                    label={option}
                                                                                    {...getTagProps({ index })}
                                                                                    sx={{
                                                                                        bgcolor: "info.light",
                                                                                        color: "#fff",
                                                                                    }}
                                                                                />
                                                                            ))
                                                                        }
                                                                    />
                                                                </Grid>
                                                                <Grid
                                                                    item
                                                                    xs={12}
                                                                    sm={2}
                                                                    sx={{ display: "flex", justifyContent: "flex-end" }}
                                                                >
                                                                    <Tooltip title="Xóa ràng buộc">
                                                                        <IconButton
                                                                            color="error"
                                                                            onClick={() =>
                                                                                handleRemoveConstraint(index)
                                                                            }
                                                                            size="small"
                                                                        >
                                                                            <DeleteIcon />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Grid>
                                                            </Grid>
                                                        </CardContent>
                                                    </Card>
                                                ))
                                        ) : (
                                            <Box sx={{ py: 2, textAlign: "center" }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Chưa có ràng buộc về lớp học. Nhấn vào nút "+" để thêm.
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card variant="outlined" sx={{ bgcolor: "rgba(255, 152, 0, 0.05)" }}>
                                    <CardHeader
                                        title="Ràng buộc về giảng viên"
                                        titleTypographyProps={{ variant: "subtitle1", fontWeight: "medium" }}
                                        avatar={<PersonIcon color="warning" />}
                                        action={
                                            <Tooltip title="Thêm ràng buộc giảng viên">
                                                <IconButton onClick={() => handleAddConstraint("teacher")}>
                                                    <AddCircleIcon color="warning" />
                                                </IconButton>
                                            </Tooltip>
                                        }
                                    />
                                    <Divider />
                                    <CardContent sx={{ p: 2 }}>
                                        {constraints.filter((c) => c.type === "teacher").length > 0 ? (
                                            constraints
                                                .filter((c) => c.type === "teacher")
                                                .map((constraint, index) => (
                                                    <Card
                                                        key={index}
                                                        sx={{ mb: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
                                                    >
                                                        <CardContent sx={{ py: 2 }}>
                                                            <Grid container spacing={2} alignItems="center">
                                                                <Grid item xs={12} sm={4}>
                                                                    <FormControl fullWidth size="small">
                                                                        <InputLabel>Giảng viên</InputLabel>
                                                                        <Select
                                                                            value={constraint.teacher || ""}
                                                                            onChange={(e) =>
                                                                                handleUpdateConstraint(
                                                                                    constraints.findIndex(
                                                                                        (c) => c === constraint
                                                                                    ),
                                                                                    "teacher",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            label="Giảng viên"
                                                                        >
                                                                            {teachers.map((teacher) => (
                                                                                <MenuItem
                                                                                    key={teacher.id}
                                                                                    value={teacher.id}
                                                                                >
                                                                                    {teacher.name}
                                                                                </MenuItem>
                                                                            ))}
                                                                        </Select>
                                                                    </FormControl>
                                                                </Grid>
                                                                <Grid item xs={12} sm={4}>
                                                                    <FormControl fullWidth size="small">
                                                                        <InputLabel>Loại ràng buộc</InputLabel>
                                                                        <Select
                                                                            value={constraint.subtype || ""}
                                                                            onChange={(e) =>
                                                                                handleUpdateConstraint(
                                                                                    constraints.findIndex(
                                                                                        (c) => c === constraint
                                                                                    ),
                                                                                    "subtype",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            label="Loại ràng buộc"
                                                                        >
                                                                            <MenuItem value="preferred_days">
                                                                                Ngày ưu tiên
                                                                            </MenuItem>
                                                                            <MenuItem value="avoid_days">
                                                                                Ngày cần tránh
                                                                            </MenuItem>
                                                                            <MenuItem value="max_classes_per_day">
                                                                                Số lớp tối đa mỗi ngày
                                                                            </MenuItem>
                                                                            <MenuItem value="max_consecutive_classes">
                                                                                Số lớp liên tiếp tối đa
                                                                            </MenuItem>
                                                                        </Select>
                                                                    </FormControl>
                                                                </Grid>
                                                                <Grid item xs={12} sm={3}>
                                                                    {constraint.subtype?.includes("days") ? (
                                                                        <Autocomplete
                                                                            multiple
                                                                            size="small"
                                                                            options={[
                                                                                "Thứ 2",
                                                                                "Thứ 3",
                                                                                "Thứ 4",
                                                                                "Thứ 5",
                                                                                "Thứ 6",
                                                                                "Thứ 7",
                                                                            ]}
                                                                            value={constraint.value || []}
                                                                            onChange={(e, newValue) =>
                                                                                handleUpdateConstraint(
                                                                                    constraints.findIndex(
                                                                                        (c) => c === constraint
                                                                                    ),
                                                                                    "value",
                                                                                    newValue
                                                                                )
                                                                            }
                                                                            renderInput={(params) => (
                                                                                <TextField
                                                                                    {...params}
                                                                                    label="Chọn ngày"
                                                                                    placeholder="Chọn ngày"
                                                                                />
                                                                            )}
                                                                            renderTags={(value, getTagProps) =>
                                                                                value.map((option, index) => (
                                                                                    <Chip
                                                                                        size="small"
                                                                                        label={option}
                                                                                        {...getTagProps({ index })}
                                                                                        sx={{
                                                                                            bgcolor:
                                                                                                constraint.subtype ===
                                                                                                "preferred_days"
                                                                                                    ? "success.light"
                                                                                                    : "error.light",
                                                                                            color: "#fff",
                                                                                        }}
                                                                                    />
                                                                                ))
                                                                            }
                                                                        />
                                                                    ) : (
                                                                        <TextField
                                                                            size="small"
                                                                            type="number"
                                                                            label="Số lượng"
                                                                            value={constraint.value || ""}
                                                                            onChange={(e) =>
                                                                                handleUpdateConstraint(
                                                                                    constraints.findIndex(
                                                                                        (c) => c === constraint
                                                                                    ),
                                                                                    "value",
                                                                                    parseInt(e.target.value) || 0
                                                                                )
                                                                            }
                                                                            fullWidth
                                                                        />
                                                                    )}
                                                                </Grid>
                                                                <Grid
                                                                    item
                                                                    xs={12}
                                                                    sm={1}
                                                                    sx={{ display: "flex", justifyContent: "flex-end" }}
                                                                >
                                                                    <Tooltip title="Xóa ràng buộc">
                                                                        <IconButton
                                                                            color="error"
                                                                            onClick={() =>
                                                                                handleRemoveConstraint(
                                                                                    constraints.findIndex(
                                                                                        (c) => c === constraint
                                                                                    )
                                                                                )
                                                                            }
                                                                            size="small"
                                                                        >
                                                                            <DeleteIcon />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Grid>
                                                            </Grid>
                                                        </CardContent>
                                                    </Card>
                                                ))
                                        ) : (
                                            <Box sx={{ py: 2, textAlign: "center" }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Chưa có ràng buộc về giảng viên. Nhấn vào nút "+" để thêm.
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Box>
                        </Paper>

                        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                            <Alert severity="info" icon={<TipsAndUpdatesIcon />} sx={{ width: "100%" }}>
                                <AlertTitle>Mẹo cải thiện lịch học</AlertTitle>
                                <Typography variant="body2">
                                    Thêm càng nhiều ràng buộc có thể làm giảm hiệu quả của lịch học. Hãy chỉ sử dụng các
                                    ràng buộc thực sự cần thiết để có lịch học tối ưu nhất.
                                </Typography>
                            </Alert>
                        </Box>
                    </Box>
                );
            case 4:
                return (
                    <Grid container spacing={3}>
                        <Grid sx={{ xs: 12 }}>
                            <Typography variant="h6" gutterBottom>
                                Tổng hợp thông tin xếp lịch
                            </Typography>
                        </Grid>

                        <Grid sx={{ xs: 12 }}>
                            <Paper sx={{ p: 2, mb: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    <SchoolIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                                    Chuyên ngành: {departments.find((d) => d.id === selectedDepartment)?.name}
                                </Typography>
                                <Typography variant="body2">
                                    Thời gian: Từ {formatDate(startDate)} đến {formatDate(endDate)} ({totalWeeks} tuần)
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid sx={{ xs: 12 }}>
                            <Paper sx={{ p: 2, mb: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    <EventIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                                    Sự kiện đặc biệt
                                </Typography>
                                <List dense>
                                    {flagRaising && (
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckIcon />
                                            </ListItemIcon>
                                            <ListItemText primary="Chào cờ (Thứ 2 đầu tháng)" />
                                        </ListItem>
                                    )}
                                    {thursdayMaintenance && (
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckIcon />
                                            </ListItemIcon>
                                            <ListItemText primary="Bảo quản (Chiều thứ 5 hàng tuần)" />
                                        </ListItem>
                                    )}
                                    {nationalHoliday && (
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckIcon />
                                            </ListItemIcon>
                                            <ListItemText primary="Quốc khánh (2/9 và 1 ngày liền kề)" />
                                        </ListItem>
                                    )}
                                    {openingCeremony && (
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckIcon />
                                            </ListItemIcon>
                                            <ListItemText primary="Khai giảng (15/9 hoặc 16/9)" />
                                        </ListItem>
                                    )}
                                    {staffTraining && (
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckIcon />
                                            </ListItemIcon>
                                            <ListItemText primary="Tập huấn cán bộ (3 ngày)" />
                                        </ListItem>
                                    )}
                                    {teacherDay && (
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckIcon />
                                            </ListItemIcon>
                                            <ListItemText primary="Ngày Nhà giáo (20/11)" />
                                        </ListItem>
                                    )}
                                    {customEvents.map((event) => (
                                        <ListItem key={event.id}>
                                            <ListItemIcon>
                                                <CheckIcon />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={event.name}
                                                secondary={`${formatDate(event.date)} (${event.duration} ngày)`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        </Grid>

                        <Grid sx={{ xs: 12 }}>
                            <Paper sx={{ p: 2, mb: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Môn học và Ràng buộc
                                </Typography>
                                <List dense>
                                    {courseConfigs.map((course) => (
                                        <ListItem key={course.id}>
                                            <ListItemText
                                                primary={`${course.code} - ${course.name}`}
                                                secondary={`${course.totalHours} tiết | Tối đa: ${
                                                    course.maxHoursPerWeek || "không giới hạn"
                                                } tiết/tuần, ${course.maxHoursPerDay || "không giới hạn"} tiết/ngày`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        </Grid>

                        <Grid sx={{ xs: 12 }}>
                            <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
                                <Typography variant="subtitle2">Lưu ý quan trọng</Typography>
                                <Typography variant="body2">
                                    Sau khi tạo lịch, hệ thống sẽ tự động xếp lịch theo các ràng buộc đã cài đặt. Quá
                                    trình này có thể mất vài phút. Bạn có thể điều chỉnh lịch sau khi tạo xong.
                                </Typography>
                            </Alert>

                            {loading ? (
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", my: 4 }}>
                                    <CircularProgress />
                                    <Typography sx={{ mt: 2 }}>Đang tạo lịch học...</Typography>
                                </Box>
                            ) : success ? (
                                <Box sx={{ textAlign: "center", my: 3 }}>
                                    <Alert severity="success" sx={{ mb: 2 }}>
                                        Lịch học đã được tạo thành công!
                                    </Alert>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => navigate("/schedule")}
                                        sx={{ mr: 1 }}
                                    >
                                        Xem lịch học
                                    </Button>
                                    <Button variant="outlined" onClick={handleReset}>
                                        Tạo lịch mới
                                    </Button>
                                </Box>
                            ) : (
                                <Box sx={{ textAlign: "center" }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleGenerateSchedule}
                                        size="large"
                                    >
                                        Tạo lịch học
                                    </Button>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
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
