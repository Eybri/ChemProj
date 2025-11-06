import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'
import { 
  FlaskConical, 
  User, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react'

function Header() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  // Base navigation for all users
  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FlaskConical },
    { name: 'Items', href: '/items' },
    { name: 'Borrowed', href: '/borrowed' },
  ]

  // Admin-only navigation items
  const adminNavigation = [
    { name: 'Categories', href: '/categories' },
    { name: 'Users', href: '/users' },
    { name: 'Reports', href: '/reports' }, // Reports is admin-only
  ]

  // Combine navigation based on user role
  const navigation = user?.role === 'admin' 
    ? [...baseNavigation, ...adminNavigation]
    : baseNavigation

  const isActive = (path) => location.pathname === path

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-brand">
          <FlaskConical className="brand-icon" />
          <span className="brand-text">ChemLab Inventory</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
              >
                {Icon && <Icon size={18} />}
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="header-actions">
          <div className="user-info">
            <User size={18} />
            <span>{user?.full_name} ({user?.role})</span>
          </div>
          <button onClick={logout} className="logout-btn">
            <LogOut size={18} />
            <span>Logout</span>
          </button>

          {/* Mobile menu button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-nav">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`mobile-nav-link ${isActive(item.href) ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}

export default Header