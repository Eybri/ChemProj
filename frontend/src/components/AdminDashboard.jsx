import React from 'react'

function AdminDashboard({ stats, user }) {
  return (
    <div>
      {/* Statistics Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Total Items */}
        <StatCard
          value={stats.total_items}
          label="Total Items"
          icon="📦"
          color="#3b82f6"
        />

        {/* Categories */}
        <StatCard
          value={stats.total_categories}
          label="Categories"
          icon="📁"
          color="#10b981"
        />

        {/* Low Stock Items */}
        <StatCard
          value={stats.low_stock_items}
          label="Low Stock"
          icon="⚠️"
          color="#f59e0b"
        />

        {/* Expired Items */}
        <StatCard
          value={stats.expired_items}
          label="Expired Items"
          icon="⏰"
          color="#ef4444"
        />

        {/* Borrowed Items */}
        <StatCard
          value={stats.total_borrowed_items}
          label="Borrowed Items"
          icon="📚"
          color="#8b5cf6"
        />

        {/* Overdue Returns */}
        <StatCard
          value={stats.overdue_borrows}
          label="Overdue Returns"
          icon="🔴"
          color="#dc2626"
        />

        {/* Total Users */}
        <StatCard
          value={stats.total_users}
          label="Total Users"
          icon="👥"
          color="#06b6d4"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions user={user} />

      {/* Recent Activity Section */}
      <div style={{ marginTop: '2rem' }}>
        <SectionCard title="Recent Activity">
          <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
            Recent items and borrow logs will appear here...
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

// Reusable Stat Card Component
function StatCard({ value, label, icon, color }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <div style={{
        width: '3rem',
        height: '3rem',
        borderRadius: '8px',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.5rem'
      }}>
        {icon}
      </div>
      <div>
        <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: 0 }}>
          {value || 0}
        </h3>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
          {label}
        </p>
      </div>
    </div>
  )
}

// Quick Actions Component
function QuickActions({ user }) {
  const actions = [
    { label: 'View Items', path: '/items', color: '#3b82f6' },
    { label: 'Manage Categories', path: '/categories', color: '#10b981' },
    { label: 'User Management', path: '/users', color: '#ef4444' },
    { label: 'Borrowed Items', path: '/borrowed', color: '#8b5cf6' },
    { label: 'View Reports', path: '/reports', color: '#f59e0b' },
  ]

  return (
    <SectionCard title="Quick Actions">
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {actions.map((action) => (
          <button 
            key={action.label}
            onClick={() => window.location.href = action.path}
            style={{
              background: action.color,
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
    </SectionCard>
  )
}

// Section Card Component
function SectionCard({ title, children }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      padding: '1.5rem'
    }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

export default AdminDashboard