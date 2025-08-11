import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import LoadingSpinner from './components/common/LoadingSpinner'

// Auth Pages
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import OTPVerification from './pages/auth/OTPVerification'

// User Pages
import Home from './pages/user/Home'
import Venues from './pages/user/Venues'
import VenueDetail from './pages/user/VenueDetail'
import BookingConfirmation from './pages/user/BookingConfirmation'
import Payment from './pages/user/Payment'
import MyBookings from './pages/user/MyBookings'
import UserProfile from './pages/user/Profile'

// Facility Owner Pages
import OwnerDashboard from './pages/owner/Dashboard'
import FacilityManagement from './pages/owner/FacilityManagement'
import CourtManagement from './pages/owner/CourtManagement'
import OwnerBookings from './pages/owner/Bookings'
import OwnerProfile from './pages/owner/Profile'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import FacilityApproval from './pages/admin/FacilityApproval'
import UserManagement from './pages/admin/UserManagement'
import AdminProfile from './pages/admin/Profile'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth()
  
  if (loading) return <LoadingSpinner />
  
  if (!user) return <Navigate to="/login" replace />
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  
  return children
}

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="min-h-[calc(100vh-140px)]">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" replace />} />
          <Route path="/verify-otp" element={!user ? <OTPVerification /> : <Navigate to="/" replace />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              {user?.role === 'ADMIN' ? <AdminDashboard /> : 
               user?.role === 'FACILITY_OWNER' ? <OwnerDashboard /> : 
               <Home />}
            </ProtectedRoute>
          } />
          
          {/* User Routes */}
          <Route path="/venues" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <Venues />
            </ProtectedRoute>
          } />
          <Route path="/venues/:id" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <VenueDetail />
            </ProtectedRoute>
          } />
          <Route path="/booking/confirm" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <BookingConfirmation />
            </ProtectedRoute>
          } />
          <Route path="/payment" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <Payment />
            </ProtectedRoute>
          } />
          <Route path="/my-bookings" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <MyBookings />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <UserProfile />
            </ProtectedRoute>
          } />
          
          {/* Facility Owner Routes */}
          <Route path="/owner/dashboard" element={
            <ProtectedRoute allowedRoles={['FACILITY_OWNER']}>
              <OwnerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/owner/facilities" element={
            <ProtectedRoute allowedRoles={['FACILITY_OWNER']}>
              <FacilityManagement />
            </ProtectedRoute>
          } />
          <Route path="/owner/courts" element={
            <ProtectedRoute allowedRoles={['FACILITY_OWNER']}>
              <CourtManagement />
            </ProtectedRoute>
          } />
          <Route path="/owner/bookings" element={
            <ProtectedRoute allowedRoles={['FACILITY_OWNER']}>
              <OwnerBookings />
            </ProtectedRoute>
          } />
          <Route path="/owner/profile" element={
            <ProtectedRoute allowedRoles={['FACILITY_OWNER']}>
              <OwnerProfile />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/facilities" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <FacilityApproval />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/profile" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminProfile />
            </ProtectedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
