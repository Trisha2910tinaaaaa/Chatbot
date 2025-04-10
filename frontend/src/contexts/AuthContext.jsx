import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check for stored token and validate
    const token = localStorage.getItem('token')
    if (token) {
      validateToken(token)
    } else {
      setLoading(false)
    }
  }, [])

  const validateToken = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/api/validate-token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        localStorage.removeItem('token')
      }
    } catch (error) {
      console.error('Token validation error:', error)
      localStorage.removeItem('token')
    }
    setLoading(false)
  }

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.token)
        setUser(data.user)
        navigate('/chat')
        toast.success('Welcome back!')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Login failed')
      }
    } catch (error) {
      toast.error('Network error')
    }
  }

  const signup = async (email, password, name) => {
    try {
      const response = await fetch('http://localhost:8000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.token)
        setUser(data.user)
        navigate('/chat')
        toast.success('Account created successfully!')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Signup failed')
      }
    } catch (error) {
      toast.error('Network error')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    navigate('/')
    toast.success('Logged out successfully')
  }

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
