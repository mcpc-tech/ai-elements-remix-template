import { type ActionFunctionArgs } from "react-router";
import { streamText, convertToModelMessages } from "ai";
import { createACPProvider } from "@mcpc-tech/acp-ai-provider";

export async function action({ request }: ActionFunctionArgs) {
  const { messages, agent, envVars } = await request.json();

  // Use the agent command directly
  const command = agent.command;

  // Set environment variables temporarily for the ACP process
  if (envVars) {
    Object.entries(envVars).forEach(([key, value]) => {
      process.env[key] = value as string;
    });
  }

  // Create ACP provider
  const provider = createACPProvider({
    command,
    args: ["--experimental-acp"],
    session: {
      cwd: "/Users/beet/github-repo/ai-elements-remix-template/",
      mcpServers: [],
    },
  });

  const result = streamText({
    model: provider.languageModel(),
    messages: convertToModelMessages(messages),
    onError: (error) => {
      console.error("Error occurred while streaming text:", error);
    },
  });

  return result.toUIMessageStreamResponse({
    onError: (error) => {
      console.error("Stream error:", error);
      return error instanceof Error ? error.message : String(error);
    },
  });
}
