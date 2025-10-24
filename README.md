# 🌾 AgriTrace: Blockchain-based Supply Chain for Small Farmers

[![Stacks](https://img.shields.io/badge/Built%20on-Stacks-5546FF?style=for-the-badge&logo=stacks)](https://stacks.co)
[![Clarity](https://img.shields.io/badge/Smart%20Contracts-Clarity-orange?style=for-the-badge)](https://clarity-lang.org)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> **A complete decentralized application ensuring transparency, authenticity, and fair compensation across agricultural supply chains using the Stacks blockchain.**

## 🎯 **Live Demo**

- **Frontend**: http://localhost:3000 (after setup)
- **Backend API**: http://localhost:3001 (after setup)
- **Testnet Explorer**: [View on Stacks Explorer](https://explorer.stacks.co/?chain=testnet)

## ✨ **Key Features**

### 🌱 **For Farmers**
- **Verified Registration**: Government/NGO verification system
- **Fair Pricing**: Transparent market rates with STX escrow
- **Direct Sales**: Connect directly with buyers
- **Reputation System**: Build trust through blockchain verification

### 🛒 **For Buyers**
- **Complete Transparency**: Full supply chain visibility
- **Quality Assurance**: Verified farmer credentials
- **Secure Payments**: STX escrow with automatic release
- **Authenticity Guarantee**: Blockchain-verified products

### 📱 **For Consumers**
- **QR Code Scanning**: Instant product verification
- **Supply Chain History**: Track from farm to table
- **Food Safety**: Contamination tracking and recalls
- **Quality Information**: Detailed farmer and product data

## 🏗️ **Architecture**

### Smart Contracts (Clarity)
```
contracts/
├── farmer-registry.clar     # Farmer registration & verification
├── product-tracking.clar    # Supply chain tracking & events
└── payment-escrow.clar      # STX escrow payments
```

### Backend API (Node.js/Express)
```
backend/
├── server.js               # Express server with Stacks integration
├── package.json           # Dependencies & scripts
└── .env.example          # Environment configuration
```

### Frontend (Next.js/React)
```
frontend/
├── pages/                 # Application pages
├── components/           # Reusable UI components
├── contexts/            # React contexts (Stacks integration)
└── styles/             # Tailwind CSS styling
```

## 🚀 **Quick Start**

### Prerequisites
- **Node.js 18+**
- **Clarinet CLI** ([Installation Guide](https://docs.hiro.so/clarinet))
- **Stacks Wallet** ([Browser Extension](https://wallet.hiro.so/))

### 1. Clone Repository
```bash
git clone https://github.com/SharmARohitt/agri-trace.git
cd agri-trace
```

### 2. Install Dependencies
```bash
# Install all dependencies
npm run install:all

# Or install individually
npm install                    # Root dependencies
cd backend && npm install      # Backend dependencies  
cd ../frontend && npm install  # Frontend dependencies
```

### 3. Environment Setup
```bash
# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
```

### 4. Start Development
```bash
# Terminal 1: Smart Contracts
clarinet console

# Terminal 2: Backend API
cd backend && npm run dev

# Terminal 3: Frontend
cd frontend && npm run dev
```

### 5. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/health

## 🧪 **Testing**

### Smart Contract Testing
```bash
# Check contract syntax
clarinet check

# Run interactive console
clarinet console

# Test contract functions
(contract-call? .farmer-registry register-farmer "John Doe" "California")
(contract-call? .product-tracking record-batch "BATCH-001" "Tomatoes" u100 "kg" u500 "A" u1000 u2000 "Farm")
```

### Integration Testing
```bash
# Test deployed contracts
npm run test:contracts

# Test API endpoints
curl http://localhost:3001/health
curl http://localhost:3001/api/config
```

## 🌐 **Deployment**

### Testnet Deployment
```bash
# Get testnet STX from faucet
# https://explorer.stacks.co/sandbox/faucet?chain=testnet

# Set your private key
export DEPLOYER_PRIVATE_KEY="your-private-key"

# Deploy contracts
npm run deploy:testnet
```

### Production Deployment
```bash
# Deploy to mainnet
export STACKS_NETWORK=mainnet
export DEPLOYER_PRIVATE_KEY="your-mainnet-private-key"
npm run deploy:testnet
```

## 📊 **Project Status**

### ✅ **Completed Features**
- [x] Smart contract development and testing
- [x] Farmer registration and verification system
- [x] Product batch tracking with immutable history
- [x] STX escrow payments with automatic release
- [x] QR code generation for product traceability
- [x] Responsive web interface with wallet integration
- [x] Real-time blockchain data synchronization
- [x] Complete API documentation

### 🚧 **Roadmap**
- [ ] Mobile application (React Native)
- [ ] IPFS integration for large data storage
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with existing ERP systems
- [ ] IoT sensor data integration

## 🛠️ **Technology Stack**

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Blockchain** | Stacks | Bitcoin-secured smart contracts |
| **Smart Contracts** | Clarity | Secure, predictable contract logic |
| **Backend** | Node.js + Express | API server and blockchain integration |
| **Frontend** | Next.js + React | Modern web application |
| **Styling** | Tailwind CSS | Responsive, utility-first CSS |
| **Wallet** | Stacks.js | Blockchain wallet integration |
| **Testing** | Clarinet + Vitest | Contract and integration testing |

## 📖 **Documentation**

- **[Setup Guide](DEPLOYMENT.md)** - Complete deployment instructions
- **[Project Summary](PROJECT_SUMMARY.md)** - Detailed project overview
- **[Test Results](TEST_RESULTS.md)** - Testing documentation
- **[Running Status](RUNNING_STATUS.md)** - Current application status

## 🤝 **Contributing**

We welcome contributions! Please follow these steps:

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Stacks Foundation** for the blockchain infrastructure
- **Hiro Systems** for development tools and APIs
- **Clarity Language** for secure smart contract development
- **Open Source Community** for the amazing tools and libraries

## 📞 **Support**

- **Issues**: [GitHub Issues](https://github.com/SharmARohitt/agri-trace/issues)
- **Discussions**: [GitHub Discussions](https://github.com/SharmARohitt/agri-trace/discussions)

## 🌟 **Screenshots**

### Dashboard
![Dashboard](docs/images/dashboard.png)

### Farmer Registration
![Farmer Registration](docs/images/farmer-registration.png)

### Supply Chain Tracking
![Supply Chain Tracking](docs/images/supply-chain-tracking.png)

---

<div align="center">

**Built with ❤️ for transparent and fair agricultural supply chains**

[🌾 View Demo](http://localhost:3000) • [📚 Documentation](DEPLOYMENT.md) • [🐛 Report Bug](https://github.com/SharmARohitt/agri-trace/issues) • [✨ Request Feature](https://github.com/SharmARohitt/agri-trace/issues)

</div>