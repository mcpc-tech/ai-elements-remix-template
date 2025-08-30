import { useState, useEffect } from "react";

export const AI_GATEWAY_API_KEY = "AI_GATEWAY_API_KEY";

export const useApiKey = () => {
  const [apiKey, setApiKeyState] = useState<string>("");

  // Load API key from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedApiKey = localStorage.getItem(AI_GATEWAY_API_KEY);
      if (savedApiKey) {
        setApiKeyState(savedApiKey);
      }
    }
  }, []);

  // Function to update API key and save to localStorage
  const setApiKey = (newApiKey: string) => {
    setApiKeyState(newApiKey);
    if (typeof window !== "undefined") {
      if (newApiKey.trim()) {
        localStorage.setItem(AI_GATEWAY_API_KEY, newApiKey);
      } else {
        localStorage.removeItem(AI_GATEWAY_API_KEY);
      }
    }
  };

  return {
    apiKey,
    setApiKey,
  };
};
