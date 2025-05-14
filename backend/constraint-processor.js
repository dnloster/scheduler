/**
 * Schedule constraints processor
 * Module xử lý các ràng buộc lịch học
 */
const mongoose = require("mongoose");
const Schedule = require("./models/Schedule");
const SpecialEvent = require("./models/SpecialEvent");

/**
 * Kiểm tra xem một ngày có phải là ngày lễ cố định hay không
 * @param {Date} date - Ngày cần kiểm tra
 * @returns {boolean} - true nếu là ngày lễ cố định
 */
function isFixedHoliday(date) {
    if (!date) return false;

    const d = date instanceof Date ? date : new Date(date);
    const month = d.getMonth() + 1;
    const day = d.getDate();

    // Một số ngày lễ cố định ở Việt Nam
    // 1/1: Tết Dương lịch
    if (month === 1 && day === 1) return true;

    // 30/4: Ngày Giải phóng
    if (month === 4 && day === 30) return true;

    // 1/5: Quốc tế Lao động
    if (month === 5 && day === 1) return true;

    // 2/9: Quốc khánh
    if (month === 9 && day === 2) return true;

    return false;
}

/**
 * Xác định xem ngày có phải là sự kiện đặc biệt không
 * @param {Date|string} date - Ngày cần kiểm tra
 * @param {string} departmentId - ID của khoa/bộ phận
 * @returns {Promise<Object|null>} - Thông tin sự kiện đặc biệt nếu có
 */
async function getSpecialEventOnDate(date, departmentId) {
    try {
        // Trước tiên kiểm tra ngày lễ cố định
        if (isFixedHoliday(date)) {
            // Trả về thông tin giả về sự kiện nếu là ngày lễ cố định
            const d = date instanceof Date ? date : new Date(date);
            const month = d.getMonth() + 1;
            const day = d.getDate();

            // Xác định tên ngày lễ
            let holidayName = "Ngày lễ";
            if (month === 1 && day === 1) holidayName = "Tết Dương lịch";
            else if (month === 4 && day === 30) holidayName = "Ngày Giải phóng";
            else if (month === 5 && day === 1) holidayName = "Quốc tế Lao động";
            else if (month === 9 && day === 2) holidayName = "Quốc khánh";

            // Tạo đối tượng sự kiện "ảo" để đánh dấu ngày lễ
            return {
                _id: `holiday_${month}_${day}`,
                name: holidayName,
                description: `Ngày nghỉ lễ: ${holidayName}`,
                date: d,
                duration_days: 1,
                recurring: true,
                type: "fixed_holiday",
            };
        }

        // Chuyển đổi ngày thành chuỗi YYYY-MM-DD để so sánh
        const dateString =
            date instanceof Date ? date.toISOString().split("T")[0] : new Date(date).toISOString().split("T")[0];

        // Tìm sự kiện đặc biệt vào ngày đó
        const event = await SpecialEvent.findOne({
            $or: [
                { department: departmentId },
                { department: null }, // Sự kiện toàn trường
            ],
            date: { $lte: dateString },
            $expr: {
                $lte: [
                    { $dateFromString: { dateString } },
                    {
                        $add: [
                            { $dateFromString: { dateString: "$date" } },
                            { $multiply: ["$duration_days", 24 * 60 * 60 * 1000] },
                        ],
                    },
                ],
            },
        });

        return event;
    } catch (error) {
        console.error("Error checking for special event:", error);
        return null;
    }
}

/**
 * Kiểm tra xem ngày có phải là ngày chào cờ (buổi sáng thứ 2 đầu tháng) hay không
 * @param {Date} date - Ngày cần kiểm tra
 * @returns {boolean} - true nếu là ngày chào cờ
 */
function isFlagCeremonyDay(date) {
    if (!date) return false;

    const d = date instanceof Date ? date : new Date(date);

    // Thứ 2 (day of week = 1, trong JavaScript là 0)
    if (d.getDay() !== 1) return false;

    // Ngày đầu tiên trong tháng
    if (d.getDate() <= 7) {
        // Kiểm tra xem có phải là thứ 2 đầu tiên của tháng không
        const firstDayOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
        const daysUntilFirstMonday = (8 - firstDayOfMonth.getDay()) % 7;
        const firstMondayDate = 1 + daysUntilFirstMonday;

        return d.getDate() === firstMondayDate;
    }

    return false;
}

/**
 * Áp dụng ràng buộc về ngày nghỉ lễ và sự kiện đặc biệt
 * @param {Array} scheduleDetails - Danh sách chi tiết lịch học
 * @param {Array} events - Danh sách sự kiện đặc biệt
 * @param {string} departmentId - ID của khoa/bộ phận
 * @param {string} startDate - Ngày bắt đầu năm học (định dạng YYYY-MM-DD)
 * @returns {Promise<Array>} - Danh sách chi tiết lịch học đã lọc
 */
async function applyEventConstraints(scheduleDetails, events, departmentId, startDate = "2025-06-09") {
    if (!Array.isArray(scheduleDetails)) return [];

    const processedSchedules = [];

    // Chuyển đổi events từ API thành Map để tra cứu nhanh hơn
    const eventMap = new Map();

    if (events && Array.isArray(events)) {
        // Xây dựng bản đồ sự kiện theo ngày
        for (const event of events) {
            if (!event.date) continue;

            const startDate = new Date(event.date);
            const duration = event.duration_days || 1;

            for (let i = 0; i < duration; i++) {
                const eventDate = new Date(startDate);
                eventDate.setDate(eventDate.getDate() + i);
                const dateKey = eventDate.toISOString().split("T")[0];
                eventMap.set(dateKey, event);
            }
        }
    }

    // Xử lý từng mục trong lịch học
    for (const detail of scheduleDetails) {
        // Chuyển đổi thông tin tuần + ngày trong tuần thành ngày cụ thể
        const actualDate = calculateActualDate(detail.week_number, detail.day_of_week, startDate);
        const dateKey = actualDate.toISOString().split("T")[0];

        // Kiểm tra xem có trùng với sự kiện đặc biệt không
        if (eventMap.has(dateKey)) {
            const event = eventMap.get(dateKey);
            console.log(`Marking schedule on ${dateKey} affected by event: ${event.name}`);

            // Lưu lại sự kiện đặc biệt trong chi tiết lịch học thay vì loại bỏ
            detail.special_event = event._id;
            detail.notes = `Affected by: ${event.name}`;
            detail.actual_date = actualDate;
            detail.has_special_event = true;

            // Nếu là sự kiện quan trọng (ngày lễ), chúng ta có thể đánh dấu là không học
            if (event.priority === "high" || event.type === "holiday") {
                detail.is_canceled = true;
            }
        }
        // Kiểm tra ngày cố định (ngày lễ)
        else if (isFixedHoliday(actualDate)) {
            console.log(`Marking schedule on ${dateKey} affected by fixed holiday`);
            detail.is_special_day = true;
            detail.is_holiday = true;
            detail.actual_date = actualDate;
            detail.notes = "Ngày nghỉ lễ";
            detail.is_canceled = true;
        }
        // Kiểm tra ngày chào cờ
        else if (isFlagCeremonyDay(actualDate)) {
            const hour = parseInt(detail.start_time.split(":")[0]);
            // Nếu là buổi sáng, đánh dấu là chào cờ
            if (hour < 12 && hour >= 7) {
                console.log(`Marking schedule on ${dateKey} morning as flag ceremony day`);
                detail.is_flag_ceremony = true;
                detail.actual_date = actualDate;
                detail.notes = "Chào cờ buổi sáng thứ 2 đầu tháng";
            } else {
                detail.actual_date = actualDate;
            }
        } else {
            // Ngày học bình thường
            detail.actual_date = actualDate;
        }

        processedSchedules.push(detail);
    }

    return processedSchedules;
}

/**
 * Tính toán ngày thực tế từ số tuần và ngày trong tuần
 * Giả sử tuần bắt đầu từ thứ 2 (day_of_week = 1)
 * @param {number} weekNumber - Số thứ tự tuần
 * @param {number} dayOfWeek - Ngày trong tuần (1-7)
 * @param {string} startDate - Ngày bắt đầu năm học (định dạng YYYY-MM-DD)
 * @returns {Date} - Ngày thực tế
 */
function calculateActualDate(weekNumber, dayOfWeek, startDate = "2025-06-09") {
    const baseDate = new Date(startDate);

    // Đảm bảo baseDate là một ngày thứ 2 (đầu tuần)
    const baseDayOfWeek = baseDate.getDay() || 7; // 0 = Chủ Nhật = 7
    const daysToAdjust = baseDayOfWeek === 1 ? 0 : (1 - baseDayOfWeek + 7) % 7;

    if (daysToAdjust > 0) {
        baseDate.setDate(baseDate.getDate() + daysToAdjust);
    }

    // Tính số ngày cần cộng thêm
    const daysToAdd = (weekNumber - 1) * 7 + (dayOfWeek - 1);
    const actualDate = new Date(baseDate);
    actualDate.setDate(baseDate.getDate() + daysToAdd);

    return actualDate;
}

/**
 * Xử lý ràng buộc thời gian (buổi sáng, chiều)
 * @param {Array} scheduleDetails - Danh sách chi tiết lịch học
 * @param {Object} constraints - Ràng buộc về thời gian
 * @returns {Array} - Danh sách chi tiết lịch học đã xử lý
 */
function applyTimeConstraints(scheduleDetails, constraints) {
    if (!constraints || !Array.isArray(scheduleDetails)) return scheduleDetails;

    const { prioritize_morning = false, self_study_afternoon = false } = constraints;

    // Xử lý từng mục trong lịch học
    return scheduleDetails.map((detail) => {
        // Xác định buổi học (sáng hay chiều)
        const hour = parseInt(detail.start_time.split(":")[0]);
        const isMorning = hour < 12;
        const isAfternoon = hour >= 13;

        // Nếu chỉ cần đánh dấu các buổi học chiều là tự học
        if (self_study_afternoon && isAfternoon) {
            detail.is_self_study = true;
            detail.notes = (detail.notes || "") + " (Buổi tự học)";
        }

        return detail;
    });
}

/**
 * Xử lý ràng buộc về tiết thực hành
 * @param {Array} scheduleDetails - Danh sách chi tiết lịch học
 * @param {Array} practicalCourses - Danh sách ID các môn thực hành
 * @returns {Array} - Danh sách chi tiết lịch học đã xử lý
 */
function applyPracticalConstraints(scheduleDetails, practicalCourses = []) {
    if (!Array.isArray(scheduleDetails) || scheduleDetails.length === 0) return [];

    // Chuyển đổi danh sách ID thành Set để tìm kiếm nhanh hơn
    const practicalSet = new Set(practicalCourses.map((id) => id.toString()));

    return scheduleDetails.map((detail) => {
        // Kiểm tra xem có phải là môn thực hành không
        const courseId = detail.course_id?.toString();
        if (courseId && practicalSet.has(courseId)) {
            detail.is_practical = true;

            // Tiết thực hành thường cần 2 tiết liên tiếp
            detail.requires_consecutive_hours = true;
        }

        return detail;
    });
}

/**
 * Áp dụng tất cả các ràng buộc cho lịch học
 * @param {Array} scheduleDetails - Danh sách chi tiết lịch học
 * @param {Object} options - Các tham số cấu hình
 * @returns {Promise<Array>} - Danh sách chi tiết lịch học đã xử lý
 */
async function applyAllConstraints(scheduleDetails, options = {}) {
    const { events, constraints, departmentId, startDate, practicalCourses } = options;

    console.log(`Applying constraints to ${scheduleDetails?.length || 0} schedule items`);

    // Áp dụng ràng buộc sự kiện đặc biệt và ngày lễ
    const filteredByEvents = await applyEventConstraints(scheduleDetails, events, departmentId, startDate);
    console.log(`After event constraints: ${filteredByEvents.length} items`);

    // Áp dụng ràng buộc thời gian
    const filteredByTime = applyTimeConstraints(filteredByEvents, constraints);
    console.log(`After time constraints: ${filteredByTime.length} items`);

    // Áp dụng ràng buộc về tiết thực hành
    const finalSchedule = applyPracticalConstraints(filteredByTime, practicalCourses);
    console.log(`Final schedule after all constraints: ${finalSchedule.length} items`);

    return finalSchedule;
}

module.exports = {
    getSpecialEventOnDate,
    isFixedHoliday,
    isFlagCeremonyDay,
    applyEventConstraints,
    applyTimeConstraints,
    applyPracticalConstraints,
    applyAllConstraints,
    calculateActualDate,
};
