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
      return "ACP AI SDK Provider Example";
    }
    // Default route (/) uses the Client AI SDK
    return "Client AI SDK & Gateway Example";
  };

  if (!isClient) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-6 h-6 rounded-lg bg-slate-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
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
