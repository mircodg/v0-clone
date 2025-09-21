import { inngest } from "@/inngest/client";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox } from "@/e2b/utils";
import { network } from "@/inngest/network";
import prisma from "@/lib/prisma";
import { createState, type Message } from "@inngest/agent-kit";
import { AgentState } from "./types";
import { fragmentTitleGeneratorAgent, responseGeneratorAgent } from "./agents";
import { parseAgentOutput } from "./utils";

// Inngest function to generate and run code in a sandbox
const generateCodeFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code/generate" },
  async ({ event, step }) => {
    // fetch sandbox id
    const sandboxId = await step.run("fetch-sandbox", async () => {
      const sandbox = await Sandbox.create("v0-clone-nextjs-template");
      return sandbox.sandboxId;
    });

    // fetch previous messages for agent memory
    const previousMessages = await step.run(
      "fetch-previous-messages",
      async () => {
        const formattedMessages: Message[] = [];
        const messages = await prisma.message.findMany({
          where: {
            projectId: event.data.projectId,
          },
          orderBy: {
            createdAt: "asc",
          },
        });
        for (const message of messages) {
          formattedMessages.push({
            type: "text",
            role: message.role === "ASSISTANT" ? "assistant" : "user",
            content: message.content,
          });
        }
        return formattedMessages;
      }
    );

    // initialize the network state with the previous messages
    const state = createState<AgentState>(
      {
        summary: "",
        files: {},
        sandboxId: sandboxId,
      },
      {
        messages: previousMessages,
      }
    );

    // initialize the network state with the sandbox id
    const result = await network.run(event.data.text, {
      state: state,
    });

    // generate sandbox url
    const sandboxUrl = await step.run("generate-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    // generate fragment title and response
    const { output: fragmentTitleOutput } =
      await fragmentTitleGeneratorAgent.run(result.state.data.summary, {
        state: result.state,
      });
    const { output: responseOutput } = await responseGeneratorAgent.run(
      result.state.data.summary,
      {
        state: result.state,
      }
    );

    // check if something went wrong during agent network run
    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

    // store llm result in database
    await step.run("store-llm-result", async () => {
      // early return if there was an error
      if (isError) {
        return await prisma.message.create({
          data: {
            content:
              "Something went wrong during code generation. Please try again.",
            role: "ASSISTANT",
            type: "ERROR",
            projectId: event.data.projectId,
          },
        });
      }

      return await prisma.message.create({
        data: {
          content: parseAgentOutput(responseOutput),
          role: "ASSISTANT",
          type: "RESULT",
          fragments: {
            create: {
              sandboxUrl: sandboxUrl,
              title: parseAgentOutput(fragmentTitleOutput),
              files: result.state.data.files,
            },
          },
          projectId: event.data.projectId,
        },
      });
    });

    return {
      url: sandboxUrl,
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);

export const functions = [generateCodeFunction];
