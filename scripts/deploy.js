const { StacksTestnet, StacksMainnet } = require('@stacks/network');
const { 
  makeContractDeploy, 
  broadcastTransaction, 
  AnchorMode,
  PostConditionMode
} = require('@stacks/transactions');
const fs = require('fs');
const path = require('path');

// Configuration
const NETWORK = process.env.STACKS_NETWORK || 'testnet';
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error('Error: DEPLOYER_PRIVATE_KEY environment variable is required');
  process.exit(1);
}

const network = NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet();

// Contract deployment order (dependencies first)
const contracts = [
  {
    name: 'farmer-registry',
    file: 'farmer-registry.clar'
  },
  {
    name: 'product-tracking',
    file: 'product-tracking.clar'
  },
  {
    name: 'payment-escrow',
    file: 'payment-escrow.clar'
  }
];

async function deployContract(contractName, contractFile) {
  try {
    console.log(`\nDeploying ${contractName}...`);
    
    const contractPath = path.join(__dirname, '..', 'contracts', contractFile);
    const codeBody = fs.readFileSync(contractPath, 'utf8');
    
    const txOptions = {
      contractName,
      codeBody,
      senderKey: PRIVATE_KEY,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };
    
    const transaction = await makeContractDeploy(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    
    if (broadcastResponse.error) {
      console.error(`Error deploying ${contractName}:`, broadcastResponse);
      return null;
    }
    
    console.log(`✅ ${contractName} deployed successfully`);
    console.log(`Transaction ID: ${broadcastResponse.txid}`);
    console.log(`Explorer: ${getExplorerUrl(broadcastResponse.txid)}`);
    
    return broadcastResponse.txid;
  } catch (error) {
    console.error(`Error deploying ${contractName}:`, error);
    return null;
  }
}

function getExplorerUrl(txId) {
  const baseUrl = NETWORK === 'mainnet' 
    ? 'https://explorer.stacks.co' 
    : 'https://explorer.stacks.co/?chain=testnet';
  return `${baseUrl}/txid/${txId}`;
}

async function deployAll() {
  console.log(`🚀 Starting deployment to ${NETWORK.toUpperCase()}`);
  console.log(`Network: ${network.coreApiUrl}`);
  
  const deploymentResults = {};
  
  for (const contract of contracts) {
    const txId = await deployContract(contract.name, contract.file);
    if (txId) {
      deploymentResults[contract.name] = txId;
      // Wait a bit between deployments
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      console.error(`❌ Failed to deploy ${contract.name}`);
      process.exit(1);
    }
  }
  
  console.log('\n🎉 All contracts deployed successfully!');
  console.log('\nDeployment Summary:');
  console.log('==================');
  
  Object.entries(deploymentResults).forEach(([name, txId]) => {
    console.log(`${name}: ${txId}`);
  });
  
  // Save deployment info
  const deploymentInfo = {
    network: NETWORK,
    timestamp: new Date().toISOString(),
    contracts: deploymentResults
  };
  
  const outputPath = path.join(__dirname, '..', `deployment-${NETWORK}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: ${outputPath}`);
  
  // Generate environment variables
  console.log('\n📝 Environment Variables:');
  console.log('========================');
  Object.entries(deploymentResults).forEach(([name, txId]) => {
    const envName = name.toUpperCase().replace('-', '_') + '_CONTRACT';
    console.log(`${envName}=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.${name}`);
  });
}

// Run deployment
deployAll().catch(console.error);