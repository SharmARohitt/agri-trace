# AgriTrace: Blockchain-based Supply Chain for Small Farmers

A comprehensive decentralized application built on the Stacks blockchain that ensures transparency, authenticity, and fair compensation across the agricultural supply chain.

## 🌟 Features

- **Farmer Registration & Verification**: Secure on-chain farmer profiles with government/NGO verification
- **Product Batch Tracking**: Immutable tracking from farm to consumer with complete history
- **STX Escrow Payments**: Secure payments that release automatically upon delivery confirmation
- **QR Code Traceability**: Generate QR codes for instant product verification
- **Real-time Dashboard**: Monitor supply chain activities and statistics
- **Mobile-Responsive UI**: Works seamlessly on desktop and mobile devices

## 🏗️ Architecture

### Smart Contracts (Clarity)
- **farmer-registry.clar**: Manages farmer registration and verification
- **product-tracking.clar**: Tracks product batches through supply chain stages
- **payment-escrow.clar**: Handles secure STX payments between buyers and farmers

### Backend (Node.js/Express)
- REST API interfacing with Stacks blockchain
- Hiro API integration for blockchain queries
- QR code generation for product traceability
- Real-time transaction monitoring

### Frontend (Next.js/React)
- Stacks.js wallet integration
- Responsive dashboard with Tailwind CSS
- Real-time blockchain data visualization
- Mobile-compatible interface

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Clarinet CLI
- Stacks Wallet browser extension

### Installation

1. **Clone and setup the project:**
```bash
git clone <repository-url>
cd agri-trace
```

2. **Install Clarinet dependencies:**
```bash
cd agri-trace
npm install
```

3. **Install backend dependencies:**
```bash
cd backend
npm install
```

4. **Install frontend dependencies:**
```bash
cd ../frontend
npm install
```

### Development Setup

1. **Start Clarinet development environment:**
```bash
cd agri-trace
clarinet integrate
```

2. **Run contract tests:**
```bash
npm test
```

3. **Start backend API server:**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

4. **Start frontend development server:**
```bash
cd ../frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📋 Contract Testing

### Run Clarinet Tests
```bash
cd agri-trace
clarinet check  # Check contract syntax
npm test        # Run all tests
```

### Test Individual Contracts
```bash
# Test farmer registry
clarinet test tests/farmer-registry.test.ts

# Test product tracking
clarinet test tests/product-tracking.test.ts

# Test payment escrow
clarinet test tests/payment-escrow.test.ts
```

## 🌐 Testnet Deployment

### 1. Setup Environment
```bash
# Set your deployer private key
export DEPLOYER_PRIVATE_KEY="your-private-key-here"
export STACKS_NETWORK="testnet"
```

### 2. Fund Your Testnet Wallet
Visit the [Stacks Testnet Faucet](https://explorer.stacks.co/sandbox/faucet?chain=testnet) to get test STX.

### 3. Deploy Contracts
```bash
cd agri-trace
node scripts/deploy.js
```

### 4. Update Configuration
After deployment, update your `.env` files with the deployed contract addresses:

```bash
# Backend .env
FARMER_REGISTRY_CONTRACT=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.farmer-registry
PRODUCT_TRACKING_CONTRACT=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.product-tracking
PAYMENT_ESCROW_CONTRACT=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.payment-escrow
```

### 5. Test Deployed Contracts
```bash
export TEST_PRIVATE_KEY="your-test-private-key"
export CONTRACT_ADDRESS="your-deployed-contract-address"
node scripts/test-contracts.js
```

## 📖 API Documentation

### Farmer Endpoints
- `GET /api/farmers/:address` - Get farmer details
- `GET /api/farmers/:address/stats` - Get farmer statistics

### Product Batch Endpoints
- `GET /api/batches/:batchId` - Get batch details
- `GET /api/batches/:batchId/history` - Get batch supply chain history
- `GET /api/batches/:batchId/qr` - Generate QR code for batch

### Escrow Endpoints
- `GET /api/escrows/:escrowId` - Get escrow details

### Utility Endpoints
- `GET /api/transactions/:txId` - Get transaction status
- `GET /api/accounts/:address/balance` - Get account STX balance
- `GET /api/config` - Get network and contract configuration

## 🔄 User Journey Examples

### 1. Farmer Registration
```javascript
// Frontend: Connect wallet and register
const registerFarmer = async () => {
  const txOptions = {
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'farmer-registry',
    functionName: 'register-farmer',
    functionArgs: [
      stringAsciiCV('John Doe'),
      stringAsciiCV('California')
    ]
  };
  
  const transaction = await openContractCall(txOptions);
};
```

### 2. Product Batch Creation
```javascript
// Record new product batch
const recordBatch = async () => {
  const txOptions = {
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'product-tracking',
    functionName: 'record-batch',
    functionArgs: [
      stringAsciiCV('BATCH-001'),
      stringAsciiCV('Organic Tomatoes'),
      uintCV(100), // quantity
      stringAsciiCV('kg'),
      uintCV(500), // price per unit
      stringAsciiCV('A'), // quality grade
      uintCV(Date.now()), // harvest date
      uintCV(Date.now() + 86400000), // expiry date
      stringAsciiCV('Farm Location')
    ]
  };
  
  const transaction = await openContractCall(txOptions);
};
```

### 3. Escrow Payment
```javascript
// Create escrow for purchase
const createEscrow = async () => {
  const txOptions = {
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'payment-escrow',
    functionName: 'create-escrow',
    functionArgs: [
      stringAsciiCV('ESCROW-001'),
      stringAsciiCV('BATCH-001'),
      principalCV('ST1FARMER...'), // farmer address
      uintCV(50000), // amount in microSTX
      uintCV(Math.floor(Date.now() / 1000) + 86400) // deadline
    ]
  };
  
  const transaction = await openContractCall(txOptions);
};
```

## 🔍 Blockchain Verification

All transactions and data can be verified on the Stacks blockchain:

- **Testnet Explorer**: https://explorer.stacks.co/?chain=testnet
- **Mainnet Explorer**: https://explorer.stacks.co/

### Verify Contract Calls
1. Copy transaction ID from the application
2. Paste into Stacks Explorer
3. View transaction details and contract call results

### Verify Contract State
Use read-only functions to verify current state:
```bash
# Check farmer registration
curl -X POST "https://stacks-node-api.testnet.stacks.co/v2/contracts/call-read/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM/farmer-registry/get-farmer" \
  -H "Content-Type: application/json" \
  -d '{"sender":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM","arguments":["\"ST1FARMER...\""]}'
```

## 🛠️ Development Commands

```bash
# Contract development
clarinet check                    # Check contract syntax
clarinet test                     # Run all tests
clarinet console                  # Interactive REPL
clarinet integrate               # Start development environment

# Backend development
npm run dev                      # Start development server
npm test                         # Run API tests
npm start                        # Start production server

# Frontend development
npm run dev                      # Start development server
npm run build                    # Build for production
npm run start                    # Start production server
npm run lint                     # Run ESLint
```

## 🔐 Security Considerations

- **Private Keys**: Never commit private keys to version control
- **Environment Variables**: Use `.env` files for sensitive configuration
- **Input Validation**: All user inputs are validated on-chain
- **Access Control**: Functions have appropriate authorization checks
- **Escrow Safety**: Payments are locked until delivery confirmation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and request features via GitHub Issues
- **Community**: Join the Stacks community for blockchain-specific questions

## 🔗 Resources

- [Clarity Language Guide](https://book.clarity-lang.org)
- [Clarinet Documentation](https://docs.hiro.so/stacks/clarinet)
- [Stacks.js Documentation](https://docs.hiro.so/stacks/stacks.js)
- [Hiro API Documentation](https://docs.hiro.so/stacks)
- [Stacks Blockchain Explorer](https://explorer.stacks.co)

---

Built with ❤️ for transparent and fair agricultural supply chains.