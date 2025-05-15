/**
 * Script to create exam schedules for V30/V31 courses
 * This script creates sample class schedules and then creates exam schedules with 5 phases
 */
const mongoose = require("mongoose");
const connectDB = require("./database");
const Schedule = require("./models/Schedule");
const Course = require("./models/Course");
const CourseConstraint = require("./models/CourseConstraint");
const Class = require("./models/Class");
const constraintProcessor = require("./constraint-processor");

// Connect to database
connectDB();

async function createExamSchedules() {
    try {
        console.log("Starting exam schedule creation...");
        console.log("MongoDB connection status:", mongoose.connection.readyState);
        console.log("🔍 Tìm khóa học V30/V31...");

        // Find V30 and V31 courses
        const v30Course = await Course.findOne({ code: "V30" });
        const v31Course = await Course.findOne({ code: "V31" });

        if (!v30Course || !v31Course) {
            console.error("❌ Không tìm thấy khóa học V30 hoặc V31");
            return;
        }

        console.log(`✅ Đã tìm thấy: V30 (${v30Course._id}) và V31 (${v31Course._id})`);

        // Find course constraints
        const v30Constraint = await CourseConstraint.findOne({ course: v30Course._id });
        const v31Constraint = await CourseConstraint.findOne({ course: v31Course._id });

        console.log("📋 Cấu hình thi:");
        console.log(
            `   V30: ${
                v30Constraint
                    ? `${v30Constraint.min_days_before_exam} ngày trước, ${v30Constraint.exam_duration_hours} giờ, ${
                          v30Constraint.exam_phases || 1
                      } giai đoạn`
                    : "❌ Không có"
            }`
        );
        console.log(
            `   V31: ${
                v31Constraint
                    ? `${v31Constraint.min_days_before_exam} ngày trước, ${v31Constraint.exam_duration_hours} giờ, ${
                          v31Constraint.exam_phases || 1
                      } giai đoạn`
                    : "❌ Không có"
            }`
        );

        // Create or update constraints if needed
        if (!v30Constraint || v30Constraint.exam_phases !== 5) {
            console.log("⚙️ Cập nhật cấu hình thi V30...");
            await CourseConstraint.findOneAndUpdate(
                { course: v30Course._id },
                {
                    course: v30Course._id,
                    min_days_before_exam: 3,
                    exam_duration_hours: 4,
                    exam_phases: 5,
                },
                { upsert: true, new: true }
            );
        }

        if (!v31Constraint || v31Constraint.exam_phases !== 5) {
            console.log("⚙️ Cập nhật cấu hình thi V31...");
            await CourseConstraint.findOneAndUpdate(
                { course: v31Course._id },
                {
                    course: v31Course._id,
                    min_days_before_exam: 3,
                    exam_duration_hours: 4,
                    exam_phases: 5,
                },
                { upsert: true, new: true }
            );
        }
        // Get or create classes for V30/V31
        console.log("👥 Tìm lớp học...");
        const v30Classes = await Class.find({ course: v30Course._id });
        const v31Classes = await Class.find({ course: v31Course._id });

        // Get department for classes
        console.log("🏫 Tìm department cho lớp học...");
        const departmentId = v30Course.department || v31Course.department;

        if (!departmentId) {
            console.error("❌ Không tìm thấy department cho khóa học");

            // Use the first existing class instead
            const anyClass = await Class.findOne({});
            if (anyClass) {
                console.log("✅ Sử dụng lớp có sẵn:", anyClass.name);

                // Find all classes
                const existingClasses = await Class.find({}).limit(2);
                v30ClassIds = [existingClasses[0]._id];
                v31ClassIds = [existingClasses[0]._id]; // Use same class if only one exists

                if (existingClasses.length > 1) {
                    v31ClassIds = [existingClasses[1]._id];
                }
            } else {
                console.error("❌ Không tìm thấy lớp học nào trong hệ thống");
                return;
            }
        } else {
            console.log("✅ Đã tìm thấy department:", departmentId);
            if (v30Classes.length === 0) {
                console.log("   Tạo lớp học mẫu cho V30...");
                const newClass = new Class({
                    name: "V30-Sample",
                    code: "V30-S1",
                    course: v30Course._id,
                    department: departmentId,
                    year: 2025,
                    students: 30,
                });
                const savedClass = await newClass.save();
                v30ClassIds = [savedClass._id];
            } else {
                v30ClassIds = v30Classes.map((c) => c._id);
                console.log(`   Tìm thấy ${v30Classes.length} lớp học cho V30`);
            }

            if (v31Classes.length === 0) {
                console.log("   Tạo lớp học mẫu cho V31...");
                const newClass = new Class({
                    name: "V31-Sample",
                    code: "V31-S1",
                    course: v31Course._id,
                    department: departmentId,
                    year: 2025,
                    students: 30,
                });
                const savedClass = await newClass.save();
                v31ClassIds = [savedClass._id];
            } else {
                v31ClassIds = v31Classes.map((c) => c._id);
                console.log(`   Tìm thấy ${v31Classes.length} lớp học cho V31`);
            }
        }

        // Delete existing exam schedules
        console.log("🗑️ Xóa lịch thi cũ...");
        const v30DeleteResult = await Schedule.deleteMany({
            course: v30Course._id,
            is_exam: true,
        });

        const v31DeleteResult = await Schedule.deleteMany({
            course: v31Course._id,
            is_exam: true,
        });

        console.log(`   Đã xóa ${v30DeleteResult.deletedCount} lịch thi V30`);
        console.log(`   Đã xóa ${v31DeleteResult.deletedCount} lịch thi V31`);

        // Create base schedules for courses
        console.log("📚 Tạo lịch học cơ bản...");
        const baseSchedules = [];

        // Create schedules for V30
        for (const classId of v30ClassIds) {
            for (let week = 14; week <= 16; week++) {
                for (let day = 1; day <= 2; day++) {
                    baseSchedules.push({
                        _id: new mongoose.Types.ObjectId(),
                        course_id: v30Course._id.toString(),
                        class_id: classId.toString(),
                        day_of_week: day,
                        week_number: week,
                        start_time: "07:30:00",
                        end_time: "09:30:00",
                        is_exam: false,
                        notes: "Giờ học V30",
                    });
                }
            }
        }

        // Create schedules for V31
        for (const classId of v31ClassIds) {
            for (let week = 14; week <= 16; week++) {
                for (let day = 3; day <= 4; day++) {
                    baseSchedules.push({
                        _id: new mongoose.Types.ObjectId(),
                        course_id: v31Course._id.toString(),
                        class_id: classId.toString(),
                        day_of_week: day,
                        week_number: week,
                        start_time: "09:30:00",
                        end_time: "11:30:00",
                        is_exam: false,
                        notes: "Giờ học V31",
                    });
                }
            }
        }

        console.log(`   Đã tạo ${baseSchedules.length} lịch học cơ bản`);

        // Create exam configuration
        const examConfigs = [
            {
                id: v30Course._id.toString(),
                minDaysBeforeExam: 3,
                examDuration: 4,
                examPhases: 5,
            },
            {
                id: v31Course._id.toString(),
                minDaysBeforeExam: 3,
                examDuration: 4,
                examPhases: 5,
            },
        ];

        // Generate exam schedules
        console.log("📝 Tạo lịch thi...");
        const examSchedules = await constraintProcessor.applyExamConstraints(baseSchedules, examConfigs);

        // Filter only exam schedules
        const exams = examSchedules.filter((schedule) => schedule.is_exam);

        console.log(`   Đã tạo ${exams.length} lịch thi`);

        // Save exam schedules to database
        console.log("💾 Lưu lịch thi vào cơ sở dữ liệu...");
        let savedCount = 0;
        let v30Count = 0;
        let v31Count = 0;

        for (const exam of exams) {
            try {
                const newExam = new Schedule({
                    course: exam.course_id,
                    class: exam.class_id,
                    day_of_week: exam.day_of_week,
                    week_number: exam.week_number,
                    start_time: exam.start_time,
                    end_time: exam.end_time,
                    is_exam: true,
                    notes: exam.notes,
                    exam_phase: exam.exam_phase,
                    total_phases: exam.total_phases,
                    actual_date: constraintProcessor.calculateActualDate(
                        exam.week_number,
                        exam.day_of_week,
                        "2025-06-09"
                    ),
                });

                await newExam.save();
                savedCount++;

                if (exam.course_id === v30Course._id.toString()) {
                    v30Count++;
                } else if (exam.course_id === v31Course._id.toString()) {
                    v31Count++;
                }
            } catch (error) {
                console.error(`❌ Lỗi khi lưu lịch thi: ${error.message}`);
            }
        }

        console.log(`✅ Đã lưu ${savedCount} lịch thi (V30: ${v30Count}, V31: ${v31Count})`);

        // Check results
        const finalV30Exams = await Schedule.find({
            course: v30Course._id,
            is_exam: true,
        }).sort({ week_number: 1, day_of_week: 1 });

        const finalV31Exams = await Schedule.find({
            course: v31Course._id,
            is_exam: true,
        }).sort({ week_number: 1, day_of_week: 1 });

        console.log("\n📊 Kết quả cuối cùng:");
        console.log(`   V30: ${finalV30Exams.length} lịch thi với ${v30ClassIds.length} lớp`);
        console.log(`   V31: ${finalV31Exams.length} lịch thi với ${v31ClassIds.length} lớp`);
        // Print results
        console.log("\n📋 Chi tiết lịch thi V30:");
        finalV30Exams.forEach((exam) => {
            console.log(
                `   Tuần ${exam.week_number}, Ngày ${exam.day_of_week}, Giai đoạn ${exam.exam_phase}/${exam.total_phases}`
            );
        });

        console.log("\n📋 Chi tiết lịch thi V31:");
        finalV31Exams.forEach((exam) => {
            console.log(
                `   Tuần ${exam.week_number}, Ngày ${exam.day_of_week}, Giai đoạn ${exam.exam_phase}/${exam.total_phases}`
            );
        });

        // Check if we have all phases
        const v30Phases = finalV30Exams.map((exam) => exam.exam_phase).sort();
        const v31Phases = finalV31Exams.map((exam) => exam.exam_phase).sort();

        const v30Complete = v30Phases.length === 5 && v30Phases[0] === 1 && v30Phases[4] === 5;
        const v31Complete = v31Phases.length === 5 && v31Phases[0] === 1 && v31Phases[4] === 5;

        console.log("\n📊 Kiểm tra các giai đoạn thi:");
        console.log(`   V30: ${v30Complete ? "✅ Đầy đủ" : "❌ Thiếu"} (${v30Phases.join(",")})`);
        console.log(`   V31: ${v31Complete ? "✅ Đầy đủ" : "❌ Thiếu"} (${v31Phases.join(",")})`);
    } catch (error) {
        console.error("❌ Lỗi:", error);
    } finally {
        mongoose.disconnect();
        console.log("✅ Hoàn tất tạo lịch thi V30/V31");
    }
}

createExamSchedules();
