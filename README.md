# AI Elements Remix Template

A web-based ACP (Agent Client Protocol) interface template built with AI SDK and AI Elements.

> Looking for a real, actively maintained ACP project? Check out [DevInspector MCP](https://github.com/mcpc-tech/dev-inspector-mcp) — AI-powered visual debugging for React, Vue, Svelte & Next.js.

## Tech Stack

- **React Router V7** - Full-stack React framework
- **AI SDK** - Vercel AI SDK for chat functionality
- **shadcn/ui** - Beautiful UI components built on Radix UI
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server

## Features

- 🔗 **ACP Support** - Connect to any Agent Client Protocol compatible agent like Claude Code, Gemini CLI, or Codex CLI
- 🤖 **Standardized Agents** - Built-in configuration for major ACP agents
- 🎨 **AI Elements** - Uses [Vercel AI SDK Elements](https://ai-sdk.dev/elements/overview) for building AI-powered interfaces
- 🔧 **Configurable** - Easy to customize and extend
- 🌙 **Dark Mode** - Built-in theme switching
- 📱 **Responsive** - Mobile-first design
- 🔑 **Local Configuration** - Secure local handling of environment variables

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Usage

1. Select your preferred agent from the dropdown (e.g., Claude Code, Gemini CLI).
2. Configure any required environment variables (API keys) in the settings dialog.
3. Start chatting with the agent!

The interface uses [ACP (Agent Client Protocol)](https://agentclientprotocol.com) to communicate with agents running locally or remotely.
