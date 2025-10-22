export interface Agent {
  name: string;
  command: string;
  args?: string[];
  env: [
    {
      key: string;
      required: boolean;
    }
  ];
}

export const AVAILABLE_AGENTS: Agent[] = [
  {
    name: "Gemini CLI",
    command: "gemini",
    args: ["--experimental-acp"],
    env: [{ key: "GEMINI_API_KEY", required: true }],
  },
  {
    name: "Claude Code",
    command: "claude-code-acp",
    env: [{ key: "ANTHROPIC_API_KEY", required: true }],
  },
  {
    name: "Codex CLI",
    command: "codex-acp",
    env: [{ key: "AI_GATEWAY_API_KEY", required: true }],
  },
];

export const DEFAULT_AGENT = "gemini";
