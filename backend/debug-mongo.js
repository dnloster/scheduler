/**
 * MongoDB Debug Helper
 * 
 * Run this script with: node debug-mongo.js
 * It will attempt to connect to your MongoDB and verify it can access your collections
 */
const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./database');

// Models
const Schedule = require('./models/Schedule');
const Class = require('./models/Class');
const Course = require('./models/Course');
const Department = require('./models/Department');

// Connect to MongoDB
const init = async () => {
  await connectDB();
  console.log('Connected to MongoDB');

  // Test collection access  try {
    const scheduleCount = await Schedule.countDocuments();
    console.log(`Schedule collection has ${scheduleCount} documents`);
    
    const classCount = await Class.countDocuments();
    console.log(`Class collection has ${classCount} documents`);
    
    const courseCount = await Course.countDocuments();
    console.log(`Course collection has ${courseCount} documents`);
    
    const departmentCount = await Department.countDocuments();
    console.log(`Department collection has ${departmentCount} documents`);

    // Check the most recent schedules
    if (scheduleCount > 0) {
      const recentSchedules = await Schedule.find()
        .sort({ created_at: -1 })
        .limit(5)
        .populate('class', 'name')
        .populate('course', 'code name');
      
      console.log(`Recent schedules (${recentSchedules.length}):`);
      recentSchedules.forEach((schedule, i) => {
        console.log(`Schedule ${i+1}:`, {
          _id: schedule._id,
          class: schedule.class ? `${schedule.class._id} (${schedule.class.name})` : 'missing',
          course: schedule.course ? `${schedule.course._id} (${schedule.course.name})` : 'missing',
          day: schedule.day_of_week,
          week: schedule.week_number,
          time: `${schedule.start_time} - ${schedule.end_time}`,
          notes: schedule.notes,
          created: schedule.created_at
        });
      });
    }

    // If we have classes and courses, check a sample
    if (classCount > 0) {
      const sampleClass = await Class.findOne();
      console.log('Sample class:', sampleClass);
    }
    
    if (courseCount > 0) {
      const sampleCourse = await Course.findOne();
      console.log('Sample course:', sampleCourse);
    }
    
  } catch (error) {
    console.error('Error testing MongoDB collections:', error);
  }
  
  process.exit(0);
};

init();
