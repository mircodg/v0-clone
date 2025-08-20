import { openai, createAgent } from "@inngest/agent-kit";
import { readFiles, createOrUpdateFiles, terminal } from "@/inngest/tools";
import { PROMPT } from "@/inngest/prompt";
import { lastAssistantMessageContent } from "@/inngest/utils";
import { AgentState } from "@/inngest/types";

export const codeAgent = createAgent<AgentState>({
  name: "code-agent",
  description: "An expert coding agent",
  system: PROMPT,
  model: openai({ model: "gpt-4.1", defaultParameters: { temperature: 0.1 } }),
  tools: [terminal, createOrUpdateFiles, readFiles],
  lifecycle: {
    onResponse: async ({ result, network }) => {
      const lastAssistantMessageText = lastAssistantMessageContent(result);
      if (lastAssistantMessageText && network) {
        // store the task summary in the network state if the agent finished (e.g text includes <task_summary>...</task_summary>)
        if (lastAssistantMessageText.includes("<task_summary>")) {
          network.state.data.summary = lastAssistantMessageText;
        }
      }
      return result;
    },
  },
});
