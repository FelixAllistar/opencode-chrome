### Adding an AI Tool

1. **Define the tool module**
   - Under `src/services/ai/tools/` create `myTool.ts`.
   - Export a `tool` instance from `ai` with its `description`, `inputSchema` (Zod), and `execute`.
   - Export a `ToolDefinition` object (`id`, `label`, `description`, `defaultEnabled`, `tool: yourToolInstance`).
2. **Register it**
   - Import the new definition in `src/services/ai/tools/index.ts`.
   - Add it to `TOOL_DEFINITIONS`; `DEFAULT_ENABLED_TOOL_IDS`/`getTools` pick it up automatically.
   - Because `tsc --noEmit` is scoped to `src/services/ai/tools/**/*.ts`, the compiler will fail if you forget to import it.
3. **Persist enablement**
   - No additional wiring is needed for storage; `App.jsx` already reads `enabledToolIds` from `useStorage('enabledTools', DEFAULT_ENABLED_TOOL_IDS)` and feeds them into `useOpenCodeChat`.
   - If you want the tool disabled by default, set `defaultEnabled: false`; users can flip it in `SettingsMenu.jsx`.
4. **Expose in Settings**
   - The settings menu enumerates `TOOL_DEFINITIONS` and renders a `Switch` for each entry (`SettingsMenu.jsx`), so new tools appear automatically without extra changes.
5. **Persist any required API keys**
   - If the tool needs an external token, add a `useStorage` hook in `App.jsx` (for example `useStorage('braveSearchApiKey', '')`) so the key survives reloads.
   - Surface a new input in the settings menu or onboarding screen and extend the `onSaveKeys` flow (and its callers) to include the additional setter.
   - Expose a helper (like `setBraveSearchSubscriptionToken`) that stores the key in memory for the tool to read or pass the stored value down to the tool when calling `streamText`.
6. **Validate**
   - Run `pnpm run typecheck` (or `pnpm run build`, which runs it first). Changing `TOOL_DEFINITIONS` without an import now errors before the bundle.

That’s it—tools register once and the hook/config/UI honor the enabled set. Remember to bump `defaultEnabled` or add docs if the tool needs special keys/permissions.
