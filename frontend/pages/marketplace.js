import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useStacks } from '../contexts/StacksContext'
import { openContractCall } from '@stacks/connect'
import { stringAsciiCV, uintCV, principalCV } from '@stacks/transactions'
import { 
  ShoppingCart, Package, MapPin, Calendar, Star, Filter, 
  Search, DollarSign, Scale, User, Shield, Eye, Heart
} from 'lucide-react'
import Link from 'next/link'

export default function Marketplace() {
  const { isSignedIn, stxAddress, network } = useStacks()
  const [products, setProducts] = useState([])
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState({
    productType: 'all',
    qualityGrade: 'all',
    priceRange: 'all',
    region: 'all',
    verifiedOnly: false,
    sortBy: 'newest'
  })
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [purchaseLoading, setPurchaseLoading] = useState(false)

  useEffect(() => {
    fetchMarketplaceData()
  }, [filter, searchTerm])

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true)
      
      // Fetch products from backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/batches?${new URLSearchParams({
        productType: filter.productType,
        qualityGrade: filter.qualityGrade,
        verifiedOnly: filter.verifiedOnly,
        sortBy: filter.sortBy
      })}`)
      
      let products = []
      
      if (response.ok) {
        const data = await response.json()
        products = data.products || []
      } else {
        // Fallback to mock data if API fails
        products = [
        {
          batchId: 'BATCH-001',
          productType: 'Organic Tomatoes',
          quantity: 100,
          unit: 'kg',
          pricePerUnit: 5.50,
          qualityGrade: 'A',
          harvestDate: '2024-01-15',
          expiryDate: '2024-01-25',
          location: 'Green Valley Farm, California',
          farmer: {
            id: 'STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72',
            name: 'Green Valley Organics',
            region: 'California',
            verified: true,
            reputationScore: 95
          },
          status: 'available',
          images: ['/api/placeholder/300/200'],
          description: 'Fresh organic tomatoes grown using sustainable farming practices.',
          certifications: ['Organic', 'Non-GMO', 'Fair Trade']
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
          location: 'Sunrise Farm, Kansas',
          farmer: {
            id: 'ST2FARMER2...',
            name: 'Sunrise Wheat Farm',
            region: 'Kansas',
            verified: true,
            reputationScore: 88
          },
          status: 'available',
          images: ['/api/placeholder/300/200'],
          description: 'High-quality wheat perfect for bread making and baking.',
          certifications: ['Quality Assured', 'Sustainable']
        },
        {
          batchId: 'BATCH-003',
          productType: 'Alpine Vegetables',
          quantity: 75,
          unit: 'kg',
          pricePerUnit: 7.80,
          qualityGrade: 'A',
          harvestDate: '2024-01-12',
          expiryDate: '2024-01-22',
          location: 'Mountain Fresh Farm, Colorado',
          farmer: {
            id: 'ST3FARMER3...',
            name: 'Mountain Fresh Produce',
            region: 'Colorado',
            verified: false,
            reputationScore: 78
          },
          status: 'available',
          images: ['/api/placeholder/300/200'],
          description: 'Fresh alpine vegetables grown at high altitude for superior taste.',
          certifications: ['Mountain Grown']
        }
        ]
      }

      // Apply additional client-side filters
      let filteredProducts = [...products]

      if (searchTerm) {
        filteredProducts = filteredProducts.filter(product =>
          product.productType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.location.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      if (filter.productType !== 'all') {
        filteredProducts = filteredProducts.filter(product =>
          product.productType.toLowerCase().includes(filter.productType.toLowerCase())
        )
      }

      if (filter.qualityGrade !== 'all') {
        filteredProducts = filteredProducts.filter(product =>
          product.qualityGrade === filter.qualityGrade
        )
      }

      if (filter.verifiedOnly) {
        filteredProducts = filteredProducts.filter(product => product.farmer.verified)
      }

      // Sort products
      filteredProducts.sort((a, b) => {
        switch (filter.sortBy) {
          case 'price-low':
            return a.pricePerUnit - b.pricePerUnit
          case 'price-high':
            return b.pricePerUnit - a.pricePerUnit
          case 'quantity':
            return b.quantity - a.quantity
          case 'reputation':
            return b.farmer.reputationScore - a.farmer.reputationScore
          default: // newest
            return new Date(b.harvestDate) - new Date(a.harvestDate)
        }
      })

      setProducts(filteredProducts)
    } catch (error) {
      console.error('Error fetching marketplace data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (product) => {
    if (!isSignedIn) {
      alert('Please connect your wallet to make a purchase')
      return
    }

    try {
      setPurchaseLoading(true)
      setSelectedProduct(product)

      const escrowId = `ESCROW-${Date.now()}`
      const totalAmount = Math.floor(product.pricePerUnit * product.quantity * 100) // Convert to cents
      const deliveryDeadline = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days from now

      const functionArgs = [
        stringAsciiCV(escrowId),
        stringAsciiCV(product.batchId),
        principalCV(product.farmer.id),
        uintCV(totalAmount),
        uintCV(deliveryDeadline)
      ]

      const txOptions = {
        contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        contractName: 'payment-escrow',
        functionName: 'create-escrow',
        functionArgs,
        network,
        onFinish: (data) => {
          console.log('Purchase transaction submitted:', data.txId)
          alert(`Purchase successful! Transaction ID: ${data.txId}`)
          setSelectedProduct(null)
          setPurchaseLoading(false)
        },
        onCancel: () => {
          console.log('Purchase cancelled')
          setSelectedProduct(null)
          setPurchaseLoading(false)
        }
      }

      await openContractCall(txOptions)
    } catch (error) {
      console.error('Purchase error:', error)
      alert('Failed to complete purchase. Please try again.')
    } finally {
      setPurchaseLoading(false)
    }
  }

  const getQualityColor = (grade) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100'
      case 'B': return 'text-yellow-600 bg-yellow-100'
      case 'C': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Marketplace</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover fresh, verified agricultural products directly from farmers. 
            Every purchase is secured with blockchain technology.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products, farmers, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div>
                <label className="label">Product Type</label>
                <select
                  value={filter.productType}
                  onChange={(e) => setFilter({...filter, productType: e.target.value})}
                  className="input-field"
                >
                  <option value="all">All Products</option>
                  <option value="tomatoes">Tomatoes</option>
                  <option value="wheat">Wheat</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                </select>
              </div>

              <div>
                <label className="label">Quality Grade</label>
                <select
                  value={filter.qualityGrade}
                  onChange={(e) => setFilter({...filter, qualityGrade: e.target.value})}
                  className="input-field"
                >
                  <option value="all">All Grades</option>
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                </select>
              </div>

              <div>
                <label className="label">Region</label>
                <select
                  value={filter.region}
                  onChange={(e) => setFilter({...filter, region: e.target.value})}
                  className="input-field"
                >
                  <option value="all">All Regions</option>
                  <option value="california">California</option>
                  <option value="kansas">Kansas</option>
                  <option value="colorado">Colorado</option>
                </select>
              </div>

              <div>
                <label className="label">Sort By</label>
                <select
                  value={filter.sortBy}
                  onChange={(e) => setFilter({...filter, sortBy: e.target.value})}
                  className="input-field"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="quantity">Quantity</option>
                  <option value="reputation">Farmer Reputation</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filter.verifiedOnly}
                    onChange={(e) => setFilter({...filter, verifiedOnly: e.target.checked})}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Verified Only</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">
              Try adjusting your search criteria or check back later for new products.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.batchId} className="card hover:shadow-lg transition-shadow">
                {/* Product Image */}
                <div className="relative h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-400" />
                  </div>
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(product.qualityGrade)}`}>
                      Grade {product.qualityGrade}
                    </span>
                    {product.farmer.verified && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{product.productType}</h3>
                    <p className="text-sm text-gray-600">ID: {product.batchId}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-1">
                      <Scale className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{product.quantity} {product.unit}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-bold text-green-600">${product.pricePerUnit}/{product.unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{product.farmer.name}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span>{product.farmer.reputationScore}/100</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{product.location}</span>
                  </div>

                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Harvested: {new Date(product.harvestDate).toLocaleDateString()}</span>
                  </div>

                  {product.certifications && (
                    <div className="flex flex-wrap gap-1">
                      {product.certifications.map((cert, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-2">
                  <Link
                    href={`/track?batch=${product.batchId}`}
                    className="btn-outline flex-1 text-center flex items-center justify-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </Link>
                  
                  <button
                    onClick={() => handlePurchase(product)}
                    disabled={purchaseLoading && selectedProduct?.batchId === product.batchId}
                    className="btn-primary flex-1 flex items-center justify-center space-x-1"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>
                      {purchaseLoading && selectedProduct?.batchId === product.batchId 
                        ? 'Processing...' 
                        : `Buy $${(product.pricePerUnit * product.quantity).toFixed(2)}`
                      }
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {isSignedIn && (
          <div className="card text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Are you a farmer?
            </h3>
            <p className="text-gray-600 mb-4">
              List your products on the marketplace and reach buyers directly.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/farmers/register" className="btn-outline">
                Register as Farmer
              </Link>
              <Link href="/products/create" className="btn-primary">
                Add Product
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}