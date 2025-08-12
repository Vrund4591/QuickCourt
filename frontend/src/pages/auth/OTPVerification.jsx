import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [timer, setTimer] = useState(60)
  const { verifyOTP } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const email = location.state?.email || ''

  useEffect(() => {
    if (!email) {
      navigate('/signup')
      return
    }

    const countdown = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(countdown)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(countdown)
  }, [email, navigate])

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP')
      return
    }

    setLoading(true)
    const result = await verifyOTP(email, otpString)
    
    if (result.success) {
      navigate('/')
    }
    
    setLoading(false)
  }

  const handleResendOTP = async () => {
    if (timer > 0) return
    
    setResendLoading(true)
    // Implement resend OTP logic here
    toast.success('OTP sent successfully!')
    setTimer(60)
    setResendLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="flex-1 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-screen max-w-4xl">
            <img 
              src="/DancingDoodle.svg" 
              alt="Email Verification Illustration" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* Right side - OTP Verification Form */}
      <div className="flex-1 bg-white flex items-center justify-center px-8">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">QUICKCOURT</h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">VERIFY EMAIL</h2>
            <p className="text-sm text-gray-600">
              We've sent a 6-digit code to <br />
              <span className="font-medium text-gray-900">{email}</span>
            </p>
          </div>
        
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Enter verification code
              </label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67]"
                    placeholder="0"
                  />
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-[#714B67] text-white font-medium rounded-md hover:bg-[#5d3d56] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#714B67] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{' '}
                {timer > 0 ? (
                  <span className="text-gray-500">Resend in {timer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendLoading}
                    className="font-medium text-[#714B67] hover:text-[#5d3d56] disabled:opacity-50"
                  >
                    {resendLoading ? 'Sending...' : 'Resend OTP'}
                  </button>
                )}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OTPVerification
             
