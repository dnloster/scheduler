import apiClient from "./config";

// Get all courses
export const getCourses = async () => {
    try {
        const response = await apiClient.get("/courses");
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get course by ID
export const getCourseById = async (id) => {
    try {
        const response = await apiClient.get(`/courses/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getCourseByDepartmentId = async (departmentId) => {
    try {
        const response = await apiClient.get(`/courses/department/${departmentId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Create new course
export const createCourse = async (courseData) => {
    try {
        const response = await apiClient.post("/courses", courseData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update course
export const updateCourse = async (id, courseData) => {
    try {
        const response = await apiClient.put(`/courses/${id}`, courseData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete course
export const deleteCourse = async (id) => {
    try {
        const response = await apiClient.delete(`/courses/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
