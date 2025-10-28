import { Message } from '../types'

export interface AIResponse {
  content: string
  pptData?: {
    title: string
    slides: Array<{
      title: string
      content: string[]
      type: 'title' | 'content' | 'bullet' | 'image'
    }>
  }
}

export async function generateAIResponse(
  userInput: string,
  messageHistory: Message[]
): Promise<AIResponse> {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: userInput,
        messageHistory,
        isEdit: false,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate AI response')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error generating AI response:', error)
    throw new Error('Failed to generate AI response')
  }
}

export async function generateEditResponse(
  editPrompt: string,
  currentPPT: any,
  messageHistory: Message[]
): Promise<AIResponse> {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: editPrompt,
        messageHistory,
        isEdit: true,
        currentPPT,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate edit response')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error generating edit response:', error)
    throw new Error('Failed to generate edit response')
  }
}
