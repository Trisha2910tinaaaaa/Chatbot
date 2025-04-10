import React, { useState } from 'react'
import { Send, Bot, User, History, Settings, Brain, Plus, ChevronRight, LogOut, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Typewriter from 'typewriter-effect'

interface Message {
  content: string
  isBot: boolean
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  lastActive: Date
}

function App() {
  const [showLanding, setShowLanding] = useState(true)
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: 'Getting Started Chat',
      messages: [
        { 
          content: "Hello! I'm your AI assistant. How can I help you today?",
          isBot: true,
          timestamp: new Date()
        }
      ],
      lastActive: new Date()
    }
  ])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsAuthenticated(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !activeSession) return

    const newMessage: Message = {
      content: input,
      isBot: false,
      timestamp: new Date()
    }

    setChatSessions(prev => prev.map(session => 
      session.id === activeSession
        ? {
            ...session,
            messages: [...session.messages, newMessage],
            lastActive: new Date()
          }
        : session
    ))
    
    setTimeout(() => {
      const botResponse: Message = {
        content: "I'm a demo AI assistant. While I can't actually process your requests, in a real implementation this is where you'd integrate with an AI API.",
        isBot: true,
        timestamp: new Date()
      }
      
      setChatSessions(prev => prev.map(session => 
        session.id === activeSession
          ? {
              ...session,
              messages: [...session.messages, botResponse],
              lastActive: new Date()
            }
          : session
      ))
    }, 1000)
    
    setInput('')
  }

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      lastActive: new Date()
    }
    setChatSessions(prev => [...prev, newSession])
    setActiveSession(newSession.id)
    setShowLanding(false)
  }

  const currentSession = chatSessions.find(session => session.id === activeSession)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-pink-900 mb-2">Welcome Back</h1>
            <p className="text-pink-600">Sign in to continue your conversations</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-2xl shadow-lg"
          >
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-pink-900 mb-2" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50 pl-11"
                    placeholder="you@example.com"
                    required
                  />
                  <Mail className="w-5 h-5 text-pink-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-pink-900 mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50 pl-11 pr-11"
                    placeholder="Enter your password"
                    required
                  />
                  <Lock className="w-5 h-5 text-pink-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-pink-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-pink-700">
                    Remember me
                  </label>
                </div>
                <button type="button" className="text-sm text-pink-600 hover:text-pink-800">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors"
              >
                Sign In
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-pink-600">
                Don't have an account?{' '}
                <button className="font-semibold text-pink-700 hover:text-pink-800">
                  Sign up
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (showLanding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100">
        <div className="max-w-6xl mx-auto pt-20 px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="relative inline-block">
              <img
                src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80"
                alt="AI Assistant"
                className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-white shadow-lg"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center"
              >
                <Sparkles size={16} className="text-white" />
              </motion.div>
            </div>
            <h1 className="text-5xl font-bold text-pink-800 mb-4">Welcome to PinkAI Chat</h1>
            <div className="text-xl text-pink-600 h-20">
              <Typewriter
                options={{
                  strings: [
                    'Your intelligent conversation partner',
                    'Available 24/7 to assist you',
                    'Powered by advanced AI technology'
                  ],
                  autoStart: true,
                  loop: true,
                }}
              />
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => {
                createNewChat()
                setShowLanding(false)
              }}
              className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-center mb-6">
                <Bot size={48} className="text-pink-500" />
              </div>
              <h2 className="text-2xl font-semibold text-pink-800 mb-3">Start New Chat</h2>
              <p className="text-pink-600">Begin a fresh conversation with your AI companion</p>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => setShowLanding(false)}
              className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-center mb-6">
                <History size={48} className="text-pink-500" />
              </div>
              <h2 className="text-2xl font-semibold text-pink-800 mb-3">View History</h2>
              <p className="text-pink-600">Access your previous conversations and insights</p>
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-pink-50">
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        className="hidden md:flex md:w-[260px] bg-pink-900 flex-col p-4"
      >
        <button
          onClick={createNewChat}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-pink-700 hover:bg-pink-800 transition-colors mb-4"
        >
          <Plus size={16} className="text-pink-100" />
          <span className="text-pink-100">New Chat</span>
        </button>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto">
          <div className="mb-4">
            <h2 className="text-pink-300 text-sm font-semibold mb-2 px-2">Recent Chats</h2>
            <AnimatePresence>
              {chatSessions.map(session => (
                <motion.button
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => setActiveSession(session.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg mb-1 flex items-center gap-2 ${
                    activeSession === session.id ? 'bg-pink-800' : 'hover:bg-pink-800/50'
                  }`}
                >
                  <Brain size={16} className="text-pink-300" />
                  <span className="text-pink-100 text-sm truncate">{session.title}</span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Profile Section */}
        <div className="border-t border-pink-800 pt-4">
          <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-pink-800/50">
            <Settings size={16} className="text-pink-300" />
            <span className="text-pink-100">Settings</span>
          </button>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-pink-800/50"
          >
            <LogOut size={16} className="text-pink-300" />
            <span className="text-pink-100">Sign Out</span>
          </button>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Session Header */}
        <div className="bg-white border-b border-pink-100 p-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <h2 className="text-pink-900 font-semibold">
              {currentSession?.title || 'Select a chat'}
            </h2>
            <button className="p-2 hover:bg-pink-50 rounded-lg">
              <ChevronRight size={20} className="text-pink-500" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {currentSession?.messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-8 flex gap-4 ${message.isBot ? 'bg-white' : 'bg-pink-50'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.isBot ? 'bg-pink-500' : 'bg-pink-700'
                }`}>
                  {message.isBot ? (
                    <Bot size={20} className="text-white" />
                  ) : (
                    <User size={20} className="text-white" />
                  )}
                </div>
                <div className="flex-1 max-w-3xl">
                  {message.isBot ? (
                    <Typewriter
                      options={{
                        string: message.content,
                        autoStart: true,
                        delay: 30,
                      }}
                      onInit={(typewriter) => {
                        typewriter.typeString(message.content).start();
                      }}
                    />
                  ) : (
                    <p className="text-gray-800 leading-relaxed">{message.content}</p>
                  )}
                  <span className="text-xs text-pink-400 mt-2 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="border-t border-pink-100 bg-white p-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Send a message..."
              className="w-full p-4 pr-12 rounded-lg border border-pink-200 focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50 transition-colors"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-pink-400 hover:text-pink-600 transition-colors disabled:opacity-50"
              disabled={!input.trim() || !activeSession}
            >
              <Send size={20} />
            </button>
          </form>
          <p className="text-xs text-center mt-2 text-pink-400">
            This is a demo interface. Messages are not processed by a real AI.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App