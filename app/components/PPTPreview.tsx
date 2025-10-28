'use client'

import { useState, useEffect } from 'react'
import { FileText, Loader2, Download, Edit3, Eye } from 'lucide-react'

interface PPTPreviewProps {
  ppt: any | null
  isGenerating: boolean
  onEdit: (editPrompt: string) => void
}

export default function PPTPreview({ ppt, isGenerating, onEdit }: PPTPreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slideImages, setSlideImages] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(true) // Default to showing preview
  const [showEditForm, setShowEditForm] = useState(false)
  const [editPrompt, setEditPrompt] = useState('')

  useEffect(() => {
    if (ppt) {
      console.log('PPT Data received:', ppt) // Debug log
      generateSlideImages()
    }
  }, [ppt])

  const generateSlideImages = async () => {
    if (!ppt || !ppt.slides) {
      console.log('No PPT or slides data available')
      return
    }

    try {
      console.log('Generating slide images for', ppt.slides.length, 'slides')
      const images: string[] = []
      
      for (let i = 0; i < ppt.slides.length; i++) {
        const slide = ppt.slides[i]
        console.log('Processing slide', i + 1, ':', slide)
        
        // Create a more professional SVG with modern design
        const svgContent = `
          <svg width="500" height="300" xmlns="http://www.w3.org/2000/svg">
            <!-- Background with gradient -->
            <defs>
              <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#f8fafc;stop-opacity:1" />
              </linearGradient>
              <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
              </linearGradient>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.1"/>
              </filter>
            </defs>
            
            <!-- Main slide background -->
            <rect width="500" height="300" fill="url(#bgGradient)" stroke="#e2e8f0" stroke-width="2" rx="12" filter="url(#shadow)"/>
            
            <!-- Header section -->
            <rect width="500" height="80" fill="url(#headerGradient)" rx="12"/>
            <rect width="500" height="80" fill="url(#headerGradient)" rx="12" transform="translate(0,0)"/>
            
            <!-- Slide number badge -->
            <circle cx="450" cy="40" r="20" fill="rgba(255,255,255,0.2)"/>
            <text x="450" y="46" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ffffff">${i + 1}</text>
            
            <!-- Title -->
            <text x="250" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">${slide.title || 'Untitled Slide'}</text>
            
            <!-- Content area -->
            <g transform="translate(40, 120)">
              ${slide.content && slide.content.length > 0 ? slide.content.slice(0, 6).map((item: string, index: number) => {
                const yPos = index * 28 + 20;
                return `
                  <g transform="translate(0, ${yPos})">
                    <circle cx="8" cy="8" r="4" fill="#3b82f6"/>
                    <text x="25" y="12" font-family="Arial, sans-serif" font-size="14" fill="#374151">${item}</text>
                  </g>
                `;
              }).join('') : '<text x="0" y="20" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">No content available</text>'}
            </g>
            
            <!-- Footer -->
            <rect x="0" y="280" width="500" height="20" fill="#f1f5f9" rx="0"/>
            <text x="20" y="295" font-family="Arial, sans-serif" font-size="10" fill="#64748b">AI-Generated Presentation</text>
            <text x="480" y="295" text-anchor="end" font-family="Arial, sans-serif" font-size="10" fill="#64748b">Slide ${i + 1}</text>
          </svg>
        `
        
        const base64Svg = btoa(unescape(encodeURIComponent(svgContent)))
        images.push(`data:image/svg+xml;base64,${base64Svg}`)
      }
      
      console.log('Generated', images.length, 'slide images')
      setSlideImages(images)
    } catch (error) {
      console.error('Error generating slide images:', error)
      // Fallback: create a professional placeholder
      const placeholderSvg = `
        <svg width="500" height="300" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#f8fafc;stop-opacity:1" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.1"/>
            </filter>
          </defs>
          <rect width="500" height="300" fill="url(#bgGradient)" stroke="#e2e8f0" stroke-width="2" rx="12" filter="url(#shadow)"/>
          <text x="250" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#6b7280">Professional Slide Preview</text>
          <text x="250" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af">Loading presentation...</text>
        </svg>
      `
      setSlideImages([`data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(placeholderSvg)))}`])
    }
  }

  const handleDownload = () => {
    if (ppt) {
      ppt.download()
    }
  }

  const handleEdit = () => {
    setShowEditForm(true)
  }

  const handleEditSubmit = () => {
    if (editPrompt.trim()) {
      onEdit(editPrompt.trim())
      setEditPrompt('')
      setShowEditForm(false)
    }
  }

  const handleEditCancel = () => {
    setEditPrompt('')
    setShowEditForm(false)
  }

  const nextSlide = () => {
    if (slideImages.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length)
    }
  }

  const prevSlide = () => {
    if (slideImages.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + slideImages.length) % slideImages.length)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Presentation Preview</h2>
              {ppt && (
                <p className="text-sm text-gray-600 mt-1">
                  {ppt.title} • {ppt.slides?.length || 0} slides
                </p>
              )}
            </div>
          </div>
          
          {ppt && (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Eye className="w-4 h-4" />
                <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Generating Presentation</h3>
            <p className="text-sm text-gray-500">Please wait while we create your slides...</p>
          </div>
        ) : !ppt ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Presentation Yet</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Start a conversation to generate your first presentation. 
              Ask me to create slides on any topic!
            </p>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Slide Counter */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Slide {currentSlide + 1} of {slideImages.length}
                </div>
                <div className="text-sm text-gray-600">
                  {ppt?.title && `"${ppt.title}"`}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevSlide}
                  disabled={slideImages.length <= 1}
                  className="px-4 py-2 text-sm bg-white hover:bg-gray-50 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  ← Previous
                </button>
                <button
                  onClick={nextSlide}
                  disabled={slideImages.length <= 1}
                  className="px-4 py-2 text-sm bg-white hover:bg-gray-50 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Next →
                </button>
              </div>
            </div>

            {/* Slide Preview */}
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
              {slideImages[currentSlide] ? (
                <div className="relative">
                  <img
                    src={slideImages[currentSlide]}
                    alt={`Slide ${currentSlide + 1}`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
                    onError={(e) => {
                      console.error('Error loading slide image:', e)
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  {/* Slide overlay with professional styling */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                    <span className="text-xs font-medium text-gray-700">Slide {currentSlide + 1}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium">Loading slide preview...</p>
                  <p className="text-sm text-gray-400 mt-1">Please wait while we generate your presentation</p>
                </div>
              )}
            </div>

            {/* Slide Thumbnails */}
            {slideImages.length > 1 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Slide Thumbnails</h3>
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {slideImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`flex-shrink-0 w-20 h-12 rounded-lg border-2 transition-all duration-200 shadow-sm hover:shadow-md ${
                        index === currentSlide
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                        {index + 1}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Edit Section */}
            <div className="mt-6">
              {showEditForm ? (
                <div className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Edit3 className="w-5 h-5 mr-2 text-blue-600" />
                    Edit Your Presentation
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Tell me what changes you'd like to make to your presentation. Be specific about what you want to add, remove, or modify!
                  </p>
                  <div className="space-y-4">
                    <textarea
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="e.g., Add a slide about market analysis, Change the conclusion to be more impactful, Add more examples to slide 3..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                    <div className="flex space-x-3">
                      <button
                        onClick={handleEditSubmit}
                        disabled={!editPrompt.trim()}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        Apply Changes ✨
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <button
                    onClick={handleEdit}
                    className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Edit3 className="w-5 h-5" />
                    <span className="font-medium">Edit Presentation</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
