import React, { useState, useEffect } from 'react'
import { Plus, Download } from 'lucide-react'
import { useAuth } from '../services/AuthContext'
import { itemService, categoryService, borrowService } from '../services/api' // Added borrowService import
import ItemCard from '../components/ItemCard'
import ItemForm from '../components/ItemForm'
import BorrowLogForm from '../components/BorrowLogForm'
import SearchBar from '../components/SearchBar'

function Items() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showItemForm, setShowItemForm] = useState(false)
  const [showBorrowForm, setShowBorrowForm] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({})

  useEffect(() => {
    loadItems()
    loadCategories()
  }, [searchTerm, filters])

  const loadItems = async () => {
    try {
      const params = {
        search: searchTerm || undefined,
        category_id: filters.category || undefined,
        storage_location: filters.storageLocation || undefined,
        condition: filters.condition || undefined,
        low_stock: filters.lowStock || undefined
      }
      
      const data = await itemService.getItems(params)
      setItems(data)
    } catch (error) {
      console.error('Error loading items:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleCreateItem = async (formData) => {
    try {
      await itemService.createItem(formData)
      loadItems()
    } catch (error) {
      console.error('Error creating item:', error)
      throw error
    }
  }

  const handleUpdateItem = async (formData, itemId) => {
    try {
      await itemService.updateItem(itemId, formData)
      loadItems()
    } catch (error) {
      console.error('Error updating item:', error)
      throw error
    }
  }

  const handleDeleteItem = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        await itemService.deleteItem(item.id)
        loadItems()
      } catch (error) {
        console.error('Error deleting item:', error)
        alert('Error deleting item')
      }
    }
  }

  const handleBorrowItem = async (borrowData) => {
    try {
      await borrowService.createBorrowLog(borrowData)
      loadItems()
    } catch (error) {
      console.error('Error creating borrow log:', error)
      throw error
    }
  }

  const handleEdit = (item) => {
    setSelectedItem(item)
    setShowItemForm(true)
  }

  const handleBorrow = (item) => {
    setSelectedItem(item)
    setShowBorrowForm(true)
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  const handleFilterChange = (filter, value) => {
    if (filter === 'clear') {
      setFilters({})
    } else {
      setFilters(prev => ({ ...prev, [filter]: value }))
    }
  }

  const exportItems = () => {
    const csvContent = [
      ['Name', 'Category', 'Quantity', 'Available', 'Unit', 'Location', 'Condition'],
      ...items.map(item => [
        item.name,
        item.category?.name,
        item.quantity,
        item.available_quantity,
        item.unit,
        item.storage_location,
        item.condition
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'chem-lab-items.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <h1>Inventory Items</h1>
          <p>Manage laboratory items and equipment</p>
        </div>
        <div className="page-actions">
          {user?.role === 'admin' && (
            <>
              <button 
                onClick={exportItems}
                className="btn btn-secondary"
              >
                <Download size={18} />
                Export CSV
              </button>
              <button 
                onClick={() => setShowItemForm(true)}
                className="btn btn-primary"
              >
                <Plus size={18} />
                Add Item
              </button>
            </>
          )}
        </div>
      </div>

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        filters={filters}
        onFilterChange={handleFilterChange}
        availableFilters={{
          category: categories,
          storageLocation: true,
          condition: true,
          lowStock: true
        }}
      />

      {loading ? (
        <div className="loading">Loading items...</div>
      ) : (
        <div className="items-grid">
          {items.length > 0 ? (
            items.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDeleteItem}
                onBorrow={handleBorrow}
                userRole={user?.role}
              />
            ))
          ) : (
            <div className="empty-state">
              <h3>No items found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      )}

      {/* Item Form Modal */}
      <ItemForm
        item={selectedItem}
        onSubmit={selectedItem ? handleUpdateItem : handleCreateItem}
        onCancel={() => {
          setShowItemForm(false)
          setSelectedItem(null)
        }}
        isOpen={showItemForm}
      />

      {/* Borrow Form Modal */}
      {user?.role === 'admin' && (
        <BorrowLogForm
          item={selectedItem}
          onSubmit={handleBorrowItem}
          onCancel={() => {
            setShowBorrowForm(false)
            setSelectedItem(null)
          }}
          isOpen={showBorrowForm}
          currentUser={user}
        />
      )}
    </div>
  )
}

export default Items