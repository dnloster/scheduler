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
    List,
    ListItem,
    ListItemText,
    Divider,
    Chip,
} from "@mui/material";
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    Delete as DeleteIcon,
    PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import axios from "axios";
import { createClass, getClasses } from "../../api/classService";
import { getDepartments } from "../../api/departmentService";

const ClassForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = id !== undefined;
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Class data state
    const [classData, setClassData] = useState({
        name: "",
        department_id: 1,
        studentCount: 0,
    });

    // Student list (for demonstration)
    const [students, setStudents] = useState([]);

    // Reference data
    const [departments, setDepartments] = useState([{ id: 1, name: "Sơ cấp báo vụ" }]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const departmentsData = await getDepartments();
                if (departmentsData && departmentsData.length > 0) {
                    console.log("Fetched departments:", departmentsData);
                    setDepartments(departmentsData);
                } else {
                    // Fallback to sample data
                    setDepartments([
                        { id: 1, name: "Sơ cấp báo vụ" },
                        { id: 2, name: "Công nghệ thông tin" },
                    ]);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Có lỗi xảy ra khi tải dữ liệu.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setClassData((prev) => ({
            ...prev,
            [name]: value,
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

        // Validate the form data
        if (!classData.name) {
            setError("Vui lòng điền tên lớp học.");
            setSaving(false);
            return;
        }

        // In a real app, you would make an API call to save the class data
        await createClass(classData); // Call the API to create the class
        setTimeout(() => {
            setSaving(false);
            setSuccess(true);
            // Auto navigate back after success
            setTimeout(() => {
                navigate("/classes");
            }, 1500);
        }, 1000);
    };

    const handleDelete = () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa lớp học này?")) {
            // In a real app, you would make an API call to delete the class
            navigate("/classes");
        }
    };

    const handleAddStudent = () => {
        alert("Chức năng thêm học viên sẽ được phát triển trong phiên bản tiếp theo.");
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4">
                        {isEditMode ? `Chỉnh sửa lớp ${classData.name}` : "Thêm lớp học mới"}
                    </Typography>
                    <Box>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate("/classes")}
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
                        Lớp học đã được lưu thành công!
                    </Alert>
                )}

                <Grid sx={{ xs: 12, md: 6 }}>
                    <TextField
                        name="name"
                        label="Tên lớp"
                        value={classData.name}
                        onChange={handleChange}
                        fullWidth
                        required
                        sx={{ mb: 2 }}
                    />
                </Grid>
                <Grid sx={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Chuyên ngành</InputLabel>
                        <Select
                            name="departmentId"
                            value={classData.department_id}
                            label="Chuyên ngành"
                            onChange={handleChange}
                        >
                            {departments.map((dept) => (
                                <MenuItem key={dept._id} value={dept._id}>
                                    {dept.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid sx={{ xs: 12, md: 6 }}>
                    <TextField
                        name="studentCount"
                        label="Số lượng học viên"
                        type="number"
                        value={classData.studentCount}
                        onChange={handleNumericChange}
                        fullWidth
                        sx={{ mb: 2 }}
                    />
                </Grid>

                {isEditMode && (
                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">Danh sách học viên</Typography>
                            <Button variant="outlined" startIcon={<PersonAddIcon />} onClick={handleAddStudent}>
                                Thêm học viên
                            </Button>
                        </Box>

                        {students.length > 0 ? (
                            <List>
                                {students.map((student) => (
                                    <ListItem
                                        key={student.id}
                                        divider
                                        secondaryAction={
                                            <Chip label={student.studentId} variant="outlined" size="small" />
                                        }
                                    >
                                        <ListItemText primary={student.name} />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Alert severity="info">
                                Chưa có học viên nào trong lớp này. Sử dụng nút "Thêm học viên" để thêm học viên mới.
                            </Alert>
                        )}
                        {students.length > 0 && students.length < 5 && (
                            <Box mt={2}>
                                <Alert severity="info">
                                    Hiển thị 5 học viên đầu tiên của tổng số {classData.studentCount} học viên.
                                </Alert>
                            </Box>
                        )}
                    </Grid>
                )}
            </Paper>
        </Container>
    );
};

export default ClassForm;
