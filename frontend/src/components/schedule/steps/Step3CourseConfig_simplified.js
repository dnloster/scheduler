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

const Step3CourseConfig = ({ scheduleConfig, setScheduleConfig }) => {
    // Handle configuration updates
    const handleConfigUpdate = (field, value) => {
        setScheduleConfig((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, display: "flex", alignItems: "center" }}>
                <AssessmentIcon sx={{ mr: 2, color: "primary.main" }} />
                Cấu hình kiểm tra và lịch thi
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Cấu hình các thông số chung cho việc sắp xếp lịch kiểm tra và lịch thi của tất cả các môn học. Cấu hình
                chi tiết cho từng môn học được thực hiện trong phần quản lý môn học.
            </Typography>

            <Grid container spacing={3}>
                {/* Basic Exam Configuration */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
                                <ScheduleIcon sx={{ mr: 1, color: "primary.main" }} />
                                Cấu hình lịch thi cơ bản
                            </Typography>

                            <Grid container spacing={3} sx={{ mt: 1 }}>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Thời gian thi ưu tiên</InputLabel>
                                        <Select
                                            value={scheduleConfig.preferredExamTime || "morning"}
                                            onChange={(e) => handleConfigUpdate("preferredExamTime", e.target.value)}
                                            label="Thời gian thi ưu tiên"
                                        >
                                            <MenuItem value="morning">Buổi sáng</MenuItem>
                                            <MenuItem value="afternoon">Buổi chiều</MenuItem>
                                            <MenuItem value="both">Cả buổi sáng và chiều</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Thời lượng thi mặc định (tiết)"
                                        type="number"
                                        fullWidth
                                        value={scheduleConfig.defaultExamDuration || 6}
                                        onChange={(e) =>
                                            handleConfigUpdate("defaultExamDuration", parseInt(e.target.value) || 6)
                                        }
                                        inputProps={{ min: 1, max: 12 }}
                                        helperText="Thời lượng mặc định cho các bài thi (1-12 tiết)"
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Khoảng cách tối thiểu giữa các buổi thi (ngày)"
                                        type="number"
                                        fullWidth
                                        value={scheduleConfig.minExamGap || 1}
                                        onChange={(e) =>
                                            handleConfigUpdate("minExamGap", parseInt(e.target.value) || 1)
                                        }
                                        inputProps={{ min: 0, max: 7 }}
                                        helperText="Số ngày tối thiểu giữa các buổi thi liên tiếp"
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Số buổi thi tối đa mỗi tuần"
                                        type="number"
                                        fullWidth
                                        value={scheduleConfig.maxExamsPerWeek || 3}
                                        onChange={(e) =>
                                            handleConfigUpdate("maxExamsPerWeek", parseInt(e.target.value) || 3)
                                        }
                                        inputProps={{ min: 1, max: 6 }}
                                        helperText="Giới hạn số buổi thi trong một tuần"
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Periodic Test Configuration */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
                                <AccessTimeIcon sx={{ mr: 1, color: "primary.main" }} />
                                Cấu hình kiểm tra định kỳ
                            </Typography>

                            <Grid container spacing={3} sx={{ mt: 1 }}>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={scheduleConfig.enablePeriodicTests || false}
                                                onChange={(e) =>
                                                    handleConfigUpdate("enablePeriodicTests", e.target.checked)
                                                }
                                            />
                                        }
                                        label="Bật kiểm tra định kỳ"
                                    />
                                </Grid>

                                {scheduleConfig.enablePeriodicTests && (
                                    <>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Chu kỳ kiểm tra (tuần)"
                                                type="number"
                                                fullWidth
                                                value={scheduleConfig.periodicTestInterval || 4}
                                                onChange={(e) =>
                                                    handleConfigUpdate(
                                                        "periodicTestInterval",
                                                        parseInt(e.target.value) || 4
                                                    )
                                                }
                                                inputProps={{ min: 1, max: 12 }}
                                                helperText="Số tuần giữa các lần kiểm tra định kỳ"
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Thời lượng kiểm tra định kỳ (tiết)"
                                                type="number"
                                                fullWidth
                                                value={scheduleConfig.periodicTestDuration || 2}
                                                onChange={(e) =>
                                                    handleConfigUpdate(
                                                        "periodicTestDuration",
                                                        parseInt(e.target.value) || 2
                                                    )
                                                }
                                                inputProps={{ min: 1, max: 6 }}
                                                helperText="Thời lượng cho mỗi bài kiểm tra định kỳ"
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <FormControl fullWidth>
                                                <InputLabel>Thời gian kiểm tra định kỳ</InputLabel>
                                                <Select
                                                    value={scheduleConfig.periodicTestTime || "morning"}
                                                    onChange={(e) =>
                                                        handleConfigUpdate("periodicTestTime", e.target.value)
                                                    }
                                                    label="Thời gian kiểm tra định kỳ"
                                                >
                                                    <MenuItem value="morning">Chỉ buổi sáng</MenuItem>
                                                    <MenuItem value="afternoon">Chỉ buổi chiều</MenuItem>
                                                    <MenuItem value="both">Cả buổi sáng và chiều</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Global Timing Preferences */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Tùy chọn thời gian toàn cục
                            </Typography>

                            <Grid container spacing={3} sx={{ mt: 1 }}>
                                <Grid item xs={12} md={4}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={scheduleConfig.avoidFridayExams || false}
                                                onChange={(e) =>
                                                    handleConfigUpdate("avoidFridayExams", e.target.checked)
                                                }
                                            />
                                        }
                                        label="Tránh thi vào thứ 6"
                                    />
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={scheduleConfig.prioritizeMorningExams || true}
                                                onChange={(e) =>
                                                    handleConfigUpdate("prioritizeMorningExams", e.target.checked)
                                                }
                                            />
                                        }
                                        label="Ưu tiên thi buổi sáng"
                                    />
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={scheduleConfig.allowBackToBackExams || false}
                                                onChange={(e) =>
                                                    handleConfigUpdate("allowBackToBackExams", e.target.checked)
                                                }
                                            />
                                        }
                                        label="Cho phép thi liên tiếp"
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
                <Alert severity="info" icon={<InfoOutlinedIcon />}>
                    <Typography variant="subtitle2">Lưu ý:</Typography>
                    <Typography variant="body2">
                        Đây là cấu hình chung cho toàn bộ hệ thống lịch thi. Cấu hình chi tiết cho từng môn học (số
                        tiết, phân bổ lý thuyết/thực hành, ghép lớp, v.v.) được thực hiện trong phần{" "}
                        <strong>Quản lý môn học</strong> với giao diện tab mới.
                        <br />
                        <br />
                        Các môn học đặc biệt như V30/V31 sẽ có cấu hình riêng biệt được xử lý tự động thông qua các
                        handler chuyên biệt.
                    </Typography>
                </Alert>
            </Box>
        </Box>
    );
};

export default Step3CourseConfig;
