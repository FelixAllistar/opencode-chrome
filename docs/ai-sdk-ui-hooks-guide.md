# AI SDK UI Hooks - Comprehensive Guide

This document provides a comprehensive analysis of all AI SDK UI hooks and how they work together to build AI-powered applications.

## Overview

AI SDK UI is a framework-agnostic toolkit designed to help build interactive chat, completion, and assistant applications with ease. It provides a set of React hooks and utility functions that streamline the integration of advanced AI functionalities into your applications.

## Core React Hooks

### 1. `useChat` - Primary Chat Interface Hook

**Purpose**: Manages complete chat conversations with state persistence, tool calling, and streaming responses.

#### Key Features:
- **Message Management**: Stores conversation history with `messages`, `setMessages`
- **Streaming**: Real-time response streaming with `status` states (`ready`, `submitted`, `streaming`, `error`)
- **Tool Calling**: Client-side tool execution via `onToolCall` callback
- **File Support**: Multi-modal file attachments (images, documents)
- **Persistence**: Chat resumption and message storage
- **Error Handling**: Built-in error states with `regenerate` functionality
- **Transport Layer**: Configurable via `DefaultChatTransport` or custom transports

#### Basic Usage:
```tsx
import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, sendMessage, status, error, regenerate } = useChat({
    api: '/api/chat',
    onFinish: ({ message }) => console.log('Complete:', message),
    onError: error => console.error('Error:', error)
  });

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, index) =>
            part.type === 'text' ? (
              <span key={index}>{part.text}</span>
            ) : null
          )}
        </div>
      ))}

      {error && (
        <div>
          <div>An error occurred.</div>
          <button onClick={regenerate}>Retry</button>
        </div>
      )}
    </div>
  );
}
```

#### Advanced Features:

**Tool Calling**:
```tsx
const { messages, sendMessage, addToolResult } = useChat({
  onToolCall({ toolCall }) {
    if (toolCall.toolName === 'getLocation') {
      addToolResult({
        tool: 'getLocation',
        toolCallId: toolCall.toolCallId,
        output: 'New York',
      });
    }
  },
});
```

**File Uploads**:
```tsx
const sendMessage = (text: string, files?: FileList) => {
  // Automatically handles file conversion to data URLs
  sendMessage({ text, files });
};
```

**Custom Transport**:
```tsx
import { DefaultChatTransport } from 'ai';

const { messages } = useChat({
  transport: new DefaultChatTransport({
    api: '/api/chat',
    prepareSendMessagesRequest({ messages, id }) {
      return {
        body: {
          message: messages[messages.length - 1],
          id
        }
      };
    },
  }),
});
```

### 2. `useCompletion` - Simplified Text Generation

**Purpose**: Single-prompt text completion without conversation context.

#### Key Features:
- **Input Management**: `input`, `handleInputChange`, `handleSubmit`
- **Streaming Completion**: Real-time text generation
- **Cancellation**: `stop` function for aborting requests
- **Throttling**: `experimental_throttle` for performance optimization

#### Usage:
```tsx
import { useCompletion } from '@ai-sdk/react';

export default function Completion() {
  const { completion, input, handleInputChange, handleSubmit, isLoading, stop } = useCompletion({
    api: '/api/completion',
    onFinish: (prompt, completion) => console.log('Complete:', completion),
    experimental_throttle: 50
  });

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="prompt"
        value={input}
        onChange={handleInputChange}
        placeholder="Enter your prompt..."
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate'}
      </button>
      {isLoading && <button type="button" onClick={stop}>Stop</button>}
      <div>{completion}</div>
    </form>
  );
}
```

### 3. `useObject` - Structured Object Generation

**Purpose**: Generate typed JSON objects using Zod schemas.

#### Key Features:
- **Schema Validation**: Type-safe object generation with Zod
- **Streaming Objects**: Real-time object construction
- **Error Handling**: Schema validation errors
- **Metadata Support**: Custom metadata attachment

#### Usage:
```tsx
import { useObject } from '@ai-sdk/react';
import { z } from 'zod';

const notificationSchema = z.object({
  notifications: z.array(
    z.object({
      name: z.string().describe('Name of a fictional person.'),
      message: z.string().describe('Message. Do not use emojis or links.'),
    })
  ),
});

export default function ObjectGenerator() {
  const { object, submit, isLoading, error } = useObject({
    api: '/api/notifications',
    schema: notificationSchema,
    onFinish: ({ object, error }) => {
      console.log('Generated object:', object);
      console.log('Validation error:', error);
    },
    onError: error => console.error('Request error:', error)
  });

  return (
    <div>
      <button
        onClick={() => submit('Generate notifications for a messages app')}
        disabled={isLoading}
      >
        {isLoading ? 'Generating...' : 'Generate Notifications'}
      </button>

      {error && <div>An error occurred: {error.message}</div>}

      {object?.notifications?.map((notification, index) => (
        <div key={index}>
          <p><strong>{notification.name}</strong></p>
          <p>{notification.message}</p>
        </div>
      ))}
    </div>
  );
}
```

## Server-Side Functions

### 4. `convertToModelMessages` - Message Transformation

**Purpose**: Converts UI messages to model-compatible format for AI providers.

**Role**: Bridge between UI layer and AI model layer

```tsx
import { convertToModelMessages, UIMessage } from 'ai';

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages: convertToModelMessages(messages), // Converts for AI provider
  });

  return result.toUIMessageStreamResponse();
}
```

### 5. `pruneMessages` - Conversation Management

**Purpose**: Optimizes conversation length by removing less relevant messages.

**Role**: Performance and cost optimization

```tsx
import { pruneMessages } from 'ai';

// Remove older messages to stay within token limits
const optimizedMessages = pruneMessages({
  messages: fullConversation,
  maxTokens: 4000,
});
```

## UI Message Stream Functions

### 6. `createUIMessageStream` - Custom Stream Creation

**Purpose**: Creates custom UI message streams with fine-grained control.

#### Advanced Features:
- **Custom Execution**: Full control over stream generation
- **Manual ID Generation**: Server-side message ID control
- **Stream Merging**: Combine multiple streams
- **Custom Metadata**: Attachment of server-side data

```tsx
import {
  generateId,
  streamText,
  createUIMessageStream,
  createUIMessageStreamResponse
} from 'ai';

export async function POST(req: Request) {
  const { messages, chatId } = await req.json();

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      // Write start message part with custom ID
      writer.write({
        type: 'start',
        messageId: generateId(),
      });

      const result = streamText({
        model: openai('gpt-4o-mini'),
        messages: convertToModelMessages(messages),
      });

      writer.merge(result.toUIMessageStream({ sendStart: false }));
    },
    originalMessages: messages,
    onFinish: ({ responseMessage }) => {
      // Save chat with generated message
      saveChat({ chatId, messages: [...messages, responseMessage] });
    },
  });

  return createUIMessageStreamResponse({ stream });
}
```

### 7. `createUIMessageStreamResponse` - HTTP Response Formatting

**Purpose**: Formats UI message streams for HTTP responses.

#### Features:
- **SSE Headers**: Proper Server-Sent Events setup
- **Error Handling**: Custom error message formatting
- **Metadata Injection**: Server-side metadata attachment
- **Completion Callbacks**: `onFinish` for persistence

```tsx
return result.toUIMessageStreamResponse({
  originalMessages: messages,
  messageMetadata: ({ part }) => {
    if (part.type === 'start') {
      return {
        createdAt: Date.now(),
        model: 'gpt-4o',
      };
    }

    if (part.type === 'finish') {
      return {
        totalTokens: part.totalUsage.totalTokens,
      };
    }
  },
  onError: error => {
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unknown error occurred';
  },
  onFinish: ({ messages }) => {
    saveChat({ chatId, messages });
  },
});
```

### 8. `readUIMessageStream` - Stream Consumption

**Purpose**: Consumes and processes UI message streams on client or server.

#### Capabilities:
- **Stream Processing**: Converts chunks to complete messages
- **Resumption**: Resume from previous message state
- **Tool Call Handling**: Process tool-related parts
- **Multi-part Support**: Handle text, tools, files, data

```tsx
import { readUIMessageStream, streamText } from 'ai';

async function processStream() {
  const result = streamText({
    model: openai('gpt-4o'),
    tools: {
      weather: tool({
        description: 'Get the weather in a location',
        inputSchema: z.object({
          location: z.string(),
        }),
        execute: ({ location }) => ({
          location,
          temperature: 72,
        }),
      }),
    },
    prompt: 'What is the weather in Tokyo?',
  });

  for await (const uiMessage of readUIMessageStream({
    stream: result.toUIMessageStream(),
  })) {
    // Handle different part types
    uiMessage.parts.forEach(part => {
      switch (part.type) {
        case 'text':
          console.log('Text:', part.text);
          break;
        case 'tool-call':
          console.log('Tool called:', part.toolName, 'with args:', part.args);
          break;
        case 'tool-result':
          console.log('Tool result:', part.result);
          break;
      }
    });
  }
}
```

### 9. `pipeUIMessageStreamToResponse` - Response Streaming

**Purpose**: Directs UI message streams to HTTP responses.

**Role**: Low-level stream piping for custom server implementations

```tsx
import { pipeUIMessageStreamToResponse } from 'ai';

export async function GET() {
  const stream = createCustomStream(); // Your custom stream logic

  return pipeUIMessageStreamToResponse(stream);
}
```

## Architecture Integration

### Data Flow Architecture:

1. **Client-Side Interaction**:
   - `useChat`/`useCompletion`/`useObject` capture user input
   - Hooks send requests via transport layer
   - Real-time streaming updates UI state

2. **Server-Side Processing**:
   - API routes receive requests
   - `convertToModelMessages` transforms for AI provider
   - `streamText`/`streamObject` generate responses
   - `createUIMessageStreamResponse` formats HTTP response

3. **Stream Communication**:
   - Server sends UI message stream via SSE
   - Client hooks consume and update state
   - `readUIMessageStream` processes chunks into messages

### Key Integration Patterns:

#### Chat with Tool Calling:
```
useChat → onToolCall → Client-side tools → addToolResult → continue generation
```

#### Persistent Conversations:
```
useChat → save messages → convertToModelMessages → stream response → onFinish → save
```

#### Custom Streaming:
```
createUIMessageStream → custom logic → createUIMessageStreamResponse → HTTP response
```

#### Object Generation:
```
useObject → schema validation → streamObject → type-safe object generation
```

## Advanced Features Integration

### Message Metadata
Attach usage data, timestamps, model info:

```tsx
// Server-side
return result.toUIMessageStreamResponse({
  messageMetadata: ({ part }) => {
    if (part.type === 'finish') {
      return {
        model: part.response.modelId,
        totalTokens: part.totalUsage.totalTokens,
        createdAt: Date.now(),
      };
    }
  },
});

// Client-side
const { messages } = useChat<MyUIMessage>();
// Access metadata via message.metadata
```

### Error Handling
Comprehensive error management:

```tsx
// Client-side
const { error, regenerate } = useChat({
  onError: error => console.error('Chat error:', error)
});

// Server-side
return result.toUIMessageStreamResponse({
  onError: error => {
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unknown error occurred';
  },
});
```

### Performance Optimization

#### Message Pruning:
```tsx
const optimizedMessages = pruneMessages({
  messages: longConversation,
  maxTokens: 4000,
});
```

#### Throttling:
```tsx
const { messages } = useChat({
  experimental_throttle: 50, // Throttle updates to 50ms
});
```

#### Streaming Resumption:
```tsx
const { messages } = useChat({
  resume: true, // Enable automatic stream resumption
  id: chatId,
});
```

## Transport Configuration

### Default Transport:
```tsx
import { DefaultChatTransport } from 'ai';

const { messages } = useChat({
  transport: new DefaultChatTransport({
    api: '/api/chat',
    headers: {
      Authorization: 'Bearer token',
    },
    body: {
      user_id: '123',
    },
  }),
});
```

### Custom Request Preparation:
```tsx
const { messages } = useChat({
  transport: new DefaultChatTransport({
    api: '/api/chat',
    prepareSendMessagesRequest({ id, messages, trigger, messageId }) {
      return {
        headers: { 'X-Session-ID': id },
        body: {
          messages: messages.slice(-10), // Only send last 10 messages
          trigger,
          messageId,
        },
      };
    },
  }),
});
```

## Type Safety

### Custom Message Types:
```tsx
import { InferUITools, UIMessage } from 'ai';

// Define custom tools
const tools = {
  getLocation: { /* ... */ },
  askForConfirmation: { /* ... */ },
};

// Infer types for better type safety
type MyUITools = InferUITools<typeof tools>;
type MyUIMessage = UIMessage<never, UIDataTypes, MyUITools>;

// Use with hooks
const { messages } = useChat<MyUIMessage>();
```

## Best Practices

1. **Use `useChat` for conversational interfaces** with full chat history
2. **Use `useCompletion` for simple text generation** without context
3. **Use `useObject` for structured data generation** with type safety
4. **Implement proper error handling** on both client and server
5. **Use message pruning** for long conversations to manage tokens
6. **Implement persistence** with `onFinish` callbacks
7. **Customize transport** for authentication and custom headers
8. **Use TypeScript** for better type safety and developer experience
9. **Handle loading states** properly for better UX
10. **Use throttling** for high-frequency streaming data

## Conclusion

The AI SDK UI hooks provide a comprehensive, flexible system for building AI-powered interfaces. The modular design allows developers to choose the right level of abstraction for their use case, from simple text completion to complex multi-modal conversations with tool calling and persistent storage.

The architecture maintains consistency across all hooks while providing the flexibility needed for different application patterns. By understanding how these hooks work together, you can build sophisticated AI applications with excellent user experiences and robust error handling.