// Import các model MongoDB
const Department = require("./models/Department");
const Course = require("./models/Course");
const Class = require("./models/Class");
const Schedule = require("./models/Schedule");
const CourseConstraint = require("./models/CourseConstraint");
const SpecialEvent = require("./models/SpecialEvent");

// Hàm kiểm tra khung giờ có sẵn không
async function isTimeSlotAvailable(classId, day, week, startTime, endTime) {
    try {
        // Kiểm tra có lịch học nào bị chồng chéo không
        const conflictingSchedules = await Schedule.find({
            class: classId,
            day_of_week: day,
            week_number: week,
            $or: [
                // Trường hợp 1: startTime nằm trong khoảng giờ đã có
                { start_time: { $lte: startTime }, end_time: { $gt: startTime } },
                // Trường hợp 2: endTime nằm trong khoảng giờ đã có
                { start_time: { $lt: endTime }, end_time: { $gte: endTime } },
                // Trường hợp 3: startTime và endTime bao quanh khoảng giờ đã có
                { start_time: { $gte: startTime }, end_time: { $lte: endTime } },
            ],
        });

        return conflictingSchedules.length === 0;
    } catch (error) {
        console.error("Error checking time slot availability:", error);
        return false;
    }
}

// Hàm lấy các khung giờ khả dụng cho một ngày cụ thể
async function getAvailableSlotsForDay(classId, day, week) {
    try {
        // Định nghĩa các khung giờ chuẩn
        const timeSlots = [
            { period: 1, start: "07:30:00", end: "08:15:00", isMorning: true },
            { period: 2, start: "08:20:00", end: "09:05:00", isMorning: true },
            { period: 3, start: "09:15:00", end: "10:00:00", isMorning: true },
            { period: 4, start: "10:05:00", end: "10:50:00", isMorning: true },
            { period: 5, start: "10:55:00", end: "11:40:00", isMorning: true },
            { period: 6, start: "11:45:00", end: "12:30:00", isMorning: true },
            { period: 7, start: "13:30:00", end: "14:15:00", isMorning: false },
            { period: 8, start: "14:20:00", end: "15:05:00", isMorning: false },
            { period: 9, start: "15:15:00", end: "16:00:00", isMorning: false },
        ];

        // Kiểm tra từng khung giờ
        const availableSlots = [];
        for (const slot of timeSlots) {
            const isAvailable = await isTimeSlotAvailable(classId, day, week, slot.start, slot.end);
            if (isAvailable) {
                availableSlots.push(slot);
            }
        }

        return availableSlots;
    } catch (error) {
        console.error("Error getting available slots:", error);
        return [];
    }
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

        // Kiểm tra ràng buộc về thời gian trong ngày (sáng/chiều)
        const hour = parseInt(startTime.split(":")[0], 10);
        const isMorning = hour < 12;

        if ((isMorning && !constraint.can_be_morning) || (!isMorning && !constraint.can_be_afternoon)) {
            return { success: false, message: "Môn học không thể xếp vào thời điểm này trong ngày" };
        }

        // Kiểm tra số giờ tối đa trong ngày
        if (constraint.max_hours_per_day) {
            const existingHoursInDay = await Schedule.aggregate([
                {
                    $match: {
                        class: classId,
                        course: courseId,
                        day_of_week: day,
                        week_number: week,
                    },
                },
                {
                    $project: {
                        hours: {
                            $divide: [
                                {
                                    $subtract: [
                                        { $toDate: { $concat: ["1970-01-01T", "$end_time"] } },
                                        { $toDate: { $concat: ["1970-01-01T", "$start_time"] } },
                                    ],
                                },
                                3600000, // Convert milliseconds to hours
                            ],
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalHours: { $sum: "$hours" },
                    },
                },
            ]);

            const existingTotalHours = existingHoursInDay.length > 0 ? existingHoursInDay[0].totalHours : 0;

            const startDate = new Date(`1970-01-01T${startTime}`);
            const endDate = new Date(`1970-01-01T${endTime}`);
            const newHours = (endDate - startDate) / (1000 * 60 * 60);

            if (existingTotalHours + newHours > constraint.max_hours_per_day) {
                return { success: false, message: "Vượt quá số giờ tối đa trong ngày cho môn học này" };
            }
        }

        // Kiểm tra số giờ tối đa trong tuần
        if (constraint.max_hours_per_week) {
            const existingHoursInWeek = await Schedule.aggregate([
                {
                    $match: {
                        class: classId,
                        course: courseId,
                        week_number: week,
                    },
                },
                {
                    $project: {
                        hours: {
                            $divide: [
                                {
                                    $subtract: [
                                        { $toDate: { $concat: ["1970-01-01T", "$end_time"] } },
                                        { $toDate: { $concat: ["1970-01-01T", "$start_time"] } },
                                    ],
                                },
                                3600000, // Convert milliseconds to hours
                            ],
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalHours: { $sum: "$hours" },
                    },
                },
            ]);

            const existingTotalHours = existingHoursInWeek.length > 0 ? existingHoursInWeek[0].totalHours : 0;

            const startDate = new Date(`1970-01-01T${startTime}`);
            const endDate = new Date(`1970-01-01T${endTime}`);
            const newHours = (endDate - startDate) / (1000 * 60 * 60);

            if (existingTotalHours + newHours > constraint.max_hours_per_week) {
                return { success: false, message: "Vượt quá số giờ tối đa trong tuần cho môn học này" };
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Error checking if course can be scheduled:", error);
        return { success: false, message: "Lỗi khi kiểm tra khả năng xếp lịch môn học" };
    }
}

// Hàm xếp lịch môn học
async function scheduleCourse(courseId, classId, day, week, startTime, endTime, isPractical = false, notes = null) {
    try {
        // Kiểm tra xem có thể xếp lịch không
        const validation = await canScheduleCourse(courseId, classId, day, week, startTime, endTime);
        if (!validation.success) {
            return validation;
        }

        // Tạo mục lịch học mới
        const newSchedule = new Schedule({
            class: classId,
            course: courseId,
            day_of_week: day,
            week_number: week,
            start_time: startTime,
            end_time: endTime,
            is_practical: isPractical,
            notes,
        });

        const savedSchedule = await newSchedule.save();
        return { success: true, id: savedSchedule._id };
    } catch (error) {
        console.error("Error scheduling course:", error);
        return { success: false, message: "Lỗi khi xếp lịch môn học", error };
    }
}

// Hàm xếp sự kiện đặc biệt
async function scheduleSpecialEvent(eventId, week, day) {
    try {
        const event = await SpecialEvent.findById(eventId);
        if (!event) {
            return { success: false, message: "Không tìm thấy sự kiện" };
        }

        // Đánh dấu tất cả khung giờ trong ngày là không khả dụng
        const newSchedule = new Schedule({
            special_event: eventId,
            day_of_week: day,
            week_number: week,
            start_time: "07:30:00",
            end_time: "16:00:00",
            notes: event.name,
        });

        const savedSchedule = await newSchedule.save();
        return { success: true, id: savedSchedule._id };
    } catch (error) {
        console.error("Error scheduling special event:", error);
        return { success: false, message: "Lỗi khi xếp lịch sự kiện", error };
    }
}

// Hàm tạo lịch học cho toàn bộ khóa học
async function generateDepartmentSchedule(departmentId, startDate, endDate, totalWeeks = 22) {
    try {
        // Kiểm tra department tồn tại
        const department = await Department.findById(departmentId);
        if (!department) {
            return { success: false, message: "Không tìm thấy khóa học" };
        }

        // Lấy danh sách lớp và môn học
        const classes = await Class.find({ department: departmentId });
        const courses = await Course.find({ department: departmentId });

        // Xếp lịch cho các sự kiện định kỳ trước
        const recurringEvents = await SpecialEvent.find({ recurring: true });

        for (let week = 1; week <= totalWeeks; week++) {
            for (const event of recurringEvents) {
                if (event.recurring_pattern === "FIRST_MONDAY" && week % 4 === 1) {
                    // Chào cờ vào thứ 2 đầu tháng
                    await scheduleSpecialEvent(event._id, week, 1);
                } else if (event.recurring_pattern === "EVERY_THURSDAY") {
                    // Bảo quản vào chiều thứ 5 hàng tuần
                    const newSchedule = new Schedule({
                        special_event: event._id,
                        day_of_week: 4, // Thursday
                        week_number: week,
                        start_time: "13:30:00",
                        end_time: "16:00:00",
                        notes: event.name,
                    });

                    await newSchedule.save();
                }
            }
        }

        // Xếp lịch cho các sự kiện không định kỳ
        const nonRecurringEvents = await SpecialEvent.find({ recurring: false });

        // TODO: Tính toán tuần và ngày thực tế cho mỗi sự kiện dựa trên startDate
        // Hiện tại chỉ là placeholder cho thuật toán xếp lịch thực tế        // Xếp lịch cho các môn học dựa trên ràng buộc
        // ... (phần triển khai sẽ phụ thuộc vào thuật toán xếp lịch cụ thể)

        // Chuẩn bị cấu hình kỳ thi từ các ràng buộc
        const constraints = await CourseConstraint.find({ course: { $in: courses.map((c) => c._id) } });
        const courseExams = constraints
            .filter((constraint) => constraint.min_days_before_exam && constraint.exam_duration_hours)
            .map((constraint) => ({
                id: constraint.course.toString(),
                minDaysBeforeExam: constraint.min_days_before_exam,
                examDuration: constraint.exam_duration_hours,
                examPhases: constraint.exam_phases || 1,
            }));

        console.log(`Found ${courseExams.length} courses with exam configurations`);

        // Lấy danh sách lịch học đã tạo
        const existingSchedules = await Schedule.find({
            class: { $in: classes.map((c) => c._id) },
            is_exam: { $ne: true }, // Chỉ lấy lịch học thường, không phải lịch thi
        });

        // Áp dụng ràng buộc thi
        const constraintProcessor = require("./constraint-processor");
        const updatedSchedules = await constraintProcessor.applyExamConstraints(existingSchedules, courseExams);

        // Lưu các lịch thi mới
        for (const schedule of updatedSchedules) {
            if (schedule.is_exam && !schedule._id) {
                const newExamSchedule = new Schedule({
                    course: schedule.course_id,
                    class: schedule.class_id || schedule.class,
                    day_of_week: schedule.day_of_week,
                    week_number: schedule.week_number,
                    start_time: schedule.start_time,
                    end_time: schedule.end_time,
                    is_exam: true,
                    notes: schedule.notes,
                    exam_phase: schedule.exam_phase,
                    total_phases: schedule.total_phases,
                });
                await newExamSchedule.save();
                console.log(
                    `Created exam schedule for course ${schedule.course_id}, phase ${schedule.exam_phase || 1}`
                );
            }
        }

        return { success: true, message: "Đã tạo lịch học thành công" };
    } catch (error) {
        console.error("Error generating department schedule:", error);
        return { success: false, message: "Lỗi khi tạo lịch học", error };
    }
}

// Hàm tính tổng số giờ học cho tất cả các lớp
async function calculateTotalHours(departmentId) {
    try {
        const classes = await Class.find({ department: departmentId });

        const result = [];
        for (const cls of classes) {
            const schedules = await Schedule.aggregate([
                {
                    $match: {
                        class: cls._id,
                    },
                },
                {
                    $project: {
                        hours: {
                            $divide: [
                                {
                                    $subtract: [
                                        { $toDate: { $concat: ["1970-01-01T", "$end_time"] } },
                                        { $toDate: { $concat: ["1970-01-01T", "$start_time"] } },
                                    ],
                                },
                                3600000, // Convert milliseconds to hours
                            ],
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalHours: { $sum: "$hours" },
                    },
                },
            ]);

            const totalHours = result.length > 0 ? result[0].totalHours : 0;

            result.push({
                class_id: cls._id,
                class_name: cls.name,
                total_hours: totalHours,
            });
        }

        return { success: true, data: result };
    } catch (error) {
        console.error("Error calculating total hours:", error);
        return { success: false, message: "Lỗi khi tính tổng số giờ học", error };
    }
}

module.exports = {
    isTimeSlotAvailable,
    getAvailableSlotsForDay,
    canScheduleCourse,
    scheduleCourse,
    scheduleSpecialEvent,
    generateDepartmentSchedule,
    calculateTotalHours,
};
