/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

/**
 * Global error handling middleware
 * Catches all errors and sends appropriate responses to the client
 */
function errorHandler(err, req, res, next) {
    console.error('Error occurred:', err);

    // Default error status and message
    let status = 500;
    let message = 'Internal server error';
    let details = err.message;

    // Handle Fabric Gateway specific errors
    if (err.code === 'ECONNREFUSED') {
        status = 503;
        message = 'Service unavailable';
        details = 'Cannot connect to Hyperledger Fabric network. Make sure the network is running.';
    } else if (err.message && err.message.includes('does not exist')) {
        status = 404;
        message = 'Resource not found';
    } else if (err.message && err.message.includes('already exists')) {
        status = 409;
        message = 'Resource already exists';
    } else if (err.details) {
        // gRPC errors from Fabric Gateway
        details = err.details;
    }

    // Send error response
    res.status(status).json({
        success: false,
        error: {
            message,
            details
        }
    });
}

module.exports = errorHandler;
