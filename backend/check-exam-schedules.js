/**
 * Script kiểm tra lịch thi V30/V31
 * Sử dụng để xác nhận rằng lịch thi V30/V31 đã được tạo đúng với 5 giai đoạn
 */

const mongoose = require("mongoose");
const connectDB = require("./database");
const Schedule = require("./models/Schedule");
const Course = require("./models/Course");
const CourseConstraint = require("./models/CourseConstraint");
const constraintProcessor = require("./constraint-processor");

// Kết nối đến database
connectDB();

async function checkExamSchedules() {
    try {
        console.log("Kiểm tra lịch thi V30/V31...");

        // Tìm khóa học V30 và V31
        const v30Course = await Course.findOne({ code: "V30" });
        const v31Course = await Course.findOne({ code: "V31" });

        if (!v30Course || !v31Course) {
            console.error("Không tìm thấy khóa học V30 hoặc V31");
            return;
        }

        console.log(`Đã tìm thấy: V30 (${v30Course._id}) và V31 (${v31Course._id})`);

        // Tìm các ràng buộc thi
        const v30Constraint = await CourseConstraint.findOne({ course: v30Course._id });
        const v31Constraint = await CourseConstraint.findOne({ course: v31Course._id });

        console.log(
            "Cấu hình thi V30:",
            v30Constraint
                ? `${v30Constraint.min_days_before_exam} ngày trước, ${v30Constraint.exam_duration_hours} giờ, ${
                      v30Constraint.exam_phases || 1
                  } giai đoạn`
                : "Không có"
        );
        console.log(
            "Cấu hình thi V31:",
            v31Constraint
                ? `${v31Constraint.min_days_before_exam} ngày trước, ${v31Constraint.exam_duration_hours} giờ, ${
                      v31Constraint.exam_phases || 1
                  } giai đoạn`
                : "Không có"
        );

        // Tìm lịch thi
        const v30ExamSchedules = await Schedule.find({
            course: v30Course._id,
            is_exam: true,
        }).sort({ week_number: 1, day_of_week: 1 });

        const v31ExamSchedules = await Schedule.find({
            course: v31Course._id,
            is_exam: true,
        }).sort({ week_number: 1, day_of_week: 1 }); // Kiểm tra lịch thi V30
        console.log(`\nTìm thấy ${v30ExamSchedules.length} lịch thi V30`);

        // Kiểm tra số giai đoạn thi
        const v30ExpectedPhases = v30Constraint?.exam_phases || 1;
        const v30PhaseCount = {};
        v30ExamSchedules.forEach((exam) => {
            const classId = exam.class ? exam.class.toString() : "unknown";
            v30PhaseCount[classId] = (v30PhaseCount[classId] || 0) + 1;
        });

        // Hiển thị danh sách
        v30ExamSchedules.forEach((exam, index) => {
            const status = exam.exam_phase && exam.total_phases === v30ExpectedPhases ? "✅" : "⚠️";
            const classInfo = exam.class ? exam.class.toString() : "unknown";
            console.log(
                `  ${status} V30 - Thi ${index + 1}: Tuần ${exam.week_number}, Ngày ${
                    exam.day_of_week
                }, Lớp ${classInfo}, Giai đoạn ${exam.exam_phase || 1}/${exam.total_phases || 1}`
            );
        });
        // Kiểm tra các lớp có đủ số giai đoạn thi chưa
        console.log("\nKiểm tra các lớp V30 có đủ số giai đoạn thi:");
        const v30Classes = Object.keys(v30PhaseCount);
        v30Classes.forEach((classId) => {
            const status = v30PhaseCount[classId] === v30ExpectedPhases ? "✅" : "❌";
            console.log(`  ${status} Lớp ${classId}: ${v30PhaseCount[classId]}/${v30ExpectedPhases} giai đoạn`);
        });

        // Kiểm tra lịch thi V31
        console.log(`\nTìm thấy ${v31ExamSchedules.length} lịch thi V31`);

        // Kiểm tra số giai đoạn thi
        const v31ExpectedPhases = v31Constraint?.exam_phases || 1;
        const v31PhaseCount = {};
        v31ExamSchedules.forEach((exam) => {
            const classId = exam.class ? exam.class.toString() : "unknown";
            v31PhaseCount[classId] = (v31PhaseCount[classId] || 0) + 1;
        });

        // Hiển thị danh sách
        v31ExamSchedules.forEach((exam, index) => {
            const status = exam.exam_phase && exam.total_phases === v31ExpectedPhases ? "✅" : "⚠️";
            const classInfo = exam.class ? exam.class.toString() : "unknown";
            console.log(
                `  ${status} V31 - Thi ${index + 1}: Tuần ${exam.week_number}, Ngày ${
                    exam.day_of_week
                }, Lớp ${classInfo}, Giai đoạn ${exam.exam_phase || 1}/${exam.total_phases || 1}`
            );
        });

        // Kiểm tra các lớp có đủ số giai đoạn thi chưa
        console.log("\nKiểm tra các lớp V31 có đủ số giai đoạn thi:");
        const v31Classes = Object.keys(v31PhaseCount);
        v31Classes.forEach((classId) => {
            const status = v31PhaseCount[classId] === v31ExpectedPhases ? "✅" : "❌";
            console.log(`  ${status} Lớp ${classId}: ${v31PhaseCount[classId]}/${v31ExpectedPhases} giai đoạn`);
        });
        // Kiểm tra sự kiện khai giảng 15-16/9
        const startDate = new Date("2025-09-15");
        const endDate = new Date("2025-09-16");

        const openingCeremonySchedules = await Schedule.find({
            $or: [
                {
                    notes: { $regex: /khai giảng|opening ceremony/i },
                },
                {
                    special_event: { $exists: true, $ne: null },
                    notes: { $regex: /khai giảng|opening ceremony/i },
                },
            ],
        });

        console.log(`\nKiểm tra lễ khai giảng (dự kiến 15-16/09/2025):`);
        console.log(`Tìm thấy ${openingCeremonySchedules.length} lịch khai giảng`);

        if (openingCeremonySchedules.length === 0) {
            console.log("❌ Không tìm thấy lịch khai giảng nào!");
        } else {
            openingCeremonySchedules.forEach((ceremony, index) => {
                const ceremonyDate = ceremony.actual_date ? new Date(ceremony.actual_date) : null;
                const isCorrectDate =
                    ceremonyDate &&
                    (ceremonyDate.getDate() === 15 || ceremonyDate.getDate() === 16) &&
                    ceremonyDate.getMonth() === 8; // Tháng 9 (0-indexed)

                const status = isCorrectDate ? "✅" : "❌";
                console.log(
                    `  ${status} Khai giảng ${index + 1}: ${
                        ceremonyDate ? ceremonyDate.toLocaleDateString() : "Không có ngày"
                    }, Tuần ${ceremony.week_number}, Ngày ${ceremony.day_of_week}`
                );

                if (!isCorrectDate && ceremonyDate) {
                    console.log(
                        `     ⚠️ Ngày khai giảng không đúng! Dự kiến: 15-16/09, thực tế: ${ceremonyDate.getDate()}/${
                            ceremonyDate.getMonth() + 1
                        }`
                    );
                }
            });
        }
    } catch (error) {
        console.error("Lỗi khi kiểm tra lịch thi:", error);
    } finally {
        mongoose.disconnect();
    }
}

checkExamSchedules();
