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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Switch,
    FormControlLabel,
    Skeleton,
    Card,
    CardContent,
    Fade,
    Slide,
    Zoom,
    CircularProgress,
    Chip,
    LinearProgress,
    Divider,
    AlertTitle,
} from "@mui/material";
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Book as BookIcon,
    School as SchoolIcon,
    Timer as TimerIcon,
    Info as InfoIcon,
    Edit as EditIcon,
    Bookmark as BookmarkIcon,
} from "@mui/icons-material";
import { createCourse, getCourseById, updateCourse, getCourses, deleteCourse } from "../../api/courseService";
import { getDepartments } from "../../api/departmentService";

const CourseForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = id !== undefined;
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [hasChildCourses, setHasChildCourses] = useState(false);

    // Department data for dropdown
    const [departments, setDepartments] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);

    // Parent courses for dropdown (only main courses)
    const [mainCourses, setMainCourses] = useState([]);
    const [loadingMainCourses, setLoadingMainCourses] = useState(true);

    // Course data state
    const [course, setCourse] = useState({
        code: "",
        name: "",
        departmentId: "",
        department: "",
        description: "",
        total_hours: 0,
        theory_hours: 0,
        practical_hours: 0,
        is_subcourse: false,
        parent_course_id: null,
        parent_course: null,
    });

    // Validation errors
    const [errors, setErrors] = useState({});

    // Fetch departments and main courses on component mount
    useEffect(() => {
        const fetchDepartmentsAndCourses = async () => {
            try {
                // Fetch departments
                setLoadingDepartments(true);
                let departmentsData;
                try {
                    departmentsData = await getDepartments();
                    if (departmentsData && departmentsData.length > 0) {
                        setDepartments(departmentsData);
                        if (!isEditMode) {
                            setCourse((prev) => ({
                                ...prev,
                                departmentId: departmentsData[0]._id,
                                department: departmentsData[0]._id,
                            }));
                        }
                    } else {
                        setDepartments([{ _id: "1", name: "Sơ cấp báo vụ" }]);
                        if (!isEditMode) {
                            setCourse((prev) => ({ ...prev, departmentId: "1", department: "1" }));
                        }
                    }
                } catch (error) {
                    console.error("Error fetching departments:", error);
                    setDepartments([{ _id: "1", name: "Sơ cấp báo vụ" }]);
                    if (!isEditMode) {
                        setCourse((prev) => ({ ...prev, departmentId: "1", department: "1" }));
                    }
                } finally {
                    setLoadingDepartments(false);
                }

                // Fetch main courses for parent selection
                setLoadingMainCourses(true);
                try {
                    const coursesData = await getCourses();
                    if (coursesData && coursesData.length > 0) {
                        const mainCoursesData = coursesData.filter((c) => !c.parent_course);
                        setMainCourses(mainCoursesData);
                        if (isEditMode && id) {
                            const childCourses = coursesData.filter(
                                (c) => c.parent_course?._id === id || c.parent_course === id
                            );
                            setHasChildCourses(childCourses.length > 0);
                        }
                    } else {
                        setMainCourses([
                            { _id: "1", code: "A10", name: "Môn A10" },
                            { _id: "2", code: "Q10", name: "Môn Q10" },
                            { _id: "3", code: "V30", name: "Môn V30" },
                        ]);
                    }
                } catch (error) {
                    console.error("Error fetching main courses:", error);
                    setMainCourses([
                        { _id: "1", code: "A10", name: "Môn A10" },
                        { _id: "2", code: "Q10", name: "Môn Q10" },
                        { _id: "3", code: "V30", name: "Môn V30" },
                    ]);
                } finally {
                    setLoadingMainCourses(false);
                }
            } catch (err) {
                console.error("Error loading initial data:", err);
            }
        };

        fetchDepartmentsAndCourses();
    }, [isEditMode, id]);

    useEffect(() => {
        if (isEditMode) {
            setLoading(true);
            fetchCourseData();
        }
    }, [id, isEditMode]);

    const fetchCourseData = async () => {
        setLoading(true);
        setError(null);

        try {
            const courseData = await getCourseById(id);

            if (courseData) {
                // Transform API response to match local state format
                setCourse({
                    ...courseData,
                    departmentId: courseData.department?._id || courseData.department,
                    parent_course_id: courseData.parent_course?._id || courseData.parent_course,
                    is_subcourse: !!courseData.parent_course,
                });

                try {
                    const allCourses = await getCourses();
                    const childCourses = allCourses.filter(
                        (c) => c.parent_course?._id === courseData._id || c.parent_course === courseData._id
                    );
                    setHasChildCourses(childCourses.length > 0);
                } catch (error) {
                    console.error("Error fetching all courses:", error);
                    setHasChildCourses(false);
                }
            } else {
                setError("Không tìm thấy môn học với ID này.");
            }
        } catch (err) {
            console.error("Error fetching course:", err);
            setError("Đã xảy ra lỗi khi tải dữ liệu môn học. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    // Update total hours when theory or practical hours change
    useEffect(() => {
        setCourse((prev) => ({
            ...prev,
            total_hours: Number(prev.theory_hours) + Number(prev.practical_hours),
        }));
    }, [course.theory_hours, course.practical_hours]);

    const validateForm = () => {
        const newErrors = {};

        if (!course.code?.trim()) {
            newErrors.code = "Mã môn học là bắt buộc";
        }

        if (!course.name?.trim()) {
            newErrors.name = "Tên môn học là bắt buộc";
        }

        if (!course.departmentId && !course.department) {
            newErrors.department = "Vui lòng chọn chuyên ngành";
        }

        if (course.is_subcourse && !course.parent_course_id && !course.parent_course) {
            newErrors.parent_course_id = "Vui lòng chọn môn học chính";
        }

        // Chỉ kiểm tra tiết học nếu không phải là môn học cha
        if (!hasChildCourses) {
            if (Number(course.theory_hours) < 0) {
                newErrors.theory_hours = "Số tiết lý thuyết không được âm";
            }

            if (Number(course.practical_hours) < 0) {
                newErrors.practical_hours = "Số tiết thực hành không được âm";
            }

            if (Number(course.theory_hours) + Number(course.practical_hours) <= 0) {
                newErrors.total_hours = "Tổng số tiết phải lớn hơn 0";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCourse({
            ...course,
            [name]: value,
        });
    };

    const handleNumberInputChange = (e) => {
        const { name, value } = e.target;
        setCourse({
            ...course,
            [name]: value === "" ? 0 : Number(value),
        });
    };

    const handleSwitchChange = (e) => {
        const { name, checked } = e.target;

        // Reset parent course if switching from subcourse to main course
        if (name === "is_subcourse" && !checked) {
            setCourse({
                ...course,
                is_subcourse: checked,
                parent_course_id: null,
                parent_course: null,
            });
        } else {
            setCourse({
                ...course,
                [name]: checked,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setError("Vui lòng kiểm tra lại thông tin nhập.");
            return;
        }

        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            // Prepare data for API
            const courseData = {
                code: course.code,
                name: course.name,
                department: course.departmentId || course.department,
                parent_course: course.is_subcourse ? course.parent_course_id || course.parent_course : null,
                description: course.description,
            };

            // Chỉ gửi thông tin tiết học nếu không phải là môn học cha
            if (!hasChildCourses) {
                courseData.total_hours = course.total_hours;
                courseData.theory_hours = course.theory_hours;
                courseData.practical_hours = course.practical_hours;
            }

            if (isEditMode) {
                await updateCourse(id, courseData);
            } else {
                await createCourse(courseData);
            }

            setSuccess(true);

            // Redirect to course list after saving
            setTimeout(() => {
                navigate("/courses");
            }, 1500);
        } catch (err) {
            console.error("Error saving course:", err);
            setError("Đã xảy ra lỗi khi lưu môn học. Vui lòng thử lại sau.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa môn học này?")) {
            try {
                await deleteCourse(id);
                setSuccess(true);

                setTimeout(() => {
                    navigate("/courses");
                }, 1000);
            } catch (error) {
                console.error("Error deleting course:", error);
                setError("Không thể xóa môn học. Vui lòng thử lại sau.");
            }
        }
    };

    // Calculate the ratio for the progress bar
    const theoryHoursRatio = course.total_hours > 0 ? Math.round((course.theory_hours / course.total_hours) * 100) : 0;

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Zoom in={true} style={{ transitionDelay: "100ms" }}>
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        borderRadius: 2,
                        backgroundImage:
                            "linear-gradient(to right bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.8))",
                        backdropFilter: "blur(10px)",
                    }}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Fade in={true} timeout={800}>
                            <Typography variant="h5" fontWeight="bold" color="primary">
                                {isEditMode ? (
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <EditIcon /> Chỉnh sửa: {course.name || "Đang tải..."}
                                    </Box>
                                ) : (
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <AddIcon /> Thêm môn học mới
                                    </Box>
                                )}
                            </Typography>
                        </Fade>
                        <Slide direction="left" in={true} timeout={500}>
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigate("/courses")}
                                sx={{ borderRadius: 2 }}
                            >
                                Quay lại
                            </Button>
                        </Slide>
                    </Box>

                    {loading && (
                        <Box sx={{ width: "100%", mb: 3 }}>
                            <LinearProgress color="primary" />
                            <Box sx={{ mt: 2 }}>
                                <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 2 }} />
                                <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 2 }} />
                                <Skeleton variant="rectangular" width="100%" height={56} />
                            </Box>
                        </Box>
                    )}

                    {error && (
                        <Fade in={true}>
                            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        </Fade>
                    )}

                    {success && (
                        <Fade in={true}>
                            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                                {isEditMode ? "Cập nhật thành công!" : "Thêm mới thành công!"}
                            </Alert>
                        </Fade>
                    )}

                    {!loading && (
                        <Fade in={true} timeout={800}>
                            <Box component="form" onSubmit={handleSubmit}>
                                <Grid sx={{ xs: 12 }}>
                                    <Card
                                        sx={{
                                            mb: 2,
                                            backgroundColor: course.is_subcourse ? "rgba(238, 242, 255, 0.8)" : "white",
                                            transition: "background-color 0.3s ease",
                                            borderRadius: 2,
                                        }}
                                    >
                                        <CardContent>
                                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={course.is_subcourse}
                                                            onChange={handleSwitchChange}
                                                            name="is_subcourse"
                                                            color="primary"
                                                        />
                                                    }
                                                    label={
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <BookIcon
                                                                fontSize="small"
                                                                color={course.is_subcourse ? "primary" : "action"}
                                                            />
                                                            <Typography>
                                                                {course.is_subcourse ? "Môn học con" : "Môn học chính"}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                                <Chip
                                                    icon={
                                                        course.is_subcourse ? (
                                                            <BookmarkIcon fontSize="small" />
                                                        ) : (
                                                            <BookIcon fontSize="small" />
                                                        )
                                                    }
                                                    label={
                                                        course.is_subcourse ? "Thuộc môn học chính" : "Môn học độc lập"
                                                    }
                                                    color={course.is_subcourse ? "info" : "default"}
                                                    variant="outlined"
                                                />
                                            </Box>

                                            {course.is_subcourse && (
                                                <Fade in={course.is_subcourse}>
                                                    <FormControl
                                                        fullWidth
                                                        error={!!errors.parent_course_id}
                                                        sx={{ mt: 2, animation: "fadeIn 0.5s ease" }}
                                                    >
                                                        <InputLabel id="parent-course-label">Môn học chính</InputLabel>
                                                        <Select
                                                            labelId="parent-course-label"
                                                            value={
                                                                course.parent_course_id || course.parent_course || ""
                                                            }
                                                            name="parent_course_id"
                                                            label="Môn học chính"
                                                            onChange={handleInputChange}
                                                            disabled={loadingMainCourses}
                                                            endAdornment={
                                                                loadingMainCourses && (
                                                                    <CircularProgress size={20} sx={{ mr: 2 }} />
                                                                )
                                                            }
                                                        >
                                                            {mainCourses.map((mainCourse) => (
                                                                <MenuItem
                                                                    key={mainCourse._id || mainCourse.id}
                                                                    value={mainCourse._id || mainCourse.id}
                                                                >
                                                                    <Box display="flex" alignItems="center" gap={1}>
                                                                        <BookIcon fontSize="small" color="primary" />
                                                                        <span>
                                                                            {mainCourse.code} - {mainCourse.name}
                                                                        </span>
                                                                    </Box>
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                        {errors.parent_course_id && (
                                                            <FormHelperText error>
                                                                {errors.parent_course_id}
                                                            </FormHelperText>
                                                        )}
                                                    </FormControl>
                                                </Fade>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Divider sx={{ my: 3 }} />
                                <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                                    <Grid size={6}>
                                        <FormControl
                                            fullWidth
                                            error={!!errors.department}
                                            disabled={loadingDepartments}
                                        >
                                            <InputLabel id="department-label">
                                                <Box display="flex" alignItems="center" gap={0.5}>
                                                    <SchoolIcon fontSize="small" />
                                                    <span>Chuyên ngành</span>
                                                </Box>
                                            </InputLabel>
                                            <Select
                                                labelId="department-label"
                                                value={course.departmentId || course.department || ""}
                                                name="departmentId"
                                                label="⚓ Chuyên ngành"
                                                onChange={handleInputChange}
                                                endAdornment={
                                                    loadingDepartments && <CircularProgress size={20} sx={{ mr: 2 }} />
                                                }
                                            >
                                                {departments.map((dept) => (
                                                    <MenuItem key={dept._id || dept.id} value={dept._id || dept.id}>
                                                        {dept.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.department && (
                                                <FormHelperText error>{errors.department}</FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>

                                    <Grid size={6}>
                                        <TextField
                                            fullWidth
                                            label="Mã môn học"
                                            name="code"
                                            value={course.code || ""}
                                            onChange={handleInputChange}
                                            error={!!errors.code}
                                            helperText={errors.code}
                                            required
                                            InputProps={{
                                                startAdornment: (
                                                    <Box component="span" mr={1}>
                                                        #
                                                    </Box>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                                <Divider sx={{ my: 3 }} />
                                <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                                    <Grid size={4}>
                                        <TextField
                                            fullWidth
                                            label="Tên môn học"
                                            name="name"
                                            value={course.name || ""}
                                            onChange={handleInputChange}
                                            error={!!errors.name}
                                            helperText={errors.name}
                                            required
                                            InputProps={{
                                                startAdornment: (
                                                    <BookIcon fontSize="small" sx={{ mr: 1, color: "primary.main" }} />
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    <Grid size={8}>
                                        <TextField
                                            fullWidth
                                            label="Mô tả"
                                            name="description"
                                            value={course.description || ""}
                                            onChange={handleInputChange}
                                            rows={3}
                                            InputProps={{
                                                startAdornment: (
                                                    <InfoIcon fontSize="small" sx={{ mr: 1, color: "primary.main" }} />
                                                ),
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                                <Divider sx={{ my: 3 }} />
                                <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                                    <Grid item xs={12}>
                                        <Card
                                            sx={{
                                                mb: 1,
                                                mt: 1,
                                                borderRadius: 2,
                                                backgroundColor: "rgba(250, 250, 250, 0.8)",
                                            }}
                                        >
                                            <CardContent>
                                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                                    <TimerIcon color="primary" />
                                                    <Typography
                                                        variant="subtitle1"
                                                        fontWeight="medium"
                                                        color="primary.main"
                                                    >
                                                        Phân bổ tiết học
                                                    </Typography>
                                                </Box>

                                                {hasChildCourses ? (
                                                    <Alert severity="info" sx={{ mb: 2 }}>
                                                        <AlertTitle>Thông báo</AlertTitle>
                                                        Môn học này có các môn học con. Thời lượng sẽ được tính tự động
                                                        từ tổng thời lượng của các môn học con.
                                                    </Alert>
                                                ) : (
                                                    <>
                                                        <Grid container spacing={3}>
                                                            <Grid item xs={12} md={4}>
                                                                <TextField
                                                                    fullWidth
                                                                    label="Số tiết lý thuyết"
                                                                    name="theory_hours"
                                                                    type="number"
                                                                    value={course.theory_hours}
                                                                    onChange={handleNumberInputChange}
                                                                    error={!!errors.theory_hours}
                                                                    helperText={errors.theory_hours}
                                                                    InputProps={{
                                                                        inputProps: { min: 0 },
                                                                        endAdornment: (
                                                                            <Box
                                                                                component="span"
                                                                                ml={1}
                                                                                color="text.secondary"
                                                                            >
                                                                                tiết
                                                                            </Box>
                                                                        ),
                                                                    }}
                                                                    sx={{ mb: 2 }}
                                                                />
                                                            </Grid>

                                                            <Grid item xs={12} md={4}>
                                                                <TextField
                                                                    fullWidth
                                                                    label="Số tiết thực hành"
                                                                    name="practical_hours"
                                                                    type="number"
                                                                    value={course.practical_hours}
                                                                    onChange={handleNumberInputChange}
                                                                    error={!!errors.practical_hours}
                                                                    helperText={errors.practical_hours}
                                                                    InputProps={{
                                                                        inputProps: { min: 0 },
                                                                        endAdornment: (
                                                                            <Box
                                                                                component="span"
                                                                                ml={1}
                                                                                color="text.secondary"
                                                                            >
                                                                                tiết
                                                                            </Box>
                                                                        ),
                                                                    }}
                                                                    sx={{ mb: 2 }}
                                                                />
                                                            </Grid>

                                                            <Grid item xs={12} md={4}>
                                                                <TextField
                                                                    fullWidth
                                                                    label="Tổng số tiết"
                                                                    value={course.total_hours}
                                                                    disabled
                                                                    error={!!errors.total_hours}
                                                                    helperText={errors.total_hours}
                                                                    InputProps={{
                                                                        endAdornment: (
                                                                            <Box
                                                                                component="span"
                                                                                ml={1}
                                                                                color="text.secondary"
                                                                            >
                                                                                tiết
                                                                            </Box>
                                                                        ),
                                                                    }}
                                                                    sx={{ mb: 2 }}
                                                                />
                                                            </Grid>
                                                        </Grid>

                                                        <Box sx={{ mt: 1 }}>
                                                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                                                                <Typography variant="body2">Lý thuyết</Typography>
                                                                <Typography variant="body2">Thực hành</Typography>
                                                            </Box>
                                                            <Box
                                                                sx={{
                                                                    width: "100%",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                }}
                                                            >
                                                                <Box
                                                                    sx={{
                                                                        width: `${theoryHoursRatio}%`,
                                                                        bgcolor: "primary.main",
                                                                        height: 10,
                                                                        borderRadius: "10px 0 0 10px",
                                                                    }}
                                                                />
                                                                <Box
                                                                    sx={{
                                                                        width: `${100 - theoryHoursRatio}%`,
                                                                        bgcolor: "success.main",
                                                                        height: 10,
                                                                        borderRadius: "0 10px 10px 0",
                                                                    }}
                                                                />
                                                            </Box>
                                                            <Box display="flex" justifyContent="space-between" mt={0.5}>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {theoryHoursRatio}% ({course.theory_hours} tiết)
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {100 - theoryHoursRatio}% ({course.practical_hours}{" "}
                                                                    tiết)
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid sx={{ mt: 2, xs: 12 }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
                                            {isEditMode ? (
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    startIcon={<DeleteIcon />}
                                                    onClick={handleDelete}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    Xóa môn học
                                                </Button>
                                            ) : (
                                                <Box /> // Empty box to maintain layout
                                            )}
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                startIcon={
                                                    saving ? (
                                                        <CircularProgress size={20} color="inherit" />
                                                    ) : (
                                                        <SaveIcon />
                                                    )
                                                }
                                                disabled={saving}
                                                sx={{
                                                    borderRadius: 2,
                                                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                                                    "&:hover": {
                                                        boxShadow: "0 6px 15px rgba(0, 0, 0, 0.2)",
                                                    },
                                                }}
                                            >
                                                {saving
                                                    ? "Đang lưu..."
                                                    : isEditMode
                                                    ? "Cập nhật môn học"
                                                    : "Lưu môn học"}
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Fade>
                    )}
                </Paper>
            </Zoom>
        </Container>
    );
};

export default CourseForm;
