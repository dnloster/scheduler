const mongoose = require("mongoose");
const connectDB = require("./database");
const Department = require("./models/Department");
const Class = require("./models/Class");
const Course = require("./models/Course");
const CourseConstraint = require("./models/CourseConstraint");
const SpecialEvent = require("./models/SpecialEvent");

// Kết nối MongoDB
connectDB();

// Tạo dữ liệu mẫu cho cơ sở dữ liệu
const importData = async () => {
    try {
        // Xóa dữ liệu hiện có (nếu có)
        await Department.deleteMany();
        await Class.deleteMany();
        await Course.deleteMany();
        await CourseConstraint.deleteMany();
        await SpecialEvent.deleteMany();

        console.log("Đã xóa tất cả dữ liệu hiện có");

        // Tạo khoa/chuyên ngành mẫu
        const department = await Department.create({
            name: "Sơ cấp báo vụ",
            description: "Chuyên ngành sơ cấp báo vụ",
            director: "Nguyễn Văn A",
            contactInfo: "a.nguyenvan@example.com",
            startDate: "2025-06-09",
            endDate: "2025-11-14",
        });

        console.log(`Đã tạo khoa: ${department.name}`);

        // Tạo lớp học mẫu
        const classes = await Class.insertMany([
            {
                name: "A",
                studentCount: 30,
                department: department._id,
            },
            {
                name: "B",
                studentCount: 28,
                department: department._id,
            },
            {
                name: "C",
                studentCount: 32,
                department: department._id,
            },
            {
                name: "D",
                studentCount: 30,
                department: department._id,
            },
            {
                name: "E",
                studentCount: 29,
                department: department._id,
            },
            {
                name: "F",
                studentCount: 27,
                department: department._id,
            },
        ]);

        console.log(`Đã tạo ${classes.length} lớp học`);

        // Tạo môn học mẫu
        // Môn học chính
        const mainCourses = await Course.insertMany([
            {
                code: "A10",
                name: "Môn A10",
                total_hours: 160,
                theory_hours: 160,
                practical_hours: 0,
                department: department._id,
                description: "Môn học A10 được dạy theo lớp ghép A-B, C-D, E-F",
            },
            {
                code: "Q10",
                name: "Môn Q10",
                total_hours: 100,
                theory_hours: 50,
                practical_hours: 50,
                department: department._id,
                description: "Môn học Q10 bao gồm các môn con",
            },
            {
                code: "V30",
                name: "Môn V30",
                total_hours: 240,
                theory_hours: 240,
                practical_hours: 0,
                department: department._id,
                description: "Môn học V30 học song song với V31",
            },
            {
                code: "V31",
                name: "Môn V31",
                total_hours: 280,
                theory_hours: 280,
                practical_hours: 0,
                department: department._id,
                description: "Môn học V31 học song song với V30",
            },
            {
                code: "V32",
                name: "Môn V32",
                total_hours: 36,
                theory_hours: 36,
                practical_hours: 0,
                department: department._id,
            },
            {
                code: "V33",
                name: "Môn V33",
                total_hours: 87,
                theory_hours: 87,
                practical_hours: 0,
                department: department._id,
            },
            {
                code: "V34",
                name: "Môn V34",
                total_hours: 120,
                theory_hours: 120,
                practical_hours: 0,
                department: department._id,
            },
        ]);

        console.log(`Đã tạo ${mainCourses.length} môn học chính`);

        // Môn học con của Q10
        const subcoursesQ10 = await Course.insertMany([
            {
                code: "Q11",
                name: "Môn Q11",
                parent_course: mainCourses[1]._id, // Q10
                total_hours: 12,
                theory_hours: 0,
                practical_hours: 12,
                department: department._id,
                description: "Môn Q11 là môn con của Q10, chỉ bao gồm thực hành",
            },
            {
                code: "Q12",
                name: "Môn Q12",
                parent_course: mainCourses[1]._id, // Q10
                total_hours: 18,
                theory_hours: 18,
                practical_hours: 0,
                department: department._id,
                description: "Môn Q12 là môn con của Q10, chỉ bao gồm lý thuyết",
            },
            {
                code: "Q13",
                name: "Môn Q13",
                parent_course: mainCourses[1]._id, // Q10
                total_hours: 30,
                theory_hours: 20,
                practical_hours: 10,
                department: department._id,
                description: "Môn Q13 là môn con của Q10, bao gồm cả lý thuyết và thực hành",
            },
            {
                code: "Q14",
                name: "Môn Q14",
                parent_course: mainCourses[1]._id, // Q10
                total_hours: 40,
                theory_hours: 12,
                practical_hours: 28,
                department: department._id,
                description: "Môn Q14 là môn con của Q10, bao gồm cả lý thuyết và thực hành",
            },
        ]);

        console.log(`Đã tạo ${subcoursesQ10.length} môn học con của Q10`);

        // Tạo ràng buộc của môn học
        const constraints = await CourseConstraint.insertMany([
            {
                course: mainCourses[0]._id, // A10
                max_hours_per_week: 10,
                max_hours_per_day: 4,
                can_be_morning: true,
                can_be_afternoon: true,
                requires_consecutive_hours: false,
                min_days_before_exam: 5,
                exam_duration_hours: 3,
                grouped_classes: "1,2|3,4|5,6", // Lớp ghép A-B, C-D, E-F
                notes: "A10 học ghép lớp: A-B, C-D, E-F",
            },
            {
                course: mainCourses[1]._id, // Q10
                can_be_morning: true,
                can_be_afternoon: true,
                requires_consecutive_hours: false,
                min_days_before_exam: 2,
                exam_duration_hours: 6,
                notes: "Q10 gồm nhiều môn nhỏ",
            },            {
                course: mainCourses[2]._id, // V30
                can_be_morning: true,
                can_be_afternoon: true,
                min_days_before_exam: 3,
                exam_duration_hours: 4,
                notes: "Môn V30 học song song với V31, có 5 giai đoạn thi",
                exam_phases: 5,
            },
            {
                course: mainCourses[3]._id, // V31
                can_be_morning: true,
                can_be_afternoon: true,
                min_days_before_exam: 3,
                exam_duration_hours: 4,
                notes: "Môn V31 học song song với V30, có 5 giai đoạn thi",
                exam_phases: 5,
            },
        ]);

        console.log(`Đã tạo ${constraints.length} ràng buộc môn học`);

        // Tạo các sự kiện đặc biệt
        const events = await SpecialEvent.insertMany([
            {
                name: "Chào cờ",
                description: "Chào cờ buổi sáng thứ 2 đầu tháng",
                date: new Date("2025-06-02"), // Ngày đầu tiên
                duration_days: 1,
                recurring: true,
                recurring_pattern: "FIRST_MONDAY",
            },
            {
                name: "Bảo quản",
                description: "Bảo quản vật chất chiều thứ 5 hàng tuần",
                date: new Date("2025-06-05"), // Ngày đầu tiên
                duration_days: 1,
                recurring: true,
                recurring_pattern: "EVERY_THURSDAY",
            },
            {
                name: "Quốc khánh",
                description: "Nghỉ lễ Quốc khánh 2/9",
                date: new Date("2025-09-02"),
                duration_days: 2,
                recurring: false,
            },            {
                name: "Khai giảng",
                description: "Khai giảng năm học",
                date: new Date("2025-09-15"),
                duration_days: 2,
                recurring: false,
            },
            {
                name: "Tập huấn cán bộ",
                description: "Tập huấn cán bộ đầu khóa",
                date: new Date("2025-07-01"),
                duration_days: 3,
                recurring: false,
            },
            {
                name: "Ngày Nhà giáo",
                description: "Kỷ niệm ngày Nhà giáo Việt Nam 20/11",
                date: new Date("2025-11-20"),
                duration_days: 1,
                recurring: false,
            },
        ]);

        console.log(`Đã tạo ${events.length} sự kiện đặc biệt`);

        console.log("Dữ liệu mẫu đã được tạo thành công!");
        process.exit(0);
    } catch (error) {
        console.error(`Lỗi: ${error.message}`);
        process.exit(1);
    }
};

importData();
