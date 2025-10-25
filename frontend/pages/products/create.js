import { useState } from 'react'
import Layout from '../../components/Layout'
import { useStacks } from '../../contexts/StacksContext'
import { openContractCall } from '@stacks/connect'
import { stringAsciiCV, uintCV } from '@stacks/transactions'
import { Package, Calendar, DollarSign, Scale, MapPin, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function CreateProduct() {
  const { isSignedIn, stxAddress, network } = useStacks()
  const [formData, setFormData] = useState({
    batchId: '',
    productType: '',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
    qualityGrade: 'A',
    harvestDate: '',
    expiryDate: '',
    location: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const productTypes = [
    'Organic Tomatoes', 'Wheat', 'Rice', 'Corn', 'Potatoes', 'Onions', 
    'Carrots', 'Apples', 'Oranges', 'Bananas', 'Lettuce', 'Spinach',
    'Bell Peppers', 'Cucumbers', 'Broccoli', 'Other'
  ]

  const units = ['kg', 'lbs', 'tons', 'bushels', 'crates', 'bags']
  const qualityGrades = ['A', 'B', 'C']

  const generateBatchId = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    return `BATCH-${timestamp}-${random}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isSignedIn) {
      setError('Please connect your wallet first')
      return
    }

    // Validation
    if (!formData.batchId || !formData.productType || !formData.quantity || 
        !formData.pricePerUnit || !formData.harvestDate || !formData.location) {
      setError('Please fill in all required fields')
      return
    }

    if (new Date(formData.harvestDate) > new Date()) {
      setError('Harvest date cannot be in the future')
      return
    }

    if (formData.expiryDate && new Date(formData.expiryDate) <= new Date(formData.harvestDate)) {
      setError('Expiry date must be after harvest date')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const harvestTimestamp = Math.floor(new Date(formData.harvestDate).getTime() / 1000)
      const expiryTimestamp = formData.expiryDate 
        ? Math.floor(new Date(formData.expiryDate).getTime() / 1000)
        : harvestTimestamp + (30 * 24 * 60 * 60) // Default 30 days if no expiry

      const functionArgs = [
        stringAsciiCV(formData.batchId.trim()),
        stringAsciiCV(formData.productType.trim()),
        uintCV(parseInt(formData.quantity)),
        stringAsciiCV(formData.unit),
        uintCV(Math.floor(parseFloat(formData.pricePerUnit) * 100)), // Convert to cents
        stringAsciiCV(formData.qualityGrade),
        uintCV(harvestTimestamp),
        uintCV(expiryTimestamp),
        stringAsciiCV(formData.location.trim())
      ]

      const txOptions = {
        contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        contractName: 'product-tracking',
        functionName: 'record-batch',
        functionArgs,
        network,
        onFinish: async (data) => {
          console.log('Transaction submitted:', data.txId)
          setSuccess(`Product batch created successfully! Transaction ID: ${data.txId}`)
          
          // Notify backend about the new product
          try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/batches`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                batchId: formData.batchId,
                productType: formData.productType,
                quantity: formData.quantity,
                unit: formData.unit,
                pricePerUnit: formData.pricePerUnit,
                qualityGrade: formData.qualityGrade,
                harvestDate: formData.harvestDate,
                expiryDate: formData.expiryDate,
                location: formData.location,
                farmerAddress: stxAddress,
                txId: data.txId
              })
            });
          } catch (error) {
            console.error('Error notifying backend:', error);
          }
          
          setFormData({
            batchId: '',
            productType: '',
            quantity: '',
            unit: 'kg',
            pricePerUnit: '',
            qualityGrade: 'A',
            harvestDate: '',
            expiryDate: '',
            location: ''
          })
        },
        onCancel: () => {
          console.log('Transaction cancelled')
          setLoading(false)
        }
      }

      await openContractCall(txOptions)
    } catch (error) {
      console.error('Product creation error:', error)
      setError('Failed to create product batch. Please try again.')
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
            Please connect your Stacks wallet to create product batches.
          </p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Add Product Batch</h1>
          <p className="text-gray-600">
            Record a new product batch on the blockchain for complete traceability
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Batch ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="batchId" className="label">
                  <Package className="w-4 h-4 inline mr-2" />
                  Batch ID *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="batchId"
                    name="batchId"
                    value={formData.batchId}
                    onChange={handleChange}
                    className="input-field flex-1"
                    placeholder="Enter unique batch ID"
                    required
                    maxLength={50}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, batchId: generateBatchId()})}
                    className="btn-outline px-3"
                  >
                    Generate
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Unique identifier for this product batch
                </p>
              </div>

              <div>
                <label htmlFor="productType" className="label">
                  Product Type *
                </label>
                <select
                  id="productType"
                  name="productType"
                  value={formData.productType}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Select product type</option>
                  {productTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quantity and Unit */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="quantity" className="label">
                  <Scale className="w-4 h-4 inline mr-2" />
                  Quantity *
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter quantity"
                  required
                  min="1"
                />
              </div>

              <div>
                <label htmlFor="unit" className="label">
                  Unit *
                </label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="qualityGrade" className="label">
                  Quality Grade *
                </label>
                <select
                  id="qualityGrade"
                  name="qualityGrade"
                  value={formData.qualityGrade}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  {qualityGrades.map((grade) => (
                    <option key={grade} value={grade}>Grade {grade}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pricePerUnit" className="label">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Price per {formData.unit || 'unit'} (USD) *
                </label>
                <input
                  type="number"
                  id="pricePerUnit"
                  name="pricePerUnit"
                  value={formData.pricePerUnit}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter price"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label htmlFor="location" className="label">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Farm Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Farm location or address"
                  required
                  maxLength={100}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="harvestDate" className="label">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Harvest Date *
                </label>
                <input
                  type="date"
                  id="harvestDate"
                  name="harvestDate"
                  value={formData.harvestDate}
                  onChange={handleChange}
                  className="input-field"
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label htmlFor="expiryDate" className="label">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="input-field"
                  min={formData.harvestDate}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for default 30-day expiry
                </p>
              </div>
            </div>

            {/* Farmer Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Farmer Information</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Wallet Address:</strong> {stxAddress}</p>
                <p><strong>Network:</strong> {network.isMainnet() ? 'Mainnet' : 'Testnet'}</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <div className="text-sm">
                    <p className="font-medium">Product Batch Created Successfully!</p>
                    <p className="mt-1">{success}</p>
                    <p className="mt-2">
                      Your product is now recorded on the blockchain and can be tracked through the supply chain.
                    </p>
                    <div className="mt-3 flex space-x-3">
                      <Link href="/products" className="btn-outline text-xs px-3 py-1">
                        View All Products
                      </Link>
                      <Link href="/marketplace" className="btn-secondary text-xs px-3 py-1">
                        View in Marketplace
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Creating Product Batch...' : 'Create Product Batch'}
            </button>
          </form>

          {/* Info Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">What happens next?</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">1</span>
                <p>Your product batch will be recorded on the Stacks blockchain</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">2</span>
                <p>A unique QR code will be generated for traceability</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">3</span>
                <p>Buyers can discover your product in the marketplace</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">4</span>
                <p>Track your product through the entire supply chain</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}