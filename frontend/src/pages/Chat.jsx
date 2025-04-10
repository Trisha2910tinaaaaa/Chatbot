import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useChat } from '../contexts/ChatContext'
import Message from '../components/chat/Message'
import InputBar from '../components/chat/InputBar'
import TypingIndicator from '../components/chat/TypingIndicator'

export default function Chat() {
  const { sessionId } = useParams()
  const { 
    currentSession,
    setCurrentSession,
    messages,
    setMessages,
    sessions
  } = useChat()

  useEffect(() => {
    if (sessionId && sessions.length > 0) {
      const session = sessions.find(s => s.id === sessionId)
      if (session) {
        setCurrentSession(session)
        fetchMessages(session.id)
      }
    }
  }, [sessionId, sessions])

  const fetchMessages = async (sessionId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:8000/api/sessions/${sessionId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        {messages.some(m => m.pending) && <TypingIndicator />}
      </div>
      <div className="p-4 border-t">
        <InputBar />
      </div>
    </div>
  )
}
