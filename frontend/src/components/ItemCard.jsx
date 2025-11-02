import React from 'react'
import { Edit, Trash2, AlertTriangle, Clock, CheckCircle, FlaskConical } from 'lucide-react'

function ItemCard({ 
  item, 
  onEdit, 
  onDelete, 
  onBorrow,
  showActions = true,
  userRole = 'viewer'
}) {
  const isLowStock = item.available_quantity <= item.min_stock_level
  const isExpired = item.expiry_date && new Date(item.expiry_date) < new Date()
  
  const getConditionColor = (condition) => {
    switch (condition) {
      case 'good': return 'var(--success)'
      case 'for_disposal': return 'var(--warning)'
      case 'expired': return 'var(--danger)'
      default: return 'var(--gray)'
    }
  }

  const getStatusIcon = () => {
    if (isExpired) return <AlertTriangle size={16} color="var(--danger)" />
    if (isLowStock) return <Clock size={16} color="var(--warning)" />
    return <CheckCircle size={16} color="var(--success)" />
  }

  return (
    <div className="item-card">
      <div className="item-image">
        {item.image_url ? (
          <img 
            src={`http://localhost:8000/uploads/${item.image_url}`} 
            alt={item.name}
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div className="item-image-placeholder">
          <FlaskConical size={32} />
        </div>
      </div>

      <div className="item-content">
        <div className="item-header">
          <h3 className="item-name">{item.name}</h3>
          <div className="item-status">
            {getStatusIcon()}
          </div>
        </div>

        <p className="item-description">
          {item.description || 'No description available'}
        </p>

        <div className="item-details">
          <div className="detail-row">
            <span className="detail-label">Category:</span>
            <span className="detail-value">{item.category?.name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Quantity:</span>
            <span className={`detail-value ${isLowStock ? 'low-stock' : ''}`}>
              {item.available_quantity} / {item.quantity} {item.unit}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Location:</span>
            <span className="detail-value">{item.storage_location || 'Not specified'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Condition:</span>
            <span 
              className="detail-value condition-badge"
              style={{ color: getConditionColor(item.condition) }}
            >
              {item.condition.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          {item.expiry_date && (
            <div className="detail-row">
              <span className="detail-label">Expires:</span>
              <span className={`detail-value ${isExpired ? 'expired' : ''}`}>
                {new Date(item.expiry_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {showActions && (
          <div className="item-actions">
            {userRole === 'admin' && item.is_borrowable && item.available_quantity > 0 && (
              <button 
                onClick={() => onBorrow(item)}
                className="btn btn-primary btn-sm"
              >
                Borrow
              </button>
            )}
            {userRole === 'admin' && (
              <>
                <button 
                  onClick={() => onEdit(item)}
                  className="btn btn-secondary btn-sm"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button 
                  onClick={() => onDelete(item)}
                  className="btn btn-danger btn-sm"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ItemCard