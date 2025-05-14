/**
 * Debug script to simulate schedule generation with ObjectID validation
 * This script helps identify and fix issues with MongoDB ObjectID handling in the scheduler
 */

// Import MongoDB to directly access the database
const { MongoClient, ObjectId } = require("mongodb");

// Schedule generation simulation
async function simulateScheduleGeneration() {
    // Connection URL and Database Name
    const url = "mongodb://localhost:27017";
    const dbName = "scheduler_db";
    const client = new MongoClient(url);

    try {
        // Connect to MongoDB
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db(dbName);

        // Get collections
        const classesCollection = db.collection("classes");
        const coursesCollection = db.collection("courses");
        const schedulesCollection = db.collection("schedules");

        // Get existing counts
        const classCount = await classesCollection.countDocuments();
        const courseCount = await coursesCollection.countDocuments();
        const initialScheduleCount = await schedulesCollection.countDocuments();

        console.log(`Found ${classCount} classes, ${courseCount} courses, and ${initialScheduleCount} schedules`);

        // Get sample classes and courses
        const classes = await classesCollection.find({}).limit(5).toArray();
        const courses = await coursesCollection.find({}).limit(5).toArray();

        if (classes.length === 0 || courses.length === 0) {
            console.error("No classes or courses found. Cannot proceed with test.");
            return;
        }

        console.log("\nSample class:", {
            _id: classes[0]._id.toString(),
            name: classes[0].name,
            department: classes[0].department ? classes[0].department.toString() : "N/A",
        });

        console.log("\nSample course:", {
            _id: courses[0]._id.toString(),
            code: courses[0].code,
            name: courses[0].name,
        });

        // Create test schedule details
        const testScheduleDetails = [
            {
                class_id: classes[0]._id.toString(),
                course_id: courses[0]._id.toString(),
                day_of_week: 1,
                week_number: 1,
                start_time: "07:30:00",
                end_time: "09:00:00",
                is_practical: false,
                is_exam: false,
                is_self_study: false,
                special_event_id: null,
                notes: "Debug test - MongoDB ObjectID string",
            },
            {
                class_id: classes[1]._id, // ObjectId object
                course_id: courses[1]._id, // ObjectId object
                day_of_week: 2,
                week_number: 1,
                start_time: "09:10:00",
                end_time: "10:40:00",
                is_practical: false,
                is_exam: false,
                is_self_study: false,
                special_event_id: null,
                notes: "Debug test - MongoDB ObjectID object",
            },
        ];

        console.log("\nTest schedule details:", testScheduleDetails);

        // Insert schedule details directly, simulating both string and ObjectId formats
        const insertResults = await schedulesCollection.insertMany(
            testScheduleDetails.map((detail) => ({
                class: toObjectId(detail.class_id),
                course: toObjectId(detail.course_id),
                day_of_week: detail.day_of_week,
                week_number: detail.week_number,
                start_time: detail.start_time,
                end_time: detail.end_time,
                is_practical: detail.is_practical,
                is_exam: detail.is_exam,
                is_self_study: detail.is_self_study,
                special_event: detail.special_event_id ? toObjectId(detail.special_event_id) : null,
                notes: detail.notes,
                created_at: new Date(),
            }))
        );

        console.log(`\nInserted ${insertResults.insertedCount} schedules directly`);

        // Verify the inserted schedules
        const finalScheduleCount = await schedulesCollection.countDocuments();
        console.log(`Schedule count changed from ${initialScheduleCount} to ${finalScheduleCount}`);

        // Query schedules to verify they were saved properly
        const savedSchedules = await schedulesCollection
            .find({
                notes: { $regex: "Debug test" },
            })
            .toArray();

        console.log("\nSaved schedules:");
        savedSchedules.forEach((schedule, i) => {
            console.log(`\nSchedule ${i + 1}:`);
            console.log(`Class: ${schedule.class ? schedule.class.toString() : "MISSING"}`);
            console.log(`Course: ${schedule.course ? schedule.course.toString() : "MISSING"}`);
            console.log(`Day/Week: ${schedule.day_of_week}/${schedule.week_number}`);
            console.log(`Time: ${schedule.start_time} - ${schedule.end_time}`);
            console.log(`Notes: ${schedule.notes}`);
        });

        // Test query with populated references
        console.log("\nTesting reference population:");
        const populatedSchedules = await schedulesCollection
            .aggregate([
                { $match: { notes: { $regex: "Debug test" } } },
                {
                    $lookup: {
                        from: "classes",
                        localField: "class",
                        foreignField: "_id",
                        as: "class_details",
                    },
                },
                {
                    $lookup: {
                        from: "courses",
                        localField: "course",
                        foreignField: "_id",
                        as: "course_details",
                    },
                },
            ])
            .toArray();

        populatedSchedules.forEach((schedule, i) => {
            console.log(`\nPopulated Schedule ${i + 1}:`);
            console.log(`Class: ${schedule.class.toString()}`);
            if (schedule.class_details && schedule.class_details.length > 0) {
                console.log(`Class name: ${schedule.class_details[0].name}`);
            } else {
                console.log("Class reference broken!");
            }

            console.log(`Course: ${schedule.course.toString()}`);
            if (schedule.course_details && schedule.course_details.length > 0) {
                console.log(`Course name: ${schedule.course_details[0].name}`);
            } else {
                console.log("Course reference broken!");
            }
        });
    } finally {
        await client.close();
        console.log("MongoDB connection closed");
    }
}

// Helper to convert string or ObjectId to ObjectId
function toObjectId(id) {
    if (!id) return null;

    try {
        // If already an ObjectId, return it
        if (id instanceof ObjectId) return id;

        // If string, convert to ObjectId
        if (typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id)) {
            return new ObjectId(id);
        }

        console.warn(`Invalid ObjectId format: ${id}`);
        return null;
    } catch (error) {
        console.error(`Error converting to ObjectId: ${error.message}`);
        return null;
    }
}

// Run the simulation
simulateScheduleGeneration()
    .then(() => console.log("\nSimulation completed"))
    .catch((err) => console.error("Simulation error:", err));
