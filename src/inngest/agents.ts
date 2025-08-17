import { openai, createAgent } from "@inngest/agent-kit";

export const codeAgent = createAgent({
  name: "code-agent",
  system: `You are an expert next.js developer. 
           You write readable, maintainable, and performant code.
           You write simple Next.js & React snippets.`,
  model: openai({ model: "gpt-4o" }),
});
