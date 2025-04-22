import apiClient from "./config";

// Get all constraints
export const getConstraints = async () => {
    try {
        const response = await apiClient.get("/constraints");
        return response.data;
    } catch (error) {
        console.error("Error fetching constraints:", error);
        throw error;
    }
};

// Get a single constraint by ID
export const getConstraintById = async (id) => {
    try {
        const response = await apiClient.get(`/constraints/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching constraint with ID ${id}:`, error);
        throw error;
    }
};

// Get constraints by department ID
export const getConstraintsByDepartment = async (departmentId) => {
    try {
        const response = await apiClient.get(`/constraints/department/${departmentId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching constraints for department ID ${departmentId}:`, error);
        throw error;
    }
};

// Create a new constraint
export const createConstraint = async (constraintData) => {
    try {
        const response = await apiClient.post("/constraints", constraintData);
        return response.data;
    } catch (error) {
        console.error("Error creating constraint:", error);
        throw error;
    }
};

// Update an existing constraint
export const updateConstraint = async (id, constraintData) => {
    try {
        const response = await apiClient.put(`/constraints/${id}`, constraintData);
        return response.data;
    } catch (error) {
        console.error(`Error updating constraint with ID ${id}:`, error);
        throw error;
    }
};

// Delete a constraint
export const deleteConstraint = async (id) => {
    try {
        const response = await apiClient.delete(`/constraints/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting constraint with ID ${id}:`, error);
        throw error;
    }
};
