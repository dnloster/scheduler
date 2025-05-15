/**
 * Script tạo mới và kiểm tra lịch thi
 * Sử dụng để test các cập nhật mới cho hệ thống lịch thi V30/V31
 */

const mongoose = require('mongoose');
const connectDB = require('./database');
const Department = require('./models/Department');
const Course = require('./models/Course');
const CourseConstraint = require('./models/CourseConstraint');
const Schedule = require('./models/Schedule');
const SpecialEvent = require('./models/SpecialEvent');

// Kết nối đến database
connectDB();

async function testAndFixExamSchedules() {
    try {
        console.log('Bắt đầu kiểm tra và sửa lỗi lịch thi...');
        
        // 1. Xác nhận ngày khai giảng đã được cập nhật thành 15-16/9
        const openingCeremony = await SpecialEvent.findOne({
            name: { $regex: /khai giảng/i }
        });
        
        if (openingCeremony) {
            console.log(`Sự kiện khai giảng: ${openingCeremony.name}`);
            console.log(`  Ngày: ${new Date(openingCeremony.date).toLocaleDateString()}`);
            console.log(`  Thời lượng: ${openingCeremony.duration_days} ngày`);
            
            // Kiểm tra nếu ngày khai giảng không phải 15/9 thì cập nhật
            if (new Date(openingCeremony.date).getMonth() !== 8 || 
                new Date(openingCeremony.date).getDate() !== 15) {
                console.log('  Đang cập nhật ngày khai giảng thành 15/9/2025...');
                await SpecialEvent.updateOne(
                    { _id: openingCeremony._id },
                    { 
                        date: new Date('2025-09-15'),
                        duration_days: 2
                    }
                );
                console.log('  Đã cập nhật ngày khai giảng');
            }
        } else {
            console.log('Không tìm thấy sự kiện khai giảng, đang tạo mới...');
            await SpecialEvent.create({
                name: "Khai giảng",
                description: "Khai giảng năm học",
                date: new Date("2025-09-15"),
                duration_days: 2,
                recurring: false,
            });
            console.log('Đã tạo mới sự kiện khai giảng');
        }
        
        // 2. Xác nhận cấu hình thi cho V30/V31
        const v30Course = await Course.findOne({ code: 'V30' });
        const v31Course = await Course.findOne({ code: 'V31' });
        
        if (v30Course && v31Course) {
            console.log(`Khóa học V30: ${v30Course._id}`);
            console.log(`Khóa học V31: ${v31Course._id}`);
            
            // Kiểm tra cấu hình thi V30
            let v30Constraint = await CourseConstraint.findOne({ course: v30Course._id });
            if (v30Constraint) {
                // Cập nhật cấu hình thi nếu chưa có
                if (!v30Constraint.min_days_before_exam || !v30Constraint.exam_duration_hours || !v30Constraint.exam_phases) {
                    console.log('  Cập nhật cấu hình thi cho V30...');
                    await CourseConstraint.updateOne(
                        { _id: v30Constraint._id },
                        {
                            min_days_before_exam: 3,
                            exam_duration_hours: 4,
                            exam_phases: 5,
                            notes: "Môn V30 học song song với V31, có 5 giai đoạn thi"
                        }
                    );
                }
            } else {
                // Tạo mới cấu hình nếu chưa có
                console.log('  Tạo mới cấu hình thi cho V30...');
                await CourseConstraint.create({
                    course: v30Course._id,
                    can_be_morning: true,
                    can_be_afternoon: true,
                    min_days_before_exam: 3,
                    exam_duration_hours: 4,
                    exam_phases: 5,
                    notes: "Môn V30 học song song với V31, có 5 giai đoạn thi"
                });
            }
            
            // Kiểm tra cấu hình thi V31
            let v31Constraint = await CourseConstraint.findOne({ course: v31Course._id });
            if (v31Constraint) {
                // Cập nhật cấu hình thi nếu chưa có
                if (!v31Constraint.min_days_before_exam || !v31Constraint.exam_duration_hours || !v31Constraint.exam_phases) {
                    console.log('  Cập nhật cấu hình thi cho V31...');
                    await CourseConstraint.updateOne(
                        { _id: v31Constraint._id },
                        {
                            min_days_before_exam: 3,
                            exam_duration_hours: 4,
                            exam_phases: 5,
                            notes: "Môn V31 học song song với V30, có 5 giai đoạn thi"
                        }
                    );
                }
            } else {
                // Tạo mới cấu hình nếu chưa có
                console.log('  Tạo mới cấu hình thi cho V31...');
                await CourseConstraint.create({
                    course: v31Course._id,
                    can_be_morning: true,
                    can_be_afternoon: true,
                    min_days_before_exam: 3,
                    exam_duration_hours: 4,
                    exam_phases: 5,
                    notes: "Môn V31 học song song với V30, có 5 giai đoạn thi"
                });
            }
            
            // 3. Xóa và tạo lại lịch thi V30/V31
            console.log('Xóa lịch thi cũ V30/V31...');
            await Schedule.deleteMany({
                $and: [
                    { is_exam: true },
                    {
                        $or: [
                            { course: v30Course._id },
                            { course: v31Course._id }
                        ]
                    }
                ]
            });
                  // Sử dụng lại hàm scheduler để tạo lịch mới
            console.log('Tạo lại lịch thi V30/V31...');
            
            // Gọi scheduler
            const scheduler = require('./scheduler');
            const constraintProcessor = require('./constraint-processor');
            
            // Tạo lịch thi thử nghiệm
            const v30Classes = await Schedule.distinct('class', { course: v30Course._id });
            const v31Classes = await Schedule.distinct('class', { course: v31Course._id });
                  // Lấy các lịch học hiện có để làm cơ sở
            const v30Schedules = await Schedule.find({ 
                course: v30Course._id,
                is_exam: { $ne: true } 
            }).limit(5); // Limit for testing
            const v31Schedules = await Schedule.find({ 
                course: v31Course._id,
                is_exam: { $ne: true } 
            }).limit(5); // Limit for testing
            
            console.log(`Tìm thấy ${v30Schedules.length} lịch học V30 và ${v31Schedules.length} lịch học V31 để lên lịch thi`);
            
            // Lấy cấu hình thi mới
            const v30ConstraintRefreshed = await CourseConstraint.findOne({ course: v30Course._id });
            const v31ConstraintRefreshed = await CourseConstraint.findOne({ course: v31Course._id });
            
            if (v30Schedules.length > 0 && v31Schedules.length > 0) {
                // Chuẩn bị cấu hình thi
                const courseExams = [];
                
                if (v30ConstraintRefreshed) {
                    courseExams.push({
                        id: v30Course._id.toString(),
                        minDaysBeforeExam: v30ConstraintRefreshed.min_days_before_exam,
                        examDuration: v30ConstraintRefreshed.exam_duration_hours,
                        examPhases: v30ConstraintRefreshed.exam_phases || 1
                    });
                }
                
                if (v31ConstraintRefreshed) {
                    courseExams.push({
                        id: v31Course._id.toString(),
                        minDaysBeforeExam: v31ConstraintRefreshed.min_days_before_exam,
                        examDuration: v31ConstraintRefreshed.exam_duration_hours,
                        examPhases: v31ConstraintRefreshed.exam_phases || 1
                    });
                }
                
                console.log(`Đang tạo lịch thi với ${courseExams.length} cấu hình`);
                
                // Áp dụng ràng buộc thi
                const allSchedules = [...v30Schedules, ...v31Schedules];
                const updatedSchedules = await constraintProcessor.applyExamConstraints(allSchedules, courseExams);
                      // Lưu các lịch thi mới
                let savedCount = 0;
                let errorCount = 0;
                for (const schedule of updatedSchedules) {
                    if (schedule.is_exam && !schedule._id) {
                        try {                            const newExamSchedule = new Schedule({
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
                                actual_date: constraintProcessor.calculateActualDate(
                                    schedule.week_number, 
                                    schedule.day_of_week,
                                    "2025-06-09"
                                )
                            });
                            await newExamSchedule.save();
                            savedCount++;
                        } catch (err) {
                            console.error('Lỗi khi lưu lịch thi:', err.message);
                            errorCount++;
                        }
                    }
                }
                
                if (savedCount > 0) {
                    console.log(`✅ Đã lưu thành công ${savedCount} lịch thi mới`);
                } else {
                    console.log('❌ Không có lịch thi mới nào được lưu.');
                }
                
                if (errorCount > 0) {
                    console.log(`⚠️ Có ${errorCount} lỗi khi lưu lịch thi.`);
                }            } else {
                console.log('Không tìm thấy lịch học nào cho V30/V31, tạo lịch cơ bản...');
                
                // Tạo một số lịch học đơn giản để sử dụng làm cơ sở
                const classIds = [
                    "680214164ef589aaed4aba30", 
                    "680214164ef589aaed4aba31"
                ];
                
                const manualSchedules = [];
                
                // Tạo lịch học cơ bản cho V30
                for (let week = 10; week <= 12; week++) {
                    for (let day = 1; day <= 3; day++) {
                        manualSchedules.push(new Schedule({
                            course: v30Course._id,
                            class: classIds[0],
                            day_of_week: day,
                            week_number: week,
                            start_time: "07:30:00",
                            end_time: "09:30:00",
                            is_exam: false,
                            notes: "Giờ học V30",
                            actual_date: constraintProcessor.calculateActualDate(week, day, "2025-06-09")
                        }));
                    }
                }
                
                // Tạo lịch học cơ bản cho V31
                for (let week = 10; week <= 12; week++) {
                    for (let day = 1; day <= 3; day++) {
                        manualSchedules.push(new Schedule({
                            course: v31Course._id,
                            class: classIds[1],
                            day_of_week: day,
                            week_number: week,
                            start_time: "09:30:00",
                            end_time: "11:30:00",
                            is_exam: false,
                            notes: "Giờ học V31",
                            actual_date: constraintProcessor.calculateActualDate(week, day, "2025-06-09")
                        }));
                    }
                }
                
                // Lưu các lịch học cơ bản
                try {
                    for (const schedule of manualSchedules) {
                        await schedule.save();
                    }
                    console.log(`Đã tạo ${manualSchedules.length} lịch học cơ bản`);
                    
                    // Sau khi tạo lịch cơ bản, thử tạo lịch thi với các lịch học mới tạo
                    const baseSchedules = [...manualSchedules];
                    
                    const courseExams = [];
                    
                    if (v30ConstraintRefreshed) {
                        courseExams.push({
                            id: v30Course._id.toString(),
                            minDaysBeforeExam: v30ConstraintRefreshed.min_days_before_exam,
                            examDuration: v30ConstraintRefreshed.exam_duration_hours,
                            examPhases: v30ConstraintRefreshed.exam_phases || 1
                        });
                    }
                    
                    if (v31ConstraintRefreshed) {
                        courseExams.push({
                            id: v31Course._id.toString(),
                            minDaysBeforeExam: v31ConstraintRefreshed.min_days_before_exam,
                            examDuration: v31ConstraintRefreshed.exam_duration_hours,
                            examPhases: v31ConstraintRefreshed.exam_phases || 1
                        });
                    }
                    
                    console.log(`Đang tạo lịch thi với ${courseExams.length} cấu hình`);
                    
                    // Áp dụng ràng buộc thi
                    const updatedSchedules = await constraintProcessor.applyExamConstraints(baseSchedules, courseExams);
                    
                    // Lưu các lịch thi mới
                    let savedCount = 0;
                    let errorCount = 0;
                    for (const schedule of updatedSchedules) {
                        if (schedule.is_exam && !schedule._id) {
                            try {
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
                                    actual_date: constraintProcessor.calculateActualDate(
                                        schedule.week_number, 
                                        schedule.day_of_week,
                                        "2025-06-09"
                                    )
                                });
                                await newExamSchedule.save();
                                savedCount++;
                            } catch (err) {
                                console.error('Lỗi khi lưu lịch thi:', err.message);
                                errorCount++;
                            }
                        }
                    }
                    
                    if (savedCount > 0) {
                        console.log(`✅ Đã lưu thành công ${savedCount} lịch thi mới`);
                    } else {
                        console.log('❌ Không có lịch thi mới nào được lưu.');
                    }
                    
                    if (errorCount > 0) {
                        console.log(`⚠️ Có ${errorCount} lỗi khi lưu lịch thi.`);
                    }
                    
                } catch (error) {
                    console.error('Lỗi khi tạo lịch học cơ bản:', error);
                }
            }
        } else {
            console.log('Không tìm thấy khóa học V30 hoặc V31');
        }
    } catch (error) {
        console.error('Lỗi khi kiểm tra và sửa lỗi lịch thi:', error);
    } finally {
        mongoose.disconnect();
    }
}

testAndFixExamSchedules();
