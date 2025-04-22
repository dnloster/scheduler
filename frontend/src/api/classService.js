import apiClient from "./config";

// Get all classes
export const getClasses = async () => {
    try {
        const response = await apiClient.get("/classes");
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get class by ID
export const getClassById = async (id) => {
    try {
        const response = await apiClient.get(`/classes/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get classes by department ID
export const getClassesByDepartmentId = async (departmentId) => {
    try {
        const response = await apiClient.get(`/classes/department/${departmentId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Create new class
export const createClass = async (classData) => {
    try {
        const response = await apiClient.post("/classes", classData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update class
export const updateClass = async (id, classData) => {
    try {
        const response = await apiClient.put(`/classes/${id}`, classData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete class
export const deleteClass = async (id) => {
    try {
        const response = await apiClient.delete(`/classes/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
