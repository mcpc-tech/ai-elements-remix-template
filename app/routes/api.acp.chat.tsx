import { type ActionFunctionArgs } from "react-router";
import { streamText, convertToModelMessages } from "ai";
import { createACPProvider } from "@mcpc-tech/acp-ai-provider";
import { planEntrySchema } from "@agentclientprotocol/sdk";
import { z } from "zod";

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
    authMethodId: agent.authMethodId,
  });

  const result = streamText({
    model: provider.languageModel(),
    // Ensure raw chunks like agent plan are included for streaming
    includeRawChunks: true,
    messages: convertToModelMessages(messages),
    // onChunk: (chunk) => {
    //   // console.log("Streamed chunk:", chunk);
    // },
    onError: (error) => {
      console.error("Error occurred while streaming text:", error);
    },
    tools: provider.tools,
  });

  return result.toUIMessageStreamResponse({
    messageMetadata: ({ part }) => {
      // Extract plan from raw chunks if available, 
      // raw chunks are not included in UI message streams
      if (part.type === "raw" && part.rawValue) {
        const parsed = z
          .string()
          .transform((str) => {
            try {
              return JSON.parse(str);
            } catch {
              return null;
            }
          })
          .pipe(z.array(planEntrySchema).optional())
          .safeParse(part.rawValue);

        if (parsed.success && parsed.data) {
          return { plan: parsed.data };
        }
      }
    },
    onError: (error) => {
      console.error("Stream error:", error);
      return error instanceof Error ? error.message : String(error);
    },
  });
}
