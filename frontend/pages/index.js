import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useStacks } from '../contexts/StacksContext'
import { Sprout, Package, DollarSign, Users, TrendingUp, Shield } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const { isSignedIn, stxAddress } = useStacks()
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalBatches: 0,
    totalValue: 0,
    verifiedFarmers: 0
  })

  useEffect(() => {
    // Fetch dashboard stats
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // This would fetch real stats from the backend
      setStats({
        totalFarmers: 1247,
        totalBatches: 3892,
        totalValue: 2847392,
        verifiedFarmers: 1089
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const features = [
    {
      icon: Shield,
      title: 'Verified Origins',
      description: 'Every product batch is verified and tracked from farm to consumer',
      color: 'text-primary-600'
    },
    {
      icon: DollarSign,
      title: 'Fair Payments',
      description: 'Secure STX escrow ensures farmers receive fair compensation',
      color: 'text-secondary-600'
    },
    {
      icon: Package,
      title: 'Supply Chain Tracking',
      description: 'Complete transparency through every step of the supply chain',
      color: 'text-blue-600'
    },
    {
      icon: Users,
      title: 'Farmer Network',
      description: 'Connect directly with verified farmers and their produce',
      color: 'text-purple-600'
    }
  ]

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to AgriTrace
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Blockchain-powered transparency for agricultural supply chains. 
            Ensuring authenticity, fair trade, and complete traceability from farm to table.
          </p>
          
          {!isSignedIn && (
            <div className="flex justify-center space-x-4">
              <button className="btn-primary text-lg px-8 py-3">
                Get Started
              </button>
              <Link href="/track" className="btn-outline text-lg px-8 py-3">
                Track Product
              </Link>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-4">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalFarmers.toLocaleString()}</h3>
            <p className="text-gray-600">Registered Farmers</p>
          </div>
          
          <div className="card text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-secondary-100 rounded-lg mx-auto mb-4">
              <Package className="w-6 h-6 text-secondary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalBatches.toLocaleString()}</h3>
            <p className="text-gray-600">Product Batches</p>
          </div>
          
          <div className="card text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">${stats.totalValue.toLocaleString()}</h3>
            <p className="text-gray-600">Total Trade Value</p>
          </div>
          
          <div className="card text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.verifiedFarmers.toLocaleString()}</h3>
            <p className="text-gray-600">Verified Farmers</p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card">
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        {isSignedIn && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/farmers/register" className="btn-primary text-center">
                Register as Farmer
              </Link>
              <Link href="/products/create" className="btn-secondary text-center">
                Add Product Batch
              </Link>
              <Link href="/marketplace" className="btn-outline text-center">
                Browse Marketplace
              </Link>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Sprout className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New organic tomatoes batch registered</p>
                <p className="text-xs text-gray-500">Farm: Green Valley Organics • 2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-secondary-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Wheat batch shipped to distributor</p>
                <p className="text-xs text-gray-500">Batch ID: WH-2024-001 • 4 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Payment released to farmer</p>
                <p className="text-xs text-gray-500">Amount: 1,250 STX • 6 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}