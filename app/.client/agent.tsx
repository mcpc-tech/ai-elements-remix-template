import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Loader } from "@/components/ai-elements/loader";
import { SettingsDialog } from "~/components/settings-dialog";
import { renderMessagePart } from "~/utils/messageRenderer";
import { AVAILABLE_MODELS, DEFAULT_MODEL } from "~/constants/models";
import {
  ChatTransport,
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  UIMessage,
} from "ai";
import { createGateway } from "@ai-sdk/gateway";
import { z } from "zod";

// Simple function to add two numbers
const addTwoNumbers = (a: number, b: number): number => {
  return a + b;
};

const Agent = () => {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
  // useApiKey removed - generic agent doesn't require a single global API key here
  const apiKeyRef = useRef("");
  const selectedModelRef = useRef(selectedModel);

  // no apiKey to sync

  useEffect(() => {
    selectedModelRef.current = selectedModel;
  }, [selectedModel]);

  const { messages, sendMessage, status, stop } = useChat({
    transport: {
      sendMessages: async ({ messages, abortSignal }) => {
        const gateway = createGateway({
          apiKey: apiKeyRef.current,
        });

        const result = streamText({
          model: gateway(selectedModelRef.current),
          messages: convertToModelMessages(messages),
          tools: {
            calculator: tool({
              description: "Add two numbers together",
              inputSchema: z.object({
                a: z.number().describe("First number"),
                b: z.number().describe("Second number"),
              }),
              execute: async ({ a, b }: { a: number; b: number }) => ({
                a,
                b,
                result: addTwoNumbers(a, b),
              }),
            }),
          },
          toolChoice: "auto",
          abortSignal,
        });

        return result.toUIMessageStream();
      },
      reconnectToStream: async () => {
        throw new Error("Reconnection not implemented");
      },
    } satisfies ChatTransport<UIMessage>,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(
        { text: input },
        {
          body: {
            model: selectedModel,
          },
        }
      );
      setInput("");
    }
  };

  return (
    <div className="flex flex-col w-full h-full min-h-0">
      <div className="flex-1 overflow-hidden h-[calc(100vh-15rem)] max-h-[calc(100vh-15rem)]">
        <Conversation className="h-full">
          <ConversationContent className="h-full overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <Message
                from={message.role as "user" | "assistant"}
                key={message.id}
              >
                <MessageContent>
                  {message.parts.map((part, index) =>
                    renderMessagePart(
                      part,
                      message.id,
                      index,
                      status === "streaming"
                    )
                  )}
                </MessageContent>
              </Message>
            ))}
            {status === "submitted" && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      <div className="flex-shrink-0 border-t bg-background pt-4 pb-4">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea
            onChange={(e) => setInput(e.target.value)}
            value={input}
            placeholder="What would you like to know?"
          />
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputModelSelect
                onValueChange={setSelectedModel}
                value={selectedModel}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {AVAILABLE_MODELS.map((modelOption) => (
                    <PromptInputModelSelectItem
                      key={modelOption.value}
                      value={modelOption.value}
                    >
                      {modelOption.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
              <SettingsDialog />
            </PromptInputTools>
            <PromptInputSubmit
              onAbort={stop}
              disabled={!input}
              status={status}
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default Agent;
