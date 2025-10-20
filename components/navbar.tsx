import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { ThemeSwitch } from "./theme-switch";

export function Navbar() {
  const [isClient, setIsClient] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Determine SDK mode based on current route
  const getSdkMode = () => {
    if (location.pathname === "/acp") {
      return "ACP AI SDK";
    }
    // Default route (/) uses the Client AI SDK
    return "Client AI SDK";
  };

  if (!isClient) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-bold text-lg">
              AI Elements Demo
            </span>
          </a>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{getSdkMode()}</span>
          <ThemeSwitch />
        </div>
      </div>
    </nav>
  );
}
