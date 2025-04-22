import apiClient from "./config";

// Get all events
export const getEvents = async () => {
    try {
        const response = await apiClient.get("/events");
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get event by ID
export const getEventById = async (id) => {
    try {
        const response = await apiClient.get(`/events/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// get event by department id
export const getEventsByDepartmentId = async (departmentId) => {
    try {
        const response = await apiClient.get(`/events/department/${departmentId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Create new event
export const createEvent = async (eventData) => {
    try {
        const response = await apiClient.post("/events", eventData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update event
export const updateEvent = async (id, eventData) => {
    try {
        const response = await apiClient.put(`/events/${id}`, eventData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete event
export const deleteEvent = async (id) => {
    try {
        const response = await apiClient.delete(`/events/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
