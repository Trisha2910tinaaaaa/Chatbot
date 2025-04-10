import { useState, useRef, useEffect } from 'react'
import { useChat } from '../../contexts/ChatContext'

export default function InputBar() {
  const [input, setInput] = useState('')
  const { sendMessage } = useChat()
  const textareaRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        handleSubmit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [input])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit'
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = `${scrollHeight}px`
    }
  }, [input])

  const handleSubmit = () => {
    if (!input.trim()) return
    sendMessage(input.trim())
    setInput('')
  }

  return (
    <div className="flex items-end space-x-2 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-2">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message... (Ctrl + Enter to send)"
        className="flex-1 max-h-[200px] min-h-[40px] resize-none bg-transparent border-0 focus:ring-0 focus:outline-none dark:text-white"
        rows={1}
      />
      <button
        onClick={handleSubmit}
        disabled={!input.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
      >
        Send
      </button>
    </div>
  )
}
