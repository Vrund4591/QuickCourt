import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  UsersIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getUserNavLinks = () => {
    if (!user) return []

    switch (user.role) {
      case 'USER':
        return [
          { name: 'Home', href: '/', icon: HomeIcon },
          { name: 'Venues', href: '/venues', icon: BuildingOfficeIcon },
          // { name: 'My Bookings', href: '/my-bookings', icon: CalendarIcon },
          { name: 'Profile', href: '/profile', icon: UserIcon }
        ]
      case 'FACILITY_OWNER':
        return [
          { name: 'Dashboard', href: '/owner/dashboard', icon: ChartBarIcon },
          { name: 'Facilities', href: '/owner/facilities', icon: BuildingOfficeIcon },
          { name: 'Courts', href: '/owner/courts', icon: Cog6ToothIcon },
          { name: 'Bookings', href: '/owner/bookings', icon: CalendarIcon },
          { name: 'Profile', href: '/owner/profile', icon: UserIcon }
        ]
      case 'ADMIN':
        return [
          { name: 'Dashboard', href: '/admin/dashboard', icon: ChartBarIcon },
          { name: 'Facilities', href: '/admin/facilities', icon: BuildingOfficeIcon },
          { name: 'Users', href: '/admin/users', icon: UsersIcon },
          { name: 'Profile', href: '/admin/profile', icon: UserIcon }
        ]
      default:
        return []
    }
  }

  const navLinks = getUserNavLinks()

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-[#714B67] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Q</span>
              </div>
              <span className="text-xl font-bold text-gray-900 caveat">QuickCourt</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = location.pathname === link.href
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.name}</span>
                  </Link>
                )
              })}
              
              {/* User Menu */}
              <div className="flex items-center space-x-4">
                {/* <div className="flex items-center space-x-2">
                  <img
                    src={user.avatar || '/default-avatar.png'}
                    alt={user.fullName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-gray-700">{user.fullName}</span>
                </div> */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          {user && (
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {user && isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = location.pathname === link.href
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                      isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.name}</span>
                  </Link>
                )
              })}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center space-x-2 px-3 py-2">
                  <img
                    src={user.avatar || '/default-avatar.png'}
                    alt={user.fullName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-gray-700">{user.fullName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
