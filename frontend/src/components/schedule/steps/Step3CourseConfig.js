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
    ListSubheader,
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
        const course = courseConfigs.find((c) => c.id === courseId);
        if (!course || (course.code !== "V30" && course.code !== "V31")) {
            return;
        }

        // Cấu hình mặc định cho V30/V31
        const defaultConfig = {
            specialScheduling: "both", // học song song và xếp kín lịch
            examPhase1Hours: 30,
            examPhase1Duration: 6,
            examPhase1Morning: true,
            examPhase2Hours: 60,
            examPhase2Duration: 6,
            examPhase2Morning: true,
            examPhase3Hours: 90,
            examPhase3Duration: 6,
            examPhase3Morning: true,
            examPhase4Hours: 120,
            examPhase4Duration: 6,
            examPhase4Morning: true,
            examPhase5Hours: 150,
            examPhase5Duration: 6,
            examPhase5Morning: true,
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
                                                                        Học cả sáng và chiều
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
                                                    {" "}
                                                    <MenuItem value="">Không có yêu cầu đặc biệt</MenuItem>
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
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    {" "}
                                    <TableCell>Mã môn</TableCell>
                                    <TableCell>Tên môn học</TableCell>
                                    <TableCell align="center">Loại</TableCell>
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
                                                )}{" "}
                                            </TableCell>{" "}
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
