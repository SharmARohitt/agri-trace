import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { useStacks } from '../../contexts/StacksContext'
import { Package, MapPin, Calendar, Star, Filter, RefreshCw } from 'lucide-react'
import Link from 'next/link'


export default function Products() {
  const { isSignedIn } = useStacks()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    status: 'all',
    productType: 'all',
    sortBy: 'newest'
  })

  useEffect(() => {
    fetchProducts()
  }, [filter])

  // Refresh products when component mounts or when coming back to page
  useEffect(() => {
    const handleFocus = () => {
      fetchProducts()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      
      // Fetch products from backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/batches?${new URLSearchParams({
        status: filter.status,
        productType: filter.productType,
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
            farmer: 'Rohit Sharma',
            farmerAddress: 'STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72',
            region: 'Delhi',
            status: 'available',
            statusText: 'Available',
            pricePerUnit: 5.50,
            qualityGrade: 'A',
            harvestDate: '2024-01-15',
            expiryDate: '2024-01-25',
            verified: false,
            currentLocation: 'Farm Storage'
          },
          {
            batchId: 'BATCH-002',
            productType: 'Premium Wheat',
            quantity: 500,
            unit: 'kg',
            farmer: 'Rohit Sharma',
            farmerAddress: 'STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72',
            region: 'Delhi',
            status: 'available',
            statusText: 'Available',
            pricePerUnit: 2.25,
            qualityGrade: 'A',
            harvestDate: '2024-01-10',
            expiryDate: '2024-06-10',
            verified: false,
            currentLocation: 'Farm Storage'
          },
          {
            batchId: 'BATCH-003',
            productType: 'Fresh Carrots',
            quantity: 75,
            unit: 'kg',
            farmer: 'Rohit Sharma',
            farmerAddress: 'STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72',
            region: 'Delhi',
            status: 'available',
            statusText: 'Available',
            pricePerUnit: 3.80,
            qualityGrade: 'A',
            harvestDate: '2024-01-12',
            expiryDate: '2024-02-12',
            verified: false,
            currentLocation: 'Farm Storage'
          }
        ]
      }
      
      // Convert API format to products page format
      const formattedProducts = products.map(product => ({
        batchId: product.batchId,
        productType: product.productType,
        quantity: product.quantity,
        unit: product.unit,
        farmer: product.farmer?.name || product.farmer,
        farmerAddress: product.farmer?.id || product.farmerAddress,
        region: product.farmer?.region || product.region,
        status: product.status || 'produced',
        statusText: product.status === 'available' ? 'Available' : 'Harvested',
        pricePerUnit: product.pricePerUnit,
        qualityGrade: product.qualityGrade,
        harvestDate: product.harvestDate,
        expiryDate: product.expiryDate,
        verified: product.farmer?.verified || false,
        currentLocation: product.location || 'Farm Storage'
      }))
      
      let filteredProducts = [...formattedProducts]
      
      if (filter.status !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.status === filter.status)
      }
      
      if (filter.productType !== 'all') {
        filteredProducts = filteredProducts.filter(p => 
          p.productType.toLowerCase().includes(filter.productType.toLowerCase())
        )
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
          default: // newest
            return new Date(b.harvestDate) - new Date(a.harvestDate)
        }
      })
      
      setProducts(filteredProducts)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'produced': return 'bg-blue-100 text-blue-800'
      case 'transported': return 'bg-yellow-100 text-yellow-800'
      case 'stored': return 'bg-purple-100 text-purple-800'
      case 'sold': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Batches</h1>
            <p className="text-gray-600 mt-2">
              Track and discover agricultural products in the supply chain
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={fetchProducts}
              disabled={loading}
              className="btn-outline flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            {isSignedIn && (
              <Link href="/products/create" className="btn-primary">
                Add Product Batch
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-900">Filters</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Status</label>
              <select
                value={filter.status}
                onChange={(e) => setFilter({...filter, status: e.target.value})}
                className="input-field"
              >
                <option value="all">All Status</option>
                <option value="produced">Produced</option>
                <option value="transported">In Transit</option>
                <option value="stored">In Storage</option>
                <option value="sold">Sold</option>
              </select>
            </div>
            
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
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.batchId} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-secondary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{product.productType}</h3>
                      <p className="text-sm text-gray-500">ID: {product.batchId}</p>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                    {product.statusText}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Quantity:</span>
                    <span className="font-medium">{product.quantity} {product.unit}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Price:</span>
                    <span className="font-medium">${product.pricePerUnit}/{product.unit}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Quality:</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="font-medium">Grade {product.qualityGrade}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Farmer:</span>
                    <span className="font-medium">{product.farmer}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>{product.currentLocation}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Harvested: {new Date(product.harvestDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-2">
                  <Link
                    href={`/products/${product.batchId}`}
                    className="btn-outline flex-1 text-center"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/track?batch=${product.batchId}`}
                    className="btn-secondary flex-1 text-center"
                  >
                    Track
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {products.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">
              No product batches match your current filters.
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}