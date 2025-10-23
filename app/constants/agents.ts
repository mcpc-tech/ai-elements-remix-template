export interface Agent {
  name: string;
  command: string;
  args?: string[];
  env: Array<
    {
      key: string;
      required: boolean;
    }
  >;
  authMethodId?: string;
}

export const AVAILABLE_AGENTS: Agent[] = [
  {
    name: "Gemini CLI",
    command: "gemini",
    args: ["--experimental-acp"],
    env: [{ key: "GEMINI_API_KEY", required: true }],
    authMethodId: 'gemini-api-key'
  },
  {
    name: "Claude Code",
    command: "claude-code-acp",
    env: [{ key: "ANTHROPIC_API_KEY", required: true }, {
      key: "ANTHROPIC_BASE_URL",
      required: false
    }],
  },
  {
    name: "Codex CLI",
    command: "codex-acp",
    env: [{ key: "AI_GATEWAY_API_KEY", required: true }],
    authMethodId: "custom-model-provider",
  },
];

export const DEFAULT_AGENT = "gemini";
