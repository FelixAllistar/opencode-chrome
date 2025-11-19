# Adding a New AI Provider

This project routes every supported model through `src/services/ai/providers.js` so the streaming hook can call `streamText` with the right backend. The hook (`useStreamingChat`) only knows about `selectedModel.type`, not the nitty gritty of the SDK. Adding a provider means wiring together:

1. the new SDK entry point,
2. the API key the provider requires,
3. a new `type` value on one or more models,
4. and the UI/storage flow that surfaces the key so it persists with `chrome.storage`.

Follow these steps:

## 1. Extend the API key surface

- `useStorage` reads `chrome.storage.sync`, so add a new call site in `src/App.jsx` (similar to `apiKey`/`googleApiKey`) so the key has a persistent `useStorage('yourNewApiKey')` hook.
- Remember that `src/App.jsx` now keeps editable API-key drafts in sync via `src/hooks/useApiKeyInputs.js`, so when you add a new key you should pass it through that helper (and `handleSetupInputChange`) before wiring it into `SettingsMenu`.
- Update the behavior in `ApiKeysSection.jsx`/`SettingsMenu.jsx`:
  - Add the new key field to the Zod schema that backs the settings form.
  - Render another `<FormField>` in `ApiKeysSection` so the user can type/paste the key.
  - Pass the new key through `handleSaveKeys` in `App.jsx`, and store it via the new `setYourNewApiKey` setter.
  - Clear/reset flows (e.g., `handleClear`, `form.reset()`) must account for the extra field so the UI stays consistent.
- Whenever you expose a new key, keep the UX around “press Enter to save” / flash brief indicator for the focused field (see `lastSavedField` logic) so the experience matches the existing fields.

## 2. Normalize the key inside `providers.js`

- `normalizeApiKeys` already returns `{ openCode, google }`. Add your new key there (e.g., `{ newProvider: apiKeys.newProvider ?? '' }`), and add it to whatever alias you expect users to pass (`apiKeys.newProvider` or `apiKeys.apiKeyForNewProvider`).
- `getProvider(modelId, type, apiKeys)` currently switches only on `'google'`. Add a new branch that:
  - Imports the SDK factory (e.g., `import { createNewProvider } from '@ai-sdk/new-provider';`).
  - Validates the new key (throw with a helpful message if it is missing).
  - Calls the factory with that key (and any other config) and returns the resulting provider function.
- Keep the default branch for the OpenCode-compatible endpoint so existing models do not regress.

## 3. Point models at the new provider

- Models live in `src/utils/constants.js`. Each entry includes `type`, `id`, `name`, and `isVision`.
- Set `type` to your provider’s keyword (the same one `getProvider` looks for). This is how `useStreamingChat` decides which key to require and which API to call.
- If your provider only supports text, set `isVision: false` so the stream sanitizes images before hitting the SDK. If it is multimodal, leave or set `isVision: true`.
- Add any new model IDs (`id`/`name`) that the provider exposes so they appear in the model selector.

## 4. Make sure the hook uses the right key

- `useStreamingChat` already derives both the required key (`requiredApiKey`) and the provider config object (`providerApiKeys`). When adding fields:
  - Extend `requiredApiKey` so it checks `selectedModel.type` against your new provider key name.
  - Include the new key in `providerApiKeys` so `getProvider` can see it.
- Because `getProvider` is called in several places (e.g., when streaming or regenerating), updating the `type`/`providerApiKeys` once covers the entire hook.

## 5. Keep the exports consistent

- `src/services/ai/client.js` simply re‑exports `getProvider`/`getTools`. There is no change needed here unless downstream consumers prefer grabbing the provider from `client.js` instead of importing `providers.js` directly.

## 6. Clean up and document

- Update any README/AGENTS guidance if your provider adds new settings or dependencies.
- If the provider requires additional runtime config (e.g., `baseURL`, extra headers), document that in this doc so future contributors remember to wire it up before adding the model entry.

With those pieces wired together, selecting your new model will cause `useStreamingChat` to gather the correct key, call `getProvider`, and stream through the new SDK just like the OpenCode or Gemini entries. Make sure to test the key/save flows manually since `pnpm run dev/build` is off limits.
