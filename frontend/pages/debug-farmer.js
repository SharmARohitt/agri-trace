import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useStacks } from '../contexts/StacksContext'

export default function DebugFarmer() {
  const { isSignedIn, stxAddress } = useStacks()
  const [farmerData, setFarmerData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const checkFarmerRegistration = async () => {
    if (!stxAddress) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/farmers/${stxAddress}`)
      const data = await response.json()
      
      console.log('Farmer API Response:', data)
      setFarmerData(data)
      
      if (response.ok && data.farmer && data.farmer !== '(none)') {
        setError('✅ SUCCESS: Farmer is already registered! You can skip registration and start using AgriTrace.')
      } else {
        setError('❌ Farmer is not registered yet. You need to complete registration first.')
      }
    } catch (err) {
      console.error('Error checking farmer:', err)
      setError('Error checking farmer registration: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isSignedIn && stxAddress) {
      checkFarmerRegistration()
    }
  }, [isSignedIn, stxAddress])

  if (!isSignedIn) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Debug Farmer Registration</h1>
          <p>Please connect your wallet to check farmer registration status.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Farmer Registration</h1>
        
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Wallet Information</h2>
          <div className="space-y-2">
            <p><strong>Address:</strong> {stxAddress}</p>
            <p><strong>Contract Address:</strong> {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}</p>
            <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL}</p>
          </div>
        </div>

        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Farmer Registration Status</h2>
            <button 
              onClick={checkFarmerRegistration}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Checking...' : 'Check Status'}
            </button>
          </div>
          
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800">{error}</p>
            </div>
          )}
          
          {farmerData && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">API Response:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(farmerData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Contract Information</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Farmer Registry Contract:</strong> {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}.farmer-registry</p>
            <p><strong>Function:</strong> register-farmer</p>
            <p><strong>Expected Parameters:</strong> name (string-ascii 100), region (string-ascii 50)</p>
          </div>
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">Possible Error Codes:</h3>
            <ul className="text-sm space-y-1">
              <li><strong>u101 (ERR-FARMER-EXISTS):</strong> Farmer is already registered</li>
              <li><strong>u103 (ERR-INVALID-REGION):</strong> Name or region is empty</li>
              <li><strong>u100 (ERR-NOT-AUTHORIZED):</strong> Authorization issue</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  )
}