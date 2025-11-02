import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Package } from 'lucide-react'
import { categoryService } from '../services/api'
import CategoryForm from '../components/CategoryForm'

function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async (formData) => {
    try {
      await categoryService.createCategory(formData)
      loadCategories()
    } catch (error) {
      console.error('Error creating category:', error)
      throw error
    }
  }

  const handleUpdateCategory = async (formData, categoryId) => {
    try {
      await categoryService.updateCategory(categoryId, formData)
      loadCategories()
    } catch (error) {
      console.error('Error updating category:', error)
      throw error
    }
  }

  const handleDeleteCategory = async (category) => {
    if (category.items_count > 0) {
      alert('Cannot delete category with existing items. Please reassign or delete the items first.')
      return
    }

    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      try {
        await categoryService.deleteCategory(category.id)
        loadCategories()
      } catch (error) {
        console.error('Error deleting category:', error)
        alert('Error deleting category')
      }
    }
  }

  const handleEdit = (category) => {
    setSelectedCategory(category)
    setShowForm(true)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <h1>Categories</h1>
          <p>Manage item categories and classifications</p>
        </div>
        <div className="page-actions">
          <button 
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading categories...</div>
      ) : (
        <div className="categories-grid">
          {categories.length > 0 ? (
            categories.map(category => (
              <div key={category.id} className="category-card">
                <div className="category-icon">
                  <Package size={24} />
                </div>
                <div className="category-content">
                  <h3>{category.name}</h3>
                  <p>{category.description || 'No description'}</p>
                  <div className="category-meta">
                    <span className="items-count">
                      {category.items_count} items
                    </span>
                  </div>
                </div>
                <div className="category-actions">
                  <button 
                    onClick={() => handleEdit(category)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteCategory(category)}
                    className="btn btn-danger btn-sm"
                    disabled={category.items_count > 0}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <h3>No categories found</h3>
              <p>Get started by creating your first category</p>
            </div>
          )}
        </div>
      )}

      <CategoryForm
        category={selectedCategory}
        onSubmit={selectedCategory ? handleUpdateCategory : handleCreateCategory}
        onCancel={() => {
          setShowForm(false)
          setSelectedCategory(null)
        }}
        isOpen={showForm}
      />
    </div>
  )
}

export default Categories