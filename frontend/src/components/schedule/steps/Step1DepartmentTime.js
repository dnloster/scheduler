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
    Divider,
    InputAdornment,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Event as EventIcon } from "@mui/icons-material";
import dayjs from "dayjs";

const Step1DepartmentTime = ({
    departments,
    selectedDepartment,
    setSelectedDepartment,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    totalWeeks,
    setTotalWeeks,
    classes,
    courses,
    formatDate,
}) => {
    return (
        <Box>
            <Paper elevation={1} sx={{ p: 3, mb: 3, borderLeft: "4px solid #1976d2" }}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>
                    Chọn chuyên ngành và thời gian
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                            <InputLabel>Chuyên ngành</InputLabel>
                            <Select
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                label="Chuyên ngành"
                            >
                                <MenuItem value="">
                                    <em>Chọn chuyên ngành</em>
                                </MenuItem>
                                {departments.map((dept) => (
                                    <MenuItem key={dept._id} value={dept._id}>
                                        {dept.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                            Thông tin chuyên ngành
                        </Typography>
                        {selectedDepartment ? (
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Số lớp: {classes.filter((c) => c.department?._id === selectedDepartment).length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Số môn học: {courses.filter((c) => c.department?._id === selectedDepartment).length}
                                </Typography>
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    p: 2,
                                    bgcolor: "background.paper",
                                    borderRadius: 1,
                                    border: "1px dashed grey",
                                }}
                            >
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                                    Vui lòng chọn chuyên ngành
                                </Typography>
                            </Box>
                        )}
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>
                    Khoảng thời gian
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <DatePicker
                            label="Ngày bắt đầu"
                            value={startDate}
                            onChange={(newValue) => {
                                setStartDate(newValue);
                                if (newValue && endDate) {
                                    // Calculate total weeks between start and end dates
                                    const weeks = Math.ceil(endDate.diff(newValue, "day") / 7);
                                    setTotalWeeks(weeks);
                                }
                            }}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    helperText: "Ngày bắt đầu học kỳ",
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <DatePicker
                            label="Ngày kết thúc"
                            value={endDate}
                            onChange={(newValue) => {
                                setEndDate(newValue);
                                if (startDate && newValue) {
                                    // Calculate total weeks between start and end dates
                                    const weeks = Math.ceil(newValue.diff(startDate, "day") / 7);
                                    setTotalWeeks(weeks);
                                }
                            }}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    helperText: "Ngày kết thúc học kỳ",
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            label="Tổng số tuần"
                            type="number"
                            value={totalWeeks}
                            onChange={(e) => setTotalWeeks(parseInt(e.target.value) || 0)}
                            fullWidth
                            InputProps={{
                                endAdornment: <InputAdornment position="end">tuần</InputAdornment>,
                            }}
                            disabled
                            helperText="Tổng số tuần học trong học kỳ"
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 3, p: 2, bgcolor: "primary.light", borderRadius: 1, color: "white" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <EventIcon sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">Thông tin thời gian</Typography>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">
                            Học kỳ bắt đầu từ {formatDate(startDate)} đến {formatDate(endDate)}
                        </Typography>
                        <Typography variant="body2">Tổng số tuần học: {totalWeeks} tuần</Typography>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default Step1DepartmentTime;
