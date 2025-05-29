import React, { useState, useEffect } from "react";
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
    Button,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Switch,
    Tooltip,
    IconButton,
    Card,
    CardContent,
    CardHeader,
} from "@mui/material";
import {
    ExpandMore as ExpandMoreIcon,
    School as SchoolIcon,
    AccessTime as AccessTimeIcon,
    Assignment as AssignmentIcon,
    Settings as SettingsIcon,
    Info as InfoIcon,
    AutoFixHigh as AutoFixHighIcon,
    Restore as RestoreIcon,
} from "@mui/icons-material";
import { getCourseHandler } from "../../api/courseHandlerService";

const CourseConfigurationForm = ({ course, onConfigurationChange }) => {
    const [configuration, setConfiguration] = useState({
        // Cấu hình cơ bản
        maxHoursPerWeek: null,
        maxHoursPerDay: null,
        maxMorningHours: null,
        maxAfternoonHours: null,

        // Cấu hình ghép lớp
        allowGroupedClasses: false,
        theoryGroupedClasses: "",
        practicalGroupedClasses: "",

        // Cấu hình thời gian
        canBeMorning: true,
        canBeAfternoon: true,
        preferredTimeSlots: [],
        avoidTimeSlots: [],

        // Cấu hình thi và kiểm tra
        minDaysBeforeExam: 3,
        examDuration: 6,
        hasPeriodicTests: false,
        periodicTestCount: 0,
        periodicTestDuration: 6,

        // Cấu hình đặc biệt cho môn học có handler
        useSpecialHandler: false,
        handlerConfiguration: null,

        // Cấu hình yêu cầu đặc biệt
        requireConsecutiveHours: false,
        specialSchedulingRequirements: "",
        notes: "",
    });

    const [courseHandler, setCourseHandler] = useState(null);
    const [expanded, setExpanded] = useState("basic");

    useEffect(() => {
        // Load course handler information
        const loadCourseHandler = async () => {
            if (course?.code) {
                try {
                    const handler = await getCourseHandler(course.code);
                    setCourseHandler(handler);

                    if (handler?.matches) {
                        setConfiguration((prev) => ({
                            ...prev,
                            useSpecialHandler: true,
                            handlerConfiguration: handler,
                        }));
                    }
                } catch (error) {
                    // No handler found - this is normal for most courses
                    setCourseHandler(null);
                }
            }
        };

        loadCourseHandler();
    }, [course?.code]);

    useEffect(() => {
        // Load existing configuration from course constraints if available
        if (course?.constraints) {
            setConfiguration((prev) => ({
                ...prev,
                ...course.constraints,
            }));
        }
    }, [course?.constraints]);

    const handleChange = (field, value) => {
        setConfiguration((prev) => {
            const newConfig = { ...prev, [field]: value };
            onConfigurationChange && onConfigurationChange(newConfig);
            return newConfig;
        });
    };

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const applyHandlerDefaults = () => {
        if (!courseHandler?.matches) return;

        const handlerConstraints = courseHandler.constraints;
        const newConfig = { ...configuration };

        if (handlerConstraints.is_paired_course) {
            newConfig.useSpecialHandler = true;
            newConfig.hasPeriodicTests = true;
            newConfig.periodicTestCount = handlerConstraints.exam_phases || 5;
            newConfig.specialSchedulingRequirements = "paired_course";
        }

        if (handlerConstraints.has_practical_component) {
            newConfig.practicalGroupedClasses = "";
            newConfig.theoryGroupedClasses = "A,B|C,D|E,F";
        }

        setConfiguration(newConfig);
        onConfigurationChange && onConfigurationChange(newConfig);
    };

    const resetToDefaults = () => {
        const defaultConfig = {
            maxHoursPerWeek: null,
            maxHoursPerDay: null,
            maxMorningHours: null,
            maxAfternoonHours: null,
            allowGroupedClasses: false,
            theoryGroupedClasses: "",
            practicalGroupedClasses: "",
            canBeMorning: true,
            canBeAfternoon: true,
            preferredTimeSlots: [],
            avoidTimeSlots: [],
            minDaysBeforeExam: 3,
            examDuration: 6,
            hasPeriodicTests: false,
            periodicTestCount: 0,
            periodicTestDuration: 6,
            useSpecialHandler: false,
            handlerConfiguration: null,
            requireConsecutiveHours: false,
            specialSchedulingRequirements: "",
            notes: "",
        };

        setConfiguration(defaultConfig);
        onConfigurationChange && onConfigurationChange(defaultConfig);
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Paper elevation={2} sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <SettingsIcon sx={{ mr: 2, color: "primary.main" }} />
                    <Typography variant="h6" color="primary.main">
                        Cấu hình môn học
                    </Typography>
                    <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                        {courseHandler?.matches && (
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<AutoFixHighIcon />}
                                onClick={applyHandlerDefaults}
                                color="secondary"
                            >
                                Áp dụng cấu hình mặc định
                            </Button>
                        )}
                        <Button variant="outlined" size="small" startIcon={<RestoreIcon />} onClick={resetToDefaults}>
                            Khôi phục mặc định
                        </Button>
                    </Box>
                </Box>

                {courseHandler?.matches && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="subtitle2">Môn học đặc biệt: {courseHandler.name}</Typography>
                        <Typography variant="body2">
                            Môn học này có handler đặc biệt với các cấu hình tự động. Bạn có thể sử dụng cấu hình mặc
                            định hoặc tùy chỉnh theo nhu cầu.
                        </Typography>
                    </Alert>
                )}

                {/* Basic Configuration */}
                <Accordion expanded={expanded === "basic"} onChange={handleAccordionChange("basic")} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <SchoolIcon sx={{ mr: 1, color: "primary.main" }} />
                            <Typography variant="subtitle1">Cấu hình cơ bản</Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Số tiết tối đa/tuần"
                                    type="number"
                                    value={configuration.maxHoursPerWeek || ""}
                                    onChange={(e) =>
                                        handleChange(
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
                                    label="Số tiết tối đa/ngày"
                                    type="number"
                                    value={configuration.maxHoursPerDay || ""}
                                    onChange={(e) =>
                                        handleChange("maxHoursPerDay", e.target.value ? parseInt(e.target.value) : null)
                                    }
                                    fullWidth
                                    helperText="Để trống nếu không có giới hạn"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Số tiết tối đa buổi sáng"
                                    type="number"
                                    value={configuration.maxMorningHours || ""}
                                    onChange={(e) =>
                                        handleChange(
                                            "maxMorningHours",
                                            e.target.value ? parseInt(e.target.value) : null
                                        )
                                    }
                                    fullWidth
                                    helperText="Để trống nếu không có giới hạn"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Số tiết tối đa buổi chiều"
                                    type="number"
                                    value={configuration.maxAfternoonHours || ""}
                                    onChange={(e) =>
                                        handleChange(
                                            "maxAfternoonHours",
                                            e.target.value ? parseInt(e.target.value) : null
                                        )
                                    }
                                    fullWidth
                                    helperText="Để trống nếu không có giới hạn"
                                />
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                {/* Time Configuration */}
                <Accordion expanded={expanded === "time"} onChange={handleAccordionChange("time")} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <AccessTimeIcon sx={{ mr: 1, color: "primary.main" }} />
                            <Typography variant="subtitle1">Cấu hình thời gian</Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={configuration.canBeMorning}
                                            onChange={(e) => handleChange("canBeMorning", e.target.checked)}
                                        />
                                    }
                                    label="Có thể học buổi sáng"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={configuration.canBeAfternoon}
                                            onChange={(e) => handleChange("canBeAfternoon", e.target.checked)}
                                        />
                                    }
                                    label="Có thể học buổi chiều"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={configuration.requireConsecutiveHours}
                                            onChange={(e) => handleChange("requireConsecutiveHours", e.target.checked)}
                                        />
                                    }
                                    label="Yêu cầu xếp tiết học liên tục (không có khoảng trống)"
                                />
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                {/* Class Grouping Configuration */}
                <Accordion
                    expanded={expanded === "grouping"}
                    onChange={handleAccordionChange("grouping")}
                    sx={{ mb: 2 }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <SchoolIcon sx={{ mr: 1, color: "primary.main" }} />
                            <Typography variant="subtitle1">Cấu hình ghép lớp</Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={configuration.allowGroupedClasses}
                                            onChange={(e) => handleChange("allowGroupedClasses", e.target.checked)}
                                        />
                                    }
                                    label="Cho phép ghép lớp"
                                />
                            </Grid>
                            {configuration.allowGroupedClasses && (
                                <>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Ghép lớp lý thuyết"
                                            value={configuration.theoryGroupedClasses}
                                            onChange={(e) => handleChange("theoryGroupedClasses", e.target.value)}
                                            fullWidth
                                            helperText="Ví dụ: A,B|C,D|E,F"
                                            placeholder="A,B|C,D|E,F"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Ghép lớp thực hành"
                                            value={configuration.practicalGroupedClasses}
                                            onChange={(e) => handleChange("practicalGroupedClasses", e.target.value)}
                                            fullWidth
                                            helperText="Để trống nếu thực hành không ghép lớp"
                                            placeholder="A,B|C,D|E,F"
                                        />
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                {/* Exam Configuration */}
                <Accordion expanded={expanded === "exam"} onChange={handleAccordionChange("exam")} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <AssignmentIcon sx={{ mr: 1, color: "primary.main" }} />
                            <Typography variant="subtitle1">Cấu hình thi và kiểm tra</Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Số ngày nghỉ tối thiểu trước khi thi"
                                    type="number"
                                    value={configuration.minDaysBeforeExam}
                                    onChange={(e) => handleChange("minDaysBeforeExam", parseInt(e.target.value) || 3)}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Thời gian thi (tiết)"
                                    type="number"
                                    value={configuration.examDuration}
                                    onChange={(e) => handleChange("examDuration", parseInt(e.target.value) || 6)}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={configuration.hasPeriodicTests}
                                            onChange={(e) => handleChange("hasPeriodicTests", e.target.checked)}
                                        />
                                    }
                                    label="Có kiểm tra định kỳ"
                                />
                            </Grid>
                            {configuration.hasPeriodicTests && (
                                <>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Số lần kiểm tra định kỳ"
                                            type="number"
                                            value={configuration.periodicTestCount}
                                            onChange={(e) =>
                                                handleChange("periodicTestCount", parseInt(e.target.value) || 0)
                                            }
                                            fullWidth
                                            inputProps={{ min: 1, max: 10 }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Thời gian kiểm tra định kỳ (tiết)"
                                            type="number"
                                            value={configuration.periodicTestDuration}
                                            onChange={(e) =>
                                                handleChange("periodicTestDuration", parseInt(e.target.value) || 6)
                                            }
                                            fullWidth
                                        />
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                {/* Special Requirements */}
                <Accordion expanded={expanded === "special"} onChange={handleAccordionChange("special")} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <InfoIcon sx={{ mr: 1, color: "primary.main" }} />
                            <Typography variant="subtitle1">Yêu cầu đặc biệt</Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Yêu cầu xếp lịch đặc biệt</InputLabel>
                                    <Select
                                        value={configuration.specialSchedulingRequirements}
                                        onChange={(e) => handleChange("specialSchedulingRequirements", e.target.value)}
                                        label="Yêu cầu xếp lịch đặc biệt"
                                    >
                                        <MenuItem value="">Không có yêu cầu đặc biệt</MenuItem>
                                        <MenuItem value="paired_course">Học song song với môn khác</MenuItem>
                                        <MenuItem value="sequential">Học tuần tự theo thứ tự</MenuItem>
                                        <MenuItem value="continuous">Xếp kín lịch từ đầu đến cuối</MenuItem>
                                        <MenuItem value="morning_only">Chỉ học buổi sáng</MenuItem>
                                        <MenuItem value="afternoon_only">Chỉ học buổi chiều</MenuItem>
                                        <MenuItem value="after_prerequisite">
                                            Học sau khi hoàn thành điều kiện tiên quyết
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Ghi chú"
                                    value={configuration.notes}
                                    onChange={(e) => handleChange("notes", e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    helperText="Các yêu cầu đặc biệt khác không được liệt kê ở trên"
                                />
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                {/* Special Handler Configuration Display */}
                {courseHandler?.matches && (
                    <Card sx={{ mt: 2, border: "1px solid", borderColor: "info.main" }}>
                        <CardHeader
                            avatar={<InfoIcon color="info" />}
                            title="Thông tin Handler đặc biệt"
                            subheader={courseHandler.name}
                        />
                        <CardContent>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Môn học này được xử lý bởi handler đặc biệt với các cấu hình tự động:
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                                {courseHandler.constraints.is_paired_course && (
                                    <Chip label="Môn học cặp" size="small" color="info" sx={{ mr: 1, mb: 1 }} />
                                )}
                                {courseHandler.constraints.exam_phases > 1 && (
                                    <Chip
                                        label={`${courseHandler.constraints.exam_phases} giai đoạn thi`}
                                        size="small"
                                        color="secondary"
                                        sx={{ mr: 1, mb: 1 }}
                                    />
                                )}
                                {courseHandler.constraints.has_practical_component && (
                                    <Chip label="Có thực hành" size="small" color="warning" sx={{ mr: 1, mb: 1 }} />
                                )}
                                {courseHandler.constraints.synchronized_exams && (
                                    <Chip label="Thi đồng bộ" size="small" color="success" sx={{ mr: 1, mb: 1 }} />
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                )}
            </Paper>
        </Box>
    );
};

export default CourseConfigurationForm;
