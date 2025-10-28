import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { prompt, messageHistory, isEdit, currentPPT } = await request.json()

    // Check if API key is available
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      console.error('Gemini API key not found in environment variables')
      console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('GEMINI')))
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file' },
        { status: 500 }
      )
    }

    console.log('Gemini API key found, length:', process.env.NEXT_PUBLIC_GEMINI_API_KEY.length)
    console.log('API key starts with:', process.env.NEXT_PUBLIC_GEMINI_API_KEY.substring(0, 10) + '...')
    
    // Test if API key has proper permissions
    console.log('Testing API key permissions...')

    // Use gemini-pro model which works with v1 API
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 3000,
      }
    })

    let systemPrompt = ''
    
    if (isEdit) {
      systemPrompt = `
You are a friendly, expert AI presentation designer. You're like a creative consultant who helps people create amazing presentations. Be conversational, enthusiastic, and helpful.

Current presentation structure:
${JSON.stringify(currentPPT, null, 2)}

User's edit request: ${prompt}

Please provide the updated presentation structure in the following JSON format:
{
  "content": "Your enthusiastic response about the changes you've made! Be excited about the improvements and explain why they make the presentation better.",
  "pptData": {
    "title": "Updated Presentation Title",
    "slides": [
      {
        "title": "Slide Title",
        "content": ["Point 1", "Point 2", "Point 3"],
        "type": "bullet"
      }
    ]
  }
}

Make the requested changes while maintaining professional quality and improving the overall presentation flow. Be creative and add value to the content.
`
    } else {
      // Build context from message history
      const context = messageHistory
        .slice(-6) // Last 6 messages for context
        .map((msg: any) => `${msg.role}: ${msg.content}`)
        .join('\n')

      systemPrompt = `
You are a friendly, expert AI presentation designer. You're like a creative consultant who helps people create amazing presentations. Be conversational, enthusiastic, and helpful.

Context from previous messages:
${context}

User's current request: ${prompt}

Please respond in the following JSON format:
{
  "content": "Your natural, conversational response - be enthusiastic about what you're creating! Use phrases like 'I've got something amazing for you!' or 'Let me create something special!' Make it feel personal and exciting.",
  "pptData": {
    "title": "Compelling Presentation Title",
    "slides": [
      {
        "title": "Slide Title",
        "content": ["Point 1", "Point 2", "Point 3"],
        "type": "bullet"
      }
    ]
  }
}

Guidelines for creating presentations:
- Create engaging, professional content
- Use clear, actionable bullet points
- Include relevant examples and insights
- Make slides informative but not overwhelming
- Use different slide types: "title", "content", "bullet", "image"
- For bullet slides: put each point as a separate string
- For content slides: use paragraphs as separate strings
- For title slides: use a single descriptive string
- For image slides: describe what visual should be included

If the user asks for a presentation or slides, always include the pptData field.
If it's just a conversation, omit the pptData field.

Be creative, professional, and provide valuable content that would impress in a business setting.
`
    }

    try {
      console.log('Attempting to call Gemini API...')
      const result = await model.generateContent(systemPrompt)
      const response = await result.response
      const text = response.text()
      
      console.log('Gemini API response received, length:', text.length)
      console.log('Response preview:', text.substring(0, 200) + '...')

      // Try to parse JSON response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          console.log('Successfully parsed JSON response from Gemini')
          return NextResponse.json(parsed)
        }
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError)
        console.log('Raw response:', text)
      }

      // Fallback to plain text response
      console.log('Using plain text response from Gemini')
      return NextResponse.json({
        content: text,
      })
    } catch (modelError: any) {
      console.error('Gemini model error:', modelError)
      console.error('Error details:', {
        message: modelError.message,
        code: modelError.code,
        status: modelError.status
      })
      
      // Return error instead of fallback
      return NextResponse.json(
        { error: 'Gemini API is not working. Please check your API key and try again.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error generating AI response:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    )
  }
}

