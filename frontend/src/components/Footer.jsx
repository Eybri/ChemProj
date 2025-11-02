import React from 'react'
import { FlaskConical } from 'lucide-react'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <FlaskConical size={20} />
          <span>Chemistry Lab Inventory System</span>
        </div>
        <div className="footer-info">
          <span>TUPT Laboratory Management</span>
          <span>•</span>
          <span>© 2024 All rights reserved</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer