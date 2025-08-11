import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 caveat">
              Welcome to QuickCourt, {user?.fullName}!
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Book local sports facilities instantly. Find courts, connect with players, and enjoy your favorite sports.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link
                to="/venues"
                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Find Venues
              </Link>
              <Link
                to="/my-bookings"
                className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                My Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-gray-600">Sports Venues</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
            <div className="text-gray-600">Happy Players</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">50,000+</div>
            <div className="text-gray-600">Bookings Made</div>
          </div>
        </div>
      </div>

      {/* Popular Sports */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Sports</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Badminton', 'Tennis', 'Football', 'Cricket'].map((sport) => (
              <Link
                key={sport}
                to={`/venues?sportType=${sport.toUpperCase()}`}
                className="bg-gray-50 p-6 rounded-lg text-center hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <div className="text-4xl mb-4">🏸</div>
                <div className="font-semibold">{sport}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
