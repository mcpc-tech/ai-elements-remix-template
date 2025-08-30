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

  if (part.type === "tool-calculator") {
    console.log(part);
    return (
      <Tool defaultOpen={true}>
        <ToolHeader type="tool-calculator" state={part.state} />
        <ToolContent>
          <ToolInput input={part.input} />
          <ToolOutput
            output={
              <CodeBlock
                code={JSON.stringify(part.output, null, 2)}
                language="json"
              />
            }
            errorText={part.errorText}
          />
        </ToolContent>
      </Tool>
    );
  }
}
