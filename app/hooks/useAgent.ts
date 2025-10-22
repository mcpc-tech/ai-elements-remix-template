import { useState, useEffect } from "react";

export const AGENT_STORAGE_KEY = "AI_SELECTED_AGENT";

/**
 * Persist the selected agent in localStorage. Mirrors the API of useApiKey.
 * - returns: { agent, setAgent }
 */
export const useAgent = (defaultAgent: string) => {
  const [agent, setAgentState] = useState<string>(defaultAgent);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(AGENT_STORAGE_KEY);
      if (saved) setAgentState(saved);
    }
  }, []);

  const setAgent = (newAgent: string) => {
    setAgentState(newAgent);
    if (typeof window !== "undefined") {
      if (newAgent?.trim()) {
        localStorage.setItem(AGENT_STORAGE_KEY, newAgent);
      } else {
        localStorage.removeItem(AGENT_STORAGE_KEY);
      }
    }
  };

  return { agent, setAgent };
};
