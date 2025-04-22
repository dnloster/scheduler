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
    Divider,
    Card,
    CardContent,
    CircularProgress,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import vi from "date-fns/locale/vi";
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    Delete as DeleteIcon,
    School as SchoolIcon,
} from "@mui/icons-material";
import { getDepartmentById, createDepartment, updateDepartment, deleteDepartment } from "../../api/departmentService";
import { getClassesByDepartmentId } from "../../api/classService";

const DepartmentForm = () => {
    const { _id } = useParams();
    const navigate = useNavigate();
    const isEditMode = _id !== undefined;
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Department data state
    const [department, setDepartment] = useState({
        name: "",
        description: "",
        director: "",
        contactInfo: "",
        startDate: "",
        endDate: "",
    });

    // Classes for this department (for demonstration)
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        if (isEditMode) {
            fetchDepartmentData();
        }
    }, [_id, isEditMode]);

    const fetchDepartmentData = async () => {
        setLoading(true);
        setError(null);

        try {
            const departmentData = await getDepartmentById(_id);

            if (departmentData) {
                setDepartment(departmentData);

                // TODO: Trong trường hợp thật, bạn sẽ cần lấy danh sách lớp học từ API
                // Ví dụ: const classesData = await getClassesByDepartmentId(id);
                // Giữ lại dữ liệu mẫu cho các lớp học
                const classesData = await getClassesByDepartmentId(_id);
                setClasses(classesData);
            } else {
                setError("Không tìm thấy chuyên ngành với ID này.");
            }
        } catch (err) {
            console.error("Error fetching department:", err);
            setError("Đã xảy ra lỗi khi tải dữ liệu chuyên ngành. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDepartment((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        // Validate the form data
        if (!department.name) {
            setError("Vui lòng nhập tên chuyên ngành.");
            setSaving(false);
            return;
        }

        try {
            if (isEditMode) {
                // Cập nhật chuyên ngành đã có
                await updateDepartment(_id, department);
            } else {
                // Tạo chuyên ngành mới
                await createDepartment(department);
            }

            setSuccess(true);

            // Chuyển hướng sau khi lưu thành công
            setTimeout(() => {
                navigate("/departments");
            }, 1500);
        } catch (err) {
            console.error("Error saving department:", err);
            setError("Đã xảy ra lỗi khi lưu chuyên ngành. Vui lòng thử lại sau.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (
            window.confirm(
                "Bạn có chắc chắn muốn xóa chuyên ngành này? Tất cả các lớp học và môn học thuộc chuyên ngành cũng sẽ bị xóa."
            )
        ) {
            try {
                setLoading(true);
                await deleteDepartment(_id);
                navigate("/departments");
            } catch (err) {
                console.error("Error deleting department:", err);
                setError("Đã xảy ra lỗi khi xóa chuyên ngành. Vui lòng thử lại sau.");
                setLoading(false);
            }
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Paper
                    elevation={3}
                    sx={{ p: 3, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}
                >
                    <CircularProgress />
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4">
                        {isEditMode ? "Chỉnh sửa chuyên ngành" : "Thêm chuyên ngành mới"}
                    </Typography>
                    <Box>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate("/departments")}
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
                        Chuyên ngành đã được lưu thành công!
                    </Alert>
                )}

                <Grid container spacing={{ xs: 3 }} columns={{ xs: 4, sm: 12, md: 12 }}>
                    <Grid sx={{ xs: 4, md: 2 }}>
                        <TextField
                            name="name"
                            label="Tên chuyên ngành"
                            value={department.name}
                            onChange={handleChange}
                            fullWidth
                            required
                            sx={{ mb: 2 }}
                        />
                    </Grid>
                    <Grid sx={{ xs: 4, md: 2 }}>
                        <TextField
                            name="director"
                            label="Người phụ trách"
                            value={department.director}
                            onChange={handleChange}
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                    </Grid>
                    <Grid size="grow">
                        <TextField
                            name="description"
                            label="Mô tả chuyên ngành"
                            value={department.description}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            sx={{ mb: 2 }}
                        />
                    </Grid>
                </Grid>
                <Grid container columns={{ xs: 12, sm: 12, md: 12 }} spacing={{ sx: 3 }} sx={{ mb: 2 }}>
                    <TextField
                        name="contactInfo"
                        label="Số điện thoại liên hệ"
                        fullWidth
                        value={department.contactInfo}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid spacing={3} sx={{ xs: 12, md: 6, mb: 2 }} container>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                        <DatePicker
                            label="Ngày bắt đầu"
                            value={department.startDate ? new Date(department.startDate) : null}
                            onChange={(date) => {
                                setDepartment((prev) => ({
                                    ...prev,
                                    startDate: date ? date.toISOString().split("T")[0] : "",
                                }));
                            }}
                            renderInput={(params) => <TextField {...params} name="startDate" fullWidth />}
                        />
                        <DatePicker
                            label="Ngày kết thúc"
                            value={department.endDate ? new Date(department.endDate) : null}
                            onChange={(date) => {
                                setDepartment((prev) => ({
                                    ...prev,
                                    endDate: date ? date.toISOString().split("T")[0] : "",
                                }));
                            }}
                            renderInput={(params) => <TextField {...params} name="endDate" fullWidth sx={{ mb: 2 }} />}
                        />
                    </LocalizationProvider>
                </Grid>

                {isEditMode && classes.length > 0 && (
                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Các lớp thuộc chuyên ngành
                        </Typography>

                        <Grid container spacing={2}>
                            {classes.map((cls) => (
                                <Grid item xs={12} sm={6} md={4} key={cls.id}>
                                    <Card>
                                        <CardContent>
                                            <Box display="flex" alignItems="center">
                                                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                                                <Typography variant="h6">Lớp {cls.name}</Typography>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Số học viên: {cls.studentCount}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                )}
            </Paper>
        </Container>
    );
};

export default DepartmentForm;
