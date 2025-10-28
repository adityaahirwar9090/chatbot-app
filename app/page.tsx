'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Download, History, FileText, Loader2, Mail, Presentation, User, LogOut } from 'lucide-react'
import { useSession, signIn, signOut } from 'next-auth/react'
import ChatInterface from './components/ChatInterface'
import PPTPreview from './components/PPTPreview'
import ChatHistory from './components/ChatHistory'
import EmailClassifier from './components/EmailClassifier'
import { generatePPT, editPPT } from '../lib/pptGenerator'
import { generateAIResponse } from '../lib/geminiClient'
import { Message, ChatSession } from '../types'

export default function Home() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<'ppt' | 'email'>('ppt')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentPPT, setCurrentPPT] = useState<any>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [isGeneratingPPT, setIsGeneratingPPT] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Generate AI response
      const aiResponse = await generateAIResponse(input.trim(), messages)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.content,
        role: 'assistant',
        timestamp: new Date(),
        pptData: aiResponse.pptData,
      }

      setMessages(prev => [...prev, assistantMessage])

      // Generate PPT if structured data is available
      if (aiResponse.pptData) {
        setIsGeneratingPPT(true)
        try {
          const ppt = await generatePPT(aiResponse.pptData)
          setCurrentPPT(ppt)
        } catch (error) {
          console.error('Error generating PPT:', error)
        } finally {
          setIsGeneratingPPT(false)
        }
      }
    } catch (error) {
      console.error('Error generating response:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditPPT = async (editPrompt: string) => {
    if (!currentPPT || !editPrompt.trim()) return

    setIsGeneratingPPT(true)
    try {
      const editedPPT = await editPPT(currentPPT, editPrompt, messages)
      setCurrentPPT(editedPPT)
    } catch (error) {
      console.error('Error editing PPT:', error)
    } finally {
      setIsGeneratingPPT(false)
    }
  }

  const handleDownloadPPT = () => {
    if (!currentPPT) return
    
    currentPPT.writeFile({ fileName: 'presentation.pptx' })
  }

  const handleSaveSession = () => {
    if (messages.length === 0) return

    const session: ChatSession = {
      id: Date.now().toString(),
      title: messages[0]?.content.slice(0, 50) + '...' || 'New Chat',
      messages: [...messages],
      createdAt: new Date(),
    }

    setChatSessions(prev => [session, ...prev])
  }

  const handleLoadSession = (session: ChatSession) => {
    setMessages(session.messages)
    setShowHistory(false)
    
    // Find the last PPT data from the session
    const lastPPTMessage = session.messages
      .filter(m => m.pptData)
      .pop()
    
    if (lastPPTMessage?.pptData) {
      generatePPT(lastPPTMessage.pptData).then(setCurrentPPT)
    }
  }

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login page if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Simple Login Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              {/* Logo */}
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-white" />
              </div>
              
              {/* Title */}
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to AI Assistant</h1>
              <p className="text-gray-600 mb-8">
                Generate presentations and classify emails with AI
              </p>
              
              {/* Sign In Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => signIn('google')}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>Sign in with Google</span>
                </button>
                
                <div className="text-center text-sm text-gray-500">or</div>
                
                <button
                  onClick={() => window.location.href = '/api/auth/mock'}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>Demo Mode (Skip OAuth)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Responsive Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-2 sm:px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">AI Assistant</h1>
                <p className="text-sm text-gray-500 hidden sm:block">PPT Generator & Email Classifier</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">{session.user?.email}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">

        {/* Enhanced Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('ppt')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === 'ppt'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              <Presentation className="h-4 w-4" />
              <span className="text-sm font-medium">PPT Generator</span>
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === 'email'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              <Mail className="h-4 w-4" />
              <span className="text-sm font-medium">Email Classifier</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        {activeTab === 'ppt' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-h-[600px] max-h-[calc(100vh-180px)]">
            {/* Chat Interface */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              <ChatInterface
                messages={messages}
                input={input}
                setInput={setInput}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
                onEditPPT={handleEditPPT}
                messagesEndRef={messagesEndRef}
              />
            </div>

            {/* PPT Preview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              <PPTPreview
                ppt={currentPPT}
                isGenerating={isGeneratingPPT}
                onEdit={handleEditPPT}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <EmailClassifier
              user={session.user}
              onSignOut={() => signOut()}
            />
          </div>
        )}

        {/* Chat History Sidebar */}
        {showHistory && activeTab === 'ppt' && (
          <ChatHistory
            sessions={chatSessions}
            onLoadSession={handleLoadSession}
            onClose={() => setShowHistory(false)}
            onSaveSession={handleSaveSession}
          />
        )}
      </div>
    </div>
  )
}
