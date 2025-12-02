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
 * @desc    Create a new asset
 * @access  Public
 * @body    { id, color, size, owner, appraisedValue }
 */
router.post('/', async (req, res, next) => {
    try {
        const { id, color, size, owner, appraisedValue } = req.body;
        
        // Validate required fields
        if (!id || !color || !size || !owner || !appraisedValue) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Missing required fields',
                    details: 'Required fields: id, color, size, owner, appraisedValue'
                }
            });
        }
        
        console.log(`\n--> Submit Transaction: CreateAsset, ID: ${id}`);
        
        const contract = getContract();
        await contract.submitTransaction(
            'CreateAsset',
            id,
            color,
            String(size),
            owner,
            String(appraisedValue)
        );
        
        console.log('*** Transaction committed successfully');
        
        res.status(201).json({
            success: true,
            message: 'Asset created successfully',
            data: { id, color, size, owner, appraisedValue }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/assets/:id
 * @desc    Update an existing asset
 * @access  Public
 * @body    { color, size, owner, appraisedValue }
 */
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { color, size, owner, appraisedValue } = req.body;
        
        // Validate required fields
        if (!color || !size || !owner || !appraisedValue) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Missing required fields',
                    details: 'Required fields: color, size, owner, appraisedValue'
                }
            });
        }
        
        console.log(`\n--> Submit Transaction: UpdateAsset, ID: ${id}`);
        
        const contract = getContract();
        await contract.submitTransaction(
            'UpdateAsset',
            id,
            color,
            String(size),
            owner,
            String(appraisedValue)
        );
        
        console.log('*** Transaction committed successfully');
        
        res.status(200).json({
            success: true,
            message: 'Asset updated successfully',
            data: { id, color, size, owner, appraisedValue }
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
 * @desc    Transfer asset to a new owner
 * @access  Public
 * @body    { newOwner }
 */
router.post('/:id/transfer', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { newOwner } = req.body;
        
        // Validate required fields
        if (!newOwner) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Missing required field',
                    details: 'Required field: newOwner'
                }
            });
        }
        
        console.log(`\n--> Submit Transaction: TransferAsset, ID: ${id}, New Owner: ${newOwner}`);
        
        const contract = getContract();
        const resultBytes = await contract.submitTransaction('TransferAsset', id, newOwner);
        
        const oldOwner = utf8Decoder.decode(resultBytes);
        
        console.log(`*** Transaction committed successfully: ${oldOwner} -> ${newOwner}`);
        
        res.status(200).json({
            success: true,
            message: 'Asset transferred successfully',
            data: {
                id,
                oldOwner,
                newOwner
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
