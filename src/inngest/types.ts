export interface AgentState {
  sandboxId: string;
  summary: string;
  files: { [path: string]: string };
}
