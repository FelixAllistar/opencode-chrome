# Agent Guidelines for OpenCode Browser Extension

## Commands
- **Build**: `npm run build` (production build to dist/)
- **Dev**: `npm run dev` (watch mode build)
- **Test**: No tests configured (npm test errors out)
- **Lint/Typecheck**: No linting or type checking scripts defined

## Code Style
- **Imports**: ES6 imports with .js extensions (even for JSX files)
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Components**: Arrow functions with prop destructuring
- **Types**: TypeScript interfaces in PascalCase
- **Styling**: Tailwind CSS utility classes
- **File Extensions**: .jsx for React components, .js for utilities, .ts for types
- **Error Handling**: Basic try/catch in async functions, status-based UI feedback
- **Formatting**: No formatter configured - follow existing patterns

## Architecture

### Core Components
- **`App.jsx`**: Main application with chat management and UI state
- **`ChatSidebar.jsx`**: Sidebar component for chat navigation and management
- **`Message.jsx`**: Individual message rendering with status styling
- **`ChatInput.jsx`**: Input component with status-aware controls
- **`chatStorage.js`**: Chrome storage utilities for persistence

### Key Technologies
- **React 19.2**: Modern React with hooks for state management. new Activity component from react 19.2
- **Vercel AI SDK 5**: Latest AI SDK for streaming and model integration
- **Streamdown**: Unified Markdown and LaTeX rendering (replaces multiple packages)
- **Chrome Storage API**: Persistent storage for chats and settings
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Vite**: Fast build tool and development server

### Multi-Chat Architecture
Chats are stored as objects keyed by chat ID in `chatsData` state, each containing:
- `metadata`: Chat info (id, title, timestamps, message count, last message)
- `messages`: Array of message objects with role, parts (text), status
- `status`: Current chat state ('ready', 'submitted', 'streaming', 'error')

Messages are loaded on-demand when switching chats. Streaming responses update the specific chat's messages in real-time. Persistence uses Chrome local storage with separate keys for metadata and messages.

### Data Flow
1. **User Input** → `ChatInput` → `handleSend` in `App.jsx`
2. **AI Processing** → Direct API calls to OpenCode Zen endpoints via Vercel AI SDK
3. **Real-time Streaming** → Updates specific chat's messages in `chatsData` with live text chunks
4. **Persistence** → Auto-saves to Chrome storage on message changes (metadata + messages)
5. **Chat Management** → CRUD operations via `chatStorage.js` utilities
6. **Rich Rendering** → Streamdown processes Markdown and LaTeX in AI responses

### Project Structure
```
src/
├── components/
│   ├── ChatSidebar.jsx    # Chat list and navigation
│   ├── Message.jsx        # Individual message display (uses Streamdown directly)
│   └── ChatInput.jsx      # Message input with controls
├── hooks/
│   └── useStorage.js      # Chrome storage hook
├── services/
│   └── ai/
│       ├── client.js      # AI SDK integration
│       └── providers.js   # Model provider setup
├── utils/
│   ├── chatStorage.js     # Chat persistence utilities
│   └── constants.js       # App constants
└── App.jsx                # Main application
```