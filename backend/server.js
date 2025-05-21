const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./database");
const serverConfig = require("./server-config");
const constraintProcessor = require("./constraint-processor");
const Department = require("./models/Department");
const Class = require("./models/Class");
const Course = require("./models/Course");
const CourseConstraint = require("./models/CourseConstraint");
const SpecialEvent = require("./models/SpecialEvent");
const Schedule = require("./models/Schedule");

// Kết nối MongoDB với cấu hình mở rộng
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());

// Use expanded limits for JSON and URL-encoded body parsing to handle larger payloads
app.use(express.json(serverConfig.bodyParserLimits.json));
app.use(express.urlencoded(serverConfig.bodyParserLimits.urlencoded));

// Middleware to log request sizes for large payloads
app.use((req, res, next) => {
    if (req.method === "POST" || req.method === "PUT") {
        const contentLength = req.headers["content-length"];
        if (contentLength && parseInt(contentLength) > 1000000) {
            // Log if > 1MB
            console.log(
                `Large request detected: ${req.method} ${req.originalUrl} - ${(
                    parseInt(contentLength) / 1048576
                ).toFixed(2)} MB`
            );
        }
    }
    next();
});

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
        // Hỗ trợ lọc theo nhiều tiêu chí
        const { start_date, end_date, department_id, class_id, course_id, actual_start_date, actual_end_date } =
            req.query;

        let query = {};

        // Lọc theo ngày thực tế (actual_date)
        if (actual_start_date || actual_end_date || start_date || end_date) {
            query.actual_date = {};

            // Ưu tiên dùng actual_date nếu được cung cấp
            if (actual_start_date) {
                query.actual_date.$gte = new Date(actual_start_date);
            } else if (start_date) {
                query.actual_date.$gte = new Date(start_date);
            }

            if (actual_end_date) {
                query.actual_date.$lte = new Date(actual_end_date);
            } else if (end_date) {
                query.actual_date.$lte = new Date(end_date);
            }
        }

        // Lọc theo lớp
        if (class_id) {
            query.class = class_id;
        }

        // Lọc theo khóa học
        if (course_id) {
            query.course = course_id;
        }

        // Nếu có department_id, tìm tất cả các lớp thuộc khoa rồi lọc lịch
        if (department_id) {
            const departmentClasses = await Class.find({ department: department_id }).select("_id");
            const classIds = departmentClasses.map((c) => c._id);
            query.class = { $in: classIds };
        }
        const schedules = await Schedule.find(query)
            .populate("class", "name")
            .populate("course", "code name")
            .populate("special_event", "name type description");

        // Đảm bảo dữ liệu được sắp xếp theo ngày thực tế và sau đó là theo thời gian bắt đầu
        schedules.sort((a, b) => {
            if (a.actual_date && b.actual_date) {
                const dateComparison = a.actual_date.getTime() - b.actual_date.getTime();
                if (dateComparison !== 0) return dateComparison;
            }

            // Nếu cùng ngày, sắp xếp theo giờ bắt đầu
            const timeA = a.start_time.split(":").map(Number);
            const timeB = b.start_time.split(":").map(Number);

            if (timeA[0] !== timeB[0]) return timeA[0] - timeB[0];
            return timeA[1] - timeB[1];
        });

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
                is_flag_ceremony: schedule.is_flag_ceremony || false,
                is_holiday: schedule.is_holiday || false,
                is_canceled: schedule.is_canceled || false,
                special_event_id: schedule.special_event?._id,
                special_event_name: schedule.special_event?.name,
                special_event_type: schedule.special_event?.type,
                special_event_description: schedule.special_event?.description,
                actual_date: schedule.actual_date,
                date_str: schedule.actual_date ? schedule.actual_date.toISOString().split("T")[0] : null,
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
            earliest_start_time,
            latest_start_time,
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
            earliest_start_time,
            latest_start_time,
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
            earliest_start_time,
            latest_start_time,
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
                earliest_start_time,
                latest_start_time,
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

// API cho generate schedule with support for large payloads and batch processing
app.post("/api/schedule/generate", async (req, res) => {
    try {
        console.log("Schedule generation request received");
        const {
            department_id,
            start_date,
            end_date,
            total_weeks,
            events,
            courses,
            constraints,
            schedule_details,
            is_batch_process,
            batch_id,
            total_batches,
        } = req.body;

        const contentLength = req.headers["content-length"];
        const payloadSizeMB = contentLength ? (parseInt(contentLength) / (1024 * 1024)).toFixed(2) : "unknown";

        console.log(
            `Request params: department_id=${department_id}, start_date=${start_date}, end_date=${end_date}, total_weeks=${total_weeks}, payload=${payloadSizeMB}MB`
        );
        console.log(`Received ${schedule_details?.length || 0} schedule details`);

        // Check if this is part of a batch process
        if (is_batch_process) {
            console.log(`Processing batch ${batch_id} of ${total_batches}`);
        }

        // Only delete existing schedules if this is the first batch or not a batch process
        if (!is_batch_process || (is_batch_process && batch_id === 1)) {
            // Delete existing schedules for this department if any
            console.log(`Removing existing schedules for department: ${department_id}`);
            try {
                // Find classes for this department
                const departmentClasses = await Class.find({ department: department_id }).select("_id");
                const classIds = departmentClasses.map((c) => c._id);

                // Delete schedules for these classes
                if (classIds.length > 0) {
                    await Schedule.deleteMany({ class: { $in: classIds } });
                    console.log(`Deleted existing schedules for department ${department_id}`);
                }
            } catch (error) {
                console.error("Error clearing existing schedules:", error);
                // Continue with new schedule creation even if clearing fails
            }
        } // Declare variables outside the if block so they're accessible in the response
        const bulkOps = [];
        const errors = [];
        let successCount = 0; // Process schedule details if provided
        if (schedule_details && Array.isArray(schedule_details)) {
            console.log(`Processing ${schedule_details.length} schedule items to save`);
            try {
                // Lấy danh sách các môn học thực hành
                const practicalCourses = [];
                if (courses && Array.isArray(courses)) {
                    for (const course of courses) {
                        if (course.is_practical || course.type === "practical") {
                            practicalCourses.push(course._id || course.id);
                        }
                    }
                }

                console.log(`Found ${practicalCourses.length} practical courses`); // Áp dụng tất cả các ràng buộc (sự kiện đặc biệt, thời gian, v.v.)
                const processedDetails = await constraintProcessor.applyAllConstraints(schedule_details, {
                    events,
                    constraints,
                    departmentId: department_id,
                    startDate: start_date,
                    practicalCourses,
                    courseExams: courses, // Pass course configs for exam scheduling
                });

                console.log(
                    `After applying constraints: ${processedDetails.length} items remain (processed ${schedule_details.length} items)`
                );

                // Sử dụng danh sách đã xử lý ràng buộc thay vì danh sách gốc
                schedule_details = processedDetails;
            } catch (error) {
                console.error("Error applying schedule constraints:", error);
                // Tiếp tục xử lý với danh sách gốc nếu có lỗi
                console.log("Continuing with original schedule details");
            }

            // Prepare bulk operations
            for (const detail of schedule_details) {
                try {
                    // Make sure we have valid MongoDB ObjectIds
                    const classId = mongoose.Types.ObjectId.isValid(detail.class_id) ? detail.class_id : null;
                    const courseId = mongoose.Types.ObjectId.isValid(detail.course_id) ? detail.course_id : null;

                    if (!classId || !courseId) {
                        console.error("Invalid ObjectId found:", {
                            class_id: detail.class_id,
                            course_id: detail.course_id,
                            valid_class: mongoose.Types.ObjectId.isValid(detail.class_id),
                            valid_course: mongoose.Types.ObjectId.isValid(detail.course_id),
                        });
                        continue; // Skip this invalid entry
                    } // Tính toán ngày thực tế
                    const actualDate = constraintProcessor.calculateActualDate(
                        detail.week_number,
                        detail.day_of_week,
                        start_date
                    );

                    // Kiểm tra xem ngày này có phải là sự kiện đặc biệt không
                    const specialEvent = await constraintProcessor.getSpecialEventOnDate(actualDate, department_id);

                    // Create document to insert
                    const scheduleDoc = {
                        class: classId,
                        course: courseId,
                        day_of_week: detail.day_of_week,
                        week_number: detail.week_number,
                        start_time: detail.start_time,
                        end_time: detail.end_time,
                        is_practical: detail.is_practical || false,
                        is_exam: detail.is_exam || false,
                        is_self_study: detail.is_self_study || false,
                        special_event: specialEvent ? specialEvent._id : null,
                        notes: detail.notes || (specialEvent ? `Affected by: ${specialEvent.name}` : null),
                        actual_date: actualDate,
                    };

                    bulkOps.push({
                        insertOne: {
                            document: scheduleDoc,
                        },
                    });
                } catch (error) {
                    console.error("Error preparing schedule item:", error);
                    errors.push({
                        detail,
                        error: error.message,
                    });
                }
            } // Process in smaller chunks to avoid memory issues
            const CHUNK_SIZE = 1000;

            for (let i = 0; i < bulkOps.length; i += CHUNK_SIZE) {
                const chunk = bulkOps.slice(i, i + CHUNK_SIZE);
                if (chunk.length === 0) continue;

                try {
                    console.log(`Processing chunk ${Math.floor(i / CHUNK_SIZE) + 1} with ${chunk.length} operations`);
                    const result = await Schedule.bulkWrite(chunk, { ordered: false });
                    successCount += result.insertedCount;
                } catch (error) {
                    console.error(`Error in bulk write operation for chunk ${Math.floor(i / CHUNK_SIZE) + 1}:`, error);
                    // Continue with next chunk even if this one fails
                }
            }

            console.log(`Successfully saved ${successCount} schedule items`);
            if (errors.length > 0) {
                console.error(`Failed to save ${errors.length} schedule items`);
            }

            // If this is a batch process, include batch info in response
            if (is_batch_process) {
                return res.status(200).json({
                    success: true,
                    message: `Batch ${batch_id}/${total_batches} processed successfully`,
                    batch_id: batch_id,
                    items_saved: successCount,
                    errors: errors.length,
                });
            }
        }
        res.status(200).json({
            success: true,
            message: "Schedule generated successfully",
            items_saved: successCount,
            total_operations: bulkOps.length,
            errors: errors.length,
        });
    } catch (error) {
        console.error("Error generating schedule:", error);
        res.status(500).json({
            error: "Failed to generate schedule",
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server đang chạy trên port ${PORT}`);
});
