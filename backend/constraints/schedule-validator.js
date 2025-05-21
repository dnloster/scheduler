/**
 * Kiểm tra xem ngày xếp lịch có phù hợp với ngày bắt đầu môn học không
 * @param {Object} constraint - Ràng buộc của môn học
 * @param {Date} scheduleDate - Ngày muốn xếp lịch
 * @returns {Object} - Kết quả kiểm tra
 */
function checkStartDateConstraint(constraint, scheduleDate) {
    if (!constraint.start_date) {
        return { success: true };
    }

    const startDate = new Date(constraint.start_date);
    if (scheduleDate < startDate) {
        return {
            success: false,
            message: `Môn học này chỉ có thể bắt đầu từ ngày ${startDate.toLocaleDateString("vi-VN")}`,
        };
    }

    return { success: true };
}

// Hàm kiểm tra xem có thể xếp một môn học vào thời điểm cụ thể không
async function canScheduleCourse(courseId, classId, day, week, startTime, endTime) {
    try {
        // Kiểm tra khung giờ có trống không
        const isAvailable = await isTimeSlotAvailable(classId, day, week, startTime, endTime);
        if (!isAvailable) {
            return { success: false, message: "Khung giờ đã được sử dụng" };
        }

        // Lấy ràng buộc của môn học
        const constraint = await CourseConstraint.findOne({ course: courseId });
        if (!constraint) {
            return { success: true };
        }

        // Kiểm tra ngày bắt đầu
        const scheduleDate = this.calculateDateFromWeek(week, day);
        const dateConstraint = checkStartDateConstraint(constraint, scheduleDate);
        if (!dateConstraint.success) {
            return dateConstraint;
        }

        // Kiểm tra ràng buộc về thời gian trong ngày
        const hour = parseInt(startTime.split(":")[0], 10);
        const isMorning = hour < 12;
        const isAfternoon = hour >= 13;

        if (isMorning && !constraint.can_be_morning) {
            return { success: false, message: "Môn học không thể xếp vào buổi sáng" };
        }

        if (isAfternoon && !constraint.can_be_afternoon) {
            return { success: false, message: "Môn học không thể xếp vào buổi chiều" };
        }

        return { success: true };
    } catch (error) {
        console.error("Error checking course scheduling:", error);
        return { success: false, message: "Lỗi kiểm tra ràng buộc xếp lịch" };
    }
}

module.exports = { canScheduleCourse };
