/**
 * Enhanced API Logger
 *
 * Add this to src/utils/apiLogger.js
 * Use this utility to improve error logging for API calls
 */

/**
 * Log API requests with detailed information
 * @param {string} endpoint - The API endpoint being called
 * @param {Object} data - The data being sent to the API
 */
export const logApiRequest = (endpoint, data) => {
    console.log(`API Request to ${endpoint}:`, {
        timestamp: new Date().toISOString(),
        endpoint,
        data: hideDetailedData(data),
    });
};

/**
 * Log API responses with detailed information
 * @param {string} endpoint - The API endpoint that was called
 * @param {Object} response - The response from the API
 */
export const logApiResponse = (endpoint, response) => {
    console.log(`API Response from ${endpoint}:`, {
        timestamp: new Date().toISOString(),
        endpoint,
        status: response.status,
        ok: response.ok,
        data: response.data,
    });
};

/**
 * Log API errors with detailed information
 * @param {string} endpoint - The API endpoint that was called
 * @param {Error} error - The error that occurred
 */
export const logApiError = (endpoint, error) => {
    const errorDetails = {
        timestamp: new Date().toISOString(),
        endpoint,
        message: error.message,
        stack: error.stack,
    };

    if (error.response) {
        errorDetails.status = error.response.status;
        errorDetails.statusText = error.response.statusText;
        errorDetails.data = error.response.data;
    } else if (error.request) {
        errorDetails.requestInfo = "Request was made but no response was received";
    } else {
        errorDetails.requestInfo = "Error occurred before request could be made";
    }

    console.error(`API Error on ${endpoint}:`, errorDetails);

    // Return a structured error message for UI display
    return {
        message: getReadableErrorMessage(error),
        details: errorDetails,
    };
};

/**
 * Create a user-friendly error message from an API error
 * @param {Error} error - The error object
 * @returns {string} A user-friendly error message
 */
export const getReadableErrorMessage = (error) => {
    if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const message = error.response.data?.error || error.response.data?.message || error.message;

        if (status === 400) {
            return `Invalid request: ${message}`;
        } else if (status === 401) {
            return "Authentication required. Please log in again.";
        } else if (status === 403) {
            return "You do not have permission to perform this action.";
        } else if (status === 404) {
            return `Resource not found: ${message}`;
        } else if (status >= 500) {
            return `Server error (${status}): ${message}`;
        }

        return `Error ${status}: ${message}`;
    } else if (error.request) {
        // No response received
        return "No response received from server. Please check your network connection.";
    } else {
        // Error in setting up request
        return `Request error: ${error.message}`;
    }
};

/**
 * Hide detailed data for logging to avoid clutter
 * @param {Object} data - The data to hide details from
 * @returns {Object} The data with large arrays summarized
 */
const hideDetailedData = (data) => {
    if (!data || typeof data !== "object") return data;

    const result = { ...data };

    // Summarize large arrays
    Object.keys(result).forEach((key) => {
        if (Array.isArray(result[key]) && result[key].length > 5) {
            result[key] = `Array with ${result[key].length} items. First few: ${JSON.stringify(
                result[key].slice(0, 3)
            )}...`;
        }
    });

    return result;
};
