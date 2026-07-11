// Shared Llama client for all character chat (uncensored, personality-true).
// Creation/lore work stays on Claude. Talks to any OpenAI-compatible host
// (OpenRouter by default) so the provider can be swapped via env alone:
//   LLAMA_API_KEY (or OPENROUTER_API_KEY) - required
//   LLAMA_BASE_URL  - optional, defaults to OpenRouter
//   LLAMA_MODEL     - optional, defaults to Llama 3.3 70B Instruct
import OpenAI from "openai"

export const LLAMA_MODEL = process.env.LLAMA_MODEL || "meta-llama/llama-3.3-70b-instruct"

const baseURL = process.env.LLAMA_BASE_URL || "https://openrouter.ai/api/v1"
const apiKey = process.env.LLAMA_API_KEY || process.env.OPENROUTER_API_KEY

const client = apiKey
  ? new OpenAI({
      apiKey,
      baseURL,
      // OpenRouter attribution headers (ignored by other hosts)
      defaultHeaders: baseURL.includes("openrouter.ai")
        ? {
            "HTTP-Referer": "https://github.com/solfinnai/0n1-lore-crafter-v2026",
            "X-Title": "0N1 Lore Crafter",
          }
        : undefined,
    })
  : null

export function isLlamaConfigured(): boolean {
  return client !== null
}

export interface LlamaChatOptions {
  system: string
  messages: Array<{ role: "user" | "assistant"; content: string }>
  maxTokens?: number
  temperature?: number
  topP?: number
  presencePenalty?: number
  frequencyPenalty?: number
}

// Unlike Claude, Llama honors sampling params - extreme personalities pass
// higher temperature/penalties computed by the chat route.
export async function llamaComplete({
  system,
  messages,
  maxTokens = 1024,
  temperature,
  topP,
  presencePenalty,
  frequencyPenalty,
}: LlamaChatOptions): Promise<string> {
  if (!client) {
    throw new Error("Llama is not configured. Set LLAMA_API_KEY in .env.local.")
  }

  try {
    const response = await client.chat.completions.create({
      model: LLAMA_MODEL,
      max_tokens: maxTokens,
      messages: [{ role: "system" as const, content: system }, ...messages],
      ...(temperature !== undefined && { temperature }),
      ...(topP !== undefined && { top_p: topP }),
      ...(presencePenalty !== undefined && { presence_penalty: presencePenalty }),
      ...(frequencyPenalty !== undefined && { frequency_penalty: frequencyPenalty }),
    })

    return response.choices[0]?.message?.content || "I'm having trouble responding right now."
  } catch (error) {
    if (error instanceof OpenAI.AuthenticationError) {
      throw new Error("Llama API key authentication failed. Check LLAMA_API_KEY in .env.local.")
    }
    if (error instanceof OpenAI.RateLimitError) {
      throw new Error("Llama rate limit exceeded. Please wait a moment and try again.")
    }
    if (error instanceof OpenAI.APIError) {
      throw new Error(`Llama API error (${error.status}): ${error.message}`)
    }
    throw error
  }
}
