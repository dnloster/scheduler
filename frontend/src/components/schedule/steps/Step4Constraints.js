import React from "react";
import PropTypes from "prop-types";
import {
    Box,
    Typography,
    Paper,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Button,
    Card,
    CardContent,
    CardActions,
    Alert,
    AlertTitle,
    FormGroup,
    Checkbox,
} from "@mui/material";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    School as SchoolIcon,
    AccessTime as AccessTimeIcon,
    Person as PersonIcon,
    Info as InfoIcon,
    SyncAlt as SyncAltIcon,
} from "@mui/icons-material";

const Step4Constraints = ({
    constraints,
    handleAddConstraint,
    handleUpdateConstraint,
    handleRemoveConstraint,
    selectedClasses,
    teachers,
    balanceHoursBetweenClasses,
    setBalanceHoursBetweenClasses,
    avoidEmptySlots,
    setAvoidEmptySlots,
    prioritizeMorningClasses,
    setPrioritizeMorningClasses,
    selfStudyInAfternoon,
    setSelfStudyInAfternoon,
}) => {
    // Định nghĩa ngày trong tuần để chọn
    const daysOfWeek = [
        { id: 1, name: "Chủ Nhật" },
        { id: 2, name: "Thứ Hai" },
        { id: 3, name: "Thứ Ba" },
        { id: 4, name: "Thứ Tư" },
        { id: 5, name: "Thứ Năm" },
        { id: 6, name: "Thứ Sáu" },
        { id: 7, name: "Thứ Bảy" },
    ];

    return (
        <Box>
            <Paper elevation={1} sx={{ p: 3, mb: 3, borderLeft: "4px solid #4caf50" }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom color="success.main">
                            Tối ưu hóa chung
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            Các tùy chọn dưới đây giúp tối ưu hóa lịch học cho tất cả các lớp và môn học.
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={balanceHoursBetweenClasses}
                                        onChange={(e) => setBalanceHoursBetweenClasses(e.target.checked)}
                                        color="success"
                                    />
                                }
                                label="Cân bằng giờ học giữa các lớp"
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                                Phân bổ đều giờ học giữa các lớp trong mỗi tuần
                            </Typography>
                        </FormGroup>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={avoidEmptySlots}
                                        onChange={(e) => setAvoidEmptySlots(e.target.checked)}
                                        color="success"
                                    />
                                }
                                label="Tránh tiết trống giữa các buổi"
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                                Giảm thiểu các tiết trống giữa các buổi học trong ngày
                            </Typography>
                        </FormGroup>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={prioritizeMorningClasses}
                                        onChange={(e) => setPrioritizeMorningClasses(e.target.checked)}
                                        color="success"
                                    />
                                }
                                label="Ưu tiên học buổi sáng"
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                                Xếp lịch học vào buổi sáng nhiều hơn buổi chiều
                            </Typography>
                        </FormGroup>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={selfStudyInAfternoon}
                                        onChange={(e) => setSelfStudyInAfternoon(e.target.checked)}
                                        color="success"
                                    />
                                }
                                label="Tự học vào buổi chiều"
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                                Dành thời gian buổi chiều cho hoạt động tự học
                            </Typography>
                        </FormGroup>
                    </Grid>
                </Grid>
            </Paper>

            <Paper elevation={1} sx={{ p: 3, mb: 3, borderLeft: "4px solid #ff9800" }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" color="warning.main">
                        Ràng buộc bổ sung
                    </Typography>
                    <Box>
                        <Button
                            variant="outlined"
                            color="warning"
                            startIcon={<AddIcon />}
                            onClick={() => handleAddConstraint("time")}
                            sx={{ mr: 1 }}
                        >
                            Thời gian
                        </Button>
                        <Button
                            variant="outlined"
                            color="warning"
                            startIcon={<AddIcon />}
                            onClick={() => handleAddConstraint("class")}
                            sx={{ mr: 1 }}
                        >
                            Lớp học
                        </Button>
                        <Button
                            variant="outlined"
                            color="warning"
                            startIcon={<AddIcon />}
                            onClick={() => handleAddConstraint("teacher")}
                        >
                            Giảng viên
                        </Button>
                    </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" mb={3}>
                    Thêm các ràng buộc bổ sung để tùy chỉnh lịch học theo nhu cầu cụ thể.
                </Typography>

                <Alert severity="info" sx={{ mb: 3 }}>
                    <AlertTitle>Hướng dẫn</AlertTitle>
                    <Typography variant="body2">
                        Nhấn các nút ở trên để thêm ràng buộc về thời gian, lớp học hoặc giảng viên. Bạn có thể thêm
                        nhiều ràng buộc khác nhau để tùy chỉnh lịch học.
                    </Typography>
                </Alert>

                <Grid container spacing={2}>
                    {constraints.length === 0 ? (
                        <Grid item xs={12}>
                            <Box
                                sx={{
                                    border: "1px dashed #ff9800",
                                    borderRadius: 1,
                                    p: 2,
                                    textAlign: "center",
                                    bgcolor: "rgba(255, 152, 0, 0.05)",
                                }}
                            >
                                <InfoIcon color="warning" sx={{ mb: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                    Chưa có ràng buộc nào được thêm. Nhấn các nút ở trên để thêm ràng buộc mới.
                                </Typography>
                            </Box>
                        </Grid>
                    ) : (
                        constraints.map((constraint, index) => (
                            <Grid item xs={12} md={6} key={constraint.id}>
                                <Card variant="outlined" sx={{ position: "relative" }}>
                                    <CardContent>
                                        <Box display="flex" alignItems="center" mb={2}>
                                            {constraint.type === "time" && (
                                                <AccessTimeIcon color="warning" sx={{ mr: 1 }} />
                                            )}
                                            {constraint.type === "class" && (
                                                <SchoolIcon color="warning" sx={{ mr: 1 }} />
                                            )}
                                            {constraint.type === "teacher" && (
                                                <PersonIcon color="warning" sx={{ mr: 1 }} />
                                            )}
                                            <Typography variant="subtitle1">
                                                {constraint.type === "time" && "Ràng buộc thời gian"}
                                                {constraint.type === "class" && "Ràng buộc lớp học"}
                                                {constraint.type === "teacher" && "Ràng buộc giảng viên"}
                                            </Typography>
                                        </Box>

                                        {constraint.type === "time" && (
                                            <Box>
                                                <FormControl fullWidth sx={{ mb: 2 }}>
                                                    <InputLabel>Loại ràng buộc</InputLabel>
                                                    <Select
                                                        value={constraint.subtype}
                                                        label="Loại ràng buộc"
                                                        onChange={(e) =>
                                                            handleUpdateConstraint(index, "subtype", e.target.value)
                                                        }
                                                    >
                                                        <MenuItem value="preferred_days">Ngày ưu tiên</MenuItem>
                                                        <MenuItem value="blocked_days">Ngày không học</MenuItem>
                                                    </Select>
                                                </FormControl>

                                                <Typography variant="subtitle2" gutterBottom>
                                                    {constraint.subtype === "preferred_days"
                                                        ? "Chọn ngày ưu tiên"
                                                        : "Chọn ngày không học"}
                                                </Typography>

                                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                                    {daysOfWeek.map((day) => (
                                                        <FormControlLabel
                                                            key={day.id}
                                                            control={
                                                                <Checkbox
                                                                    checked={constraint.value?.includes(day.id)}
                                                                    onChange={(e) => {
                                                                        const currentValues = constraint.value || [];
                                                                        const newValues = e.target.checked
                                                                            ? [...currentValues, day.id]
                                                                            : currentValues.filter((v) => v !== day.id);
                                                                        handleUpdateConstraint(
                                                                            index,
                                                                            "value",
                                                                            newValues
                                                                        );
                                                                    }}
                                                                    size="small"
                                                                />
                                                            }
                                                            label={day.name}
                                                            sx={{ width: "45%" }}
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}

                                        {constraint.type === "class" && (
                                            <Box>
                                                <FormControl fullWidth sx={{ mb: 2 }}>
                                                    <InputLabel>Loại ràng buộc</InputLabel>
                                                    <Select
                                                        value={constraint.subtype}
                                                        label="Loại ràng buộc"
                                                        onChange={(e) =>
                                                            handleUpdateConstraint(index, "subtype", e.target.value)
                                                        }
                                                    >
                                                        <MenuItem value="sequential_classes">
                                                            Lớp học liên tiếp
                                                        </MenuItem>
                                                        <MenuItem value="same_day_classes">Lớp học cùng ngày</MenuItem>
                                                    </Select>
                                                </FormControl>

                                                <Typography variant="subtitle2" gutterBottom>
                                                    Chọn lớp học
                                                </Typography>

                                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                                    {selectedClasses.map((cls) => (
                                                        <FormControlLabel
                                                            key={cls.id || cls._id}
                                                            control={
                                                                <Checkbox
                                                                    checked={constraint.classes?.includes(
                                                                        cls.id || cls._id
                                                                    )}
                                                                    onChange={(e) => {
                                                                        const currentClasses = constraint.classes || [];
                                                                        const classId = cls.id || cls._id;
                                                                        const newClasses = e.target.checked
                                                                            ? [...currentClasses, classId]
                                                                            : currentClasses.filter(
                                                                                  (c) => c !== classId
                                                                              );
                                                                        handleUpdateConstraint(
                                                                            index,
                                                                            "classes",
                                                                            newClasses
                                                                        );
                                                                    }}
                                                                    size="small"
                                                                />
                                                            }
                                                            label={cls.name}
                                                            sx={{ width: "30%" }}
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}

                                        {constraint.type === "teacher" && (
                                            <Box>
                                                <FormControl fullWidth sx={{ mb: 2 }}>
                                                    <InputLabel>Giảng viên</InputLabel>
                                                    <Select
                                                        value={constraint.teacher}
                                                        label="Giảng viên"
                                                        onChange={(e) =>
                                                            handleUpdateConstraint(index, "teacher", e.target.value)
                                                        }
                                                    >
                                                        {teachers.map((teacher) => (
                                                            <MenuItem key={teacher.id} value={teacher.id}>
                                                                {teacher.name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>

                                                <FormControl fullWidth sx={{ mb: 2 }}>
                                                    <InputLabel>Loại ràng buộc</InputLabel>
                                                    <Select
                                                        value={constraint.subtype}
                                                        label="Loại ràng buộc"
                                                        onChange={(e) =>
                                                            handleUpdateConstraint(index, "subtype", e.target.value)
                                                        }
                                                    >
                                                        <MenuItem value="preferred_days">Ngày dạy ưu tiên</MenuItem>
                                                        <MenuItem value="unavailable_days">Ngày không thể dạy</MenuItem>
                                                    </Select>
                                                </FormControl>

                                                <Typography variant="subtitle2" gutterBottom>
                                                    {constraint.subtype === "preferred_days"
                                                        ? "Chọn ngày dạy ưu tiên"
                                                        : "Chọn ngày không thể dạy"}
                                                </Typography>

                                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                                    {daysOfWeek.map((day) => (
                                                        <FormControlLabel
                                                            key={day.id}
                                                            control={
                                                                <Checkbox
                                                                    checked={constraint.value?.includes(day.id)}
                                                                    onChange={(e) => {
                                                                        const currentValues = constraint.value || [];
                                                                        const newValues = e.target.checked
                                                                            ? [...currentValues, day.id]
                                                                            : currentValues.filter((v) => v !== day.id);
                                                                        handleUpdateConstraint(
                                                                            index,
                                                                            "value",
                                                                            newValues
                                                                        );
                                                                    }}
                                                                    size="small"
                                                                />
                                                            }
                                                            label={day.name}
                                                            sx={{ width: "45%" }}
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}
                                    </CardContent>

                                    <CardActions sx={{ justifyContent: "flex-end" }}>
                                        <Button
                                            size="small"
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => handleRemoveConstraint(index)}
                                        >
                                            Xóa
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            </Paper>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Alert severity="info" icon={<SyncAltIcon />} sx={{ width: "100%" }}>
                    <Typography variant="body2">
                        Các ràng buộc bổ sung giúp tùy chỉnh lịch học nhưng cũng có thể làm giảm tính linh hoạt của giải
                        pháp. Chỉ thêm các ràng buộc thực sự cần thiết.
                    </Typography>
                </Alert>
            </Box>
        </Box>
    );
};
Step4Constraints.propTypes = {
    constraints: PropTypes.array.isRequired,
    handleAddConstraint: PropTypes.func.isRequired,
    handleUpdateConstraint: PropTypes.func.isRequired,
    handleRemoveConstraint: PropTypes.func.isRequired,
    selectedClasses: PropTypes.array.isRequired,
    teachers: PropTypes.array.isRequired,
    balanceHoursBetweenClasses: PropTypes.bool.isRequired,
    setBalanceHoursBetweenClasses: PropTypes.func.isRequired,
    avoidEmptySlots: PropTypes.bool.isRequired,
    setAvoidEmptySlots: PropTypes.func.isRequired,
    prioritizeMorningClasses: PropTypes.bool.isRequired,
    setPrioritizeMorningClasses: PropTypes.func.isRequired,
    selfStudyInAfternoon: PropTypes.bool.isRequired,
    setSelfStudyInAfternoon: PropTypes.func.isRequired,
};

export default Step4Constraints;
