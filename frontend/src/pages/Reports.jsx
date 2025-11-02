import React, { useState, useEffect } from 'react'
import { Download, Filter, Calendar, BarChart3 } from 'lucide-react'
import { dashboardService, itemService, borrowService } from '../services/api'
import { useAuth } from '../services/AuthContext'

function Reports() {
  const { user } = useAuth()
  const [stats, setStats] = useState({})
  const [lowStockItems, setLowStockItems] = useState([])
  const [expiredItems, setExpiredItems] = useState([])
  const [overdueBorrows, setOverdueBorrows] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadReportData()
  }, [dateRange])

  const loadReportData = async () => {
    try {
      const [statsData, lowStockData, expiredData, overdueData] = await Promise.all([
        dashboardService.getStats(),
        itemService.getItems({ low_stock: true }),
        itemService.getItems({ condition: 'expired' }),
        borrowService.getBorrowLogs({ overdue_only: true })
      ])

      setStats(statsData)
      setLowStockItems(lowStockData)
      setExpiredItems(expiredData)
      setOverdueBorrows(overdueData)
    } catch (error) {
      console.error('Error loading report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = (type) => {
    let csvContent = []
    let filename = ''

    switch (type) {
      case 'inventory':
        csvContent = [
          ['Name', 'Category', 'Quantity', 'Available', 'Unit', 'Location', 'Condition', 'Status'],
          ...lowStockItems.map(item => [
            item.name,
            item.category?.name,
            item.quantity,
            item.available_quantity,
            item.unit,
            item.storage_location,
            item.condition,
            item.available_quantity <= item.min_stock_level ? 'LOW STOCK' : 'OK'
          ])
        ]
        filename = 'inventory-report.csv'
        break

      case 'expired':
        csvContent = [
          ['Name', 'Category', 'Quantity', 'Unit', 'Location', 'Expiry Date'],
          ...expiredItems.map(item => [
            item.name,
            item.category?.name,
            item.quantity,
            item.unit,
            item.storage_location,
            new Date(item.expiry_date).toLocaleDateString()
          ])
        ]
        filename = 'expired-items-report.csv'
        break

      case 'borrowed':
        csvContent = [
          ['Item', 'User', 'Quantity', 'Borrow Date', 'Expected Return', 'Status'],
          ...overdueBorrows.map(log => [
            log.item?.name,
            log.user?.full_name,
            log.quantity_borrowed,
            new Date(log.borrow_date).toLocaleDateString(),
            new Date(log.expected_return_date).toLocaleDateString(),
            log.status
          ])
        ]
        filename = 'borrowed-items-report.csv'
        break

      default:
        return
    }

    const csvString = csvContent.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Reports & Analytics</h1>
        </div>
        <div className="loading">Loading report data...</div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <h1>Reports & Analytics</h1>
          <p>Generate reports and view laboratory analytics</p>
        </div>
        <div className="page-actions">
          <div className="date-range">
            <Calendar size={18} />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid compact">
        <div className="stat-card compact">
          <BarChart3 size={20} />
          <div>
            <h3>{stats.total_items}</h3>
            <p>Total Items</p>
          </div>
        </div>
        <div className="stat-card compact">
          <BarChart3 size={20} />
          <div>
            <h3>{stats.low_stock_items}</h3>
            <p>Low Stock</p>
          </div>
        </div>
        <div className="stat-card compact">
          <BarChart3 size={20} />
          <div>
            <h3>{stats.expired_items}</h3>
            <p>Expired Items</p>
          </div>
        </div>
        <div className="stat-card compact">
          <BarChart3 size={20} />
          <div>
            <h3>{stats.overdue_borrows}</h3>
            <p>Overdue Returns</p>
          </div>
        </div>
      </div>

      <div className="reports-content">
        {/* Low Stock Report */}
        <div className="report-section">
          <div className="report-header">
            <h2>Low Stock Items</h2>
            <button 
              onClick={() => generateReport('inventory')}
              className="btn btn-secondary btn-sm"
            >
              <Download size={16} />
              Export
            </button>
          </div>
          <div className="card">
            {lowStockItems.length > 0 ? (
              <div className="list">
                {lowStockItems.map(item => (
                  <div key={item.id} className="list-item warning">
                    <div className="list-item-main">
                      <h4>{item.name}</h4>
                      <p>{item.category?.name} • {item.storage_location}</p>
                    </div>
                    <div className="list-item-meta">
                      <span className="quantity low-stock">
                        {item.available_quantity} / {item.quantity} {item.unit}
                      </span>
                      <span className="min-stock">
                        Min: {item.min_stock_level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No low stock items</div>
            )}
          </div>
        </div>

        {/* Expired Items Report */}
        <div className="report-section">
          <div className="report-header">
            <h2>Expired Items</h2>
            <button 
              onClick={() => generateReport('expired')}
              className="btn btn-secondary btn-sm"
            >
              <Download size={16} />
              Export
            </button>
          </div>
          <div className="card">
            {expiredItems.length > 0 ? (
              <div className="list">
                {expiredItems.map(item => (
                  <div key={item.id} className="list-item danger">
                    <div className="list-item-main">
                      <h4>{item.name}</h4>
                      <p>{item.category?.name} • {item.storage_location}</p>
                      {item.expiry_date && (
                        <small>
                          Expired: {new Date(item.expiry_date).toLocaleDateString()}
                        </small>
                      )}
                    </div>
                    <div className="list-item-meta">
                      <span className="quantity">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No expired items</div>
            )}
          </div>
        </div>

        {/* Overdue Borrows Report */}
        {user?.role === 'admin' && (
          <div className="report-section">
            <div className="report-header">
              <h2>Overdue Returns</h2>
              <button 
                onClick={() => generateReport('borrowed')}
                className="btn btn-secondary btn-sm"
              >
                <Download size={16} />
                Export
              </button>
            </div>
            <div className="card">
              {overdueBorrows.length > 0 ? (
                <div className="list">
                  {overdueBorrows.map(borrow => (
                    <div key={borrow.id} className="list-item danger">
                      <div className="list-item-main">
                        <h4>{borrow.item?.name}</h4>
                        <p>Borrowed by: {borrow.user?.full_name}</p>
                        <small>
                          Due: {new Date(borrow.expected_return_date).toLocaleDateString()}
                        </small>
                      </div>
                      <div className="list-item-meta">
                        <span className="quantity">
                          {borrow.quantity_borrowed} {borrow.item?.unit}
                        </span>
                        <span className="status overdue">OVERDUE</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No overdue returns</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports