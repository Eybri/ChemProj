import React, { useState, useEffect } from 'react'
import { X, Calendar } from 'lucide-react'
import { userService, itemService } from '../services/api'

function BorrowLogForm({ item, onSubmit, onCancel, isOpen, currentUser }) {
  const [formData, setFormData] = useState({
    item_id: '',
    user_id: '',
    quantity_borrowed: 1,
    expected_return_date: '',
    notes: ''
  })
  const [users, setUsers] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData(prev => ({
        ...prev,
        item_id: item.id.toString(), // Ensure it's a string for the form
        quantity_borrowed: 1
      }))
    }
  }, [item])

  useEffect(() => {
    if (isOpen) {
      loadUsers()
      if (!item) {
        loadBorrowableItems()
      }
    }
  }, [isOpen, item])

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers()
      setUsers(data.filter(user => user.role === 'viewer' && user.is_active))
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadBorrowableItems = async () => {
    try {
      const data = await itemService.getItems({ borrowable_only: true })
      setItems(data.filter(item => item.available_quantity > 0))
    } catch (error) {
      console.error('Error loading items:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity_borrowed' ? parseInt(value) || 1 : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.item_id || !formData.user_id || !formData.expected_return_date) {
      alert('Please fill in all required fields')
      return
    }

    if (formData.quantity_borrowed < 1) {
      alert('Quantity must be at least 1')
      return
    }

    setLoading(true)

    try {
      const submitData = {
        ...formData,
        item_id: parseInt(formData.item_id),
        user_id: parseInt(formData.user_id),
        admin_id: currentUser.id,
        expected_return_date: new Date(formData.expected_return_date).toISOString()
      }

      console.log('Submitting borrow data:', submitData)
      await onSubmit(submitData)
      handleClose()
    } catch (error) {
      console.error('Error submitting form:', error)
      alert(error.response?.data?.detail || 'Error creating borrow log')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      item_id: '',
      user_id: '',
      quantity_borrowed: 1,
      expected_return_date: '',
      notes: ''
    })
    onCancel()
  }

  const getMaxQuantity = () => {
    if (item) {
      return item.available_quantity
    }
    const selectedItem = items.find(i => i.id === parseInt(formData.item_id))
    return selectedItem ? selectedItem.available_quantity : 1
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Borrow Item</h2>
          <button onClick={handleClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-grid">
            {!item && (
              <div className="form-group">
                <label>Item *</label>
                <select
                  name="item_id"
                  value={formData.item_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Item</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Available: {item.available_quantity})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>User *</label>
              <select
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                required
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.student_id || user.username})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                name="quantity_borrowed"
                value={formData.quantity_borrowed}
                onChange={handleChange}
                min="1"
                max={getMaxQuantity()}
                required
              />
              <small>Max available: {getMaxQuantity()}</small>
            </div>

            <div className="form-group">
              <label>Expected Return Date *</label>
              <div className="date-input-container">
                <Calendar size={18} />
                <input
                  type="date"
                  name="expected_return_date"
                  value={formData.expected_return_date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Additional notes..."
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Processing...' : 'Borrow Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BorrowLogForm