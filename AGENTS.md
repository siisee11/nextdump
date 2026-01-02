# AGENTS.md

This file provides guidance for AI coding agents working on this codebase.

## Project Overview

This is a **Web Crawler Service** - a React + TypeScript + Vite application that allows users to:
1. Enter a target URL to crawl
2. Provide their PostgreSQL connection string
3. Initiate crawling via NextRows API
4. Receive crawled data directly in their database

See `PRD.md` for detailed product requirements and specifications.

---

## Dev Environment Tips

- Use `npm install` to install dependencies (or `bun install` for faster installs).
- Run `npm run dev` to start the Vite frontend development server with HMR.
- Run `npm run dev:server` to start the Bun backend server with watch mode.
- Run `npm run dev:all` to start both frontend and backend servers concurrently.
- Run `npm run build` to compile TypeScript and build for production.
- Run `npm run preview` to preview the production build locally.
- Check `package.json` for the project name and available scripts.
- The project uses Vite 7.x with React 19.x and TypeScript 5.9.x.
- The backend uses Bun runtime for fast server-side TypeScript execution.

---

## Code Style Guidelines

- Use **TypeScript** for all source files (`.ts`, `.tsx`).
- Follow the Biome configuration in `biome.json` for linting and formatting.
- React components should be functional components with hooks.
- Biome enforces React Hooks rules and best practices automatically.
- Keep components in `src/` directory.
- Static assets go in `public/` or `src/assets/`.

---

## Frontend Guide (Tailwind CSS + shadcn/ui)

### Tailwind CSS

- Tailwind CSS is configured via `tailwind.config.js` and `postcss.config.js`.
- Global styles and Tailwind directives are in `src/index.css`.
- Use utility classes directly in JSX - avoid writing custom CSS when possible.
- For responsive design, use Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`.
- Use the `cn()` utility from `src/lib/utils.ts` to conditionally merge class names.

### shadcn/ui Components

- shadcn/ui is a component library built on Radix UI primitives with Tailwind styling.
- Components are added to `src/components/ui/` - they are copied into the project, not imported from a package.
- To add a new component, run: `npx shadcn@latest add <component-name>`
- Available components: `button`, `input`, `card`, `dialog`, `form`, `toast`, `table`, `progress`, etc.
- Browse all components at: https://ui.shadcn.com/docs/components

### Adding Components

```bash
# Add a single component
npx shadcn@latest add button

# Add multiple components
npx shadcn@latest add button input card form

# Add all components (not recommended)
npx shadcn@latest add --all
```

### Component Usage Example

```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter URL</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Input placeholder="https://example.com" />
        <Button>Crawl</Button>
      </CardContent>
    </Card>
  )
}
```

### Path Aliases

- Use `@/` alias for imports from `src/` directory (configured in `tsconfig.json` and `vite.config.ts`).
- Example: `import { Button } from "@/components/ui/button"` instead of relative paths.

### Theming

- Theme variables are defined in `src/index.css` using CSS custom properties.
- shadcn/ui supports light and dark modes via the `dark` class on the root element.
- Modify colors in `tailwind.config.js` under `theme.extend.colors` if needed.

### Best Practices

- Prefer shadcn/ui components over building custom UI from scratch.
- Keep component styling consistent by using the design tokens (colors, spacing, etc.).
- Use the `variants` prop on components (e.g., `<Button variant="destructive">`) for different styles.
- For forms, use shadcn/ui's Form components with `react-hook-form` and `zod` for validation.

---

## Custom Hooks Guide (TanStack Query)

This project uses **TanStack Query** for server state management and **wouter** for client-side routing.

### Hooks Structure

Custom hooks for API calls are located in `src/hooks/`:

```
src/hooks/
└── useAnalyzeBrowsing.ts   # Hook for /browsing endpoint
```

### Creating API Hooks

**IMPORTANT: Always extract API mutations/queries into custom hooks in `src/hooks/`.**

#### Hook Structure

```typescript
// src/hooks/useMyFeature.ts
import { useMutation } from "@tanstack/react-query";

// 1. Export response types
export interface MyFeatureResponse {
  success: boolean;
  data: string;
}

// 2. Define the API function (private)
async function myFeatureApi(input: string): Promise<MyFeatureResponse> {
  const response = await fetch("http://localhost:3001/my-feature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// 3. Export the hook
export function useMyFeature() {
  return useMutation({
    mutationFn: myFeatureApi,
  });
}
```

#### Usage in Components

```tsx
import { useMyFeature } from "@/hooks/useMyFeature";

export function MyComponent() {
  const { mutate, isPending, isError, error, isSuccess, data } = useMyFeature();

  // Trigger the mutation
  const handleSubmit = () => {
    mutate("some-input");
  };

  // Render based on state
  if (isPending) return <Loading />;
  if (isError) return <Error message={error.message} />;
  if (isSuccess) return <Result data={data} />;

  return <Button onClick={handleSubmit}>Start</Button>;
}
```

### Hook Naming Conventions

- Prefix with `use` (React convention)
- Name after the action: `useAnalyzeBrowsing`, `useCrawlWebsite`, `useConnectDatabase`
- Export types alongside the hook for component usage

### TanStack Query Best Practices

1. **Destructure what you need** - Use `{ mutate, isPending, isError, data }` instead of the full mutation object
2. **Stable references in useEffect** - Use destructured `mutate` function in dependency arrays (it's stable)
3. **Export response types** - Components may need to type-check the response data
4. **Keep API logic in hooks** - Components should not contain fetch calls directly

---

## Backend Guide (Hono + Bun)

This project uses **Hono** as the backend web framework running on **Bun** runtime.

### Server Structure

The backend follows a modular structure:

```
server/
├── index.ts              # Main entry point - mounts routes and middleware
├── routes/               # Route modules (one file per endpoint/feature)
│   └── browsing.ts       # /browsing endpoint
└── utils/                # Shared utilities and helpers
    └── fetch-page.ts     # Web page fetching utility
```

### Running the Server

```bash
# Start server with watch mode (auto-restart on changes)
npm run dev:server

# Start server without watch mode
npm run server

# Start both frontend and backend together
npm run dev:all
```

### Server Configuration

- **Default Port**: 3001 (configurable via `PORT` environment variable)
- **CORS**: Enabled for all origins in development (via Hono middleware)
- **Runtime**: Bun with Hono framework

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/hello` | Health check endpoint, returns `{ message: "Hello from Hono server!" }` |
| POST | `/browsing` | AI-powered website analysis agent. Accepts `{ url: string }`, returns a detailed crawling report with database schema recommendations |

### Adding New Endpoints (Style Guide)

**IMPORTANT: Always create new endpoints in separate files under `server/routes/`.**

#### Step 1: Create a new route file

Create a new file in `server/routes/` (e.g., `server/routes/my-feature.ts`):

```typescript
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// Create a Hono app for this route module
const myFeatureRoutes = new Hono();

// Define request schema
const requestSchema = z.object({
  // your schema here
});

// Define routes
myFeatureRoutes.get("/", (c) => {
  return c.json({ message: "Hello" });
});

myFeatureRoutes.post("/", zValidator("json", requestSchema), async (c) => {
  const data = c.req.valid("json");
  return c.json({ success: true, data });
});

// With path parameters
myFeatureRoutes.get("/:id", (c) => {
  const id = c.req.param("id");
  return c.json({ id });
});

export { myFeatureRoutes };
```

#### Step 2: Mount the route in `server/index.ts`

```typescript
import { myFeatureRoutes } from "./routes/my-feature";

// Mount at /my-feature
app.route("/my-feature", myFeatureRoutes);
```

#### Step 3: Add shared utilities to `server/utils/`

If your endpoint needs reusable functions, add them to `server/utils/`:

```typescript
// server/utils/my-helper.ts
export async function myHelper(input: string): Promise<string> {
  // implementation
  return result;
}
```

Then import in your route:

```typescript
import { myHelper } from "../utils/my-helper";
```

### Route Modularization Rules

1. **One file per feature/endpoint** - Each major endpoint gets its own file in `server/routes/`
2. **Export a Hono app** - Each route file exports a Hono instance that gets mounted
3. **Keep `index.ts` clean** - Only middleware setup and route mounting in the main file
4. **Shared utilities in `utils/`** - Reusable functions go in `server/utils/`
5. **Validation schemas in route files** - Keep zod schemas close to the routes that use them
6. **Constants at the top** - System prompts, configs, and constants at the top of route files

### Hono Features

- **Middleware**: Use `app.use()` to add middleware (CORS, logging, auth, etc.)
- **Routing**: Supports path parameters, query strings, wildcards
- **Context**: The `c` object provides request/response helpers
- **Validation**: Pair with `@hono/zod-validator` for request validation

```typescript
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const schema = z.object({ url: z.string().url() });

app.post("/crawl", zValidator("json", schema), async (c) => {
  const { url } = c.req.valid("json");
  return c.json({ crawling: url });
});
```

### Frontend API Calls

When calling the backend from the Vite frontend during development:

```typescript
// Example: calling the /hello endpoint
const response = await fetch("http://localhost:3001/hello");
const data = await response.json();
```

For production, configure the API base URL via environment variables.

---

## AI SDK v6 Guide

This project uses **AI SDK v6** (beta) from Vercel for AI-powered features.

### Installation

The following packages are installed:
- `ai@beta` - Core AI SDK with streaming utilities
- `@ai-sdk/react@beta` - React hooks for chat UI
- `@ai-sdk/openai@beta` - OpenAI provider

### Imports

Use the centralized AI module for imports:

```tsx
import { useChat, DefaultChatTransport, UIMessage } from "@/lib/ai";
```

Or import directly from packages:

```tsx
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, convertToModelMessages, streamText } from "ai";
import type { UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
```

### Client-Side Chat UI (useChat Hook)

The `useChat` hook manages chat state and streaming responses:

```tsx
'use client';

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";

export function ChatComponent() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat", // Your backend endpoint
    }),
  });

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === "user" ? "User: " : "AI: "}
          {message.parts.map((part, index) =>
            part.type === "text" ? <span key={index}>{part.text}</span> : null
          )}
        </div>
      ))}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input });
            setInput("");
          }
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={status !== "ready"}
          placeholder="Say something..."
        />
        <button type="submit" disabled={status !== "ready"}>
          Send
        </button>
      </form>
    </div>
  );
}
```

### Server-Side API Route (streamText)

For backend endpoints that stream AI responses:

```tsx
import { convertToModelMessages, streamText, type UIMessage } from "ai";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: "openai/gpt-4o", // Model string format: provider/model
    system: "You are a helpful assistant.",
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
```

### Key Concepts (v6 Changes)

1. **Message Parts**: Messages use `parts` array instead of `content` string
   - Each part has a `type` (e.g., `"text"`, `"image"`)
   - Text parts: `{ type: "text", text: "..." }`

2. **sendMessage API**: Replace old `handleSubmit` pattern with `sendMessage({ text: input })`

3. **DefaultChatTransport**: Configure the API endpoint for chat streaming

4. **Model String Format**: Use `"provider/model"` format (e.g., `"openai/gpt-4o"`)

5. **Status States**: The `status` from `useChat` can be `"ready"`, `"streaming"`, etc.

### Environment Variables

Set up your API keys in `.env.local` (never commit this file):

```bash
OPENAI_API_KEY=sk-...
```

### File Structure

```
src/lib/ai/
└── index.ts       # AI SDK re-exports and configuration
```

---

## Testing Instructions

- Run `npm run lint` to check for Biome lint errors and formatting issues.
- Run `npm run lint:fix` to auto-fix lint and formatting issues.
- Run `npm run format` to format all files with Biome.
- Fix any lint or type errors before committing.
- After changing imports or moving files, run `npm run lint` to ensure rules still pass.
- When testing is added, run tests before committing changes.
- Add or update tests for the code you change, even if nobody asked.

---

## Build Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite frontend development server |
| `npm run dev:server` | Start Bun backend server with watch mode |
| `npm run dev:all` | Start both frontend and backend servers |
| `npm run server` | Start Bun backend server (no watch) |
| `npm run build` | TypeScript check + production build |
| `npm run lint` | Run Biome linter and formatter check |
| `npm run lint:fix` | Run Biome and auto-fix issues |
| `npm run format` | Format all files with Biome |
| `npm run preview` | Preview production build |

---

## Security Considerations

- **Never store PostgreSQL credentials** - use only in-session, never persist to localStorage or backend.
- Validate all user inputs (URLs, connection strings) before use.
- Connection strings may contain passwords - handle with care, never log them.
- Respect `robots.txt` when crawling (provide user toggle per PRD).
- Sanitize crawled content before storing to prevent injection attacks.

---

## PR Instructions

- Title format: `[NextDump] <Title>` or descriptive title for the change.
- Always run `npm run lint` and `npm run build` before committing.
- Ensure no TypeScript errors or Biome warnings.
- Reference any related issues or PRD sections in the PR description.
- Keep changes focused - one feature or fix per PR.

---

## Architecture Notes

- **Frontend**: React + TypeScript with Vite bundler
- **Routing**: wouter for client-side routing
- **Server State**: TanStack Query for API calls and caching
- **Backend**: Hono framework on Bun runtime for API endpoints
- **Styling**: Tailwind CSS + shadcn/ui component library
- **AI Integration**: AI SDK v6 (beta) with OpenAI provider
- **API Integration**: NextRows API for crawling
- **Database**: User-provided PostgreSQL (no server-side database for this app)

---

## File Structure

```
├── server/
│   ├── index.ts          # Bun backend server entry point
│   ├── routes/           # Route modules (one file per endpoint)
│   └── utils/            # Server-side utilities
└── src/
    ├── main.tsx          # App entry point (QueryClientProvider setup)
    ├── App.tsx           # Root component (wouter routing)
    ├── index.css         # Global styles + Tailwind directives
    ├── hooks/            # Custom React hooks for API calls
    │   └── useAnalyzeBrowsing.ts
    ├── lib/
    │   ├── utils.ts      # Utility functions (cn helper, etc.)
    │   └── ai/
    │       └── index.ts  # AI SDK v6 re-exports and configuration
    ├── components/
    │   └── ui/           # shadcn/ui components (button, input, card, etc.)
    └── assets/           # Static assets (images, etc.)
```

---

## Open Questions (from PRD)

Before implementing features, consider these unresolved items:
1. NextRows API endpoint and authentication method
2. Crawl depth or page count limits
3. JavaScript-rendered page (SPA) handling
4. Expected payload size per page

---

*Last Updated: January 1, 2026 (migrated to Hono backend framework)*
