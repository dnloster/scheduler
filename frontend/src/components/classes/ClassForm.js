import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Container,
    Typography,
    Box,
    Paper,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Alert,
    CircularProgress,
} from "@mui/material";
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    Delete as DeleteIcon,
    School as SchoolIcon,
} from "@mui/icons-material";
import { createClass, getClassById, updateClass, deleteClass } from "../../api/classService";
import { getDepartments } from "../../api/departmentService";

const ClassForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = id !== undefined;
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Class data state with default values
    const [classData, setClassData] = useState({
        name: "",
        department: "",
        departmentId: "", // Added departmentId field to store just the ID
        studentCount: 0,
        students: [],
    });

    // Reference data
    const [departments, setDepartments] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);

    // Fetch departments and class data on component mount
    useEffect(() => {
        fetchDepartments();

        if (isEditMode) {
            fetchClassData();
        }
    }, [id, isEditMode]);

    const fetchDepartments = async () => {
        setLoadingDepartments(true);
        try {
            const response = await getDepartments();
            if (response && response.length > 0) {
                setDepartments(response);
                // Set default department for new class
                if (!isEditMode) {
                    setClassData((prev) => ({
                        ...prev,
                        department: response[0]._id,
                        departmentId: response[0]._id,
                    }));
                }
            } else {
                setDepartments([{ _id: "1", name: "Sơ cấp báo vụ" }]);
                if (!isEditMode) {
                    setClassData((prev) => ({
                        ...prev,
                        department: "1",
                        departmentId: "1",
                    }));
                }
            }
        } catch (err) {
            console.error("Error fetching departments:", err);
            setDepartments([{ _id: "1", name: "Sơ cấp báo vụ" }]);
            if (!isEditMode) {
                setClassData((prev) => ({
                    ...prev,
                    department: "1",
                    departmentId: "1",
                }));
            }
        } finally {
            setLoadingDepartments(false);
        }
    };

    const fetchClassData = async () => {
        setLoading(true);
        setError(null);
        try {
            const classResponse = await getClassById(id);
            if (classResponse) {
                // Transform API response to match local state format
                setClassData({
                    ...classResponse,
                    departmentId: classResponse.department?._id || classResponse.department, // Handle both object or string ID
                });
            } else {
                setError("Không tìm thấy lớp học với ID này.");
            }
        } catch (err) {
            console.error("Error fetching class data:", err);
            setError("Có lỗi xảy ra khi tải dữ liệu lớp học.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setClassData((prev) => ({
            ...prev,
            [name]: value,
            // Also update departmentId if department field changes
            ...(name === "department" ? { departmentId: value } : {}),
        }));
    };

    const handleNumericChange = (e) => {
        const { name, value } = e.target;
        const numValue = value === "" ? 0 : Number(value);
        setClassData((prev) => ({
            ...prev,
            [name]: numValue,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);

        // Validate the form data
        if (!classData.name) {
            setError("Vui lòng điền tên lớp học.");
            setSaving(false);
            return;
        }

        try {
            // Prepare data for API
            const classDataToSave = {
                name: classData.name,
                department: classData.departmentId || classData.department,
                studentCount: classData.studentCount,
                students: classData.students || [],
            };

            if (isEditMode) {
                await updateClass(id, classDataToSave);
            } else {
                await createClass(classDataToSave);
            }

            setSuccess(true);

            // Auto navigate back after success
            setTimeout(() => {
                navigate("/classes");
            }, 1500);
        } catch (err) {
            console.error("Error saving class:", err);
            setError("Đã xảy ra lỗi khi lưu lớp học. Vui lòng thử lại sau.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa lớp học này?")) {
            try {
                await deleteClass(id);
                setSuccess(true);
                setTimeout(() => {
                    navigate("/classes");
                }, 1000);
            } catch (error) {
                console.error("Error deleting class:", error);
                setError("Không thể xóa lớp học. Vui lòng thử lại sau.");
            }
        }
    };

    if (loading) {
        return (
            <Container
                maxWidth="lg"
                sx={{ mt: 4, mb: 4, display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}
            >
                <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
                    <CircularProgress color="primary" sx={{ mb: 2 }} />
                    <Typography variant="h6">Đang tải thông tin lớp học...</Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" fontWeight="medium" color="primary">
                        {isEditMode ? `Chỉnh sửa lớp ${classData.name}` : "Thêm lớp học mới"}
                    </Typography>
                    <Box>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate("/classes")}
                            sx={{ mr: 1, borderRadius: 2 }}
                        >
                            Quay lại
                        </Button>
                        {isEditMode && (
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={handleDelete}
                                sx={{ mr: 1, borderRadius: 2 }}
                            >
                                Xóa
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            onClick={handleSubmit}
                            disabled={saving}
                            sx={{ borderRadius: 2 }}
                        >
                            {saving ? "Đang lưu..." : "Lưu"}
                        </Button>
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                        Lớp học đã được lưu thành công!
                    </Alert>
                )}

                <Grid container>
                    <TextField
                        name="name"
                        label="Tên lớp"
                        value={classData.name || ""}
                        onChange={handleChange}
                        fullWidth
                        required
                        sx={{ mb: 2 }}
                    />
                </Grid>
                <Grid container>
                    <FormControl fullWidth sx={{ mb: 2 }} disabled={loadingDepartments}>
                        <InputLabel id="department-label">
                            <Box display="flex" alignItems="center" gap={0.5}>
                                <SchoolIcon fontSize="small" />
                                <span>Chuyên ngành</span>
                            </Box>
                        </InputLabel>
                        <Select
                            labelId="department-label"
                            name="department"
                            value={classData.departmentId || classData.department || ""}
                            label="Chuyên ngành"
                            onChange={handleChange}
                            endAdornment={loadingDepartments && <CircularProgress size={20} sx={{ mr: 2 }} />}
                        >
                            {departments.map((dept) => (
                                <MenuItem key={dept._id || dept.id} value={dept._id || dept.id}>
                                    {dept.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid container>
                    <TextField
                        name="studentCount"
                        label="Số lượng học viên"
                        type="number"
                        value={classData.studentCount || 0}
                        onChange={handleNumericChange}
                        fullWidth
                        slotProps={{ input: { min: 0 } }}
                        sx={{ mb: 2 }}
                    />
                </Grid>
            </Paper>
        </Container>
    );
};

export default ClassForm;
