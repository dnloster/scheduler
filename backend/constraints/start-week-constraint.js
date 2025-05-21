// Kiểm tra ràng buộc về tuần bắt đầu của môn học
function checkStartWeekConstraint(constraint, week) {
    if (!constraint || !constraint.start_week) {
        return { success: true };
    }

    if (week < constraint.start_week) {
        return {
            success: false,
            message: `Môn học này chỉ có thể bắt đầu từ tuần ${constraint.start_week}`,
        };
    }

    return { success: true };
}

module.exports = { checkStartWeekConstraint };
