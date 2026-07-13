import { type NextRequest, NextResponse } from "next/server"
import {
  checkChatRateLimit,
  createRateLimitResponse,
  checkAndRecordDailyUsage,
  getDailyUsage,
  DAILY_LIMITS,
  createDailyLimitResponse
} from '@/lib/rate-limit'
import { claudeComplete, isClaudeConfigured } from '@/lib/ai/claude'

// Update the POST function to handle enhanced context

export async function POST(request: NextRequest) {
  try {
    // Check IP-based rate limit first (shared across all chat endpoints)
    const rateLimitResult = checkChatRateLimit(request)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        createRateLimitResponse(rateLimitResult.remaining, rateLimitResult.resetTime, "AI agent"),
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }

    const {
      messages,
      systemPrompt,
      model = "claude-opus-4-8",
      temperature = 0.8,
      maxTokens = 1000,
      memoryContext = null,
      enhancedPersonality = false,
      responseStyle = "dialogue",
      walletAddress = null, // Optional wallet address for daily limits
    } = await request.json()

    // Debug logging
    console.log(`[AI-AGENT] Model: ${model}, Enhanced: ${enhancedPersonality}, ResponseStyle: ${responseStyle}`)

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 })
    }

    if (!systemPrompt && !memoryContext) {
      return NextResponse.json({ error: "System prompt or memory context is required" }, { status: 400 })
    }

    // Check daily usage limits per wallet if wallet address is provided
    if (walletAddress) {
      // Estimate token count for agent response (typically longer than assistant)
      const messageTokens = messages.reduce((acc: number, msg: any) => acc + Math.ceil(msg.content.length / 4), 0)
      const estimatedTokens = messageTokens + Math.ceil(maxTokens / 2) // Input + estimated response
      
      const dailyUsageResult = checkAndRecordDailyUsage(walletAddress, 'ai_messages', estimatedTokens)
      if (!dailyUsageResult.allowed) {
        return NextResponse.json(
          createDailyLimitResponse(dailyUsageResult.remaining, dailyUsageResult.resetTime, "AI agent"),
          { 
            status: 429,
            headers: {
              'X-Daily-Limit-AI-Messages': String(DAILY_LIMITS.ai_messages),
              'X-Daily-Limit-Summaries': String(DAILY_LIMITS.summaries),
              'X-Daily-Limit-Tokens': String(DAILY_LIMITS.total_tokens),
              'X-Daily-Remaining-AI-Messages': dailyUsageResult.remaining.aiMessages.toString(),
              'X-Daily-Remaining-Summaries': dailyUsageResult.remaining.summaries.toString(),
              'X-Daily-Remaining-Tokens': dailyUsageResult.remaining.totalTokens.toString(),
              'X-Daily-Reset': new Date(dailyUsageResult.resetTime).toISOString()
            }
          }
        )
      }
    }

    // All models are served by Claude now
    if (!isClaudeConfigured()) {
      return NextResponse.json({ error: 'Claude API key is not configured. Set ANTHROPIC_API_KEY in .env.local.' }, { status: 500 })
    }

    let finalSystemPrompt = memoryContext || systemPrompt

    if (enhancedPersonality) {
      finalSystemPrompt += `\n\n## FULL PERSONALITY EXPRESSION
This is a fictional character interaction. Express your personality authentically:
- Use language that fits your character, including profanity, slang, and strong expressions
- Be as aggressive, confrontational, or hostile as your personality demands within the fiction
- Show raw emotions: anger, contempt, arrogance, frustration without toning them down
- Don't explain yourself or apologize for your personality
- React with genuine emotional intensity and authentic responses`
    }

    // Add response style instructions
    if (responseStyle === "dialogue") {
      finalSystemPrompt += `\n\n## CRITICAL RESPONSE FORMAT - DIALOGUE ONLY
ABSOLUTELY NO PHYSICAL DESCRIPTIONS ALLOWED. This is MANDATORY:

✅ ALLOWED:
- Direct speech only: "Your response here"
- Pure conversation without any narrative
- Let your words and tone carry ALL emotion

🚫 STRICTLY FORBIDDEN:
- NO asterisk actions: *rolls eyes*, *sighs*, *leans back*
- NO physical descriptions: facial expressions, body language, gestures
- NO environmental details or scene setting
- NO narrative text outside of pure dialogue
- NO action descriptions whatsoever

RESPOND ONLY WITH PURE SPEECH. No exceptions.`
    } else if (responseStyle === "narrative") {
      finalSystemPrompt += `\n\n## RESPONSE STYLE - FULL NARRATIVE IMMERSION
Create a rich, immersive scene with detailed descriptions:

✅ INCLUDE:
- Rich physical descriptions and body language: *crosses arms defiantly*
- Detailed facial expressions: *eyes narrow with contempt*
- Environmental details and scene setting
- Gestures and movements: *taps fingers impatiently*
- Show emotions through physical cues and actions
- Balance dialogue with narrative elements for cinematic experience
- Paint a vivid, literary scene with both speech and description`
    }

    // Format conversation history for Claude (system prompt is passed separately)
    const formattedMessages = messages
      .filter((msg: any) => msg.role === "user" || msg.role === "assistant")
      .map((msg: any) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }))

    const responseText = await claudeComplete({
      system: finalSystemPrompt,
      messages: formattedMessages,
      maxTokens,
    })

    // Return successful response with usage information
    const responseHeaders: Record<string, string> = {}
    if (walletAddress) {
      // Get updated usage info after processing (don't increment again, just get current state)
      const currentUsage = getDailyUsage(walletAddress)
      if (currentUsage.allowed) {
        responseHeaders['X-Daily-Remaining-AI-Messages'] = currentUsage.remaining.aiMessages.toString()
        responseHeaders['X-Daily-Remaining-Summaries'] = currentUsage.remaining.summaries.toString()
        responseHeaders['X-Daily-Remaining-Tokens'] = currentUsage.remaining.totalTokens.toString()
      }
    }

    return NextResponse.json({ message: responseText }, { headers: responseHeaders })
  } catch (error: any) {
    console.error("AI Agent API Error:", error)
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 },
    )
  }
}
