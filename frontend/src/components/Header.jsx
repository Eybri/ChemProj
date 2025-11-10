import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'
import { 
  FlaskConical, 
  User, 
  LogOut, 
  Menu,
  ChevronDown,
  Bell
} from 'lucide-react'

function Header({ onMenuToggle }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <button 
            className="mobile-menu-btn"
            onClick={onMenuToggle}
          >
            <Menu size={24} />
          </button>
          
          <div className="header-brand">
            <FlaskConical className="brand-icon" />
            <span className="brand-text">ChemLab Inventory</span>
          </div>
        </div>

        <div className="header-actions">
          {/* User Profile Dropdown */}
          <div className="user-profile-dropdown">
            <button 
              className="profile-trigger"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            >
<div className="user-avatar">
  {user?.profile_picture ? (
    <img 
      src={`http://localhost:8000${user.profile_picture}`} 
      alt="Profile" 
      className="profile-image"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '8px'
      }}
    />
  ) : (
    <User size={20} />
  )}
</div>              <div className="user-info">
                <span className="user-name">{user?.full_name}</span>
                <span className="user-role">{user?.role}</span>
              </div>
              <ChevronDown size={16} className={`dropdown-chevron ${isProfileDropdownOpen ? 'rotate' : ''}`} />
            </button>

            {isProfileDropdownOpen && (
              <div className="profile-dropdown-menu">
                <Link 
                  to="/profile" 
                  className="dropdown-item"
                  onClick={() => setIsProfileDropdownOpen(false)}
                >
                  <User size={16} />
                  <span>View Profile</span>
                </Link>
                
                <div className="dropdown-divider"></div>
                
                <button 
                  className="dropdown-item logout-item"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header