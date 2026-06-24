export interface LLMProvider {
  chat(messages: { role: string; content: string }[]): Promise<string>
}

export interface ParsedCommand {
  action: "create_task" | "create_note" | "create_event" | "none"
  data: Record<string, unknown>
}
