/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const assetRoutes = require('./routes/assets');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(morgan('dev')); // HTTP request logger

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/assets', assetRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Hyperledger Fabric Asset Transfer API',
        version: '1.0.0',
        endpoints: {
            health: 'GET /health',
            initLedger: 'POST /api/assets/init',
            getAllAssets: 'GET /api/assets',
            getAssetById: 'GET /api/assets/:id',
            createAsset: 'POST /api/assets',
            updateAsset: 'PUT /api/assets/:id',
            deleteAsset: 'DELETE /api/assets/:id',
            transferAsset: 'POST /api/assets/:id/transfer'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: 'Route not found',
            details: `Cannot ${req.method} ${req.url}`
        }
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
