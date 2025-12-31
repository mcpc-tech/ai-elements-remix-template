// Agent icons - imported as raw SVG strings for bundling
import claudeIcon from "../assets/icons/claude-color.svg?raw";
import openaiIcon from "../assets/icons/openai.svg?raw";
import geminiIcon from "../assets/icons/gemini-color.svg?raw";
import moonshotIcon from "../assets/icons/moonshot.svg?raw";
import gooseIcon from "../assets/icons/goose.svg?raw";
import cursorIcon from "../assets/icons/cursor.svg?raw";
import codebuddyIcon from "../assets/icons/codebuddy.svg?raw";
import droidIcon from "../assets/icons/droid.svg?raw";
// PNG icons - imported as URL (Vite default behavior for assets)
import opencodeIcon from "../assets/icons/opencode.png";

export const AGENT_ICONS = {
  claude: claudeIcon,
  openai: openaiIcon,
  gemini: geminiIcon,
  moonshot: moonshotIcon,
  goose: gooseIcon,
  cursor: cursorIcon,
  droid: droidIcon,
  opencode: opencodeIcon,
  codebuddy: codebuddyIcon,
} as const;

// Convert raw SVG to data URI for use in img src
export function svgToDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
