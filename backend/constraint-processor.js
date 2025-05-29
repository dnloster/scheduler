/**
 * Schedule constraints processor
 * Module xử lý các ràng buộc lịch học
 */
const mongoose = require("mongoose");
const Schedule = require("./models/Schedule");
const SpecialEvent = require("./models/SpecialEvent");
const CourseHandlerRegistry = require("./course-handlers/course-handler-registry");

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
    if (month === 5 && day === 1) return true; // 2/9: Quốc khánh
    return month === 9 && day === 2;
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
        } // Chuyển đổi ngày thành chuỗi YYYY-MM-DD để so sánh
        const dateString =
            date instanceof Date ? date.toISOString().split("T")[0] : new Date(date).toISOString().split("T")[0];

        // Tìm sự kiện đặc biệt vào ngày đó
        // Support both single date and date range events
        const event = await SpecialEvent.findOne({
            $or: [
                { department: departmentId },
                { department: null }, // Sự kiện toàn trường
            ],
            $or: [
                // Single date events (using 'date' field)
                {
                    date: { $lte: new Date(dateString) },
                    $expr: {
                        $lte: [
                            new Date(dateString),
                            {
                                $add: [
                                    "$date",
                                    { $multiply: [{ $subtract: ["$duration_days", 1] }, 24 * 60 * 60 * 1000] },
                                ],
                            },
                        ],
                    },
                },
                // Range events (using 'start_date' and 'end_date' fields)
                {
                    start_date: { $lte: new Date(dateString) },
                    $or: [
                        { end_date: { $gte: new Date(dateString) } },
                        {
                            end_date: { $exists: false },
                            $expr: {
                                $gte: [
                                    new Date(dateString),
                                    {
                                        $add: [
                                            "$start_date",
                                            { $multiply: [{ $subtract: ["$duration_days", 1] }, 24 * 60 * 60 * 1000] },
                                        ],
                                    },
                                ],
                            },
                        },
                    ],
                },
            ],
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
 * Áp dụng ràng buộc về ngày nghỉ lễ và sự kiện đặc biệt - bao gồm việc tạo ra các sự kiện bảo trì
 * @param {Array} scheduleDetails - Danh sách chi tiết lịch học
 * @param {Array} events - Danh sách sự kiện đặc biệt
 * @param {string} departmentId - ID của khoa/bộ phận
 * @param {string} startDate - Ngày bắt đầu năm học (định dạng YYYY-MM-DD)
 * @param {number} totalWeeks - Tổng số tuần học
 * @returns {Promise<Array>} - Danh sách chi tiết lịch học đã lọc và bổ sung
 */
async function applyEventConstraints(scheduleDetails, events, departmentId, startDate = "2025-06-09", totalWeeks = 22) {
    if (!Array.isArray(scheduleDetails)) return [];

    const processedSchedules = [];
    const generatedEvents = [];

    // Convert events from API to Map for faster lookup
    const eventMap = new Map();
    if (events && Array.isArray(events)) {
        // Build event map by date
        for (const event of events) {
            let eventStartDate, eventEndDate;

            // Handle both single date and date range events
            if (event.start_date && event.end_date) {
                // Range type event
                eventStartDate = new Date(event.start_date);
                eventEndDate = new Date(event.end_date);
            } else if (event.date) {
                // Single date event
                eventStartDate = new Date(event.date);
                const duration = event.duration_days || 1;
                eventEndDate = new Date(eventStartDate);
                eventEndDate.setDate(eventEndDate.getDate() + duration - 1);
            } else if (event.start_date) {
                // Start date only
                eventStartDate = new Date(event.start_date);
                const duration = event.duration_days || 1;
                eventEndDate = new Date(eventStartDate);
                eventEndDate.setDate(eventEndDate.getDate() + duration - 1);
            } else {
                console.warn("Event missing date information:", event);
                continue;
            }

            // Generate all dates in the event range
            const currentDate = new Date(eventStartDate);
            while (currentDate <= eventEndDate) {
                const dateKey = currentDate.toISOString().split("T")[0];
                eventMap.set(dateKey, {
                    ...event,
                    // Add computed fields for better tracking
                    computed_start_date: eventStartDate,
                    computed_end_date: eventEndDate,
                    current_day_in_event: Math.floor((currentDate - eventStartDate) / (24 * 60 * 60 * 1000)) + 1,
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
    }

    // Process each schedule item
    for (const detail of scheduleDetails) {
        // Convert week + day of week to actual date
        const actualDate = calculateActualDate(detail.week_number, detail.day_of_week, startDate);
        const dateKey = actualDate.toISOString().split("T")[0];

        // Check if it conflicts with special events
        if (eventMap.has(dateKey)) {
            const event = eventMap.get(dateKey);
            console.log(`Marking schedule on ${dateKey} affected by event: ${event.name}`);

            // Keep special event info in schedule detail instead of removing it
            detail.special_event = event._id;
            detail.notes = `Affected by: ${event.name}`;
            detail.actual_date = actualDate;
            detail.has_special_event = true;

            // If it's an important event (holiday), mark as canceled
            if (event.priority === "high" || event.type === "holiday") {
                detail.is_canceled = true;
            }
        }
        // Check fixed holidays
        else if (isFixedHoliday(actualDate)) {
            console.log(`Marking schedule on ${dateKey} affected by fixed holiday`);
            detail.is_special_day = true;
            detail.is_holiday = true;
            detail.actual_date = actualDate;
            detail.notes = "Ngày nghỉ lễ";
            detail.is_canceled = true;
        }
        // Check flag ceremony day - only affects periods 1-2
        else if (
            isFlagCeremonyDay(actualDate) &&
            (detail.start_time === "07:30:00" || (detail.start_time <= "09:00:00" && detail.end_time >= "07:30:00"))
        ) {
            const hour = parseInt(detail.start_time.split(":")[0]);
            // If it's morning, mark as flag ceremony
            if (hour < 12 && hour >= 7) {
                console.log(`Marking schedule on ${dateKey} morning as flag ceremony day`);
                detail.is_flag_ceremony = true;
                detail.actual_date = actualDate;
                detail.notes = "Chào cờ buổi sáng thứ 2 đầu tháng";
            } else {
                detail.actual_date = actualDate;
            }
        } else {
            // Normal study day
            detail.actual_date = actualDate;
        }

        processedSchedules.push(detail);
    }

    // Generate maintenance periods (thời gian bảo quản tuần)
    // Typically scheduled at the end of each month or every few weeks
    console.log("Generating maintenance periods...");

    const maintenanceFrequency = 4; // Every 4 weeks
    let maintenanceCount = 0;

    for (let week = maintenanceFrequency; week <= totalWeeks; week += maintenanceFrequency) {
        // Schedule maintenance on Friday afternoon
        const maintenanceDay = 5; // Friday
        const maintenanceDate = calculateActualDate(week, maintenanceDay, startDate);
        const dateKey = maintenanceDate.toISOString().split("T")[0];

        // Check if this date conflicts with existing events
        if (!eventMap.has(dateKey) && !isFixedHoliday(maintenanceDate)) {
            const maintenanceEvent = {
                course_id: null, // No specific course
                class_id: null, // Affects all classes
                week_number: week,
                day_of_week: maintenanceDay,
                start_time: "15:00:00",
                end_time: "17:00:00",
                is_practical: false,
                is_exam: false,
                is_self_study: false,
                is_maintenance: true,
                actual_date: maintenanceDate,
                notes: `Thời gian bảo quản tuần ${week} - Bảo trì thiết bị và vệ sinh`,
                event_type: "maintenance",
            };

            generatedEvents.push(maintenanceEvent);
            maintenanceCount++;
            console.log(`Generated maintenance period: Week ${week}, ${dateKey}`);
        }
    }
    // Generate additional special events based on academic calendar
    // Mid-semester break
    const midSemesterWeek = Math.floor(totalWeeks / 2);

    for (let day = 1; day <= 5; day++) {
        // Monday to Friday
        const breakDate = calculateActualDate(midSemesterWeek, day, startDate);
        const dateKey = breakDate.toISOString().split("T")[0];

        if (!eventMap.has(dateKey) && !isFixedHoliday(breakDate)) {
            const breakEvent = {
                course_id: null,
                class_id: null,
                week_number: midSemesterWeek,
                day_of_week: day,
                start_time: "07:30:00",
                end_time: "17:00:00",
                is_practical: false,
                is_exam: false,
                is_self_study: false,
                is_break: true,
                actual_date: breakDate,
                notes: "Tuần nghỉ giữa kỳ",
                event_type: "mid_semester_break",
            };

            generatedEvents.push(breakEvent);
        }
    } // Generate schedule entries for configured special events
    console.log("Generating schedule entries for configured special events...");
    let configuredEventCount = 0;

    if (events && Array.isArray(events)) {
        for (const event of events) {
            if (!event.date || event.selected === false) continue;

            const eventStartDate = new Date(event.date);
            const duration = event.duration_days || 1;

            for (let i = 0; i < duration; i++) {
                const eventDate = new Date(eventStartDate);
                eventDate.setDate(eventDate.getDate() + i);

                // Calculate which week and day this falls on
                const diffTime = eventDate.getTime() - new Date(startDate).getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                const weekNumber = Math.floor(diffDays / 7) + 1;
                const dayOfWeek = (diffDays % 7) + 1;

                // Ensure the event falls within our schedule period
                if (weekNumber >= 1 && weekNumber <= totalWeeks && dayOfWeek >= 1 && dayOfWeek <= 7) {
                    const specialEventEntry = {
                        course_id: null, // Special events don't have courses
                        class_id: null, // Affects all classes
                        week_number: weekNumber,
                        day_of_week: dayOfWeek,
                        start_time: "07:30:00", // Full day event
                        end_time: "17:00:00",
                        is_practical: false,
                        is_exam: false,
                        is_self_study: false,
                        is_holiday: event.type === "holiday",
                        is_special_day: true,
                        actual_date: eventDate,
                        notes: `${event.name}${event.description ? " - " + event.description : ""}`,
                        event_type: event.type || "special",
                        special_event_name: event.name,
                        is_canceled: false, // Special events are the main event, not canceled
                    };

                    generatedEvents.push(specialEventEntry);
                    configuredEventCount++;
                    console.log(`Generated special event entry: ${event.name} on Week ${weekNumber}, Day ${dayOfWeek}`);
                }
            }
        }
    }

    console.log(`Generated ${maintenanceCount} maintenance periods and additional academic events`);
    console.log(`Generated ${configuredEventCount} configured special event entries`);
    console.log(`Total generated events: ${generatedEvents.length}`);

    // Combine processed schedules with generated events
    return [...processedSchedules, ...generatedEvents];
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
 * @param {Array} coursesData - Dữ liệu các môn học (để tính số giờ bắt buộc)
 * @param {number} totalWeeks - Tổng số tuần học
 * @returns {Array} - Danh sách chi tiết lịch học đã xử lý
 */
function applyTimeConstraints(scheduleDetails, constraints, coursesData = [], totalWeeks = 22) {
    if (!constraints || !Array.isArray(scheduleDetails)) return scheduleDetails;

    const { prioritize_morning = false, self_study_afternoon = false } = constraints;

    // Create a map of course constraints for faster lookup
    const courseConstraints = new Map();
    if (Array.isArray(constraints.custom_constraints)) {
        constraints.custom_constraints.forEach((constraint) => {
            if (constraint.course) {
                courseConstraints.set(constraint.course.toString(), constraint);
            }
        });
    }

    // Create a map of course data for calculating required hours
    const courseDataMap = new Map();
    if (Array.isArray(coursesData)) {
        coursesData.forEach((course) => {
            const courseId = course.id || course._id;
            if (courseId) {
                courseDataMap.set(courseId.toString(), course);
            }
        });
    }

    // If self_study_afternoon is enabled, calculate required hours for each course per week
    let courseWeeklyHours = new Map();
    if (self_study_afternoon) {
        courseDataMap.forEach((course, courseId) => {
            const totalHours = course.total_hours || 0;
            const maxHoursPerWeek = course.max_hours_per_week || Math.ceil(totalHours / totalWeeks);
            courseWeeklyHours.set(courseId, maxHoursPerWeek);
        });
    }

    // Track completed hours per course per week for self-study calculation
    let courseCompletedHours = new Map();

    // Xử lý từng mục trong lịch học
    return scheduleDetails.filter((detail) => {
        // Xác định buổi học (sáng hay chiều)
        const hour = parseInt(detail.start_time.split(":")[0]);
        const isMorning = hour < 12;
        const isAfternoon = hour >= 13; // Get course constraints and configurations if available
        const courseId = detail.course_id?.toString();
        const courseConstraint = courseId ? courseConstraints.get(courseId) : null;
        const courseData = courseId ? courseDataMap.get(courseId) : null;

        // Kiểm tra giới hạn buổi sáng/chiều nếu có
        if (courseConstraint) {
            // Kiểm tra giới hạn thời gian bắt đầu
            if (courseConstraint.earliest_start_time || courseConstraint.latest_start_time) {
                const startTimeMinutes =
                    parseInt(detail.start_time.split(":")[0]) * 60 + parseInt(detail.start_time.split(":")[1]);

                if (courseConstraint.earliest_start_time) {
                    const earliestMinutes =
                        parseInt(courseConstraint.earliest_start_time.split(":")[0]) * 60 +
                        parseInt(courseConstraint.earliest_start_time.split(":")[1]);
                    if (startTimeMinutes < earliestMinutes) {
                        return false;
                    }
                }

                if (courseConstraint.latest_start_time) {
                    const latestMinutes =
                        parseInt(courseConstraint.latest_start_time.split(":")[0]) * 60 +
                        parseInt(courseConstraint.latest_start_time.split(":")[1]);
                    if (startTimeMinutes > latestMinutes) {
                        return false;
                    }
                }
            }

            // Nếu không cho phép học buổi sáng
            if (isMorning && !courseConstraint.can_be_morning) {
                return false;
            }

            // Nếu không cho phép học buổi chiều
            if (isAfternoon && !courseConstraint.can_be_afternoon) {
                return false;
            }
        }

        // Apply course configuration constraints from Step3CourseConfig
        if (courseData) {
            // Check max_hours_per_day constraint
            if (courseData.max_hours_per_day) {
                const dayKey = `${courseId}-${detail.week_number}-${detail.day_of_week}`;

                // Calculate current session duration in hours
                const startTime = new Date(`1970-01-01T${detail.start_time}`);
                const endTime = new Date(`1970-01-01T${detail.end_time}`);
                const sessionHours = (endTime - startTime) / (1000 * 60 * 60);

                // Track daily hours for this course
                if (!courseCompletedHours.has(dayKey)) {
                    courseCompletedHours.set(dayKey, 0);
                }

                const currentDayHours = courseCompletedHours.get(dayKey);
                const totalDayHours = currentDayHours + sessionHours;

                // Check if adding this session would exceed daily limit
                if (totalDayHours > courseData.max_hours_per_day) {
                    console.log(
                        `Filtering session for ${
                            courseData.code || courseId
                        }: ${totalDayHours}h exceeds daily limit of ${courseData.max_hours_per_day}h`
                    );
                    return false;
                }

                // Update daily hours tracking
                courseCompletedHours.set(dayKey, totalDayHours);
            }

            // Check max_hours_per_week constraint
            if (courseData.max_hours_per_week) {
                const weekKey = `${courseId}-${detail.week_number}`;

                // Calculate current session duration in hours
                const startTime = new Date(`1970-01-01T${detail.start_time}`);
                const endTime = new Date(`1970-01-01T${detail.end_time}`);
                const sessionHours = (endTime - startTime) / (1000 * 60 * 60);

                // Track weekly hours for this course
                if (!courseCompletedHours.has(weekKey)) {
                    courseCompletedHours.set(weekKey, 0);
                }

                const currentWeekHours = courseCompletedHours.get(weekKey);
                const totalWeekHours = currentWeekHours + sessionHours;

                // Check if adding this session would exceed weekly limit
                if (totalWeekHours > courseData.max_hours_per_week) {
                    console.log(
                        `Filtering session for ${
                            courseData.code || courseId
                        }: ${totalWeekHours}h exceeds weekly limit of ${courseData.max_hours_per_week}h`
                    );
                    return false;
                }

                // Update weekly hours tracking
                courseCompletedHours.set(weekKey, totalWeekHours);
            }

            // Check morning/afternoon hour limits
            if (isMorning && courseData.max_morning_hours) {
                const morningKey = `${courseId}-${detail.week_number}-${detail.day_of_week}-morning`;

                const startTime = new Date(`1970-01-01T${detail.start_time}`);
                const endTime = new Date(`1970-01-01T${detail.end_time}`);
                const sessionHours = (endTime - startTime) / (1000 * 60 * 60);

                if (!courseCompletedHours.has(morningKey)) {
                    courseCompletedHours.set(morningKey, 0);
                }

                const currentMorningHours = courseCompletedHours.get(morningKey);
                const totalMorningHours = currentMorningHours + sessionHours;

                if (totalMorningHours > courseData.max_morning_hours) {
                    console.log(
                        `Filtering morning session for ${
                            courseData.code || courseId
                        }: ${totalMorningHours}h exceeds morning limit of ${courseData.max_morning_hours}h`
                    );
                    return false;
                }

                courseCompletedHours.set(morningKey, totalMorningHours);
            }

            if (isAfternoon && courseData.max_afternoon_hours) {
                const afternoonKey = `${courseId}-${detail.week_number}-${detail.day_of_week}-afternoon`;

                const startTime = new Date(`1970-01-01T${detail.start_time}`);
                const endTime = new Date(`1970-01-01T${detail.end_time}`);
                const sessionHours = (endTime - startTime) / (1000 * 60 * 60);

                if (!courseCompletedHours.has(afternoonKey)) {
                    courseCompletedHours.set(afternoonKey, 0);
                }

                const currentAfternoonHours = courseCompletedHours.get(afternoonKey);
                const totalAfternoonHours = currentAfternoonHours + sessionHours;

                if (totalAfternoonHours > courseData.max_afternoon_hours) {
                    console.log(
                        `Filtering afternoon session for ${
                            courseData.code || courseId
                        }: ${totalAfternoonHours}h exceeds afternoon limit of ${courseData.max_afternoon_hours}h`
                    );
                    return false;
                }

                courseCompletedHours.set(afternoonKey, totalAfternoonHours);
            }
        }

        // Ưu tiên xếp lịch buổi sáng nếu được yêu cầu
        if (prioritize_morning && !isMorning && !detail.is_practical) {
            return false;
        } // Xử lý logic tự học buổi chiều thông minh
        if (self_study_afternoon && courseId) {
            const weekNumber = detail.week_number || 1;
            const classId = detail.class_id?.toString();

            // Tạo key duy nhất cho course-class-week
            const weekKey = `${courseId}-${classId}-${weekNumber}`;

            // Tính số giờ của tiết học hiện tại
            const startTime = new Date(`1970-01-01T${detail.start_time}`);
            const endTime = new Date(`1970-01-01T${detail.end_time}`);
            const sessionHours = (endTime - startTime) / (1000 * 60 * 60);

            // Lấy số giờ đã hoàn thành cho course-class-week này
            const completedHours = courseCompletedHours.get(weekKey) || 0;
            const requiredHours = courseWeeklyHours.get(courseId) || 0;

            // Nếu là buổi sáng, chỉ cập nhật số giờ đã hoàn thành
            if (isMorning) {
                courseCompletedHours.set(weekKey, completedHours + sessionHours);
            } else if (isAfternoon) {
                // Xử lý buổi chiều: kiểm tra xem đã đủ giờ bắt buộc chưa
                if (completedHours >= requiredHours) {
                    detail.is_self_study = true;
                    detail.notes = (detail.notes || "") + " (Buổi tự học - đã hoàn thành giờ bắt buộc)";
                } else {
                    // Cập nhật số giờ đã hoàn thành
                    courseCompletedHours.set(weekKey, completedHours + sessionHours);

                    // Nếu sau khi thêm tiết này mà vượt quá giờ bắt buộc, chỉ đánh dấu phần vượt quá
                    const newCompletedHours = completedHours + sessionHours;
                    if (newCompletedHours > requiredHours) {
                        // Tiết này vừa học vừa tự học
                        const excessHours = newCompletedHours - requiredHours;
                        const studyRatio = excessHours / sessionHours;

                        if (studyRatio > 0.5) {
                            // Nếu hơn 50% là tự học
                            detail.is_self_study = true;
                            detail.notes = (detail.notes || "") + " (Buổi tự học - vượt giờ bắt buộc)";
                        } else {
                            detail.notes = (detail.notes || "") + " (Học bài + tự học)";
                        }
                    }
                }
            }
        }

        return true;
    });
}

/**
 * Xử lý ràng buộc về tiết thực hành - bao gồm việc tạo ra các tiết thực hành mới
 * @param {Array} scheduleDetails - Danh sách chi tiết lịch học
 * @param {Array} practicalCourses - Danh sách ID các môn thực hành
 * @param {Array} coursesData - Dữ liệu chi tiết các môn học
 * @param {number} totalWeeks - Tổng số tuần học
 * @returns {Array} - Danh sách chi tiết lịch học đã xử lý và bổ sung
 */
function applyPracticalConstraints(scheduleDetails, practicalCourses = [], coursesData = [], totalWeeks = 22) {
    if (!Array.isArray(scheduleDetails)) return [];

    // Chuyển đổi danh sách ID thành Set để tìm kiếm nhanh hơn
    const practicalSet = new Set(practicalCourses.map((id) => id.toString()));

    // Create a map of course data for practical hours calculation
    const courseDataMap = new Map();
    if (Array.isArray(coursesData)) {
        coursesData.forEach((course) => {
            const courseId = course.id || course._id;
            if (courseId) {
                courseDataMap.set(courseId.toString(), course);
            }
        });
    }

    // Process existing schedule items and mark practical ones
    const processedSchedules = scheduleDetails.map((detail) => {
        // Kiểm tra xem có phải là môn thực hành không
        const courseId = detail.course_id?.toString();

        // Set is_practical flag if it's already set or if it's in the practicalCourses set
        if (detail.is_practical || (courseId && practicalSet.has(courseId))) {
            detail.is_practical = true;
            detail.requires_consecutive_hours = true;
        }

        return detail;
    });

    // Generate additional practical sessions for courses that need them
    const generatedPracticalSessions = [];

    // Find unique course-class combinations that need practical sessions
    const courseClassCombinations = new Map();

    processedSchedules.forEach((detail) => {
        const courseId = detail.course_id?.toString();
        const classId = detail.class_id?.toString();

        if (courseId && classId) {
            const key = `${courseId}-${classId}`;
            if (!courseClassCombinations.has(key)) {
                courseClassCombinations.set(key, {
                    courseId,
                    classId,
                    isPractical: practicalSet.has(courseId),
                    courseData: courseDataMap.get(courseId),
                });
            }
        }
    });

    // Generate practical sessions for courses that need them
    courseClassCombinations.forEach(({ courseId, classId, isPractical, courseData }) => {
        if (!isPractical || !courseData) return;
        const practicalHours = courseData.practical_hours || 0;

        if (practicalHours > 0) {
            console.log(`Generating practical sessions for course ${courseId}, practical hours: ${practicalHours}`);

            // Calculate how many practical sessions we need
            const hoursPerSession = 2; // Practical sessions are typically 2 hours
            const practicalSessions = Math.ceil(practicalHours / hoursPerSession);
            let sessionsGenerated = 0;

            for (let week = 1; week <= totalWeeks && sessionsGenerated < practicalSessions; week++) {
                // Try to schedule practical sessions on different days
                const preferredDays = [3, 5, 2]; // Wednesday, Friday, Tuesday

                for (
                    let dayIndex = 0;
                    dayIndex < preferredDays.length && sessionsGenerated < practicalSessions;
                    dayIndex++
                ) {
                    const dayOfWeek = preferredDays[dayIndex];

                    // Check if we already have a session on this day for this course-class
                    const existingSession = processedSchedules.find(
                        (s) =>
                            s.course_id?.toString() === courseId &&
                            s.class_id?.toString() === classId &&
                            s.week_number === week &&
                            s.day_of_week === dayOfWeek
                    );

                    if (!existingSession) {
                        // Generate practical session
                        const practicalSession = {
                            class_id: classId,
                            course_id: courseId,
                            day_of_week: dayOfWeek,
                            week_number: week,
                            start_time: "13:30:00", // Afternoon practical session
                            end_time: "15:30:00", // 2-hour session
                            is_practical: true,
                            is_exam: false,
                            is_self_study: false,
                            requires_consecutive_hours: true,
                            notes: `Tiết thực hành (${sessionsGenerated + 1}/${practicalSessions})`,
                        };

                        generatedPracticalSessions.push(practicalSession);
                        sessionsGenerated++;

                        // Only generate one session per week per course-class combination initially
                        break;
                    }
                }
            }

            console.log(`Generated ${sessionsGenerated} practical sessions for course ${courseId}`);
        }
    });

    console.log(`Generated ${generatedPracticalSessions.length} additional practical sessions`);

    // Combine original processed schedules with generated practical sessions
    return [...processedSchedules, ...generatedPracticalSessions];
}

/**
 * Xử lý các slot kiểm tra và thi - bao gồm việc tạo ra các kỳ thi mới
 * Đã được cập nhật để hỗ trợ paired courses như V30/V31
 * @param {Array} scheduleDetails - Danh sách chi tiết lịch học
 * @param {Array} courseExams - Danh sách các cấu hình thi cho các khóa học
 * @param {number} totalWeeks - Tổng số tuần học
 * @returns {Array} - Danh sách chi tiết lịch học đã xử lý, bao gồm các slot thi
 */
function applyExamConstraints(scheduleDetails, courseExams = [], totalWeeks = 22) {
    if (!Array.isArray(scheduleDetails)) return [];

    // Tạo một map để dễ tra cứu cấu hình thi theo ID môn học
    const examConfigMap = new Map();
    if (Array.isArray(courseExams)) {
        courseExams.forEach((config) => {
            // Look for exam configuration in the course config
            const courseId = config.id || config._id;
            const minDays = config.minDaysBeforeExam || config.min_days_before_exam || 0;
            const duration = config.examDuration || config.exam_duration || 0;
            const phases = config.examPhases || config.exam_phases || 1;

            if (courseId && (minDays > 0 || duration > 0)) {
                examConfigMap.set(courseId.toString(), {
                    minDays: minDays,
                    duration: duration,
                    phases: phases,
                });
                console.log(
                    `Found exam config for course ${courseId}: ${minDays} days, ${duration}h, ${phases} phases`
                );
            }
        });
    }

    // If no exam configurations found, return original schedule
    if (examConfigMap.size === 0) {
        console.log("No exam configurations found, skipping exam generation");
        return scheduleDetails;
    }

    // Create a deep copy to avoid modifying the original array
    const processedSchedules = JSON.parse(JSON.stringify(scheduleDetails));
    const examSchedules = [];

    // Group schedules by paired course groups for synchronized exam generation
    const pairedCourseGroups = new Map();
    const individualCourses = new Map();

    // Categorize schedules into paired groups or individual courses
    processedSchedules.forEach((schedule) => {
        if (!schedule.course_id || schedule.is_exam) return;

        const courseId = schedule.course_id.toString();

        if (schedule.is_paired_course && schedule.paired_group) {
            // This is part of a paired course group
            if (!pairedCourseGroups.has(schedule.paired_group)) {
                pairedCourseGroups.set(schedule.paired_group, []);
            }
            pairedCourseGroups.get(schedule.paired_group).push(schedule);
        } else {
            // Individual course
            const classId = schedule.class_id?.toString();
            const weekDay = `${schedule.week_number}-${schedule.day_of_week}`;
            const key = `${courseId}-${classId}`;

            if (!individualCourses.has(key) || compareWeekDays(weekDay, individualCourses.get(key).weekDay) > 0) {
                individualCourses.set(key, {
                    weekDay: weekDay,
                    weekNumber: schedule.week_number,
                    dayOfWeek: schedule.day_of_week,
                    classId: classId,
                    courseId: courseId,
                });
            }
        }
    });

    console.log(
        `Found ${pairedCourseGroups.size} paired course groups and ${individualCourses.size} individual courses for exam scheduling`
    );

    // Generate exams for paired course groups
    pairedCourseGroups.forEach((groupSchedules, groupKey) => {
        console.log(`Generating exams for paired group: ${groupKey}`);

        // Find schedules that are ready for exams based on cumulative hours
        const examReadySchedules = groupSchedules.filter((schedule) => schedule.exam_phase_ready);

        if (examReadySchedules.length === 0) {
            console.log(`No exam-ready schedules found for group ${groupKey}`);
            return;
        }

        // Group by exam phase and class
        const phaseGroups = new Map();
        examReadySchedules.forEach((schedule) => {
            const phase = schedule.exam_phase_ready;
            const classId = schedule.class_id?.toString();
            const key = `${phase}-${classId}`;

            if (!phaseGroups.has(key)) {
                phaseGroups.set(key, []);
            }
            phaseGroups.get(key).push(schedule);
        });

        // Generate exam schedules for each phase
        phaseGroups.forEach((schedules, phaseClassKey) => {
            const [phase, classId] = phaseClassKey.split("-");
            const lastSchedule = schedules[schedules.length - 1]; // Use the latest schedule for timing
            const courseId = lastSchedule.course_id.toString();
            const examConfig = examConfigMap.get(courseId);

            if (!examConfig) {
                console.log(`No exam config found for paired course ${courseId}`);
                return;
            }

            // Calculate exam date based on the latest class in this phase
            let examWeek = lastSchedule.week_number;
            let examDay = lastSchedule.day_of_week + examConfig.minDays;

            // Adjust if going beyond weekdays
            while (examDay > 5) {
                examDay -= 5;
                examWeek += 1;
            }

            // Ensure we don't schedule exams beyond the semester
            if (examWeek > totalWeeks) {
                examWeek = totalWeeks;
                examDay = Math.min(examDay, 5);
            }

            // Create exam session for this phase
            const examSession = {
                class_id: classId,
                course_id: courseId,
                week_number: examWeek,
                day_of_week: examDay,
                start_time: "07:30:00",
                end_time: calculateEndTime("07:30:00", examConfig.duration || 2),
                is_practical: false,
                is_exam: true,
                is_self_study: false,
                notes: `Thi giai đoạn ${phase}/${examConfig.phases} (Paired course)`,
                exam_phase: parseInt(phase),
                total_phases: examConfig.phases,
                is_paired_course: true,
                paired_group: groupKey,
                cumulative_hours: lastSchedule.cumulative_hours,
            };

            examSchedules.push(examSession);
            console.log(
                `Generated paired exam: Week ${examWeek}, Day ${examDay}, Phase ${phase}/${examConfig.phases}, Group ${groupKey}`
            );
        });
    });

    // Generate exams for individual courses (existing logic)
    individualCourses.forEach((lastDay, key) => {
        const { weekNumber: lastWeek, dayOfWeek: lastDayOfWeek, classId, courseId } = lastDay;
        const examConfig = examConfigMap.get(courseId);

        if (!examConfig) {
            console.log(`No exam config found for course ${courseId}, skipping exam generation`);
            return;
        }

        console.log(`Generating exams for individual course ${courseId}, class ${classId}`);

        // Determine number of exam phases
        const phases = examConfig.phases || 1;
        const phasesGapDays = 3; // Days between exam phases

        for (let phase = 1; phase <= phases; phase++) {
            // Calculate exam date with appropriate spacing
            const phaseDelay = (phase - 1) * phasesGapDays;

            let examWeek = lastWeek;
            let examDay = lastDayOfWeek + examConfig.minDays + phaseDelay;

            // Adjust if going beyond weekdays
            while (examDay > 5) {
                examDay -= 5;
                examWeek += 1;
            }

            // Ensure we don't schedule exams beyond the semester
            if (examWeek > totalWeeks) {
                console.log(`Exam week ${examWeek} exceeds total weeks ${totalWeeks}, adjusting`);
                examWeek = totalWeeks;
                examDay = Math.min(examDay, 5);
            }

            // Create new exam slot
            const examSession = {
                class_id: classId,
                course_id: courseId,
                week_number: examWeek,
                day_of_week: examDay,
                start_time: "07:30:00",
                end_time: calculateEndTime("07:30:00", examConfig.duration || 2),
                is_practical: false,
                is_exam: true,
                is_self_study: false,
                notes: phases > 1 ? `Thi giai đoạn ${phase}/${phases}` : "Kỳ thi",
                exam_phase: phase,
                total_phases: phases,
            };

            examSchedules.push(examSession);
            console.log(`Generated exam: Week ${examWeek}, Day ${examDay}, Phase ${phase}/${phases}`);
        }
    });

    console.log(
        `Generated ${examSchedules.length} exam sessions (${pairedCourseGroups.size} paired groups + ${individualCourses.size} individual courses)`
    );

    // Combine regular schedules with exam schedules
    return [...processedSchedules, ...examSchedules];
}

// Hàm phụ trợ để tính toán thời gian kết thúc dựa trên thời gian bắt đầu và số giờ
function calculateEndTime(startTime, hours) {
    const [h, m, s] = startTime.split(":").map(Number);
    const startDate = new Date(1970, 0, 1, h, m, s);
    startDate.setHours(startDate.getHours() + hours);
    return `${String(startDate.getHours()).padStart(2, "0")}:${String(startDate.getMinutes()).padStart(
        2,
        "0"
    )}:${String(startDate.getSeconds()).padStart(2, "0")}`;
}

// Hàm so sánh chuỗi tuần-ngày theo định dạng "week-day"
function compareWeekDays(dayA, dayB) {
    const [weekA, dayOfWeekA] = dayA.split("-").map(Number);
    const [weekB, dayOfWeekB] = dayB.split("-").map(Number);

    if (weekA !== weekB) {
        return weekA - weekB;
    }
    return dayOfWeekA - dayOfWeekB;
}

/**
 * Áp dụng tất cả các ràng buộc cho lịch học
 * @param {Array} scheduleDetails - Danh sách chi tiết lịch học
 * @param {Object} options - Các tham số cấu hình
 * @returns {Promise<Array>} - Danh sách chi tiết lịch học đã xử lý
 */
async function applyAllConstraints(scheduleDetails, options = {}) {
    const { events, constraints, departmentId, startDate, practicalCourses, courseExams, coursesData, totalWeeks } =
        options;

    console.log(`Applying constraints to ${scheduleDetails?.length || 0} schedule items`);

    // Áp dụng ràng buộc sự kiện đặc biệt và ngày lễ (bao gồm tạo sự kiện bảo trì)
    const filteredByEvents = await applyEventConstraints(scheduleDetails, events, departmentId, startDate, totalWeeks);
    console.log(`After event constraints: ${filteredByEvents.length} items`);

    // Áp dụng ràng buộc thời gian
    const filteredByTime = applyTimeConstraints(filteredByEvents, constraints, coursesData, totalWeeks);
    console.log(`After time constraints: ${filteredByTime.length} items`); // Áp dụng ràng buộc về tiết thực hành (bao gồm tạo tiết thực hành mới)
    const filteredByPractical = applyPracticalConstraints(filteredByTime, practicalCourses, coursesData, totalWeeks);
    console.log(`After practical constraints: ${filteredByPractical.length} items`);

    // Áp dụng ràng buộc theo handler của từng môn học (bao gồm V30/V31, Q-courses, v.v.)
    const filteredByCourseHandlers = applyCourseHandlerConstraints(filteredByPractical, {
        courseExams,
        coursesData,
        totalWeeks,
        events,
        departmentId,
    });
    console.log(`After course handler constraints: ${filteredByCourseHandlers.length} items`);

    // Áp dụng ràng buộc về kỳ thi (bao gồm tạo kỳ thi mới)
    const finalSchedule = applyExamConstraints(filteredByCourseHandlers, courseExams, totalWeeks);
    console.log(`Final schedule after all constraints: ${finalSchedule.length} items`);

    return finalSchedule;
}

/**
 * Apply course-specific constraints using the modular handler system
 * @param {Array} scheduleDetails - Schedule details array
 * @param {Object} context - Processing context
 * @returns {Array} - Processed schedule details
 */
function applyCourseHandlerConstraints(scheduleDetails, context = {}) {
    if (!Array.isArray(scheduleDetails) || scheduleDetails.length === 0) {
        return scheduleDetails;
    }

    console.log("🎯 Applying course-specific constraints via handlers...");

    // Add course codes to schedules for handler processing
    const enrichedSchedules = scheduleDetails.map((schedule) => {
        // Try to get course code from different possible sources
        let courseCode = schedule.course_code;
        if (!courseCode && schedule.course_id) {
            // If we have course data in context, use it
            const courseData = context.coursesData?.find(
                (c) => c.id === schedule.course_id || c._id === schedule.course_id
            );
            courseCode = courseData?.code;
        }

        return {
            ...schedule,
            course_code: courseCode,
        };
    });

    // Process schedules using registered course handlers
    const processedSchedules = CourseHandlerRegistry.processSchedules(enrichedSchedules, context);

    console.log(`✅ Course handler processing complete. Processed ${processedSchedules.length} schedules`);

    return processedSchedules;
}

/**
 * Legacy function for backward compatibility - now uses course handlers
 * @param {Array} scheduleDetails - Danh sách chi tiết lịch học
 * @param {Array} courseExams - Danh sách cấu hình thi
 * @returns {Array} - Danh sách chi tiết lịch học đã xử lý với paired course logic
 */
async function applyPairedCourseConstraints(scheduleDetails, courseExams = []) {
    console.log("🔗 Legacy paired course constraints - delegating to course handlers...");

    // Use the new modular system
    const context = { courseExams, legacy_mode: true };
    return applyCourseHandlerConstraints(scheduleDetails, context);
}

/**
 * Tính số giờ giữa hai thời điểm
 * @param {string} startTime - Thời gian bắt đầu (HH:MM:SS)
 * @param {string} endTime - Thời gian kết thúc (HH:MM:SS)
 * @returns {number} - Số giờ
 */
function calculateHoursDifference(startTime, endTime) {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return (end - start) / (1000 * 60 * 60); // Convert milliseconds to hours
}

module.exports = {
    getSpecialEventOnDate,
    isFixedHoliday,
    isFlagCeremonyDay,
    applyEventConstraints,
    applyTimeConstraints,
    applyPracticalConstraints,
    applyExamConstraints,
    applyAllConstraints,
    calculateActualDate,
    calculateEndTime,
    applyPairedCourseConstraints,
};

