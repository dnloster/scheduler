const express = require("express");
const cors = require("cors");
const connectDB = require("./database");
const Department = require("./models/Department");
const Class = require("./models/Class");
const Course = require("./models/Course");
const CourseConstraint = require("./models/CourseConstraint");
const SpecialEvent = require("./models/SpecialEvent");
const Schedule = require("./models/Schedule");

// Kết nối MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Route mặc định
app.get("/", (req, res) => {
    res.send("API đang chạy");
});

// API cho Department
app.get("/api/departments", async (req, res) => {
    try {
        const departments = await Department.find();
        res.json(departments);
    } catch (error) {
        console.error("Error fetching departments:", error);
        res.status(500).json({ error: "Failed to fetch departments" });
    }
});

app.get("/api/departments/:_id", async (req, res) => {
    try {
        const department = await Department.findById(req.params._id);

        if (!department) {
            return res.status(404).json({ error: "Department not found" });
        }

        res.json(department);
    } catch (error) {
        console.error(`Error fetching department with ID ${req.params.id}:`, error);
        res.status(500).json({ error: "Failed to fetch department" });
    }
});

app.post("/api/departments", async (req, res) => {
    try {
        const { name, description, director, contactInfo, startDate, endDate } = req.body;

        const department = new Department({
            name,
            description,
            director,
            contactInfo,
            startDate,
            endDate,
        });

        const savedDepartment = await department.save();
        res.status(201).json(savedDepartment);
    } catch (error) {
        console.error("Error creating department:", error);
        res.status(500).json({ error: "Failed to create department" });
    }
});

app.put("/api/departments/:_id", async (req, res) => {
    try {
        const { name, description, director, contactInfo, startDate, endDate } = req.body;

        const department = await Department.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                director,
                contactInfo,
                startDate,
                endDate,
            },
            { new: true }
        );

        if (!department) {
            return res.status(404).json({ error: "Department not found" });
        }

        res.json(department);
    } catch (error) {
        console.error(`Error updating department with ID ${req.params.id}:`, error);
        res.status(500).json({ error: "Failed to update department" });
    }
});

app.delete("/api/departments/:id", async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);

        if (!department) {
            return res.status(404).json({ error: "Department not found" });
        }

        res.json({ message: "Department deleted successfully" });
    } catch (error) {
        console.error(`Error deleting department with ID ${req.params.id}:`, error);
        res.status(500).json({ error: "Failed to delete department" });
    }
});

// API cho Course
app.get("/api/courses", async (req, res) => {
    try {
        const courses = await Course.find().populate("department", "name");
        res.json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ error: "Failed to fetch courses" });
    }
});

// Đặt route chi tiết trước route tổng quát để tránh xung đột
app.get("/api/courses/department/:departmentId", async (req, res) => {
    try {
        const courses = await Course.find({ department: req.params.departmentId }).populate("department", "name");
        res.json(courses);
    } catch (error) {
        console.error(`Error fetching courses for department ID ${req.params.departmentId}:`, error);
        res.status(500).json({ error: "Failed to fetch courses for this department" });
    }
});

app.get("/api/courses/:id", async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate("department", "name")
            .populate("parent_course", "name code");

        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        res.json(course);
    } catch (error) {
        console.error(`Error fetching course with ID ${req.params.id}:`, error);
        res.status(500).json({ error: "Failed to fetch course" });
    }
});

app.post("/api/courses", async (req, res) => {
    try {
        const { code, name, parent_course, total_hours, theory_hours, practical_hours, department, description } =
            req.body;

        const course = new Course({
            code,
            name,
            parent_course,
            total_hours,
            theory_hours,
            practical_hours,
            department,
            description,
        });

        const savedCourse = await course.save();
        res.status(201).json(savedCourse);
    } catch (error) {
        console.error("Error creating course:", error);
        res.status(500).json({ error: "Failed to create course" });
    }
});

app.put("/api/courses/:id", async (req, res) => {
    try {
        const { code, name, parent_course, total_hours, theory_hours, practical_hours, department, description } =
            req.body;

        const course = await Course.findByIdAndUpdate(
            req.params.id,
            {
                code,
                name,
                parent_course,
                total_hours,
                theory_hours,
                practical_hours,
                department,
                description,
            },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        res.json(course);
    } catch (error) {
        console.error(`Error updating course with ID ${req.params.id}:`, error);
        res.status(500).json({ error: "Failed to update course" });
    }
});

app.delete("/api/courses/:id", async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);

        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        res.json({ message: "Course deleted successfully" });
    } catch (error) {
        console.error(`Error deleting course with ID ${req.params.id}:`, error);
        res.status(500).json({ error: "Failed to delete course" });
    }
});

// API cho Class
app.get("/api/classes", async (req, res) => {
    try {
        const classes = await Class.find().populate("department", "name");
        res.json(classes);
    } catch (error) {
        console.error("Error fetching classes:", error);
        res.status(500).json({ error: "Failed to fetch classes" });
    }
});

app.get("/api/classes/department/:departmentId", async (req, res) => {
    try {
        const classes = await Class.find({ department: req.params.departmentId }).populate("department", "name");
        res.json(classes);
    } catch (error) {
        console.error(`Error fetching classes for department ID ${req.params.departmentId}:`, error);
        res.status(500).json({ error: "Failed to fetch classes for this department" });
    }
});

app.post("/api/classes", async (req, res) => {
    try {
        const { name, studentCount, department } = req.body;

        const newClass = new Class({
            name,
            studentCount,
            department,
        });

        const savedClass = await newClass.save();
        res.status(201).json(savedClass);
    } catch (error) {
        console.error("Error creating class:", error);
        res.status(500).json({ error: "Failed to create class" });
    }
});

app.put("/api/classes/:id", async (req, res) => {
    try {
        const { name, studentCount, department } = req.body;

        const updatedClass = await Class.findByIdAndUpdate(
            req.params.id,
            {
                name,
                studentCount,
                department,
            },
            { new: true }
        );

        if (!updatedClass) {
            return res.status(404).json({ error: "Class not found" });
        }

        res.json(updatedClass);
    } catch (error) {
        console.error(`Error updating class with ID ${req.params.id}:`, error);
        res.status(500).json({ error: "Failed to update class" });
    }
});

app.delete("/api/classes/:id", async (req, res) => {
    try {
        const deletedClass = await Class.findByIdAndDelete(req.params.id);

        if (!deletedClass) {
            return res.status(404).json({ error: "Class not found" });
        }

        res.json({ message: "Class deleted successfully" });
    } catch (error) {
        console.error(`Error deleting class with ID ${req.params.id}:`, error);
        res.status(500).json({ error: "Failed to delete class" });
    }
});

// API cho Schedule
app.get("/api/schedules", async (req, res) => {
    try {
        const schedules = await Schedule.find()
            .populate("class", "name")
            .populate("course", "code name")
            .populate("special_event", "name");

        res.json(
            schedules.map((schedule) => ({
                id: schedule._id,
                class_id: schedule.class?._id,
                class_name: schedule.class?.name,
                course_id: schedule.course?._id,
                course_code: schedule.course?.code,
                course_name: schedule.course?.name,
                day_of_week: schedule.day_of_week,
                week_number: schedule.week_number,
                start_time: schedule.start_time,
                end_time: schedule.end_time,
                is_practical: schedule.is_practical,
                is_exam: schedule.is_exam,
                is_self_study: schedule.is_self_study,
                special_event_id: schedule.special_event?._id,
                notes: schedule.notes,
            }))
        );
    } catch (error) {
        console.error("Error fetching schedules:", error);
        res.status(500).json({ error: "Failed to fetch schedules" });
    }
});

app.post("/api/schedules", async (req, res) => {
    try {
        const {
            class_id,
            course_id,
            day_of_week,
            start_time,
            end_time,
            week_number,
            is_practical,
            is_exam,
            is_self_study,
            special_event_id,
            notes,
        } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!day_of_week || !start_time || !end_time) {
            return res.status(400).json({
                error: "Missing required fields",
                required: "day_of_week, start_time, end_time",
            });
        }

        // Tạo schedule mới
        const newSchedule = new Schedule({
            class: class_id,
            course: course_id,
            day_of_week,
            week_number,
            start_time,
            end_time,
            is_practical: is_practical || false,
            is_exam: is_exam || false,
            is_self_study: is_self_study || false,
            special_event: special_event_id,
            notes,
        });

        const savedSchedule = await newSchedule.save();

        // Format lại kết quả để trả về đúng cấu trúc
        const populatedSchedule = await Schedule.findById(savedSchedule._id)
            .populate("class", "name")
            .populate("course", "code name")
            .populate("special_event", "name");

        res.status(201).json({
            id: populatedSchedule._id,
            class_id: populatedSchedule.class?._id,
            class_name: populatedSchedule.class?.name,
            course_id: populatedSchedule.course?._id,
            course_code: populatedSchedule.course?.code,
            course_name: populatedSchedule.course?.name,
            day_of_week: populatedSchedule.day_of_week,
            week_number: populatedSchedule.week_number,
            start_time: populatedSchedule.start_time,
            end_time: populatedSchedule.end_time,
            is_practical: populatedSchedule.is_practical,
            is_exam: populatedSchedule.is_exam,
            is_self_study: populatedSchedule.is_self_study,
            special_event_id: populatedSchedule.special_event?._id,
            notes: populatedSchedule.notes,
        });
    } catch (error) {
        console.error("Error creating schedule:", error);
        res.status(500).json({ error: "Failed to create schedule" });
    }
});

// API cho CourseConstraint
app.get("/api/constraints", async (req, res) => {
    try {
        const constraints = await CourseConstraint.find().populate("course", "code name");
        res.json(constraints);
    } catch (error) {
        console.error("Error fetching constraints:", error);
        res.status(500).json({ error: "Failed to fetch constraints" });
    }
});

// Đặt route chi tiết trước route tổng quát để tránh xung đột
app.get("/api/constraints/course/:courseId", async (req, res) => {
    try {
        const constraint = await CourseConstraint.findOne({ course: req.params.courseId }).populate(
            "course",
            "code name"
        );

        if (!constraint) {
            return res.status(404).json({ error: "Constraint not found for this course" });
        }

        res.json(constraint);
    } catch (error) {
        console.error(`Error fetching constraint for course ID ${req.params.courseId}:`, error);
        res.status(500).json({ error: "Failed to fetch constraint" });
    }
});

app.get("/api/constraints/:id", async (req, res) => {
    try {
        const constraint = await CourseConstraint.findById(req.params.id).populate("course", "code name");

        if (!constraint) {
            return res.status(404).json({ error: "Constraint not found" });
        }

        res.json(constraint);
    } catch (error) {
        console.error(`Error fetching constraint with ID ${req.params.id}:`, error);
        res.status(500).json({ error: "Failed to fetch constraint" });
    }
});

app.post("/api/constraints", async (req, res) => {
    try {
        const {
            course,
            max_hours_per_week,
            max_hours_per_day,
            can_be_morning,
            can_be_afternoon,
            requires_consecutive_hours,
            min_days_before_exam,
            exam_duration_hours,
            grouped_classes,
            notes,
        } = req.body;

        const constraint = new CourseConstraint({
            course,
            max_hours_per_week,
            max_hours_per_day,
            can_be_morning,
            can_be_afternoon,
            requires_consecutive_hours,
            min_days_before_exam,
            exam_duration_hours,
            grouped_classes,
            notes,
        });

        const savedConstraint = await constraint.save();
        res.status(201).json(savedConstraint);
    } catch (error) {
        console.error("Error creating constraint:", error);
        res.status(500).json({ error: "Failed to create constraint" });
    }
});

app.put("/api/constraints/:id", async (req, res) => {
    try {
        const {
            course,
            max_hours_per_week,
            max_hours_per_day,
            can_be_morning,
            can_be_afternoon,
            requires_consecutive_hours,
            min_days_before_exam,
            exam_duration_hours,
            grouped_classes,
            notes,
        } = req.body;

        const constraint = await CourseConstraint.findByIdAndUpdate(
            req.params.id,
            {
                course,
                max_hours_per_week,
                max_hours_per_day,
                can_be_morning,
                can_be_afternoon,
                requires_consecutive_hours,
                min_days_before_exam,
                exam_duration_hours,
                grouped_classes,
                notes,
            },
            { new: true }
        );

        if (!constraint) {
            return res.status(404).json({ error: "Constraint not found" });
        }

        res.json(constraint);
    } catch (error) {
        console.error(`Error updating constraint with ID ${req.params.id}:`, error);
        res.status(500).json({ error: "Failed to update constraint" });
    }
});

// API cho SpecialEvent
app.get("/api/events", async (req, res) => {
    try {
        const events = await SpecialEvent.find();
        res.json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: "Failed to fetch events" });
    }
});

// API cho SpecialEvent theo ID
app.get("/api/events/:id", async (req, res) => {
    try {
        const event = await SpecialEvent.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        res.json(event);
    } catch (error) {
        console.error(`Error fetching event with ID ${req.params.id}:`, error);
        res.status(500).json({ error: "Failed to fetch event" });
    }
});

// API cho SpecialEvent theo department ID
app.get("/api/events/department/:departmentId", async (req, res) => {
    try {
        const events = await SpecialEvent.find({ department: req.params.departmentId }).populate("department", "name");
        console.log(events);
        res.json(events);
    } catch (error) {
        console.error(`Error fetching events for department ID ${req.params.departmentId}:`, error);
        res.status(500).json({ error: "Failed to fetch events for this department" });
    }
});

app.post("/api/events", async (req, res) => {
    try {
        const { name, description, date, duration_days, recurring, recurring_pattern } = req.body;

        const event = new SpecialEvent({
            name,
            description,
            date,
            duration_days,
            recurring,
            recurring_pattern,
        });

        const savedEvent = await event.save();
        res.status(201).json(savedEvent);
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ error: "Failed to create event" });
    }
});

// API cho generate schedule
app.post("/api/schedule/generate", async (req, res) => {
    try {
        const { department_id, start_date, end_date, total_weeks, events, courses, constraints, schedule_details } =
            req.body;

        // Đây là nơi để gọi hàm xử lý tạo lịch từ scheduler.js
        // Hiện tại chỉ trả về success message

        // Thêm các mục lịch học từ schedule_details
        if (schedule_details && Array.isArray(schedule_details)) {
            const schedulePromises = schedule_details.map((detail) => {
                const newSchedule = new Schedule({
                    class: detail.class_id,
                    course: detail.course_id,
                    day_of_week: detail.day_of_week,
                    week_number: detail.week_number,
                    start_time: detail.start_time,
                    end_time: detail.end_time,
                    is_practical: detail.is_practical,
                    is_exam: detail.is_exam || false,
                    is_self_study: detail.is_self_study || false,
                    special_event: detail.special_event_id,
                    notes: detail.notes,
                });
                return newSchedule.save();
            });

            await Promise.all(schedulePromises);
        }

        res.status(200).json({ success: true, message: "Schedule generated successfully" });
    } catch (error) {
        console.error("Error generating schedule:", error);
        res.status(500).json({ error: "Failed to generate schedule" });
    }
});

app.listen(PORT, () => {
    console.log(`Server đang chạy trên port ${PORT}`);
});
