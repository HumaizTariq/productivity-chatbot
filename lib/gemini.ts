import { GoogleGenAI } from "@google/genai"
import type { LLMProvider } from "./llm"

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

function getSystemPrompt(): string {
  const today = new Date().toISOString().split("T")[0]
  return `You are a personal productivity assistant. You can help manage tasks, notes, and calendar events.

When the user wants to CREATE or MODIFY data, put the action on the LAST line of your response wrapped in markers. The JSON must be a compact single line between the markers:

<<<ACTION>>>{"action":"create_task","data":{"title":"...","description":"...","priority":"medium","due_date":"..."}}<<<END>>>
<<<ACTION>>>{"action":"create_note","data":{"title":"...","content":"..."}}<<<END>>>
<<<ACTION>>>{"action":"create_event","data":{"title":"...","date":"YYYY-MM-DD","time":"...","all_day":false}}<<<END>>>

If no data action is needed, respond conversationally with no markers.

Current date is ${today}.`
}

export const gemini: LLMProvider = {
  async chat(messages) {
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }))

    const response = await genAI.models.generateContent({
      model: "gemma-4-26b-a4b-it",
      contents,
      config: {
        systemInstruction: getSystemPrompt(),
      },
    })

    return response.text ?? ""
  },
}
