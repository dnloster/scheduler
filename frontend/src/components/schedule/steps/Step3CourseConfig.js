import React from "react";
import {
    Box,
    Typography,
    Paper,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Alert,
    Divider,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Tooltip,
    IconButton,
    Chip,
    FormControlLabel,
    Checkbox,
    Button,
} from "@mui/material";
import {
    School as SchoolIcon,
    Help as HelpIcon,
    Event as EventIcon,
    Edit as EditIcon,
    Info as InfoOutlinedIcon,
    FormatListBulleted as FormatListBulletedIcon,
    AutoFixHigh as AutoFixHighIcon,
} from "@mui/icons-material";

const Step3CourseConfig = ({
    courseConfigs,
    selectedCourseForConfig,
    setSelectedCourseForConfig,
    handleUpdateCourseConfig,
}) => {
    const applyDefaultV30V31Config = (courseId) => {
        const course = courseConfigs.find((course) => course.id === courseId);

        if (!course || (course.code !== "V30" && course.code !== "V31")) return;

        // Default configuration for examination phases
        const examPhases = [
            { hours: 132, duration: 6, morning: true },
            { hours: 99, duration: 6, morning: true },
            { hours: 136, duration: 6, morning: true },
            { hours: 79, duration: 6, morning: true },
            { hours: 81, duration: 6, morning: true },
        ];

        // Apply configuration
        handleUpdateCourseConfig(courseId, "specialScheduling", "both");
        handleUpdateCourseConfig(courseId, "endWithFinalExam", true);

        examPhases.forEach((phase, index) => {
            handleUpdateCourseConfig(courseId, `examPhase${index + 1}Hours`, phase.hours);
            handleUpdateCourseConfig(courseId, `examPhase${index + 1}Duration`, phase.duration);
            handleUpdateCourseConfig(courseId, `examPhase${index + 1}Morning`, phase.morning);
        });
    };

    return (
        <Box>
            <Paper elevation={1} sx={{ p: 3, mb: 3, borderLeft: "4px solid #2196f3" }}>
                <Typography variant="h6" gutterBottom color="info.main">
                    Cấu hình môn học
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Cấu hình chi tiết cho từng môn học để tối ưu hóa việc xếp lịch. Mỗi thay đổi sẽ ảnh hưởng đến kết
                    quả lịch học cuối cùng.
                </Typography>

                <Box sx={{ mt: 2, mb: 2 }}>
                    <Alert severity="info" icon={<InfoOutlinedIcon />}>
                        <Typography variant="subtitle2">Lưu ý về cấu hình môn học</Typography>
                        <Typography variant="body2">
                            Hệ thống chỉ cho phép cấu hình các môn học không có môn con (môn học độc lập) và các môn học
                            con. Các môn học cha không cần cấu hình vì thời lượng và các thông số của chúng sẽ được tính
                            toán dựa trên các môn học con.
                        </Typography>
                    </Alert>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel id="select-course-label">Chọn môn học</InputLabel>
                            <Select
                                labelId="select-course-label"
                                id="select-course"
                                value={selectedCourseForConfig || ""}
                                label="Chọn môn học"
                                onChange={(e) => setSelectedCourseForConfig(e.target.value)}
                                startAdornment={
                                    <Box component="span" sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                                        <SchoolIcon color="info" fontSize="small" />
                                    </Box>
                                }
                                sx={{ mb: 2 }}
                            >
                                <MenuItem value="">
                                    <em>-- Chọn môn học để cấu hình --</em>
                                </MenuItem>

                                {/* Môn học độc lập (không phải môn học cha) */}
                                <MenuItem
                                    disabled
                                    sx={{ opacity: 0.7, fontStyle: "italic", bgcolor: "background.paper" }}
                                >
                                    Môn học độc lập
                                </MenuItem>
                                {courseConfigs
                                    .filter((course) => {
                                        // Lấy môn học không phải là con của môn nào
                                        const isSubcourse =
                                            course.parent_course !== null && course.parent_course !== undefined;

                                        // Kiểm tra xem môn này có môn con nào không
                                        const hasChildren = courseConfigs.some(
                                            (c) =>
                                                c.parent_course === course.id ||
                                                (c.parent_course &&
                                                    (c.parent_course._id === course.id ||
                                                        c.parent_course.id === course.id))
                                        );

                                        // Chỉ lấy môn không phải môn con và không có môn con nào
                                        return !isSubcourse && !hasChildren;
                                    })
                                    .map((course) => (
                                        <MenuItem key={course.id} value={course.id} sx={{ fontWeight: "medium" }}>
                                            {course.code} - {course.name} ({course.totalHours} tiết)
                                        </MenuItem>
                                    ))}

                                {/* Môn học con */}
                                <Divider sx={{ my: 1 }} />
                                <MenuItem
                                    disabled
                                    sx={{ opacity: 0.7, fontStyle: "italic", bgcolor: "background.paper" }}
                                >
                                    Môn học con
                                </MenuItem>
                                {courseConfigs
                                    .filter(
                                        (course) => course.parent_course !== null && course.parent_course !== undefined
                                    )
                                    .map((course) => (
                                        <MenuItem key={course.id} value={course.id} sx={{ pl: 4 }}>
                                            {course.code} - {course.name} ({course.totalHours} tiết)
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
                            {selectedCourseForConfig ? (
                                <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ width: "100%" }}>
                                    Đang cấu hình môn:{" "}
                                    <strong>
                                        {courseConfigs.find((course) => course.id === selectedCourseForConfig)?.name}
                                    </strong>
                                </Alert>
                            ) : (
                                <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ width: "100%" }}>
                                    Vui lòng chọn một môn học để tiến hành cấu hình chi tiết
                                </Alert>
                            )}
                        </Box>
                    </Grid>
                </Grid>

                {selectedCourseForConfig && (
                    <Box
                        sx={{
                            mt: 3,
                            p: 3,
                            backgroundColor: "rgba(33, 150, 243, 0.05)",
                            borderRadius: 2,
                            border: "1px solid rgba(33, 150, 243, 0.2)",
                        }}
                    >
                        {(() => {
                            const selectedCourse = courseConfigs.find(
                                (course) => course.id === selectedCourseForConfig
                            );
                            const isSpecialCourse = selectedCourse?.code === "V30" || selectedCourse?.code === "V31";
                            return (
                                <Grid spacing={3}>
                                    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                                        <Grid size={6}>
                                            <TextField
                                                label="Tổng số tiết"
                                                type="number"
                                                fullWidth
                                                value={selectedCourse?.totalHours || 0}
                                                onChange={(e) =>
                                                    handleUpdateCourseConfig(
                                                        selectedCourseForConfig,
                                                        "totalHours",
                                                        parseInt(e.target.value) || 0
                                                    )
                                                }
                                                InputProps={{
                                                    startAdornment: <EventIcon color="info" sx={{ mr: 1 }} />,
                                                }}
                                                helperText="Tổng số tiết cho môn học này trong học kỳ"
                                            />
                                        </Grid>
                                        <Grid size={6}>
                                            <TextField
                                                label="Ghép lớp"
                                                fullWidth
                                                value={selectedCourse?.groupedClasses || ""}
                                                onChange={(e) =>
                                                    handleUpdateCourseConfig(
                                                        selectedCourseForConfig,
                                                        "groupedClasses",
                                                        e.target.value
                                                    )
                                                }
                                                helperText="Định dạng: 'A,B|C,D|E,F' để ghép lớp A với B, C với D, E với F"
                                            />
                                        </Grid>
                                    </Grid>
                                    <Grid sx={{ xs: 12 }}>
                                        <Divider sx={{ my: 2 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Ràng buộc học tập
                                            </Typography>
                                        </Divider>
                                    </Grid>
                                    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                                        <Grid size={6}>
                                            <TextField
                                                label="Số tiết tối đa mỗi tuần"
                                                type="number"
                                                value={selectedCourse?.maxHoursPerWeek || ""}
                                                onChange={(e) =>
                                                    handleUpdateCourseConfig(
                                                        selectedCourseForConfig,
                                                        "maxHoursPerWeek",
                                                        e.target.value ? parseInt(e.target.value) : null
                                                    )
                                                }
                                                fullWidth
                                                helperText="Để trống nếu không có giới hạn"
                                            />
                                        </Grid>

                                        <Grid size={6}>
                                            <TextField
                                                label="Số tiết tối đa mỗi ngày"
                                                type="number"
                                                value={selectedCourse?.maxHoursPerDay || ""}
                                                onChange={(e) =>
                                                    handleUpdateCourseConfig(
                                                        selectedCourseForConfig,
                                                        "maxHoursPerDay",
                                                        e.target.value ? parseInt(e.target.value) : null
                                                    )
                                                }
                                                fullWidth
                                                helperText="Để trống nếu không có giới hạn"
                                            />
                                        </Grid>
                                    </Grid>{" "}
                                    {/* Regular exam information - hidden for V30/V31 courses */}
                                    {!isSpecialCourse && (
                                        <>
                                            <Grid sx={{ xs: 12 }}>
                                                <Divider sx={{ my: 2 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Thông tin thi
                                                    </Typography>
                                                </Divider>
                                            </Grid>
                                            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                                                <Grid size={6}>
                                                    <TextField
                                                        label="Số ngày tối thiểu trước khi thi"
                                                        type="number"
                                                        value={selectedCourse?.minDaysBeforeExam || 0}
                                                        onChange={(e) =>
                                                            handleUpdateCourseConfig(
                                                                selectedCourseForConfig,
                                                                "minDaysBeforeExam",
                                                                parseInt(e.target.value) || 0
                                                            )
                                                        }
                                                        fullWidth
                                                        helperText="Số ngày nghỉ tối thiểu trước khi thi"
                                                    />
                                                </Grid>

                                                <Grid size={6}>
                                                    <TextField
                                                        label="Thời gian thi (tiết)"
                                                        type="number"
                                                        value={selectedCourse?.examDuration || 0}
                                                        onChange={(e) =>
                                                            handleUpdateCourseConfig(
                                                                selectedCourseForConfig,
                                                                "examDuration",
                                                                parseInt(e.target.value) || 0
                                                            )
                                                        }
                                                        fullWidth
                                                        helperText="Số tiết dành cho thi môn học này"
                                                    />
                                                </Grid>
                                            </Grid>
                                        </>
                                    )}
                                    {/* Special configuration for V30 and V31 */}
                                    {isSpecialCourse && (
                                        <Grid sx={{ xs: 12 }}>
                                            <Divider sx={{ my: 2 }}>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ display: "flex", alignItems: "center" }}
                                                >
                                                    <InfoOutlinedIcon
                                                        fontSize="small"
                                                        sx={{ mr: 1, color: "warning.main" }}
                                                    />
                                                    Cấu hình đặc biệt cho môn V30/V31
                                                </Typography>
                                            </Divider>{" "}
                                            <Alert severity="warning" sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2">
                                                    Cấu hình kiểm tra theo giai đoạn cho môn V30/V31
                                                </Typography>
                                                <Typography variant="body2">
                                                    Hai môn này có 5 đề mục kiểm tra. Mỗi đề mục kiểm tra 6 tiết sau khi
                                                    hoàn thành một số tiết học nhất định. Số tiết được tính là tổng số
                                                    tiết của cả 2 môn V30 và V31 học song song (không bắt buộc số tiết
                                                    của từng môn bằng nhau).
                                                </Typography>
                                            </Alert>
                                            <FormControl fullWidth sx={{ mb: 2 }}>
                                                <InputLabel>Yêu cầu xếp lịch đặc biệt</InputLabel>
                                                <Select
                                                    value={selectedCourse?.specialScheduling || ""}
                                                    onChange={(e) =>
                                                        handleUpdateCourseConfig(
                                                            selectedCourseForConfig,
                                                            "specialScheduling",
                                                            e.target.value
                                                        )
                                                    }
                                                    label="Yêu cầu xếp lịch đặc biệt"
                                                >
                                                    <MenuItem value="">Không có yêu cầu đặc biệt</MenuItem>
                                                    <MenuItem value="paired">
                                                        Học song song với môn{" "}
                                                        {selectedCourse?.code === "V30" ? "V31" : "V30"}
                                                    </MenuItem>
                                                    <MenuItem value="continuous">
                                                        Xếp kín lịch từ đầu đến cuối khóa học
                                                    </MenuItem>
                                                    <MenuItem value="both">Cả hai yêu cầu trên</MenuItem>
                                                </Select>
                                            </FormControl>
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Cấu hình đề mục kiểm tra
                                                </Typography>

                                                {[1, 2, 3, 4, 5].map((index) => (
                                                    <Box
                                                        key={index}
                                                        sx={{
                                                            display: "flex",
                                                            gap: 2,
                                                            mb: 2,
                                                            p: 2,
                                                            border: "1px solid rgba(0, 0, 0, 0.12)",
                                                            borderRadius: 1,
                                                            bgcolor: "background.paper",
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                minWidth: 80,
                                                                display: "flex",
                                                                alignItems: "center",
                                                            }}
                                                        >
                                                            Đề mục {index}:
                                                        </Typography>
                                                        <TextField
                                                            label={`Sau số tiết`}
                                                            type="number"
                                                            size="small"
                                                            value={selectedCourse?.[`examPhase${index}Hours`] || ""}
                                                            onChange={(e) =>
                                                                handleUpdateCourseConfig(
                                                                    selectedCourseForConfig,
                                                                    `examPhase${index}Hours`,
                                                                    parseInt(e.target.value) || 0
                                                                )
                                                            }
                                                            sx={{ width: "30%" }}
                                                        />
                                                        <TextField
                                                            label="Số tiết kiểm tra"
                                                            type="number"
                                                            size="small"
                                                            value={selectedCourse?.[`examPhase${index}Duration`] || 6}
                                                            onChange={(e) =>
                                                                handleUpdateCourseConfig(
                                                                    selectedCourseForConfig,
                                                                    `examPhase${index}Duration`,
                                                                    parseInt(e.target.value) || 6
                                                                )
                                                            }
                                                            sx={{ width: "30%" }}
                                                        />
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={
                                                                        selectedCourse?.[`examPhase${index}Morning`] ||
                                                                        false
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleUpdateCourseConfig(
                                                                            selectedCourseForConfig,
                                                                            `examPhase${index}Morning`,
                                                                            e.target.checked
                                                                        )
                                                                    }
                                                                />
                                                            }
                                                            label="Buổi sáng"
                                                        />
                                                    </Box>
                                                ))}
                                            </Box>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={selectedCourse?.endWithFinalExam || false}
                                                        onChange={(e) =>
                                                            handleUpdateCourseConfig(
                                                                selectedCourseForConfig,
                                                                "endWithFinalExam",
                                                                e.target.checked
                                                            )
                                                        }
                                                    />
                                                }
                                                label="Kết thúc môn học bằng Đề mục 5"
                                            />
                                            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                                                <Button
                                                    variant="outlined"
                                                    color="secondary"
                                                    onClick={() => applyDefaultV30V31Config(selectedCourseForConfig)}
                                                    startIcon={<AutoFixHighIcon />}
                                                >
                                                    Áp dụng cấu hình mặc định cho {selectedCourse?.code}
                                                </Button>
                                            </Box>
                                        </Grid>
                                    )}
                                </Grid>
                            );
                        })()}
                    </Box>
                )}

                {/* Hiển thị tổng quan các môn đã cấu hình */}
                <Box sx={{ mt: 4 }}>
                    <Typography
                        variant="subtitle1"
                        gutterBottom
                        color="info.main"
                        sx={{ display: "flex", alignItems: "center" }}
                    >
                        <FormatListBulletedIcon sx={{ mr: 1 }} />
                        Tổng quan các môn học cần cấu hình
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Mã môn</TableCell>
                                    <TableCell>Tên môn học</TableCell>
                                    <TableCell align="center">Loại</TableCell>
                                    <TableCell align="center">Tổng số tiết</TableCell>
                                    <TableCell align="center">Lớp ghép</TableCell>
                                    <TableCell align="center">Tiết/tuần</TableCell>
                                    <TableCell align="center">Tiết/ngày</TableCell>
                                    <TableCell align="center">Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {courseConfigs
                                    .filter((course) => {
                                        // Lấy môn học con
                                        const isSubcourse =
                                            course.parent_course !== null && course.parent_course !== undefined;

                                        // Kiểm tra xem môn này có môn con nào không
                                        const hasChildren = courseConfigs.some(
                                            (c) =>
                                                c.parent_course === course.id ||
                                                (c.parent_course &&
                                                    (c.parent_course._id === course.id ||
                                                        c.parent_course.id === course.id))
                                        );

                                        // Chỉ lấy môn độc lập (không phải môn con và không có môn con) hoặc môn con
                                        return isSubcourse || !hasChildren;
                                    })
                                    .map((course) => (
                                        <TableRow
                                            key={course.id}
                                            hover
                                            selected={selectedCourseForConfig === course.id}
                                            sx={{
                                                "&.Mui-selected": {
                                                    backgroundColor: "rgba(33, 150, 243, 0.12)",
                                                },
                                                "&.Mui-selected:hover": {
                                                    backgroundColor: "rgba(33, 150, 243, 0.15)",
                                                },
                                            }}
                                        >
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
                                            <TableCell align="center">{course.totalHours}</TableCell>
                                            <TableCell align="center">
                                                {course.groupedClasses ? (
                                                    <Chip
                                                        size="small"
                                                        label={course.groupedClasses}
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">
                                                        -
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                {course.maxHoursPerWeek ? course.maxHoursPerWeek : "-"}
                                            </TableCell>
                                            <TableCell align="center">
                                                {course.maxHoursPerDay ? course.maxHoursPerDay : "-"}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Cấu hình môn học">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => setSelectedCourseForConfig(course.id)}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Paper>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Alert severity="info" icon={<HelpIcon />} sx={{ width: "100%" }}>
                    <Typography variant="subtitle2">Mẹo:</Typography>
                    <Typography variant="body2">
                        Chọn một môn học từ danh sách để cấu hình chi tiết. Bảng tổng quan bên dưới hiển thị tất cả các
                        môn học và cấu hình hiện tại của chúng.
                    </Typography>
                </Alert>
            </Box>
        </Box>
    );
};

export default Step3CourseConfig;
