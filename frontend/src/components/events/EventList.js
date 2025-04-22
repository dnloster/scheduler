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
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    CircularProgress,
    Alert,
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Event as EventIcon,
    Search as SearchIcon,
    CalendarMonth as CalendarIcon,
    LocationOn as LocationIcon,
    FilterList as FilterIcon,
} from "@mui/icons-material";

// Import API services
import { getEvents, deleteEvent } from "../../api/eventService";
import { getDepartments } from "../../api/departmentService";

const EventList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewType, setViewType] = useState("grid"); // 'grid' or 'table'
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterDepartment, setFilterDepartment] = useState("all");

    // Department data
    const [departments, setDepartments] = useState([]);

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
                        { id: 2, name: "Trung cấp hành chính" },
                        { id: 3, name: "Cao cấp quản lý" },
                    ]);
                }

                // Fetch events data
                const eventsData = await getEvents();
                if (eventsData && eventsData.length > 0) {
                    // Ensure each event has the right formatting and required fields
                    const formattedEvents = eventsData.map((event) => {
                        // Extract department name from departments array
                        const dept = departmentsData.find((d) => d.id === event.department_id);

                        return {
                            ...event,
                            // Ensure consistent property naming
                            id: event.id,
                            title: event.title || event.name,
                            departmentId: event.department_id,
                            departmentName: dept ? dept.name : "Unknown Department",
                            // Make sure time is formatted properly
                            startTime: event.start_time || "08:00",
                            endTime: event.end_time || "17:00",
                            // Extract type from event data or use default
                            type: event.type || "Sự kiện",
                            // Make sure description is present
                            description: event.description || "",
                        };
                    });

                    setEvents(formattedEvents);
                } else {
                    // Fallback to sample data
                    setEvents([
                        {
                            id: 1,
                            title: "Khai giảng khóa học Sơ cấp báo vụ",
                            description: "Lễ khai giảng chính thức cho khóa học Sơ cấp báo vụ năm 2025.",
                            date: "2025-06-01",
                            startTime: "08:00",
                            endTime: "11:30",
                            location: "Hội trường A",
                            departmentId: 1,
                            departmentName: "Sơ cấp báo vụ",
                            type: "Lễ khai giảng",
                        },
                        {
                            id: 2,
                            title: "Thi giữa kỳ",
                            description: "Kỳ thi giữa kỳ cho các môn học cơ bản.",
                            date: "2025-09-15",
                            startTime: "07:30",
                            endTime: "11:00",
                            location: "Phòng thi B",
                            departmentId: 1,
                            departmentName: "Sơ cấp báo vụ",
                            type: "Kỳ thi",
                        },
                    ]);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Không thể tải dữ liệu sự kiện. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
            try {
                await deleteEvent(id);
                // Update the local state after successful deletion
                setEvents(events.filter((event) => event.id !== id));
            } catch (err) {
                console.error("Error deleting event:", err);
                alert("Không thể xóa sự kiện. Vui lòng thử lại sau.");
            }
        }
    };

    const toggleViewType = () => {
        setViewType(viewType === "grid" ? "table" : "grid");
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterTypeChange = (e) => {
        setFilterType(e.target.value);
    };

    const handleFilterDepartmentChange = (e) => {
        setFilterDepartment(e.target.value);
    };

    // Filter events based on search term and filters
    const filteredEvents = events.filter((event) => {
        const matchesSearch =
            event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            false ||
            event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            false ||
            event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            false;

        const matchesType = filterType === "all" || event.type === filterType;

        const matchesDepartment = filterDepartment === "all" || event.department?.toString() === filterDepartment;

        return matchesSearch && matchesType && matchesDepartment;
    });

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "Unknown date";

        const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString("vi-VN", options);
    };

    // Get event status based on date
    const getEventStatus = (dateString) => {
        if (!dateString) return { status: "Không rõ ngày", color: "default" };

        const eventDate = new Date(dateString);
        const today = new Date();

        if (eventDate < today) {
            return { status: "Đã diễn ra", color: "default" };
        } else if (eventDate.toDateString() === today.toDateString()) {
            return { status: "Hôm nay", color: "success" };
        } else {
            // Calculate days until event
            const diffTime = eventDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 7) {
                return { status: `Còn ${diffDays} ngày`, color: "warning" };
            } else {
                return { status: `Còn ${diffDays} ngày`, color: "primary" };
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Sự kiện</Typography>
                <Box>
                    <Button variant="outlined" onClick={toggleViewType} sx={{ mr: 2 }}>
                        {viewType === "grid" ? "Xem dạng bảng" : "Xem dạng lưới"}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        component={Link}
                        to="/events/new"
                    >
                        Thêm sự kiện
                    </Button>
                </Box>
            </Box>

            <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            placeholder="Tìm kiếm sự kiện..."
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
                            <InputLabel id="filter-department-label">Chuyên ngành</InputLabel>
                            <Select
                                labelId="filter-department-label"
                                value={filterDepartment}
                                onChange={handleFilterDepartmentChange}
                                label="Chuyên ngành"
                            >
                                <MenuItem value="all">Tất cả chuyên ngành</MenuItem>
                                {departments.map((dept) => (
                                    <MenuItem key={dept._id} value={dept._id.toString()}>
                                        {dept.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<FilterIcon />}
                            onClick={() => {
                                setSearchTerm("");
                                setFilterType("all");
                                setFilterDepartment("all");
                            }}
                        >
                            Xóa bộ lọc
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {loading ? (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ my: 2 }}>
                    {error}
                </Alert>
            ) : filteredEvents.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: "center" }}>
                    <Typography variant="h6">Không tìm thấy sự kiện nào phù hợp với điều kiện tìm kiếm</Typography>
                </Paper>
            ) : viewType === "table" ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Tiêu đề</TableCell>
                                <TableCell>Loại</TableCell>
                                <TableCell>Ngày</TableCell>
                                <TableCell>Thời gian</TableCell>
                                <TableCell>Địa điểm</TableCell>
                                <TableCell>Chuyên ngành</TableCell>
                                <TableCell>Trạng thái</TableCell>
                                <TableCell align="right">Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredEvents.map((event) => {
                                const eventStatus = getEventStatus(event.date);

                                return (
                                    <TableRow key={event._id}>
                                        <TableCell>
                                            <Link
                                                to={`/events/${event._id}`}
                                                style={{ textDecoration: "none", color: "inherit" }}
                                            >
                                                <Typography fontWeight="bold">{event.title}</Typography>
                                            </Link>
                                        </TableCell>
                                        <TableCell>{event.type}</TableCell>
                                        <TableCell>{formatDate(event.date)}</TableCell>
                                        <TableCell>{`${event.startTime} - ${event.endTime}`}</TableCell>
                                        <TableCell>{event.location}</TableCell>
                                        <TableCell>{event.departmentName}</TableCell>
                                        <TableCell>
                                            <Chip label={eventStatus.status} color={eventStatus.color} size="small" />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Chỉnh sửa">
                                                <IconButton component={Link} to={`/events/${event._id}`}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Xóa">
                                                <IconButton color="error" onClick={() => handleDelete(event._id)}>
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
            ) : (
                <Grid container spacing={3}>
                    {filteredEvents.map((event) => {
                        const eventStatus = getEventStatus(event.date);

                        return (
                            <Grid item xs={12} md={6} lg={4} key={event._id}>
                                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                            <Box display="flex" alignItems="center">
                                                <EventIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
                                                <Typography variant="h6" component="div">
                                                    {event.title}
                                                </Typography>
                                            </Box>
                                            <Chip label={eventStatus.status} color={eventStatus.color} size="small" />
                                        </Box>

                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {event.description}
                                        </Typography>

                                        <Box display="flex" alignItems="center" mb={1}>
                                            <CalendarIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDate(event.date)}
                                            </Typography>
                                        </Box>

                                        <Box display="flex" alignItems="center" mb={1}>
                                            <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                                                Thời gian: {event.startTime} - {event.endTime}
                                            </Typography>
                                        </Box>

                                        <Box display="flex" alignItems="center" mb={1}>
                                            <LocationIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {event.location || "Không có địa điểm"}
                                            </Typography>
                                        </Box>

                                        <Box mt={2}>
                                            <Chip label={event.type} variant="outlined" size="small" sx={{ mr: 1 }} />
                                            <Chip label={event.departmentName} variant="outlined" size="small" />
                                        </Box>
                                    </CardContent>
                                    <CardActions>
                                        <Button size="small" component={Link} to={`/events/${event._id}`}>
                                            Xem chi tiết
                                        </Button>
                                        <Button size="small" component={Link} to={`/events/${event._id}`}>
                                            Chỉnh sửa
                                        </Button>
                                        <Button size="small" color="error" onClick={() => handleDelete(event._id)}>
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

export default EventList;
