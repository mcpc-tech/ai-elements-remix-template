export interface Model {
  name: string;
  value: string;
}

export const AVAILABLE_MODELS: Model[] = [
  { name: "deepseek/deepseek-v3.1", value: "deepseek/deepseek-v3.1" },
  { name: "google/gemini-2.0-flash", value: "google/gemini-2.0-flash" },
  { name: "anthropic/claude-sonnet-4", value: "anthropic/claude-sonnet-4" },
];

export const DEFAULT_MODEL = AVAILABLE_MODELS[0].value;
