const { StacksTestnet } = require('@stacks/network');
const { 
  callReadOnlyFunction,
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  stringAsciiCV,
  uintCV,
  principalCV
} = require('@stacks/transactions');

// Test configuration
const network = new StacksTestnet();
const PRIVATE_KEY = process.env.TEST_PRIVATE_KEY || 'your-test-private-key';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

async function testFarmerRegistry() {
  console.log('\n🧪 Testing Farmer Registry Contract...');
  
  try {
    // Test farmer registration
    const registerTx = await makeContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: 'farmer-registry',
      functionName: 'register-farmer',
      functionArgs: [
        stringAsciiCV('John Doe'),
        stringAsciiCV('California')
      ],
      senderKey: PRIVATE_KEY,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    });
    
    const registerResult = await broadcastTransaction(registerTx, network);
    console.log('✅ Farmer registration:', registerResult.txid);
    
    // Wait for transaction to be mined
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Test read-only function
    const farmerData = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: 'farmer-registry',
      functionName: 'get-farmer',
      functionArgs: [principalCV(CONTRACT_ADDRESS)],
      network,
      senderAddress: CONTRACT_ADDRESS,
    });
    
    console.log('📖 Farmer data:', farmerData);
    
  } catch (error) {
    console.error('❌ Farmer registry test failed:', error);
  }
}

async function testProductTracking() {
  console.log('\n🧪 Testing Product Tracking Contract...');
  
  try {
    // Test batch recording
    const recordTx = await makeContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: 'product-tracking',
      functionName: 'record-batch',
      functionArgs: [
        stringAsciiCV('BATCH-TEST-001'),
        stringAsciiCV('Organic Tomatoes'),
        uintCV(100),
        stringAsciiCV('kg'),
        uintCV(500),
        stringAsciiCV('A'),
        uintCV(Date.now()),
        uintCV(Date.now() + 86400000), // 1 day expiry
        stringAsciiCV('Test Farm Location')
      ],
      senderKey: PRIVATE_KEY,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    });
    
    const recordResult = await broadcastTransaction(recordTx, network);
    console.log('✅ Batch recording:', recordResult.txid);
    
    // Wait for transaction to be mined
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Test read-only function
    const batchData = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: 'product-tracking',
      functionName: 'get-batch',
      functionArgs: [stringAsciiCV('BATCH-TEST-001')],
      network,
      senderAddress: CONTRACT_ADDRESS,
    });
    
    console.log('📖 Batch data:', batchData);
    
  } catch (error) {
    console.error('❌ Product tracking test failed:', error);
  }
}

async function testPaymentEscrow() {
  console.log('\n🧪 Testing Payment Escrow Contract...');
  
  try {
    // Test escrow creation
    const escrowTx = await makeContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: 'payment-escrow',
      functionName: 'create-escrow',
      functionArgs: [
        stringAsciiCV('ESCROW-TEST-001'),
        stringAsciiCV('BATCH-TEST-001'),
        principalCV(CONTRACT_ADDRESS), // farmer address
        uintCV(50000), // 50,000 microSTX
        uintCV(Math.floor(Date.now() / 1000) + 86400) // 1 day deadline
      ],
      senderKey: PRIVATE_KEY,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    });
    
    const escrowResult = await broadcastTransaction(escrowTx, network);
    console.log('✅ Escrow creation:', escrowResult.txid);
    
    // Wait for transaction to be mined
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Test read-only function
    const escrowData = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: 'payment-escrow',
      functionName: 'get-escrow',
      functionArgs: [stringAsciiCV('ESCROW-TEST-001')],
      network,
      senderAddress: CONTRACT_ADDRESS,
    });
    
    console.log('📖 Escrow data:', escrowData);
    
  } catch (error) {
    console.error('❌ Payment escrow test failed:', error);
  }
}

async function runAllTests() {
  console.log('🚀 Starting contract integration tests...');
  console.log(`Network: ${network.coreApiUrl}`);
  
  await testFarmerRegistry();
  await testProductTracking();
  await testPaymentEscrow();
  
  console.log('\n✅ All tests completed!');
}

// Run tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testFarmerRegistry,
  testProductTracking,
  testPaymentEscrow,
  runAllTests
};