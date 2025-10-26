# Clay Pit Chat Frontend

A modern, responsive chat interface built with Next.js, TypeScript, and Tailwind CSS for the Clay Pit restaurant AI customer service system.

## Features

- 🤖 **AI Chat Interface**: Real-time messaging with the backend AI service
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- 💬 **Session Management**: Create, manage, and switch between conversation sessions
- 🎨 **Modern UI**: Clean, intuitive interface with smooth animations
- 🔄 **Real-time Updates**: Live typing indicators and message status
- 📊 **Dashboard**: Interactive sidebar with session history and customer management

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Framer Motion** - Smooth animations
- **React Hot Toast** - Toast notifications
- **Axios** - HTTP client for API calls

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:8000`

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variables:**
   Create a `.env.local` file in the frontend directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── chat/             # Chat-related components
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── ChatMessages.tsx
│   │   │   └── MessageBubble.tsx
│   │   ├── sidebar/          # Sidebar components
│   │   │   └── Sidebar.tsx
│   │   ├── modals/           # Modal components
│   │   │   └── NewSessionModal.tsx
│   │   └── ui/               # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── Card.tsx
│   └── lib/                  # Utilities and API client
│       └── api.ts            # Backend API integration
├── public/                   # Static assets
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## API Integration

The frontend connects to the backend API with the following endpoints:

### Sessions
- `POST /api/v1/sessions/` - Create new session
- `GET /api/v1/sessions/customer/{customer_id}` - List customer sessions
- `GET /api/v1/sessions/{session_id}` - Get session details
- `DELETE /api/v1/sessions/{session_id}` - Delete session

### Messages
- `POST /api/v1/messages/session/{session_id}` - Send message
- `GET /api/v1/messages/session/{session_id}/conversation` - Get conversation
- `GET /api/v1/messages/session/{session_id}/logs` - Get session logs

## Key Components

### ChatInterface
Main chat component that handles:
- Message sending and receiving
- Conversation history loading
- Typing indicators
- Error handling

### Sidebar
Session management sidebar with:
- Session list and selection
- New session creation
- Customer information display
- Session history

### MessageBubble
Individual message display with:
- User/assistant message styling
- Timestamp display
- Typing animation
- Responsive design

## Styling

The project uses Tailwind CSS with a custom design system:

- **Primary Colors**: Blue-based palette for main actions
- **Secondary Colors**: Gray-based palette for neutral elements
- **Animations**: Smooth transitions and micro-interactions
- **Responsive**: Mobile-first design approach

## Development

### Code Style
- TypeScript for type safety
- Functional components with hooks
- Custom hooks for reusable logic
- Component composition over inheritance

### Performance
- Lazy loading for better performance
- Optimized bundle size
- Efficient re-renders with React.memo
- Image optimization with Next.js

## Deployment

The application can be deployed to any platform that supports Next.js:

- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- **Docker containers**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Clay Pit AI Customer Service system.
