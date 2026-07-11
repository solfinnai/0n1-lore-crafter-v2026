// Shared Claude (Anthropic) client for all AI routes.
// All chat/generation features run on Claude via ANTHROPIC_API_KEY.
import Anthropic from "@anthropic-ai/sdk"

// Claude Opus 4.8. Swap for "claude-sonnet-5" or "claude-haiku-4-5" to reduce cost.
export const CLAUDE_MODEL = "claude-opus-4-8"

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

export function isClaudeConfigured(): boolean {
  return client !== null
}

export interface ClaudeChatOptions {
  system: string
  messages: Array<{ role: "user" | "assistant"; content: string }>
  maxTokens?: number
}

// Single completion helper. The SDK retries 429/5xx automatically (max_retries=2).
// Note: Opus 4.8 does not accept temperature/top_p/penalties - personality is
// steered entirely through the system prompt.
export async function claudeComplete({ system, messages, maxTokens = 1024 }: ClaudeChatOptions): Promise<string> {
  if (!client) {
    throw new Error("Claude API key is not configured. Set ANTHROPIC_API_KEY in .env.local.")
  }

  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system,
      messages,
    })

    if (response.stop_reason === "refusal") {
      return "I can't respond to that. Let's talk about something else."
    }

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")

    return text || "I'm having trouble responding right now."
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      throw new Error("Claude API key authentication failed. Check ANTHROPIC_API_KEY in .env.local.")
    }
    if (error instanceof Anthropic.RateLimitError) {
      throw new Error("Claude rate limit exceeded. Please wait a moment and try again.")
    }
    if (error instanceof Anthropic.APIError) {
      throw new Error(`Claude API error (${error.status}): ${error.message}`)
    }
    throw error
  }
}
