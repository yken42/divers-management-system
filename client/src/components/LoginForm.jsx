import React, { useState } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginForm({ onToggleForm, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

    try {
      const res = await axios.post(`${API_BASE_URL}/user/login`, {
        email: formData.email,
        password: formData.password
      })

      const { token, user } = res.data || {}
      if (!token) {
        throw new Error('Token not returned from server')
      }

      // Persist token (and optionally user)
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user || {}))

      setSuccess('התחברת בהצלחה')
      
      // Call the success callback and navigate
      if (onLoginSuccess) {
        onLoginSuccess()
      }
      
      // Navigate to divers page after a short delay
      setTimeout(() => {
        navigate('/divers')
      }, 1000)
      
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'התחברות נכשלה'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">ניהול צוללנים</h1>
        <p className="text-gray-600 mt-2">התחבר לחשבון שלך</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            כתובת דוא״ל
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="yochanan@example.com"
          />
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            סיסמה
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        {/* Feedback */}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
        >
          {loading ? 'מתחבר…' : 'התחבר'}
        </button>
      </form>

      {/* Toggle Form */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          אין לך חשבון?{' '}
          <button
            onClick={onToggleForm}
            className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition duration-200"
          >
            הירשם
          </button>
        </p>
      </div>
    </div>
  )
}

export default LoginForm
