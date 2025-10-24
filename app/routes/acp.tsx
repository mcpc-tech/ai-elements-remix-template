import type { MetaFunction, LinksFunction } from "react-router";
import { Navbar } from "components/navbar";
import { ClientOnly } from "remix-utils/client-only";

import ACPAgent from "~/.client/acp-agent";
import { Loader } from "~/components/ai-elements/loader";
import { AVAILABLE_AGENTS } from "~/constants/agents";

export const meta: MetaFunction = () => {
  return [
    { title: "ACP Agent - AI Elements" },
    { name: "description", content: "ACP Agent powered by AI Elements" },
  ];
};

export const links: LinksFunction = () => {
  // Preload agent icons used in the ACP UI to avoid jank when messages render
  const icons = AVAILABLE_AGENTS.map((a) => a.meta?.icon).filter(
    (u): u is string => Boolean(u)
  );

  return icons.map((href) => ({ rel: "preload", href, as: "image", crossOrigin: "anonymous" }));
};

export default function ACP() {
  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 container mx-auto max-w-7xl px-6 flex flex-col">
          <ClientOnly
            fallback={
              <div className="flex-1 flex items-center justify-center">
                <Loader />
              </div>
            }
          >
            {() => <ACPAgent />}
          </ClientOnly>
        </div>
      </main>
    </div>
  );
}
