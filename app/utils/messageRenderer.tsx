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

// Type guard to check if part is a tool call
function isToolPart(
  part: UIMessagePart<Record<string, unknown>, Record<string, UITool>>
): part is Extract<
  UIMessagePart<Record<string, unknown>, Record<string, UITool>>,
  { type: `tool-${string}`; state: string }
> {
  return (
    typeof part.type === "string" &&
    part.type.startsWith("tool-") &&
    "state" in part
  );
}

export function renderMessagePart(
  part: UIMessagePart<Record<string, unknown>, Record<string, UITool>>,
  messageId: string,
  index: number,
  isStreaming: boolean
) {
  console.log(part);
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

  // Handle tool calls with type starting with "tool-"
  if (isToolPart(part)) {
    const toolType = part.type;
    const hasOutput =
      part.state === "output-available" || part.state === "output-error";

    return (
      <Tool key={`${messageId}-${index}`} defaultOpen={hasOutput}>
        <ToolHeader type={toolType} state={part.state} />
        <ToolContent>
          {"input" in part && part.input !== undefined && (
            <ToolInput input={part.input} />
          )}
          {hasOutput && (
            <ToolOutput
              output={
                "output" in part && part.output ? (
                  <CodeBlock
                    code={JSON.stringify(part.output, null, 2)}
                    language="json"
                  />
                ) : null
              }
              errorText={"errorText" in part ? part.errorText : undefined}
            />
          )}
        </ToolContent>
      </Tool>
    );
  }

  // Fallback: handle step-start and other unknown types
  if (part.type === "step-start") {
    return null;
  }

  return null;
}
