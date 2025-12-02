# Certificate Structure - Quick Start

## ✅ What's Been Updated

### 1. **Chaincode** (`chaincode-javascript/lib/assetTransfer.js`)
- `InitLedger`: Creates 3 sample certificates with full nested structure
- `CreateAsset`: Accepts certificate JSON object, validates certificateId, sets defaults

### 2. **Application Gateway** (`application-gateway-javascript/src/app.js`)
- `createAsset`: Demonstrates creating certificates with nested issuer, approver, certificateData

### 3. **Express Backend** (`express-backend/src/routes/assets.js`)
- POST `/api/assets`: Accepts full certificate structure, sends as JSON to chaincode

---

## 🚀 How to Use

### 1. Deploy Updated Chaincode

```bash
cd fabric-samples/test-network
./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-javascript -ccl javascript
```

### 2. Test with Application Gateway (Optional)

```bash
cd ../asset-transfer-basic/application-gateway-javascript
npm start
```

### 3. Start Express Backend

```bash
cd ../express-backend
npm run dev
```

### 4. Create a Certificate via API

```bash
curl -X POST http://localhost:3000/api/assets \
  -H "Content-Type: application/json" \
  -d '{
    "certificateId": "CERT-2025-TEST-001",
    "learnerID": "learner123",
    "issuer": {
      "issuerID": "issuer456",
      "issueDate": "2025-12-02T12:00:00Z"
    },
    "approver": {
      "approverIds": ["approver77"],
      "approved": ["Pending"],
      "isApproved": false,
      "approvedDate": null
    },
    "certificateData": {
      "certificateName": "Web Development Cert",
      "courseName": "Full Stack MERN",
      "institutionName": "Code Academy",
      "NSQFLevel": "Level 5"
    },
    "status": "Pending",
    "url": "https://example.com/cert/CERT-2025-TEST-001"
  }'
```

### 5. Get All Certificates

```bash
curl http://localhost:3000/api/assets
```

### 6. Get Specific Certificate

```bash
curl http://localhost:3000/api/assets/CERT-2025-TEST-001
```

---

## 📝 Certificate Structure

```javascript
{
  "certificateId": "CERT-2025-ORG1-00001",   // Required
  "learnerID": "learner123",
  "issuer": {
    "issuerID": "issuer123",
    "issueDate": "2025-11-29T10:30:00Z"
  },
  "approver": {
    "approverIds": ["approver77", "approver88"],  // Array
    "approved": ["Pending", "Approved"],          // Status history
    "isApproved": false,                          // Boolean
    "approvedDate": null                          // ISO date or null
  },
  "certificateData": {                          // Field-agnostic!
    // Any fields you want - examples:
    "certificateName": "...",
    "courseName": "...",
    "institutionName": "...",
    "NSQFLevel": "Level 4",
    "duration": "6 months",  // Optional
    "grade": "A+",           // Optional
    // ... add any other fields
  },
  "status": "Pending",  // Pending, Issued, Approved, Rejected, etc.
  "url": "https://..."
}
```

---

## 🎯 Key Features

- ✅ **certificateId** is the only required field
- ✅ **certificateData** is field-agnostic (accepts any structure)
- ✅ Nested objects (issuer, approver) fully supported
- ✅ Defaults set automatically: status="Pending", empty approver object
- ✅ All existing endpoints (GET, PUT, DELETE, Transfer) work with certificates
- ✅ 3 sample certificates created by InitLedger

---

## 📌 Next Steps

All three layers are now working with certificate structure:
1. ✅ Chaincode accepts and stores certificates
2. ✅ Application-gateway demonstrates usage
3. ✅ Express backend provides REST API

You can now:
- Create certificates with complex nested structures
- Use any fields in certificateData
- Build your certificate management system on top of this foundation
