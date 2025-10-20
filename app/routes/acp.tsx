import type { MetaFunction } from "react-router";
import { Navbar } from "components/navbar";
import { ClientOnly } from "remix-utils/client-only";

import ACPAgent from "~/.client/acp-agent";

export const meta: MetaFunction = () => {
  return [
    { title: "ACP Agent - AI Elements" },
    { name: "description", content: "ACP Agent powered by AI Elements" },
  ];
};

export default function ACP() {
  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 container mx-auto max-w-7xl px-6 flex flex-col">
          <ClientOnly fallback={<div>Loading...</div>}>
            {() => <ACPAgent />}
          </ClientOnly>
        </div>
      </main>
    </div>
  );
}
