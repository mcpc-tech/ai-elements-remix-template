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
import { useAgent } from "~/hooks/useAgent";
import { useAgentEnv } from "~/hooks/useAgentEnv";
import { renderMessagePart } from "~/utils/messageRenderer";
import { AVAILABLE_AGENTS, DEFAULT_AGENT } from "~/constants/agents";
import { DefaultChatTransport } from "ai";

const ACPAgent = () => {
  const [input, setInput] = useState("");
  // Persist selected agent using useAgent hook
  const { agent: selectedAgent, setAgent: setSelectedAgent } = useAgent(
    DEFAULT_AGENT
  );
  // no global apiKey: use per-agent env vars instead

  // Get the selected agent object
  const currentAgent =
    AVAILABLE_AGENTS.find((agent) => agent.command === selectedAgent) ||
    AVAILABLE_AGENTS[0];

  // Prepare agent-scoped env state for the settings dialog
  const requiredKeys = currentAgent.env.map((e) => e.key);
  const { envVars, setEnvVar } = useAgentEnv(currentAgent.command, requiredKeys);

  const selectedAgentRef = useRef(selectedAgent);

  useEffect(() => {
    selectedAgentRef.current = selectedAgent;
  }, [selectedAgent]);

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/acp/chat",
    }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
        // Ensure all required env keys are present
        const missing = requiredKeys.filter((k) => !(envVars[k] ?? "").trim());
        if (missing.length) {
          alert(`Please set required keys: ${missing.join(", ")}`);
          return;
        }

        // Prepare environment variables based on selected agent
        const preparedEnv: Record<string, string> = {};
        currentAgent.env.forEach((envConfig) => {
          preparedEnv[envConfig.key] = envVars[envConfig.key] ?? "";
        });

      sendMessage(
        { text: input },
        {
            body: {
              agent: currentAgent,
              envVars: preparedEnv,
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
                      status === "streaming",
                      message.metadata as Record<string, unknown> | undefined
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
                onValueChange={setSelectedAgent}
                value={selectedAgent}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {AVAILABLE_AGENTS.map((agentOption) => (
                    <PromptInputModelSelectItem
                      key={agentOption.command}
                      value={agentOption.command}
                    >
                      {agentOption.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
              <SettingsDialog
                selectedAgentName={currentAgent.name}
                requiredKeyNames={requiredKeys}
                values={envVars}
                onChange={(k, v) => setEnvVar(k, v)}
              />
            </PromptInputTools>
            <PromptInputSubmit
              onAbort={stop}
              disabled={
                !input ||
                requiredKeys.some((k) => !(envVars[k] ?? "").trim())
              }
              status={status}
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default ACPAgent;
