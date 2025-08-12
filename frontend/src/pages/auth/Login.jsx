import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(formData.email, formData.password)
    
    if (result.success) {
      navigate('/')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
     <div className="flex-1 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-screen max-w-4xl">
            <img 
              src="/SitReadingDoodle.svg" 
              alt="Email Verification Illustration" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 bg-white relative flex items-center justify-center px-8">
        
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">QUICKCOURT</h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-8">LOGIN</h2>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
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
                placeholder=""
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
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] text-gray-900"
                  placeholder=""
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

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-[#714B67] text-white font-medium rounded-md hover:bg-[#5d3d56] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#714B67] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-[#714B67] hover:text-[#5d3d56]">
                  Sign up
                </Link>
              </p>
              <div className="mt-2">
                <Link to="/forgot-password" className="text-sm text-[#714B67] hover:text-[#5d3d56]">
                  Forgot password?
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login