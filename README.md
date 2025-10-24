# Helium AI Sidebar Extension

A powerful Chrome extension for Helium browser that provides an AI chat sidebar with persistent conversations, real-time streaming, and multi-threaded chat management using OpenCode Zen API.

## ✨ Key Features

- **📱 Multi-Threaded Chat**: Create and manage multiple conversation threads with persistent chat history
- **⚡ Real-Time Streaming**: Experience live AI responses with visual status indicators (submitted, streaming, ready)
- **💾 Persistent Storage**: All conversations automatically saved using Chrome storage API
- **🎨 Modern UI**: Clean sidebar interface with chat management, auto-generated titles, and responsive design
- **🔄 Model Switching**: Support for multiple AI models (GPT, Claude, Grok, Qwen, etc.)
- **📝 Rich Rendering**: Markdown and LaTeX support in AI responses
- **🔒 Secure Storage**: API keys stored securely in browser storage
- **🚀 Vercel AI SDK 5**: Built with the latest AI SDK for robust text generation

## 🚀 Quick Setup

1. **Get API Key**: Sign up at [https://opencode.ai/auth](https://opencode.ai/auth), add billing, and generate an API key

2. **Build Extension**:
   ```bash
   npm install
   npm run build
   ```

3. **Load in Browser**:
   - Open Helium browser
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

4. **Start Chatting**: Click the extension icon, enter your API key, select a model, and start conversing!

## 🤖 Supported Models

| Model | Model ID | Provider | Best For |
|-------|----------|----------|----------|
| GPT 5 | `gpt-5` | OpenAI | General purpose, high quality |
| GPT 5 Codex | `gpt-5-codex` | OpenAI | Code generation, technical tasks |
| Claude Sonnet 4.5 | `claude-sonnet-4-5` | Anthropic | Balanced performance, reasoning |
| Claude Sonnet 4 | `claude-sonnet-4` | Anthropic | Fast responses, good quality |
| Claude Haiku 4.5 | `claude-haiku-4-5` | Anthropic | Speed-optimized, cost-effective |
| Claude Haiku 3.5 | `claude-3-5-haiku` | Anthropic | Fast, lightweight tasks |
| Claude Opus 4.1 | `claude-opus-4-1` | Anthropic | Maximum quality, complex tasks |
| Qwen3 Coder 480B | `qwen3-coder` | Alibaba | Code-focused, programming tasks |
| Grok Code Fast 1 | `grok-code` | xAI | Code generation, technical assistance |
| Kimi K2 | `kimi-k2` | Moonshot | General purpose, multilingual |

**Note**: Model IDs in OpenCode use the format `opencode/<model-id>` (e.g., `opencode/gpt-5-codex`)

## 🎯 How to Use

### Starting Conversations
- **Automatic**: Just start typing and sending messages - a new chat thread is created automatically
- **Manual**: Click "New Chat" to explicitly create a fresh conversation

### Managing Chats
- **Switch**: Click any chat in the sidebar to switch conversations
- **Delete**: Hover over a chat and click the × button to delete (with confirmation)
- **Titles**: Chat titles are auto-generated from your first message
- **History**: All conversations persist across browser sessions

### Chat Interface
- **Status Indicators**: Visual feedback shows when messages are being submitted, streaming, or complete
- **Stop Generation**: Cancel AI responses mid-streaming with the Stop button
- **Model Switching**: Change AI models per chat or globally
- **Rich Content**: AI responses support Markdown formatting and LaTeX equations

## 🏗️ Architecture

### Core Components
- **`App.jsx`**: Main application with chat management and UI state
- **`ChatSidebar.jsx`**: Sidebar component for chat navigation and management
- **`Message.jsx`**: Individual message rendering with status styling
- **`ChatInput.jsx`**: Input component with status-aware controls
- **`chatStorage.js`**: Chrome storage utilities for persistence

### Key Technologies
- **React 19**: Modern React with hooks for state management
- **Vercel AI SDK 5**: Latest AI SDK for streaming and model integration
- **Chrome Storage API**: Persistent storage for chats and settings
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Vite**: Fast build tool and development server

### Data Flow
1. **User Input** → `ChatInput` → `handleSend` in `App.jsx`
2. **AI Processing** → Direct API calls to OpenCode Zen endpoints
3. **Real-time Streaming** → Updates UI with live text chunks
4. **Persistence** → Auto-saves to Chrome storage on message changes
5. **Chat Management** → CRUD operations via `chatStorage.js` utilities

## 🔧 Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Helium browser (or Chrome for development)

### Development Workflow
```bash
# Install dependencies
npm install

# Start development server (if needed)
npm run dev

# Build for production
npm run build

# Load extension in browser
# - Go to chrome://extensions/
# - Enable Developer mode
# - Load unpacked from dist/
```

### Project Structure
```
src/
├── components/
│   ├── ChatSidebar.jsx    # Chat list and navigation
│   ├── Message.jsx        # Individual message display
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

### Adding New Features
- **New Models**: Add to `providers.js` and update the models list
- **UI Components**: Follow the existing component patterns
- **Storage**: Use `chatStorage.js` for persistence needs
- **AI Features**: Leverage Vercel AI SDK 5 capabilities

## 🔒 Security & Privacy

- **API Keys**: Stored securely in Chrome's encrypted storage
- **No Data Transmission**: All AI processing happens server-side
- **Local Storage**: Chat history stored locally on your device
- **No Telemetry**: No usage data collected or transmitted

## 🐛 Troubleshooting

### Common Issues
- **Extension not loading**: Ensure `dist` folder is selected in chrome://extensions/
- **API errors**: Verify your OpenCode API key and billing status
- **Streaming not working**: Check network connection and model availability
- **Chats not saving**: Ensure Chrome storage permissions are enabled

### Debug Mode
- Open browser DevTools on the extension popup
- Check Console for error messages
- Verify API responses in Network tab

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Open an issue on GitHub
- Visit [OpenCode.ai](https://opencode.ai) for API documentation

---

**Built with ❤️ using React, Vercel AI SDK, and modern web technologies**