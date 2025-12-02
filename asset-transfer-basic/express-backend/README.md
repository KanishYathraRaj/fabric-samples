# Hyperledger Fabric Asset Transfer - Express Backend

A modern Express.js REST API backend for interacting with the Hyperledger Fabric Asset Transfer chaincode.

## Features

- ✅ RESTful API for all chaincode functions
- ✅ Fabric Gateway SDK integration
- ✅ Environment-based configuration
- ✅ Comprehensive error handling
- ✅ CORS support
- ✅ Request logging
- ✅ Input validation
- ✅ Graceful shutdown

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Hyperledger Fabric test network** running
3. **Asset-transfer-basic chaincode** deployed

## Installation

```bash
# Navigate to the express-backend directory
cd fabric-samples/asset-transfer-basic/express-backend

# Install dependencies
npm install

# Copy the example environment file
cp .env.example .env
```

## Configuration

Edit the `.env` file to match your Fabric network configuration. The default values work with the standard Fabric test-network setup.

```env
PORT=3000
CHANNEL_NAME=mychannel
CHAINCODE_NAME=basic
MSP_ID=Org1MSP
PEER_ENDPOINT=localhost:7051
PEER_HOST_ALIAS=peer0.org1.example.com
CRYPTO_PATH=../../test-network/organizations/peerOrganizations/org1.example.com
```

## Running the Server

### Start Fabric Test Network

First, ensure the Fabric test network is running with the chaincode deployed:

```bash
cd fabric-samples/test-network

# Start the network
./network.sh up createChannel -c mychannel -ca

# Deploy the chaincode
./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-javascript -ccl javascript
```

### Start the Express Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check

```bash
GET /health
```

### Initialize Ledger

Initialize the ledger with sample assets.

```bash
POST /api/assets/init
```

### Get All Assets

Retrieve all assets from the ledger.

```bash
GET /api/assets
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ID": "asset1",
      "Color": "blue",
      "Size": 5,
      "Owner": "Tomoko",
      "AppraisedValue": 300
    }
  ]
}
```

### Get Asset by ID

Retrieve a specific asset by ID.

```bash
GET /api/assets/:id
```

**Example:**
```bash
curl http://localhost:3000/api/assets/asset1
```

### Create Asset

Create a new asset.

```bash
POST /api/assets
Content-Type: application/json

{
  "id": "asset100",
  "color": "purple",
  "size": 20,
  "owner": "Alice",
  "appraisedValue": 1000
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/assets \
  -H "Content-Type: application/json" \
  -d '{"id":"asset100","color":"purple","size":20,"owner":"Alice","appraisedValue":1000}'
```

### Update Asset

Update an existing asset.

```bash
PUT /api/assets/:id
Content-Type: application/json

{
  "color": "pink",
  "size": 25,
  "owner": "Bob",
  "appraisedValue": 1200
}
```

**Example:**
```bash
curl -X PUT http://localhost:3000/api/assets/asset100 \
  -H "Content-Type: application/json" \
  -d '{"color":"pink","size":25,"owner":"Bob","appraisedValue":1200}'
```

### Transfer Asset

Transfer an asset to a new owner.

```bash
POST /api/assets/:id/transfer
Content-Type: application/json

{
  "newOwner": "Charlie"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/assets/asset100/transfer \
  -H "Content-Type: application/json" \
  -d '{"newOwner":"Charlie"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Asset transferred successfully",
  "data": {
    "id": "asset100",
    "oldOwner": "Bob",
    "newOwner": "Charlie"
  }
}
```

### Delete Asset

Delete an asset from the ledger.

```bash
DELETE /api/assets/:id
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/assets/asset100
```

## Error Handling

All errors are returned in a consistent format:

```json
{
  "success": false,
  "error": {
    "message": "Resource not found",
    "details": "The asset asset999 does not exist"
  }
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `409` - Conflict (resource already exists)
- `500` - Internal Server Error
- `503` - Service Unavailable (Fabric network not reachable)

## Project Structure

```
express-backend/
├── src/
│   ├── app.js                    # Express app configuration
│   ├── server.js                 # Server entry point
│   ├── config.js                 # Configuration management
│   ├── fabric.js                 # Fabric Gateway connection
│   ├── middleware/
│   │   └── errorHandler.js       # Global error handler
│   └── routes/
│       └── assets.js             # Asset API routes
├── .env.example                  # Example environment config
├── .gitignore                    # Git ignore file
├── package.json                  # Node.js dependencies
└── README.md                     # This file
```

## Development

### Adding New Endpoints

1. Add the chaincode function to `src/routes/assets.js`
2. Follow the existing pattern for error handling and validation
3. Update this README with the new endpoint documentation

### Debugging

The server uses `morgan` for HTTP request logging. All requests and errors are logged to the console.

Set the logging level in `src/app.js`:
```javascript
app.use(morgan('dev')); // Options: 'dev', 'combined', 'common', 'short', 'tiny'
```

## Troubleshooting

### Error: Cannot connect to Hyperledger Fabric network

**Solution:** Make sure the Fabric test network is running:
```bash
cd fabric-samples/test-network
./network.sh up createChannel -c mychannel -ca
```

### Error: Chaincode not found

**Solution:** Deploy the chaincode:
```bash
cd fabric-samples/test-network
./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-javascript -ccl javascript
```

### Error: No files in directory (keystore/signcerts)

**Solution:** Ensure you're using the correct crypto path. The default configuration expects the test-network crypto materials at:
```
fabric-samples/test-network/organizations/peerOrganizations/org1.example.com
```

### Port already in use

**Solution:** Change the PORT in your `.env` file or kill the process using port 3000:

**Windows:**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -ti:3000 | xargs kill
```

## License

Apache-2.0

## Contributing

Feel free to submit issues and enhancement requests!
