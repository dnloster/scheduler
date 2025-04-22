import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Grid, Paper, Typography, Button, Box, Card, CardContent, CardActions } from "@mui/material";
import {
    School as SchoolIcon,
    Class as ClassIcon,
    Book as BookIcon,
    Event as EventIcon,
    CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import axios from "axios";

const Dashboard = () => {
    const [stats, setStats] = useState({
        departments: 0,
        classes: 0,
        courses: 0,
        schedules: 0,
        events: 0,
    });

    useEffect(() => {
        // In a real app, you would fetch this data from the API
        // For now, we'll just show some sample stats
        setStats({
            departments: 1,
            classes: 6,
            courses: 14,
            schedules: 0,
            events: 6,
        });
    }, []);

    const statCards = [
        {
            id: 1,
            title: "Chuyên ngành",
            value: stats.departments,
            icon: <SchoolIcon fontSize="large" color="primary" />,
            link: "/departments",
        },
        {
            id: 2,
            title: "Lớp học",
            value: stats.classes,
            icon: <ClassIcon fontSize="large" color="primary" />,
            link: "/classes",
        },
        {
            id: 3,
            title: "Môn học",
            value: stats.courses,
            icon: <BookIcon fontSize="large" color="primary" />,
            link: "/courses",
        },
        {
            id: 4,
            title: "Lịch học",
            value: stats.schedules,
            icon: <CalendarIcon fontSize="large" color="primary" />,
            link: "/schedule",
        },
        {
            id: 5,
            title: "Sự kiện",
            value: stats.events,
            icon: <EventIcon fontSize="large" color="primary" />,
            link: "/events",
        },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom component="div">
                Bảng điều khiển
            </Typography>

            <Grid container spacing={3}>
                {statCards.map((card) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.id}>
                        <Card>
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    {card.icon}
                                    <Typography variant="h6" component="div" sx={{ ml: 1 }}>
                                        {card.title}
                                    </Typography>
                                </Box>
                                <Typography variant="h3" component="div" align="center" sx={{ my: 2 }}>
                                    {card.value}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button size="small" color="primary" component={Link} to={card.link} fullWidth>
                                    Xem chi tiết
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Box mt={4}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        Tạo lịch học mới
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        component={Link}
                        to="/schedule/generate"
                        startIcon={<CalendarIcon />}
                    >
                        Tạo lịch học
                    </Button>
                </Paper>
            </Box>

            <Box mt={4}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        Hướng dẫn sử dụng
                    </Typography>
                    <Typography variant="body1" paragraph>
                        1. Tạo và cấu hình chuyên ngành cần xếp lịch
                    </Typography>
                    <Typography variant="body1" paragraph>
                        2. Thêm lớp học thuộc chuyên ngành đó
                    </Typography>
                    <Typography variant="body1" paragraph>
                        3. Thêm các môn học và cài đặt ràng buộc cho từng môn
                    </Typography>
                    <Typography variant="body1" paragraph>
                        4. Thêm các sự kiện đặc biệt (chào cờ, nghỉ lễ, bảo quản, v.v.)
                    </Typography>
                    <Typography variant="body1" paragraph>
                        5. Sử dụng chức năng "Tạo lịch học" để tạo lịch tự động
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
};

export default Dashboard;
