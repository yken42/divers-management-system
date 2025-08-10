
import React, { useState } from 'react'
import './App.css'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'

function App() {
  const [isSignUp, setIsSignUp] = useState(false)

  const toggleForm = () => {
    setIsSignUp(!isSignUp)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-600 flex items-center justify-center p-4">
      {isSignUp ? (
        <SignupForm onToggleForm={toggleForm} />
      ) : (
        <LoginForm onToggleForm={toggleForm} />
      )}
    </div>
  )
}

export default App
