import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { useStacks } from '../../contexts/StacksContext'
import { Users, MapPin, Shield, Star, RefreshCw, Search } from 'lucide-react'
import Link from 'next/link'

export default function Farmers() {
  const { isSignedIn, network } = useStacks()
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchFarmers()
  }, [filter, searchTerm])

  const fetchFarmers = async () => {
    try {
      setLoading(true)
      
      // In production, this would fetch from your backend API which queries the blockchain
      // For now, we'll use enhanced mock data that simulates real blockchain data
      const mockFarmers = [
        {
          id: 'STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72',
          name: 'Rohit Sharma',
          region: 'Delhi',
          verified: false,
          totalBatches: 0,
          totalRevenue: 0,
          reputationScore: 100,
          specialties: ['New Farmer'],
          joinDate: new Date().toISOString().split('T')[0],
          walletAddress: 'STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72',
          registrationBlock: 12345,
          isOnline: true
        },
        {
          id: 'ST1FARMER1...',
          name: 'Green Valley Organics',
          region: 'California',
          verified: true,
          totalBatches: 45,
          totalRevenue: 125000,
          reputationScore: 95,
          specialties: ['Organic Vegetables', 'Fruits'],
          joinDate: '2024-01-15',
          walletAddress: 'ST1FARMER1...',
          registrationBlock: 11000,
          isOnline: true
        },
        {
          id: 'ST1FARMER2...',
          name: 'Sunrise Wheat Farm',
          region: 'Kansas',
          verified: true,
          totalBatches: 32,
          totalRevenue: 89000,
          reputationScore: 88,
          specialties: ['Wheat', 'Corn'],
          joinDate: '2024-02-20',
          walletAddress: 'ST1FARMER2...',
          registrationBlock: 11500,
          isOnline: false
        },
        {
          id: 'ST1FARMER3...',
          name: 'Mountain Fresh Produce',
          region: 'Colorado',
          verified: false,
          totalBatches: 12,
          totalRevenue: 34000,
          reputationScore: 78,
          specialties: ['Alpine Vegetables'],
          joinDate: '2024-03-10',
          walletAddress: 'ST1FARMER3...',
          registrationBlock: 12000,
          isOnline: true
        }
      ]
      
      let filteredFarmers = [...mockFarmers]
      
      // Apply filters
      if (filter === 'verified') {
        filteredFarmers = filteredFarmers.filter(f => f.verified)
      } else if (filter === 'new') {
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        filteredFarmers = filteredFarmers.filter(f => new Date(f.joinDate) > oneWeekAgo)
      }
      
      // Apply search
      if (searchTerm) {
        filteredFarmers = filteredFarmers.filter(f =>
          f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      }
      
      // Sort by join date (newest first)
      filteredFarmers.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
        
      setFarmers(filteredFarmers)
    } catch (error) {
      console.error('Error fetching farmers:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshFarmers = async () => {
    setRefreshing(true)
    await fetchFarmers()
    setRefreshing(false)
  }

  const checkFarmerOnBlockchain = async (farmerId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STACKS_API_URL}/v2/contracts/call-read/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}/farmer-registry/get-farmer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: farmerId,
          arguments: [`"${farmerId}"`]
        })
      })
      
      const data = await response.json()
      return data.result !== '(none)'
    } catch (error) {
      console.error('Error checking farmer on blockchain:', error)
      return false
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Farmers Directory</h1>
            <p className="text-gray-600 mt-2">
              Discover verified farmers and their produce in the AgriTrace network
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={refreshFarmers}
              disabled={refreshing}
              className="btn-outline flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            {isSignedIn && (
              <Link href="/farmers/register" className="btn-primary">
                Register as Farmer
              </Link>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search farmers by name, region, or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Farmers ({farmers.length})
              </button>
              <button
                onClick={() => setFilter('verified')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'verified' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Verified Only
              </button>
              <button
                onClick={() => setFilter('new')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'new' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                New This Week
              </button>
            </div>
          </div>
        </div>

        {/* Farmers Grid */}
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
            {farmers.map((farmer) => (
              <div key={farmer.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary-600" />
                      </div>
                      {farmer.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{farmer.name}</h3>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{farmer.region}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Joined: {new Date(farmer.joinDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    {farmer.verified && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <Shield className="w-4 h-4" />
                        <span className="text-xs font-medium">Verified</span>
                      </div>
                    )}
                    {farmer.id === 'STS1D1ZNN1D0MKS62RCPMF5Z9RG9BREMC6MZ5R72' && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                        You
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Batches:</span>
                    <span className="font-medium">{farmer.totalBatches}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Revenue:</span>
                    <span className="font-medium">${farmer.totalRevenue.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Reputation:</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="font-medium">{farmer.reputationScore}/100</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Wallet:</span>
                    <span className="font-mono text-xs">
                      {farmer.walletAddress.slice(0, 6)}...{farmer.walletAddress.slice(-4)}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-xs text-gray-500">Specialties:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {farmer.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-2">
                  <Link
                    href={`/farmers/${farmer.id}`}
                    className="btn-outline flex-1 text-center"
                  >
                    View Profile
                  </Link>
                  <Link
                    href={`https://explorer.hiro.so/address/${farmer.walletAddress}?chain=testnet`}
                    target="_blank"
                    className="btn-secondary flex-1 text-center"
                  >
                    View on Explorer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {farmers.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No farmers found</h3>
            <p className="text-gray-500">
              {filter === 'verified' 
                ? 'No verified farmers match your criteria.' 
                : 'No farmers are registered yet.'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}