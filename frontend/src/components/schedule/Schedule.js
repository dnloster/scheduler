import React, { useState, useEffect, useMemo } from "react";
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
import { Add as AddIcon, Print as PrintIcon, Star as StarIcon } from "@mui/icons-material";
import { getSchedules } from "../../api/scheduleService";
import { getDepartments } from "../../api/departmentService";
import { getClassesByDepartmentId } from "../../api/classService";

const Schedule = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [departments, setDepartments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [startWeek, setStartWeek] = useState(1);
    const [tabValue, setTabValue] = useState(0);

    // Số tuần hiển thị cùng lúc
    const weeksToShow = 5;

    // Số tiết trong một ngày
    const periodsPerDay = 9;

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
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu ban đầu:", error);
                setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Tải danh sách lớp khi thay đổi khoa
    useEffect(() => {
        const fetchClasses = async () => {
            if (!selectedDepartment) return;

            setLoading(true);
            setError(null);
            try {
                const classesResponse = await getClassesByDepartmentId(selectedDepartment);
                setClasses(classesResponse || []);
            } catch (error) {
                console.error("Lỗi khi tải danh sách lớp:", error);
                setError("Không thể tải danh sách lớp. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, [selectedDepartment]);

    // Xử lý thay đổi khoa
    const handleDepartmentChange = (event) => {
        setSelectedDepartment(event.target.value);
    };

    // Xử lý thay đổi tab
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        // Mỗi tab hiển thị 5 tuần, nên tính tuần bắt đầu dựa vào tab được chọn
        setStartWeek(newValue * weeksToShow + 1);
    };

    // Tạo các tabs cho tuần học
    const scheduleTabs = useMemo(() => {
        // Giả sử có tổng cộng 50 tuần
        const totalWeeks = 50;
        const tabCount = Math.ceil(totalWeeks / weeksToShow);

        return (
            <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
                {Array.from({ length: tabCount }).map((_, index) => {
                    const start = index * weeksToShow + 1;
                    const end = Math.min((index + 1) * weeksToShow, totalWeeks);
                    return <Tab key={index} label={`Tuần ${start}-${end}`} />;
                })}
            </Tabs>
        );
    }, [tabValue]);

    // Tính toán các tuần hiển thị
    const displayWeeks = useMemo(() => {
        const weeks = [];
        for (let i = 0; i < weeksToShow; i++) {
            const weekNumber = startWeek + i;
            if (weekNumber <= 50) {
                // Giả sử tối đa 50 tuần
                weeks.push(weekNumber);
            }
        }
        return weeks;
    }, [startWeek]);

    // Tìm thông tin lịch học cho một lớp, tiết và tuần cụ thể
    const getScheduleForClassPeriodWeek = (classId, period, weekNumber, dayOfWeek) => {
        return schedules.find(
            (schedule) =>
                schedule.class_id === classId &&
                schedule.week_number === weekNumber &&
                schedule.day_of_week === dayOfWeek &&
                isPeriodInTimeRange(period, schedule.start_time, schedule.end_time)
        );
    };

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
    const renderScheduleCell = (classId, period, weekNumber, dayOfWeek) => {
        const schedule = getScheduleForClassPeriodWeek(classId, period, weekNumber, dayOfWeek);

        if (!schedule) {
            return null;
        }

        // Hiển thị mã môn học
        return (
            <Box
                sx={{
                    backgroundColor: schedule.is_practical ? "#e3f2fd" : "#e8f5e9",
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
            </Box>
        );
    };

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

                            {displayWeeks.map((week) => (
                                <TableCell key={week} colSpan={5} align="center">
                                    Tuần {week}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            {displayWeeks.map((week) =>
                                // 5 ngày trong tuần (Thứ 2 - Thứ 6)
                                Array.from({ length: 5 }).map((_, dayIndex) => {
                                    // Tính toán ngày tháng dựa vào tuần
                                    // Giả sử ngày bắt đầu năm học là 1/9/2023 (có thể điều chỉnh)
                                    const startDate = new Date(2023, 8, 1); // Tháng bắt đầu từ 0
                                    const dayOfWeek = dayIndex + 1; // 0: Thứ 2, 1: Thứ 3, ..., 4: Thứ 6

                                    // Tính số ngày cần cộng thêm: (tuần - 1) * 7 + dayOfWeek
                                    const daysToAdd = (week - 1) * 7 + dayOfWeek;
                                    const currentDate = new Date(startDate);
                                    currentDate.setDate(startDate.getDate() + daysToAdd);

                                    const day = currentDate.getDate();
                                    const month = currentDate.getMonth() + 1;

                                    return (
                                        <TableCell key={`${week}-${dayIndex + 2}`} align="center" sx={{ minWidth: 60 }}>
                                            {day}/{month}
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
                                    {displayWeeks.map((week) =>
                                        // 5 ngày trong tuần (Thứ 2 - Thứ 6)
                                        Array.from({ length: 5 }).map((_, dayIndex) => {
                                            const dayOfWeek = dayIndex + 2; // Thứ 2 = 2, ..., Thứ 6 = 6
                                            return (
                                                <TableCell
                                                    key={`${cls._id}-${week}-${dayOfWeek}-${periodGroup.label}`}
                                                    align="center"
                                                    padding="none"
                                                    sx={{ height: 40 }}
                                                >
                                                    {/* Hiển thị lịch cho tiết đầu tiên trong nhóm tiết */}
                                                    {renderScheduleCell(cls._id, periodGroup.start, week, dayOfWeek)}
                                                </TableCell>
                                            );
                                        })
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }, [classes, displayWeeks, schedules]);

    // Hiển thị chú thích
    const legend = (
        <Box mb={2} display="flex" gap={2} flexWrap="wrap">
            <Tooltip title="Tiết học lý thuyết">
                <Chip label="Lý thuyết" sx={{ backgroundColor: "#e8f5e9" }} />
            </Tooltip>
            <Tooltip title="Tiết học thực hành">
                <Chip label="Thực hành" sx={{ backgroundColor: "#e3f2fd" }} />
            </Tooltip>
            <Tooltip title="Chào cờ buổi sáng thứ 2 đầu tháng">
                <Box display="flex" alignItems="center">
                    <StarIcon color="error" fontSize="small" />
                    <Chip label="Chào cờ" sx={{ ml: 0.5, border: "1px solid red" }} />
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
