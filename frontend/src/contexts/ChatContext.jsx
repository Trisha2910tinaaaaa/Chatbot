import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const ChatContext = createContext()

export function useChat() {
  return useContext(ChatContext)
}

export function ChatProvider({ children }) {
  const [sessions, setSessions] = useState([])
  const [currentSession, setCurrentSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('http://localhost:8000/api/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }

  const createSession = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8000/api/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: 'New Chat' })
      })

      if (response.ok) {
        const session = await response.json()
        setSessions([session, ...sessions])
        setCurrentSession(session)
        navigate(`/chat/${session.id}`)
      }
    } catch (error) {
      toast.error('Failed to create new chat')
    }
  }

  const sendMessage = async (content) => {
    if (!currentSession) return

    const newMessage = {
      id: Date.now(),
      content,
      role: 'user',
      pending: true
    }

    setMessages([...messages, newMessage])

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:8000/api/sessions/${currentSession.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(msgs => msgs.map(m => 
          m.id === newMessage.id ? data.userMessage : m
        ).concat(data.assistantMessage))
      } else {
        setMessages(msgs => msgs.filter(m => m.id !== newMessage.id))
        toast.error('Failed to send message')
      }
    } catch (error) {
      setMessages(msgs => msgs.filter(m => m.id !== newMessage.id))
      toast.error('Network error')
    }
  }

  const value = {
    sessions,
    currentSession,
    setCurrentSession,
    messages,
    setMessages,
    loading,
    createSession,
    sendMessage
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}
