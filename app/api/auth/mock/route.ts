import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Mock authentication for demo purposes
  const mockUser = {
    name: 'Demo User',
    email: 'demo@magicslides.app',
    image: 'https://via.placeholder.com/150/4F46E5/FFFFFF?text=DU',
    accessToken: 'mock_access_token_for_demo'
  }

  // Set mock session cookie
  const response = NextResponse.redirect(new URL('/', request.url))
  
  // Create a simple session token
  const sessionToken = Buffer.from(JSON.stringify({
    user: mockUser,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  })).toString('base64')

  response.cookies.set('next-auth.session-token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 // 24 hours
  })

  return response
}
