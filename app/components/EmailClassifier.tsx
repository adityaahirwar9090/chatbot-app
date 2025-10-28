'use client'

import { useState, useEffect } from 'react'
import { Mail, Filter, Download, RefreshCw, Loader2, User, Settings } from 'lucide-react'
import { Email } from '../../lib/gmailClient'

interface EmailClassifierProps {
  user: any
  onSignOut: () => void
}

export default function EmailClassifier({ user, onSignOut }: EmailClassifierProps) {
  const [emails, setEmails] = useState<Email[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [useAI, setUseAI] = useState(false)
  const [openAIKey, setOpenAIKey] = useState('')
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)

  const categories = [
    { key: 'all', label: 'All Emails', color: 'bg-gray-100' },
    { key: 'important', label: 'Important', color: 'bg-red-100 text-red-800' },
    { key: 'promotional', label: 'Promotional', color: 'bg-blue-100 text-blue-800' },
    { key: 'social', label: 'Social', color: 'bg-green-100 text-green-800' },
    { key: 'marketing', label: 'Marketing', color: 'bg-purple-100 text-purple-800' },
    { key: 'spam', label: 'Spam', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'general', label: 'General', color: 'bg-gray-100 text-gray-800' },
  ]

  useEffect(() => {
    // Load OpenAI key from localStorage
    const savedKey = localStorage.getItem('openai_key')
    if (savedKey) {
      setOpenAIKey(savedKey)
    }
  }, [])

  useEffect(() => {
    // Auto-dismiss notification after 5 seconds
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleFetchEmails = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/emails?maxResults=15&useAI=${useAI}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch emails')
      }

      const data = await response.json()
      setEmails(data.emails)
      
      // Store in localStorage
      localStorage.setItem('gmail_emails', JSON.stringify(data.emails))
    } catch (error) {
      console.error('Error fetching emails:', error)
      setNotification({type: 'error', message: 'Failed to fetch emails. Please try again.'})
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveOpenAIKey = () => {
    if (openAIKey.trim()) {
      localStorage.setItem('openai_key', openAIKey.trim())
      setNotification({type: 'success', message: 'OpenAI key saved successfully!'})
      setOpenAIKey('') // Clear the input
    }
  }

  const filteredEmails = selectedCategory === 'all' 
    ? emails 
    : emails.filter(email => email.category === selectedCategory)

  const getCategoryCount = (category: string) => {
    if (category === 'all') return emails.length
    return emails.filter(email => email.category === category).length
  }

  const exportEmails = () => {
    const csvContent = [
      'Subject,From,Date,Category,Snippet',
      ...filteredEmails.map(email => 
        `"${email.subject}","${email.from}","${email.date}","${email.category}","${email.snippet}"`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'emails.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        {/* Notification */}
        {notification && (
          <div className={`mb-4 p-4 rounded-lg ${
            notification.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <span>{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="ml-4 text-lg font-bold hover:opacity-70"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI API Key
              </label>
              <div className="flex space-x-2">
                <input
                  type="password"
                  value={openAIKey}
                  onChange={(e) => setOpenAIKey(e.target.value)}
                  placeholder="Enter your OpenAI API key"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={handleSaveOpenAIKey}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Use AI Classification</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleFetchEmails}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>Fetch Emails</span>
              </button>
              
              {emails.length > 0 && (
                <button
                  onClick={exportEmails}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              )}
            </div>
            
            <div className="text-sm text-gray-600">
              {emails.length > 0 && `${emails.length} emails loaded`}
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-800">Categories</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.key
                    ? 'bg-primary-600 text-white'
                    : category.color
                }`}
              >
                {category.label} ({getCategoryCount(category.key)})
              </button>
            ))}
          </div>
        </div>

        {/* Email List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedCategory === 'all' ? 'All Emails' : categories.find(c => c.key === selectedCategory)?.label}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredEmails.length} emails found
            </p>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {filteredEmails.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No emails found. Click "Fetch Emails" to load your Gmail.</p>
              </div>
            ) : (
              filteredEmails.map((email) => (
                <div key={email.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {email.subject}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          categories.find(c => c.key === email.category)?.color || 'bg-gray-100'
                        }`}>
                          {email.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{email.from}</p>
                      <p className="text-sm text-gray-500">{email.snippet}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(email.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
