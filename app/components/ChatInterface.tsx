'use client'

import { useState } from 'react'
import { Send, Edit3, Loader2 } from 'lucide-react'
import { Message } from '../../types'

interface ChatInterfaceProps {
  messages: Message[]
  input: string
  setInput: (input: string) => void
  isLoading: boolean
  onSendMessage: () => void
  onEditPPT: (editPrompt: string) => void
  messagesEndRef: React.RefObject<HTMLDivElement | null>
}

export default function ChatInterface({
  messages,
  input,
  setInput,
  isLoading,
  onSendMessage,
  onEditPPT,
  messagesEndRef,
}: ChatInterfaceProps) {
  const [editPrompt, setEditPrompt] = useState('')
  const [showEditForm, setShowEditForm] = useState(false)

  // Dynamic example prompts generator - works with ANY topic
  const generateDynamicPrompts = () => {
    // Generate completely random topics from ANY domain
    const topicGenerators = [
      // Technology & Science
      () => `${["artificial intelligence", "machine learning", "quantum computing", "blockchain", "IoT", "robotics", "biotechnology", "nanotechnology"][Math.floor(Math.random() * 8)]}`,
      
      // Business & Finance
      () => `${["startup strategies", "investment banking", "cryptocurrency", "e-commerce", "supply chain", "venture capital", "mergers & acquisitions", "financial planning"][Math.floor(Math.random() * 8)]}`,
      
      // Health & Medicine
      () => `${["telemedicine", "mental health", "nutrition science", "pharmaceuticals", "medical devices", "public health", "genetics", "neuroscience"][Math.floor(Math.random() * 8)]}`,
      
      // Environment & Sustainability
      () => `${["renewable energy", "climate change", "sustainable agriculture", "green technology", "carbon capture", "biodiversity", "ocean conservation", "waste management"][Math.floor(Math.random() * 8)]}`,
      
      // Education & Learning
      () => `${["online learning", "educational technology", "skill development", "language learning", "special education", "early childhood", "adult education", "vocational training"][Math.floor(Math.random() * 8)]}`,
      
      // Arts & Culture
      () => `${["digital art", "music production", "film making", "literature", "theater", "dance", "photography", "architecture"][Math.floor(Math.random() * 8)]}`,
      
      // Social & Psychology
      () => `${["social media", "community building", "behavioral psychology", "social work", "urban planning", "demographics", "cultural studies", "anthropology"][Math.floor(Math.random() * 8)]}`,
      
      // Sports & Fitness
      () => `${["sports analytics", "fitness technology", "nutrition", "mental training", "rehabilitation", "sports medicine", "performance optimization", "team dynamics"][Math.floor(Math.random() * 8)]}`,
      
      // Travel & Tourism
      () => `${["sustainable tourism", "adventure travel", "cultural tourism", "ecotourism", "hospitality management", "destination marketing", "travel technology", "heritage preservation"][Math.floor(Math.random() * 8)]}`,
      
      // Food & Agriculture
      () => `${["food technology", "agricultural innovation", "sustainable farming", "food security", "nutrition science", "food processing", "aquaculture", "urban farming"][Math.floor(Math.random() * 8)]}`,
      
      // Space & Astronomy
      () => `${["space exploration", "astronomy", "satellite technology", "space tourism", "planetary science", "astrophysics", "space missions", "space debris"][Math.floor(Math.random() * 8)]}`,
      
      // Fashion & Design
      () => `${["sustainable fashion", "fashion technology", "textile innovation", "design thinking", "user experience", "product design", "interior design", "graphic design"][Math.floor(Math.random() * 8)]}`,
      
      // Entertainment & Media
      () => `${["streaming platforms", "content creation", "virtual reality", "augmented reality", "gaming industry", "podcasting", "social media", "digital marketing"][Math.floor(Math.random() * 8)]}`,
      
      // Transportation & Logistics
      () => `${["autonomous vehicles", "electric mobility", "logistics optimization", "smart cities", "public transportation", "aviation technology", "maritime transport", "urban mobility"][Math.floor(Math.random() * 8)]}`,
      
      // Random Creative Topics
      () => `${["creativity", "innovation", "problem solving", "leadership", "teamwork", "communication", "time management", "personal development"][Math.floor(Math.random() * 8)]}`
    ]
    
    const actions = [
      "Create an amazing presentation about",
      "Make stunning slides for",
      "Generate a fantastic presentation on",
      "Create slides about",
      "Make a presentation on",
      "Generate slides for"
    ]
    
    // Generate 10 random prompts from ANY domain
    const prompts = []
    for (let i = 0; i < 10; i++) {
      const topicGenerator = topicGenerators[Math.floor(Math.random() * topicGenerators.length)]
      const randomAction = actions[Math.floor(Math.random() * actions.length)]
      prompts.push(`${randomAction} ${topicGenerator()}`)
    }
    
    return prompts
  }

  const examplePrompts = generateDynamicPrompts()

  // Shuffle and pick random 3 examples
  const getRandomExamples = () => {
    const shuffled = [...examplePrompts].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 3)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (editPrompt.trim()) {
        onEditPPT(editPrompt.trim())
        setEditPrompt('')
        setShowEditForm(false)
      }
    }
  }

  const formatMessage = (content: string) => {
    // Simple formatting for better readability
    return content
      .split('\n')
      .map((line, index) => (
        <p key={index} className="mb-2 last:mb-0">
          {line}
        </p>
      ))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Responsive Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">AI Chat</h2>
        <p className="text-sm text-gray-600 hidden sm:block">Ask me to create or edit presentations</p>
        <p className="text-xs text-gray-500 sm:hidden">Create amazing presentations!</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <div className="mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit3 className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Hey there! 👋</h3>
              <p className="text-gray-600 mb-4 max-w-md">
                I'm your AI presentation wizard! I can create amazing presentations on any topic you want. Just tell me what you need and watch the magic happen! ✨
              </p>
            </div>
            
            <div className="text-left max-w-md mx-auto">
              <p className="text-sm font-medium text-gray-600 mb-3">Try these examples:</p>
              <div className="grid grid-cols-1 gap-2">
                {getRandomExamples().map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(prompt)}
                    className="text-left text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors border border-gray-200 hover:border-blue-200"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="text-sm">
                  {formatMessage(message.content)}
                </div>
                <div
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-3 flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-sm text-gray-600">AI is thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tell me what amazing presentation you'd like me to create! ✨"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={onSendMessage}
            disabled={!input.trim() || isLoading}
            className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1 sm:space-x-2 text-sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
        
        {messages.length > 0 && !showEditForm && (
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => setShowEditForm(true)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit presentation</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
