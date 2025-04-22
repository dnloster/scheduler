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
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    FilterList as FilterIcon,
    Search as SearchIcon,
    Block as BlockIcon,
    EventBusy as EventBusyIcon,
    EventAvailable as EventAvailableIcon,
    CalendarMonth as CalendarIcon,
    BusinessCenter as BusinessCenterIcon,
    Schedule as ScheduleIcon,
    Groups as GroupsIcon,
    AccessTime as AccessTimeIcon,
    School as SchoolIcon,
} from "@mui/icons-material";
import { getConstraints, deleteConstraint, getConstraintsByDepartment } from "../../api/constraintService";
import { getDepartments } from "../../api/departmentService";

const ConstraintsList = () => {
    const [constraints, setConstraints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState("all");

    // The constraint types based on data structure
    const constraintTypes = ["time_preference", "scheduling_limit", "exam_rule", "grouped_classes"];

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
                        { id: 2, name: "Trung cấp quản lý" },
                        { id: 3, name: "Cao cấp hành chính" },
                    ]);
                }

                // Fetch constraints data from the API
                const constraintsData = await getConstraints();

                if (constraintsData && constraintsData.length > 0) {
                    setConstraints(constraintsData);
                    console.log(constraintsData);
                } else {
                    // Fallback to sample data with the new structure
                    setConstraints([
                        {
                            id: 1,
                            course_id: 1,
                            department_id: 1,
                            can_be_morning: 1,
                            can_be_afternoon: 1,
                            max_hours_per_day: 4,
                            max_hours_per_week: 10,
                            min_days_before_exam: 5,
                            exam_duration_hours: 3,
                            grouped_classes: "1,2|3,4|5,6",
                            requires_consecutive_hours: 0,
                            notes: "A10 học ghép lớp: A-B, C-D, E-F",
                            created_at: "2025-03-31T10:40:58.000Z",
                        },
                        {
                            id: 2,
                            course_id: 2,
                            department_id: 1,
                            can_be_morning: 1,
                            can_be_afternoon: 0,
                            max_hours_per_day: 3,
                            max_hours_per_week: 8,
                            min_days_before_exam: 7,
                            exam_duration_hours: 2,
                            grouped_classes: "1,2|3,4",
                            requires_consecutive_hours: 1,
                            notes: "Q10 chỉ học buổi sáng, yêu cầu giờ học liên tiếp",
                            created_at: "2025-03-31T10:41:30.000Z",
                        },
                        {
                            id: 3,
                            course_id: 3,
                            department_id: 2,
                            can_be_morning: 1,
                            can_be_afternoon: 1,
                            max_hours_per_day: 5,
                            max_hours_per_week: 12,
                            min_days_before_exam: 3,
                            exam_duration_hours: 2,
                            grouped_classes: "",
                            requires_consecutive_hours: 0,
                            notes: "V30 môn học khoa Trung cấp quản lý",
                            created_at: "2025-04-02T09:15:00.000Z",
                        },
                    ]);
                }
            } catch (err) {
                console.error("Error fetching constraints:", err);
                setError("Không thể tải dữ liệu ràng buộc. Vui lòng thử lại sau.");

                // Set fallback data with new structure
                setConstraints([
                    {
                        id: 1,
                        course_id: 1,
                        department_id: 1,
                        can_be_morning: 1,
                        can_be_afternoon: 1,
                        max_hours_per_day: 4,
                        max_hours_per_week: 10,
                        min_days_before_exam: 5,
                        exam_duration_hours: 3,
                        grouped_classes: "1,2|3,4|5,6",
                        requires_consecutive_hours: 0,
                        notes: "A10 học ghép lớp: A-B, C-D, E-F",
                        created_at: "2025-03-31T10:40:58.000Z",
                    },
                ]);

                // Fallback departments data
                setDepartments([
                    { id: 1, name: "Sơ cấp báo vụ" },
                    { id: 2, name: "Trung cấp quản lý" },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa ràng buộc này?")) {
            try {
                await deleteConstraint(id);
                // Update the local state after successful deletion
                setConstraints(constraints.filter((constraint) => constraint.id !== id));
            } catch (err) {
                console.error("Error deleting constraint:", err);
                alert("Không thể xóa ràng buộc. Vui lòng thử lại sau.");
            }
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterTypeChange = (e) => {
        setFilterType(e.target.value);
    };

    // Handle department change with direct API call for better performance
    const handleDepartmentChange = async (e) => {
        const deptId = e.target.value;
        setSelectedDepartment(deptId);

        // If "all" is selected, fetch all constraints
        // Otherwise fetch constraints for the specific department
        if (deptId !== "all") {
            setLoading(true);
            try {
                const deptConstraints = await getConstraintsByDepartment(deptId);
                setConstraints(deptConstraints);
            } catch (err) {
                console.error("Error fetching constraints for department:", err);
                setError("Không thể tải dữ liệu ràng buộc cho chuyên ngành này.");
            } finally {
                setLoading(false);
            }
        } else {
            // Fetch all constraints
            setLoading(true);
            try {
                const allConstraints = await getConstraints();
                setConstraints(allConstraints);
            } catch (err) {
                console.error("Error fetching all constraints:", err);
                setError("Không thể tải dữ liệu ràng buộc.");
            } finally {
                setLoading(false);
            }
        }
    };

    // Get department name by id
    const getDepartmentName = (departmentId) => {
        const department = departments.find((d) => d.id === departmentId);
        return department ? department.name : "Không xác định";
    };

    // Filter constraints based on search term and constraint type (department filtering happens via API)
    const filteredConstraints = constraints.filter((constraint) => {
        const matchesSearch = constraint.notes?.toLowerCase().includes(searchTerm.toLowerCase());

        // Determine constraint type for filtering
        let constraintType = "scheduling_limit"; // Default

        if (constraint.grouped_classes && constraint.grouped_classes.trim() !== "") {
            constraintType = "grouped_classes";
        } else if (constraint.min_days_before_exam > 0 || constraint.exam_duration_hours > 0) {
            constraintType = "exam_rule";
        } else if (constraint.can_be_morning === 1 || constraint.can_be_afternoon === 1) {
            constraintType = "time_preference";
        }

        const matchesType = filterType === "all" || constraintType === filterType;

        // We don't need to check department_id here because we're already filtering by department in the API call
        // When selectedDepartment is "all", we show all departments
        // When a specific department is selected, the API only returns constraints for that department

        return matchesSearch && matchesType;
    });

    // Get constraint type from the constraint object
    const getConstraintType = (constraint) => {
        if (constraint.grouped_classes && constraint.grouped_classes.trim() !== "") {
            return "grouped_classes";
        } else if (constraint.min_days_before_exam > 0 || constraint.exam_duration_hours > 0) {
            return "exam_rule";
        } else if (constraint.can_be_morning !== null || constraint.can_be_afternoon !== null) {
            return "time_preference";
        } else {
            return "scheduling_limit";
        }
    };

    // Get constraint type display info
    const getConstraintTypeInfo = (type) => {
        switch (type) {
            case "time_preference":
                return {
                    display: "Ưu tiên thời gian",
                    icon: <AccessTimeIcon color="info" />,
                    color: "info",
                };
            case "scheduling_limit":
                return {
                    display: "Giới hạn lịch học",
                    icon: <ScheduleIcon color="warning" />,
                    color: "warning",
                };
            case "exam_rule":
                return {
                    display: "Quy tắc thi",
                    icon: <SchoolIcon color="error" />,
                    color: "error",
                };
            case "grouped_classes":
                return {
                    display: "Lớp học ghép",
                    icon: <GroupsIcon color="success" />,
                    color: "success",
                };
            default:
                return {
                    display: "Khác",
                    icon: <BlockIcon />,
                    color: "default",
                };
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
    };

    // Format time preferences for display
    const formatTimePreferences = (constraint) => {
        const times = [];
        if (constraint.can_be_morning === 1) times.push("Buổi sáng");
        if (constraint.can_be_afternoon === 1) times.push("Buổi chiều");

        if (times.length === 0) return "Không xác định";
        return times.join(", ");
    };

    // Format grouped classes for display
    const formatGroupedClasses = (groupedClassesStr) => {
        if (!groupedClassesStr) return "Không có lớp ghép";

        const groups = groupedClassesStr.split("|");
        return groups
            .map((group) => {
                const classes = group.split(",").join(", ");
                return `Nhóm: ${classes}`;
            })
            .join(" | ");
    };

    // Render constraint details based on type
    const renderConstraintDetails = (constraint) => {
        const type = getConstraintType(constraint);

        switch (type) {
            case "time_preference":
                return (
                    <>
                        <Box display="flex" alignItems="center" mb={1}>
                            <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                            <Typography variant="body2" color="text.secondary">
                                {formatTimePreferences(constraint)}
                            </Typography>
                        </Box>
                    </>
                );
            case "scheduling_limit":
                return (
                    <>
                        <Box display="flex" alignItems="center" mb={1}>
                            <Typography variant="body2" sx={{ fontWeight: "bold", mr: 1 }}>
                                Giờ tối đa/ngày:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {constraint.max_hours_per_day}
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" mb={1}>
                            <Typography variant="body2" sx={{ fontWeight: "bold", mr: 1 }}>
                                Giờ tối đa/tuần:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {constraint.max_hours_per_week}
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" mb={1}>
                            <Typography variant="body2" sx={{ fontWeight: "bold", mr: 1 }}>
                                Giờ liên tiếp:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {constraint.requires_consecutive_hours === 1 ? "Yêu cầu" : "Không yêu cầu"}
                            </Typography>
                        </Box>
                    </>
                );
            case "exam_rule":
                return (
                    <>
                        <Box display="flex" alignItems="center" mb={1}>
                            <Typography variant="body2" sx={{ fontWeight: "bold", mr: 1 }}>
                                Thời gian thi:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {constraint.exam_duration_hours} giờ
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" mb={1}>
                            <Typography variant="body2" sx={{ fontWeight: "bold", mr: 1 }}>
                                Ngày tối thiểu trước thi:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {constraint.min_days_before_exam} ngày
                            </Typography>
                        </Box>
                    </>
                );
            case "grouped_classes":
                return (
                    <>
                        <Box display="flex" alignItems="center" mb={1}>
                            <GroupsIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                            <Typography variant="body2" color="text.secondary">
                                {formatGroupedClasses(constraint.grouped_classes)}
                            </Typography>
                        </Box>
                    </>
                );
            default:
                return null;
        }
    };

    // Reset all filters including refetching all constraints
    const resetAllFilters = async () => {
        setSearchTerm("");
        setFilterType("all");
        setSelectedDepartment("all");

        // Reload all constraints when filters are reset
        setLoading(true);
        try {
            const allConstraints = await getConstraints();
            setConstraints(allConstraints);
        } catch (err) {
            console.error("Error fetching all constraints:", err);
            setError("Không thể tải lại dữ liệu ràng buộc.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Ràng buộc lịch trình</Typography>
                <Box>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        component={Link}
                        to="/constraints/new"
                    >
                        Thêm ràng buộc
                    </Button>
                </Box>
            </Box>

            <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            placeholder="Tìm kiếm ràng buộc..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="department-filter-label">Chuyên ngành</InputLabel>
                            <Select
                                labelId="department-filter-label"
                                value={selectedDepartment}
                                onChange={handleDepartmentChange}
                                label="Chuyên ngành"
                            >
                                <MenuItem value="all">Tất cả chuyên ngành</MenuItem>
                                {departments.map((dept) => (
                                    <MenuItem key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="filter-type-label">Loại ràng buộc</InputLabel>
                            <Select
                                labelId="filter-type-label"
                                value={filterType}
                                onChange={handleFilterTypeChange}
                                label="Loại ràng buộc"
                            >
                                <MenuItem value="all">Tất cả loại</MenuItem>
                                {constraintTypes.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {getConstraintTypeInfo(type).display}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button fullWidth variant="outlined" startIcon={<FilterIcon />} onClick={resetAllFilters}>
                            Xóa bộ lọc
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : filteredConstraints.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: "center" }}>
                    <Typography variant="h6">Không tìm thấy ràng buộc nào phù hợp với điều kiện tìm kiếm</Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {filteredConstraints.map((constraint) => {
                        const type = getConstraintType(constraint);
                        const typeInfo = getConstraintTypeInfo(type);

                        return (
                            <Grid item xs={12} md={6} key={constraint.id}>
                                <Card>
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                            <Box display="flex" alignItems="center">
                                                {typeInfo.icon}
                                                <Typography variant="h6" component="div" sx={{ ml: 1 }}>
                                                    Khóa học ID: {constraint.course_id}
                                                </Typography>
                                            </Box>
                                            <Chip label={typeInfo.display} color={typeInfo.color} size="small" />
                                        </Box>

                                        <Box display="flex" alignItems="center" mb={2}>
                                            <Typography variant="body2" sx={{ fontWeight: "bold", mr: 1 }}>
                                                Chuyên ngành:
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {getDepartmentName(constraint.department_id)}
                                            </Typography>
                                        </Box>

                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {constraint.notes || "Không có ghi chú"}
                                        </Typography>

                                        {renderConstraintDetails(constraint)}

                                        <Box display="flex" alignItems="center" mt={2}>
                                            <CalendarIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                                            <Typography variant="body2" color="text.secondary">
                                                Tạo ngày: {formatDate(constraint.created_at)}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                    <CardActions>
                                        <Button size="small" component={Link} to={`/constraints/${constraint.id}/edit`}>
                                            Chỉnh sửa
                                        </Button>
                                        <Button size="small" color="error" onClick={() => handleDelete(constraint.id)}>
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

export default ConstraintsList;
