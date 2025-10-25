import { useState } from 'react'
import Layout from '../../components/Layout'
import { useStacks } from '../../contexts/StacksContext'
import { openContractCall } from '@stacks/connect'
import { stringAsciiCV } from '@stacks/transactions'
import { User, MapPin, FileText, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function RegisterFarmer() {
  const { isSignedIn, stxAddress, network } = useStacks()
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isSignedIn) {
      setError('Please connect your wallet first')
      return
    }

    if (!formData.name.trim() || !formData.region.trim()) {
      setError('Name and region are required')
      return
    }

    if (formData.name.trim().length > 100) {
      setError('Name must be 100 characters or less')
      return
    }

    if (formData.region.trim().length > 50) {
      setError('Region must be 50 characters or less')
      return
    }

    // Check if farmer is already registered
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/farmers/${stxAddress}`)
      if (response.ok) {
        const data = await response.json()
        if (data.farmer && data.farmer !== '(none)') {
          setError('You are already registered as a farmer. Check the Farmers Directory to see your profile.')
          return
        }
      }
    } catch (error) {
      console.log('Could not check existing registration, proceeding...')
    }

    try {
      setLoading(true)
      setError('')
      
      const functionArgs = [
        stringAsciiCV(formData.name.trim()),
        stringAsciiCV(formData.region.trim())
      ]

      const txOptions = {
        contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        contractName: 'farmer-registry',
        functionName: 'register-farmer',
        functionArgs,
        network,
        onFinish: (data) => {
          console.log('Transaction submitted:', data.txId)
          setSuccess(`Registration submitted! Transaction ID: ${data.txId}`)
          setFormData({ name: '', region: '', description: '' })
          setLoading(false)
          
          // Notify user about directory update
          setTimeout(() => {
            setSuccess(prev => prev + '\n\nYour profile will appear in the Farmers Directory once the transaction is confirmed on the blockchain (usually within 10-20 minutes).')
          }, 2000)
        },
        onCancel: () => {
          console.log('Transaction cancelled')
          setLoading(false)
        }
      }

      await openContractCall(txOptions)
    } catch (error) {
      console.error('Registration error:', error)
      
      // Handle specific error cases
      if (error.message && error.message.includes('u101')) {
        setError('You are already registered as a farmer! You can skip this step and start creating product batches.')
      } else if (error.message && error.message.includes('u103')) {
        setError('Invalid name or region. Please ensure both fields are filled and not too long.')
      } else {
        setError('Failed to register farmer. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (!isSignedIn) {
    return (
      <Layout>
        <div className="max-w-md mx-auto text-center py-12">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Wallet Required</h2>
          <p className="text-gray-600 mb-6">
            Please connect your Stacks wallet to register as a farmer.
          </p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Register as Farmer</h1>
          <p className="text-gray-600">
            Join the AgriTrace network and start tracking your produce on the blockchain
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Farmer Name */}
            <div>
              <label htmlFor="name" className="label">
                <User className="w-4 h-4 inline mr-2" />
                Farmer/Farm Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your name or farm name"
                required
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be displayed publicly on your farmer profile
              </p>
            </div>

            {/* Region */}
            <div>
              <label htmlFor="region" className="label">
                <MapPin className="w-4 h-4 inline mr-2" />
                Region/Location *
              </label>
              <input
                type="text"
                id="region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., California, Texas, Ontario"
                required
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">
                General region where your farm is located
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="label">
                <FileText className="w-4 h-4 inline mr-2" />
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field"
                rows={4}
                placeholder="Tell buyers about your farm, farming practices, specialties..."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Wallet Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Registration Details</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Wallet Address:</strong> {stxAddress}</p>
                <p><strong>Network:</strong> {network.isMainnet() ? 'Mainnet' : 'Testnet'}</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`border rounded-lg p-4 ${
                error.includes('already registered') 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className={`flex items-center space-x-2 ${
                  error.includes('already registered') 
                    ? 'text-blue-700' 
                    : 'text-red-700'
                }`}>
                  <AlertCircle className="w-4 h-4" />
                  <div className="text-sm">
                    <p className="font-medium">{error}</p>
                    {error.includes('already registered') && (
                      <div className="mt-3 flex space-x-3">
                        <Link href="/products/create" className="btn-primary text-xs px-3 py-1">
                          Create Product Batch
                        </Link>
                        <Link href="/dashboard" className="btn-secondary text-xs px-3 py-1">
                          View Dashboard
                        </Link>
                        <Link href="/farmers" className="btn-outline text-xs px-3 py-1">
                          View Farmers Directory
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-green-700 text-sm">
                  <p className="font-medium">Registration Successful!</p>
                  <p className="mt-1">{success}</p>
                  <p className="mt-2">
                    Your registration is now on the blockchain. You can start adding product batches once verified.
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Registering...' : 'Register Farmer'}
            </button>
          </form>

          {/* Info Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">What happens next?</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">1</span>
                <p>Your registration will be recorded on the Stacks blockchain</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">2</span>
                <p>Wait for verification from authorized agencies (government/NGO)</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">3</span>
                <p>Once verified, you can start recording product batches</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">4</span>
                <p>Buyers can discover and purchase your verified produce</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}