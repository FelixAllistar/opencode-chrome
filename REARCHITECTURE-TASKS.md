# OpenSidebar Re-Architecture Tasks

This file tracks the incremental refactor from the current, mostly-solid implementation toward a cleaner, more strongly-typed architecture that matches `AGENTS.md` and modern React/TypeScript practices.

The goal is to **preserve behavior** (sidepanel chat, multi-provider support, tools, media, error handling) while:

- Making the domain model (chats, messages, models, errors) explicit and shared.
- Centralizing provider/model + API-key logic.
- Treating chat persistence as a single source of truth.
- Unifying error handling and message pruning.

---

## Phase 1 – Domain Model & Message Utilities

**Goal:** Define the canonical types and pure helpers so future refactors have a stable target.

- [x] P1.1 Define shared domain types in `src/types/index.ts`
  - `ModelConfig` / `ProviderId`
  - `ChatId`, `ChatStatus`
  - `Message`, `MessagePart` (discriminated union: `text`, `file`, `image`, `reasoning`, `tool-*`, `chain-of-thought`, etc.)
  - `ChatError`
- [x] P1.2 Add `src/utils/messageTransforms.ts`
  - `isVisualMessagePart(part, isVisionModel)`
  - `sanitizeMessagePartsForModel(parts, isVisionModel)`
  - `filterMessagesForAPI(messages)` (moved from `errorHandling.ts`)
  - (later) `convertPartsToChainOfThought(parts)` that returns data-only steps
- [x] P1.3 Update `useStreamingChat` to import and use `sanitizeMessagePartsForModel` / `isVisualMessagePart` from `messageTransforms.ts`
- [ ] P1.4 Update `App.jsx` and error handling to use `filterMessagesForAPI` (and, later, `convertPartsToChainOfThought`) from the shared module

---

## Phase 2 – Models, Providers & API Keys

**Goal:** One source of truth for model capabilities and which key is required.

- [x] P2.1 Add `src/utils/models.ts` (TS module)
  - `getRequiredApiKey(model: ModelConfig, keys: ProviderApiKeys): string | null`
  - `getProviderLabel(model: ModelConfig): string`
  - `isVisionModel(model: ModelConfig): boolean`
  - `supportsTools(model: ModelConfig): boolean`
- [x] P2.2 Refactor `src/utils/constants.js` to be backed by `ModelConfig` (while keeping the JS API)
- [x] P2.3 Replace ad‑hoc key checks:
  - `useStreamingChat` (`requiredApiKey`, `providerApiKeys`, `testConnectivity`)
  - `useConversationLifecycle` (`requiredKey`)
  - `App.jsx` (`hasAnyProviderKey`)
  to all use `getRequiredApiKey` / model helpers
- [x] P2.4 Replace the OpenCode-only connectivity probe with a model-aware strategy (or make connectivity checks optional and provider-scoped)

---

## Phase 3 – Chat Store & Streaming Controller

**Goal:** A single source of truth for chats/messages; `useStreamingChat` becomes a streaming controller, not a duplicate store.

- [x] P3.1 Introduce a `ChatStoreProvider` (e.g. `src/contexts/ChatStore.tsx`) that owns:
  - `chatsData`, `currentChatId`
  - `selectChat`, `createChat`, `deleteChat`
  - `updateMessages(chatId, messages)`, `updateStatus(chatId, status)`
  - persistence via `chatStorage.js`
- [x] P3.2 Refactor `useChatBootstrap` logic into the store and expose a typed `useChatStore` hook
- [x] P3.3 Refactor `useStreamingChat` to:
  - accept `currentChatId` + callbacks (`onMessagesChange`, `onStatusChange`)
  - stop owning its own `messages`/`status` state
  - stream into the store instead of calling `setChatsData` directly
- [ ] P3.4 Simplify `App.jsx` to consume chat state only from the store + streaming hook

---

## Phase 4 – Unified Error Handling

**Goal:** All AI errors flow through a single, typed path and are surfaced consistently.

- [x] P4.1 Define `ChatError` (discriminated union) and helpers in `src/utils/errorHandling.ts`
  - `createChatError(kind, rawError)`
  - `formatChatError(error: ChatError): string`
- [x] P4.2 Update `useStreamingChat` to set `ChatError | null` only
- [x] P4.3 Make the banner + message-level error parts derive from `ChatError`
- [x] P4.4 Ensure `createUnhandledRejectionHandler` reuses the same helpers and shapes

---

## Phase 5 – Tools & Provider Registrations

**Goal:** Remove global mutable state from tools and make tool configuration explicit.

- [x] P5.1 Change Brave/Context7 tools to accept a runtime context instead of module-level setters
  - e.g. `createBraveSearchTool({ getToken: () => braveSearchApiKey })`
- [x] P5.2 Update `src/services/ai/tools/index.ts` to build tools with the current keys:
  - `getTools(enabledToolIds, runtimeContext)`
- [x] P5.3 Refactor `useProviderRegistrations` (or replace it) so provider keys are passed into `getTools` instead of stored in globals

---

## Phase 6 – Theme & Settings Consistency

**Goal:** Align theme/dark-mode + settings persistence with `AGENTS.md`.

- [x] P6.1 Persist dark/light mode alongside theme in `ThemeProvider`
- [x] P6.2 Ensure `InitialSetupScreen` and `SettingsMenu` reflect the same set of keys/settings as described in `AGENTS.md`
- [ ] P6.3 Update `AGENTS.md` if behavior changes (or bring behavior in line with the current doc)

---

## Phase 7 – TypeScript Coverage & Cleanup

**Goal:** Gradually strengthen typing around the core without breaking the extension.

- [x] P7.1 Wire the new domain types into `useStreamingChat`, `useConversationLifecycle`, and `chatStorage`
- [ ] P7.2 Convert selected core files (`useStreamingChat.js`, `useConversationLifecycle.js`) to TS where practical
- [ ] P7.3 Add lightweight JSDoc types in JS files that consume the domain types, to keep them in sync
- [ ] P7.4 Periodically revisit this checklist and close or add items as the architecture stabilizes
