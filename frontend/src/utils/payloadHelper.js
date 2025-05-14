/**
 * Utility functions for handling large payloads in API requests
 */

/**
 * Optimizes a schedule payload to reduce its size
 * @param {Object} scheduleParams - The schedule parameters to optimize
 * @param {number} targetMaxSizeMB - Target maximum size in MB
 * @returns {Object} The optimized schedule parameters
 */
export const optimizeSchedulePayload = (scheduleParams, targetMaxSizeMB = 10) => {
    // Make a deep copy to avoid mutating the original
    const optimizedParams = JSON.parse(JSON.stringify(scheduleParams));

    let currentSize = JSON.stringify(optimizedParams).length / (1024 * 1024);
    console.log(`Initial payload size: ${currentSize.toFixed(2)} MB`);

    if (currentSize <= targetMaxSizeMB) {
        console.log("Payload size is acceptable, no optimization needed");
        return optimizedParams;
    }

    // Optimization strategies in order of preference

    // 1. Remove redundant or optional information
    if (optimizedParams.schedule_details && optimizedParams.schedule_details.length > 0) {
        for (const detail of optimizedParams.schedule_details) {
            // Remove optional fields that can be inferred or reconstructed
            delete detail.is_self_study;

            if (!detail.is_practical) {
                delete detail.is_practical;
            }

            if (!detail.is_exam) {
                delete detail.is_exam;
            }

            if (!detail.special_event_id) {
                delete detail.special_event_id;
            }

            // Replace notes with shorter versions
            if (detail.notes && detail.notes.length > 20) {
                detail.notes = detail.notes.substring(0, 20);
            }
        }
    }

    // Check size after the first optimization
    currentSize = JSON.stringify(optimizedParams).length / (1024 * 1024);
    console.log(`After field optimization: ${currentSize.toFixed(2)} MB`);

    if (currentSize <= targetMaxSizeMB) {
        return optimizedParams;
    }

    // 2. If still too large, limit the number of schedule details
    if (optimizedParams.schedule_details && optimizedParams.schedule_details.length > 5000) {
        const originalCount = optimizedParams.schedule_details.length;
        // Calculate how many entries we should keep to meet the target size
        const targetCount = Math.floor(5000 * (targetMaxSizeMB / currentSize));

        // Limit schedule details but try to maintain a representative sample
        const maxEntries = Math.min(originalCount, Math.max(1000, targetCount));
        optimizedParams.schedule_details = optimizedParams.schedule_details.slice(0, maxEntries);

        console.log(`Reduced schedule details from ${originalCount} to ${maxEntries}`);

        // Add metadata about the limitation
        optimizedParams.payload_limited = true;
        optimizedParams.original_detail_count = originalCount;
    }

    // Final size check
    currentSize = JSON.stringify(optimizedParams).length / (1024 * 1024);
    console.log(`Final optimized payload size: ${currentSize.toFixed(2)} MB`);

    return optimizedParams;
};

/**
 * Checks if a payload is likely to be too large for the server to handle
 * @param {Object} payload - The payload to check
 * @param {number} warningThresholdMB - Size in MB at which to start warning
 * @returns {Object} Status information about the payload size
 */
export const checkPayloadSize = (payload, warningThresholdMB = 5) => {
    const payloadString = JSON.stringify(payload);
    const sizeInBytes = payloadString.length;
    const sizeInMB = sizeInBytes / (1024 * 1024);

    return {
        sizeInBytes,
        sizeInMB,
        isLarge: sizeInMB > warningThresholdMB,
        isDangerous: sizeInMB > 50, // Most APIs have a hard limit around 50-100MB
        formattedSize: sizeInMB >= 1 ? `${sizeInMB.toFixed(2)} MB` : `${(sizeInBytes / 1024).toFixed(2)} KB`,
        recommendation:
            sizeInMB > warningThresholdMB
                ? "Consider optimizing this payload or using batch processing"
                : "Payload size is acceptable",
    };
};

export default {
    optimizeSchedulePayload,
    checkPayloadSize,
};
