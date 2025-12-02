/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const express = require('express');
const router = express.Router();
const { getContract } = require('../fabric');

const utf8Decoder = new TextDecoder();

/**
 * @route   POST /api/assets/init
 * @desc    Initialize ledger with sample assets
 * @access  Public
 */
router.post('/init', async (req, res, next) => {
    try {
        console.log('\n--> Submit Transaction: InitLedger');
        
        const contract = getContract();
        await contract.submitTransaction('InitLedger');
        
        console.log('*** Transaction committed successfully');
        
        res.status(200).json({
            success: true,
            message: 'Ledger initialized with sample assets'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/assets
 * @desc    Get all assets
 * @access  Public
 */
router.get('/', async (req, res, next) => {
    try {
        console.log('\n--> Evaluate Transaction: GetAllAssets');
        
        const contract = getContract();
        const resultBytes = await contract.evaluateTransaction('GetAllAssets');
        
        const resultJson = utf8Decoder.decode(resultBytes);
        const result = JSON.parse(resultJson);
        
        console.log(`*** Result: Found ${result.length} assets`);
        
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/assets/:id
 * @desc    Get asset by ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log(`\n--> Evaluate Transaction: ReadAsset, ID: ${id}`);
        
        const contract = getContract();
        const resultBytes = await contract.evaluateTransaction('ReadAsset', id);
        
        const resultJson = utf8Decoder.decode(resultBytes);
        const result = JSON.parse(resultJson);
        
        console.log('*** Result:', result);
        
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/assets
 * @desc    Create a new certificate
 * @access  Public
 * @body    Full certificate object with nested structure
 */
router.post('/', async (req, res, next) => {
    try {
        // Accept the full certificate object from request body
        const certificate = req.body;
        
        // Validate required field
        if (!certificate.certificateId) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Missing required field',
                    details: 'Required field: certificateId'
                }
            });
        }
        
        console.log(`\n--> Submit Transaction: CreateAsset (Certificate), ID: ${certificate.certificateId}`);
        
        const contract = getContract();
        
        // Send the entire certificate object as JSON string
        const resultBytes = await contract.submitTransaction(
            'CreateAsset',
            JSON.stringify(certificate)
        );
        
        console.log('*** Transaction committed successfully');
        
        const result = JSON.parse(utf8Decoder.decode(resultBytes));
        
        res.status(201).json({
            success: true,
            message: 'Certificate created successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/assets/:id
 * @desc    Update an existing certificate
 * @access  Public
 * @body    Full certificate object with nested structure
 */
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const certificate = req.body;
        
        // Ensure the ID in params matches the certificate
        if (!certificate.certificateId) {
            certificate.certificateId = id;
        } else if (certificate.certificateId !== id) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'ID mismatch',
                    details: 'certificateId in body must match URL parameter'
                }
            });
        }
        
        console.log(`\n--> Submit Transaction: UpdateAsset (Certificate), ID: ${id}`);
        
        const contract = getContract();
        const resultBytes = await contract.submitTransaction(
            'UpdateAsset',
            JSON.stringify(certificate)
        );
        
        console.log('*** Transaction committed successfully');
        
        const result = JSON.parse(utf8Decoder.decode(resultBytes));
        
        res.status(200).json({
            success: true,
            message: 'Certificate updated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/assets/:id
 * @desc    Delete an asset
 * @access  Public
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log(`\n--> Submit Transaction: DeleteAsset, ID: ${id}`);
        
        const contract = getContract();
        await contract.submitTransaction('DeleteAsset', id);
        
        console.log('*** Transaction committed successfully');
        
        res.status(200).json({
            success: true,
            message: 'Asset deleted successfully',
            data: { id }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/assets/:id/transfer
 * @desc    Transfer certificate to a new learner
 * @access  Public
 * @body    { newLearnerID }
 */
router.post('/:id/transfer', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { newLearnerID } = req.body;
        
        // Validate required fields
        if (!newLearnerID) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Missing required field',
                    details: 'Required field: newLearnerID'
                }
            });
        }
        
        console.log(`\n--> Submit Transaction: TransferAsset (Certificate), ID: ${id}, New Learner: ${newLearnerID}`);
        
        const contract = getContract();
        const resultBytes = await contract.submitTransaction('TransferAsset', id, newLearnerID);
        
        const oldLearnerID = utf8Decoder.decode(resultBytes);
        
        console.log(`*** Transaction committed successfully: ${oldLearnerID} -> ${newLearnerID}`);
        
        res.status(200).json({
            success: true,
            message: 'Certificate transferred successfully',
            data: {
                certificateId: id,
                oldLearnerID,
                newLearnerID
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
