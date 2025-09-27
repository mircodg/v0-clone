export interface AgentState {
  sandboxId: string;
  summary: string;
  files: { [path: string]: string };
}

export const SANDBOX_TIMEOUT = 60_000 * 10 * 3; // 30 minutes in milliseconds
