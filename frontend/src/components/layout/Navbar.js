import React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Divider, Button } from "@mui/material";
import {
    Dashboard as DashboardIcon,
    School as SchoolIcon,
    Class as ClassIcon,
    Book as BookIcon,
    Event as EventIcon,
    Settings as SettingsIcon,
    CalendarViewMonth as ScheduleIcon,
} from "@mui/icons-material";

// Define drawer width for consistency
const drawerWidth = 240;

const Navbar = () => {
    const location = useLocation();

    const menuItems = [
        { text: "Trang chủ", icon: <DashboardIcon />, path: "/" },
        { text: "Lịch học", icon: <ScheduleIcon />, path: "/schedule" },
        { text: "Chuyên ngành", icon: <SchoolIcon />, path: "/departments" },
        { text: "Lớp học", icon: <ClassIcon />, path: "/classes" },
        { text: "Môn học", icon: <BookIcon />, path: "/courses" },
        { text: "Sự kiện", icon: <EventIcon />, path: "/events" },
        { text: "Ràng buộc", icon: <SettingsIcon />, path: "/constraints" },
    ];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: drawerWidth,
                    boxSizing: "border-box",
                },
            }}
        >
            <Box sx={{ p: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <img src="/TCDKTTT.png" alt="Logo" style={{ width: 120, height: "auto", marginBottom: 10 }} />
                <Typography variant="h6" component="div" align="center">
                    Phần mềm xếp lịch huấn luyện, đào tạo
                </Typography>
            </Box>

            <Divider />

            <List sx={{ flexGrow: 1 }}>
                {menuItems.map((item) => (
                    <ListItem
                        button="true"
                        key={item.text}
                        component={RouterLink}
                        to={item.path}
                        selected={location.pathname === item.path}
                        sx={{
                            "&.Mui-selected": {
                                backgroundColor: "primary.light",
                                "&:hover": {
                                    backgroundColor: "primary.light",
                                },
                            },
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                color: location.pathname === item.path ? "primary.main" : "inherit",
                            }}
                        >
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.text}
                            slotProps={{
                                primary: {
                                    fontWeight: location.pathname === item.path ? "bold" : "normal",
                                },
                            }}
                        />
                    </ListItem>
                ))}
            </List>

            <Box sx={{ p: 2 }}>
                <Button variant="contained" color="secondary" component={RouterLink} to="/schedule/generate" fullWidth>
                    Tạo lịch học
                </Button>
            </Box>
        </Drawer>
    );
};

export default Navbar;
