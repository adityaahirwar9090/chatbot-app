import { DefaultSession } from 'next-auth'

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  pptData?: any
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

// Extend NextAuth types
declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string
  }
  
  interface JWT {
    accessToken?: string
  }
}

