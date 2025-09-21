import { AgentResult, type Message, TextMessage } from "@inngest/agent-kit";

export function lastAssistantMessageContent(result: AgentResult) {
  // retrieve last assistant message
  const lastAssistantMessage = result.output.findLastIndex(
    (message) => message.role === "assistant"
  );

  // get last assistant message content
  const message = result.output[lastAssistantMessage] as
    | TextMessage
    | undefined;

  // return message content if found else undefined
  return message?.content
    ? typeof message.content === "string"
      ? message.content
      : message.content.map((c) => c.text).join("")
    : undefined;
}

// util function to generate fragment title and response
export function parseAgentOutput(value: Message[], fallback: string) {
  if (!value || value.length === 0) return fallback;
  const output = value[0];
  if (output.type !== "text") return fallback;
  if (Array.isArray(output.content)) {
    return output.content.map((text) => text).join("");
  }
  return output.content;
}
