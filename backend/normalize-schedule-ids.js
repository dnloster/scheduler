/**
 * Script chuẩn hóa các trường ID trong lịch thi
 * Chuẩn hóa dữ liệu course_id/class_id và course/class trong lịch thi
 */

const mongoose = require("mongoose");
const connectDB = require("./database");
const Schedule = require("./models/Schedule");

// Kết nối đến database
connectDB();

async function normalizeScheduleIds() {
    try {
        console.log("Bắt đầu chuẩn hóa IDs trong lịch thi...");

        // Tìm tất cả lịch
        const allSchedules = await Schedule.find({});
        console.log(`Tìm thấy ${allSchedules.length} mục lịch`);

        let updatedCount = 0;

        // Chuẩn hóa IDs
        for (const schedule of allSchedules) {
            let needUpdate = false;
            const updates = {};

            // Kiểm tra các trường ID
            if (schedule.course && !schedule.course_id) {
                updates.course_id = schedule.course.toString();
                needUpdate = true;
            }

            if (!schedule.course && schedule.course_id) {
                updates.course = mongoose.Types.ObjectId(schedule.course_id);
                needUpdate = true;
            }

            if (schedule.class && !schedule.class_id) {
                updates.class_id = schedule.class.toString();
                needUpdate = true;
            }

            if (!schedule.class && schedule.class_id) {
                updates.class = mongoose.Types.ObjectId(schedule.class_id);
                needUpdate = true;
            }

            // Cập nhật nếu cần
            if (needUpdate) {
                await Schedule.updateOne({ _id: schedule._id }, { $set: updates });
                updatedCount++;
            }
        }

        console.log(`Đã chuẩn hóa ${updatedCount} mục lịch`);

        // Kiểm tra lịch thi
        const examSchedules = await Schedule.find({ is_exam: true });
        console.log(`Tìm thấy ${examSchedules.length} lịch thi`);
        examSchedules.forEach((exam, index) => {
            const courseIdOk = exam.course || exam.course_id;
            const classIdOk = exam.class || exam.class_id;

            console.log(
                `  Thi ${index + 1}: Course ID ${courseIdOk ? "OK" : "MISSING"}, Class ID ${
                    classIdOk ? "OK" : "MISSING"
                }, Tuần ${exam.week_number}, Ngày ${exam.day_of_week}`
            );
        });
    } catch (error) {
        console.error("Lỗi khi chuẩn hóa IDs:", error);
    } finally {
        mongoose.disconnect();
    }
}

normalizeScheduleIds();
