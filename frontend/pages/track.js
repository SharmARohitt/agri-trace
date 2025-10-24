import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { Search, Package, MapPin, Calendar, User, Truck, Warehouse, ShoppingCart, QrCode } from 'lucide-react'
import QRCode from 'react-qr-code'

export default function Track() {
  const router = useRouter()
  const [batchId, setBatchId] = useState('')
  const [batchData, setBatchData] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    if (router.query.batch) {
      setBatchId(router.query.batch)
      handleSearch(router.query.batch)
    }
  }, [router.query.batch])

  const handleSearch = async (searchBatchId = batchId) => {
    if (!searchBatchId.trim()) {
      setError('Please enter a batch ID')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      // Mock data - in production, this would fetch from the backend API
      const mockBatchData = {
        batchId: searchBatchId,
        productType: 'Organic Tomatoes',
        quantity: 100,
        unit: 'kg',
        farmer: 'Green Valley Organics',
        farmerAddress: 'ST1FARMER1...',
        region: 'California',
        status: 'transported',
        statusText: 'In Transit',
        pricePerUnit: 5.50,
        qualityGrade: 'A',
        harvestDate: '2024-01-15',
        expiryDate: '2024-01-25',
        verified: true,
        currentLocation: 'Distribution Center Alpha'
      }

      const mockHistory = [
        {
          id: 1,
          status: 'produced',
          statusText: 'Produced',
          timestamp: '2024-01-15T08:00:00Z',
          actor: 'Green Valley Organics',
          location: 'Farm - Field 7',
          notes: 'Organic tomatoes harvested at optimal ripeness',
          temperature: 22,
          humidity: 65,
          icon: Package
        },
        {
          id: 2,
          status: 'transported',
          statusText: 'Picked Up',
          timestamp: '2024-01-15T14:30:00Z',
          actor: 'FreshTrans Logistics',
          location: 'Farm - Loading Dock',
          notes: 'Batch loaded onto refrigerated truck TR-001',
          temperature: 4,
          humidity: 85,
          icon: Truck
        },
        {
          id: 3,
          status: 'transported',
          statusText: 'In Transit',
          timestamp: '2024-01-15T16:45:00Z',
          actor: 'FreshTrans Logistics',
          location: 'Highway 101 - Mile 45',
          notes: 'En route to distribution center, temperature maintained',
          temperature: 4,
          humidity: 85,
          icon: Truck
        },
        {
          id: 4,
          status: 'stored',
          statusText: 'Arrived at Distribution Center',
          timestamp: '2024-01-16T09:15:00Z',
          actor: 'Distribution Center Alpha',
          location: 'Distribution Center Alpha - Bay 3',
          notes: 'Quality inspection passed, moved to cold storage',
          temperature: 2,
          humidity: 90,
          icon: Warehouse
        }
      ]

      setBatchData(mockBatchData)
      setHistory(mockHistory)
    } catch (error) {
      console.error('Error fetching batch data:', error)
      setError('Failed to fetch batch information. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'produced': return 'bg-blue-500'
      case 'transported': return 'bg-yellow-500'
      case 'stored': return 'bg-purple-500'
      case 'sold': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Track Product Batch</h1>
          <p className="text-gray-600">
            Enter a batch ID to view the complete supply chain history
          </p>
        </div>

        {/* Search */}
        <div className="card max-w-2xl mx-auto">
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                placeholder="Enter batch ID (e.g., BATCH-001)"
                className="input-field"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Searching...' : 'Track'}</span>
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Batch Information */}
        {batchData && (
          <div className="space-y-6">
            {/* Batch Details Card */}
            <div className="card">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {batchData.productType}
                  </h2>
                  <p className="text-gray-600">Batch ID: {batchData.batchId}</p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="btn-outline flex items-center space-x-2"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>QR Code</span>
                  </button>
                </div>
              </div>

              {showQR && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                  <QRCode 
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/track?batch=${batchData.batchId}`}
                    size={128}
                    className="mx-auto mb-2"
                  />
                  <p className="text-sm text-gray-600">
                    Scan to track this batch
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Quantity</h3>
                  <p className="text-2xl font-bold text-primary-600">
                    {batchData.quantity} {batchData.unit}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Current Status</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(batchData.status)}`}>
                    {batchData.statusText}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Quality Grade</h3>
                  <p className="text-2xl font-bold text-secondary-600">
                    Grade {batchData.qualityGrade}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Price</h3>
                  <p className="text-2xl font-bold text-green-600">
                    ${batchData.pricePerUnit}/{batchData.unit}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Farmer</h3>
                    <p className="text-gray-600">{batchData.farmer}</p>
                    <p className="text-sm text-gray-500">{batchData.region}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Harvest Date</h3>
                    <p className="text-gray-600">{new Date(batchData.harvestDate).toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Current Location</h3>
                    <p className="text-gray-600">{batchData.currentLocation}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Supply Chain History */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Supply Chain History</h2>
              
              <div className="space-y-6">
                {history.map((event, index) => (
                  <div key={event.id} className="flex space-x-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getStatusColor(event.status)}`}>
                        <event.icon className="w-5 h-5" />
                      </div>
                      {index < history.length - 1 && (
                        <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 pb-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{event.statusText}</h3>
                        <span className="text-sm text-gray-500">
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{event.actor}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                        
                        {event.notes && (
                          <p className="text-gray-700 mt-2">{event.notes}</p>
                        )}
                        
                        {(event.temperature !== undefined || event.humidity !== undefined) && (
                          <div className="flex space-x-4 mt-2 text-xs">
                            {event.temperature !== undefined && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Temp: {event.temperature}°C
                              </span>
                            )}
                            {event.humidity !== undefined && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                Humidity: {event.humidity}%
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sample Batch IDs */}
        {!batchData && (
          <div className="card max-w-2xl mx-auto">
            <h3 className="font-medium text-gray-900 mb-4">Try these sample batch IDs:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {['BATCH-001', 'BATCH-002', 'BATCH-003'].map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    setBatchId(id)
                    handleSearch(id)
                  }}
                  className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="font-mono text-sm text-primary-600">{id}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}