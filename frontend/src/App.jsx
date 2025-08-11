import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';

// Auth Components
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOTP from './pages/auth/VerifyOTP';

// User Components
import HomePage from './pages/user/HomePage';
import VenuesPage from './pages/user/VenuesPage';
import VenueDetailPage from './pages/user/VenueDetailPage';
import BookingPage from './pages/user/BookingPage';
import ProfilePage from './pages/user/ProfilePage';
import MyBookingsPage from './pages/user/MyBookingsPage';

// Facility Owner Components
import OwnerDashboard from './pages/owner/OwnerDashboard';
import FacilityManagement from './pages/owner/FacilityManagement';
import CourtManagement from './pages/owner/CourtManagement';
import BookingOverview from './pages/owner/BookingOverview';

// Admin Components
import AdminDashboard from './pages/admin/AdminDashboard';
import FacilityApproval from './pages/admin/FacilityApproval';
import UserManagement from './pages/admin/UserManagement';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (user) {
    // Redirect based on user role
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'FACILITY_OWNER') {
      return <Navigate to="/owner/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }
  
  return children;
};

function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          <Route 
            path="/verify-otp" 
            element={
              <PublicRoute>
                <VerifyOTP />
              </PublicRoute>
            } 
          />

          {/* Home Route - accessible to all authenticated users */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } 
          />

          {/* User Routes */}
          <Route 
            path="/venues" 
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <VenuesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/venues/:id" 
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <VenueDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/booking/:facilityId" 
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <BookingPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-bookings" 
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <MyBookingsPage />
              </ProtectedRoute>
            } 
          />

          {/* Facility Owner Routes */}
          <Route 
            path="/owner/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['FACILITY_OWNER']}>
                <OwnerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/owner/facilities" 
            element={
              <ProtectedRoute allowedRoles={['FACILITY_OWNER']}>
                <FacilityManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/owner/courts" 
            element={
              <ProtectedRoute allowedRoles={['FACILITY_OWNER']}>
                <CourtManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/owner/bookings" 
            element={
              <ProtectedRoute allowedRoles={['FACILITY_OWNER']}>
                <BookingOverview />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/facilities" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <FacilityApproval />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UserManagement />
              </ProtectedRoute>
            } 
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App
