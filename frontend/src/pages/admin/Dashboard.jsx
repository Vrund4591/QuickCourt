// filepath: /Users/Admin/Desktop/Quickcourt/QuickCourt/frontend/src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  Users,
  Building,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  UserCheck,
  UserX,
  MapPin,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { apiEndpoints } from '../../config/api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
)

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    adminCount: 0,
    ownerCount: 0,
    userCount: 0,
    totalFacilities: 0,
    activeFacilities: 0,
    inactiveFacilities: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    recentRegistrations: 0,
    monthlyStats: [],
    topFacilities: [],
    recentUsers: []
  })
  const [loading, setLoading] = useState(true)
  const [recentActivities, setRecentActivities] = useState([])
  const [systemHealth, setSystemHealth] = useState({
    database: 'Unknown',
    status: 'Unknown'
  })
  const [revenueData, setRevenueData] = useState([])
  const [topFacilitiesData, setTopFacilitiesData] = useState([])
  const [recentUsers, setRecentUsers] = useState([])

  useEffect(() => {
    fetchDashboardData()
    fetchSystemHealth()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch admin stats from API
      const statsResponse = await fetch(apiEndpoints.admin.stats, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        if (statsData.success) {
          setStats(statsData.stats)
          setTopFacilitiesData(statsData.stats.topFacilities)
          setRecentUsers(statsData.stats.recentUsers)
        }
      }

      // Mock revenue data (can be replaced with real data later)
      setRevenueData([
        { month: 'Jan', revenue: 12500, bookings: 45 },
        { month: 'Feb', revenue: 15200, bookings: 52 },
        { month: 'Mar', revenue: 18900, bookings: 68 },
        { month: 'Apr', revenue: 22100, bookings: 75 },
        { month: 'May', revenue: 19800, bookings: 65 },
        { month: 'Jun', revenue: 25400, bookings: 89 }
      ])

      setRecentActivities([
        { id: 1, type: 'user_signup', message: 'New user registered', time: '5 minutes ago', icon: UserCheck, color: 'text-green-600' },
        { id: 2, type: 'booking', message: 'New booking created', time: '12 minutes ago', icon: Calendar, color: 'text-blue-600' },
        { id: 3, type: 'facility_added', message: 'New facility added', time: '1 hour ago', icon: Building, color: 'text-purple-600' },
        { id: 4, type: 'user_deactivated', message: 'User account deactivated', time: '2 hours ago', icon: UserX, color: 'text-red-600' },
        { id: 5, type: 'payment', message: 'Payment received', time: '3 hours ago', icon: DollarSign, color: 'text-green-600' }
      ])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSystemHealth = async () => {
    try {
      const response = await fetch(apiEndpoints.health)
      const data = await response.json()
      setSystemHealth({
        database: data.database || 'Connected',
        status: data.status || 'OK'
      })
    } catch (error) {
      console.error('Error fetching system health:', error)
      setSystemHealth({
        database: 'Disconnected',
        status: 'ERROR'
      })
    }
  }

  // Chart configurations
  const userRoleChartData = {
    labels: ['Users', 'Owners', 'Admins'],
    datasets: [{
      data: [stats.userCount, stats.ownerCount, stats.adminCount],
      backgroundColor: ['#10B981', '#3B82F6', '#EF4444'],
      borderWidth: 0
    }]
  }

  const bookingStatusChartData = {
    labels: ['Completed', 'Confirmed', 'Pending', 'Cancelled'],
    datasets: [{
      data: [stats.completedBookings, stats.confirmedBookings, stats.pendingBookings, stats.cancelledBookings],
      backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
      borderWidth: 0
    }]
  }

  const revenueChartData = {
    labels: revenueData.map(item => item.month),
    datasets: [
      {
        label: 'Revenue ($)',
        data: revenueData.map(item => item.revenue),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Bookings',
        data: revenueData.map(item => item.bookings),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  }

  const monthlyPerformanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Facilities Added',
        data: [3, 5, 2, 8, 4, 6],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: '#3B82F6',
        borderWidth: 1
      },
      {
        label: 'Courts Added',
        data: [12, 19, 8, 25, 16, 22],
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: '#10B981',
        borderWidth: 1
      }
    ]
  }

  const userGrowthData = {
    labels: stats.monthlyStats.map(item => item.month),
    datasets: [
      {
        label: 'New Users',
        data: stats.monthlyStats.map(item => item.users),
        fill: false,
        borderColor: '#8B5CF6',
        tension: 0.1
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    }
  }

  const revenueChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Revenue & Bookings Trend' }
    },
    scales: {
      y: { type: 'linear', display: true, position: 'left' },
      y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } }
    }
  }

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Monthly Performance' }
    }
  }

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'User Growth Trend' }
    }
  }

  const StatCard = ({ title, value, change, changeType, icon: IconComponent, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm flex items-center mt-1 ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
              {changeType === 'increase' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <IconComponent className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your platform.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* System Health Alert */}
      {systemHealth.status !== 'OK' && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">
                System health check failed. Database status: {systemHealth.database}
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              change="+12%"
              changeType="increase"
              icon={Users}
              color="bg-blue-500"
            />
            <StatCard
              title="Active Users"
              value={stats.activeUsers}
              change="+8%"
              changeType="increase"
              icon={UserCheck}
              color="bg-green-500"
            />
            <StatCard
              title="Total Facilities"
              value={stats.totalFacilities}
              change="+5%"
              changeType="increase"
              icon={Building}
              color="bg-purple-500"
            />
            <StatCard
              title="Total Bookings"
              value={stats.totalBookings}
              change="+15%"
              changeType="increase"
              icon={Calendar}
              color="bg-orange-500"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Roles Distribution</h3>
              <div className="h-64"><Doughnut data={userRoleChartData} options={chartOptions} /></div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status Distribution</h3>
              <div className="h-64"><Doughnut data={bookingStatusChartData} options={chartOptions} /></div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="h-80"><Line data={revenueChartData} options={revenueChartOptions} /></div>
          </div>

          {/* Monthly Performance and User Growth Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-64"><Bar data={monthlyPerformanceData} options={barChartOptions} /></div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-64"><Line data={userGrowthData} options={lineChartOptions} /></div>
            </div>
          </div>

          {/* Top Facilities and Recent Users */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Facilities</h3>
              <div className="space-y-3">
                {topFacilitiesData.map((facility, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{facility.name}</h4>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {facility.bookings} bookings
                        </span>
                        <span className="flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          {facility.rating}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">{facility.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
              <div className="space-y-3">
                {recentUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{user.name}</h4>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                        user.role === 'OWNER' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Stats and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New Users (30 days)</span>
                  <span className="font-semibold text-green-600">+{stats.recentRegistrations}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Bookings</span>
                  <span className="font-semibold text-orange-600">{stats.pendingBookings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Inactive Users</span>
                  <span className="font-semibold text-red-600">{stats.inactiveUsers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Facilities</span>
                  <span className="font-semibold text-green-600">{stats.activeFacilities}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <div className="flex items-center">
                    {systemHealth.database === 'Connected' ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span className={`text-sm font-medium ${systemHealth.database === 'Connected' ? 'text-green-600' : 'text-red-600'}`}>
                      {systemHealth.database}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Status</span>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Server Load</span>
                  <span className="text-sm font-medium text-green-600">Normal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Uptime</span>
                  <span className="text-sm font-medium text-green-600">99.9%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivities.map((activity) => {
                  const IconComponent = activity.icon
                  return (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 p-1 rounded-full ${activity.color}`}>
                        <IconComponent className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminDashboard