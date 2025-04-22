import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    Container,
    Typography,
    Box,
    Paper,
    Button,
    Grid,
    Divider,
    Chip,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Tab,
    Tabs,
    CircularProgress,
    Alert,
} from "@mui/material";
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    School as SchoolIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Event as EventIcon,
    Class as ClassIcon,
    MenuBook as MenuBookIcon,
    CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import { getDepartmentById } from "../../api/departmentService";
import { getClassesByDepartmentId } from "../../api/classService";
import { getCourseByDepartmentId } from "../../api/courseService";
import { getEventsByDepartmentId } from "../../api/eventService";

const DepartmentDetail = () => {
    const { _id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [department, setDepartment] = useState(null);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);

    // Sample data for classes, courses, and events
    const [classes, setClasses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        const fetchDepartmentDetails = async () => {
            try {
                const departmentData = await getDepartmentById(_id);
                const classData = await getClassesByDepartmentId(_id);
                const coursesData = await getCourseByDepartmentId(_id);
                const eventData = await getEventsByDepartmentId(_id); // Fetch events data
                if (isMounted) {
                    setDepartment(departmentData);
                    setClasses(classData); // Set classes data
                    setCourses(coursesData); // Set courses data
                    setEvents(eventData); // Set events data
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError("Failed to load department details");
                    setLoading(false);
                }
            }
        };

        fetchDepartmentDetails();

        return () => {
            isMounted = false; // Cleanup to prevent setting state on unmounted component
        };
    }, [_id]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Calculate days remaining
    const calculateDaysRemaining = (endDate) => {
        const today = new Date();
        const end = new Date(endDate);
        const diffTime = end - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: "center" }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Đang tải thông tin chuyên ngành...
                </Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Alert severity="error">{error}</Alert>
                <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/departments")}
                    sx={{ mt: 2 }}
                >
                    Quay lại danh sách
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                    <SchoolIcon sx={{ fontSize: 40, mr: 2, color: "primary.main" }} />
                    <Typography variant="h4">{department.name}</Typography>
                </Box>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate("/departments")}
                        sx={{ mr: 1 }}
                    >
                        Quay lại
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<EditIcon />}
                        component={Link}
                        to={`/departments/edit/${_id}`}
                    >
                        Chỉnh sửa
                    </Button>
                </Box>
            </Box>

            <Paper elevation={3} sx={{ mb: 4 }}>
                <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <Typography variant="h6" gutterBottom>
                                Thông tin chung
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {department.description}
                            </Typography>

                            <Box display="flex" alignItems="center" mb={1}>
                                <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />
                                <Typography variant="body1">
                                    <strong>Người phụ trách:</strong> {department.director}
                                </Typography>
                            </Box>

                            <Box display="flex" alignItems="center" mb={1}>
                                <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />
                                <Typography variant="body1">
                                    <strong>Email:</strong> {department.contactInfo.split("|")[0].trim()}
                                </Typography>
                            </Box>

                            <Box display="flex" alignItems="center" mb={1}>
                                <PhoneIcon sx={{ mr: 1, color: "text.secondary" }} />
                                <Typography variant="body1">
                                    <strong>Điện thoại:</strong> {department.contactInfo.split("|")[1]?.trim()}
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Thời gian
                                    </Typography>

                                    <Box display="flex" alignItems="center" mb={2}>
                                        <CalendarIcon sx={{ mr: 1, color: "text.secondary" }} />
                                        <Typography variant="body1">
                                            <strong>Bắt đầu:</strong>{" "}
                                            {new Date(department.startDate).toLocaleDateString("vi-VN")}
                                        </Typography>
                                    </Box>

                                    <Box display="flex" alignItems="center" mb={2}>
                                        <CalendarIcon sx={{ mr: 1, color: "text.secondary" }} />
                                        <Typography variant="body1">
                                            <strong>Kết thúc:</strong>{" "}
                                            {new Date(department.endDate).toLocaleDateString("vi-VN")}
                                        </Typography>
                                    </Box>

                                    <Chip
                                        label={`Còn ${calculateDaysRemaining(department.endDate)} ngày`}
                                        color="primary"
                                        sx={{ mt: 1 }}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>

            <Box sx={{ width: "100%", mb: 4 }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="department tabs">
                        <Tab icon={<ClassIcon />} label="Lớp học" />
                        <Tab icon={<MenuBookIcon />} label="Môn học" />
                        <Tab icon={<EventIcon />} label="Sự kiện" />
                    </Tabs>
                </Box>

                {/* Classes Tab */}
                <Box role="tabpanel" hidden={tabValue !== 0} sx={{ py: 3 }}>
                    {tabValue === 0 && (
                        <Grid container spacing={2}>
                            {classes.map((cls) => (
                                <Grid item xs={12} sm={6} md={4} key={cls.id}>
                                    <Card>
                                        <CardContent>
                                            <Box display="flex" alignItems="center">
                                                <ClassIcon color="primary" sx={{ mr: 1 }} />
                                                <Typography variant="h6">Lớp {cls.name}</Typography>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Số học viên: {cls.studentCount}
                                            </Typography>
                                            <Button
                                                size="small"
                                                sx={{ mt: 2 }}
                                                component={Link}
                                                to={`/classes/${cls.id}`}
                                            >
                                                Xem chi tiết
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>

                {/* Courses Tab */}
                <Box role="tabpanel" hidden={tabValue !== 1} sx={{ py: 3 }}>
                    {tabValue === 1 && (
                        <Grid container spacing={2}>
                            {courses.map((course) => (
                                <Grid item xs={12} sm={6} md={4} key={course.id}>
                                    <Card>
                                        <CardContent>
                                            <Box display="flex" alignItems="center">
                                                <MenuBookIcon color="primary" sx={{ mr: 1 }} />
                                                <Typography variant="h6">{course.name}</Typography>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Đơn vị học trình: {course.credits}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Giảng viên: {course.instructor}
                                            </Typography>
                                            <Button
                                                size="small"
                                                sx={{ mt: 2 }}
                                                component={Link}
                                                to={`/courses/${course.id}`}
                                            >
                                                Xem chi tiết
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>

                {/* Events Tab */}
                <Box role="tabpanel" hidden={tabValue !== 2} sx={{ py: 3 }}>
                    {tabValue === 2 && (
                        <Grid container spacing={2}>
                            {events.map((event) => (
                                <Grid item xs={12} sm={6} md={4} key={event.id}>
                                    <Card>
                                        <CardContent>
                                            <Box display="flex" alignItems="center">
                                                <EventIcon color="primary" sx={{ mr: 1 }} />
                                                <Typography variant="h6">{event.name}</Typography>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Ngày: {new Date(event.date).toLocaleDateString("vi-VN")}
                                            </Typography>
                                            <Button
                                                size="small"
                                                sx={{ mt: 2 }}
                                                component={Link}
                                                to={`/events/${event.id}`}
                                            >
                                                Xem chi tiết
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            </Box>
        </Container>
    );
};

export default DepartmentDetail;
