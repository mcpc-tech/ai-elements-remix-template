import { useState, useEffect } from "react";

export const AI_GATEWAY_API_KEY = "AI_GATEWAY_API_KEY";

// Helper to build a storage key for a given agentId (falls back to 'default')
const storageKeyFor = (agentId?: string) => {
  const id = agentId && agentId.trim() ? agentId.trim() : "default";
  return `${AI_GATEWAY_API_KEY}_${id}`;
};

/**
 * useApiKey hook (agent-aware)
 * @param agentId optional id of the agent to scope the API key to. When agentId changes,
 *                the hook will load the API key for the new agent.
 */
export const useApiKey = (agentId?: string) => {
  const [apiKey, setApiKeyState] = useState<string>("");

  // Load API key from localStorage on mount and when agentId changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const key = storageKeyFor(agentId);
      const savedApiKey = localStorage.getItem(key);
      setApiKeyState(savedApiKey ?? "");
    }
  }, [agentId]);

  // Function to update API key and save to localStorage scoped to agentId
  const setApiKey = (newApiKey: string) => {
    setApiKeyState(newApiKey);
    if (typeof window !== "undefined") {
      const key = storageKeyFor(agentId);
      if (newApiKey.trim()) {
        localStorage.setItem(key, newApiKey);
      } else {
        localStorage.removeItem(key);
      }
    }
  };

  return {
    apiKey,
    setApiKey,
  };
};
