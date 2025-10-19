import type { AgentProcessConfig } from '../hooks/useACPAgent';

/**
 * Supported ACP Agents Configuration
 */

export interface AgentConfig extends Partial<AgentProcessConfig> {
  id: string;
  name: string;
  description?: string;
  defaultCwd?: string;
  requiresApiKey?: boolean;
  apiKeyEnvVar?: string;
}

export const SUPPORTED_AGENTS: AgentConfig[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    command: 'claude-code-acp',
    description: 'Anthropic Claude with coding capabilities',
    defaultCwd: '/tmp',
    requiresApiKey: true,
    apiKeyEnvVar: 'ANTHROPIC_API_KEY',
  },
  {
    id: 'gemini',
    name: 'Gemini CLI',
    command: 'gemini',
    args: ['--experimental-acp'],
    description: 'Google Gemini with ACP support',
    defaultCwd: '/tmp',
    requiresApiKey: true,
    apiKeyEnvVar: 'GOOGLE_API_KEY',
  },
];

export const DEFAULT_AGENT_ID = 'gemini';

export function getAgentById(id: string): AgentConfig | undefined {
  return SUPPORTED_AGENTS.find(agent => agent.id === id);
}

export function getDefaultAgent(): AgentConfig {
  return getAgentById(DEFAULT_AGENT_ID) || SUPPORTED_AGENTS[0];
}
