/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const app = require('./app');
const { initGateway, closeGateway } = require('./fabric');
const config = require('./config');

/**
 * Start the Express server
 */
async function startServer() {
    try {
        // Initialize Fabric Gateway connection
        console.log('='.repeat(60));
        console.log('Starting Hyperledger Fabric Asset Transfer API Server');
        console.log('='.repeat(60));
        
        console.log('\nConfiguration:');
        console.log(`  Channel Name:      ${config.channelName}`);
        console.log(`  Chaincode Name:    ${config.chaincodeName}`);
        console.log(`  MSP ID:            ${config.mspId}`);
        console.log(`  Peer Endpoint:     ${config.peerEndpoint}`);
        console.log(`  Crypto Path:       ${config.cryptoPath}`);
        console.log(`  Server Port:       ${config.PORT}`);
        console.log();
        
        await initGateway();
        
        // Start Express server
        const server = app.listen(config.PORT, () => {
            console.log('='.repeat(60));
            console.log(`🚀 Server is running on http://localhost:${config.PORT}`);
            console.log('='.repeat(60));
            console.log('\nAvailable endpoints:');
            console.log(`  GET    http://localhost:${config.PORT}/`);
            console.log(`  GET    http://localhost:${config.PORT}/health`);
            console.log(`  POST   http://localhost:${config.PORT}/api/assets/init`);
            console.log(`  GET    http://localhost:${config.PORT}/api/assets`);
            console.log(`  GET    http://localhost:${config.PORT}/api/assets/:id`);
            console.log(`  POST   http://localhost:${config.PORT}/api/assets`);
            console.log(`  PUT    http://localhost:${config.PORT}/api/assets/:id`);
            console.log(`  DELETE http://localhost:${config.PORT}/api/assets/:id`);
            console.log(`  POST   http://localhost:${config.PORT}/api/assets/:id/transfer`);
            console.log('\n' + '='.repeat(60) + '\n');
        });

        // Graceful shutdown
        const gracefulShutdown = async () => {
            console.log('\n\nShutting down gracefully...');
            
            server.close(() => {
                console.log('HTTP server closed');
            });
            
            closeGateway();
            
            process.exit(0);
        };

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
        
    } catch (error) {
        console.error('\n❌ Failed to start server:', error);
        console.error('\nMake sure:');
        console.error('  1. Hyperledger Fabric test network is running');
        console.error('  2. Chaincode is deployed');
        console.error('  3. Crypto materials are in the correct location');
        console.error('  4. Configuration in .env file is correct\n');
        process.exit(1);
    }
}

// Start the server
startServer();
