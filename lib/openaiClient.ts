import OpenAI from 'openai'
import { Email } from './gmailClient'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ClassificationResult {
  category: 'important' | 'promotional' | 'social' | 'marketing' | 'spam' | 'general'
  confidence: number
  reasoning: string
}

export async function classifyEmailWithAI(email: Email): Promise<ClassificationResult> {
  try {
    const prompt = `
Classify the following email into one of these categories:
- important: Personal or work-related emails requiring immediate attention
- promotional: Sales, discounts, and marketing campaigns
- social: Emails from social networks, friends, and family
- marketing: Marketing newsletters and notifications
- spam: Unwanted or unsolicited emails
- general: If none of the above categories match

Email Details:
Subject: ${email.subject}
From: ${email.from}
Snippet: ${email.snippet}
Body: ${email.body?.substring(0, 500) || 'No body content'}

Respond with a JSON object containing:
{
  "category": "one of the categories above",
  "confidence": "number between 0 and 1",
  "reasoning": "brief explanation of why this category was chosen"
}
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an email classification assistant. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 200,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    try {
      const result = JSON.parse(response)
      return {
        category: result.category,
        confidence: result.confidence,
        reasoning: result.reasoning
      }
    } catch (parseError) {
      // Fallback classification
      return {
        category: 'general',
        confidence: 0.5,
        reasoning: 'Failed to parse AI response, using general category'
      }
    }
  } catch (error) {
    console.error('Error classifying email with AI:', error)
    return {
      category: 'general',
      confidence: 0.3,
      reasoning: 'AI classification failed, using general category'
    }
  }
}

export async function classifyEmailsBatch(emails: Email[]): Promise<Email[]> {
  const classifiedEmails = []
  
  for (const email of emails) {
    try {
      const classification = await classifyEmailWithAI(email)
      email.category = classification.category
      classifiedEmails.push(email)
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`Error classifying email ${email.id}:`, error)
      email.category = 'general'
      classifiedEmails.push(email)
    }
  }
  
  return classifiedEmails
}
