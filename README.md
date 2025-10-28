# AI Assistant - PPT Generator & Gmail Email Classifier

A comprehensive web application that combines AI-powered PowerPoint generation with intelligent Gmail email classification. Built for the MagicSlides.app Full-Stack Engineer Intern Assignment.

## 🚀 Features

### PPT Generator
- **AI-Powered Creation**: Generate presentations using Google Gemini AI
- **Live Preview**: Real-time slide preview with navigation
- **Dynamic Editing**: Edit presentations through natural language prompts
- **Download Options**: Export presentations as text files
- **Chat History**: Save and revisit past conversations

### Gmail Email Classifier
- **Google OAuth Authentication**: Secure login with Google accounts
- **Email Fetching**: Retrieve last 15 emails from Gmail API
- **AI Classification**: Categorize emails using OpenAI GPT-4o
- **Smart Categories**: Important, Promotional, Social, Marketing, Spam, General
- **Export Functionality**: Download classified emails as CSV
- **localStorage Storage**: Store emails and OpenAI keys locally

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js with Google OAuth
- **AI Integration**: 
  - Google Gemini 2.0 Flash (PPT generation)
  - OpenAI GPT-4o (Email classification)
- **APIs**: Gmail API, Google OAuth, OpenAI API
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Cloud Console account
- OpenAI API account
- Google Gemini API account

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd ai-chatbot-ppt
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Variables Setup

Create a `.env.local` file in the root directory:

```env
# Gemini AI API Key
# Get from: https://makersuite.google.com/app/apikey
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Google OAuth Credentials
# Get from: https://console.developers.google.com/
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# OpenAI API Key
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing
3. Enable the following APIs:
   - Gmail API
   - Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Set **Application type** to "Web application"
6. Add **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy **Client ID** and **Client Secret** to `.env.local`

### 5. Run the Application

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Usage

### PPT Generator
1. **Sign in** with your Google account
2. **Switch to PPT Generator** tab
3. **Enter prompts** like:
   - "Create a presentation about artificial intelligence"
   - "Make slides for a business proposal on renewable energy"
   - "Generate a presentation on machine learning basics"
4. **View generated slides** in the preview panel
5. **Edit presentations** using natural language
6. **Download** presentations as text files

### Gmail Email Classifier
1. **Sign in** with your Google account
2. **Switch to Email Classifier** tab
3. **Add your OpenAI API key** in the settings panel
4. **Click "Fetch Emails"** to load your last 15 Gmail emails
5. **Choose classification method**:
   - AI-powered (using OpenAI GPT-4o)
   - Rule-based (simple keyword matching)
6. **Filter emails** by category
7. **Export classified emails** as CSV

## 📁 Project Structure

```
ai-chatbot-ppt/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth configuration
│   │   ├── emails/                  # Gmail API endpoints
│   │   └── gemini/                  # Gemini AI endpoints
│   ├── components/
│   │   ├── ChatInterface.tsx        # PPT chat interface
│   │   ├── PPTPreview.tsx           # Presentation preview
│   │   ├── ChatHistory.tsx          # Chat history management
│   │   └── EmailClassifier.tsx      # Email classification UI
│   ├── providers.tsx                # Session provider
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Main page
│   └── globals.css                  # Global styles
├── lib/
│   ├── geminiClient.ts              # Gemini AI integration
│   ├── gmailClient.ts               # Gmail API integration
│   ├── openaiClient.ts              # OpenAI integration
│   └── pptGenerator.ts              # PPT generation logic
├── types/
│   └── index.ts                     # TypeScript definitions
├── package.json                     # Dependencies
├── tailwind.config.js               # Tailwind configuration
├── tsconfig.json                    # TypeScript configuration
└── next.config.js                   # Next.js configuration
```

## 🔐 API Integration Details

### Google OAuth
- **Provider**: NextAuth.js
- **Scopes**: Gmail read access
- **Redirect**: `/api/auth/callback/google`

### Gmail API
- **Endpoint**: `https://gmail.googleapis.com/gmail/v1/users/me/messages`
- **Permissions**: `https://www.googleapis.com/auth/gmail.readonly`
- **Rate Limits**: 1 billion quota units per day

### OpenAI GPT-4o
- **Model**: `gpt-4o`
- **Temperature**: 0.3 (for consistent classification)
- **Max Tokens**: 200
- **Rate Limits**: Based on your plan

### Google Gemini
- **Model**: `gemini-2.0-flash-exp`
- **Temperature**: 0.7
- **Max Tokens**: 2048

## 🎨 Design Features

- **Modern UI**: Clean, professional interface
- **Responsive Design**: Works on desktop and mobile
- **Tab Navigation**: Easy switching between features
- **Real-time Updates**: Live preview and progress indicators
- **Accessibility**: ARIA labels and keyboard navigation
- **Error Handling**: User-friendly error messages

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
- **Netlify**: Static site deployment
- **Railway**: Full-stack deployment
- **AWS Amplify**: Scalable deployment

## 🧪 Testing

### Manual Testing
1. **Authentication**: Test Google OAuth flow
2. **PPT Generation**: Test various prompts
3. **Email Classification**: Test with different email types
4. **Export Functions**: Verify downloads work
5. **Responsive Design**: Test on different screen sizes

### API Testing
```bash
# Test Gmail API
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://gmail.googleapis.com/gmail/v1/users/me/messages"

# Test OpenAI API
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4o", "messages": [{"role": "user", "content": "Hello"}]}'
```

## 🔧 Troubleshooting

### Common Issues

1. **Google OAuth Error**
   - Verify redirect URI matches exactly
   - Check if Gmail API is enabled
   - Ensure OAuth consent screen is configured

2. **OpenAI API Error** 
   - Verify API key is correct
   - Check account billing status
   - Ensure sufficient credits

3. **Gmail API Error**
   - Verify OAuth scopes include Gmail access
   - Check if user has granted permissions
   - Ensure API quotas are not exceeded

4. **Build Errors**
   - Clear `.next` folder: `rm -rf .next`
   - Reinstall dependencies: `npm install`
   - Check TypeScript errors: `npm run lint`

## 📊 Performance Optimization

- **Code Splitting**: Dynamic imports for better performance
- **Caching**: localStorage for emails and API keys
- **Rate Limiting**: Built-in delays for API calls
- **Error Boundaries**: Graceful error handling
- **Lazy Loading**: Components loaded on demand

## 🔒 Security Considerations

- **API Keys**: Never commit to version control
- **OAuth Scopes**: Minimal required permissions
- **CORS**: Properly configured for production
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Sanitize user inputs

## 📈 Future Enhancements

- [ ] Real-time email notifications
- [ ] Advanced email filtering
- [ ] PPT template library
- [ ] Collaborative editing
- [ ] Mobile app development
- [ ] Analytics dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact: jobs@magicslides.app
- Check the troubleshooting section above

## 🎯 Assignment Compliance

This project fulfills all MagicSlides assignment requirements:

- ✅ **User Authentication**: Google OAuth implemented
- ✅ **OpenAI Key Storage**: localStorage integration
- ✅ **Gmail API**: Last 15 emails fetching
- ✅ **Email Classification**: 6 categories with AI
- ✅ **Frontend**: Next.js + Tailwind CSS
- ✅ **Backend**: Next.js API routes
- ✅ **Design**: Modern, responsive UI
- ✅ **Documentation**: Comprehensive README

---

**Built with ❤️ for MagicSlides.app Intern Assignment**

*Ready for submission and technical review!* 🚀

