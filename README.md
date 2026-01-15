# Alexus - AI Legal Assistant

A modern, mobile-first AI legal assistant specializing in Philippine Law. Built with Next.js and powered by OpenAI.

![Alexus](https://img.shields.io/badge/Alexus-Legal%20AI-5a66f2)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)

## Features

- **Philippine Law Expertise** - Specialized knowledge of Philippine legal system
- **Mobile-First Design** - Beautiful, responsive UI optimized for mobile devices
- **Real-time Streaming** - Instant responses with streaming text
- **Modern UI** - Glass morphism effects, smooth animations, dark theme
- **PWA Support** - Install as a native app on mobile devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4o-mini
- **Deployment**: Railway

## Getting Started

### Prerequisites

- Node.js 18+
- OpenAI API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/alexus-lawyer.git
   cd alexus-lawyer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Railway

1. Push your code to GitHub

2. Go to [Railway](https://railway.app) and create a new project

3. Connect your GitHub repository

4. Add environment variable:
   - `OPENAI_API_KEY`: Your OpenAI API key

5. Deploy! Railway will automatically build and deploy your app.

## Project Structure

```
alexus-lawyer/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # AI chat endpoint
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main chat page
├── components/
│   ├── ChatInterface.tsx     # Chat messages container
│   ├── Header.tsx            # App header
│   ├── MessageBubble.tsx     # Individual message
│   ├── TypingIndicator.tsx   # Loading animation
│   └── WelcomeScreen.tsx     # Initial screen
├── public/
│   └── manifest.json         # PWA manifest
├── .env.example
├── next.config.js
├── package.json
├── tailwind.config.ts
└── README.md
```

## Legal Disclaimer

Alexus provides general legal information only and does not constitute legal advice. For specific legal matters, please consult a licensed attorney in the Philippines.

## License

MIT License - feel free to use this project for your own purposes.

---

Built with ❤️ for Filipinos seeking legal guidance.
