import React, { useState, useEffect } from 'react'
import { Plus, Edit, User, UserCheck, UserX } from 'lucide-react'
import { userService } from '../services/api'
import UserForm from './UserForm'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (formData) => {
    try {
      await userService.createUser(formData)
      loadUsers()
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  const handleUpdateUser = async (formData, userId) => {
    try {
      await userService.updateUser(userId, formData)
      loadUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  const handleToggleStatus = async (user) => {
    const newStatus = !user.is_active
    if (window.confirm(`Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} ${user.full_name}?`)) {
      try {
        await userService.updateUser(user.id, { is_active: newStatus })
        loadUsers()
      } catch (error) {
        console.error('Error updating user status:', error)
        alert('Error updating user status')
      }
    }
  }

  const handleEdit = (user) => {
    setSelectedUser(user)
    setShowForm(true)
  }

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { color: 'var(--danger)', label: 'Admin' },
      viewer: { color: 'var(--info)', label: 'Viewer' }
    }
    const config = roleConfig[role] || { color: 'var(--gray)', label: role }
    
    return (
      <span 
        className="role-badge"
        style={{ backgroundColor: config.color }}
      >
        {config.label}
      </span>
    )
  }

  const getStatusIcon = (isActive) => {
    return isActive ? 
      <UserCheck size={16} color="var(--success)" /> : 
      <UserX size={16} color="var(--danger)" />
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <h1>User Management</h1>
          <p>Manage system users and their permissions</p>
        </div>
        <div className="page-actions">
          <button 
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            <Plus size={18} />
            Add User
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Student ID</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map(user => (
                    <tr key={user.id} className={!user.is_active ? 'inactive' : ''}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            <User size={20} />
                          </div>
                          <div>
                            <strong>{user.full_name}</strong>
                            <small>@{user.username}</small>
                          </div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.student_id || '-'}</td>
                      <td>{getRoleBadge(user.role)}</td>
                      <td>
                        <div className="status-cell">
                          {getStatusIcon(user.is_active)}
                          <span className={`status ${user.is_active ? 'active' : 'inactive'}`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            onClick={() => handleEdit(user)}
                            className="btn btn-secondary btn-sm"
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(user)}
                            className={`btn btn-sm ${user.is_active ? 'btn-warning' : 'btn-success'}`}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-cell">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <UserForm
        user={selectedUser}
        onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
        onCancel={() => {
          setShowForm(false)
          setSelectedUser(null)
        }}
        isOpen={showForm}
      />
    </div>
  )
}

export default Users