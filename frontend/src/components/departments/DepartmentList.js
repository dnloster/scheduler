import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Container,
    Typography,
    Button,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    Card,
    CardContent,
    CardActions,
    Grid,
    Chip,
    Alert,
    CircularProgress,
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    School as SchoolIcon,
    CalendarMonth as CalendarIcon,
    AccountBox as AccountBoxIcon,
} from "@mui/icons-material";
import { getDepartments, deleteDepartment } from "../../api/departmentService";
import { getClassesByDepartmentId } from "../../api/classService";
import { getCourseByDepartmentId } from "../../api/courseService";

const DepartmentList = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewType, setViewType] = useState("grid"); // 'grid' or 'table'
    const [classes, setClasses] = useState(0);
    const [courses, setCourses] = useState(0);

    // Fetch departments from the API
    const fetchDepartments = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getDepartments();
            const departmentData = data.map(async (dept) => {
                const getCourse = await getCourseByDepartmentId(dept._id);
                const getClasses = await getClassesByDepartmentId(dept._id);
                return {
                    ...dept,
                    classCount: getClasses.filter((cls) => cls.department._id === dept._id).length,
                    courseCount: getCourse.filter((course) => course.department._id === dept._id).length,
                };
            });
            setDepartments(await Promise.all(departmentData));
        } catch (error) {
            console.error("Error fetching departments:", error);
            setError("Không thể tải dữ liệu chuyên ngành. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleDelete = async (id) => {
        if (
            window.confirm(
                "Bạn có chắc chắn muốn xóa chuyên ngành này? Tất cả các lớp học và môn học thuộc chuyên ngành cũng sẽ bị xóa."
            )
        ) {
            try {
                await deleteDepartment(id);
                // If successful, update the local state
                setDepartments(departments.filter((dept) => dept.id !== id));
            } catch (error) {
                console.error("Error deleting department:", error);
                alert("Không thể xóa chuyên ngành. Vui lòng thử lại sau.");
            }
        }
    };

    const toggleViewType = () => {
        setViewType(viewType === "grid" ? "table" : "grid");
    };

    // Calculate days remaining for each department
    const calculateDaysRemaining = (endDate) => {
        const today = new Date();
        const end = new Date(endDate);
        const diffTime = end - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Chuyên ngành</Typography>
                <Box>
                    <Button variant="outlined" onClick={toggleViewType} sx={{ mr: 2 }}>
                        {viewType === "grid" ? "Xem dạng bảng" : "Xem dạng lưới"}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        component={Link}
                        to="/departments/new"
                    >
                        Thêm chuyên ngành
                    </Button>
                </Box>
            </Box>

            {loading && (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {!loading && departments.length === 0 && !error && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    Không có chuyên ngành nào. Hãy thêm chuyên ngành mới.
                </Alert>
            )}

            {!loading && departments.length > 0 && viewType === "table" && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Tên chuyên ngành</TableCell>
                                <TableCell>Người phụ trách</TableCell>
                                <TableCell>Số lớp</TableCell>
                                <TableCell>Số môn học</TableCell>
                                <TableCell>Thời gian</TableCell>
                                <TableCell align="right">Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {departments.map((dept) => (
                                <TableRow key={dept.id}>
                                    <TableCell>{dept.id}</TableCell>
                                    <TableCell>
                                        <Link
                                            to={`/departments/${dept.id}`}
                                            style={{ textDecoration: "none", color: "inherit" }}
                                        >
                                            <Typography fontWeight="bold">{dept.name}</Typography>
                                        </Link>
                                    </TableCell>
                                    <TableCell>{dept.director}</TableCell>
                                    <TableCell>{dept.classCount}</TableCell>
                                    <TableCell>{dept.courseCount}</TableCell>
                                    <TableCell>
                                        {new Date(dept.startDate).toLocaleDateString("vi-VN")} -{" "}
                                        {new Date(dept.endDate).toLocaleDateString("vi-VN")}
                                        <Box mt={1}>
                                            <Chip
                                                label={`Còn ${calculateDaysRemaining(dept.endDate)} ngày`}
                                                color="primary"
                                                size="small"
                                                variant="outlined"
                                            />
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Chỉnh sửa">
                                            <IconButton component={Link} to={`/departments/${dept.id}`}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Xóa">
                                            <IconButton color="error" onClick={() => handleDelete(dept.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {!loading && departments.length > 0 && viewType === "grid" && (
                <Grid container spacing={3}>
                    {departments.map((dept) => {
                        return (
                            <Grid sx={{ xs: 12, md: 6 }} key={dept._id}>
                                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <SchoolIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
                                            <Typography variant="h5" component="div">
                                                {dept.name}
                                            </Typography>
                                        </Box>

                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {dept.description}
                                        </Typography>

                                        <Box display="flex" alignItems="center" mb={1}>
                                            <AccountBoxIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                                            <Typography variant="body2" color="text.secondary">
                                                Người phụ trách: <strong>{dept.director}</strong>
                                            </Typography>
                                        </Box>

                                        <Box display="flex" alignItems="center" mb={1}>
                                            <CalendarIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(dept.startDate).toLocaleDateString("vi-VN")} -{" "}
                                                {new Date(dept.endDate).toLocaleDateString("vi-VN")}
                                            </Typography>
                                        </Box>

                                        <Box display="flex" justifyContent="space-between" mt={2}>
                                            <Chip label={`${dept.classCount} lớp`} variant="outlined" size="small" />
                                            <Chip
                                                label={`${dept.courseCount} môn học`}
                                                variant="outlined"
                                                size="small"
                                            />
                                            <Chip
                                                label={`Còn ${calculateDaysRemaining(dept.endDate)} ngày`}
                                                color="primary"
                                                size="small"
                                            />
                                        </Box>
                                    </CardContent>
                                    <CardActions>
                                        <Button size="small" component={Link} to={`/departments/${dept._id}`}>
                                            Chỉnh sửa
                                        </Button>
                                        <Button size="small" color="error" onClick={() => handleDelete(dept._id)}>
                                            Xóa
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Container>
    );
};

export default DepartmentList;
