import apiClient from "./config";

// Get all departments
export const getDepartments = async () => {
    try {
        const response = await apiClient.get("/departments");
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get department by ID
export const getDepartmentById = async (_id) => {
    try {
        const response = await apiClient.get(`/departments/${_id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Create new department
export const createDepartment = async (departmentData) => {
    try {
        const response = await apiClient.post("/departments", departmentData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update department
export const updateDepartment = async (id, departmentData) => {
    try {
        const response = await apiClient.put(`/departments/${id}`, departmentData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete department
export const deleteDepartment = async (id) => {
    try {
        const response = await apiClient.delete(`/departments/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
