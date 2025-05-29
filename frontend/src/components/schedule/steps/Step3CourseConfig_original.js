import React, { useState } from "react";
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
    FormControlLabel,
    Checkbox,
    Card,
    CardContent,
} from "@mui/material";
import {
    Schedule as ScheduleIcon,
    AccessTime as AccessTimeIcon,
    Assessment as AssessmentIcon,
    Info as InfoOutlinedIcon,
} from "@mui/icons-material";

const Step3CourseConfig = ({
    scheduleConfig,
    setScheduleConfig,
}) => {
    // Handle configuration updates
    const handleConfigUpdate = (field, value) => {
        setScheduleConfig(prev => ({
            ...prev,
            [field]: value
        }));
    };
    
    const applyDefaultHandlerConfig = async (courseId) => {
        const handlerInfo = courseHandlers[courseId];
        if (!handlerInfo?.hasHandler) {
            return;
        }

        // Apply handler-specific default configuration
        const constraints = handlerInfo.constraints;
        const examStrategy = handlerInfo.examStrategy;

        if (constraints) {
            // Apply constraint-based configuration
            if (constraints.is_paired_course) {
                handleUpdateCourseConfig(courseId, "specialScheduling", "both");
            }
            
            if (constraints.phase_hour_thresholds) {
                handleUpdateCourseConfig(courseId, "hasPhaseExams", true);
                constraints.phase_hour_thresholds.forEach((threshold, index) => {
                    const phaseNum = index + 1;
                    handleUpdateCourseConfig(courseId, `examPhase${phaseNum}Hours`, threshold.cumulative_hours);
                    handleUpdateCourseConfig(courseId, `examPhase${phaseNum}Duration`, 6);
                    handleUpdateCourseConfig(courseId, `examPhase${phaseNum}Morning`, true);
                });
            }

            if (constraints.combined_total_hours) {
                const course = courseConfigs.find((c) => c.id === courseId);
                if (course) {
                    handleUpdateCourseConfig(courseId, "totalV30V31Hours", 
                        handlerInfo.courseCode === "V30" ? 246 : 306);
                }
            }
        }

        if (examStrategy?.phases > 1) {
            handleUpdateCourseConfig(courseId, "endWithFinalExam", true);
        }

        // Remove hour limits for courses with special handlers
        handleUpdateCourseConfig(courseId, "maxHoursPerWeek", null);
        handleUpdateCourseConfig(courseId, "maxHoursPerDay", null);
        handleUpdateCourseConfig(courseId, "maxMorningHours", null);
        handleUpdateCourseConfig(courseId, "maxAfternoonHours", null);
    };

    const applyDefaultV30V31Config = (courseId) => {
        const course = courseConfigs.find((c) => c.id === courseId);
        if (!course || (course.code !== "V30" && course.code !== "V31")) {
            return;
        }

        // Cấu hình đặc biệt cho V30/V31 - Kiểm tra theo giai đoạn (5 đề mục)
        const defaultConfig = {
            // Không giới hạn tiết trong ngày và trong tuần
            maxHoursPerWeek: null,
            maxHoursPerDay: null,
            maxMorningHours: null,
            maxAfternoonHours: null,

            // Cấu hình kiểm tra theo giai đoạn (5 đề mục)
            hasPhaseExams: true,
            totalV30V31Hours: course.code === "V30" ? 246 : 306, // V30: 246 tiết, V31: 306 tiết

            // Đề mục 1: Kiểm tra sau 132 tiết (tổng cộng từ cả V30 + V31)
            examPhase1Hours: 132,
            examPhase1Duration: 6,
            examPhase1Morning: true,

            // Đề mục 2: Kiểm tra sau thêm 99 tiết nữa (từ đề mục 1)
            examPhase2Hours: 99,
            examPhase2Duration: 6,
            examPhase2Morning: true,

            // Đề mục 3: Kiểm tra sau thêm 136 tiết nữa (từ đề mục 2)
            examPhase3Hours: 136,
            examPhase3Duration: 6,
            examPhase3Morning: true,

            // Đề mục 4: Kiểm tra sau thêm 79 tiết nữa (từ đề mục 3)
            examPhase4Hours: 79,
            examPhase4Duration: 6,
            examPhase4Morning: true,

            // Đề mục 5: Kiểm tra sau thêm 81 tiết nữa (từ đề mục 4)
            examPhase5Hours: 81,
            examPhase5Duration: 6,
            examPhase5Morning: true,

            // Học song song và xếp kín lịch
            specialScheduling: "both",
            endWithFinalExam: true,
        };

        // Áp dụng từng cấu hình
        Object.entries(defaultConfig).forEach(([key, value]) => {
            handleUpdateCourseConfig(courseId, key, value);
        });
    };

    // Add function to handle hours update while maintaining consistency
    const handleHoursUpdate = (courseId, field, value) => {
        const course = courseConfigs.find((course) => course.id === courseId);

        if (field === "totalHours") {
            // If total hours is updated, adjust theory and practical hours proportionally
            if (course?.hasPracticalComponent) {
                const currentTheory = course.theory_hours || 0;
                const currentPractical = course.practical_hours || 0;
                const currentTotal = currentTheory + currentPractical;

                if (currentTotal > 0) {
                    // Calculate new values maintaining the same ratio
                    const theoryRatio = currentTheory / currentTotal;
                    const newTheory = Math.round(value * theoryRatio);
                    const newPractical = value - newTheory;

                    handleUpdateCourseConfig(courseId, "theory_hours", newTheory);
                    handleUpdateCourseConfig(courseId, "practical_hours", newPractical);
                } else {
                    // If currently 0, distribute 50/50
                    handleUpdateCourseConfig(courseId, "theory_hours", Math.ceil(value / 2));
                    handleUpdateCourseConfig(courseId, "practical_hours", Math.floor(value / 2));
                }
            }
            handleUpdateCourseConfig(courseId, field, value);
        } else if (field === "theory_hours") {
            // If theory hours change, adjust total and keep practical the same
            const practical_hours = course?.practical_hours || 0;
            handleUpdateCourseConfig(courseId, "totalHours", value + practical_hours);
            handleUpdateCourseConfig(courseId, field, value);
        } else if (field === "practical_hours") {
            // If practical hours change, adjust total and keep theory the same
            const theory_hours = course?.theory_hours || 0;
            handleUpdateCourseConfig(courseId, "totalHours", theory_hours + value);
            handleUpdateCourseConfig(courseId, field, value);
        } else if (field === "hasPracticalComponent") {
            // When toggling practical component
            if (value) {
                // When enabling practical component:
                // 1. Split current total hours
                const totalHours = course?.totalHours || 0;
                handleUpdateCourseConfig(courseId, "theory_hours", Math.ceil(totalHours / 2));
                handleUpdateCourseConfig(courseId, "practical_hours", Math.floor(totalHours / 2));
                // 2. Tự động áp dụng ghép lớp cho phần lý thuyết
                handleUpdateCourseConfig(courseId, "theoryGroupedClasses", "A,B|C,D|E,F");
                // 3. Đảm bảo phần thực hành học tách lớp
                handleUpdateCourseConfig(courseId, "practicalGroupedClasses", "");
            } else {
                // When disabling practical component:
                // 1. Chuyển tất cả sang lý thuyết
                handleUpdateCourseConfig(courseId, "theory_hours", course?.totalHours || 0);
                handleUpdateCourseConfig(courseId, "practical_hours", 0);
                // 2. Xóa các cấu hình ghép lớp riêng
                handleUpdateCourseConfig(courseId, "theoryGroupedClasses", "");
                handleUpdateCourseConfig(courseId, "practicalGroupedClasses", "");
            }
            handleUpdateCourseConfig(courseId, field, value);
            return;
        }

        // Xử lý các thay đổi về số tiết như cũ
        handleUpdateCourseConfig(courseId, field, value);
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
                                {" "}
                                <MenuItem value="">
                                    <em>-- Chọn môn học để cấu hình --</em>
                                </MenuItem>
                                <ListSubheader sx={{ opacity: 0.7, fontStyle: "italic", bgcolor: "background.paper" }}>
                                    Môn học chính
                                </ListSubheader>
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
                </Grid>                {selectedCourseForConfig && (
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
                            const handlerInfo = courseHandlers[selectedCourseForConfig];
                            const hasSpecialHandler = handlerInfo?.hasHandler;
                            const isVietnameseCourse = handlerInfo?.hasHandler && ['V30', 'V31'].includes(handlerInfo.courseCode);                            return (
                                <Grid spacing={3}>
                                    {/* Course Handler Information Display */}
                                    {hasSpecialHandler && (
                                        <Grid container sx={{ mb: 3 }}>
                                            <Grid item xs={12}>
                                                <Alert severity="success" icon={<AutoFixHighIcon />}>
                                                    <Typography variant="subtitle2">
                                                        Đã phát hiện handler đặc biệt cho môn {selectedCourse?.code}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        Handler: <strong>{handlerInfo.handlerName}</strong>
                                                        {handlerInfo.constraints?.is_paired_course && (
                                                            <span> - Môn học ghép đôi</span>
                                                        )}
                                                        {handlerInfo.examStrategy?.phases > 1 && (
                                                            <span> - {handlerInfo.examStrategy.phases} giai đoạn kiểm tra</span>
                                                        )}
                                                    </Typography>
                                                    {handlerInfo.constraints?.phase_hour_thresholds && (
                                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                                            <strong>Lịch kiểm tra theo giai đoạn:</strong>
                                                            {handlerInfo.constraints.phase_hour_thresholds.map((threshold, index) => (
                                                                <span key={index}>
                                                                    {index > 0 && ', '}
                                                                    Giai đoạn {index + 1}: {threshold.cumulative_hours} tiết
                                                                </span>
                                                            ))}
                                                        </Typography>
                                                    )}
                                                </Alert>
                                            </Grid>
                                        </Grid>
                                    )}

                                    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                                        <Grid size={6}>
                                            <TextField
                                                label="Tổng số tiết"
                                                type="number"
                                                fullWidth
                                                value={selectedCourse?.totalHours || 0}
                                                onChange={(e) =>
                                                    handleHoursUpdate(
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
                                        </Grid>{" "}
                                        <Grid size={6}>
                                            <FormControl fullWidth>
                                                {" "}
                                                {!selectedCourse?.hasPracticalComponent && (
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={selectedCourse?.hasGroupedClasses || false}
                                                                onChange={(e) => {
                                                                    const isChecked = e.target.checked;
                                                                    handleUpdateCourseConfig(
                                                                        selectedCourseForConfig,
                                                                        "hasGroupedClasses",
                                                                        isChecked
                                                                    );
                                                                    handleUpdateCourseConfig(
                                                                        selectedCourseForConfig,
                                                                        "groupedClasses",
                                                                        isChecked ? "A,B|C,D|E,F" : ""
                                                                    );
                                                                }}
                                                            />
                                                        }
                                                        label="Ghép lớp (A với B, C với D, E với F)"
                                                    />
                                                )}
                                            </FormControl>
                                        </Grid>{" "}
                                        <Grid size={12}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={selectedCourse?.hasPracticalComponent || false}
                                                        onChange={(e) =>
                                                            handleHoursUpdate(
                                                                selectedCourseForConfig,
                                                                "hasPracticalComponent",
                                                                e.target.checked
                                                            )
                                                        }
                                                    />
                                                }
                                                label="Có thành phần thực hành"
                                            />
                                            {selectedCourse?.hasPracticalComponent && (
                                                <Box sx={{ pl: 4, pt: 1 }}>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={selectedCourse?.practicalAfterTheory || false}
                                                                onChange={(e) =>
                                                                    handleUpdateCourseConfig(
                                                                        selectedCourseForConfig,
                                                                        "practicalAfterTheory",
                                                                        e.target.checked
                                                                    )
                                                                }
                                                            />
                                                        }
                                                        label="Phải học xong lý thuyết mới đến thực hành"
                                                    />
                                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                                        <Grid item xs={12}>
                                                            <FormControl fullWidth>
                                                                <InputLabel>Tiết thực hành</InputLabel>
                                                                <Select
                                                                    value={selectedCourse?.practicalScheduling || ""}
                                                                    onChange={(e) =>
                                                                        handleUpdateCourseConfig(
                                                                            selectedCourseForConfig,
                                                                            "practicalScheduling",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    label="Tiết thực hành"
                                                                >
                                                                    <MenuItem value="">
                                                                        Không có yêu cầu đặc biệt
                                                                    </MenuItem>
                                                                    <MenuItem value="morning">
                                                                        Chỉ học buổi sáng
                                                                    </MenuItem>
                                                                    <MenuItem value="afternoon">
                                                                        Chỉ học buổi chiều
                                                                    </MenuItem>
                                                                    <MenuItem value="both">
                                                                        Chỉ học 2 tiết đầu buổi sáng sáng hoặc buổi
                                                                        chiều
                                                                    </MenuItem>
                                                                </Select>
                                                            </FormControl>
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            )}
                                        </Grid>
                                        {selectedCourse?.hasPracticalComponent && (
                                            <>
                                                <Grid size={6}>
                                                    <TextField
                                                        label="Số tiết lý thuyết"
                                                        type="number"
                                                        fullWidth
                                                        value={selectedCourse?.theory_hours || 0}
                                                        onChange={(e) => {
                                                            handleHoursUpdate(
                                                                selectedCourseForConfig,
                                                                "theory_hours",
                                                                parseInt(e.target.value) || 0
                                                            );
                                                        }}
                                                        helperText="Số tiết dành cho phần lý thuyết (học ghép lớp)"
                                                    />
                                                </Grid>
                                                <Grid size={6}>
                                                    <TextField
                                                        label="Số tiết thực hành"
                                                        type="number"
                                                        fullWidth
                                                        value={selectedCourse?.practical_hours || 0}
                                                        onChange={(e) =>
                                                            handleHoursUpdate(
                                                                selectedCourseForConfig,
                                                                "practical_hours",
                                                                parseInt(e.target.value) || 0
                                                            )
                                                        }
                                                        helperText="Số tiết dành cho phần thực hành (học tách lớp)"
                                                    />
                                                </Grid>
                                            </>
                                        )}
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

                                        <Grid size={6}>
                                            <TextField
                                                label="Số tiết tối đa buổi sáng"
                                                type="number"
                                                value={selectedCourse?.maxMorningHours || ""}
                                                onChange={(e) =>
                                                    handleUpdateCourseConfig(
                                                        selectedCourseForConfig,
                                                        "maxMorningHours",
                                                        e.target.value ? parseInt(e.target.value) : null
                                                    )
                                                }
                                                fullWidth
                                                helperText="Để trống nếu không có giới hạn"
                                            />
                                        </Grid>

                                        <Grid size={6}>
                                            <TextField
                                                label="Số tiết tối đa buổi chiều"
                                                type="number"
                                                value={selectedCourse?.maxAfternoonHours || ""}
                                                onChange={(e) =>
                                                    handleUpdateCourseConfig(
                                                        selectedCourseForConfig,
                                                        "maxAfternoonHours",
                                                        e.target.value ? parseInt(e.target.value) : null
                                                    )
                                                }
                                                fullWidth
                                                helperText="Để trống nếu không có giới hạn"
                                            />
                                        </Grid>
                                    </Grid>
                                    {/* Regular exam information - hidden for V30/V31 courses */}
                                    {!isVietnameseCourse && (
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
                                    )}                                    {/* Special configuration for Vietnamese courses (V30/V31) */}
                                    {isVietnameseCourse && (
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
                                                    Cấu hình kiểm tra kết hợp cho cặp môn V30/V31
                                                </Typography>
                                                <Typography variant="body2">
                                                    <strong>⚠️ LƯU Ý QUAN TRỌNG:</strong> V30 và V31 học song song như
                                                    một khóa học kết hợp. Lịch kiểm tra 5 đề mục được tính dựa trên tổng
                                                    số tiết tích lũy của CẢ HAI môn V30+V31, không phải từng môn riêng
                                                    biệt.
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        mt: 1,
                                                        pl: 2,
                                                        bgcolor: "info.main",
                                                        color: "white",
                                                        p: 1,
                                                        borderRadius: 1,
                                                    }}
                                                >
                                                    <strong>Lịch kiểm tra dựa trên số tiết tích lũy V30+V31:</strong>
                                                    <br />
                                                    • Đề mục 1: Sau 132 tiết tích lũy (V30+V31)
                                                    <br />
                                                    • Đề mục 2: Sau 231 tiết tích lũy (V30+V31)
                                                    <br />
                                                    • Đề mục 3: Sau 367 tiết tích lũy (V30+V31)
                                                    <br />
                                                    • Đề mục 4: Sau 446 tiết tích lũy (V30+V31)
                                                    <br />• Đề mục 5: Sau 527 tiết tích lũy (V30+V31) - kết thúc khóa
                                                </Typography>
                                                <Typography variant="body2" sx={{ mt: 1 }} color="error">
                                                    Tổng số tiết: V30 (246 tiết) + V31 (306 tiết) = 552 tiết
                                                </Typography>
                                            </Alert>{" "}
                                            <FormControl fullWidth sx={{ mb: 2 }}>
                                                <InputLabel>Yêu cầu xếp lịch đặc biệt</InputLabel>
                                                <Select
                                                    value={selectedCourse?.specialScheduling || "both"}
                                                    onChange={(e) =>
                                                        handleUpdateCourseConfig(
                                                            selectedCourseForConfig,
                                                            "specialScheduling",
                                                            e.target.value
                                                        )
                                                    }
                                                    label="Yêu cầu xếp lịch đặc biệt"
                                                >
                                                    {" "}
                                                    <MenuItem value="both">
                                                        ✅ Học song song (V30+V31 cùng lúc) - Chế độ mặc định
                                                    </MenuItem>
                                                    <MenuItem value="sequential">
                                                        ❌ Học tuần tự (Không khuyến khích)
                                                    </MenuItem>
                                                    {(() => {
                                                        if (selectedCourse?.code === "V32") {
                                                            return (
                                                                <MenuItem value="start_after_phase2">
                                                                    Học đầu tháng 9, giữa đề mục 2 và đề mục 3
                                                                </MenuItem>
                                                            );
                                                        }
                                                        if (selectedCourse?.code === "V33") {
                                                            return (
                                                                <MenuItem value="start_after_phase3">
                                                                    Học sau khi kiểm tra xong đề mục 3
                                                                </MenuItem>
                                                            );
                                                        }
                                                        if (selectedCourse?.code === "V34") {
                                                            return (
                                                                <MenuItem value="start_after_phase5">
                                                                    Học sau khi thi xong đề mục 5
                                                                </MenuItem>
                                                            );
                                                        }
                                                        if (
                                                            selectedCourse?.code === "V30" ||
                                                            selectedCourse?.code === "V31"
                                                        ) {
                                                            return [
                                                                <MenuItem key="paired" value="paired">
                                                                    Học song song với môn{" "}
                                                                    {selectedCourse?.code === "V30" ? "V31" : "V30"}
                                                                </MenuItem>,
                                                                <MenuItem key="continuous" value="continuous">
                                                                    Xếp kín lịch từ đầu đến cuối khóa học
                                                                </MenuItem>,
                                                                <MenuItem key="both" value="both">
                                                                    Cả hai yêu cầu trên
                                                                </MenuItem>,
                                                            ];
                                                        }
                                                        return null;
                                                    })()}
                                                </Select>
                                            </FormControl>{" "}
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Cấu hình đề mục kiểm tra (tính tích lũy từ đầu khóa)
                                                </Typography>

                                                {[
                                                    {
                                                        index: 1,
                                                        default: 132,
                                                        description: "Kiểm tra đề mục 1 (sau 132 tiết tích lũy)",
                                                    },
                                                    {
                                                        index: 2,
                                                        default: 99,
                                                        description:
                                                            "Kiểm tra đề mục 2 (sau thêm 99 tiết, tổng 231 tiết)",
                                                    },
                                                    {
                                                        index: 3,
                                                        default: 136,
                                                        description:
                                                            "Kiểm tra đề mục 3 (sau thêm 136 tiết, tổng 367 tiết)",
                                                    },
                                                    {
                                                        index: 4,
                                                        default: 79,
                                                        description:
                                                            "Kiểm tra đề mục 4 (sau thêm 79 tiết, tổng 446 tiết)",
                                                    },
                                                    {
                                                        index: 5,
                                                        default: 81,
                                                        description:
                                                            "Kiểm tra đề mục 5 (sau thêm 81 tiết, tổng 527 tiết - kết thúc)",
                                                    },
                                                ].map(({ index, default: defaultValue, description }) => {
                                                    // Tính tổng tích lũy
                                                    let accumulatedTotal = 0;
                                                    for (let i = 1; i <= index; i++) {
                                                        const phaseHours =
                                                            selectedCourse?.[`examPhase${i}Hours`] ||
                                                            (i === 1
                                                                ? 132
                                                                : i === 2
                                                                ? 99
                                                                : i === 3
                                                                ? 136
                                                                : i === 4
                                                                ? 79
                                                                : 81);
                                                        accumulatedTotal += phaseHours;
                                                    }

                                                    return (
                                                        <Box
                                                            key={index}
                                                            sx={{
                                                                display: "flex",
                                                                gap: 2,
                                                                mb: 2,
                                                                p: 2,
                                                                border: "1px solid rgba(0, 0, 0, 0.12)",
                                                                borderRadius: 1,
                                                                bgcolor:
                                                                    index === 5
                                                                        ? "rgba(255, 193, 7, 0.1)"
                                                                        : "background.paper",
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    minWidth: 120,
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    fontWeight: "medium",
                                                                }}
                                                            >
                                                                Đề mục {index}:
                                                            </Typography>
                                                            <TextField
                                                                label={
                                                                    index === 1 ? "Số tiết từ đầu khóa" : "Thêm số tiết"
                                                                }
                                                                type="number"
                                                                size="small"
                                                                value={
                                                                    selectedCourse?.[`examPhase${index}Hours`] ||
                                                                    defaultValue
                                                                }
                                                                onChange={(e) =>
                                                                    handleUpdateCourseConfig(
                                                                        selectedCourseForConfig,
                                                                        `examPhase${index}Hours`,
                                                                        parseInt(e.target.value) || defaultValue
                                                                    )
                                                                }
                                                                sx={{ width: "180px" }}
                                                                helperText={
                                                                    index === 1
                                                                        ? ""
                                                                        : `Tổng tích lũy: ${accumulatedTotal} tiết`
                                                                }
                                                            />
                                                            <TextField
                                                                label="Số tiết kiểm tra"
                                                                type="number"
                                                                size="small"
                                                                value={
                                                                    selectedCourse?.[`examPhase${index}Duration`] || 6
                                                                }
                                                                onChange={(e) =>
                                                                    handleUpdateCourseConfig(
                                                                        selectedCourseForConfig,
                                                                        `examPhase${index}Duration`,
                                                                        parseInt(e.target.value) || 6
                                                                    )
                                                                }
                                                                sx={{ width: "140px" }}
                                                            />
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox
                                                                        checked={
                                                                            selectedCourse?.[
                                                                                `examPhase${index}Morning`
                                                                            ] || false
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
                                                                sx={{ minWidth: "110px" }}
                                                            />
                                                        </Box>
                                                    );
                                                })}
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
                                            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>                                                <Button
                                                    variant="outlined"
                                                    color="secondary"
                                                    onClick={() => {
                                                        if (isVietnameseCourse) {
                                                            applyDefaultV30V31Config(selectedCourseForConfig);
                                                        } else if (hasSpecialHandler) {
                                                            applyDefaultHandlerConfig(selectedCourseForConfig);
                                                        }
                                                    }}
                                                    startIcon={<AutoFixHighIcon />}
                                                    disabled={!hasSpecialHandler}
                                                >
                                                    Áp dụng cấu hình mặc định cho {selectedCourse?.code}
                                                </Button>
                                            </Box>
                                        </Grid>
                                    )}
                                    {/* Special configuration for V32, V33, V34 */}
                                    {(selectedCourse?.code === "V32" ||
                                        selectedCourse?.code === "V33" ||
                                        selectedCourse?.code === "V34") && (
                                        <>
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
                                                        Cấu hình đặc biệt cho môn {selectedCourse?.code}
                                                    </Typography>
                                                </Divider>

                                                <Alert severity="info" sx={{ mb: 2 }}>
                                                    <Typography variant="subtitle2">
                                                        Yêu cầu xếp lịch đặc biệt
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {selectedCourse?.code === "V32" &&
                                                            "Môn V32 được học đầu tháng 9, nằm giữa đề mục 2 và đề mục 3 của V30/V31"}
                                                        {selectedCourse?.code === "V33" &&
                                                            "Môn V33 chỉ được học sau khi kiểm tra xong đề mục 3 của V30/V31"}
                                                        {selectedCourse?.code === "V34" &&
                                                            "Môn V34 phải xếp lịch vào tuần kế tiếp sau khi thi đề mục 5 của V30/V31, là môn học cuối cùng khi tất cả các môn trên đã kết thúc"}
                                                    </Typography>
                                                </Alert>

                                                <FormControl fullWidth sx={{ mb: 2 }}>
                                                    <InputLabel>Điều kiện xếp lịch</InputLabel>
                                                    <Select
                                                        value={
                                                            selectedCourse?.schedulingCondition ||
                                                            selectedCourse?.code === "V32"
                                                                ? "after_phase2_before_phase3"
                                                                : selectedCourse?.code === "V33"
                                                                ? "after_phase3"
                                                                : "after_phase5"
                                                        }
                                                        onChange={(e) =>
                                                            handleUpdateCourseConfig(
                                                                selectedCourseForConfig,
                                                                "schedulingCondition",
                                                                e.target.value
                                                            )
                                                        }
                                                        label="Điều kiện xếp lịch"
                                                    >
                                                        {(() => {
                                                            switch (selectedCourse?.code) {
                                                                case "V32":
                                                                    return (
                                                                        <MenuItem value="after_phase2_before_phase3">
                                                                            Học sau đề mục 2, trước đề mục 3
                                                                        </MenuItem>
                                                                    );
                                                                case "V33":
                                                                    return (
                                                                        <MenuItem value="after_phase3">
                                                                            Học sau khi thi xong đề mục 3
                                                                        </MenuItem>
                                                                    );
                                                                case "V34":
                                                                    return (
                                                                        <MenuItem value="after_phase5">
                                                                            Học sau khi thi xong đề mục 5
                                                                        </MenuItem>
                                                                    );
                                                                default:
                                                                    return null;
                                                            }
                                                        })()}
                                                    </Select>
                                                </FormControl>

                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={selectedCourse?.requireConsecutiveHours || false}
                                                            onChange={(e) =>
                                                                handleUpdateCourseConfig(
                                                                    selectedCourseForConfig,
                                                                    "requireConsecutiveHours",
                                                                    e.target.checked
                                                                )
                                                            }
                                                        />
                                                    }
                                                    label="Xếp tiết học liên tục trong ngày (không có khoảng trống)"
                                                />
                                            </Grid>
                                        </>
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
                        <Table size="small">                            <TableHead>
                                <TableRow>
                                    <TableCell>Mã môn</TableCell>
                                    <TableCell>Tên môn học</TableCell>
                                    <TableCell align="center">Loại</TableCell>
                                    <TableCell align="center">Handler</TableCell>
                                    <TableCell align="center">Tổng số tiết</TableCell>
                                    <TableCell align="center">LT/TH</TableCell>
                                    <TableCell align="center">Lớp ghép</TableCell>
                                    <TableCell align="center">Tiết/tuần</TableCell>
                                    <TableCell align="center">Tiết/ngày</TableCell>
                                    <TableCell align="center">Sáng</TableCell>
                                    <TableCell align="center">Chiều</TableCell>
                                    <TableCell align="center">Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {courseConfigs
                                    .filter((course) => {
                                        const isSubcourse =
                                            course.parent_course !== null && course.parent_course !== undefined;
                                        const hasChildren = courseConfigs.some(
                                            (c) =>
                                                c.parent_course === course.id ||
                                                (c.parent_course &&
                                                    (c.parent_course._id === course.id ||
                                                        c.parent_course.id === course.id))
                                        );
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
                                            </TableCell>                                            <TableCell align="center">
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
                                            <TableCell align="center">
                                                {(() => {
                                                    const handlerInfo = courseHandlers[course.id];
                                                    if (handlerInfo?.hasHandler) {
                                                        return (
                                                            <Chip
                                                                size="small"
                                                                label={handlerInfo.handlerName || 'Special'}
                                                                color="success"
                                                                variant="outlined"
                                                                icon={<AutoFixHighIcon />}
                                                            />
                                                        );
                                                    }
                                                    return (
                                                        <Typography variant="caption" color="text.secondary">
                                                            Standard
                                                        </Typography>
                                                    );
                                                })()}
                                            </TableCell>
                                            <TableCell align="center">{course.totalHours}</TableCell>
                                            <TableCell align="center">
                                                <Typography variant="caption">
                                                    {course.theory_hours || 0}/{course.practical_hours || 0}
                                                </Typography>
                                            </TableCell>
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
                                                {course.maxMorningHours ? course.maxMorningHours : "-"}
                                            </TableCell>
                                            <TableCell align="center">
                                                {course.maxAfternoonHours ? course.maxAfternoonHours : "-"}
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
