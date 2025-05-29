import React, { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
    Button,
    Menu,
    MenuItem,
    IconButton,
    Tooltip,
} from "@mui/material";
import {
    Dashboard as DashboardIcon,
    School as SchoolIcon,
    Class as ClassIcon,
    Book as BookIcon,
    Event as EventIcon,
    Settings as SettingsIcon,
    CalendarViewMonth as ScheduleIcon,
    Help as HelpIcon,
    PlayArrow as PlayArrowIcon,
    Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useIntroTour } from "../../hooks/useIntroTour";

// Define drawer width for consistency
const drawerWidth = 240;

const Navbar = () => {
    const location = useLocation();
    const { startTour, resetTours } = useIntroTour();
    const [helpMenuAnchor, setHelpMenuAnchor] = useState(null);

    const handleHelpMenuOpen = (event) => {
        setHelpMenuAnchor(event.currentTarget);
    };

    const handleHelpMenuClose = () => {
        setHelpMenuAnchor(null);
    };

    const handleStartTour = (tourType) => {
        handleHelpMenuClose();
        startTour(tourType);
    };

    const handleResetTours = () => {
        handleHelpMenuClose();
        resetTours();
        // Start quick tour after reset
        setTimeout(() => startTour("quick"), 500);
    };

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
            data-intro="navigation"
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
                ))}{" "}
            </List>

            <Divider />

            {/* Help Menu */}
            <Box sx={{ p: 2 }}>
                <Tooltip title="Trợ giúp & Hướng dẫn">
                    <IconButton
                        onClick={handleHelpMenuOpen}
                        sx={{
                            mb: 1,
                            width: "100%",
                            justifyContent: "flex-start",
                            gap: 1,
                            color: "text.secondary",
                        }}
                    >
                        <HelpIcon />
                        <Typography variant="body2">Trợ giúp</Typography>
                    </IconButton>
                </Tooltip>

                <Menu
                    anchorEl={helpMenuAnchor}
                    open={Boolean(helpMenuAnchor)}
                    onClose={handleHelpMenuClose}
                    PaperProps={{
                        sx: { minWidth: 200 },
                    }}
                >
                    <MenuItem onClick={() => handleStartTour("quick")}>
                        <PlayArrowIcon sx={{ mr: 1 }} fontSize="small" />
                        Hướng dẫn nhanh
                    </MenuItem>
                    <MenuItem onClick={() => handleStartTour("dashboard")}>
                        <DashboardIcon sx={{ mr: 1 }} fontSize="small" />
                        Hướng dẫn Dashboard
                    </MenuItem>
                    <MenuItem onClick={() => handleStartTour("course")}>
                        <BookIcon sx={{ mr: 1 }} fontSize="small" />
                        Hướng dẫn Môn học
                    </MenuItem>
                    <MenuItem onClick={() => handleStartTour("schedule")}>
                        <ScheduleIcon sx={{ mr: 1 }} fontSize="small" />
                        Hướng dẫn Tạo lịch
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleResetTours}>
                        <RefreshIcon sx={{ mr: 1 }} fontSize="small" />
                        Xem lại từ đầu
                    </MenuItem>
                </Menu>

                <Button variant="contained" color="secondary" component={RouterLink} to="/schedule/generate" fullWidth>
                    Tạo lịch học
                </Button>
            </Box>
        </Drawer>
    );
};

export default Navbar;
