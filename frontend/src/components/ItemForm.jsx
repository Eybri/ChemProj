import React, { useState, useEffect } from 'react'
import { X, Upload } from 'lucide-react'
import { categoryService } from '../services/api'

function ItemForm({ item, onSubmit, onCancel, isOpen }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    quantity: 0,
    unit: 'pieces',
    storage_location: '',
    condition: 'good',
    min_stock_level: 5,
    expiry_date: '',
    is_borrowable: true,
    image: null
  })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        category_id: item.category_id || '',
        quantity: item.quantity || 0,
        unit: item.unit || 'pieces',
        storage_location: item.storage_location || '',
        condition: item.condition || 'good',
        min_stock_level: item.min_stock_level || 5,
        expiry_date: item.expiry_date ? item.expiry_date.split('T')[0] : '',
        is_borrowable: item.is_borrowable !== false,
        image: null
      })
      if (item.image_url) {
        setImagePreview(`http://localhost:8000/uploads/${item.image_url}`)
      }
    }
  }, [item])

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'file' ? files[0] : value
    }))

    if (name === 'image' && files[0]) {
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = new FormData()
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key])
        }
      })

      // Add created_by for new items (you might want to get this from auth context)
      if (!item) {
        submitData.append('created_by', 1) // This should come from auth context
      }

      await onSubmit(submitData, item?.id)
      handleClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      category_id: '',
      quantity: 0,
      unit: 'pieces',
      storage_location: '',
      condition: 'good',
      min_stock_level: 5,
      expiry_date: '',
      is_borrowable: true,
      image: null
    })
    setImagePreview(null)
    onCancel()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{item ? 'Edit Item' : 'Add New Item'}</h2>
          <button onClick={handleClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-grid">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>Unit</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
              >
                <option value="pieces">Pieces</option>
                <option value="L">Liters</option>
                <option value="mL">Milliliters</option>
                <option value="g">Grams</option>
                <option value="kg">Kilograms</option>
                <option value="bottles">Bottles</option>
                <option value="boxes">Boxes</option>
              </select>
            </div>

            <div className="form-group">
              <label>Storage Location</label>
              <input
                type="text"
                name="storage_location"
                value={formData.storage_location}
                onChange={handleChange}
                placeholder="e.g., Cabinet A, Shelf B"
              />
            </div>

            <div className="form-group">
              <label>Condition</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
              >
                <option value="good">Good Condition</option>
                <option value="for_disposal">For Disposal</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div className="form-group">
              <label>Minimum Stock Level</label>
              <input
                type="number"
                name="min_stock_level"
                value={formData.min_stock_level}
                onChange={handleChange}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Expiry Date</label>
              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_borrowable"
                  checked={formData.is_borrowable}
                  onChange={handleChange}
                />
                Item can be borrowed
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Item description..."
            />
          </div>

          <div className="form-group">
            <label>Image</label>
            <div className="image-upload">
              <label className="file-input-label">
                <Upload size={18} />
                Choose Image
                <input
                  type="file"
                  name="image"
                  onChange={handleChange}
                  accept="image/*"
                  className="file-input"
                />
              </label>
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>
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
              {loading ? 'Saving...' : (item ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ItemForm