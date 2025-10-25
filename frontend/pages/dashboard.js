import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useStacks } from '../contexts/StacksContext'
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
    TrendingUp, DollarSign, Package, Users, Shield, Award,
    Calendar, MapPin, Star, ArrowUp, ArrowDown, Activity,
    Zap, Target, Globe, Leaf, Heart
} from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
    const { isSignedIn, stxAddress } = useStacks()
    const [dashboardData, setDashboardData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('6months')

    useEffect(() => {
        fetchDashboardData()
    }, [timeRange, stxAddress])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            if (!stxAddress) {
                setLoading(false)
                return
            }

            // Fetch real dashboard data from backend API
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/${stxAddress}`)

            if (response.ok) {
                const data = await response.json()
                setDashboardData(data)
            } else {
                // Fallback to mock data if API fails
                const mockData = {
                    userStats: {
                        totalRevenue: 15750,
                        totalBatches: 23,
                        averagePrice: 4.85,
                        reputationScore: 94,
                        monthlyGrowth: 23.5,
                        totalSales: 2340,
                        verificationStatus: 'verified',
                        joinDate: '2024-01-15'
                    },
                    revenueData: [
                        { month: 'Jan', revenue: 1200, batches: 3, avgPrice: 4.2 },
                        { month: 'Feb', revenue: 1850, batches: 4, avgPrice: 4.6 },
                        { month: 'Mar', revenue: 2100, batches: 5, avgPrice: 4.8 },
                        { month: 'Apr', revenue: 2650, batches: 6, avgPrice: 5.1 },
                        { month: 'May', revenue: 3200, batches: 7, avgPrice: 5.3 },
                        { month: 'Jun', revenue: 4750, batches: 8, avgPrice: 5.8 }
                    ],
                    productDistribution: [
                        { name: 'Organic Tomatoes', value: 35, color: '#ef4444' },
                        { name: 'Premium Wheat', value: 25, color: '#f59e0b' },
                        { name: 'Fresh Vegetables', value: 20, color: '#10b981' },
                        { name: 'Seasonal Fruits', value: 15, color: '#8b5cf6' },
                        { name: 'Herbs & Spices', value: 5, color: '#06b6d4' }
                    ],
                    paymentHistory: [
                        {
                            id: 'PAY-001',
                            date: '2024-01-20',
                            amount: 1250,
                            batchId: 'BATCH-001',
                            buyer: 'Fresh Market Co.',
                            status: 'completed',
                            txId: '0x1234...5678'
                        },
                        {
                            id: 'PAY-002',
                            date: '2024-01-18',
                            amount: 890,
                            batchId: 'BATCH-002',
                            buyer: 'Organic Foods Ltd.',
                            status: 'completed',
                            txId: '0x2345...6789'
                        },
                        {
                            id: 'PAY-003',
                            date: '2024-01-15',
                            amount: 1450,
                            batchId: 'BATCH-003',
                            buyer: 'Local Grocery Chain',
                            status: 'pending',
                            txId: '0x3456...7890'
                        }
                    ],
                    impactMetrics: {
                        co2Saved: 2.4,
                        waterSaved: 15600,
                        farmersHelped: 1247,
                        transparencyScore: 98,
                        fairTradeImpact: 89
                    },
                    monthlyComparison: {
                        thisMonth: { revenue: 4750, batches: 8, growth: 23.5 },
                        lastMonth: { revenue: 3850, batches: 6, growth: 18.2 }
                    }
                }

                setDashboardData(mockData)
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    const formatSTX = (amount) => {
        return `${(amount / 1000000).toFixed(2)} STX`
    }

    if (loading) {
        return (
            <Layout>
                <div className="space-y-6">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="card">
                                    <div className="h-16 bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    if (!isSignedIn) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h2>
                    <p className="text-gray-600 mb-6">
                        Connect your Stacks wallet to view your personalized AgriTrace dashboard.
                    </p>
                </div>
            </Layout>
        )
    }

    const { userStats, revenueData, productDistribution, paymentHistory, impactMetrics, monthlyComparison } = dashboardData

    return (
        <Layout>
            <div className="space-y-8">
                {/* Welcome Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Welcome back, Farmer! 🌾
                    </h1>
                    <p className="text-xl text-gray-600">
                        Your AgriTrace journey is growing strong. Here's your impact on transparent agriculture.
                    </p>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Total Revenue</p>
                                <p className="text-3xl font-bold">{formatCurrency(userStats.totalRevenue)}</p>
                                <div className="flex items-center space-x-1 mt-2">
                                    <ArrowUp className="w-4 h-4" />
                                    <span className="text-sm">+{userStats.monthlyGrowth}% this month</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Product Batches</p>
                                <p className="text-3xl font-bold">{userStats.totalBatches}</p>
                                <div className="flex items-center space-x-1 mt-2">
                                    <Package className="w-4 h-4" />
                                    <span className="text-sm">Tracked on blockchain</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">Reputation Score</p>
                                <p className="text-3xl font-bold">{userStats.reputationScore}/100</p>
                                <div className="flex items-center space-x-1 mt-2">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="text-sm">Excellent rating</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                <Award className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm">Average Price</p>
                                <p className="text-3xl font-bold">${userStats.averagePrice}</p>
                                <div className="flex items-center space-x-1 mt-2">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="text-sm">Above market avg</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                <Target className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Revenue Growth Chart */}
                <div className="card">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Revenue Growth</h2>
                            <p className="text-gray-600">Your farming business is thriving with AgriTrace transparency</p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setTimeRange('3months')}
                                className={`px-3 py-1 rounded text-sm ${timeRange === '3months' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                            >
                                3M
                            </button>
                            <button
                                onClick={() => setTimeRange('6months')}
                                className={`px-3 py-1 rounded text-sm ${timeRange === '6months' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                            >
                                6M
                            </button>
                            <button
                                onClick={() => setTimeRange('1year')}
                                className={`px-3 py-1 rounded text-sm ${timeRange === '1year' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                            >
                                1Y
                            </button>
                        </div>
                    </div>

                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                    formatter={(value, name) => [
                                        name === 'revenue' ? formatCurrency(value) : value,
                                        name === 'revenue' ? 'Revenue' : 'Batches'
                                    ]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#10b981"
                                    fillOpacity={1}
                                    fill="url(#revenueGradient)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product Distribution */}
                    <div className="card">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Portfolio</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={productDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {productDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Monthly Performance */}
                    <div className="card">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Monthly Performance</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">This Month</p>
                                    <p className="text-2xl font-bold text-green-600">{formatCurrency(monthlyComparison.thisMonth.revenue)}</p>
                                    <p className="text-sm text-gray-500">{monthlyComparison.thisMonth.batches} batches</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center space-x-1 text-green-600">
                                        <ArrowUp className="w-4 h-4" />
                                        <span className="font-medium">+{monthlyComparison.thisMonth.growth}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Last Month</p>
                                    <p className="text-2xl font-bold text-gray-700">{formatCurrency(monthlyComparison.lastMonth.revenue)}</p>
                                    <p className="text-sm text-gray-500">{monthlyComparison.lastMonth.batches} batches</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center space-x-1 text-gray-600">
                                        <ArrowUp className="w-4 h-4" />
                                        <span className="font-medium">+{monthlyComparison.lastMonth.growth}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment History */}
                <div className="card">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Recent Payments</h2>
                        <Link href="/payments" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            View All →
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Batch ID</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Buyer</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentHistory.map((payment) => (
                                    <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm text-gray-900">
                                            {new Date(payment.date).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 text-sm font-mono text-gray-700">
                                            {payment.batchId}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-900">
                                            {payment.buyer}
                                        </td>
                                        <td className="py-3 px-4 text-sm font-semibold text-green-600">
                                            {formatCurrency(payment.amount)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payment.status === 'completed'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {payment.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <a
                                                href={`https://explorer.hiro.so/txid/${payment.txId}?chain=testnet`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                            >
                                                View TX →
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* AgriTrace Impact Section */}
                <div className="card bg-gradient-to-r from-green-50 to-blue-50">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            🌍 Your Impact with AgriTrace
                        </h2>
                        <p className="text-gray-600">
                            See how blockchain transparency is revolutionizing agriculture and helping you grow
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Leaf className="w-8 h-8 text-green-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{impactMetrics.co2Saved}T</p>
                            <p className="text-sm text-gray-600">CO₂ Saved</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Activity className="w-8 h-8 text-blue-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{impactMetrics.waterSaved.toLocaleString()}L</p>
                            <p className="text-sm text-gray-600">Water Conserved</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Users className="w-8 h-8 text-purple-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{impactMetrics.farmersHelped.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">Farmers Helped</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Shield className="w-8 h-8 text-yellow-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{impactMetrics.transparencyScore}%</p>
                            <p className="text-sm text-gray-600">Transparency Score</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Heart className="w-8 h-8 text-red-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{impactMetrics.fairTradeImpact}%</p>
                            <p className="text-sm text-gray-600">Fair Trade Impact</p>
                        </div>
                    </div>
                </div>

                {/* Success Stories */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">How AgriTrace is Helping You Succeed</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-green-50 rounded-lg">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Faster Payments</h3>
                            <p className="text-sm text-gray-600 mb-3">
                                STX escrow ensures you get paid immediately upon delivery confirmation
                            </p>
                            <div className="text-2xl font-bold text-green-600">2.3x</div>
                            <div className="text-xs text-gray-500">Faster than traditional</div>
                        </div>

                        <div className="text-center p-6 bg-blue-50 rounded-lg">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Trust & Verification</h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Blockchain verification increases buyer confidence and premium pricing
                            </p>
                            <div className="text-2xl font-bold text-blue-600">+18%</div>
                            <div className="text-xs text-gray-500">Higher prices achieved</div>
                        </div>

                        <div className="text-center p-6 bg-purple-50 rounded-lg">
                            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Globe className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Market Reach</h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Connect directly with buyers worldwide through our transparent marketplace
                            </p>
                            <div className="text-2xl font-bold text-purple-600">5x</div>
                            <div className="text-xs text-gray-500">Wider market access</div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Link href="/products/create" className="btn-primary text-center flex items-center justify-center space-x-2">
                            <Package className="w-4 h-4" />
                            <span>Add New Batch</span>
                        </Link>
                        <Link href="/marketplace" className="btn-secondary text-center flex items-center justify-center space-x-2">
                            <Globe className="w-4 h-4" />
                            <span>Browse Market</span>
                        </Link>
                        <Link href="/track" className="btn-outline text-center flex items-center justify-center space-x-2">
                            <Activity className="w-4 h-4" />
                            <span>Track Products</span>
                        </Link>
                        <Link href="/farmers" className="btn-outline text-center flex items-center justify-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>View Network</span>
                        </Link>
                    </div>
                </div>

                {/* Achievements */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Achievements</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
                            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                                <Award className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">First Batch</p>
                                <p className="text-sm text-gray-600">Recorded your first product</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                <Star className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Trusted Farmer</p>
                                <p className="text-sm text-gray-600">Achieved 90+ reputation</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Growth Master</p>
                                <p className="text-sm text-gray-600">20%+ monthly growth</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                <Globe className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Global Reach</p>
                                <p className="text-sm text-gray-600">Products in 3+ regions</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Testimonial */}
                <div className="card bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-8 h-8" />
                        </div>
                        <blockquote className="text-xl font-medium mb-4">
                            "AgriTrace has transformed my farming business. The transparency and fair pricing
                            have increased my revenue by 40% while building trust with buyers worldwide."
                        </blockquote>
                        <p className="text-primary-100">- Rohit Sharma, Delhi Farmer</p>
                    </div>
                </div>
            </div>
        </Layout>
    )
}