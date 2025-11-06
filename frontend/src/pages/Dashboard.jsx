import React, { useState, useEffect } from 'react'
import { useAuth } from '../services/AuthContext'
import { dashboardService } from '../services/api'
import AdminDashboard from '../components/AdminDashboard'
import UserDashboard from '../components/UserDashboard'

function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    total_items: 0,
    total_categories: 0,
    low_stock_items: 0,
    expired_items: 0,
    items_for_disposal: 0,
    total_borrowed_items: 0,
    overdue_borrows: 0,
    total_users: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      const data = await dashboardService.getStats()
      console.log('Dashboard stats:', data)
      setStats(data)
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            Dashboard
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            Loading dashboard data...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: '700', 
          color: '#111827',
          marginBottom: '0.5rem'
        }}>
          Dashboard
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
          Welcome back, {user?.full_name}! {user?.role === 'admin' ? "Here's the lab overview." : "Here's your personal overview."}
        </p>
      </div>

      {/* Render appropriate dashboard based on user role */}
      {user?.role === 'admin' ? (
        <AdminDashboard stats={stats} user={user} />
      ) : (
        <UserDashboard stats={stats} user={user} />
      )}
    </div>
  )
}

export default Dashboard