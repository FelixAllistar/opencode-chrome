# Helium AI Sidebar Extension

A Chrome extension for Helium browser that provides an AI chat sidebar using OpenCode Zen API directly.

## Setup

1. Get your OpenCode Zen API key: Sign up at https://opencode.ai/auth, add billing, generate API key.

2. Build the extension: `npm run build`

3. Load in Helium browser:
   - Open Helium browser
   - Go to extensions page (chrome://extensions/)
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

4. Click the extension icon to open the AI sidebar. Enter your API key and select a model (e.g., Grok Code Fast 1).

## Supported Models

| Model | Model ID | Endpoint | AI SDK Package |
|-------|----------|----------|----------------|
| GPT 5 | gpt-5 | https://opencode.ai/zen/v1/responses | @ai-sdk/openai |
| GPT 5 Codex | gpt-5-codex | https://opencode.ai/zen/v1/responses | @ai-sdk/openai |
| Claude Sonnet 4.5 | claude-sonnet-4-5 | https://opencode.ai/zen/v1/messages | @ai-sdk/anthropic |
| Claude Sonnet 4 | claude-sonnet-4 | https://opencode.ai/zen/v1/messages | @ai-sdk/anthropic |
| Claude Haiku 4.5 | claude-haiku-4-5 | https://opencode.ai/zen/v1/messages | @ai-sdk/anthropic |
| Claude Haiku 3.5 | claude-3-5-haiku | https://opencode.ai/zen/v1/messages | @ai-sdk/anthropic |
| Claude Opus 4.1 | claude-opus-4-1 | https://opencode.ai/zen/v1/messages | @ai-sdk/anthropic |
| Qwen3 Coder 480B | qwen3-coder | https://opencode.ai/zen/v1/chat/completions | @ai-sdk/openai-compatible |
| Grok Code Fast 1 | grok-code | https://opencode.ai/zen/v1/chat/completions | @ai-sdk/openai-compatible |
| Kimi K2 | kimi-k2 | https://opencode.ai/zen/v1/chat/completions | @ai-sdk/openai-compatible |

Note: The model ID in your OpenCode config uses the format `opencode/<model-id>`. For example, for GPT 5 Codex, use `opencode/gpt-5-codex`.

## Features

- Chat interface for AI interactions with real-time streaming
- Integration with Vercel AI SDK 5 for advanced text generation
- Supports multiple models (Grok Code Fast 1, Qwen3 Coder, Claude Sonnet 4.5)
- Renders Markdown and LaTeX in responses
- API key stored securely in browser storage
- Composable architecture for easy feature additions

## Development

- `npm install` - Install dependencies
- `npm run build` - Build for production
- Edit `src/App.jsx` for UI changes

Note: Uses OpenCode Zen endpoints. No SDK or local server required.