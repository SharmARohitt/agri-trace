import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { useStacks } from '../../contexts/StacksContext'
import { Users, MapPin, Shield, Star } from 'lucide-react'
import Link from 'next/link'

export default function Farmers() {
  const { isSignedIn } = useStacks()
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchFarmers()
  }, [filter])

  const fetchFarmers = async () => {
    try {
      setLoading(true)
      // Mock data - in production, this would fetch from the backend
      const mockFarmers = [
        {
          id: 'ST1FARMER1...',
          name: 'Green Valley Organics',
          region: 'California',
          verified: true,
          totalBatches: 45,
          totalRevenue: 125000,
          reputationScore: 95,
          specialties: ['Organic Vegetables', 'Fruits'],
          joinDate: '2024-01-15'
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
          joinDate: '2024-02-20'
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
          joinDate: '2024-03-10'
        }
      ]
      
      const filteredFarmers = filter === 'verified' 
        ? mockFarmers.filter(f => f.verified)
        : mockFarmers
        
      setFarmers(filteredFarmers)
    } catch (error) {
      console.error('Error fetching farmers:', error)
    } finally {
      setLoading(false)
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
          
          {isSignedIn && (
            <Link href="/farmers/register" className="btn-primary">
              Register as Farmer
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Farmers
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
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{farmer.name}</h3>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{farmer.region}</span>
                      </div>
                    </div>
                  </div>
                  
                  {farmer.verified && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <Shield className="w-4 h-4" />
                      <span className="text-xs font-medium">Verified</span>
                    </div>
                  )}
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

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    href={`/farmers/${farmer.id}`}
                    className="btn-outline w-full text-center"
                  >
                    View Profile
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