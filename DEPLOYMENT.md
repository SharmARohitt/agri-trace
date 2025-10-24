# AgriTrace Deployment Guide

This guide provides step-by-step instructions for deploying the AgriTrace dApp to the Stacks testnet and mainnet.

## Prerequisites

1. **Node.js 18+** installed
2. **Clarinet CLI** installed
3. **Stacks Wallet** browser extension
4. **Testnet STX** for deployment fees

## Installation

### 1. Install Clarinet

```bash
# macOS/Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install clarinet-cli

# Windows
# Download from: https://github.com/hirosystems/clarinet/releases
```

### 2. Clone and Setup Project

```bash
git clone <repository-url>
cd agri-trace
npm run install:all
```

### 3. Environment Configuration

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Edit the `.env` files with your configuration:

```bash
# Root .env
DEPLOYER_PRIVATE_KEY=your-private-key-here
STACKS_NETWORK=testnet

# Backend .env
STACKS_NETWORK=testnet
STACKS_API_URL=https://stacks-node-api.testnet.stacks.co
PORT=3001

# Frontend .env.local
NEXT_PUBLIC_STACKS_NETWORK=testnet
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Development Workflow

### 1. Contract Development

```bash
# Check contract syntax
npm run check

# Run tests
npm test

# Start interactive console
npm run console

# Start development environment
npm run integrate
```

### 2. Local Testing

```bash
# Test all contracts
clarinet test

# Test specific contract
clarinet test tests/farmer-registry.test.ts

# Check contract coverage
clarinet test --coverage
```

### 3. Start Development Servers

```bash
# Terminal 1: Backend API
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend

# Terminal 3: Clarinet (if needed)
npm run integrate
```

## Testnet Deployment

### 1. Get Testnet STX

1. Visit [Stacks Testnet Faucet](https://explorer.stacks.co/sandbox/faucet?chain=testnet)
2. Enter your Stacks address
3. Request testnet STX (you'll need ~1 STX for deployment)

### 2. Deploy Contracts

```bash
# Set your private key
export DEPLOYER_PRIVATE_KEY="your-private-key-here"

# Deploy to testnet
npm run deploy:testnet
```

Expected output:
```
🚀 Starting deployment to TESTNET
Network: https://stacks-node-api.testnet.stacks.co

Deploying farmer-registry...
✅ farmer-registry deployed successfully
Transaction ID: 0x1234...
Explorer: https://explorer.stacks.co/?chain=testnet/txid/0x1234...

Deploying product-tracking...
✅ product-tracking deployed successfully
Transaction ID: 0x5678...

Deploying payment-escrow...
✅ payment-escrow deployed successfully
Transaction ID: 0x9abc...

🎉 All contracts deployed successfully!

Environment Variables:
========================
FARMER_REGISTRY_CONTRACT=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.farmer-registry
PRODUCT_TRACKING_CONTRACT=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.product-tracking
PAYMENT_ESCROW_CONTRACT=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.payment-escrow
```

### 3. Update Configuration

Update your `.env` files with the deployed contract addresses:

```bash
# Backend .env
FARMER_REGISTRY_CONTRACT=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.farmer-registry
PRODUCT_TRACKING_CONTRACT=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.product-tracking
PAYMENT_ESCROW_CONTRACT=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.payment-escrow

# Frontend .env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
```

### 4. Test Deployed Contracts

```bash
# Set test configuration
export TEST_PRIVATE_KEY="your-test-private-key"
export CONTRACT_ADDRESS="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"

# Run integration tests
npm run test:contracts
```

### 5. Start Production Services

```bash
# Start backend
npm run start:backend

# Build and start frontend
npm run build:frontend
npm run start:frontend
```

## Mainnet Deployment

### 1. Prepare for Mainnet

```bash
# Update environment
export STACKS_NETWORK=mainnet
export DEPLOYER_PRIVATE_KEY="your-mainnet-private-key"

# Update .env files
STACKS_NETWORK=mainnet
STACKS_API_URL=https://stacks-node-api.mainnet.stacks.co
NEXT_PUBLIC_STACKS_NETWORK=mainnet
```

### 2. Get Mainnet STX

- Purchase STX from exchanges (Coinbase, Binance, etc.)
- Transfer to your deployment wallet
- Ensure you have enough for deployment fees (~1-2 STX)

### 3. Deploy to Mainnet

```bash
# Deploy contracts
STACKS_NETWORK=mainnet npm run deploy:testnet
```

### 4. Update Production Configuration

Update all environment files with mainnet settings and deployed contract addresses.

## Verification

### 1. Verify Deployment

Check your contracts on the Stacks Explorer:
- **Testnet**: https://explorer.stacks.co/?chain=testnet
- **Mainnet**: https://explorer.stacks.co/

### 2. Test Contract Functions

```bash
# Test farmer registration
curl -X POST "https://stacks-node-api.testnet.stacks.co/v2/contracts/call-read/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM/farmer-registry/get-farmer" \
  -H "Content-Type: application/json" \
  -d '{"sender":"ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM","arguments":["\"ST1FARMER...\""]}'
```

### 3. Frontend Integration Test

1. Open the frontend application
2. Connect your Stacks wallet
3. Try registering as a farmer
4. Verify the transaction appears on the explorer

## Production Deployment

### 1. Backend Deployment (Example: Heroku)

```bash
# Create Heroku app
heroku create agri-trace-backend

# Set environment variables
heroku config:set STACKS_NETWORK=mainnet
heroku config:set STACKS_API_URL=https://stacks-node-api.mainnet.stacks.co
heroku config:set FARMER_REGISTRY_CONTRACT=ST1...farmer-registry

# Deploy
git subtree push --prefix backend heroku main
```

### 2. Frontend Deployment (Example: Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod

# Set environment variables in Vercel dashboard
NEXT_PUBLIC_STACKS_NETWORK=mainnet
NEXT_PUBLIC_API_URL=https://your-backend-url.herokuapp.com
```

## Monitoring and Maintenance

### 1. Monitor Transactions

- Set up alerts for contract interactions
- Monitor gas fees and transaction success rates
- Track user adoption metrics

### 2. Contract Upgrades

For contract upgrades, you'll need to:
1. Deploy new contract versions
2. Migrate data if necessary
3. Update frontend/backend to use new contracts
4. Communicate changes to users

### 3. Backup and Recovery

- Keep secure backups of private keys
- Document all contract addresses
- Maintain deployment scripts and configurations

## Troubleshooting

### Common Issues

1. **Deployment Fails**
   - Check STX balance for fees
   - Verify private key format
   - Ensure network connectivity

2. **Contract Call Fails**
   - Verify contract address
   - Check function arguments
   - Ensure wallet has sufficient STX

3. **Frontend Connection Issues**
   - Verify environment variables
   - Check Stacks wallet connection
   - Confirm network settings match

### Getting Help

- **Stacks Documentation**: https://docs.stacks.co
- **Clarinet Docs**: https://docs.hiro.so/clarinet
- **Community Discord**: https://discord.gg/stacks
- **GitHub Issues**: Create issues in the repository

## Security Considerations

1. **Private Key Management**
   - Never commit private keys to version control
   - Use environment variables or secure key management
   - Rotate keys regularly

2. **Contract Security**
   - Audit contracts before mainnet deployment
   - Test thoroughly on testnet
   - Consider formal verification for critical functions

3. **Frontend Security**
   - Validate all user inputs
   - Use HTTPS in production
   - Implement proper error handling

## Cost Estimation

### Testnet (Free)
- Contract deployment: Free testnet STX
- Transaction fees: Free testnet STX

### Mainnet
- Contract deployment: ~0.5-1 STX per contract
- Transaction fees: ~0.001-0.01 STX per transaction
- Total initial deployment: ~2-3 STX

Remember to always test thoroughly on testnet before deploying to mainnet!