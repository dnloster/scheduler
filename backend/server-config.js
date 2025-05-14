/**
 * Server configuration for handling large payloads and batch processing
 */

const serverConfig = {
    // Express body parser limits
    bodyParserLimits: {
        json: {
            limit: "50mb", // Increase JSON body size limit
        },
        urlencoded: {
            limit: "50mb", // Increase URL-encoded data limit
            extended: true,
        },
    },

    // MongoDB configuration
    mongodb: {
        // Increase MongoDB connection options to handle larger documents
        connectionOptions: {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        },
    },

    // Request timeouts
    timeouts: {
        // Default timeout for regular requests (in milliseconds)
        default: 30000, // 30 seconds

        // Extended timeout for large operations (in milliseconds)
        extended: 120000, // 2 minutes
    },

    // Batch processing configuration
    batchProcessing: {
        maxBatchSize: 5000, // Maximum items per batch
        concurrentBatches: 1, // How many batches to process at once
    },
};

module.exports = serverConfig;
