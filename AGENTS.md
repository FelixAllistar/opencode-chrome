# Agent Guidelines for OpenCode Browser Extension

NEVER run `pnpm run build` or `pnpm run dev`; the user is responsible for producing artifacts. Respect that even though Vite is configured, builds/watch mode are off-limits during your work.

## Commands
- **Build**: `pnpm run build` (uses `pnpm run typecheck && vite build` so the tools registry is validated before bundling)
- **Dev**: `pnpm run dev` (runs `vite build --watch`; we do not execute this)
- **Test**: no test script exists—`pnpm test` fails, so do not add or rely on tests
- **Typecheck**: `pnpm run typecheck` (runs `tsc --noEmit` scoped to `src/services/ai/tools/**/*.ts` so missing tool imports fail fast)
- **Format**: no formatter is wired; follow the existing hand-formatted style

## Code Style
- Prefer ES module imports with explicit extensions (`.js`, `.jsx`, `.ts`, `.tsx`) and use the `@/` alias for anything under `src/`.
- React components should be arrow functions that destructure props and include `"use client";` when they live in `src/components/**` or otherwise interact with the browser.
- Keep styling in Tailwind utilities; use the shared `cn` helper (`src/lib/utils.ts` or the legacy `lib/utils.js`) whenever you need to compose classes.
- TypeScript definitions live in `src/types/index.ts`—new types should follow PascalCase for interfaces/aliases and camelCase for functions/variables.
- Prefer `useStorage`/`useStreamingChat` for cross-cutting state instead of ad‑hoc global variables; those hooks already centralize persistence and streaming behavior.
- Keep comments tight—explain non-obvious decisions but avoid noise such as “assign value to variable.”

## Architecture

### Entry points
- `src/sidepanel.html` loads the Vite bundle and pulls in KaTeX CSS for math support.
- `src/main.jsx` just renders `<App />` and imports `index.css`.
- `src/background.js` configures the Chrome side panel (`setPanelBehavior`), wires the selection-only context menu, and routes highlighted text to the panel so the service worker affects the sidebar even when the UI is not open.

### Context menu integration
- The manifest now needs `contextMenus` in addition to `sidePanel/storage/activeTab` so Chrome allows adding “OpenSidebar - Open in New Chat” and “OpenSidebar - Attach As Context” entries whenever the user selects text.
- In `src/background.js`, the two menu handlers both call `chrome.sidePanel.open({ tabId })` synchronously to keep the gesture alive, push a typed payload (`open` vs `attach`) into `pendingSelections`, and immediately send a runtime message whose `type` matches the intent (`openSidebar_contextSelection` or `openSidebar_contextAttachment`).
- A lightweight `pendingSelections` queue now holds the menu intent plus the trimmed highlight so the panel can drain both kinds of payloads with `chrome.runtime.sendMessage({ type: 'openSidebar_getPendingSelections' })`, ensuring the UI receives the selection even if it loads after the menu click and knows whether it should auto-submit or attach the snippet to the current chat.

### App shell & state
- `src/App.jsx` is the control center: it loads chats/metadata via `chatStorage.js`, keeps `chatsData`/`currentChatId`/`chat` state, and wires `useStorage` for the OpenCode Zen API key (`apiKey`), the Google Gemini API key (`googleApiKey`), `selectedModelId`, and the current theme.
- Helper hooks now encapsulate most of App's side effects. `src/hooks/useApiKeyInputs.js` keeps the editable API-key drafts in sync with storage, `src/hooks/useContextSelectionBridge.js` drains pending chrome selections, `src/hooks/useUnhandledRejectionHandler.js` attaches the unhandled rejection guard, `ChatStoreProvider`/`useChatStore` now replace the old `useChatBootstrap` logic for loading `chatsData`/`currentChatId` and managing focus, `src/hooks/useConversationLifecycle.js` owns the chat interaction logic (attached context snippets, `handleSend`, and prompting the selection bridge), and tool registration for Brave/Context7 now happens via `useStreamingChat` → `getTools` so the previous `useProviderRegistrations` hook is no longer needed.
- The same file now also listens for runtime messages from the background (and pulls any queued selections on load) so context-menu highlights auto-create a chat, write into `PromptInput`, and submit just as if the user typed them directly; it also surfaces attached-context chips when the new “Attach As Context” entry runs, merging those snippets into the next submission.
- The header pairs a `SidebarTrigger`, a “new chat” button (uses `AppSidebar`/`Sidebar` from `components/ui`), and a `SettingsMenu` (in `src/components/settings/SettingsMenu.jsx`) that surfaces the `ThemeSwitcher`, a collapsible `ApiKeysSection` dropdown (see `src/components/settings/ApiKeysSection.jsx`) for API key inputs (now rendered without the old “optional” callouts), the tool toggles, and a “Clear All Chats” action. The menu now uses a shadcn `<Form />` stack backed by `react-hook-form`/`zod`; hitting Enter submits all visible key inputs together, the focused field flashes briefly when the save completes, and the hidden submit button ensures natural keyboard behavior while the tool switches persist through `enabledTools`.
- Conversations render with `Branch`, `BranchMessages`, `Message`, and `MessageContent` (all from `src/components/ai-elements`). `renderMessageParts` (inside `App.jsx`) is responsible for chain-of-thought, tool-call, text, and image rendering.
- A persistent footer holds `PromptInput` plus attachments, a model selector built from `MODELS` (`src/utils/constants.js` – each entry now ships an `isVision` flag so we can skip image parts for non-vision models, and `big-pickle`/`grok-code` are the current non-vision entries), and `PromptInputSubmit` (which uses `chat.status` to show “stop”/“retry” states). `MODELS` now also includes the Google Gemini entries (Gemini 1.5 Flash, Gemini 1.5 Pro, Gemini 2.5 Pro) flagged as `type: 'google'`.
- `chat` (returned by `useStreamingChat`) exposes `messages`, `status`, `error`, and helpers like `sendMessage`, `stop`, `reload`, `clearError`, and `resetChatState`.
- Theme preference uses `useStorage('theme')` plus `ThemeProvider` (see below) and writes CSS custom properties on `document.documentElement` for real‑time switching.
- `clearSettings` wipes both `chrome.storage.sync` and `.local` and resets `apiKey`, `googleApiKey`, `selectedModel`, `theme`, and `chatsData`.

### Theme system
- Each theme lives in `src/utils/themes/{name}.js` (zenburn, vesper, dracula, night-owl, tokyoNight, synthwave84, solarized, rosePine, palenight, opencode, one-dark, nord, cobalt2, catppuccin, ayu, monokai, gruvbox, github, kanagawa, everforest, mellow, aura, material). `src/utils/themes.js` imports them, exports `THEMES`/`THEME_VARIABLES`, and sets `DEFAULT_THEME = 'zenburn'`.
- `ThemeProvider.jsx` (in `src/contexts`) reads the saved theme/dark mode via `useStorage`, writes all mapped CSS custom properties to `:root`, and toggles the `light`/`dark` classes so Tailwind’s referent tokens stay in sync.
- `ThemeSwitcher.jsx` (under `src/components/settings`) enumerates `THEMES` inside a `DropdownMenu`, highlights the active theme, and calls `changeTheme`.
- The App’s header settings menu renders `ThemeSwitcher` plus “Clear All Chats,” so these theme controls stay in one place.

### Multi-chat persistence
- `src/utils/chatStorage.js` exposes `getChatsList`, `createChat`, `loadChatMessages`, `saveChatMessages`, `deleteChat`, `getCurrentChatId`, and `setCurrentChatId`. Metadata and messages are stored separately using `chrome.storage.local`.
- Chat metadata includes `id`, `title`, `createdAt`, `updatedAt`, `messageCount`, and `lastMessage`. Titles default to the first user message (capped around 30 characters) unless manually overridden.
- `saveChatMessages` updates the metadata list when `updateMetadata` is `true`, so the sidebar can show the latest timestamp/title without extra requests.
- `createChat` uses `generateId()` (from the `ai` package) and initializes an empty message list; `loadChatMessages` and `deleteChat` touch the same `CHAT_PREFIX + chatId` key.
- App loading logic: on mount, read the chat list + `opencode_current_chat` from storage, hydrate `chatsData`, reset any lingering `streaming`/`submitted` statuses to `ready`, and set `currentChatId`. Switching chats loads messages on demand (if they haven’t been cached yet) and focuses the input.

### Hooks & AI services
- `src/hooks/useStreamingChat.js` is the streaming hook at the heart of the experience. It uses `streamText` (from the `ai` package) with `convertToModelMessages`, `getProvider(selectedModel.id, selectedModel.type, { openCode: apiKey, google: googleApiKey })`, and tools from `src/services/ai/tools.js`. It maintains `messages`, `status`, `error`, and an `AbortController`.
  * User messages are assembled from the submitted text and attachments, with attachments turned into `{ type: 'file', mediaType, url }` parts.
  * The assistant answer starts as an empty `parts: [{ type: 'text', text: '' }]` entry with `status: 'submitted'`, transitions to `streaming`, then is finalized to `ready`.
  * The streaming loop handles `text-delta`, `tool-call`, `tool-result`, and `reasoning` chunks, building incremental `parts`, pushing chain-of-thought steps, and updating `chat.messages`. `saveChatMessages` persists the final array, and the returned chats list updates metadata in App state.
  * The hook now feeds the shared `tools` set into `convertToModelMessages` and `streamText`, and configures `streamText` with `maxToolRoundtrips` plus `stopWhen: stepCountIs(10)` so multi-step tool loops finish cleanly instead of ending as soon as the first tool result shows up.
  * Helpers such as `regenerateResponse`, `stop`, `clearError`, and `resetChatState` let the UI retry/stop streaming or drop to a clean state.
  * Missing-provider-key handling now runs before the assistant placeholder is inserted so the user text stays in the log; we expose a shared `MissingApiKey` error helper (and keep `reload` in sync with the latest `regenerateResponse`) so Retry simply replays the guard and keeps the banner visible without inserting the error text into the message list. This makes the error UI the only place the issue is surfaced until a valid key is provided, after which the retry path re-enters the normal streaming flow without duplicating the user message.
- When `selectedModel.isVision === false`, the hook filters every `file/image` part out of the context before calling `convertToModelMessages`, so rendered images stay visible to humans but never reach models that can’t handle vision. The hook now also sanitizes every message part before `convertToModelMessages` is invoked: reasoning segments and tool metadata become plain `text` entries, tool inputs/results are summarized in truncated text descriptions, and vision-only data is dropped for non-vision models. This keeps Grok Code Fast and any other stricter `openai-compatible` models from rejecting the payload even though the UI still retains the richer tool chunks for rendering.
- `src/hooks/useStorage.js` wraps `chrome.storage.sync` with `useState`/`useEffect` so settings are read lazily and expose a loading flag, and its setter now resolves updater callbacks before persisting so toggles using functional updates land in storage correctly.
- `src/hooks/use-mobile.ts` offers `useIsMobile`, which `src/components/ui/sidebar.tsx` consumes to switch between drawer and rail/sidebar layouts.
- `src/services/ai/providers.js` now routes `type: 'google'` models through `createGoogleGenerativeAI` (using the Gemini API key) while continuing to serve the OpenCode Zen-compatible provider for the other model types; `services/ai/client.js` re-exports `getProvider` and `getTools` for future use.
- Tools now live under `src/services/ai/tools/`—`types.ts` defines `ToolDefinition` metadata (`id`, `label`, `description`, `defaultEnabled`, `tool`) and each helper (`webFetchTool.ts`, `analyzeCodeTool.ts`, `getDocumentationTool.ts`) exports a concrete `tool({ … })` instance plus its metadata. `index.ts` imports those definitions, exposes `TOOL_DEFINITIONS`, `DEFAULT_ENABLED_TOOL_IDS`, `tools`, `getTools(enabledToolIds)`, and `getToolDefinition()`, and `tsconfig.json` scopes `tsc --noEmit` to that directory so removing an import fails at compile time. `App.jsx` persists `enabledTools` via `useStorage('enabledTools', DEFAULT_ENABLED_TOOL_IDS)`, passes that list into `useStreamingChat`, and the hook calls `getTools(enabledToolIds)` before `streamText` so the SDK only sees whichever tools are enabled. `SettingsMenu.jsx` renders a `Switch` per tool definition (using the shared `Switch` component) and writes toggles back to `enabledTools`, giving the user a persistent on/off control for each tool.

### Message parts & rendering
- Messages are arrays of `parts` with types like `text`, `file`, `image`, `tool-call`, `tool-result`, and `reasoning`.
- `convertPartsToChainOfThought` inside `App.jsx` converts tool progress + reasoning into a synthetic `chain-of-thought` part so the UI can collapse/expand the steps.
- `renderMessageParts` handles:
  * Chain-of-thought sections (`ChainOfThought`, `ChainOfThoughtStep`, `ChainOfThoughtSearchResults`, `ChainOfThoughtImage`).
  * Tool errors (`tool-*` parts where `state === 'output-error'`) rendered as destructive cards.
  * Text (`part.type === 'text'`): wraps `Response` (Streamdown) and also scans the text for image URLs via `IMAGE_URL_REGEX`, showing each inline link as an `<img>` block (restoring the previous “link preview” behavior, including GIFs).
  * File parts whose `mediaType` starts with `image/` (renders the `part.url` as an `<img>`).
  * Binary image parts (type `image`) converted to `data:` URLs before rendering.
  * Unknown part types fallback to a JSON dump for debugging, so you can inspect new part shapes without crashing the loop.
- Streaming states render a “Generating…” pulse whenever a message’s status is `streaming`.

### Data flow summary
1. The user types or drops files in `PromptInput`. Attachments become `file` parts.
2. `handleSend` (in `App.jsx`) ensures there is a current chat, that the API key/model are set, and that the hook is in `ready` state before calling `chat.sendMessage`.
3. `useStreamingChat` adds a placeholder assistant message, marks the overall chat as `streaming`, and pumps `streamText.fullStream`.
4. Chunks update the current assistant message’s `parts` array; the hook saves incremental messages to `chatsData`, calls `saveChatMessages()`, and updates metadata via the returned chats list.
5. When streaming ends, the message status flips to `ready`, `currentChatStatus` becomes `ready`, and the prompt input allows new submissions. If an error occurs, `status` becomes `error`, and `chat.error` drives the retry/dismiss/reset UI row.
6. Attachments and tool outputs stay in the message history; switching chats loads their saved messages from `chrome.storage`.

### Error handling
- `src/utils/errorHandling.ts` contains:
  * `formatAIError()`—human-friendly labels for `AI_APICallError`, `AI_NoOutputGeneratedError`, etc.
  * `createErrorForUI()`—wraps errors into UI-friendly objects (used by `createUnhandledRejectionHandler()`).
  * `filterMessagesForAPI()`—helper to drop error-laden messages from future requests (not wired into `useStreamingChat` yet but handy for future filtering work).
  * `createUnhandledRejectionHandler()`—registered in `App.jsx` to catch stray `AI_*` rejections, attach a `tool-error` part to the last assistant message, and prevent the raw error from bubbling to the console twice.
- The UI displays errors in a banner with Retry/Dismiss/Reset buttons wired to `chat.reload()`, `chat.clearError()`, and `chat.resetChatState()`.

## Project structure (high-level)
```
AGENTS.md
package.json
pnpm-lock.yaml
manifest.json
README.md
dist/                 # build output (don't regenerate it here)
lib/
├── utils.js          # shared `cn` helper for non-ESM contexts
node_modules/         # dependencies
scripts/              # auxiliary scripts (not usually edited)
src/
├── App.jsx
├── background.js
├── main.jsx
├── sidepanel.html
├── index.css
├── components/
│   ├── ai-elements/   # custom AI Elements (Response, PromptInput, Conversation, ChainOfThought, etc.)
│   ├── app-sidebar.tsx
│   ├── settings/       # ThemeSwitcher.jsx, ModelSelector.jsx
│   └── ui/             # shadcn-based building blocks (button, sidebar, tooltip, etc.)
├── contexts/
│   └── ThemeProvider.jsx
├── hooks/
│   ├── useStreamingChat.js
│   ├── useStorage.js
│   └── use-mobile.ts
├── services/
│   └── ai/
│       ├── client.js
│       ├── providers.js
│       └── tools/
│           ├── analyzeCodeTool.ts
│           ├── getDocumentationTool.ts
│           ├── index.ts
│           ├── types.ts
│           └── webFetchTool.ts
├── utils/
│   ├── chatStorage.js
│   ├── constants.js
│   ├── errorHandling.ts
│   └── themes/
│       ├── (23 theme definition files, e.g., zenburn.js, dracula.js, opencode.js, etc.)
│       └── themes.js
├── lib/
│   └── utils.ts        # Tailwind `cn` helper for the React app
├── types/
│   └── index.ts
```

Whenever something in this stack changes (new tools, new storage keys, etc.), update this file so it stays accurate. Double-check sections you touch to keep the guidance aligned with the codebase.
