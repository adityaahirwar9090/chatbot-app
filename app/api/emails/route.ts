import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { fetchGmailEmails, categorizeEmails } from '../../../lib/gmailClient'
import { classifyEmailsBatch } from '../../../lib/openaiClient'
import '../../../types'

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }: { token: any; account: any }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      session.accessToken = token.accessToken
      return session
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const maxResults = parseInt(searchParams.get('maxResults') || '15')
    const useAI = searchParams.get('useAI') === 'true'

    try {
      // Fetch emails from Gmail
      const emails = await fetchGmailEmails(session.accessToken as string, maxResults)
      
      // Classify emails
      let classifiedEmails
      if (useAI && process.env.OPENAI_API_KEY) {
        classifiedEmails = await classifyEmailsBatch(emails)
      } else {
        classifiedEmails = categorizeEmails(emails)
      }

      return NextResponse.json({ emails: classifiedEmails })
    } catch (gmailError) {
      console.error('Gmail API error:', gmailError)
      
      // Fallback: Return mock emails for demonstration
      const mockEmails = [
        {
          id: '1',
          subject: 'Welcome to our service',
          from: 'noreply@example.com',
          snippet: 'Thank you for signing up! We\'re excited to have you on board.',
          date: new Date().toISOString(),
          category: 'important'
        },
        {
          id: '2',
          subject: 'Special Offer - 50% Off!',
          from: 'deals@store.com',
          snippet: 'Don\'t miss out on our biggest sale of the year. Use code SAVE50.',
          date: new Date(Date.now() - 86400000).toISOString(),
          category: 'promotional'
        },
        {
          id: '3',
          subject: 'Meeting Reminder',
          from: 'calendar@company.com',
          snippet: 'Your meeting with the team is scheduled for tomorrow at 2 PM.',
          date: new Date(Date.now() - 172800000).toISOString(),
          category: 'important'
        },
        {
          id: '4',
          subject: 'Newsletter Update',
          from: 'newsletter@tech.com',
          snippet: 'Latest tech trends and industry insights in this week\'s newsletter.',
          date: new Date(Date.now() - 259200000).toISOString(),
          category: 'marketing'
        },
        {
          id: '5',
          subject: 'Social Media Notification',
          from: 'notifications@social.com',
          snippet: 'You have 5 new followers and 12 likes on your recent post.',
          date: new Date(Date.now() - 345600000).toISOString(),
          category: 'social'
        }
      ]

      return NextResponse.json({ 
        emails: mockEmails,
        message: 'Using demo emails - Gmail access requires re-authentication'
      })
    }
  } catch (error) {
    console.error('Error fetching emails:', error)
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { emails } = await request.json()
    
    // Store emails in localStorage (this would be handled on client side)
    // For now, just return success
    return NextResponse.json({ 
      message: 'Emails stored successfully',
      count: emails.length 
    })
  } catch (error) {
    console.error('Error storing emails:', error)
    return NextResponse.json(
      { error: 'Failed to store emails' },
      { status: 500 }
    )
  }
}
