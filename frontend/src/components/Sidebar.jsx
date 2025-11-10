import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'
import { 
  FlaskConical,
  Package,
  ClipboardList,
  Tags,
  Users,
  BarChart3,
  LayoutDashboard,
  X
} from 'lucide-react'

function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()
  const location = useLocation()

  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Items', href: '/items', icon: Package },
    { name: 'Borrowed Logs', href: '/borrowed', icon: ClipboardList },
  ]

  const adminNavigation = [
    { name: 'Categories', href: '/categories', icon: Tags },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
  ]

  const navigation = user?.role === 'admin' 
    ? [...baseNavigation, ...adminNavigation]
    : baseNavigation

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <FlaskConical className="brand-icon" />
            <span className="brand-text">ChemLab Inventory</span>
          </div>
          <button className="sidebar-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-role-badge">
            <span>Role: {user?.role}</span>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar