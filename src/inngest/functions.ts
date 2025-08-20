import { inngest } from "@/inngest/client";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox } from "@/e2b/utils";
import { network } from "@/inngest/network";
import prisma from "@/lib/prisma";

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

    // initialize the network state with the sandbox id
    const result = await network.run(event.data.text, {
      state: {
        data: {
          sandboxId: sandboxId,
        },
      },
    });

    // generate sandbox url
    const sandboxUrl = await step.run("generate-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

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
          },
        });
      }

      return await prisma.message.create({
        data: {
          content: result.state.data.summary,
          role: "ASSISTANT",
          type: "RESULT",
          fragments: {
            create: {
              sandboxUrl: sandboxUrl,
              title: "Fragment",
              files: result.state.data.files,
            },
          },
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
