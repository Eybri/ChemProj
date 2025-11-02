import React, { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Filter,
  Download
} from 'lucide-react'
import { useAuth } from '../services/AuthContext'
import { borrowService, userService, itemService } from '../services/api'

function BorrowedLogs() {
  const { user } = useAuth()
  const [borrowLogs, setBorrowLogs] = useState([])
  const [users, setUsers] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    user_id: '',
    item_id: '',
    overdue_only: false
  })

  useEffect(() => {
    loadBorrowLogs()
    if (user?.role === 'admin') {
      loadUsers()
      loadItems()
    }
  }, [filters, user])

  const loadBorrowLogs = async () => {
    try {
      const params = { 
        ...filters,
        // Ensure empty strings are not sent
        user_id: filters.user_id || undefined,
        item_id: filters.item_id || undefined,
        status: filters.status || undefined
      }
      
      console.log('Loading borrow logs with params:', params)
      const data = await borrowService.getBorrowLogs(params)
      console.log('Borrow logs received:', data)
      setBorrowLogs(data)
    } catch (error) {
      console.error('Error loading borrow logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadItems = async () => {
    try {
      const data = await itemService.getItems()
      setItems(data)
    } catch (error) {
      console.error('Error loading items:', error)
    }
  }

  const handleReturnItem = async (borrowLogId, notes = '') => {
    try {
      await borrowService.returnItem(borrowLogId, notes)
      loadBorrowLogs()
    } catch (error) {
      console.error('Error returning item:', error)
      alert('Error returning item')
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      status: '',
      user_id: '',
      item_id: '',
      overdue_only: false
    })
  }

  const getStatusIcon = (status, expectedReturnDate) => {
    // Status comes as uppercase from backend: "BORROWED", "RETURNED", "OVERDUE"
    const statusUpper = status?.toUpperCase()
    const isOverdue = statusUpper === 'BORROWED' && new Date(expectedReturnDate) < new Date()
    
    if (isOverdue || statusUpper === 'OVERDUE') {
      return <AlertTriangle size={16} color="var(--danger)" />
    }
    
    switch (statusUpper) {
      case 'BORROWED':
        return <Clock size={16} color="var(--warning)" />
      case 'RETURNED':
        return <CheckCircle size={16} color="var(--success)" />
      default:
        return <Clock size={16} color="var(--gray)" />
    }
  }

  const getStatusText = (status, expectedReturnDate) => {
    const statusUpper = status?.toUpperCase()
    const isOverdue = statusUpper === 'BORROWED' && new Date(expectedReturnDate) < new Date()
    
    if (isOverdue) return 'OVERDUE'
    return statusUpper || 'UNKNOWN'
  }

  const exportBorrowLogs = () => {
    const csvContent = [
      ['Item', 'User', 'Quantity', 'Borrow Date', 'Expected Return', 'Actual Return', 'Status'],
      ...borrowLogs.map(log => [
        log.item?.name,
        log.user?.full_name,
        log.quantity_borrowed,
        new Date(log.borrow_date).toLocaleDateString(),
        new Date(log.expected_return_date).toLocaleDateString(),
        log.actual_return_date ? new Date(log.actual_return_date).toLocaleDateString() : 'N/A',
        log.status
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'borrow-logs.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <h1>Borrowed Items</h1>
          <p>Track borrowed laboratory items and returns</p>
        </div>
        <div className="page-actions">
          <button 
            onClick={exportBorrowLogs}
            className="btn btn-secondary"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      {user?.role === 'admin' && (
        <div className="filters-bar">
          <div className="filters-group">
            <Filter size={18} />
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="BORROWED">Borrowed</option>
              <option value="RETURNED">Returned</option>
              <option value="OVERDUE">Overdue</option>
            </select>

            <select
              value={filters.user_id}
              onChange={(e) => handleFilterChange('user_id', e.target.value)}
            >
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.full_name}
                </option>
              ))}
            </select>

            <select
              value={filters.item_id}
              onChange={(e) => handleFilterChange('item_id', e.target.value)}
            >
              <option value="">All Items</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.overdue_only}
                onChange={(e) => handleFilterChange('overdue_only', e.target.checked)}
              />
              Overdue Only
            </label>
          </div>

          <button onClick={clearFilters} className="btn btn-outline">
            Clear Filters
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading borrow logs...</div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Item</th>
                  {user?.role === 'admin' && <th>User</th>}
                  <th>Quantity</th>
                  <th>Borrow Date</th>
                  <th>Expected Return</th>
                  <th>Actual Return</th>
                  <th>Status</th>
                  {user?.role === 'admin' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {borrowLogs.length > 0 ? (
                  borrowLogs.map(log => {
                    const statusUpper = log.status?.toUpperCase()
                    const isOverdue = statusUpper === 'BORROWED' && new Date(log.expected_return_date) < new Date()
                    
                    return (
                      <tr key={log.id} className={
                        statusUpper === 'OVERDUE' || isOverdue ? 'overdue' : ''
                      }>
                        <td>
                          <div className="item-info">
                            <strong>{log.item?.name}</strong>
                            <small>{log.item?.category?.name}</small>
                          </div>
                        </td>
                        {user?.role === 'admin' && (
                          <td>
                            <div className="user-info">
                              <strong>{log.user?.full_name}</strong>
                              <small>{log.user?.student_id}</small>
                            </div>
                          </td>
                        )}
                        <td>{log.quantity_borrowed} {log.item?.unit}</td>
                        <td>{new Date(log.borrow_date).toLocaleDateString()}</td>
                        <td>{new Date(log.expected_return_date).toLocaleDateString()}</td>
                        <td>
                          {log.actual_return_date 
                            ? new Date(log.actual_return_date).toLocaleDateString()
                            : '-'
                          }
                        </td>
                        <td>
                          <div className="status-cell">
                            {getStatusIcon(log.status, log.expected_return_date)}
                            <span className={`status status-${statusUpper?.toLowerCase()}`}>
                              {getStatusText(log.status, log.expected_return_date)}
                            </span>
                          </div>
                        </td>
                        {user?.role === 'admin' && (
                          <td>
                            {statusUpper === 'BORROWED' && (
                              <button
                                onClick={() => handleReturnItem(log.id)}
                                className="btn btn-success btn-sm"
                              >
                                Mark Returned
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={user?.role === 'admin' ? 8 : 7} className="empty-cell">
                      No borrow logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default BorrowedLogs