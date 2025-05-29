import apiClient from "./config";

// Get course handler information for a specific course
export const getCourseHandler = async (courseId) => {
    try {
        const response = await apiClient.get(`/courses/${courseId}/handler`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get all available course handlers
export const getAvailableCourseHandlers = async () => {
    try {
        const response = await apiClient.get("/course-handlers");
        return response.data;
    } catch (error) {
        throw error;
    }
};
