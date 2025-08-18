import { AgentResult, TextMessage } from "@inngest/agent-kit";

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
