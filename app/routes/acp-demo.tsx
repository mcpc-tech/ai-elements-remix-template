import { ClientOnly } from "remix-utils/client-only";
import { ACPAgentDemo } from "~/.client/acp-client";

export default function ACPClientPage() {
  return (
    <div className="container mx-auto p-4">
      <ClientOnly fallback={<div className="text-center py-8">Loading ACP Agent Demo...</div>}>
        {() => <ACPAgentDemo />}
      </ClientOnly>
    </div>
  );
}
