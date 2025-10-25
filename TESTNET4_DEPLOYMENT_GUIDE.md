# 🚀 AgriTrace Testnet4 Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Wallet Status
- **Address**: `STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72`
- **Balance**: 5,000 STX (5,000,000,000 microSTX) ✅
- **Network**: Stacks Testnet4 ✅
- **Estimated Cost**: ~0.15 STX total for all contracts ✅

### ✅ Contracts Ready for Deployment
1. **farmer-registry.clar** (4,155 characters)
2. **product-tracking.clar** (6,955 characters)  
3. **payment-escrow.clar** (8,264 characters)

---

## 🎯 Deployment Methods

### Method 1: Hiro Explorer (Recommended)

#### Step 1: Access Hiro Explorer
1. Visit: https://explorer.hiro.so/sandbox/deploy?chain=testnet
2. Ensure you're on **Testnet** (check the chain selector)

#### Step 2: Connect Leather Wallet
1. Click "Connect Wallet"
2. Select "Leather" from the wallet options
3. Authorize the connection in your Leather wallet
4. Verify your address shows as: `STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72`

#### Step 3: Deploy Contracts (In Order)

##### 🔸 Deploy farmer-registry
1. **Contract Name**: `farmer-registry`
2. **Contract Code**: Copy from `contracts/farmer-registry.clar`
3. Click "Deploy Contract"
4. Sign transaction in Leather wallet
5. **Wait for confirmation** before proceeding

##### 🔸 Deploy product-tracking  
1. **Contract Name**: `product-tracking`
2. **Contract Code**: Copy from `contracts/product-tracking.clar`
3. Click "Deploy Contract"
4. Sign transaction in Leather wallet
5. **Wait for confirmation** before proceeding

##### 🔸 Deploy payment-escrow
1. **Contract Name**: `payment-escrow`
2. **Contract Code**: Copy from `contracts/payment-escrow.clar`
3. Click "Deploy Contract"
4. Sign transaction in Leather wallet
5. **Wait for confirmation**

---

### Method 2: Local HTML Interface

#### Step 1: Open Deployment Interface
1. Open `deploy.html` in your browser
2. Click "Connect Leather Wallet"
3. Authorize connection

#### Step 2: Deploy Contracts
1. Follow the on-screen instructions
2. Deploy contracts in the specified order
3. Sign each transaction in Leather wallet

---

### Method 3: Clarinet CLI (Advanced)

#### Step 1: Configure Deployment
```bash
# Set your private key (DO NOT share this)
export STACKS_PRIVATE_KEY="your-private-key-here"

# Deploy using Clarinet
clarinet deployments apply --network testnet
```

---

## 📊 Expected Results

### Contract Addresses (After Deployment)
- **farmer-registry**: `STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72.farmer-registry`
- **product-tracking**: `STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72.product-tracking`
- **payment-escrow**: `STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72.payment-escrow`

### Transaction Verification
Each deployment will generate a transaction ID. Verify on:
- **Explorer**: https://explorer.hiro.so/?chain=testnet
- **API**: https://api.testnet.hiro.so/extended/v1/tx/[TX_ID]

---

## 🔍 Post-Deployment Verification

### Step 1: Verify Contract Deployment
```bash
# Check farmer-registry
curl "https://api.testnet.hiro.so/v2/contracts/interface/STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72/farmer-registry"

# Check product-tracking  
curl "https://api.testnet.hiro.so/v2/contracts/interface/STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72/product-tracking"

# Check payment-escrow
curl "https://api.testnet.hiro.so/v2/contracts/interface/STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72/payment-escrow"
```

### Step 2: Test Contract Functions
```bash
# Test farmer registration
curl -X POST "https://api.testnet.hiro.so/v2/contracts/call-read/STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72/farmer-registry/get-contract-owner" \
  -H "Content-Type: application/json" \
  -d '{"sender":"STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72","arguments":[]}'
```

### Step 3: Update Application Configuration
Update your environment files with deployed contract addresses:

```bash
# backend/.env
FARMER_REGISTRY_CONTRACT=STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72.farmer-registry
PRODUCT_TRACKING_CONTRACT=STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72.product-tracking
PAYMENT_ESCROW_CONTRACT=STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72.payment-escrow

# frontend/.env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72
```

---

## 🚨 Important Security Notes

### 🔐 Private Key Security
- **NEVER** share your private key
- **NEVER** commit private keys to version control
- Use environment variables for sensitive data
- Consider using hardware wallets for mainnet

### 🛡️ Transaction Safety
- Always verify contract addresses before interacting
- Double-check transaction details before signing
- Monitor transactions on the explorer
- Keep transaction IDs for records

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Wallet Connection Failed
- Ensure Leather wallet is installed and updated
- Check that you're on the correct network (Testnet)
- Try refreshing the page and reconnecting

#### 2. Insufficient Balance
- Your balance: 5,000 STX ✅ (More than sufficient)
- Required: ~0.15 STX total
- If balance is low, get testnet STX from faucet

#### 3. Contract Deployment Failed
- Check contract syntax with `clarinet check`
- Verify you're deploying to the correct network
- Ensure contract names are unique
- Check for any syntax errors in contract code

#### 4. Transaction Stuck
- Check transaction status on explorer
- Wait for network confirmation (can take 10-20 minutes)
- Increase fee if transaction is stuck

### Getting Help
- **Stacks Discord**: https://discord.gg/stacks
- **Hiro Support**: https://docs.hiro.so
- **Explorer**: https://explorer.hiro.so/?chain=testnet

---

## 📝 Deployment Checklist

### Before Deployment
- [ ] Wallet connected and verified
- [ ] Sufficient STX balance confirmed
- [ ] Contract code reviewed and tested
- [ ] Network set to Testnet4

### During Deployment
- [ ] Deploy farmer-registry first
- [ ] Wait for confirmation
- [ ] Deploy product-tracking second  
- [ ] Wait for confirmation
- [ ] Deploy payment-escrow third
- [ ] Wait for final confirmation

### After Deployment
- [ ] Verify all contracts on explorer
- [ ] Test contract functions
- [ ] Update application configuration
- [ ] Document contract addresses
- [ ] Test end-to-end application flow

---

## 🎉 Success Criteria

### ✅ Deployment Complete When:
1. All 3 contracts successfully deployed
2. Contract addresses confirmed on explorer
3. Contract functions callable via API
4. Application updated with new addresses
5. End-to-end testing successful

### 📊 Expected Timeline
- **Preparation**: 5 minutes
- **Deployment**: 15-30 minutes (including confirmations)
- **Verification**: 10 minutes
- **Configuration Update**: 5 minutes
- **Total**: ~45-60 minutes

---

**🚀 Ready to deploy? Follow the steps above and your AgriTrace contracts will be live on Stacks Testnet4!**