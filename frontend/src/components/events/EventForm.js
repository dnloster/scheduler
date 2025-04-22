import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Container,
    Typography,
    Box,
    Paper,
    TextField,
    Button,
    Grid,
    Alert,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    FormHelperText,
    Switch,
    FormControlLabel,
} from "@mui/material";
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    Delete as DeleteIcon,
    Event as EventIcon,
    CalendarMonth as CalendarIcon,
    AccessTime as AccessTimeIcon,
    Repeat as RepeatIcon,
} from "@mui/icons-material";

import { getEventById, createEvent, updateEvent, deleteEvent } from "../../api/eventService";
import { getDepartments } from "../../api/departmentService";

const EventForm = () => {
    const { id } = useParams();

    const navigate = useNavigate();
    const isEditMode = id !== undefined;
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Event data state
    const [event, setEvent] = useState({
        name: "",
        description: "",
        date: "",
        duration_days: 1,
        recurring: false,
        recurring_pattern: "",
        department: "",
    });

    // Validation errors
    const [errors, setErrors] = useState({});

    // Departments data
    const [departments, setDepartments] = useState([]);

    const recurringPatternOptions = [
        { value: "FIRST_MONDAY", label: "Thứ Hai đầu tháng" },
        { value: "LAST_FRIDAY", label: "Thứ Sáu cuối tháng" },
        { value: "EVERY_MONDAY", label: "Mỗi Thứ Hai" },
        { value: "EVERY_TUESDAY", label: "Mỗi Thứ Ba" },
        { value: "EVERY_WEDNESDAY", label: "Mỗi Thứ Tư" },
        { value: "EVERY_THURSDAY", label: "Mỗi Thứ Năm" },
        { value: "EVERY_FRIDAY", label: "Mỗi Thứ Sáu" },
        { value: "EVERY_SATURDAY", label: "Mỗi Thứ Bảy" },
        { value: "EVERY_SUNDAY", label: "Mỗi Chủ Nhật" },
    ];

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const data = await getDepartments();
                setDepartments(data || []);
            } catch (err) {
                console.error("Error fetching departments:", err);
                // Fallback to sample data if API fails
                setDepartments([
                    { id: "1", name: "Sơ cấp báo vụ" },
                    { id: "2", name: "Trung cấp hành chính" },
                    { id: "3", name: "Cao cấp quản lý" },
                ]);
            }
        };

        fetchDepartments();
    }, []);

    useEffect(() => {
        if (isEditMode) {
            setLoading(true);

            const fetchEventData = async () => {
                try {
                    const data = await getEventById(id);

                    if (data) {
                        // Format the date for input field (YYYY-MM-DD)
                        const eventDate = data.date ? new Date(data.date) : null;
                        const formattedDate = eventDate ? eventDate.toISOString().split("T")[0] : "";

                        setEvent({
                            name: data.name || "",
                            description: data.description || "",
                            date: formattedDate,
                            duration_days: data.duration_days || 1,
                            recurring: data.recurring || false,
                            recurring_pattern: data.recurring_pattern || "",
                            department: data.department || "",
                        });
                    } else {
                        setError("Không tìm thấy sự kiện với ID này.");
                    }
                } catch (err) {
                    console.error("Error fetching event:", err);
                    setError("Có lỗi khi tải dữ liệu sự kiện.");
                } finally {
                    setLoading(false);
                }
            };

            fetchEventData();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEvent((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear validation error when field is changed
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    const handleSwitchChange = (e) => {
        const { name, checked } = e.target;
        setEvent((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!event.name) {
            newErrors.name = "Vui lòng nhập tên sự kiện";
        }

        // Ngày chỉ bắt buộc nếu không phải sự kiện định kỳ
        if (!event.recurring && !event.date) {
            newErrors.date = "Vui lòng chọn ngày diễn ra sự kiện";
        }

        if (event.duration_days < 1) {
            newErrors.duration_days = "Thời lượng phải từ 1 ngày trở lên";
        }

        if (event.recurring && !event.recurring_pattern) {
            newErrors.recurring_pattern = "Vui lòng chọn mẫu lặp lại";
        }

        if (!event.department) {
            newErrors.department = "Vui lòng chọn chuyên ngành";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSaving(true);
        setError(null);

        try {
            if (isEditMode) {
                await updateEvent(id, event);
            } else {
                await createEvent(event);
            }

            setSuccess(true);

            // Auto navigate back after success
            setTimeout(() => {
                navigate("/events");
            }, 1500);
        } catch (err) {
            console.error("Error saving event:", err);
            setError("Có lỗi khi lưu sự kiện. Vui lòng thử lại sau.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
            try {
                await deleteEvent(id);
                navigate("/events");
            } catch (err) {
                console.error("Error deleting event:", err);
                setError("Có lỗi khi xóa sự kiện. Vui lòng thử lại sau.");
            }
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: "center" }}>
                <Typography>Đang tải dữ liệu...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box display="flex" alignItems="center">
                        <EventIcon sx={{ fontSize: 32, mr: 1, color: "primary.main" }} />
                        <Typography variant="h4">{isEditMode ? "Chỉnh sửa sự kiện" : "Thêm sự kiện mới"}</Typography>
                    </Box>
                    <Box>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate("/events")}
                            sx={{ mr: 1 }}
                        >
                            Quay lại
                        </Button>
                        {isEditMode && (
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={handleDelete}
                                sx={{ mr: 1 }}
                            >
                                Xóa
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SaveIcon />}
                            onClick={handleSubmit}
                            disabled={saving}
                        >
                            {saving ? "Đang lưu..." : "Lưu"}
                        </Button>
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        Sự kiện đã được lưu thành công!
                    </Alert>
                )}

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            name="name"
                            label="Tên sự kiện"
                            value={event.name}
                            onChange={handleChange}
                            fullWidth
                            required
                            error={!!errors.name}
                            helperText={errors.name}
                            sx={{ mb: 2 }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            name="description"
                            label="Mô tả sự kiện"
                            value={event.description}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={3}
                            sx={{ mb: 2 }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            name="date"
                            label={event.recurring ? "Ngày bắt đầu (tùy chọn)" : "Ngày diễn ra"}
                            type="date"
                            value={event.date}
                            onChange={handleChange}
                            fullWidth
                            required={!event.recurring}
                            error={!!errors.date}
                            helperText={errors.date}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            sx={{ mb: 2 }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            name="duration_days"
                            label="Số ngày diễn ra"
                            type="number"
                            value={event.duration_days}
                            onChange={handleChange}
                            fullWidth
                            required
                            inputProps={{ min: 1 }}
                            error={!!errors.duration_days}
                            helperText={errors.duration_days}
                            sx={{ mb: 2 }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth error={!!errors.department} sx={{ mb: 2 }}>
                            <InputLabel id="department-label">Chuyên ngành</InputLabel>
                            <Select
                                labelId="department-label"
                                name="department"
                                value={event.department}
                                onChange={handleChange}
                                label="Chuyên ngành"
                                required
                            >
                                {departments.map((dept) => (
                                    <MenuItem key={dept._id} value={dept._id}>
                                        {dept.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.department && <FormHelperText>{errors.department}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={event.recurring}
                                    onChange={handleSwitchChange}
                                    name="recurring"
                                    color="primary"
                                />
                            }
                            label="Sự kiện định kỳ"
                        />
                    </Grid>

                    {event.recurring && (
                        <Grid item xs={12}>
                            <FormControl fullWidth error={!!errors.recurring_pattern} sx={{ mb: 2 }}>
                                <InputLabel id="recurring-pattern-label">Mẫu lặp lại</InputLabel>
                                <Select
                                    labelId="recurring-pattern-label"
                                    name="recurring_pattern"
                                    value={event.recurring_pattern}
                                    onChange={handleChange}
                                    label="Mẫu lặp lại"
                                    required
                                >
                                    {recurringPatternOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.recurring_pattern && (
                                    <FormHelperText>{errors.recurring_pattern}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                    )}
                </Grid>
            </Paper>
        </Container>
    );
};

export default EventForm;
