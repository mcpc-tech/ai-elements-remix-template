// Message rendering utilities following KISS principle

import { Response } from "@/components/ai-elements/response";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { UIMessagePart, UITool } from "ai";
import {
  ToolHeader,
  Tool,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "~/components/ai-elements/tool";
import { CodeBlock } from "~/components/ai-elements/code-block";
import {
  Plan,
  PlanHeader,
  // PlanTitle,
  PlanContent,
  PlanTrigger,
} from "components/ai-elements/plan";
import { PlanEntry } from "@agentclientprotocol/sdk";
import { ProviderAgentDynamicToolInput } from "@mcpc-tech/acp-ai-provider";

function isToolPart(
  part: unknown
): part is Record<string, unknown> & { type: string; state: string } {
  const p = part as Record<string, unknown>;
  return (
    typeof p.type === "string" && p.type.startsWith("tool-") && "state" in p
  );
}

export function renderMessagePart(
  part: UIMessagePart<Record<string, unknown>, Record<string, UITool>>,
  messageId: string,
  index: number,
  isStreaming: boolean,
  metadata?: Record<string, unknown>
) {
  if (part.type === "text" && part.text) {
    return <Response key={`${messageId}-${index}`}>{part.text}</Response>;
  }

  if (part.type === "reasoning") {
    return (
      <Reasoning
        key={`${messageId}-${index}`}
        className="w-full"
        isStreaming={isStreaming}
      >
        <ReasoningTrigger />
        <ReasoningContent>{part.text}</ReasoningContent>
      </Reasoning>
    );
  }

  // Render plan from message metadata
  const plan = metadata?.plan as Array<PlanEntry> | undefined;
  if (plan && index === 0) {
    return (
      <div key={`${messageId}-plan`} className="w-full">
        <Plan defaultOpen isStreaming={isStreaming}>
          <PlanHeader className="flex flex-row items-center">
            <h1 className="text-base">Agent Plan</h1>
            <PlanTrigger className="mb-2" />
          </PlanHeader>
          <PlanContent>
            <ul className="space-y-2">
              {plan.map((item, i) => {
                const content =
                  (item.content as string) || JSON.stringify(item);
                const priority = item.priority as string | undefined;
                const status = item.status as string | undefined;

                return (
                  <li
                    key={`plan-${i}`}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div
                        className={`text-sm ${status === "done" ? "line-through text-slate-400" : "text-slate-900 dark:text-slate-100"}`}
                      >
                        {content}
                      </div>
                      {priority && (
                        <div className="mt-1 text-xs text-slate-500">
                          Priority: {priority}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-xs">
                      <span
                        className={`px-2 py-1 rounded-full font-medium text-[10px] uppercase tracking-wide ${status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}
                      >
                        {status ?? "pending"}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </PlanContent>
        </Plan>
      </div>
    );
  }

  // Handle tool calls with type starting with "tool-"
  if (isToolPart(part)) {
    const toolInput = part.input as ProviderAgentDynamicToolInput;
    const toolType = toolInput.toolName as `tool-${string}`;
    const hasOutput =
      part.state === "output-available" || part.state === "output-error";

    return (
      <Tool key={`${messageId}-${index}`} defaultOpen={hasOutput}>
        <ToolHeader type={toolType} state={part.state} />
        <ToolContent>
          {part.input !== undefined && <ToolInput input={part.input} />}
          {hasOutput && (
            <ToolOutput
              output={
                part.output ? (
                  <CodeBlock
                    code={JSON.stringify(part.output, null, 2)}
                    language="json"
                  />
                ) : null
              }
              errorText={part.errorText as string | undefined}
            />
          )}
        </ToolContent>
      </Tool>
    );
  }

  return null;
}
