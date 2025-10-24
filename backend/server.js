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
        sender: req.query.sender || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        arguments: [`"${batchId}"`]
      }
    });

    res.json({ batch: response.result });
  } catch (error) {
    console.error('Error fetching batch:', error);
    res.status(500).json({ error: 'Failed to fetch batch details' });
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
        sender: req.query.sender || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
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
          sender: req.query.sender || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
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
        sender: req.query.sender || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
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