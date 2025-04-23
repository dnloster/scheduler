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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    LinearProgress,
    Alert,
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Book as BookIcon,
    Bookmark as BookmarkIcon,
    CalendarMonth as CalendarIcon,
} from "@mui/icons-material";

// Import API services
import { getCourses, deleteCourse } from "../../api/courseService";
import { getDepartments } from "../../api/departmentService";

const CourseList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [departments, setDepartments] = useState([]);
    const [viewType, setViewType] = useState("grid"); // 'grid' or 'table'
    const [courseFilter, setCourseFilter] = useState("all"); // 'all', 'main', 'sub'

    // Fetch courses and departments from the API
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Fetch departments data
                const departmentsData = await getDepartments();
                if (departmentsData && departmentsData.length > 0) {
                    setDepartments(departmentsData);
                    setSelectedDepartment(departmentsData[0]._id);
                } else {
                    // Fallback to sample data
                    setDepartments([{ id: 1, name: "Sơ cấp báo vụ" }]);
                }

                // Fetch courses data
                const coursesData = await getCourses();
                if (coursesData && coursesData.length > 0) {
                    setCourses(coursesData);
                } else {
                    // Fallback to sample data if API returns empty
                    setCourses([
                        {
                            id: 1,
                            code: "A10",
                            name: "Môn A10",
                            departmentId: 1,
                            parent_course_id: null,
                            total_hours: 160,
                            theory_hours: 160,
                            practical_hours: 0,
                            description: "Môn học A10 được dạy theo lớp ghép A-B, C-D, E-F.",
                            has_children: false,
                        },
                        {
                            id: 2,
                            code: "Q10",
                            name: "Môn Q10",
                            departmentId: 1,
                            parent_course_id: null,
                            total_hours: 100,
                            theory_hours: 50,
                            practical_hours: 50,
                            description: "Môn học Q10 là môn tổng hợp bao gồm nhiều môn con.",
                            has_children: true,
                        },
                        {
                            id: 3,
                            code: "V30",
                            name: "Môn V30",
                            departmentId: 1,
                            parent_course_id: null,
                            total_hours: 80,
                            theory_hours: 40,
                            practical_hours: 40,
                            description: "Môn học V30 là môn bắt buộc cho mọi học viên.",
                            has_children: false,
                        },
                    ]);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");

                // Set fallback data
                setDepartments([{ id: 1, name: "Sơ cấp báo vụ" }]);
                setCourses([
                    {
                        id: 1,
                        code: "A10",
                        name: "Môn A10",
                        departmentId: 1,
                        parent_course_id: null,
                        total_hours: 160,
                        theory_hours: 160,
                        practical_hours: 0,
                        description: "Môn học A10 được dạy theo lớp ghép A-B, C-D, E-F.",
                        has_children: false,
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa môn học này?")) {
            try {
                await deleteCourse(id);
                // Update local state after successful deletion
                setCourses(courses.filter((course) => course.id !== id));
            } catch (error) {
                console.error("Error deleting course:", error);
                alert("Không thể xóa môn học. Vui lòng thử lại sau.");
            }
        }
    };

    const handleDepartmentChange = (event) => {
        setSelectedDepartment(event.target.value);
    };

    const handleCourseFilterChange = (event) => {
        setCourseFilter(event.target.value);
    };

    const toggleViewType = () => {
        setViewType(viewType === "grid" ? "table" : "grid");
    };

    // Filter courses by selected department and course type
    const filteredCourses = courses.filter((course) => {
        if (course.departmentId !== selectedDepartment && course.department._id !== selectedDepartment) {
            return false;
        }

        if (courseFilter === "main" && course.parent_course !== null) {
            return false;
        }

        if (courseFilter === "sub" && course.parent_course === null) {
            return false;
        }

        return true;
    });

    // Helper function to get total hours
    const getTotalHours = (course) => {
        return course.total_hours || course.totalHours || 0;
    };

    // Helper function to get theory hours
    const getTheoryHours = (course) => {
        return course.theory_hours || course.theoryHours || 0;
    };

    // Helper function to get practical hours
    const getPracticalHours = (course) => {
        return course.practical_hours || course.practicalHours || 0;
    };

    // Get parent course name helper
    const getParentCourseName = (parentId) => {
        const parentCourse = courses.find((c) => c._id === parentId);
        return parentCourse ? parentCourse.name : "Unknown";
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Môn học</Typography>
                <Box>
                    <Button variant="outlined" onClick={toggleViewType} sx={{ mr: 2 }}>
                        {viewType === "grid" ? "Xem dạng bảng" : "Xem dạng lưới"}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        component={Link}
                        to="/courses/new"
                    >
                        Thêm môn học
                    </Button>
                </Box>
            </Box>

            <Box display="flex" alignItems="center" mb={3} gap={2}>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Chuyên ngành</InputLabel>
                    <Select value={selectedDepartment} label="Chuyên ngành" onChange={handleDepartmentChange}>
                        {departments.map((dept) => (
                            <MenuItem key={dept._id} value={dept._id}>
                                {dept.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Loại môn học</InputLabel>
                    <Select value={courseFilter} label="Loại môn học" onChange={handleCourseFilterChange}>
                        <MenuItem value="all">Tất cả các môn</MenuItem>
                        <MenuItem value="main">Môn học chính</MenuItem>
                        <MenuItem value="sub">Môn học con</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {loading && <LinearProgress sx={{ mb: 3 }} />}

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {!loading && filteredCourses.length === 0 && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    Không có môn học nào phù hợp với tiêu chí tìm kiếm.
                </Alert>
            )}

            {!loading && filteredCourses.length > 0 && viewType === "table" && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Mã môn</TableCell>
                                <TableCell>Tên môn học</TableCell>
                                <TableCell>Loại</TableCell>
                                <TableCell>Số tiết</TableCell>
                                <TableCell>Tỷ lệ LT/TH</TableCell>
                                <TableCell align="right">Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredCourses.map((course) => {
                                const totalHours = getTotalHours(course);
                                const theoryHours = getTheoryHours(course);
                                const practicalHours = getPracticalHours(course);

                                return (
                                    <TableRow key={course.id}>
                                        <TableCell>{course.code}</TableCell>
                                        <TableCell>
                                            <Link
                                                to={`/courses/${course.id}`}
                                                style={{ textDecoration: "none", color: "inherit" }}
                                            >
                                                <Typography fontWeight="bold">{course.name}</Typography>
                                                {course.parent_course && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        Thuộc môn: {getParentCourseName(course.parent_course)}
                                                    </Typography>
                                                )}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            {course.parent_course === null ? (
                                                <Chip
                                                    label="Môn chính"
                                                    color="primary"
                                                    size="small"
                                                    icon={<BookIcon fontSize="small" />}
                                                />
                                            ) : (
                                                <Chip
                                                    label="Môn con"
                                                    color="secondary"
                                                    size="small"
                                                    variant="outlined"
                                                    icon={<BookmarkIcon fontSize="small" />}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell>{totalHours}</TableCell>
                                        <TableCell>
                                            {totalHours > 0 ? (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Box sx={{ width: "100%", mr: 1 }}>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={(theoryHours / totalHours) * 100}
                                                            sx={{
                                                                height: 8,
                                                                borderRadius: 5,
                                                                bgcolor: "#e0e0e0",
                                                                "& .MuiLinearProgress-bar": {
                                                                    bgcolor: "primary.main",
                                                                },
                                                            }}
                                                        />
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {Math.round((theoryHours / totalHours) * 100)}%
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                "N/A"
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Chỉnh sửa">
                                                <IconButton component={Link} to={`/courses/${course._id}`}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Xóa">
                                                <IconButton color="error" onClick={() => handleDelete(course._id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {!loading && filteredCourses.length > 0 && viewType === "grid" && (
                <Grid container spacing={3}>
                    {filteredCourses.map((course) => {
                        const totalHours = getTotalHours(course);
                        const theoryHours = getTheoryHours(course);
                        const practicalHours = getPracticalHours(course);

                        return (
                            <Grid size={4} sx={{ xs: 12, sm: 6, md: 4 }} key={course._id}>
                                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                            <Typography variant="h6" component="div">
                                                {course.name}
                                            </Typography>
                                            {course.parent_course === null ? (
                                                <Chip
                                                    label="Môn chính"
                                                    color="primary"
                                                    size="small"
                                                    icon={<BookIcon fontSize="small" />}
                                                />
                                            ) : (
                                                <Chip
                                                    label="Môn con"
                                                    color="secondary"
                                                    size="small"
                                                    variant="outlined"
                                                    icon={<BookmarkIcon fontSize="small" />}
                                                />
                                            )}
                                        </Box>

                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            Mã môn: <strong>{course.code}</strong>
                                        </Typography>

                                        {course.parent_course_id && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                Thuộc môn: <strong>{getParentCourseName(course.parent_course)}</strong>
                                            </Typography>
                                        )}

                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} noWrap>
                                            {course.description}
                                        </Typography>

                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Tổng số tiết: <strong>{totalHours}</strong>
                                            </Typography>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ width: 60 }}>
                                                    LT: {theoryHours}
                                                </Typography>
                                                <Box sx={{ width: "100%", mr: 1 }}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={totalHours > 0 ? (theoryHours / totalHours) * 100 : 0}
                                                        sx={{
                                                            height: 6,
                                                            borderRadius: 5,
                                                            bgcolor: "#e0e0e0",
                                                            "& .MuiLinearProgress-bar": {
                                                                bgcolor: "primary.main",
                                                            },
                                                        }}
                                                    />
                                                </Box>
                                                <Typography variant="caption" color="text.secondary" sx={{ width: 60 }}>
                                                    TH: {practicalHours}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                    <CardActions>
                                        <Button size="small" component={Link} to={`/courses/${course._id}`}>
                                            Chỉnh sửa
                                        </Button>
                                        <Button size="small" color="error" onClick={() => handleDelete(course._id)}>
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

export default CourseList;
