import React, { useState, useEffect } from 'react'
import axios from 'axios'

export const DiversList = ({ onLogout }) => {
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [dives, setDives] = useState([])
  const [fetching, setFetching] = useState(false)

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
  const isAdmin = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user?.role === 'admin'
    } catch {
      return false
    }
  })()

  const handleCreateDive = async () => {
    setError(null)
    setSuccess(null)

    if (!date) {
      setError('יש לבחור תאריך')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      setError('לא מחובר. נא להתחבר מחדש')
      return
    }

    try {
      setLoading(true)
      const res = await axios.post(
        `${API_BASE_URL}/dive/createDive`,
        { date },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res?.status === 201) {
        setSuccess('הצלילה נוצרה בהצלחה')
        // אופציונלי: לאפס תאריך
        // setDate('')
        // ריענון הרשימה לאחר יצירה
        fetchDives()
      }
    } catch (err) {
      const status = err?.response?.status
      const message = err?.response?.data?.message || err.message || 'שגיאה ביצירת צלילה'
      setError(message)
      if (status === 401 && typeof onLogout === 'function') {
        onLogout()
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchDives = async () => {
    setError(null)
    const token = localStorage.getItem('token')
    if (!token) {
      if (typeof onLogout === 'function') onLogout()
      return
    }
    try {
      setFetching(true)
      const endpoint = isAdmin ? '/dive/all' : '/dive/myDives'
      const res = await axios.get(`${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDives(res?.data?.dives || [])
    } catch (err) {
      const status = err?.response?.status
      const message = err?.response?.data?.message || err.message || 'שגיאה בטעינת צלילות'
      setError(message)
      if (status === 401 && typeof onLogout === 'function') {
        onLogout()
      }
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchDives()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-600 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-200"
            >
              התנתק
            </button>
            <div className='text-right'>
              <h1 className="text-3xl font-bold text-gray-900">רשימת צוללנים</h1>
              <p className="text-gray-600 mt-2">ניהול צוללים וצלילות</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-2xl p-6">
          {/* Create Dive */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-right">יצירת צלילה חדשה</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleCreateDive}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-md transition duration-200"
              >
                {loading ? 'יוצר…' : 'צור צלילה'}
              </button>
            </div>
            {error && <div className="text-red-600 text-sm mt-2 text-right">{error}</div>}
            {success && <div className="text-green-600 text-sm mt-2 text-right">{success}</div>}
          </div>
          {/* My Dives List */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800 text-right">הצלילות שלי</h3>
              <button
                onClick={fetchDives}
                disabled={fetching}
                className="text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-60 text-gray-800 px-3 py-1 rounded-md"
              >
                {fetching ? 'טוען…' : 'רענן'}
              </button>
            </div>
            {dives.length === 0 && !fetching && (
              <div className="text-gray-500 text-right">אין צלילות להצגה</div>
            )}
            {dives.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">תאריך</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">סטטוס</th>
                      {isAdmin && (
                        <>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">צוללן</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">אימייל</th>
                        </>
                      )}
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">נוצר</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dives.map((dive) => (
                      <tr key={dive._id}>
                        <td className="px-4 py-2 whitespace-nowrap">{dive.date}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{dive.status}</td>
                        {isAdmin && (
                          <>
                            <td className="px-4 py-2 whitespace-nowrap">{dive?.user?.fullName || '-'}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{dive?.user?.email || '-'}</td>
                          </>
                        )}
                        <td className="px-4 py-2 whitespace-nowrap">{new Date(dive.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
