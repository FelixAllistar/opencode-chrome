# Using a Single OpenCode Server With Multiple Projects & Directories

This document explains how to use the OpenCode HTTP API (via `@opencode-ai/sdk`) to:

- Run **one** `opencode` server in an arbitrary directory.
- Discover **all projects** known to that server.
- Let the user select a **project** and **session**.
- Talk to that session in the correct **project directory**, even if it is not the server’s own working directory.

It combines the official API docs with the behavior we observed while building the playground UI in this repo.

---

## Mental Model

- When you run `opencode` or `opencode serve`, you get:
  - A **server** (HTTP API) bound to a host/port.
  - Optionally a **TUI client** (the CLI UI) that talks to that server.
- The server:
  - Has a **default workspace** (the directory where the process was started).
  - Tracks **projects**, each with a **worktree** (absolute directory path).
  - Tracks **sessions**, each with:
    - `projectID`
    - `directory` (the directory OpenCode uses as the workspace for that session)
- Many APIs accept an optional `?directory=<path>` query param:
  - For listing/creating sessions.
  - For reading messages or sending prompts.
  - This is what lets one server operate on multiple worktrees.

Key implication:

> As long as you pass the correct `directory` for a session/project on **every** request, one server can work across multiple project directories.

If you omit or mismatch `directory`, you’ll see errors like:

> `NotFoundError: Resource not found: .../storage/session/<hash>/ses_xxx.json`

because the server looks for the session in the wrong workspace.

---

## Relevant Server APIs (from docs)

### Server startup

```bash
opencode serve [--port <number>] [--hostname <string>]
```

Default: `http://127.0.0.1:4096`.

You can also start the TUI (`opencode`) which spins up its own HTTP server on a random port; use `--port`/`--hostname` if you want a fixed address.

### Projects

The server exposes a project API (via the SDK as `client.project.*`):

- `GET /project` → `Project[]`
- `GET /project/current` → the project associated with the server’s current workspace.

From the generated types, a `Project` looks like:

```ts
type Project = {
  id: string
  worktree: string // absolute directory for this project
  vcs?: "git"
  time: { created: number; initialized?: number }
}
```

### Sessions

Docs summary:

- `GET /session` – list sessions.
- `GET /session/:id` – get a session.
- `POST /session` – create a session.
- `GET /session/:id/message` – list messages.
- `POST /session/:id/message` – send chat message.

Generated types show each of these also supports an optional `directory` query param:

```ts
// List sessions
export type SessionListData = {
  body?: never
  path?: never
  query?: {
    directory?: string
  }
  url: "/session"
}

// Create session
export type SessionCreateData = {
  body?: { parentID?: string; title?: string }
  path?: never
  query?: { directory?: string }
  url: "/session"
}

// List messages
export type SessionMessagesData = {
  body?: never
  path: { id: string } // Session ID
  query?: {
    directory?: string
    limit?: number
  }
  url: "/session/{id}/message"
}

// Send prompt
export type SessionPromptData = {
  body?: { /* model, agent, parts, ... */ }
  path: { id: string } // Session ID
  query?: {
    directory?: string
  }
  url: "/session/{id}/message"
}
```

And a `Session` has:

```ts
type Session = {
  id: string
  projectID: string
  directory: string // workspace directory for this session
  parentID?: string
  title: string
  version: string
  time: { created: number; updated: number; compacting?: number }
}
```

So:

- `projectID` connects sessions to projects.
- `directory` is the path the server uses for file operations for that session.
- `?directory=` on list / create / messages / prompt tells the server which workspace to use.

---

## Endgame Shape: One Server, Many Projects

Goal:

1. Start **one** server anywhere (e.g. `~/dev/opencode-root`).
2. Use the **Project API** to discover all projects and their `worktree`s.
3. Let the user pick a project.
4. Within that project:
   - List sessions in that directory.
   - Create new sessions tied to that directory.
   - Send prompts / commands against those sessions, always passing the correct `directory`.

This gives you “one server per machine” but “many workspaces per server”.

---

## Connecting via `@opencode-ai/sdk`

```ts
import { createOpencode, createOpencodeClient } from "@opencode-ai/sdk"

// Option A: start a server + client together (Node)
const { client, server } = await createOpencode({
  hostname: "127.0.0.1",
  port: 4096,
  // optional: override config (model, provider, etc.)
  config: {
    model: "anthropic/claude-3-5-sonnet-20241022",
  },
})

// Option B: connect to an existing server
const clientOnly = await createOpencodeClient({
  baseUrl: "http://127.0.0.1:4096",
})

// In a browser/extension UI, you almost always want Option B.
```

You can use the same client from your browser extension/background script, or from a standalone Node app.

> **SDK options vs our usage**
>
> - The SDK defaults (`responseStyle: "fields"`, `throwOnError: false`) mean each call returns an object with `{ data, error, request, response }`.
> - That’s why in this guide and the playground we always do:
>
>   ```ts
>   const res = await client.session.list()
>   if (res.error) throw res.error
>   const sessions = res.data ?? []
>   ```
>
> - If you prefer classic `try/catch` and plain return values, you can set `throwOnError: true` and/or `responseStyle: "data"` when creating the client. Then you’d just:
>
>   ```ts
>   const client = await createOpencodeClient({ baseUrl, throwOnError: true })
>   const session = await client.session.get({ path: { id } }) // throws on error
>   ```

---

## Step 1: Discover Projects

List all projects:

```ts
const projectsRes = await client.project.list()
if (projectsRes.error) throw projectsRes.error

const projects = projectsRes.data ?? []
// Project: { id, worktree, time, ... }
```

Get the project associated with the server’s current directory:

```ts
const currentRes = await client.project.current()
const currentProject = currentRes.data ?? null
// currentProject?.worktree tells you where the server is “rooted”
```

You can also ask the server for its current path:

```ts
const pathRes = await client.path.get()
const serverPath = (pathRes.data as { path?: string } | null)?.path
```

In a UI, you’d typically show:

- `currentProject.id` and `currentProject.worktree` (or `serverPath`) as “where this opencode instance lives”.
- A list of all `projects` to choose from.

---

## Step 2: List Sessions for a Project (via `directory`)

To show sessions **for a specific project**, use the project’s `worktree` as the `directory` filter:

```ts
function listSessionsForProject(project: Project) {
  return client.session.list({
    query: { directory: project.worktree },
  })
}

const sessionsRes = await listSessionsForProject(selectedProject)
if (sessionsRes.error) throw sessionsRes.error

const sessions = sessionsRes.data ?? []
// Each Session has: id, projectID, directory, title, etc.
```

If you want **all** sessions across all directories (for debugging), call `session.list()` without `query.directory`:

```ts
const allSessionsRes = await client.session.list()
const allSessions = allSessionsRes.data ?? []
```

In a UI, you can:

- Show a toggle:
  - “Filter by project” → use `query.directory = selectedProject.worktree`.
  - “Show all sessions” → omit `query.directory`.

---

## Step 3: Create a Session for a Project

When creating a session for a given project, you must also pass `directory`:

```ts
async function createProjectSession(project: Project, title: string) {
  const res = await client.session.create({
    body: { title },
    query: { directory: project.worktree },
  })

  if (res.error) throw res.error
  return res.data! // Session
}
```

You can let advanced users override `directory` if you want them to target a subfolder:

```ts
const res = await client.session.create({
  body: { title },
  query: { directory: customDirectory || project.worktree },
})
```

The returned `Session` will have `directory` set; you should keep that around and reuse it for all subsequent calls.

---

## Step 4: Reading Messages for a Session

When you fetch messages, pass the session’s own `directory`:

```ts
async function getSessionMessages(session: Session) {
  const res = await client.session.messages({
    path: { id: session.id },
    query: { directory: session.directory },
  })

  if (res.error) throw res.error
  return res.data ?? [] // [{ info: Message, parts: Part[] }, ...]
}
```

If you omit or mismatch `directory`, the server may try to look up the session in the wrong workspace, which is how you get:

```text
NotFoundError: Resource not found: .../storage/session/<hash>/ses_xxx.json
```

### Error-handling patterns we observed

The SDK wraps HTTP errors into typed errors. In practice you’ll commonly see:

- `404 NotFoundError` – often caused by:
  - Using a session ID that doesn’t exist on this server instance, or
  - Using a valid session ID **but with the wrong `directory`**, so the server looks in the wrong workspace and can’t find its storage (ENOENT).
- `400 BadRequestError` – malformed input, missing required fields, etc.

Typical handling pattern:

```ts
import type { NotFoundError, BadRequestError } from "@opencode-ai/sdk"

async function safeGetMessages(session: Session, directory?: string) {
  const res = await client.session.messages({
    path: { id: session.id },
    query: directory ? { directory } : undefined,
  })

  if (res.error) {
    // You can inspect the type or status here
    if ((res.error as NotFoundError).message?.includes("Resource not found")) {
      // e.g. surface a friendly message in your UI
      throw new Error(
        "Session not found in this directory. Check that you're using the correct project and directory.",
      )
    }
    throw res.error
  }

  return res.data ?? []
}
```

In a UI, a good strategy is:

- If you see `NotFoundError` for a session:
  - Show the session’s `directory` and the server’s `project.current().worktree` so the user can see the mismatch.
  - Let the user switch projects or re-select `directory`.
  - Optionally, provide a debug toggle to omit `directory` on the next request to verify whether the server’s default workspace is different from what they expect.

---

## Step 5: Sending a Prompt to a Session

Same rule: reuse the session’s `directory` on every prompt:

```ts
async function sendPromptToSession(session: Session, text: string) {
  const res = await client.session.prompt({
    path: { id: session.id },
    body: {
      parts: [{ type: "text", text }],
      // optional: model, agent, tools, noReply, etc.
    },
    query: { directory: session.directory },
  })

  if (res.error) throw res.error
  return res.data // { info: AssistantMessage, parts: Part[] }
}
```

This is exactly what we saw in practice:

- Start `opencode serve` in directory **X**.
- Select a project whose `worktree` is **Y**.
- List sessions with `query.directory = Y`.
- Create a session with `query.directory = Y`.
- Send prompts with `query.directory = session.directory` (which is `Y`).
- The server happily reads/writes files in **Y**, even though it’s running from **X**.

---

## Step 6: Optional – Driving the TUI for That Server

The same server also exposes `/tui` endpoints, which let you drive the TUI from your app (if a TUI is connected to this server):

```ts
// Append text to the TUI prompt
await client.tui.appendPrompt({
  body: { text: "[browser] console.log: ..." },
})

// Open the model or session selector in the TUI
await client.tui.openModels()
await client.tui.openSessions()

// Submit whatever is currently in the TUI prompt
await client.tui.submitPrompt()

// Show a toast in the TUI
await client.tui.showToast({
  body: { message: "Task completed", variant: "success" },
})
```

This is useful if you want your browser extension to:

- Stuff context (logs, traces) into the TUI prompt.
- Nudge the user to a given session/model in the TUI while still using the HTTP API for more automated actions.

---

## Putting It Together: Recommended Pattern

For a project like your browser extension or a companion web UI:

1. **Run one OpenCode server** on the machine.
   - Start it with `opencode serve --port 4096` (or via the TUI with a known port).
2. **Connect once** via the JS SDK:
   - `const client = await createOpencodeClient({ baseUrl: "http://localhost:4096" })`.
3. **Discover projects**:
   - `project.list()` → show `id` and `worktree`.
   - `project.current()` → show which project corresponds to the server’s own cwd.
4. **When a user picks a project**:
   - Use `project.worktree` as `directory`.
   - List sessions: `session.list({ query: { directory: worktree } })`.
   - Create sessions: `session.create({ body: { title }, query: { directory: worktree } })`.
5. **When a user picks a session**:
   - Always carry `session.directory` around.
   - Read messages: `session.messages({ path: { id }, query: { directory: session.directory } })`.
   - Send prompts: `session.prompt({ path: { id }, body: {...}, query: { directory: session.directory } })`.
6. **Optionally**:
   - Offer a “Show all sessions” view with `session.list()` (no directory) if you want a global view.
   - Provide toggles in the UI to:
     - Filter sessions by project worktree.
     - Include/omit `directory` in requests (for debugging).

This pattern is what we implemented in the playground in this repo, and it’s the simplest way to:

- Keep a **single OpenCode server** running.
- Let the user **pick any project** known to that server.
- Safely **route all session operations** to the right project directory using the `directory` query parameter. 
