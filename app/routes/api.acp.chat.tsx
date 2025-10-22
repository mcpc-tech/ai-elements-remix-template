import { type ActionFunctionArgs } from "react-router";
import { streamText, convertToModelMessages } from "ai";
import { createACPProvider } from "@mcpc-tech/acp-ai-provider";

export async function action({ request }: ActionFunctionArgs) {
  const { messages, agent, envVars } = await request.json();

  console.log("ACP Agent Command:", agent);

  const provider = createACPProvider({
    command: agent.command,
    args: agent.args,
    env: envVars,
    session: {
      cwd: process.cwd(),
      mcpServers: [],
    },
    authMethodId: "custom-model-provider",
  });

  const result = streamText({
    model: provider.languageModel(),
    messages: convertToModelMessages(messages),
    onError: (error) => {
      console.error("Error occurred while streaming text:", error);
    },
    // @ts-expect-error - t
    tools: provider.tools,
  });

  return result.toUIMessageStreamResponse({
    onError: (error) => {
      console.error("Stream error:", error);
      return error instanceof Error ? error.message : String(error);
    },
  });
}
