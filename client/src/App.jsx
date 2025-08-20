
import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'
import { DiversList } from './components/DiversList'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-600 flex items-center justify-center">
        <div className="text-white text-xl">טוען...</div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-600">
        <Routes>
          {/* Protected Route - Redirect to login if not authenticated */}
          <Route 
            path="/divers" 
            element={
              isAuthenticated ? (
                <DiversList onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Login Route */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to="/divers" replace />
              ) : (
                <div className="flex items-center justify-center p-4">
                  <LoginForm onLoginSuccess={handleLoginSuccess} />
                </div>
              )
            } 
          />
          
          {/* Signup Route */}
          <Route 
            path="/signup" 
            element={
              isAuthenticated ? (
                <Navigate to="/divers" replace />
              ) : (
                <div className="flex items-center justify-center p-4">
                  <SignupForm />
                </div>
              )
            } 
          />
          
          {/* Default Route - Redirect to login or divers based on auth status */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <Navigate to="/divers" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
