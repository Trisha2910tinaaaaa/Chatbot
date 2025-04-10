import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ChatProvider } from './contexts/ChatContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Navbar from './components/common/Navbar'
import Sidebar from './components/common/Sidebar'
import Landing from './pages/Landing'
import Chat from './pages/Chat'
import Sessions from './pages/Sessions'
import Settings from './pages/Settings'
import LoginForm from './components/auth/LoginForm'
import SignupForm from './components/auth/SignupForm'
import './App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <ChatProvider>
          <div className="app">
            <Toaster position="top-right" />
            <Navbar />
            <div className="main-container">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/signup" element={<SignupForm />} />
                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute>
                      <div className="chat-container">
                        <Sidebar />
                        <Chat />
                      </div>
                    </ProtectedRoute>
                  }
                >
                  <Route path=":sessionId" element={<Chat />} />
                </Route>
                <Route
                  path="/sessions"
                  element={
                    <ProtectedRoute>
                      <Sessions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </div>
        </ChatProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
