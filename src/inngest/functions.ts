import { inngest } from "./client";
import { codeAgent } from "./agents";

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
  async ({ event }) => {
    const { output } = await codeAgent.run(`
        Write the following snippet: ${event.data.text}
        `);

    return output;
  }
);

export const functions = [helloWorld, generateCodeFunction];
