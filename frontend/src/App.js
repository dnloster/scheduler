import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/vi";

// Import IntroJS styles
import "intro.js/introjs.css";

// Import intro service
import { useIntroTour } from "./hooks/useIntroTour";

// Components
import Navbar from "./components/layout/Navbar";
import Dashboard from "./components/dashboard/Dashboard";
import DepartmentList from "./components/departments/DepartmentList";
import DepartmentDetail from "./components/departments/DepartmentDetail";
import CourseList from "./components/courses/CourseList";
import CourseForm from "./components/courses/CourseForm";
import ClassList from "./components/classes/ClassList";
import ClassForm from "./components/classes/ClassForm";
import Schedule from "./components/schedule/Schedule";
import ScheduleGenerator from "./components/schedule/ScheduleGenerator";
import EventList from "./components/events/EventList";
import EventForm from "./components/events/EventForm";
import ConstraintsList from "./components/constraints/ConstraintsList";
import ConstraintsForm from "./components/constraints/ConstraintsForm";
import DepartmentForm from "./components/departments/DepartmentForm";

// Create theme
const theme = createTheme({
    palette: {
        primary: {
            main: "#1976d2",
        },
        secondary: {
            main: "#dc004e",
        },
        background: {
            default: "#f5f5f5",
        },
    },
    typography: {
        fontFamily: ["Roboto", "Arial", "sans-serif"].join(","),
    },
});

// Define drawer width for consistency
const drawerWidth = 240;

function App() {
    const { isTourCompleted, startTour } = useIntroTour();

    // Auto-start intro tour for first-time users
    useEffect(() => {
        // Check if this is the first visit and no tours have been completed
        if (!isTourCompleted("dashboard") && !isTourCompleted("quick")) {
            // Small delay to ensure components are loaded
            const timer = setTimeout(() => {
                startTour("quick");
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [isTourCompleted, startTour]);
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                <Router>
                    <Box sx={{ display: "flex" }}>
                        <Navbar />
                        <Box
                            component="main"
                            sx={{
                                flexGrow: 1,
                                p: 3,
                                width: { sm: `calc(100% - ${drawerWidth}px)` },
                            }}
                        >
                            <Routes>
                                <Route path="/" element={<Dashboard />} />

                                {/* Department Routes */}
                                <Route path="/departments" element={<DepartmentList />} />
                                <Route path="/departments/new" element={<DepartmentForm />} />
                                <Route path="/departments/edit/:_id" element={<DepartmentForm />} />
                                <Route path="/departments/:_id" element={<DepartmentDetail />} />

                                {/* Course Routes */}
                                <Route path="/courses" element={<CourseList />} />
                                <Route path="/courses/new" element={<CourseForm />} />
                                <Route path="/courses/:id" element={<CourseForm />} />

                                {/* Class Routes */}
                                <Route path="/classes" element={<ClassList />} />
                                <Route path="/classes/new" element={<ClassForm />} />
                                <Route path="/classes/:id" element={<ClassForm />} />

                                {/* Schedule Routes */}
                                <Route path="/schedule" element={<Schedule />} />
                                <Route path="/schedule/generate" element={<ScheduleGenerator />} />

                                {/* Event Routes */}
                                <Route path="/events" element={<EventList />} />
                                <Route path="/events/new" element={<EventForm />} />
                                <Route path="/events/:id" element={<EventForm />} />

                                {/* Constraint Routes */}
                                <Route path="/constraints" element={<ConstraintsList />} />
                                <Route path="/constraints/new" element={<ConstraintsForm />} />
                                <Route path="/constraints/:id" element={<ConstraintsForm />} />
                            </Routes>
                        </Box>
                    </Box>
                </Router>
            </LocalizationProvider>
        </ThemeProvider>
    );
}

export default App;

