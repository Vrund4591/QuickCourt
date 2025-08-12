import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { EyeIcon, EyeSlashIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const result = await signup({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: formData.role
    })
    
    if (result.success) {
      navigate('/verify-otp', { state: { email: formData.email } })
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Gradient + SVG + Text */}
     <div className="flex-1 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-screen max-w-4xl">
            <img 
              src="/MessyDoodle.svg" 
              alt="Email Verification Illustration" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
      {/* Right side - Signup Form */}
      <div className="flex-1 bg-white flex items-center justify-center px-8 py-12">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">QUICKCOURT</h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-6">SIGN UP</h2>
          </div>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to join as
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'USER' }))}
                  className={`p-3 border-2 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                    formData.role === 'USER'
                      ? 'border-[#714B67] bg-[#714B67]/10 text-[#714B67]'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <UserIcon className="h-5 w-5" />
                  <span className="font-medium">Player</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'FACILITY_OWNER' }))}
                  className={`p-3 border-2 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                    formData.role === 'FACILITY_OWNER'
                      ? 'border-[#714B67] bg-[#714B67]/10 text-[#714B67]'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <BuildingOfficeIcon className="h-5 w-5" />
                  <span className="font-medium">Owner</span>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] text-gray-900"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] text-gray-900"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] text-gray-900"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] text-gray-900"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-[#714B67] text-white font-medium rounded-md hover:bg-[#5d3d56] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#714B67] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-[#714B67] hover:text-[#5d3d56]">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Signup