# Agent Guidelines for OpenCode Browser Extension

NEVER run pnpm build or pnpm run dev. the user will be responsible for building. 

## Commands
- **Build**: `pnpm run build` (production build to dist/)
- **Dev**: `pnpm run dev` (watch mode build)
- **Test**: No tests configured (pnpm test errors out)
- **Lint/Typecheck**: No linting or type checking scripts defined

## Code Style
- **Imports**: ES6 imports with .js extensions (even for JSX files)
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Components**: Arrow functions with prop destructuring
- **Types**: TypeScript interfaces in PascalCase
- **Styling**: Tailwind CSS utility classes
- **File Extensions**: .jsx for React components, .js for utilities, .ts for types
- **Error Handling**: Centralized error formatting and filtering via errorHandling.ts utilities
- **Formatting**: No formatter configured - follow existing patterns

## Architecture

### Core Components
- **`App.jsx`**: Main application with chat management, UI state, and advanced message rendering for tool calls and reasoning
- **`AppSidebar.tsx`**: Custom sidebar component for chat navigation and management
- **`chatStorage.js`**: Chrome storage utilities for persistence
- **`errorHandling.ts`**: Centralized error formatting, filtering, and handling utilities
- **`lib/utils.ts`**: Utility functions for className merging with clsx and tailwind-merge

### Key Technologies
- **React 19.2**: Modern React with hooks for state management
- **Vercel AI SDK 5**: Latest AI SDK for streaming responses, tool calling, and multi-step conversations with `readUIMessageStream` for incremental UI updates
- **Vercel AI Elements**: Professional UI components for AI chat interfaces (Branch, Message, PromptInput, Conversation, Response, Tool, Reasoning) with built-in streaming support
- **Streamdown**: Unified Markdown and LaTeX rendering for rich text content
- **Chrome Storage API**: Persistent storage for chats and settings with separate keys for metadata and messages
- **Tailwind CSS**: Utility-first CSS framework with custom theme variables
- **Vite**: Fast build tool and development server for the browser extension

### Theme System
- **Theme Definitions**: 23 themes with comprehensive color schemes for backgrounds, text, borders, syntax highlighting, markdown, and diffs. Each theme is maintained in its own file under `src/utils/themes/` (e.g., `zenburn.js`, `dracula.js`) for better organization and maintainability
- **Main Export**: `src/utils/themes.js` imports all individual theme files and exports them as a `THEMES` object
- **Color Mapping**: `THEME_VARIABLES` in `src/utils/themes.js` maps theme color keys to CSS custom properties used by Tailwind classes (--primary → accent colors for buttons, --card → backgroundElement for cards, --popover → backgroundElement, --muted → backgroundPanel, --input → backgroundElement, etc.)
- **State Management**: `ThemeProvider` in `src/contexts/ThemeProvider.jsx` manages theme state with persistence via `useStorage` hook
- **Dynamic Styling**: CSS variables applied to `document.documentElement` for real-time theme switching
- **Theme Switcher**: Dropdown component in `src/components/settings/ThemeSwitcher.jsx` allows theme selection with current theme highlighted
- **Integration**: `App.jsx` wraps app with `ThemeProvider` and includes `ThemeSwitcher` in header
- **Persistence**: Theme choice saved to Chrome storage and restored on load; supports light/dark modes per theme

### Multi-Chat Architecture
Chats are stored as objects keyed by chat ID in `chatsData` state, each containing:
- `metadata`: Chat info (id, title, timestamps, message count, last message)
- `messages`: Array of message objects with role, parts (text, tool-call, tool-result, reasoning), and status
- `status`: Current chat state ('ready', 'submitted', 'streaming', 'error')

### Message Parts System

Messages use a `parts` array for rich content. Each part has a `type` and content:

- **`text`**: Markdown/LaTeX content rendered via `Response` component
- **`tool-call`**: Tool invocation with `toolName`, `args`, and `toolCallId` for correlation
- **`tool-result`**: Tool execution result with `result`, `error`, and matching `toolCallId`
- **`reasoning`**: AI's internal thinking, displayed in collapsible `Reasoning` component

Parts stream incrementally during generation, enabling real-time UI updates.

Messages are loaded on-demand when switching chats. Streaming responses update the specific chat's messages in real-time with incremental part updates. Persistence uses Chrome local storage with separate keys for metadata and messages.

### Data Flow
1. **User Input** → `PromptInput` → `handleSend` in `App.jsx`
2. **Message Filtering** → `filterMessagesForAPI()` excludes error messages from conversation history sent to API
3. **AI Processing** → Direct API calls to OpenCode Zen endpoints via Vercel AI SDK 5 with tool calling enabled
4. **Real-time Streaming** → `consumeUIMessageStream()` yields incremental `UIMessage` objects with updated parts (text, tool-call, tool-result, reasoning)
5. **UI Updates** → `renderMessageParts()` function handles complex message structures with specialized rendering for each part type
6. **Error Handling** → `createErrorForUI()` formats errors for display, `createUnhandledRejectionHandler()` manages uncaught errors
7. **Tool Execution** → AI invokes tools during generation; results are streamed back and correlated via `toolCallId`
8. **Reasoning Display** → Internal AI reasoning steps are captured in reasoning parts and displayed via collapsible `Reasoning` components
9. **Persistence** → Auto-saves to Chrome storage on message changes (metadata + messages with all part types)
10. **Chat Management** → CRUD operations via `chatStorage.js` utilities with on-demand message loading
11. **Rich Rendering** → Streamdown processes Markdown and LaTeX in AI responses via AI Elements components, with specialized rendering for tool calls/results and reasoning

### Advanced Message Rendering
The `renderMessageParts` function in `App.jsx` handles complex message structures with multiple content types:
- **Text Content**: Standard markdown and LaTeX rendering via `Response` component
- **Tool Calls**: Interactive display showing function name, arguments, and execution state
- **Tool Results**: Combined input/output display with error handling for failed tool executions
- **Reasoning Steps**: Collapsible sections showing AI's internal thought process
- **Error Display**: Red error cards for failed operations using `createErrorForUI()` formatting
- **Streaming States**: Real-time updates during generation with appropriate loading indicators
- **Graceful Degradation**: Debug information for unknown part types

### Error Handling Architecture

The error handling system is designed to provide robust error management while maintaining clean API communication:

- **`formatAIError()`**: Formats AI SDK errors into user-friendly messages based on error types (APICallError, NoOutputGeneratedError, etc.)
- **`createErrorForUI()`**: Creates standardized error objects for UI display with consistent structure
- **`filterMessagesForAPI()`**: Filters out error messages from conversation history sent to the API to prevent 422 rejections
- **`createUnhandledRejectionHandler()`**: Manages uncaught promise rejections and displays them in the UI

**Error Flow**:
1. **Streaming Errors** → Caught by `onError` callback → Yielded as error parts → Thrown in stream loop → Formatted and displayed
2. **Setup Errors** → Caught in outer try/catch → Formatted and displayed
3. **Unhandled Errors** → Caught by global handler → Added to last AI message
4. **API Filtering** → Error messages excluded from conversation history sent to models

### Project Structure (High-Level Overview)
```
src/
├── components/
│   ├── ai-elements/       # Custom AI Elements UI components (Branch, Message, PromptInput, Response, Tool, Reasoning, etc.)
│   ├── settings/          # Settings components (ModelSelector, ThemeSwitcher)
│   ├── ui/                # shadcn UI components
│   └── app-sidebar.tsx    # Custom sidebar component for chat navigation and management
├── hooks/
│   ├── use-mobile.ts      # Mobile detection hook
│   └── useStorage.js      # Chrome storage hook
├── lib/
│   └── utils.ts           # Utility functions for className merging
├── services/
│   └── ai/
│       ├── client.js      # AI SDK integration
│       ├── providers.js   # Model provider setup
│       └── tools.js       # AI tools configuration
├── types/
│   └── index.ts           # TypeScript type definitions
├── utils/
│   ├── chatStorage.js     # Chat persistence utilities
│   ├── constants.js       # App constants
│   └── errorHandling.ts   # Centralized error formatting and filtering utilities
├── App.jsx                # Main application
├── background.js          # Extension background service worker
├── index.css              # Global styles
└── main.jsx               # Application entry point
```