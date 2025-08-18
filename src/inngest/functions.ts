import { inngest } from "@/inngest/client";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox } from "@/e2b/utils";
import { network } from "@/inngest/network";

const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  }
);

const generateCodeFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "app/generate.code" },
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

    return {
      url: sandboxUrl,
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);

export const functions = [helloWorld, generateCodeFunction];
