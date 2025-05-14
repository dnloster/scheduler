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
} from "@mui/material";
import { Add as AddIcon, Print as PrintIcon, Star as StarIcon, Event as EventIcon } from "@mui/icons-material";
import { getSchedules } from "../../api/scheduleService";
import { getDepartments } from "../../api/departmentService";
import { getClassesByDepartmentId } from "../../api/classService";
import { formatDate, isHoliday } from "../../utils/scheduleDisplayUtils";

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

                // Tải lịch học
                const schedulesResponse = await getSchedules();
                setSchedules(schedulesResponse || []);

                // Xác định ngày bắt đầu và kết thúc từ dữ liệu lịch học
                if (schedulesResponse && schedulesResponse.length > 0) {
                    const dates = schedulesResponse.filter((s) => s.actual_date).map((s) => new Date(s.actual_date));

                    if (dates.length > 0) {
                        const minDate = new Date(Math.min(...dates));
                        const maxDate = new Date(Math.max(...dates));
                        setStartDate(minDate);
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
                setClasses(classesResponse || []);

                // Tải lịch học cho khoa đã chọn
                const params = { department_id: selectedDepartment };
                const schedulesResponse = await getSchedules(params);
                setSchedules(schedulesResponse || []);

                // Cập nhật ngày bắt đầu và kết thúc
                if (schedulesResponse && schedulesResponse.length > 0) {
                    const dates = schedulesResponse.filter((s) => s.actual_date).map((s) => new Date(s.actual_date));

                    if (dates.length > 0) {
                        const minDate = new Date(Math.min(...dates));
                        const maxDate = new Date(Math.max(...dates));
                        setStartDate(minDate);
                        setEndDate(maxDate);
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
    };

    // Tạo các tabs cho tuần học
    const scheduleTabs = useMemo(() => {
        // Giả sử có tổng cộng 50 tuần
        const totalWeeks = 50;
        const tabCount = Math.ceil(totalWeeks / WEEKS_TO_SHOW);

        return (
            <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
                {Array.from({ length: tabCount }).map((_, index) => {
                    const start = index * WEEKS_TO_SHOW + 1;
                    const end = Math.min((index + 1) * WEEKS_TO_SHOW, totalWeeks);
                    return <Tab key={index} label={`Tuần ${start}-${end}`} />;
                })}
            </Tabs>
        );
    }, [tabValue]);

    // Tính toán các tuần hiển thị
    const displayWeeks = useMemo(() => {
        const weeks = [];
        for (let i = 0; i < WEEKS_TO_SHOW; i++) {
            const weekNumber = startWeek + i;
            if (weekNumber <= 50) {
                // Giả sử tối đa 50 tuần
                weeks.push(weekNumber);
            }
        }
        return weeks;
    }, [startWeek]);

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
                    scheduleDate.getFullYear() === compareDate.getFullYear();

                return (
                    schedule.class === classId &&
                    sameDay &&
                    isPeriodInTimeRange(period, schedule.start_time, schedule.end_time)
                );
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

            if (!schedule) {
                return null;
            }

            // Kiểm tra xem đây có phải là ngày lễ/sự kiện đặc biệt không
            const isSpecialEvent = !!schedule.special_event;
            const isSelfStudy = schedule.is_self_study;

            // Xác định màu sắc ô dựa vào loại lịch học
            let bgColor = "#ffffff"; // Mặc định

            if (isSpecialEvent) {
                bgColor = "#ffebee"; // Hồng nhạt cho sự kiện đặc biệt
            } else if (isSelfStudy) {
                bgColor = "#fff9c4"; // Vàng nhạt cho tiết tự học
            } else if (schedule.is_practical) {
                bgColor = "#e3f2fd"; // Xanh nhạt cho thực hành
            } else {
                bgColor = "#e8f5e9"; // Xanh lá nhạt cho lý thuyết
            }

            // Hiển thị mã môn học
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
                    }}
                >
                    {schedule.course_code || ""}
                    {schedule.is_exam && <StarIcon color="error" fontSize="small" sx={{ ml: 0.5 }} />}
                    {isSpecialEvent && <EventIcon color="secondary" fontSize="small" sx={{ ml: 0.5 }} />}
                </Box>
            );
        },
        [getScheduleForClassPeriodDay]
    ); // Tính ngày từ tuần được hiển thị
    const calculateDatesForWeeks = useCallback(() => {
        if (!startDate) return [];

        const result = [];

        for (const week of displayWeeks) {
            // Tính ngày bắt đầu của tuần
            const weekStart = new Date(startDate);
            weekStart.setDate(weekStart.getDate() + (week - 1) * 7);

            // Thêm 5 ngày trong tuần (thứ 2 đến thứ 6)
            const weekDays = [];
            for (let i = 0; i < 5; i++) {
                const day = new Date(weekStart);
                day.setDate(weekStart.getDate() + i);
                weekDays.push(day);
            }

            result.push({ weekNumber: week, days: weekDays });
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

        return (
            <TableContainer component={Paper} sx={{ overflow: "auto" }}>
                <Table size="small" sx={{ minWidth: 800 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell rowSpan={2} align="center" sx={{ minWidth: 80 }}>
                                Đơn vị
                            </TableCell>
                            <TableCell rowSpan={2} align="center" sx={{ minWidth: 50 }}>
                                Tiết
                            </TableCell>

                            {weeksWithDates.map((week) => (
                                <TableCell key={week.weekNumber} colSpan={5} align="center">
                                    Tuần {week.weekNumber}
                                </TableCell>
                            ))}
                        </TableRow>{" "}
                        <TableRow>
                            {weeksWithDates.map((week) =>
                                week.days.map((date, dayIndex) => {
                                    const isHolidayDate = isHoliday(date);

                                    return (
                                        <TableCell
                                            key={`${week.weekNumber}-day-${dayIndex}`}
                                            align="center"
                                            sx={{
                                                minWidth: 60,
                                                backgroundColor: isHolidayDate ? "#ffebee" : "inherit",
                                            }}
                                        >
                                            {formatDate(date)}
                                        </TableCell>
                                    );
                                })
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {classes.map((cls) =>
                            // Mỗi lớp sẽ có 9 tiết học mỗi ngày, nhưng nhóm lại thành 5 hàng
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
                                            sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                                        >
                                            {cls.name}
                                        </TableCell>
                                    )}
                                    <TableCell align="center" sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
                                        {periodGroup.label}
                                    </TableCell>

                                    {weeksWithDates.map((week) =>
                                        week.days.map((date, dayIndex) => (
                                            <TableCell
                                                key={`${cls._id}-${week.weekNumber}-${dayIndex}-${periodGroup.label}`}
                                                align="center"
                                                padding="none"
                                                sx={{ height: 40 }}
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
    }, [classes, renderScheduleCell, weeksWithDates]);

    // Hiển thị chú thích
    const legend = (
        <Box mb={2} display="flex" gap={2} flexWrap="wrap">
            <Tooltip title="Tiết học lý thuyết">
                <Chip label="Lý thuyết" sx={{ backgroundColor: "#e8f5e9" }} />
            </Tooltip>
            <Tooltip title="Tiết học thực hành">
                <Chip label="Thực hành" sx={{ backgroundColor: "#e3f2fd" }} />
            </Tooltip>
            <Tooltip title="Tiết tự học">
                <Chip label="Tự học" sx={{ backgroundColor: "#fff9c4" }} />
            </Tooltip>
            <Tooltip title="Sự kiện đặc biệt/ngày nghỉ lễ">
                <Box display="flex" alignItems="center">
                    <EventIcon color="secondary" fontSize="small" />
                    <Chip label="Sự kiện đặc biệt" sx={{ ml: 0.5, backgroundColor: "#ffebee" }} />
                </Box>
            </Tooltip>
            <Tooltip title="Kiểm tra/thi">
                <Box display="flex" alignItems="center">
                    <StarIcon color="error" fontSize="small" />
                    <Chip label="Kiểm tra/thi" sx={{ ml: 0.5, border: "1px solid red" }} />
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
                    <Grid item xs={12} md={8}>
                        <Box display="flex" justifyContent="flex-end" alignItems="center">
                            <Typography variant="body2" color="textSecondary">
                                Khoảng thời gian: {formatDate(startDate)} - {formatDate(endDate)}
                            </Typography>
                        </Box>
                    </Grid>
                )}
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
