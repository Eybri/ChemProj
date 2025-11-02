import React from 'react'
import { Search, Filter, X } from 'lucide-react'

function SearchBar({ 
  searchTerm, 
  onSearchChange, 
  filters, 
  onFilterChange,
  availableFilters = {} 
}) {
  const [showFilters, setShowFilters] = React.useState(false)

  return (
    <div className="search-bar">
      <div className="search-input-container">
        <Search className="search-icon" />
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
        <button 
          className="filter-toggle-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-header">
            <h3>Filters</h3>
            <button 
              onClick={() => setShowFilters(false)}
              className="close-filters-btn"
            >
              <X size={18} />
            </button>
          </div>

          <div className="filters-grid">
            {availableFilters.category && (
              <div className="filter-group">
                <label>Category</label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => onFilterChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {availableFilters.category.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {availableFilters.storageLocation && (
              <div className="filter-group">
                <label>Storage Location</label>
                <input
                  type="text"
                  placeholder="e.g., Cabinet A"
                  value={filters.storageLocation || ''}
                  onChange={(e) => onFilterChange('storageLocation', e.target.value)}
                />
              </div>
            )}

            {availableFilters.condition && (
              <div className="filter-group">
                <label>Condition</label>
                <select
                  value={filters.condition || ''}
                  onChange={(e) => onFilterChange('condition', e.target.value)}
                >
                  <option value="">All Conditions</option>
                  <option value="good">Good</option>
                  <option value="for_disposal">For Disposal</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            )}

            {availableFilters.lowStock !== undefined && (
              <div className="filter-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.lowStock || false}
                    onChange={(e) => onFilterChange('lowStock', e.target.checked)}
                  />
                  Low Stock Only
                </label>
              </div>
            )}
          </div>

          <div className="filters-actions">
            <button 
              onClick={() => {
                onFilterChange('clear', true)
                setShowFilters(false)
              }}
              className="clear-filters-btn"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar