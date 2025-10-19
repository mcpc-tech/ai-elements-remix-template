import { useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Loader } from "@/components/ai-elements/loader";
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { useACPAgent, type AgentProcessConfig } from "./hooks/useACPAgent";
import {
  SUPPORTED_AGENTS,
  getDefaultAgent,
  getAgentById,
} from "./config/agents";

function getStoredValue(key: string, defaultValue: string): string {
  if (typeof window === "undefined") {
    return defaultValue;
  }
  return localStorage.getItem(key) || defaultValue;
}

function saveToStorage(key: string, value: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value);
  }
}

/**
 * ACP Agent Demo Component
 */
export function ACPAgentDemo() {
  const {
    status,
    messages,
    error,
    sessionId,
    connect,
    sendPrompt,
    disconnect,
  } = useACPAgent();

  const [wsUrl, setWsUrl] = useState(() =>
    getStoredValue("acp-ws-url", "ws://localhost:3001/acp")
  );

  const [agentCommand, setAgentCommand] = useState(() =>
    getStoredValue("acp-agent-command", getDefaultAgent().id)
  );

  const [cwd, setCwd] = useState(() => {
    const storedCwd = getStoredValue("acp-cwd", "");
    if (storedCwd) return storedCwd;

    const agent = getAgentById(agentCommand);
    return agent?.defaultCwd || "/tmp";
  });

  const [apiKey, setApiKey] = useState(() => getStoredValue("acp-api-key", ""));

  const [input, setInput] = useState("");

  const handleConnect = async () => {
    saveToStorage("acp-ws-url", wsUrl);
    saveToStorage("acp-agent-command", agentCommand);
    saveToStorage("acp-cwd", cwd);
    saveToStorage("acp-api-key", apiKey);

    const agent = getAgentById(agentCommand);
    const config: AgentProcessConfig = {
      command: agent?.command || agentCommand,
      cwd,
      ...(agent?.args && { args: agent.args }),
    };

    if (apiKey) {
      const envVarName = agent?.apiKeyEnvVar || "ANTHROPIC_API_KEY";
      config.env = { [envVarName]: apiKey };
    }

    await connect(wsUrl, config);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (input.trim() && status === "ready") {
      await sendPrompt(input.trim());
      setInput("");
    }
  };

  const isConnected = status !== "disconnected";
  // Show loading only when the last message is from the user (waiting for assistant response)
  const isWaitingForResponse =
    messages.length > 0 && messages[messages.length - 1].type === "user";

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ACP Web Client</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Status:
            </span>
            <StatusBadge status={status} />
            {sessionId && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Session: {sessionId.substring(0, 8)}...
              </span>
            )}
          </div>
        </div>
        {isConnected && (
          <button
            onClick={disconnect}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Disconnect
          </button>
        )}
      </header>

      {!isConnected && (
        <ConnectionForm
          wsUrl={wsUrl}
          setWsUrl={setWsUrl}
          agentCommand={agentCommand}
          setAgentCommand={setAgentCommand}
          cwd={cwd}
          setCwd={setCwd}
          apiKey={apiKey}
          setApiKey={setApiKey}
          onConnect={handleConnect}
          error={error}
        />
      )}

      {isConnected && (
        <ChatInterface
          messages={messages}
          isLoading={isWaitingForResponse}
          onSubmit={handleSubmit}
          isReady={status === "ready"}
          input={input}
          onInputChange={setInput}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getStatusColor = () => {
    if (status === "ready") {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
    if (status === "connecting" || status === "authenticating") {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 animate-pulse";
    }
    if (status === "error") {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor()}`}
    >
      {status}
    </span>
  );
}

interface ConnectionFormProps {
  wsUrl: string;
  setWsUrl: (url: string) => void;
  agentCommand: string;
  setAgentCommand: (cmd: string) => void;
  cwd: string;
  setCwd: (cwd: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  onConnect: () => void;
  error: string | null;
}

function ConnectionForm({
  wsUrl,
  setWsUrl,
  agentCommand,
  setAgentCommand,
  cwd,
  setCwd,
  apiKey,
  setApiKey,
  onConnect,
  error,
}: ConnectionFormProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div>
          <label htmlFor="ws-url" className="block text-sm font-medium mb-1">
            WebSocket URL
          </label>
          <input
            id="ws-url"
            type="text"
            value={wsUrl}
            onChange={(e) => setWsUrl(e.target.value)}
            className="w-full px-3 py-2 border rounded dark:bg-gray-800"
            placeholder="ws://localhost:3001/acp"
          />
        </div>

        <div>
          <label
            htmlFor="agent-select"
            className="block text-sm font-medium mb-1"
          >
            Agent
          </label>
          <select
            id="agent-select"
            value={agentCommand}
            onChange={(e) => setAgentCommand(e.target.value)}
            className="w-full px-3 py-2 border rounded dark:bg-gray-800"
          >
            {SUPPORTED_AGENTS.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
          {(() => {
            const agent = getAgentById(agentCommand);
            return agent?.description ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {agent.description}
              </p>
            ) : null;
          })()}
        </div>

        <div>
          <label htmlFor="cwd-input" className="block text-sm font-medium mb-1">
            Working Directory
          </label>
          <input
            id="cwd-input"
            type="text"
            value={cwd}
            onChange={(e) => setCwd(e.target.value)}
            className="w-full px-3 py-2 border rounded dark:bg-gray-800"
            placeholder="/workspace"
          />
        </div>

        <div>
          <label
            htmlFor="api-key-input"
            className="block text-sm font-medium mb-1"
          >
            API Key (Optional)
          </label>
          <input
            id="api-key-input"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 border rounded dark:bg-gray-800"
            placeholder="sk-ant-..."
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Will be set as{" "}
            {getAgentById(agentCommand)?.apiKeyEnvVar || "ANTHROPIC_API_KEY"}{" "}
            environment variable
          </p>
        </div>

        <button
          onClick={onConnect}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Connect
        </button>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

interface ChatInterfaceProps {
  messages: Array<{
    type: string;
    content: string;
    metadata?: Record<string, unknown>;
  }>;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  isReady: boolean;
  input: string;
  onInputChange: (value: string) => void;
}

function ChatInterface({
  messages,
  isLoading,
  onSubmit,
  isReady,
  input,
  onInputChange,
}: ChatInterfaceProps) {
  console.log("ChatInterface render", { messages, isLoading });
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Conversation className="h-full">
        <ConversationContent className="flex-1 overflow-y-auto p-4">
          {messages.map((msg, idx) => (
            <MessageItem key={idx} message={msg} />
          ))}
          {isLoading && (
            <Message from="assistant">
              <MessageContent>
                <Loader />
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="flex-shrink-0 border-t bg-background p-4">
        <PromptInput onSubmit={onSubmit}>
          <PromptInputTextarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Ask the agent anything..."
            disabled={!isReady}
          />
          <PromptInputToolbar>
            <PromptInputTools />
            <PromptInputSubmit disabled={!isReady || !input} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}

function MessageItem({
  message,
}: {
  message: {
    type: string;
    content: string;
    metadata?: Record<string, unknown>;
  };
}) {
  const from = message.type === "user" ? "user" : "assistant";

  // Render tool calls using AI Elements Tool component
  if (message.type === "tool_call" || message.type === "tool_call_update") {
    const status = (message.metadata?.status as string) || "input-available";
    const toolName = ((message.metadata?.toolName as string) ||
      "tool-call") as `tool-${string}`;
    const input = message.metadata?.input;
    const output = message.metadata?.output;

    // Map ACP status to AI Elements tool state
    const getToolState = (
      acpStatus: string
    ):
      | "input-streaming"
      | "input-available"
      | "output-available"
      | "output-error" => {
      switch (acpStatus) {
        case "in_progress":
          return "input-available";
        case "completed":
          return "output-available";
        case "failed":
          return "output-error";
        default:
          return "input-streaming";
      }
    };

    return (
      <Tool defaultOpen={status === "in_progress" || status === "failed"}>
        <ToolHeader type={toolName} state={getToolState(status)} />
        <ToolContent>
          {input != null && (
            <ToolInput input={input as Record<string, unknown>} />
          )}
          {output != null && (
            <ToolOutput
              output={
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(output, null, 2)}
                </pre>
              }
              errorText={status === "failed" ? message.content : undefined}
            />
          )}
          {status === "failed" && output == null && (
            <div className="p-4 text-red-600 dark:text-red-400 text-sm">
              {message.content}
            </div>
          )}
        </ToolContent>
      </Tool>
    );
  }

  return (
    <Message from={from}>
      <MessageContent>
        {message.type === "error" && (
          <div className="text-red-600 dark:text-red-400">
            <strong>Error:</strong> {message.content}
          </div>
        )}

        {message.type === "plan" && (
          <div className="text-purple-600 dark:text-purple-400 text-sm">
            <strong>Plan:</strong> {message.content}
          </div>
        )}

        {message.type !== "error" &&
          message.type !== "tool_call" &&
          message.type !== "tool_call_update" &&
          message.type !== "plan" && (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}
      </MessageContent>
    </Message>
  );
}

export default ACPAgentDemo;
