import apiClient from "./config";

// Get all schedules with optional filters
export const getSchedules = async (params = {}) => {
    try {
        // Tạo query string từ các tham số
        const queryParams = new URLSearchParams();

        if (params.department_id) {
            queryParams.append("department_id", params.department_id);
        }

        if (params.class_id) {
            queryParams.append("class_id", params.class_id);
        }

        if (params.course_id) {
            queryParams.append("course_id", params.course_id);
        }
        if (params.start_date) {
            // Convert to ISO string if it's a Date object
            const startDate =
                params.start_date instanceof Date ? params.start_date.toISOString().split("T")[0] : params.start_date;
            queryParams.append("start_date", startDate);
        }

        if (params.end_date) {
            // Convert to ISO string if it's a Date object
            const endDate =
                params.end_date instanceof Date ? params.end_date.toISOString().split("T")[0] : params.end_date;
            queryParams.append("end_date", endDate);
        }

        if (params.actual_start_date) {
            // Filter by actual date range (calculated dates)
            const actualStartDate =
                params.actual_start_date instanceof Date
                    ? params.actual_start_date.toISOString().split("T")[0]
                    : params.actual_start_date;
            queryParams.append("actual_start_date", actualStartDate);
        }

        if (params.actual_end_date) {
            const actualEndDate =
                params.actual_end_date instanceof Date
                    ? params.actual_end_date.toISOString().split("T")[0]
                    : params.actual_end_date;
            queryParams.append("actual_end_date", actualEndDate);
        }

        const queryString = queryParams.toString();
        const endpoint = queryString ? `/schedules?${queryString}` : "/schedules";

        const response = await apiClient.get(endpoint);
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
    // Import the logger only when needed to avoid circular dependencies
    const { logApiRequest, logApiResponse, logApiError } = await import("../utils/apiLogger");

    try {
        // Calculate payload size for logging
        const payloadSize = JSON.stringify(generationParams).length / (1024 * 1024);
        console.log(`Sending schedule with payload size: ${payloadSize.toFixed(2)} MB`);

        // Handle large payloads with batch processing if needed
        if (payloadSize > 10 && generationParams.schedule_details && generationParams.schedule_details.length > 1000) {
            console.log("Payload too large, switching to batch processing mode");
            return await batchGenerateSchedule(generationParams);
        }

        // Log the request with our enhanced logger (with reduced size for logging)
        const loggingParams = { ...generationParams };
        if (loggingParams.schedule_details && loggingParams.schedule_details.length > 10) {
            loggingParams.schedule_details = loggingParams.schedule_details.slice(0, 10);
            loggingParams.schedule_details.push({
                note: `... and ${generationParams.schedule_details.length - 10} more items (not logged)`,
            });
        }
        logApiRequest("/schedule/generate", loggingParams);

        // Set higher timeout for large requests
        const timeoutMs = Math.max(30000, Math.min(180000, payloadSize * 10000)); // between 30s and 3min

        // The correct endpoint should NOT have the /api prefix since it's already in the baseURL
        const response = await apiClient.post("/schedule/generate", generationParams, {
            timeout: timeoutMs,
            maxBodyLength: 100 * 1024 * 1024, // 100MB max body size
            maxContentLength: 100 * 1024 * 1024, // 100MB max content size
        });

        // Log the successful response
        logApiResponse("/schedule/generate", response);

        if (!response.data || !response.data.success) {
            console.error("Schedule generation failed but didn't throw an error:", response.data);
            throw new Error(response.data?.message || "Unknown error in schedule generation");
        }

        return response.data;
    } catch (error) {
        // Check specifically for payload size issues
        if (
            error.message &&
            (error.message.includes("Payload Too Large") ||
                error.message.includes("413") ||
                error.message.includes("request entity too large"))
        ) {
            console.log("Detected Payload Too Large error, attempting batch processing");

            // Try batch processing as fallback
            if (generationParams.schedule_details && generationParams.schedule_details.length > 500) {
                return await batchGenerateSchedule(generationParams);
            }
        }

        // Log and process the error with our enhanced logger
        const errorInfo = logApiError("/schedule/generate", error);

        // Add the error details to the error object for better debugging
        error.details = errorInfo.details;
        error.userMessage = errorInfo.message;

        throw error;
    }
};

// Helper function to generate schedules in batches when payload is too large
async function batchGenerateSchedule(generationParams) {
    // Extract schedule details and other parameters
    const { schedule_details, ...baseParams } = generationParams;

    console.log(`Starting batch processing of ${schedule_details.length} schedule entries`);

    // Determine batch size
    const batchSize = 2000; // Adjust based on your API limits
    const batches = [];

    // Split schedule details into batches
    for (let i = 0; i < schedule_details.length; i += batchSize) {
        batches.push(schedule_details.slice(i, i + batchSize));
    }

    console.log(`Split into ${batches.length} batches of up to ${batchSize} entries each`);

    // Process each batch
    let finalResult = null;
    let batchId = 1;
    let totalProcessed = 0;

    for (const batch of batches) {
        console.log(`Processing batch ${batchId}/${batches.length} with ${batch.length} entries`);

        // Create payload for this batch
        const batchParams = {
            ...baseParams,
            schedule_details: batch,
            is_batch_process: true,
            batch_id: batchId,
            total_batches: batches.length,
        };

        try {
            // Send batch to API
            const response = await apiClient.post("/schedule/generate", batchParams, {
                timeout: 60000, // 60 second timeout for each batch
                maxBodyLength: 20 * 1024 * 1024, // 20MB
                maxContentLength: 20 * 1024 * 1024, // 20MB
            });

            // Save the result from the last batch, or merge results if needed
            if (response.data && response.data.success) {
                finalResult = response.data;
                totalProcessed += batch.length;
                console.log(`Batch ${batchId} processed successfully`);
            } else {
                throw new Error(response.data?.message || "Batch processing failed");
            }
        } catch (error) {
            console.error(`Error processing batch ${batchId}:`, error);
            throw new Error(`Failed during batch ${batchId}/${batches.length}: ${error.message}`);
        }

        batchId++;
    }

    console.log(`Batch processing complete. Processed ${totalProcessed} entries in ${batches.length} batches`);

    // Add batch processing info to the final result
    if (finalResult) {
        finalResult.batchProcessing = {
            totalBatches: batches.length,
            totalProcessed: totalProcessed,
        };
    }

    return (
        finalResult || {
            success: false,
            message: "Failed to process schedule batches",
        }
    );
}
