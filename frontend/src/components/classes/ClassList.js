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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
    CardActions,
    Grid,
    CircularProgress,
    Alert,
    Chip,
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    CalendarMonth as CalendarIcon,
    People as PeopleIcon,
    FilterAlt as FilterIcon,
} from "@mui/icons-material";

// Import API services
import { getClasses, deleteClass } from "../../api/classService";
import { getDepartments } from "../../api/departmentService";

const ClassList = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [departments, setDepartments] = useState([]);
    const [viewType, setViewType] = useState("grid"); // 'grid' or 'table'

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Fetch departments data
                const departmentsData = await getDepartments();
                if (departmentsData && departmentsData.length > 0) {
                    setDepartments(departmentsData);
                } else {
                    // Fallback to sample data
                    setDepartments([
                        { id: 1, name: "Sơ cấp báo vụ" },
                        { id: 2, name: "Công nghệ thông tin" },
                    ]);
                }

                // Fetch classes data
                const classesData = await getClasses();
                if (classesData && classesData.length > 0) {
                    // Format class data to ensure consistency
                    const formattedClasses = classesData.map((cls) => ({
                        id: cls._id,
                        name: cls.name,
                        departmentId: cls.department._id,
                        studentCount: cls.studentCount,
                        // Add any other properties that might be needed
                    }));

                    setClasses(formattedClasses);
                } else {
                    // Fallback to sample data
                    setClasses([
                        { id: 1, name: "BV25A", departmentId: 1, studentCount: 25 },
                        { id: 2, name: "BV25B", departmentId: 1, studentCount: 23 },
                        { id: 3, name: "BV25C", departmentId: 1, studentCount: 24 },
                    ]);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.");

                // Set fallback data on error
                setDepartments([
                    { id: 1, name: "Sơ cấp báo vụ" },
                    { id: 2, name: "Công nghệ thông tin" },
                ]);

                setClasses([
                    { id: 1, name: "BV25A", departmentId: 1, studentCount: 25 },
                    { id: 2, name: "BV25B", departmentId: 1, studentCount: 23 },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa lớp học này?")) {
            try {
                setLoading(true);
                await deleteClass(id);
                // Update local state after successful deletion
                setClasses(classes.filter((cls) => cls.id !== id));
                setError(null);
            } catch (err) {
                console.error("Error deleting class:", err);
                setError("Đã xảy ra lỗi khi xóa lớp học. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDepartmentChange = (event) => {
        setSelectedDepartment(event.target.value);
    };

    const toggleViewType = () => {
        setViewType(viewType === "grid" ? "table" : "grid");
    };

    // Filter classes by selected department
    const filteredClasses =
        selectedDepartment === "all" ? classes : classes.filter((cls) => cls.departmentId === selectedDepartment);

    // Count total students across filtered classes
    const totalStudents = filteredClasses.reduce((sum, cls) => sum + (Number(cls.studentCount) || 0), 0);

    // Get department name by id
    const getDepartmentName = (depId) => {
        const department = departments.find((d) => d.id === depId);
        return department ? department.name : "Không xác định";
    };

    // Render grid view of classes
    const renderGridView = () => {
        return (
            <Grid container spacing={3}>
                {filteredClasses.map((cls) => (
                    <Grid item xs={12} sm={6} md={4} key={cls.id}>
                        <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography gutterBottom variant="h5" component="div">
                                    Lớp {cls.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Chuyên ngành: {getDepartmentName(cls.departmentId)}
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                                    <PeopleIcon sx={{ mr: 1, fontSize: "small" }} />
                                    <Typography variant="body2">{cls.studentCount} học viên</Typography>
                                </Box>
                            </CardContent>
                            <CardActions>
                                <Button
                                    size="small"
                                    component={Link}
                                    to={`/classes/${cls.id}`}
                                    startIcon={<CalendarIcon />}
                                >
                                    Xem lịch học
                                </Button>
                                <Button
                                    size="small"
                                    component={Link}
                                    to={`/classes/${cls.id}/edit`}
                                    startIcon={<EditIcon />}
                                >
                                    Sửa
                                </Button>
                                <Button
                                    size="small"
                                    color="error"
                                    onClick={() => handleDelete(cls.id)}
                                    startIcon={<DeleteIcon />}
                                >
                                    Xóa
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        );
    };

    // Render table view of classes
    const renderTableView = () => {
        return (
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="classes table">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Tên Lớp</TableCell>
                            <TableCell>Khoa/Bộ môn</TableCell>
                            <TableCell align="right">Số học viên</TableCell>
                            <TableCell align="center">Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredClasses.map((cls) => (
                            <TableRow key={cls.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                <TableCell component="th" scope="row">
                                    {cls.id}
                                </TableCell>
                                <TableCell>{cls.name}</TableCell>
                                <TableCell>{getDepartmentName(cls.departmentId)}</TableCell>
                                <TableCell align="right">{cls.studentCount}</TableCell>
                                <TableCell align="center">
                                    <Tooltip title="Xem lịch học">
                                        <IconButton
                                            aria-label="view schedule"
                                            component={Link}
                                            to={`/classes/${cls.id}`}
                                            size="small"
                                        >
                                            <CalendarIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Chỉnh sửa">
                                        <IconButton
                                            aria-label="edit"
                                            component={Link}
                                            to={`/classes/${cls.id}/edit`}
                                            size="small"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Xóa">
                                        <IconButton
                                            aria-label="delete"
                                            onClick={() => handleDelete(cls.id)}
                                            size="small"
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Danh sách lớp học
                </Typography>
                <Button variant="contained" color="primary" startIcon={<AddIcon />} component={Link} to="/classes/new">
                    Thêm lớp học mới
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body1" sx={{ mr: 2 }}>
                        <FilterIcon sx={{ mr: 0.5, fontSize: "small", verticalAlign: "middle" }} />
                        Lọc theo chuyên ngành:
                    </Typography>
                    <FormControl sx={{ minWidth: 200 }}>
                        <Select value={selectedDepartment} onChange={handleDepartmentChange} displayEmpty size="small">
                            <MenuItem value="all">Tất cả các chuyên ngành</MenuItem>
                            {departments.map((department) => (
                                <MenuItem key={department._id} value={department._id}>
                                    {department.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box>
                    <Button variant="outlined" onClick={toggleViewType} sx={{ ml: 2 }}>
                        {viewType === "grid" ? "Hiển thị dạng bảng" : "Hiển thị dạng lưới"}
                    </Button>
                </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Paper sx={{ p: 2 }}>
                    Tổng số lớp: <Chip label={filteredClasses.length} color="primary" size="small" sx={{ mx: 1 }} />
                    Tổng số học viên: <Chip label={totalStudents} color="secondary" size="small" sx={{ mx: 1 }} />
                </Paper>
            </Box>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
                    <CircularProgress />
                </Box>
            ) : viewType === "grid" ? (
                renderGridView()
            ) : (
                renderTableView()
            )}
        </Container>
    );
};

export default ClassList;
