/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// Deterministic JSON.stringify()
const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {

    async InitLedger(ctx) {
        const certificates = [
            {
                certificateId: 'CERT-2025-ORG1-00001',
                learnerID: 'learner001',
                issuer: {
                    issuerID: 'issuer123',
                    issueDate: '2025-11-29T10:30:00Z'
                },
                approver: {
                    approverIds: ['approver77'],
                    approved: ['Issued'],
                    isApproved: true,
                    approvedDate: '2025-11-30T14:00:00Z'
                },
                certificateData: {
                    certificateName: 'National Apprenticeship Certificate',
                    courseName: 'Master of Agriculture',
                    institutionName: 'Skill Institute of Agriculture',
                    NSQFLevel: 'Level 4'
                },
                status: 'Issued',
                url: 'https://example.com/certificates/CERT-2025-ORG1-00001'
            },
            {
                certificateId: 'CERT-2025-ORG1-00002',
                learnerID: 'learner002',
                issuer: {
                    issuerID: 'issuer456',
                    issueDate: '2025-12-01T09:00:00Z'
                },
                approver: {
                    approverIds: ['approver88'],
                    approved: ['Pending'],
                    isApproved: false,
                    approvedDate: null
                },
                certificateData: {
                    certificateName: 'Software Development Certificate',
                    courseName: 'Full Stack Development',
                    institutionName: 'Tech Academy',
                    NSQFLevel: 'Level 5'
                },
                status: 'Pending',
                url: 'https://example.com/certificates/CERT-2025-ORG1-00002'
            },
            {
                certificateId: 'CERT-2025-ORG1-00003',
                learnerID: 'learner003',
                issuer: {
                    issuerID: 'issuer789',
                    issueDate: '2025-12-02T11:15:00Z'
                },
                approver: {
                    approverIds: ['approver77', 'approver88'],
                    approved: ['Approved', 'Approved'],
                    isApproved: true,
                    approvedDate: '2025-12-02T12:00:00Z'
                },
                certificateData: {
                    certificateName: 'Professional Data Science Certificate',
                    courseName: 'Machine Learning and AI',
                    institutionName: 'Data Science Institute',
                    NSQFLevel: 'Level 6',
                    duration: '12 months',
                    grade: 'A+'
                },
                status: 'Issued',
                url: 'https://example.com/certificates/CERT-2025-ORG1-00003'
            }
        ];

        for (const certificate of certificates) {
            certificate.docType = 'certificate';
            // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
            await ctx.stub.putState(certificate.certificateId, Buffer.from(stringify(sortKeysRecursive(certificate))));
            console.info(`Certificate ${certificate.certificateId} initialized`);
        }
    }

    // CreateAsset creates a new certificate in the world state.
    // Accepts a JSON string containing the full certificate structure
    async CreateAsset(ctx, certificateJson) {
        const certificate = JSON.parse(certificateJson);
        
        // Validate required field
        if (!certificate.certificateId) {
            throw new Error('certificateId is required');
        }
        
        const exists = await this.AssetExists(ctx, certificate.certificateId);
        if (exists) {
            throw new Error(`The certificate ${certificate.certificateId} already exists`);
        }

        // Add docType for querying
        // certificate.docType = 'certificate';
        
        // Set default status if not provided
        // if (!certificate.status) {
        //     certificate.status = 'Pending';
        // }
        
        // Set default approver if not provided
        // if (!certificate.approver) {
        //     certificate.approver = {
        //         approverIds: [],
        //         approved: [],
        //         isApproved: false,
        //         approvedDate: null
        //     };
        // }
        
        // Store certificate with deterministic JSON
        await ctx.stub.putState(certificate.certificateId, Buffer.from(stringify(sortKeysRecursive(certificate))));
        console.info(`Certificate ${certificate.certificateId} created`);
        return JSON.stringify(certificate);
    }

    // ReadAsset returns the certificate stored in the world state with given id.
    async ReadAsset(ctx, id) {
        const assetJSON = await ctx.stub.getState(id); // get the certificate from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The certificate ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdateAsset updates an existing certificate in the world state.
    // Accepts a JSON string containing the updated certificate structure
    async UpdateAsset(ctx, certificateJson) {
        const certificate = JSON.parse(certificateJson);
        
        if (!certificate.certificateId) {
            throw new Error('certificateId is required');
        }
        
        const exists = await this.AssetExists(ctx, certificate.certificateId);
        if (!exists) {
            throw new Error(`The certificate ${certificate.certificateId} does not exist`);
        }

        // Store updated certificate with deterministic JSON
        await ctx.stub.putState(certificate.certificateId, Buffer.from(stringify(sortKeysRecursive(certificate))));
        console.info(`Certificate ${certificate.certificateId} updated`);
        return JSON.stringify(certificate);
    }

    // DeleteAsset deletes a given certificate from the world state.
    async DeleteAsset(ctx, id) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The certificate ${id} does not exist`);
        }
        console.info(`Certificate ${id} deleted`);
        return ctx.stub.deleteState(id);
    }

    // AssetExists returns true when certificate with given ID exists in world state.
    async AssetExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferAsset updates the learnerID of a certificate (transfer to new learner)
    async TransferAsset(ctx, id, newLearnerID) {
        const certificateString = await this.ReadAsset(ctx, id);
        const certificate = JSON.parse(certificateString);
        const oldLearnerID = certificate.learnerID;
        certificate.learnerID = newLearnerID;
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(certificate))));
        console.info(`Certificate ${id} transferred from ${oldLearnerID} to ${newLearnerID}`);
        return oldLearnerID;
    }

    // GetAllAssets returns all assets found in the world state.
    async GetAllAssets(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = AssetTransfer;
