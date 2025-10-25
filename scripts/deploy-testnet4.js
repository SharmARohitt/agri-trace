const { StacksTestnet } = require('@stacks/network');
const { 
  makeContractDeploy, 
  broadcastTransaction, 
  AnchorMode,
  PostConditionMode,
  estimateContractDeploy
} = require('@stacks/transactions');
const fs = require('fs');
const path = require('path');

// Testnet4 Configuration
const NETWORK = new StacksTestnet({ url: 'https://api.testnet.hiro.so' });
const DEPLOYER_ADDRESS = 'STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72';

// Contract deployment order (dependencies first)
const contracts = [
  {
    name: 'farmer-registry',
    file: 'farmer-registry.clar',
    description: 'Farmer registration and verification system'
  },
  {
    name: 'product-tracking',
    file: 'product-tracking.clar',
    description: 'Product batch tracking and supply chain events'
  },
  {
    name: 'payment-escrow',
    file: 'payment-escrow.clar',
    description: 'STX escrow system for secure payments'
  }
];

async function checkWalletBalance() {
  try {
    console.log('🔍 Checking wallet balance...');
    const response = await fetch(`https://api.testnet.hiro.so/extended/v1/address/${DEPLOYER_ADDRESS}/balances`);
    const data = await response.json();
    
    const stxBalance = parseInt(data.stx.balance);
    const stxInSTX = stxBalance / 1000000; // Convert microSTX to STX
    
    console.log(`💰 Wallet Balance: ${stxInSTX} STX (${stxBalance} microSTX)`);
    
    if (stxBalance < 1000000) { // Less than 1 STX
      throw new Error('Insufficient STX balance for deployment. Need at least 1 STX for fees.');
    }
    
    return stxBalance;
  } catch (error) {
    console.error('❌ Error checking wallet balance:', error);
    throw error;
  }
}

async function estimateDeploymentCost(contractName, contractCode) {
  try {
    console.log(`📊 Estimating deployment cost for ${contractName}...`);
    
    // Note: This is a rough estimate. Actual costs may vary.
    const estimatedFee = 50000; // ~0.05 STX typical deployment fee
    console.log(`💸 Estimated fee for ${contractName}: ${estimatedFee} microSTX (~${estimatedFee/1000000} STX)`);
    
    return estimatedFee;
  } catch (error) {
    console.error(`❌ Error estimating cost for ${contractName}:`, error);
    return 100000; // Default to 0.1 STX if estimation fails
  }
}

async function deployContract(contractName, contractFile, description) {
  try {
    console.log(`\n🚀 Preparing deployment for ${contractName}...`);
    console.log(`📝 Description: ${description}`);
    
    const contractPath = path.join(__dirname, '..', 'contracts', contractFile);
    const codeBody = fs.readFileSync(contractPath, 'utf8');
    
    console.log(`📄 Contract file: ${contractFile}`);
    console.log(`📏 Contract size: ${codeBody.length} characters`);
    
    // Estimate deployment cost
    const estimatedFee = await estimateDeploymentCost(contractName, codeBody);
    
    console.log(`\n⚠️  DEPLOYMENT READY FOR: ${contractName.toUpperCase()}`);
    console.log(`📍 Deployer Address: ${DEPLOYER_ADDRESS}`);
    console.log(`🌐 Network: Stacks Testnet4`);
    console.log(`💰 Estimated Fee: ~${estimatedFee/1000000} STX`);
    console.log(`\n🔐 IMPORTANT: You will need to sign this transaction with your Leather wallet`);
    console.log(`📱 Please ensure your Leather wallet is connected and ready to sign`);
    
    // Create the deployment transaction (unsigned)
    const txOptions = {
      contractName,
      codeBody,
      senderKey: 'placeholder', // Will be replaced by wallet signing
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: estimatedFee,
    };
    
    console.log(`\n📋 Transaction Details:`);
    console.log(`   Contract Name: ${contractName}`);
    console.log(`   Network: Testnet4`);
    console.log(`   Fee: ${estimatedFee} microSTX`);
    console.log(`   Code Length: ${codeBody.length} chars`);
    
    // For security, we'll output the contract details but not actually deploy
    // The user should use Leather wallet or Hiro Explorer for actual deployment
    console.log(`\n🔒 SECURITY NOTE: Actual deployment should be done through:`);
    console.log(`   1. Leather Wallet's contract deployment feature`);
    console.log(`   2. Hiro Explorer's contract deployment tool`);
    console.log(`   3. Stacks.js with proper wallet integration`);
    
    return {
      contractName,
      status: 'prepared',
      estimatedFee,
      codeLength: codeBody.length,
      contractCode: codeBody
    };
    
  } catch (error) {
    console.error(`❌ Error preparing deployment for ${contractName}:`, error);
    return {
      contractName,
      status: 'error',
      error: error.message
    };
  }
}

async function generateDeploymentInstructions() {
  console.log(`\n📋 DEPLOYMENT INSTRUCTIONS FOR LEATHER WALLET`);
  console.log(`=`.repeat(60));
  
  for (const contract of contracts) {
    console.log(`\n${contract.name.toUpperCase()}:`);
    console.log(`1. Open Leather Wallet`);
    console.log(`2. Go to "Deploy Contract" or use Hiro Explorer`);
    console.log(`3. Contract Name: ${contract.name}`);
    console.log(`4. Copy contract code from: contracts/${contract.file}`);
    console.log(`5. Set network to Testnet4`);
    console.log(`6. Sign and broadcast transaction`);
  }
  
  console.log(`\n🌐 ALTERNATIVE: Use Hiro Explorer`);
  console.log(`1. Visit: https://explorer.hiro.so/sandbox/deploy?chain=testnet`);
  console.log(`2. Connect your Leather wallet`);
  console.log(`3. Deploy each contract in order`);
}

async function main() {
  try {
    console.log('🌾 AgriTrace Smart Contract Deployment to Testnet4');
    console.log('='.repeat(60));
    
    // Check wallet balance
    const balance = await checkWalletBalance();
    
    console.log(`\n📦 Preparing ${contracts.length} contracts for deployment...`);
    
    const deploymentResults = [];
    let totalEstimatedCost = 0;
    
    // Prepare each contract
    for (const contract of contracts) {
      const result = await deployContract(contract.name, contract.file, contract.description);
      deploymentResults.push(result);
      
      if (result.status === 'prepared') {
        totalEstimatedCost += result.estimatedFee;
      }
    }
    
    console.log(`\n💰 COST SUMMARY:`);
    console.log(`   Total Estimated Cost: ${totalEstimatedCost} microSTX (~${totalEstimatedCost/1000000} STX)`);
    console.log(`   Your Balance: ${balance} microSTX (~${balance/1000000} STX)`);
    console.log(`   Remaining After: ~${(balance-totalEstimatedCost)/1000000} STX`);
    
    // Generate deployment instructions
    await generateDeploymentInstructions();
    
    // Save deployment info
    const deploymentInfo = {
      network: 'testnet4',
      deployerAddress: DEPLOYER_ADDRESS,
      timestamp: new Date().toISOString(),
      contracts: deploymentResults,
      totalEstimatedCost,
      walletBalance: balance
    };
    
    const outputPath = path.join(__dirname, '..', 'deployment-testnet4-prepared.json');
    fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n💾 Deployment preparation saved to: ${outputPath}`);
    
    console.log(`\n✅ All contracts prepared for deployment!`);
    console.log(`🔐 Please use your Leather wallet to complete the actual deployment.`);
    
  } catch (error) {
    console.error('❌ Deployment preparation failed:', error);
    process.exit(1);
  }
}

// Export for use in other scripts
module.exports = {
  contracts,
  DEPLOYER_ADDRESS,
  NETWORK,
  checkWalletBalance,
  deployContract
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}