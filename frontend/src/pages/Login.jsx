import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'
import { FlaskConical, LogIn } from 'lucide-react'

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('Login attempt with:', { username: formData.username, password: '***' })

    try {
      const result = await login(formData.username, formData.password)
      console.log('Login result:', result)
      
      if (result.success) {
        console.log('Login successful, navigating to dashboard')
        navigate('/dashboard')
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Connection error: ' + (error.message || 'Cannot reach server'))
    } finally {
      setLoading(false)
    }
  }

  // Test direct API call
  const testBackendConnection = async () => {
    try {
      console.log('Testing backend connection...')
      const response = await fetch('http://localhost:8000/api/health')
      const data = await response.json()
      console.log('Backend health check:', data)
      alert(`Backend connection: ${data.status}\nService: ${data.service}`)
    } catch (error) {
      console.error('Backend connection failed:', error)
      alert('Backend connection failed. Make sure the backend server is running on port 8000.')
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-brand">
            <FlaskConical size={48} className="brand-icon" />
            <h1>Chemistry Lab Inventory</h1>
          </div>
          <p>Sign in to access the laboratory management system</p>
          
          {/* Test connection button */}
          <button 
            onClick={testBackendConnection}
            style={{
              background: 'transparent',
              border: '1px solid #3b82f6',
              color: '#3b82f6',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px',
              fontSize: '12px'
            }}
          >
            Test Backend Connection
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary btn-block"
          >
            {loading ? (
              'Signing in...'
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <div className="demo-accounts">
            <h3>Demo Accounts:</h3>
            <div className="demo-account">
              <strong>Admin:</strong> admin / admin123
            </div>
            <div className="demo-account">
              <strong>Viewer:</strong> viewer / viewer123
            </div>
          </div>
          <p className="system-info">
            TUPT Chemistry Laboratory Management System
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login