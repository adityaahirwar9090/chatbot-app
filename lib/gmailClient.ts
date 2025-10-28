import { google } from 'googleapis'

export interface Email {
  id: string
  subject: string
  from: string
  snippet: string
  date: string
  body?: string
  category?: 'important' | 'promotional' | 'social' | 'marketing' | 'spam' | 'general'
}

export async function fetchGmailEmails(accessToken: string, maxResults: number = 15): Promise<Email[]> {
  try {
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: accessToken })

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

    // Fetch email list
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: maxResults,
    })

    const messages = response.data.messages || []
    const emails: Email[] = []

    // Fetch detailed information for each email
    for (const message of messages) {
      try {
        const emailDetail = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'full',
        })

        const headers = emailDetail.data.payload?.headers || []
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject'
        const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender'
        const date = headers.find(h => h.name === 'Date')?.value || new Date().toISOString()

        // Extract body text
        let body = ''
        if (emailDetail.data.payload?.body?.data) {
          body = Buffer.from(emailDetail.data.payload.body.data, 'base64').toString()
        } else if (emailDetail.data.payload?.parts) {
          for (const part of emailDetail.data.payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
              body = Buffer.from(part.body.data, 'base64').toString()
              break
            }
          }
        }

        emails.push({
          id: message.id!,
          subject,
          from,
          snippet: emailDetail.data.snippet || '',
          date,
          body: body.substring(0, 1000), // Limit body length
        })
      } catch (error) {
        console.error(`Error fetching email ${message.id}:`, error)
      }
    }

    return emails
  } catch (error) {
    console.error('Error fetching Gmail emails:', error)
    throw new Error('Failed to fetch emails')
  }
}

export function categorizeEmails(emails: Email[]): Email[] {
  // Simple categorization logic - in real app, this would use AI
  return emails.map(email => {
    const subject = email.subject.toLowerCase()
    const from = email.from.toLowerCase()
    const snippet = email.snippet.toLowerCase()

    // Promotional keywords
    if (subject.includes('sale') || subject.includes('discount') || subject.includes('offer') || 
        from.includes('promo') || from.includes('deal')) {
      email.category = 'promotional'
    }
    // Social keywords
    else if (from.includes('facebook') || from.includes('twitter') || from.includes('linkedin') ||
             from.includes('instagram') || from.includes('social')) {
      email.category = 'social'
    }
    // Marketing keywords
    else if (subject.includes('newsletter') || subject.includes('marketing') || 
             from.includes('marketing') || from.includes('newsletter')) {
      email.category = 'marketing'
    }
    // Spam keywords
    else if (subject.includes('viagra') || subject.includes('casino') || subject.includes('lottery') ||
             from.includes('noreply') || snippet.includes('unsubscribe')) {
      email.category = 'spam'
    }
    // Important keywords
    else if (subject.includes('urgent') || subject.includes('important') || 
             from.includes('work') || from.includes('office')) {
      email.category = 'important'
    }
    else {
      email.category = 'general'
    }

    return email
  })
}
