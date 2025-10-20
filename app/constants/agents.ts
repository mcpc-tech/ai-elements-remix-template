export interface Agent {
  name: string;
  command: string;
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
    env: [{ key: "OPENAI_API_KEY", required: true }],
  },
];

export const DEFAULT_AGENT = "gemini";
