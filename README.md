# OpenSidebar

A Chrome extension that adds an AI chat sidebar to your browser, built with OpenCode's Zen API.

## What it is

OpenSidebar is a browser extension that gives you a chat interface in a sidebar. You can have multiple conversations, switch between different AI models, and your chats are saved locally. Nothing fancy—just a clean, functional AI chat that stays out of your way until you need it.

## Features

- **Sidebar chat** that opens from a toolbar button
- **Multiple conversations** with automatic saving
- **Real-time streaming** responses
- **Different AI models** (GPT, Claude, Grok, Qwen, etc.)
- **Markdown and LaTeX rendering** in responses
- **Dark/light themes** with 20+ code themes
- **Local storage**—your chats stay on your device

## Setup

1. Get an API key from [OpenCode.ai](https://opencode.ai/auth) (you'll need to add billing)

2. Build the extension:
   ```bash
   pnpm install
   pnpm run build
   ```

3. Load it in Chrome/Edge:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

4. Click the extension icon, enter your API key, and start chatting

## Models

These are the available models through OpenCode:

- **GPT models** (`gpt-5`, `gpt-5-codex`) - Good for general purpose and coding
- **Claude models** (`claude-sonnet-4-5`, `claude-opus-4-1`) - Balanced performance and reasoning
- **Code models** (`qwen3-coder`, `grok-code`) - Specialized for programming
- **OpenCode models** (`big-pickle`) - Advanced code generation

Pick whichever works best for your needs. You can switch between models per conversation.

## How to use

- Click the extension icon to open the sidebar
- Type a message and hit Enter to chat
- Use the sidebar to switch between conversations
- New chats are created automatically
- Your conversations are saved locally

## Development

```bash
# Install deps
pnpm install

# Watch for changes while developing
pnpm run dev

# Build for production
pnpm run build
```

Built with React, Vercel AI SDK, and Tailwind CSS.

## Privacy

- API keys stored in browser's encrypted storage
- Chat history saved locally only
- No analytics or tracking

## License

MIT