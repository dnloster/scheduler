/**
 * Schedule Display Utilities
 * Tiện ích hiển thị lịch học
 */

/**
 * Ánh xạ số ngày sang tên ngày trong tuần
 * @param {number} dayNumber - Số thứ tự ngày trong tuần (1-7)
 * @param {string} format - Định dạng: 'short' hoặc 'long'
 * @returns {string} - Tên hiển thị của ngày
 */
export function dayOfWeekToString(dayNumber, format = "short") {
    const dayStringsShort = ["", "T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const dayStringsLong = ["", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];

    if (dayNumber < 1 || dayNumber > 7) return "";

    return format === "short" ? dayStringsShort[dayNumber] : dayStringsLong[dayNumber];
}

/**
 * Tính ngày thực tế từ số tuần và ngày trong tuần
 * @param {number} weekNumber - Số thứ tự tuần
 * @param {number} dayOfWeek - Số thứ tự ngày trong tuần (1-7)
 * @param {string} startDate - Ngày bắt đầu khóa học (định dạng ISO)
 * @returns {Date} - Đối tượng Date đại diện cho ngày thực tế
 */
export function calculateActualDate(weekNumber, dayOfWeek, startDate) {
    // Mặc định bắt đầu từ 9/6/2025 nếu không có ngày bắt đầu được cung cấp
    const baseDate = startDate ? new Date(startDate) : new Date("2025-06-09");

    // Tính số ngày cần cộng thêm
    const daysToAdd = (weekNumber - 1) * 7 + (dayOfWeek - 1);

    // Tạo ngày mới
    const actualDate = new Date(baseDate);
    actualDate.setDate(baseDate.getDate() + daysToAdd);

    return actualDate;
}

/**
 * Format ngày theo định dạng d/m/yyyy
 * @param {Date} date - Đối tượng ngày
 * @returns {string} - Chuỗi ngày đã được định dạng
 */
export function formatDate(date) {
    if (!date) return "";

    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${d.getFullYear()}`;
}

/**
 * Kiểm tra xem ngày có phải ngày lễ không
 * @param {Date} date - Ngày cần kiểm tra
 * @returns {boolean} - True nếu là ngày lễ
 */
export function isHoliday(date) {
    if (!date) return false;

    const d = new Date(date);
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
 * Kiểm tra xem ngày có phải ngày chào cờ không (thứ hai đầu tháng)
 * @param {Date} date - Ngày cần kiểm tra
 * @returns {boolean} - True nếu là ngày chào cờ
 */
export function isFlagCeremonyDay(date) {
    if (!date) return false;

    const d = new Date(date);

    // Thứ 2 (day of week = 1, trong JavaScript là 0)
    if (d.getDay() !== 1) return false;

    // Kiểm tra xem có phải là thứ 2 đầu tiên trong tháng không
    if (d.getDate() <= 7) {
        const firstDayOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
        const daysUntilFirstMonday = (8 - firstDayOfMonth.getDay()) % 7;
        const firstMondayDate = 1 + daysUntilFirstMonday;

        return d.getDate() === firstMondayDate;
    }

    return false;
}

/**
 * Xác định số buổi học trong một ngày
 * @param {Array} schedules - Danh sách lịch học
 * @param {Date} date - Ngày cần tính
 * @param {string} classId - ID của lớp
 * @returns {number} - Số buổi học
 */
export function countPeriodsOnDate(schedules, date, classId) {
    if (!schedules || !date || !classId) return 0;

    const d = new Date(date);
    const dateStr = formatDate(d);

    return schedules.filter((schedule) => {
        if (!schedule.actual_date) return false;

        const scheduleDate = new Date(schedule.actual_date);
        const scheduleDateStr = formatDate(scheduleDate);

        return scheduleDateStr === dateStr && schedule.class_id === classId;
    }).length;
}

export default {
    dayOfWeekToString,
    calculateActualDate,
    formatDate,
    isHoliday,
    isFlagCeremonyDay,
    countPeriodsOnDate,
};
