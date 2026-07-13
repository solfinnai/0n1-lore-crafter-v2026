import { NextRequest, NextResponse } from "next/server"
import type { CharacterData } from "@/lib/types"
import type { CharacterMemoryProfile } from "@/lib/memory-types"
import {
  checkChatRateLimit,
  createRateLimitResponse,
  checkAndRecordDailyUsage,
  getDailyUsage,
  DAILY_LIMITS,
  createDailyLimitResponse,
  resolveUsageKey,
  estimateTokensFromText,
  MAX_AI_REQUEST_CHARS,
} from '@/lib/rate-limit'
import { claudeComplete, isClaudeConfigured } from '@/lib/ai/claude'
import { buildSharedCanonContext } from '@/lib/ai/shared-canon-context'
import { getRequestUser } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    // Check IP-based rate limit first (shared across all chat endpoints)
    const rateLimitResult = checkChatRateLimit(request)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        createRateLimitResponse(rateLimitResult.remaining, rateLimitResult.resetTime, "summary generation"),
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

    if (!isClaudeConfigured()) {
      return NextResponse.json({ error: "Claude API key is not configured. Set ANTHROPIC_API_KEY in .env.local." }, { status: 500 })
    }

    const { 
      characterData, 
      memoryProfile, 
      walletAddress 
    }: { 
      characterData: CharacterData
      memoryProfile?: CharacterMemoryProfile 
      walletAddress?: string
    } = await request.json()

    if (!characterData) {
      return NextResponse.json({ error: "Character data is required" }, { status: 400 })
    }

    // Reject oversized request bodies before doing any paid work.
    const requestChars =
      JSON.stringify(characterData).length +
      (memoryProfile ? JSON.stringify(memoryProfile).length : 0)
    if (requestChars > MAX_AI_REQUEST_CHARS) {
      return NextResponse.json({ error: "Request too large" }, { status: 400 })
    }

    // Resolve the daily-usage identity. A valid Supabase session takes precedence
    // (the user's id is the bucket key, so limits follow the account, not a
    // self-asserted wallet); logged-out owners bucket by wallet; anonymous
    // callers fall back to a trusted-IP bucket so they are STILL metered.
    const auth = await getRequestUser(request)
    const usageKey = resolveUsageKey(request, auth?.user.id, walletAddress)

    // Build context for the summary — classified traits, not raw dump
    let contextText = `Character: ${characterData.soulName} (0N1 Force #${characterData.pfpId})
Archetype: ${characterData.archetype}
Background: ${characterData.background}
${buildSharedCanonContext(characterData, { concisePowers: true, includeWorld: true })}
`

    if (memoryProfile) {
      const { overview, characterEvolution, contextNotes } = memoryProfile
      
      contextText += `
Relationship Level: ${overview.relationshipLevel}
Total Interactions: ${overview.totalInteractions}
Key Milestones: ${overview.keyMilestones.map(m => m.title).join(', ')}
Acquired Traits: ${characterEvolution.newTraits.map(t => t.traitName).join(', ')}
Personality Changes: ${characterEvolution.personalityChanges.map(c => `${c.aspect}: ${c.newValue}`).join(', ')}
Important Relationships: ${characterEvolution.relationships.map(r => `${r.name} (${r.relationshipType})`).join(', ')}
Active Plot Hooks: ${contextNotes.plotHooks.filter(p => p.status === 'active').map(p => p.title).join(', ')}
Recent Session Notes: ${contextNotes.sessionNotes.slice(-3).map(n => n.title).join(', ')}
`
    }

    const prompt = `Based on the following character information, write a compelling 100-word summary that captures their current story, personality, and development. Focus on their essence, key relationships, ongoing storylines, and what makes them unique. Write it as a character dossier entry that someone could read to quickly understand who this character is and where they are in their journey.

Character Information:
${contextText}

Write exactly 100 words or less. Make it engaging and narrative-focused.`

    const summarySystemPrompt =
      "You are a skilled storyteller and character analyst for the 0N1 Force Enclave canon. Write compelling, concise character summaries. Never invent masks for Face: Void, never treat Background colors as lineages, never use Neo-Tokyo / Great Merge / Soul-Code lore, and never invent powers outside the provided kit."

    // Meter the daily cap AFTER assembling the prompt, charging tokens estimated
    // from the ACTUAL assembled text. Summary generation counts as a 'summary'.
    const dailyUsageResult = checkAndRecordDailyUsage(
      usageKey,
      'summaries',
      estimateTokensFromText(summarySystemPrompt, prompt),
    )
    if (!dailyUsageResult.allowed) {
      return NextResponse.json(
        createDailyLimitResponse(dailyUsageResult.remaining, dailyUsageResult.resetTime, "summary generation"),
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

    const summary = (await claudeComplete({
      system: summarySystemPrompt,
      messages: [{ role: "user", content: prompt }],
      maxTokens: 150,
    })).trim()

    if (!summary) {
      return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
    }

    // Return successful response with usage information
    const responseHeaders: Record<string, string> = {}
    if (usageKey) {
      // Get updated usage info after processing (don't increment again, just get current state)
      const currentUsage = getDailyUsage(usageKey)
      if (currentUsage.allowed) {
        responseHeaders['X-Daily-Remaining-AI-Messages'] = currentUsage.remaining.aiMessages.toString()
        responseHeaders['X-Daily-Remaining-Summaries'] = currentUsage.remaining.summaries.toString()
        responseHeaders['X-Daily-Remaining-Tokens'] = currentUsage.remaining.totalTokens.toString()
      }
    }

    return NextResponse.json({ summary }, { headers: responseHeaders })
  } catch (error) {
    console.error("Error generating summary:", error)
    return NextResponse.json(
      { error: "Failed to generate character summary" },
      { status: 500 }
    )
  }
} 