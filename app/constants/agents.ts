export interface Agent {
  name: string;
  command: string;
  args?: string[];
  env: Array<{
    key: string;
    required: boolean;
  }>;
  authMethodId?: string;
  meta?: { 
    // see -> https://app.unpkg.com/@lobehub/icons-static-svg@1.73.0/files/icons/
    icon?: string };
}

export const AVAILABLE_AGENTS: Agent[] = [
  {
    name: "Gemini CLI",
    command: "gemini",
    args: ["--experimental-acp"],
    env: [{ key: "GEMINI_API_KEY", required: true }],
    authMethodId: "gemini-api-key",
    meta: {
      icon: "https://unpkg.com/@lobehub/icons-static-svg@1.73.0/icons/gemini-color.svg",
    },
  },
  {
    name: "Claude Code",
    command: "claude-code-acp",
    env: [
      { key: "ANTHROPIC_API_KEY", required: true },
      {
        key: "ANTHROPIC_BASE_URL",
        required: false,
      },
    ],
    meta: {
      icon: "https://unpkg.com/@lobehub/icons-static-svg@1.73.0/icons/claude-color.svg",
    }
  },
  {
    name: "Codex CLI",
    command: "codex-acp",
    env: [{ key: "AI_GATEWAY_API_KEY", required: true }],
    meta: {
      icon: "https://unpkg.com/@lobehub/icons-static-svg@1.73.0/icons/openai.svg",
    },
  },
];

export const DEFAULT_AGENT = "gemini";
