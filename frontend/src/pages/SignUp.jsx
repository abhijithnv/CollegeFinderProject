import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { registerUser } from '../api/register'

const SignUp = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate form data
    if (!username.trim()) {
      setError('Username is required')
      setIsLoading(false)
      return
    }
    if (!email.trim()) {
      setError('Email is required')
      setIsLoading(false)
      return
    }
    if (!password.trim()) {
      setError('Password is required')
      setIsLoading(false)
      return
    }

    const userData = {
      username: username.trim(),
      email: email.trim(),
      password: password.trim(),
    }

    try {
      await registerUser(userData)
      navigate('/signin', { 
        state: { message: 'Registration successful! Please sign in.' }
      })
    } catch (error) {
      console.error('Registration error:', error)
      
      if (error.type === 'NETWORK_ERROR') {
        setError('Network Error: Unable to connect to server. Please check your connection.')
      } else if (error.status === 400) {
        setError(error.message || 'Registration failed. Please check your information.')
      } else {
        setError(error.message || 'Registration failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-grey-light flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-grey-dark mt-2">Create your account</h1>
          <p className="text-grey-text text-sm mt-1">Join and start exploring colleges</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-grey-dark mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-xl border-2 px-3 py-2 focus:outline-none focus:ring-2"
              style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)', borderColor: '#bbb' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-grey-dark mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border-2 px-3 py-2 focus:outline-none focus:ring-2"
              style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)', borderColor: '#bbb' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-grey-dark mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border-2 px-3 py-2 pr-10 focus:outline-none focus:ring-2"
                style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)', borderColor: '#bbb' }}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-grey-text"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl font-semibold text-white transition-colors border-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#f5a742', borderColor: '#f5a742' }}
            onMouseEnter={(e) => { if (!isLoading) e.target.style.backgroundColor = '#f78f05' }}
            onMouseLeave={(e) => { if (!isLoading) e.target.style.backgroundColor = '#f5a742' }}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-grey-text">
          Already have an account?{' '}
          <Link to="/signin" className="font-semibold" style={{ color: '#f5a742' }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}

export default SignUp


