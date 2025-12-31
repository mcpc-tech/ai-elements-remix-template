import { AGENT_ICONS, svgToDataUri } from "./icons";

export interface Agent {
  name: string;
  command: string;
  args?: string[];
  env: Array<{
    key: string;
    required: boolean;
  }>;
  authMethodId?: string;
  configHint?: string;
  configLink?: string;
  npmPackage?: string;
  npmArgs?: string[];
  installCommand?: string;
  meta?: {
    icon?: string;
  };
  acpDelay?: number;
}

export const AVAILABLE_AGENTS: Agent[] = [
  {
    name: "Claude Code",
    command: "npx",
    args: ["-y", "@zed-industries/claude-code-acp"],
    env: [
      { key: "ANTHROPIC_API_KEY", required: false },
      { key: "ANTHROPIC_BASE_URL", required: false },
    ],
    configHint: "Anthropic's official CLI agent via Zed adapter",
    configLink: "https://github.com/zed-industries/claude-code-acp",
    npmPackage: "@zed-industries/claude-code-acp",
    npmArgs: [],
    meta: {
      icon: svgToDataUri(AGENT_ICONS.claude),
    },
  },
  {
    name: "Codex CLI",
    command: "npx",
    args: ["-y", "@zed-industries/codex-acp"],
    env: [{ key: "OPENAI_API_KEY", required: false }],
    configHint: "OpenAI Codex CLI via Zed adapter",
    configLink: "https://github.com/zed-industries/codex-acp",
    npmPackage: "@zed-industries/codex-acp",
    npmArgs: [],
    meta: {
      icon: svgToDataUri(AGENT_ICONS.openai),
    },
  },
  {
    name: "Gemini CLI",
    command: "gemini",
    args: ["--experimental-acp"],
    env: [{ key: "GEMINI_API_KEY", required: false }],
    authMethodId: "gemini-api-key",
    configHint: "Official Google Gemini CLI with ACP support",
    configLink: "https://github.com/google-gemini/gemini-cli",
    meta: {
      icon: svgToDataUri(AGENT_ICONS.gemini),
    },
  },
  {
    name: "Kimi CLI",
    command: "kimi",
    args: ["--acp"],
    env: [],
    configHint: "Moonshot AI's CLI with built-in ACP support",
    configLink: "https://github.com/MoonshotAI/kimi-cli",
    installCommand: "uv tool install --python 3.13 kimi-cli",
    meta: {
      icon: svgToDataUri(AGENT_ICONS.moonshot),
    },
  },
  {
    name: "Goose",
    command: "goose",
    args: ["acp"],
    env: [],
    configHint: "Block's open-source agent with ACP support",
    configLink: "https://block.github.io/goose/docs/guides/acp-clients",
    installCommand: "pipx install goose-ai",
    meta: {
      icon: svgToDataUri(AGENT_ICONS.goose),
    },
  },
  {
    name: "Opencode",
    command: "opencode",
    args: ["acp"],
    env: [],
    configHint: "SST's open source agent with ACP support",
    configLink: "https://github.com/sst/opencode",
    meta: {
      icon: AGENT_ICONS.opencode, // PNG already a data URI or URL
    },
  },
  {
    name: "Cursor Agent",
    command: "npx",
    args: ["@blowmage/cursor-agent-acp"],
    env: [],
    configHint: "Unofficial ACP adapter for Cursor's agent",
    configLink: "https://github.com/blowmage/cursor-agent-acp",
    npmPackage: "@blowmage/cursor-agent-acp",
    npmArgs: [],
    meta: {
      icon: svgToDataUri(AGENT_ICONS.cursor),
    },
  },
  {
    name: "Droid (Experimental)",
    command: "npx",
    args: ["-y", "@yaonyan/droid-acp"],
    env: [{ key: "FACTORY_API_KEY", required: false }],
    configHint: "Unofficial ACP adapter for Droid CLI",
    configLink: "https://github.com/yaonyan/droid-acp",
    npmPackage: "@yaonyan/droid-acp",
    npmArgs: [],
    meta: {
      icon: svgToDataUri(AGENT_ICONS.droid),
    },
  },
  {
    name: "CodeBuddy Code",
    command: "codebuddy",
    args: ["--acp"],
    env: [
      { key: "CODEBUDDY_API_KEY", required: false },
      {
        key: "CODEBUDDY_INTERNET_ENVIRONMENT",
        required: false,
      },
    ],
    configHint: "Tencent Cloud's coding assistant",
    configLink: "https://copilot.tencent.com/docs/cli/acp",
    meta: {
      icon: svgToDataUri(AGENT_ICONS.codebuddy),
    },
    // Delay to ensure mcp server is ready
    acpDelay: 2000,
  },
];

export const DEFAULT_AGENT = "Claude Code";
