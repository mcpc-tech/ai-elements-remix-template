import { useEffect, useState } from "react";

export const AGENT_ENV_PREFIX = "AI_AGENT_ENV";

/**
 * Hook to manage multiple environment variables scoped to an agent.
 * - agentId: id to scope storage (e.g. agent.command)
 * - keys: optional list of env keys that will be preloaded from localStorage
 */
export const useAgentEnv = (agentId?: string, keys?: string[]) => {
  const id = agentId && agentId.trim() ? agentId.trim() : "default";
  const storageKey = (key: string) => `${AGENT_ENV_PREFIX}_${id}_${key}`;

  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const initial: Record<string, string> = {};
    if (keys && keys.length) {
      keys.forEach((k) => {
        initial[k] = localStorage.getItem(storageKey(k)) ?? "";
      });
    }
    setEnvVars(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId, JSON.stringify(keys ?? [])]);

  const setEnvVar = (key: string, value: string) => {
    setEnvVars((prev) => ({ ...prev, [key]: value }));
    if (typeof window === "undefined") return;
    const sk = storageKey(key);
    if (value.trim()) localStorage.setItem(sk, value);
    else localStorage.removeItem(sk);
  };

  const getEnvVar = (key: string) => envVars[key] ?? "";

  return { envVars, setEnvVar, getEnvVar } as const;
};
