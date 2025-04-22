import apiClient from "./config";

// Get all schedules
export const getSchedules = async () => {
    try {
        const response = await apiClient.get("/schedules");
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get schedules by class ID
export const getSchedulesByClassId = async (classId) => {
    try {
        const response = await apiClient.get(`/schedules?class_id=${classId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get schedules by course ID
export const getSchedulesByCourseId = async (courseId) => {
    try {
        const response = await apiClient.get(`/schedules?course_id=${courseId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Create new schedule
export const createSchedule = async (scheduleData) => {
    try {
        const response = await apiClient.post("/schedules", scheduleData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update schedule
export const updateSchedule = async (id, scheduleData) => {
    try {
        const response = await apiClient.put(`/schedules/${id}`, scheduleData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete schedule
export const deleteSchedule = async (id) => {
    try {
        const response = await apiClient.delete(`/schedules/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Generate schedule based on constraints and parameters
export const generateSchedule = async (generationParams) => {
    try {
        const response = await apiClient.post("/schedule/generate", generationParams);
        return response.data;
    } catch (error) {
        throw error;
    }
};
