import { useEffect, useState } from "react";
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
import { useApiKey } from "~/hooks/useApiKey";
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
import { z } from "zod";

const Agent = () => {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
  const { apiKey, setApiKey } = useApiKey();

  const { messages, sendMessage, status } = useChat({
    transport: {
      sendMessages: async ({ messages, abortSignal }) => {
        const result = streamText({
          stopWhen: [stepCountIs(33)],
          model: selectedModel,
          messages: convertToModelMessages(messages),
          tools: {
            calculator: tool({
              description: "Get the weather in a location",
              inputSchema: z.object({
                location: z
                  .string()
                  .describe("The location to get the weather for"),
              }),
              execute: async ({ location }: { location: string }) => ({
                location,
                temperature: 72 + Math.floor(Math.random() * 21) - 10,
              }),
            }),
          },
          abortSignal,
        });

        return result.toUIMessageStream();
      },
      reconnectToStream: async () => {
        // Simple implementation - no reconnection logic needed for this basic case
        throw new Error("Reconnection not implemented");
      },
    } satisfies ChatTransport<UIMessage>,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      if (!apiKey.trim()) {
        alert("Please set your API Key first");
        return;
      }

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

  useEffect(() => {
    process.env.AI_GATEWAY_API_KEY = apiKey;
  }, [apiKey]);

  return (
    <div className="flex flex-col w-full h-full min-h-0">
      <div className="flex-1 min-h-0">
        <Conversation className="h-full">
          <ConversationContent className="h-full overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
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
              </div>
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
              <SettingsDialog apiKey={apiKey} onApiKeyChange={setApiKey} />
            </PromptInputTools>
            <PromptInputSubmit
              onAbort={stop}
              disabled={!input || !apiKey.trim()}
              status={status}
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default Agent;
