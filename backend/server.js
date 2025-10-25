const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { StacksTestnet, StacksMainnet } = require('@stacks/network');
const { Configuration, AccountsApi, TransactionsApi, SmartContractsApi } = require('@stacks/blockchain-api-client');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Stacks network configuration
const network = process.env.STACKS_NETWORK === 'mainnet' 
  ? new StacksMainnet() 
  : new StacksTestnet();

const apiConfig = new Configuration({
  basePath: process.env.STACKS_API_URL || 'https://stacks-node-api.testnet.stacks.co',
});

const accountsApi = new AccountsApi(apiConfig);
const transactionsApi = new TransactionsApi(apiConfig);
const smartContractsApi = new SmartContractsApi(apiConfig);

// Contract addresses (to be set after deployment)
const CONTRACTS = {
  FARMER_REGISTRY: process.env.FARMER_REGISTRY_CONTRACT,
  PRODUCT_TRACKING: process.env.PRODUCT_TRACKING_CONTRACT,
  PAYMENT_ESCROW: process.env.PAYMENT_ESCROW_CONTRACT
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    network: process.env.STACKS_NETWORK,
    timestamp: new Date().toISOString()
  });
});

// Farmer routes
app.get('/api/farmers/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!CONTRACTS.FARMER_REGISTRY) {
      return res.status(500).json({ error: 'Farmer registry contract not configured' });
    }

    // Call read-only function to get farmer details
    const [contractAddress, contractName] = CONTRACTS.FARMER_REGISTRY.split('.');
    
    const response = await smartContractsApi.callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-farmer',
      readOnlyFunctionArgs: {
        sender: address,
        arguments: [`"${address}"`]
      }
    });

    res.json({ farmer: response.result });
  } catch (error) {
    console.error('Error fetching farmer:', error);
    res.status(500).json({ error: 'Failed to fetch farmer details' });
  }
});

// Get all farmers (for directory)
app.get('/api/farmers', async (req, res) => {
  try {
    if (!CONTRACTS.FARMER_REGISTRY) {
      return res.status(500).json({ error: 'Farmer registry contract not configured' });
    }

    // In a real implementation, you would:
    // 1. Query blockchain events for farmer registrations
    // 2. Get farmer details for each registered farmer
    // 3. Cache results for performance
    
    // For now, return mock data that includes the deployed contract owner
    const farmers = [
      {
        id: 'STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72',
        name: 'Rohit Sharma',
        region: 'Delhi',
        verified: false,
        totalBatches: 0,
        totalRevenue: 0,
        reputationScore: 100,
        specialties: ['New Farmer'],
        joinDate: new Date().toISOString().split('T')[0],
        walletAddress: 'STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72',
        isOnline: true
      }
    ];

    res.json({ farmers });
  } catch (error) {
    console.error('Error fetching farmers:', error);
    res.status(500).json({ error: 'Failed to fetch farmers list' });
  }
});

app.get('/api/farmers/:address/stats', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!CONTRACTS.FARMER_REGISTRY) {
      return res.status(500).json({ error: 'Farmer registry contract not configured' });
    }

    const [contractAddress, contractName] = CONTRACTS.FARMER_REGISTRY.split('.');
    
    const response = await smartContractsApi.callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-farmer-stats',
      readOnlyFunctionArgs: {
        sender: address,
        arguments: [`"${address}"`]
      }
    });

    res.json({ stats: response.result });
  } catch (error) {
    console.error('Error fetching farmer stats:', error);
    res.status(500).json({ error: 'Failed to fetch farmer stats' });
  }
});

// Product batch routes
app.get('/api/batches/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    
    if (!CONTRACTS.PRODUCT_TRACKING) {
      return res.status(500).json({ error: 'Product tracking contract not configured' });
    }

    const [contractAddress, contractName] = CONTRACTS.PRODUCT_TRACKING.split('.');
    
    const response = await smartContractsApi.callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-batch',
      readOnlyFunctionArgs: {
        sender: req.query.sender || 'STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72',
        arguments: [`"${batchId}"`]
      }
    });

    res.json({ batch: response.result });
  } catch (error) {
    console.error('Error fetching batch:', error);
    res.status(500).json({ error: 'Failed to fetch batch details' });
  }
});

// Get all product batches (for marketplace)
app.get('/api/batches', async (req, res) => {
  try {
    if (!CONTRACTS.PRODUCT_TRACKING) {
      return res.status(500).json({ error: 'Product tracking contract not configured' });
    }

    // In a real implementation, you would:
    // 1. Query blockchain events for batch creations
    // 2. Get batch details for each created batch
    // 3. Filter by status, farmer, etc.
    // 4. Cache results for performance
    
    // Mock marketplace data with more variety to make it look filled
    const products = [
      {
        batchId: 'BATCH-001',
        productType: 'Organic Tomatoes',
        quantity: 100,
        unit: 'kg',
        pricePerUnit: 5.50,
        qualityGrade: 'A',
        harvestDate: '2024-01-15',
        expiryDate: '2024-01-25',
        location: 'Green Valley Farm, Delhi',
        farmer: {
          id: 'STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72',
          name: 'Rohit Sharma',
          region: 'Delhi',
          verified: false,
          reputationScore: 100
        },
        status: 'available',
        description: 'Fresh organic tomatoes grown using sustainable farming practices.',
        certifications: ['Organic', 'Non-GMO']
      },
      {
        batchId: 'BATCH-002',
        productType: 'Premium Wheat',
        quantity: 500,
        unit: 'kg',
        pricePerUnit: 2.25,
        qualityGrade: 'A',
        harvestDate: '2024-01-10',
        expiryDate: '2024-06-10',
        location: 'Sunrise Farm, Delhi',
        farmer: {
          id: 'STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72',
          name: 'Rohit Sharma',
          region: 'Delhi',
          verified: false,
          reputationScore: 100
        },
        status: 'available',
        description: 'High-quality wheat perfect for bread making and baking.',
        certifications: ['Quality Assured', 'Sustainable']
      },
      {
        batchId: 'BATCH-003',
        productType: 'Fresh Carrots',
        quantity: 75,
        unit: 'kg',
        pricePerUnit: 3.80,
        qualityGrade: 'A',
        harvestDate: '2024-01-12',
        expiryDate: '2024-02-12',
        location: 'Organic Valley Farm, Delhi',
        farmer: {
          id: 'STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72',
          name: 'Rohit Sharma',
          region: 'Delhi',
          verified: false,
          reputationScore: 100
        },
        status: 'available',
        description: 'Crisp and sweet carrots perfect for cooking and salads.',
        certifications: ['Organic', 'Pesticide-Free']
      },
      {
        batchId: 'BATCH-004',
        productType: 'Basmati Rice',
        quantity: 200,
        unit: 'kg',
        pricePerUnit: 4.20,
        qualityGrade: 'A',
        harvestDate: '2024-01-08',
        expiryDate: '2024-12-08',
        location: 'Heritage Rice Farm, Delhi',
        farmer: {
          id: 'STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72',
          name: 'Rohit Sharma',
          region: 'Delhi',
          verified: false,
          reputationScore: 100
        },
        status: 'available',
        description: 'Premium basmati rice with authentic aroma and taste.',
        certifications: ['Traditional', 'Quality Assured']
      },
      {
        batchId: 'BATCH-005',
        productType: 'Bell Peppers',
        quantity: 60,
        unit: 'kg',
        pricePerUnit: 6.50,
        qualityGrade: 'A',
        harvestDate: '2024-01-14',
        expiryDate: '2024-01-28',
        location: 'Rainbow Farm, Delhi',
        farmer: {
          id: 'STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72',
          name: 'Rohit Sharma',
          region: 'Delhi',
          verified: false,
          reputationScore: 100
        },
        status: 'available',
        description: 'Colorful bell peppers rich in vitamins and flavor.',
        certifications: ['Organic', 'Greenhouse Grown']
      },
      {
        batchId: 'BATCH-006',
        productType: 'Fresh Spinach',
        quantity: 40,
        unit: 'kg',
        pricePerUnit: 4.80,
        qualityGrade: 'A',
        harvestDate: '2024-01-16',
        expiryDate: '2024-01-23',
        location: 'Green Leaf Farm, Delhi',
        farmer: {
          id: 'STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72',
          name: 'Rohit Sharma',
          region: 'Delhi',
          verified: false,
          reputationScore: 100
        },
        status: 'available',
        description: 'Fresh spinach leaves packed with iron and nutrients.',
        certifications: ['Organic', 'Hydroponic']
      },
      {
        batchId: 'BATCH-007',
        productType: 'Sweet Corn',
        quantity: 120,
        unit: 'kg',
        pricePerUnit: 3.20,
        qualityGrade: 'B',
        harvestDate: '2024-01-11',
        expiryDate: '2024-01-25',
        location: 'Sunshine Farm, Delhi',
        farmer: {
          id: 'STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72',
          name: 'Rohit Sharma',
          region: 'Delhi',
          verified: false,
          reputationScore: 100
        },
        status: 'available',
        description: 'Sweet and tender corn kernels perfect for cooking.',
        certifications: ['Non-GMO']
      },
      {
        batchId: 'BATCH-008',
        productType: 'Red Onions',
        quantity: 150,
        unit: 'kg',
        pricePerUnit: 2.80,
        qualityGrade: 'A',
        harvestDate: '2024-01-09',
        expiryDate: '2024-04-09',
        location: 'Valley Farm, Delhi',
        farmer: {
          id: 'STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72',
          name: 'Rohit Sharma',
          region: 'Delhi',
          verified: false,
          reputationScore: 100
        },
        status: 'available',
        description: 'Fresh red onions with strong flavor and long shelf life.',
        certifications: ['Traditional', 'Sun-Dried']
      }
    ];

    // Add any newly created products from memory (in production, this would be from database)
    if (global.createdProducts) {
      products.push(...global.createdProducts);
    }

    // Apply filters from query parameters
    const { productType, qualityGrade, verifiedOnly, sortBy } = req.query;
    
    let filteredProducts = [...products];
    
    if (productType && productType !== 'all') {
      filteredProducts = filteredProducts.filter(p => 
        p.productType.toLowerCase().includes(productType.toLowerCase())
      );
    }
    
    if (qualityGrade && qualityGrade !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.qualityGrade === qualityGrade);
    }
    
    if (verifiedOnly === 'true') {
      filteredProducts = filteredProducts.filter(p => p.farmer.verified);
    }

    res.json({ products: filteredProducts });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products list' });
  }
});

app.get('/api/batches/:batchId/history', async (req, res) => {
  try {
    const { batchId } = req.params;
    
    if (!CONTRACTS.PRODUCT_TRACKING) {
      return res.status(500).json({ error: 'Product tracking contract not configured' });
    }

    const [contractAddress, contractName] = CONTRACTS.PRODUCT_TRACKING.split('.');
    
    // Get event count first
    const countResponse = await smartContractsApi.callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-batch-event-count',
      readOnlyFunctionArgs: {
        sender: req.query.sender || 'STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72',
        arguments: [`"${batchId}"`]
      }
    });

    const eventCount = parseInt(countResponse.result.replace(/[^\d]/g, ''));
    const history = [];

    // Fetch each event
    for (let i = 1; i <= Math.min(eventCount, 10); i++) {
      const eventResponse = await smartContractsApi.callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-batch-event',
        readOnlyFunctionArgs: {
          sender: req.query.sender || 'STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72',
          arguments: [`"${batchId}"`, `u${i}`]
        }
      });
      
      if (eventResponse.result !== '(none)') {
        history.push(eventResponse.result);
      }
    }

    res.json({ history });
  } catch (error) {
    console.error('Error fetching batch history:', error);
    res.status(500).json({ error: 'Failed to fetch batch history' });
  }
});

// Escrow routes
app.get('/api/escrows/:escrowId', async (req, res) => {
  try {
    const { escrowId } = req.params;
    
    if (!CONTRACTS.PAYMENT_ESCROW) {
      return res.status(500).json({ error: 'Payment escrow contract not configured' });
    }

    const [contractAddress, contractName] = CONTRACTS.PAYMENT_ESCROW.split('.');
    
    const response = await smartContractsApi.callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-escrow',
      readOnlyFunctionArgs: {
        sender: req.query.sender || 'STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72',
        arguments: [`"${escrowId}"`]
      }
    });

    res.json({ escrow: response.result });
  } catch (error) {
    console.error('Error fetching escrow:', error);
    res.status(500).json({ error: 'Failed to fetch escrow details' });
  }
});

// Transaction status route
app.get('/api/transactions/:txId', async (req, res) => {
  try {
    const { txId } = req.params;
    
    const response = await transactionsApi.getTransactionById({ txId });
    
    res.json({ transaction: response });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction details' });
  }
});

// QR Code generation for batch traceability
app.get('/api/batches/:batchId/qr', async (req, res) => {
  try {
    const { batchId } = req.params;
    const QRCode = require('qrcode');
    
    const traceUrl = `${req.protocol}://${req.get('host')}/trace/${batchId}`;
    const qrCodeDataURL = await QRCode.toDataURL(traceUrl);
    
    res.json({ 
      qrCode: qrCodeDataURL,
      traceUrl: traceUrl
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Account balance route
app.get('/api/accounts/:address/balance', async (req, res) => {
  try {
    const { address } = req.params;
    
    const response = await accountsApi.getAccountBalance({ principal: address });
    
    res.json({ balance: response });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ error: 'Failed to fetch account balance' });
  }
});

// Dashboard data route
app.get('/api/dashboard/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // In production, this would aggregate data from multiple sources:
    // 1. Farmer stats from farmer-registry contract
    // 2. Product batches from product-tracking contract
    // 3. Payment history from payment-escrow contract
    // 4. Market analytics and growth metrics
    
    const dashboardData = {
      userStats: {
        totalRevenue: 15750,
        totalBatches: 23,
        averagePrice: 4.85,
        reputationScore: 94,
        monthlyGrowth: 23.5,
        totalSales: 2340,
        verificationStatus: address === 'STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72' ? 'verified' : 'pending',
        joinDate: '2024-01-15'
      },
      revenueData: [
        { month: 'Jan', revenue: 1200, batches: 3, avgPrice: 4.2 },
        { month: 'Feb', revenue: 1850, batches: 4, avgPrice: 4.6 },
        { month: 'Mar', revenue: 2100, batches: 5, avgPrice: 4.8 },
        { month: 'Apr', revenue: 2650, batches: 6, avgPrice: 5.1 },
        { month: 'May', revenue: 3200, batches: 7, avgPrice: 5.3 },
        { month: 'Jun', revenue: 4750, batches: 8, avgPrice: 5.8 }
      ],
      productDistribution: [
        { name: 'Organic Tomatoes', value: 35, color: '#ef4444' },
        { name: 'Premium Wheat', value: 25, color: '#f59e0b' },
        { name: 'Fresh Vegetables', value: 20, color: '#10b981' },
        { name: 'Seasonal Fruits', value: 15, color: '#8b5cf6' },
        { name: 'Herbs & Spices', value: 5, color: '#06b6d4' }
      ],
      paymentHistory: [
        {
          id: 'PAY-001',
          date: new Date().toISOString().split('T')[0],
          amount: 1250,
          batchId: 'BATCH-001',
          buyer: 'Fresh Market Co.',
          status: 'completed',
          txId: '0x1234567890abcdef'
        },
        {
          id: 'PAY-002',
          date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
          amount: 890,
          batchId: 'BATCH-002',
          buyer: 'Organic Foods Ltd.',
          status: 'completed',
          txId: '0x2345678901bcdefg'
        }
      ],
      impactMetrics: {
        co2Saved: 2.4,
        waterSaved: 15600,
        farmersHelped: 1247,
        transparencyScore: 98,
        fairTradeImpact: 89
      },
      monthlyComparison: {
        thisMonth: { revenue: 4750, batches: 8, growth: 23.5 },
        lastMonth: { revenue: 3850, batches: 6, growth: 18.2 }
      }
    };
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Add product batch endpoint (for when products are created)
app.post('/api/batches', async (req, res) => {
  try {
    const { batchId, productType, quantity, unit, pricePerUnit, qualityGrade, harvestDate, expiryDate, location, farmerAddress } = req.body;
    
    // In production, this would save to database
    // For now, store in memory
    if (!global.createdProducts) {
      global.createdProducts = [];
    }
    
    const newProduct = {
      batchId,
      productType,
      quantity: parseInt(quantity),
      unit,
      pricePerUnit: parseFloat(pricePerUnit),
      qualityGrade,
      harvestDate,
      expiryDate,
      location,
      farmer: {
        id: farmerAddress,
        name: 'Rohit Sharma', // In production, fetch from farmer registry
        region: 'Delhi',
        verified: false,
        reputationScore: 100
      },
      status: 'available',
      description: `Fresh ${productType.toLowerCase()} from local farm.`,
      certifications: ['Blockchain Verified']
    };
    
    global.createdProducts.push(newProduct);
    
    res.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Error adding product batch:', error);
    res.status(500).json({ error: 'Failed to add product batch' });
  }
});

// Contract configuration endpoint
app.get('/api/config', (req, res) => {
  res.json({
    network: process.env.STACKS_NETWORK,
    apiUrl: process.env.STACKS_API_URL,
    explorerUrl: process.env.STACKS_EXPLORER_URL,
    contracts: CONTRACTS
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`AgriTrace Backend API running on port ${PORT}`);
  console.log(`Network: ${process.env.STACKS_NETWORK || 'testnet'}`);
  console.log(`API URL: ${process.env.STACKS_API_URL || 'https://stacks-node-api.testnet.stacks.co'}`);
});

module.exports = app;