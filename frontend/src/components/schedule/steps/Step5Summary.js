import React from "react";
import {
    Box,
    Typography,
    Paper,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Button,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    AlertTitle,
    Chip,
} from "@mui/material";
import {
    EventAvailable as EventAvailableIcon,
    School as SchoolIcon,
    Check as CheckIcon,
    Warning as WarningIcon,
    ReplayCircleFilled as ReplayIcon,
    CalendarMonth as CalendarIcon,
    Celebration as CelebrationIcon,
    CalendarViewMonth as CalendarViewMonthIcon,
    Done as DoneIcon,
} from "@mui/icons-material";

const Step5Summary = ({
    departments,
    selectedDepartment,
    startDate,
    endDate,
    totalWeeks,
    eventsData,
    customEvents,
    courseConfigs,
    loading,
    success,
    handleGenerateSchedule,
    handleReset,
    navigate,
    formatDate,
}) => {
    // Tìm tên chuyên ngành đã chọn
    const selectedDepartmentName =
        departments.find((dept) => dept._id === selectedDepartment || dept.id === selectedDepartment)?.name ||
        "Không xác định";

    // Đếm số sự kiện đã chọn
    const selectedEventsCount = eventsData.filter((event) => event.selected !== false).length + customEvents.length;

    // Danh sách môn học đã cấu hình (chỉ hiển thị những môn đã được cấu hình chi tiết)
    const configuredCourses = courseConfigs.filter(
        (course) => course.totalHours > 0 || course.groupedClasses || course.maxHoursPerWeek || course.maxHoursPerDay
    );

    return (
        <Box>
            <Paper elevation={1} sx={{ p: 3, mb: 3, borderLeft: "4px solid #9c27b0" }}>
                <Typography variant="h6" gutterBottom color="secondary.main">
                    Tổng hợp thông tin lịch học
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                    Kiểm tra thông tin dưới đây trước khi tạo lịch học
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ height: "100%" }}>
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <SchoolIcon color="secondary" sx={{ mr: 1 }} />
                                    <Typography variant="h6">Thông tin cơ bản</Typography>
                                </Box>
                                <List dense disablePadding>
                                    <ListItem>
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <CheckIcon color="success" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary="Chuyên ngành" secondary={selectedDepartmentName} />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <CheckIcon color="success" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Thời gian"
                                            secondary={`Từ ${formatDate(startDate)} đến ${formatDate(endDate)}`}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <CheckIcon color="success" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary="Tổng số tuần" secondary={`${totalWeeks} tuần`} />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ height: "100%" }}>
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <EventAvailableIcon color="secondary" sx={{ mr: 1 }} />
                                    <Typography variant="h6">Sự kiện đặc biệt</Typography>
                                </Box>
                                <List dense disablePadding>
                                    <ListItem>
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <CheckIcon color="success" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Sự kiện đã chọn"
                                            secondary={`${selectedEventsCount} sự kiện`}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <CheckIcon color="success" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Sự kiện tùy chỉnh"
                                            secondary={`${customEvents.length} sự kiện`}
                                        />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Card variant="outlined">
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <CalendarIcon color="secondary" sx={{ mr: 1 }} />
                                    <Typography variant="h6">
                                        Môn học đã cấu hình ({configuredCourses.length})
                                    </Typography>
                                </Box>

                                {configuredCourses.length > 0 ? (
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Mã môn</TableCell>
                                                    <TableCell>Tên môn học</TableCell>
                                                    <TableCell align="center">Loại</TableCell>
                                                    <TableCell align="right">Số tiết</TableCell>
                                                    <TableCell align="right">Thi (tiết)</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {configuredCourses.map((course) => (
                                                    <TableRow key={course.id}>
                                                        <TableCell>{course.code}</TableCell>
                                                        <TableCell>
                                                            {course.parent_course && (
                                                                <Box component="span" sx={{ mr: 1 }}>
                                                                    ↪
                                                                </Box>
                                                            )}
                                                            {course.name}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {course.parent_course ? (
                                                                <Chip
                                                                    size="small"
                                                                    label="Môn con"
                                                                    color="secondary"
                                                                    variant="outlined"
                                                                />
                                                            ) : (
                                                                <Chip
                                                                    size="small"
                                                                    label="Độc lập"
                                                                    color="primary"
                                                                    variant="outlined"
                                                                />
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="right">{course.totalHours}</TableCell>
                                                        <TableCell align="right">
                                                            {course.examDuration > 0 ? course.examDuration : "-"}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Box
                                        sx={{
                                            p: 2,
                                            bgcolor: "background.paper",
                                            borderRadius: 1,
                                            border: "1px dashed grey",
                                            textAlign: "center",
                                        }}
                                    >
                                        <WarningIcon color="warning" />
                                        <Typography variant="body2" color="text.secondary">
                                            Chưa có môn học nào được cấu hình
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {success ? (
                    <Box sx={{ mt: 3, textAlign: "center" }}>
                        <Alert severity="success" icon={<CelebrationIcon fontSize="inherit" />} sx={{ mb: 3 }}>
                            <AlertTitle>Thành công!</AlertTitle>
                            Lịch học đã được tạo thành công. Bạn có thể xem lịch học hoặc tạo lịch mới.
                        </Alert>

                        <Box>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<CalendarViewMonthIcon />}
                                onClick={() => navigate("/schedule")}
                                sx={{ mr: 2 }}
                            >
                                Xem lịch học
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                startIcon={<ReplayIcon />}
                                onClick={handleReset}
                            >
                                Tạo lịch mới
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ mt: 4, textAlign: "center" }}>
                        <Button
                            variant="contained"
                            color="secondary"
                            size="large"
                            startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <DoneIcon />}
                            onClick={handleGenerateSchedule}
                            disabled={loading || configuredCourses.length === 0}
                        >
                            {loading ? "Đang tạo lịch..." : "Tạo lịch học"}
                        </Button>

                        {configuredCourses.length === 0 && (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                Bạn cần cấu hình ít nhất một môn học để có thể tạo lịch.
                            </Alert>
                        )}

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            Nhấn nút để tạo lịch học dựa trên thông tin đã cấu hình
                        </Typography>
                    </Box>
                )}
            </Paper>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Alert severity="info" sx={{ width: "100%" }}>
                    <AlertTitle>Lưu ý</AlertTitle>
                    <Typography variant="body2">
                        Quá trình tạo lịch có thể mất một chút thời gian tùy thuộc vào độ phức tạp của dữ liệu. Vui lòng
                        kiên nhẫn chờ đợi trong khi hệ thống tạo lịch học tối ưu.
                    </Typography>
                </Alert>
            </Box>
        </Box>
    );
};

export default Step5Summary;
