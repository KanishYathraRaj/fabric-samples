/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const grpc = require('@grpc/grpc-js');
const { connect, hash, signers } = require('@hyperledger/fabric-gateway');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const config = require('./config');

let gateway = null;
let client = null;
let contract = null;

/**
 * Initialize the Fabric Gateway connection
 */
async function initGateway() {
    console.log('Initializing Fabric Gateway connection...');
    
    try {
        // The gRPC client connection should be shared by all Gateway connections to this endpoint.
        client = await newGrpcConnection();
        console.log('✓ gRPC connection established');

        gateway = connect({
            client,
            identity: await newIdentity(),
            signer: await newSigner(),
            hash: hash.sha256,
            // Default timeouts for different gRPC calls
            evaluateOptions: () => {
                return { deadline: Date.now() + 5000 }; // 5 seconds
            },
            endorseOptions: () => {
                return { deadline: Date.now() + 15000 }; // 15 seconds
            },
            submitOptions: () => {
                return { deadline: Date.now() + 5000 }; // 5 seconds
            },
            commitStatusOptions: () => {
                return { deadline: Date.now() + 60000 }; // 1 minute
            },
        });
        console.log('✓ Gateway connected');

        // Get a network instance representing the channel where the smart contract is deployed.
        const network = gateway.getNetwork(config.channelName);
        console.log(`✓ Network channel '${config.channelName}' acquired`);

        // Get the smart contract from the network.
        contract = network.getContract(config.chaincodeName);
        console.log(`✓ Contract '${config.chaincodeName}' acquired`);
        
        console.log('Fabric Gateway initialization complete!\n');
        
        return contract;
    } catch (error) {
        console.error('Failed to initialize Fabric Gateway:', error);
        throw error;
    }
}

/**
 * Get the contract instance
 */
function getContract() {
    if (!contract) {
        throw new Error('Contract not initialized. Call initGateway() first.');
    }
    return contract;
}

/**
 * Close the gateway connection
 */
function closeGateway() {
    if (gateway) {
        gateway.close();
        console.log('Gateway closed');
    }
    if (client) {
        client.close();
        console.log('gRPC client closed');
    }
}

/**
 * Create a new gRPC connection
 */
async function newGrpcConnection() {
    const tlsRootCert = await fs.readFile(config.tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(config.peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': config.peerHostAlias,
    });
}

/**
 * Create a new identity
 */
async function newIdentity() {
    const certPath = await getFirstDirFileName(config.certDirectoryPath);
    const credentials = await fs.readFile(certPath);
    return { mspId: config.mspId, credentials };
}

/**
 * Get the first file from a directory
 */
async function getFirstDirFileName(dirPath) {
    const files = await fs.readdir(dirPath);
    const file = files[0];
    if (!file) {
        throw new Error(`No files in directory: ${dirPath}`);
    }
    return path.join(dirPath, file);
}

/**
 * Create a new signer
 */
async function newSigner() {
    const keyPath = await getFirstDirFileName(config.keyDirectoryPath);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

module.exports = {
    initGateway,
    getContract,
    closeGateway
};
