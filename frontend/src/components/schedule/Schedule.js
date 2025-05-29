import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
    Container,
    Box,
    Typography,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tabs,
    Tab,
    Chip,
    Tooltip,
    CircularProgress,
    Alert,
    FormControlLabel,
    Switch,
} from "@mui/material";
import { Add as AddIcon, Print as PrintIcon, Star as StarIcon, Event as EventIcon } from "@mui/icons-material";
import { getSchedules } from "../../api/scheduleService";
import { getDepartments } from "../../api/departmentService";
import { getClassesByDepartmentId } from "../../api/classService";
import { formatDate, isHoliday, isFlagCeremonyDay } from "../../utils/scheduleDisplayUtils";

// Số tuần hiển thị cùng lúc
const WEEKS_TO_SHOW = 5;

const Schedule = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [departments, setDepartments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [startWeek, setStartWeek] = useState(1);
    const [tabValue, setTabValue] = useState(0);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showSelfStudy, setShowSelfStudy] = useState(true); // Add state for self-study visibility
    const [totalWeeks, setTotalWeeks] = useState(50); // State for total weeks from schedule data

    // Tải dữ liệu ban đầu
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Tải danh sách khoa
                const departmentsResponse = await getDepartments();
                if (departmentsResponse?.length > 0) {
                    setDepartments(departmentsResponse);
                    setSelectedDepartment(departmentsResponse[0]._id);
                } else {
                    setDepartments([]);
                }

                // Xác định ngày bắt đầu từ tháng 6
                const defaultStartDate = new Date("2025-06-09"); // Bắt đầu từ ngày 9 tháng 6
                setStartDate(defaultStartDate); // Tải lịch học từ ngày mặc định
                const schedulesResponse = await getSchedules({
                    actual_start_date: defaultStartDate.toISOString().split("T")[0],
                });
                setSchedules(schedulesResponse || []);

                // Calculate total weeks from schedule data
                if (schedulesResponse && schedulesResponse.length > 0) {
                    const weeks = [...new Set(schedulesResponse.map((s) => s.week_number))];
                    const maxWeek = Math.max(...weeks);
                    if (maxWeek > 0) {
                        setTotalWeeks(maxWeek);
                    }
                }

                // Xác định ngày bắt đầu và kết thúc từ dữ liệu lịch học
                if (schedulesResponse && schedulesResponse.length > 0) {
                    const dates = schedulesResponse.filter((s) => s.actual_date).map((s) => new Date(s.actual_date));

                    if (dates.length > 0) {
                        // Sử dụng ngày bắt đầu mặc định nếu không có lịch học nào sớm hơn
                        const minDate = new Date(Math.min(...dates));
                        const actualMinDate = minDate < defaultStartDate ? minDate : defaultStartDate;
                        const maxDate = new Date(Math.max(...dates));
                        setStartDate(actualMinDate);
                        setEndDate(maxDate);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu ban đầu:", error);
                setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Tải danh sách lớp và lịch học khi thay đổi khoa
    useEffect(() => {
        const fetchData = async () => {
            if (!selectedDepartment) return;

            setLoading(true);
            setError(null);
            try {
                // Tải danh sách lớp
                const classesResponse = await getClassesByDepartmentId(selectedDepartment);
                setClasses(classesResponse || []); // Xác định ngày bắt đầu từ tháng 6
                const defaultStartDate = new Date("2025-06-09"); // Bắt đầu từ ngày 9 tháng 6

                // Tải lịch học cho khoa đã chọn
                const params = {
                    department_id: selectedDepartment,
                    actual_start_date: defaultStartDate.toISOString().split("T")[0],
                };
                const schedulesResponse = await getSchedules(params);
                console.log("Lịch học đã tải:", schedulesResponse?.length, "mục");
                console.log("Mẫu lịch học đầu tiên:", schedulesResponse?.[0]);
                setSchedules(schedulesResponse || []);

                // Calculate total weeks from schedule data
                if (schedulesResponse && schedulesResponse.length > 0) {
                    const weeks = [...new Set(schedulesResponse.map((s) => s.week_number))];
                    const maxWeek = Math.max(...weeks);
                    if (maxWeek > 0) {
                        setTotalWeeks(maxWeek);
                    }
                }

                // Cập nhật ngày bắt đầu và kết thúc
                if (schedulesResponse && schedulesResponse.length > 0) {
                    const dates = schedulesResponse.filter((s) => s.actual_date).map((s) => new Date(s.actual_date));

                    if (dates.length > 0) {
                        // Sử dụng ngày bắt đầu mặc định nếu không có lịch học nào sớm hơn
                        const minDate = new Date(Math.min(...dates));
                        const actualMinDate = minDate < defaultStartDate ? minDate : defaultStartDate;
                        const maxDate = new Date(Math.max(...dates));
                        setStartDate(actualMinDate);
                        setEndDate(maxDate);
                    } else {
                        // Nếu không có ngày nào, sử dụng ngày mặc định
                        setStartDate(defaultStartDate);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
                setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedDepartment]);

    // Xử lý thay đổi khoa
    const handleDepartmentChange = (event) => {
        setSelectedDepartment(event.target.value);
    };

    // Xử lý thay đổi tab
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        // Mỗi tab hiển thị WEEKS_TO_SHOW tuần, nên tính tuần bắt đầu dựa vào tab được chọn
        setStartWeek(newValue * WEEKS_TO_SHOW + 1);
    }; // Tạo các tabs cho tuần học
    const scheduleTabs = useMemo(() => {
        const tabCount = Math.ceil(totalWeeks / WEEKS_TO_SHOW);

        return (
            <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
                {Array.from({ length: tabCount }).map((_, index) => {
                    const start = index * WEEKS_TO_SHOW + 1;
                    const end = Math.min((index + 1) * WEEKS_TO_SHOW, totalWeeks);
                    return <Tab key={`week-tab-${index}`} label={`Tuần ${start}-${end}`} />;
                })}
            </Tabs>
        );
    }, [tabValue, totalWeeks]); // Tính toán các tuần hiển thị
    const displayWeeks = useMemo(() => {
        const weeks = [];
        for (let i = 0; i < WEEKS_TO_SHOW; i++) {
            const weekNumber = startWeek + i;
            if (weekNumber <= totalWeeks) {
                weeks.push(weekNumber);
            }
        }
        return weeks;
    }, [startWeek, totalWeeks]);

    // Tìm thông tin lịch học cho một lớp, tiết và ngày cụ thể
    const getScheduleForClassPeriodDay = useCallback(
        (classId, period, date) => {
            return schedules.find((schedule) => {
                // Kiểm tra xem ngày của lịch học có khớp với ngày đã cho không
                if (!schedule.actual_date) return false;

                const scheduleDate = new Date(schedule.actual_date);
                const compareDate = new Date(date);

                const sameDay =
                    scheduleDate.getDate() === compareDate.getDate() &&
                    scheduleDate.getMonth() === compareDate.getMonth() &&
                    scheduleDate.getFullYear() === compareDate.getFullYear(); // Kiểm tra ID của lớp, có thể là class hoặc class_id
                const classMatch = schedule.class_id === classId || schedule.class === classId;

                const result =
                    classMatch && sameDay && isPeriodInTimeRange(period, schedule.start_time, schedule.end_time);

                if (classMatch && sameDay) {
                    console.log(
                        "Phát hiện lịch phù hợp:",
                        schedule.id,
                        "tiết",
                        period,
                        "phù hợp thời gian:",
                        isPeriodInTimeRange(period, schedule.start_time, schedule.end_time)
                    );
                }

                return result;
            });
        },
        [schedules]
    );

    // Kiểm tra xem tiết học có nằm trong khoảng thời gian không
    const isPeriodInTimeRange = (period, startTime, endTime) => {
        const periodTimes = {
            1: { start: "07:30", end: "08:15" },
            2: { start: "08:20", end: "09:05" },
            3: { start: "09:15", end: "10:00" },
            4: { start: "10:05", end: "10:50" },
            5: { start: "10:55", end: "11:40" },
            6: { start: "11:45", end: "12:30" },
            7: { start: "13:30", end: "14:15" },
            8: { start: "14:20", end: "15:05" },
            9: { start: "15:15", end: "16:00" },
        };

        const periodStart = periodTimes[period]?.start;
        const periodEnd = periodTimes[period]?.end;

        if (!periodStart || !periodEnd || !startTime || !endTime) {
            return false;
        }

        // Chuyển đổi thời gian sang định dạng phút để so sánh
        const toMinutes = (timeStr) => {
            const [hours, minutes] = timeStr.split(":").map(Number);
            return hours * 60 + minutes;
        };

        const scheduleStartMinutes = toMinutes(startTime.split(":").slice(0, 2).join(":"));
        const scheduleEndMinutes = toMinutes(endTime.split(":").slice(0, 2).join(":"));
        const periodStartMinutes = toMinutes(periodStart);
        const periodEndMinutes = toMinutes(periodEnd);

        return scheduleStartMinutes <= periodStartMinutes && scheduleEndMinutes >= periodEndMinutes;
    };

    // Render một ô lịch học
    const renderScheduleCell = useCallback(
        (classId, period, date) => {
            const schedule = getScheduleForClassPeriodDay(classId, period, date);

            // Kiểm tra xem có phải là ngày chào cờ (thứ 2 đầu tháng) không
            const isFlagDay = isFlagCeremonyDay(date);
            if (!schedule) {
                // Hiển thị biểu tượng đặc biệt cho ngày lễ và chào cờ ngay cả khi không có lịch
                if (isHoliday(date)) {
                    return (
                        <Box
                            sx={{
                                backgroundColor: "#ffebee",
                                height: "100%",
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <EventIcon color="error" fontSize="small" />
                        </Box>
                    );
                }

                if (isFlagDay && period >= 1 && period <= 3) {
                    // Chào cờ thường diễn ra vào tiết đầu buổi sáng
                    return (
                        <Box
                            sx={{
                                backgroundColor: "#e1f5fe",
                                height: "100%",
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <span role="img" aria-label="flag">
                                🏁
                            </span>
                        </Box>
                    );
                }

                return null;
            }

            // Kiểm tra các loại sự kiện đặc biệt
            const isSpecialEvent = !!schedule.special_event || schedule.is_special_day;
            const isSelfStudy = schedule.is_self_study;
            const isFlagCeremony = schedule.is_flag_ceremony || (isFlagDay && period >= 1 && period <= 2); // Chỉ chào cờ tiết 1-2
            const isMaintenance = schedule.is_maintenance;
            const isBreak = schedule.is_break;

            // Skip rendering self-study periods if showSelfStudy is false
            if (isSelfStudy && !showSelfStudy) {
                return null;
            }
            let bgColor = "#ffffff"; // Tất cả các ô đều có nền trắng
            let textStyle = {};

            if (isSpecialEvent || isHoliday(date)) {
                textStyle.color = "#f44336"; // Văn bản màu đỏ cho sự kiện đặc biệt
            } else if (isMaintenance) {
                textStyle.color = "#ff9800"; // Màu cam cho thời gian bảo quản
                textStyle.fontWeight = "bold";
            } else if (isBreak) {
                textStyle.color = "#9c27b0"; // Màu tím cho tuần nghỉ
                textStyle.fontWeight = "bold";
            } else if (isSelfStudy) {
                // Tiết tự học chỉ hiển thị "Ôn", không có gạch chân hay chữ nghiêng
                // (styling đã bỏ fontStyle italic)
            } else if (schedule.is_practical) {
                textStyle.textDecoration = "underline"; // Gạch chân cho tiết thực hành
            }

            // Hiển thị mã môn học hoặc biểu tượng đặc biệt
            return (
                <Box
                    sx={{
                        backgroundColor: bgColor,
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        p: 0.5,
                        border: schedule.is_exam ? "1px solid red" : "none",
                        ...textStyle,
                        position: "relative", // Để có thể đặt tam giác ở góc
                    }}
                >
                    {/* Tam giác màu đen ở góc trên bên trái cho tiết thi */}
                    {schedule.is_exam && (
                        <Box
                            sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: 0,
                                height: 0,
                                borderTop: "8px solid #000000",
                                borderRight: "8px solid transparent",
                                zIndex: 1,
                            }}
                        />
                    )}{" "}
                    {isFlagCeremony ? (
                        <StarIcon color="error" fontSize="small" />
                    ) : isMaintenance ? (
                        <Tooltip title={schedule.notes || "Bảo quản thiết bị"}>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <Typography variant="caption" sx={{ fontSize: "0.7rem", fontWeight: "bold" }}>
                                    Bảo quản
                                </Typography>
                            </Box>
                        </Tooltip>
                    ) : isBreak ? (
                        <Tooltip title={schedule.notes || "Tuần nghỉ"}>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <Typography variant="caption" sx={{ fontSize: "0.7rem", fontWeight: "bold" }}>
                                    Nghỉ
                                </Typography>
                            </Box>
                        </Tooltip>
                    ) : (
                        <>
                            {isSelfStudy ? "Ôn" : schedule.course_code || ""}
                            {schedule.is_exam && (
                                <Tooltip title={schedule.notes || "Thi"}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <StarIcon color="error" fontSize="small" sx={{ ml: 0.5 }} />
                                        {schedule.exam_phase && schedule.total_phases > 1 && (
                                            <span style={{ fontSize: "0.7rem", marginLeft: "2px" }}>
                                                {schedule.exam_phase}/{schedule.total_phases}
                                            </span>
                                        )}
                                    </div>
                                </Tooltip>
                            )}
                            {isSpecialEvent && <EventIcon color="secondary" fontSize="small" sx={{ ml: 0.5 }} />}
                        </>
                    )}
                </Box>
            );
        },
        [getScheduleForClassPeriodDay, showSelfStudy]
    );

    // Tính ngày từ tuần được hiển thị
    const calculateDatesForWeeks = useCallback(() => {
        if (!startDate) return [];

        const result = [];

        // Process each week
        for (const week of displayWeeks) {
            const weekStart = new Date(startDate);
            weekStart.setDate(weekStart.getDate() + (week - 1) * 7);

            // Adjust to start from Monday
            const currentDay = weekStart.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

            // If current day is Sunday (0), go one day forward to Monday
            // If current day is between Tuesday and Saturday (2-6), go back to Monday
            if (currentDay === 0) {
                weekStart.setDate(weekStart.getDate() + 1); // Move forward to Monday
            } else if (currentDay > 1) {
                weekStart.setDate(weekStart.getDate() - (currentDay - 1)); // Move back to Monday
            }
            // If currentDay is 1 (Monday), no adjustment needed

            // Generate 7 days for the week (Monday to Sunday)
            const weekDays = [];
            for (let i = 0; i < 7; i++) {
                const day = new Date(weekStart);
                day.setDate(weekStart.getDate() + i);
                weekDays.push(day);
            }

            // Calculate month info for each day
            const months = weekDays.map((day) => ({
                month: [
                    "Tháng 1",
                    "Tháng 2",
                    "Tháng 3",
                    "Tháng 4",
                    "Tháng 5",
                    "Tháng 6",
                    "Tháng 7",
                    "Tháng 8",
                    "Tháng 9",
                    "Tháng 10",
                    "Tháng 11",
                    "Tháng 12",
                ][day.getMonth()],
                monthNumber: day.getMonth(),
            }));

            result.push({
                weekNumber: week,
                days: weekDays,
                months,
            });
        }

        return result;
    }, [displayWeeks, startDate]);

    // Các tuần và ngày đã tính toán
    const weeksWithDates = useMemo(() => calculateDatesForWeeks(), [calculateDatesForWeeks]);

    // Tạo bảng lịch học theo định dạng trong ảnh
    const customScheduleTable = useMemo(() => {
        if (!classes.length) {
            return (
                <Box display="flex" justifyContent="center" my={4}>
                    <Typography>Không có lớp nào trong chuyên ngành đã chọn</Typography>
                </Box>
            );
        }

        // Tập hợp tất cả các ngày và tính toán các nhóm tháng
        const allDays = weeksWithDates.reduce((acc, week) => [...acc, ...week.days], []);
        const monthGroups = [];
        let currentMonth = null;
        let count = 0;

        allDays.forEach((day, idx) => {
            const monthNumber = day.getMonth();
            const monthName = [
                "Tháng 1",
                "Tháng 2",
                "Tháng 3",
                "Tháng 4",
                "Tháng 5",
                "Tháng 6",
                "Tháng 7",
                "Tháng 8",
                "Tháng 9",
                "Tháng 10",
                "Tháng 11",
                "Tháng 12",
            ][monthNumber];

            if (currentMonth === null || currentMonth.monthNumber !== monthNumber) {
                if (currentMonth !== null) {
                    monthGroups.push({ month: currentMonth.monthName, count });
                }
                currentMonth = { monthNumber, monthName };
                count = 1;
            } else {
                count++;
            }

            if (idx === allDays.length - 1) {
                monthGroups.push({ month: currentMonth.monthName, count });
            }
        });

        return (
            <TableContainer component={Paper} sx={{ overflow: "auto" }}>
                <Table size="small" sx={{ minWidth: 800 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                rowSpan={3}
                                align="center"
                                sx={{ minWidth: 80, borderRight: "1px solid rgba(224, 224, 224, 1)" }}
                            >
                                Đơn vị
                            </TableCell>
                            <TableCell
                                rowSpan={3}
                                align="center"
                                sx={{ minWidth: 50, borderRight: "1px solid rgba(224, 224, 224, 1)" }}
                            >
                                Tiết
                            </TableCell>
                            {monthGroups.map((group, idx) => (
                                <TableCell
                                    key={`month-${idx}`}
                                    colSpan={group.count}
                                    align="center"
                                    sx={{
                                        backgroundColor: "#ffffff",
                                        fontWeight: "bold",
                                        borderBottom: "1px solid rgba(224, 224, 224, 1)",
                                        borderRight: "1px solid rgba(224, 224, 224, 1)",
                                    }}
                                >
                                    {group.month}
                                </TableCell>
                            ))}
                        </TableRow>

                        <TableRow>
                            {weeksWithDates.map((week) => (
                                <TableCell
                                    key={`week-${week.weekNumber}`}
                                    colSpan={7}
                                    align="center"
                                    sx={{
                                        fontWeight: "bold",
                                        backgroundColor: "#ffffff",
                                        borderBottom: "1px solid rgba(224, 224, 224, 1)",
                                        borderRight: "1px solid rgba(224, 224, 224, 1)",
                                    }}
                                >
                                    Tuần {week.weekNumber}
                                </TableCell>
                            ))}
                        </TableRow>

                        <TableRow>
                            {" "}
                            {weeksWithDates.map((week) =>
                                week.days.map((date, dayIndex) => {
                                    const day = date.getDate();
                                    const isWeekend = dayIndex === 5 || dayIndex === 6;

                                    return (
                                        <TableCell
                                            key={`${week.weekNumber}-day-${dayIndex}`}
                                            align="center"
                                            sx={{
                                                minWidth: 60,
                                                backgroundColor: "#ffffff",
                                                borderRight: "1px solid rgba(224, 224, 224, 1)",
                                                padding: "4px",
                                                fontWeight: "bold",
                                                color: isWeekend ? "#757575" : "inherit",
                                            }}
                                        >
                                            {day}
                                        </TableCell>
                                    );
                                })
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {classes.map((cls) =>
                            [
                                { start: 1, end: 2, label: "1-2" },
                                { start: 3, end: 4, label: "3-4" },
                                { start: 5, end: 6, label: "5-6" },
                                { start: 7, end: 8, label: "7-8" },
                                { start: 9, end: 9, label: "9" },
                            ].map((periodGroup, periodIndex) => (
                                <TableRow key={`${cls._id}-${periodGroup.label}`}>
                                    {periodIndex === 0 && (
                                        <TableCell
                                            rowSpan={5}
                                            align="center"
                                            sx={{
                                                fontWeight: "bold",
                                                backgroundColor: "#ffffff",
                                                borderRight: "1px solid rgba(224, 224, 224, 1)",
                                            }}
                                        >
                                            {cls.name}
                                        </TableCell>
                                    )}
                                    <TableCell
                                        align="center"
                                        sx={{
                                            fontWeight: "bold",
                                            backgroundColor: "#ffffff",
                                            borderRight: "1px solid rgba(224, 224, 224, 1)",
                                        }}
                                    >
                                        {periodGroup.label}
                                    </TableCell>
                                    {weeksWithDates.map((week) =>
                                        week.days.map((date, dayIndex) => (
                                            <TableCell
                                                key={`${cls._id}-${week.weekNumber}-${dayIndex}-${periodGroup.label}`}
                                                align="center"
                                                padding="none"
                                                sx={{
                                                    height: 40,
                                                    borderRight:
                                                        dayIndex === 6
                                                            ? "2px solid rgba(224, 224, 224, 1)"
                                                            : "1px solid rgba(224, 224, 224, 1)",
                                                    borderBottom: "1px solid rgba(224, 224, 224, 1)",
                                                    backgroundColor: "#ffffff",
                                                }}
                                            >
                                                {renderScheduleCell(cls._id, periodGroup.start, date)}
                                            </TableCell>
                                        ))
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }, [classes, renderScheduleCell, weeksWithDates]); // Hiển thị chú thích

    const legend = (
        <Box mb={2} display="flex" gap={2} flexWrap="wrap">
            <Tooltip title="Tiết học lý thuyết">
                <Chip label="Lý thuyết" sx={{ backgroundColor: "#ffffff", color: "#000000" }} />
            </Tooltip>
            <Tooltip title="Tiết học thực hành">
                <Chip
                    label="Thực hành"
                    sx={{
                        backgroundColor: "#ffffff",
                        color: "#000000",
                        textDecoration: "underline",
                    }}
                />
            </Tooltip>{" "}
            <Tooltip title="Tiết tự học (Ôn)">
                <Chip
                    label="Ôn"
                    sx={{
                        backgroundColor: "#ffffff",
                        color: "#000000",
                    }}
                />
            </Tooltip>
            <Tooltip title="Thời gian bảo quản thiết bị">
                <Chip
                    label="Bảo quản"
                    sx={{
                        backgroundColor: "#ffffff",
                        color: "#ff9800",
                        fontWeight: "bold",
                    }}
                />
            </Tooltip>
            <Tooltip title="Chào cờ đầu tháng">
                <Box
                    display="flex"
                    alignItems="center"
                    sx={{ backgroundColor: "#ffffff", p: 0.5, borderRadius: "16px" }}
                >
                    <StarIcon color="error" fontSize="small" />
                    <Chip label="Chào cờ" sx={{ ml: 0.5, backgroundColor: "#ffffff" }} />
                </Box>
            </Tooltip>
            <Tooltip title="Sự kiện đặc biệt/ngày nghỉ lễ">
                <Box display="flex" alignItems="center">
                    <EventIcon color="secondary" fontSize="small" />
                    <Chip
                        label="Sự kiện đặc biệt"
                        sx={{
                            ml: 0.5,
                            backgroundColor: "#ffffff",
                            color: "#f44336",
                        }}
                    />
                </Box>
            </Tooltip>
            <Tooltip title="Kiểm tra/thi">
                <Box display="flex" alignItems="center">
                    <Chip label="Kiểm tra/thi" sx={{ ml: 0.5, border: "1px solid red", backgroundColor: "#ffffff" }} />
                </Box>
            </Tooltip>
        </Box>
    );

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Lịch học</Typography>
                <Box>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        component={Link}
                        to="/schedule/generate"
                        sx={{ mr: 1 }}
                    >
                        Tạo lịch
                    </Button>
                    <Button variant="outlined" startIcon={<PrintIcon />}>
                        In lịch
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>Chuyên ngành</InputLabel>
                        <Select
                            value={selectedDepartment}
                            label="Chuyên ngành"
                            onChange={handleDepartmentChange}
                            disabled={loading}
                        >
                            {departments.map((dept) => (
                                <MenuItem key={dept._id} value={dept._id}>
                                    {dept.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {startDate && endDate && (
                    <Grid item xs={12} md={4}>
                        <Box display="flex" justifyContent="flex-end" alignItems="center">
                            <Typography variant="body2" color="textSecondary">
                                Khoảng thời gian: {formatDate(startDate)} - {formatDate(endDate)}
                            </Typography>
                        </Box>
                    </Grid>
                )}

                <Grid item xs={12} md={4}>
                    <Box display="flex" justifyContent="flex-end" alignItems="center">
                        <FormControlLabel
                            control={
                                <Switch checked={showSelfStudy} onChange={(e) => setShowSelfStudy(e.target.checked)} />
                            }
                            label="Hiển thị tiết tự học"
                        />
                    </Box>
                </Grid>
            </Grid>

            {/* Tabs để chọn nhóm tuần */}
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>{scheduleTabs}</Box>

            {legend}

            {loading ? (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            ) : (
                customScheduleTable
            )}
        </Container>
    );
};

export default Schedule;
