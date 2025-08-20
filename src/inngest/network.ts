import { createNetwork } from "@inngest/agent-kit";
import { codeAgent } from "@/inngest/agents";
import { AgentState } from "@/inngest/types";

export const network = createNetwork<AgentState>({
  name: "coding-agent-network",
  agents: [codeAgent],
  maxIter: 15, // max number of iterations
  router: async ({ network }) => {
    // run the code agent until it finishes or reaches the max number of iterations
    const summary = network.state.data.summary;
    if (summary) {
      return;
    }
    return codeAgent;
  },
});
