# AI Elements Remix Template

A modern chat interface template built with AI SDK and AI Elements.

## Tech Stack

- **React Router V7** - Full-stack React framework
- **AI SDK** - Vercel AI SDK for chat functionality
- **shadcn/ui** - Beautiful UI components built on Radix UI
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server

## Features

- 🤖 **AI Chat Interface** - Complete chat UI with streaming responses
- 🔗 **ACP Support** - Connect to any Agent Client Protocol compatible agent like Gemini CLI, Claude Code, or Codex CLI

  ![acp demo](./docs/acp-demo.gif)

- 🎨 **AI Elements** - Uses [Vercel AI SDK Elements](https://ai-sdk.dev/elements/overview) for building AI-powered interfaces
- 🔧 **Configurable** - Easy to customize and extend
- 🌙 **Dark Mode** - Built-in theme switching
- 📱 **Responsive** - Mobile-first design
- 🔑 **Client-side API Key** - Secure local storage of credentials

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Usage of Vercel Gateway Playground

1. Click the settings icon to configure your AI Gateway API Key
2. Select your preferred model from the dropdown
3. Start chatting with the AI assistant

## Usage of the ACP Web Client

The ACP ([Agent Client Protocol](https://agentclientprotocol.com)) is a standardized protocol for communication between AI agents and client applications.

### How to Access

Navigate to `/acp` in your browser to access the ACP agent interface.

### What It Does

- Implements the Agent Client Protocol specification for standardized AI agent communication
- Uses AI SDK with [acp-ai-provider](https://github.com/mcpc-tech/mcpc/tree/main/packages/acp-ai-provider) to enable seamless integration with ACP-compatible AI agents on the web platform using `streamText` and `useChat`
