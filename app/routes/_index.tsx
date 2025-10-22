import type { MetaFunction } from "react-router";
import { Navbar } from "components/navbar";
import { ClientOnly } from "remix-utils/client-only";
import { Loader } from "~/components/ai-elements/loader";

import Agent from "~/.client/agent";

export const meta: MetaFunction = () => {
  return [
    { title: "AI Elements" },
    { name: "description", content: "Welcome to AI Elements!" },
  ];
};

export default function Index() {
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
            {() => <Agent />}
          </ClientOnly>
        </div>
      </main>
    </div>
  );
}
