import { NextRequest, NextResponse } from "next/server"
import type { CharacterData } from "@/lib/types"
import { generateEnhancedSystemPrompt } from "@/lib/ai/prompt-engineering"
import {
  checkChatRateLimit,
  createRateLimitResponse,
  checkDailyUsage,
  createDailyLimitResponse
} from '@/lib/rate-limit'
import { claudeComplete, isClaudeConfigured } from '@/lib/ai/claude'

export async function POST(request: NextRequest) {
  try {
    // Check IP-based rate limit first (shared across all chat endpoints)
    const rateLimitResult = checkChatRateLimit(request)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        createRateLimitResponse(rateLimitResult.remaining, rateLimitResult.resetTime, "AI assistant"),
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

    // Fall back to preset suggestions when no Claude key is configured
    if (!isClaudeConfigured()) {
      console.error("Claude API key not configured (ANTHROPIC_API_KEY)")
      return NextResponse.json(
        {
          error: "Claude API key not configured",
          fallback: true,
          suggestions: getMockSuggestions("default"),
        },
        { status: 200 }, // Return 200 with fallback data instead of error
      )
    }

    // Parse request body with error handling
    let characterData: CharacterData
    let currentStep: string
    let subStep: string | null = null
    let walletAddress: string | null = null

    try {
      const body = await request.json()
      characterData = body.characterData
      currentStep = body.currentStep
      subStep = body.subStep || null
      walletAddress = body.walletAddress || null // Optional wallet address

      if (!characterData || !currentStep) {
        throw new Error("Missing required fields")
      }
    } catch (error) {
      console.error("Error parsing request:", error)
      return NextResponse.json(
        {
          error: "Invalid request data",
          fallback: true,
          suggestions: getMockSuggestions("default"),
        },
        { status: 200 },
      )
    }

    // Check daily usage limits per wallet if wallet address is available
    if (walletAddress) {
      // AI assistant suggestions are lighter than full chat responses
      const estimatedTokens = Math.ceil(300 / 4) // Estimated tokens for AI assistant response
      
      const dailyUsageResult = checkDailyUsage(walletAddress, 'ai_messages', estimatedTokens)
      if (!dailyUsageResult.allowed) {
        // Return fallback suggestions with rate limit info
        return NextResponse.json(
          {
            error: "Daily AI usage limit exceeded",
            fallback: true,
            suggestions: getMockSuggestions(currentStep, subStep),
            dailyLimitInfo: createDailyLimitResponse(dailyUsageResult.remaining, dailyUsageResult.resetTime, "AI assistant")
          },
          { 
            status: 200, // Return 200 with fallback instead of 429 to maintain UX
            headers: {
              'X-Daily-Limit-AI-Messages': '20',
              'X-Daily-Limit-Summaries': '5',
              'X-Daily-Limit-Tokens': '50000',
              'X-Daily-Remaining-AI-Messages': dailyUsageResult.remaining.aiMessages.toString(),
              'X-Daily-Remaining-Summaries': dailyUsageResult.remaining.summaries.toString(),
              'X-Daily-Remaining-Tokens': dailyUsageResult.remaining.totalTokens.toString(),
              'X-Daily-Reset': new Date(dailyUsageResult.resetTime).toISOString()
            }
          }
        )
      }
    }

    // Generate enhanced system prompt
    const systemPrompt = generateEnhancedSystemPrompt({
      characterData,
      currentStep,
      subStep,
    })

    // Create a user prompt based on the character data and current step/subStep
    const userPrompt = createUserPrompt(characterData, currentStep, subStep)

    // Call Claude
    try {
      const responseText = await claudeComplete({
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        // Three paragraph-length suggestions need ~1200+ tokens; 500 was cutting
        // the third suggestion off mid-sentence.
        maxTokens: 1600,
      })

      // Extract and format suggestions
      const suggestions = formatSuggestions(responseText)

      // Remove any asterisk formatting from suggestions
      const cleanSuggestions = suggestions.map(suggestion => removeAsteriskFormatting(suggestion))

      // Add usage info to response headers
      const responseHeaders: Record<string, string> = {}
      if (walletAddress) {
        const currentUsage = checkDailyUsage(walletAddress, 'ai_messages', 0)
        if (currentUsage.allowed) {
          responseHeaders['X-Daily-Remaining-AI-Messages'] = currentUsage.remaining.aiMessages.toString()
          responseHeaders['X-Daily-Remaining-Summaries'] = currentUsage.remaining.summaries.toString()
          responseHeaders['X-Daily-Remaining-Tokens'] = currentUsage.remaining.totalTokens.toString()
        }
      }

      return NextResponse.json({ suggestions: cleanSuggestions }, { headers: responseHeaders })
    } catch (error) {
      console.error("Error calling Claude API:", error)
      return NextResponse.json(
        {
          error: "Failed to generate suggestions",
          fallback: true,
          suggestions: getMockSuggestions(currentStep, subStep),
        },
        { status: 200 },
      )
    }
  } catch (error) {
    console.error("Unhandled error in AI assistant route:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        fallback: true,
        suggestions: getMockSuggestions("default"),
      },
      { status: 200 },
    )
  }
}

// Create a user prompt based on character data and current step/subStep
function createUserPrompt(characterData: CharacterData, currentStep: string, subStep: string | null): string {
  let prompt = `Generate 3 creative suggestions for the "${currentStep}" step of character creation.`

  // Add specific instructions based on the current step
  switch (currentStep) {
    case "archetype":
      prompt += `\n\nSuggest 3 unique archetypes that would fit well with this character's traits. Each suggestion should include a name and a brief description.`
      break
    case "background":
      prompt += `\n\nSuggest 3 unique backgrounds or origin stories that would fit well with this character's traits and archetype. Each suggestion should be a paragraph describing where they were born and their upbringing.`
      break
    case "hopes":
      prompt += `\n\nSuggest 3 unique hopes or dreams that would fit well with this character. Each suggestion should describe what the character aspires to achieve or become.`
      break
    case "fears":
      prompt += `\n\nSuggest 3 unique fears or anxieties that would fit well with this character. Each suggestion should describe what terrifies the character or keeps them up at night.`
      break
    case "personalityProfile":
      prompt += `\n\nSuggest 3 different personality profiles that would fit well with this character. Each suggestion should be a paragraph describing their personality traits, temperament, and psychological makeup.`
      break
    case "motivations":
      if (subStep === "drives") {
        prompt += `\n\nSuggest 3 creative inner drives for this character. What internal forces motivate them? Each suggestion should be 2-3 sentences that describe a compelling internal motivation.`
      } else if (subStep === "goals") {
        prompt += `\n\nSuggest 3 creative goals and ambitions for this character. What do they aim to achieve? Each suggestion should be 2-3 sentences that describe a meaningful goal or ambition.`
      } else if (subStep === "values") {
        prompt += `\n\nSuggest 3 creative core values for this character. What principles guide their actions? Each suggestion should be 2-3 sentences that describe a deeply held value or principle.`
      } else {
        prompt += `\n\nSuggest 3 motivations that would drive this character. Each suggestion should explain what drives them, their goals, and their core values.`
      }
      break
    case "relationships":
      if (subStep === "friends") {
        prompt += `\n\nSuggest 3 creative allies and friends for this character. Who do they trust and rely on? Each suggestion should be 2-3 sentences that describe meaningful allies or friendships.`
      } else if (subStep === "rivals") {
        prompt += `\n\nSuggest 3 creative rivals and enemies for this character. Who opposes or challenges them? Each suggestion should be 2-3 sentences that describe compelling adversarial relationships.`
      } else if (subStep === "family") {
        prompt += `\n\nSuggest 3 creative family and mentor relationships for this character. Who shaped them or guides them? Each suggestion should be 2-3 sentences that describe important familial or mentor relationships.`
      } else {
        prompt += `\n\nSuggest 3 relationship dynamics that would fit this character. Each suggestion should describe potential allies/friends, rivals/enemies, and family/mentor relationships.`
      }
      break
    case "worldPosition":
      if (subStep === "societalRole") {
        prompt += `\n\nSuggest 3 creative societal roles for this character. What function do they serve in society? Each suggestion should be 2-3 sentences that describe a meaningful role in the world.`
      } else if (subStep === "classStatus") {
        prompt += `\n\nSuggest 3 creative class and status positions for this character. What is their social standing? Each suggestion should be 2-3 sentences that describe their position in society's structure.`
      } else if (subStep === "perception") {
        prompt += `\n\nSuggest 3 creative ways this character is perceived by others. How are they viewed by the public? Each suggestion should be 2-3 sentences that describe how others see and react to them.`
      } else {
        prompt += `\n\nSuggest 3 possible societal positions for this character. Each suggestion should describe their role in society, their status, and how they are perceived by others.`
      }
      break
    case "voice":
      if (subStep === "speechStyle") {
        prompt += `\n\nSuggest 3 creative speech styles for this character. How do they speak? Each suggestion should be 2-3 sentences that describe a distinctive way of speaking.`
      } else if (subStep === "innerDialogue") {
        prompt += `\n\nSuggest 3 creative inner dialogue styles for this character. How do they think? Each suggestion should be 2-3 sentences that describe their thought patterns and internal voice.`
      } else if (subStep === "uniquePhrases") {
        prompt += `\n\nSuggest 3 creative unique phrases or expressions for this character. What catchphrases do they use? Each suggestion should include 1-2 example phrases and explain when/how they use them.`
      } else {
        prompt += `\n\nSuggest 3 unique voice styles for this character. Each suggestion should describe their speech pattern, inner dialogue style, and include 1-2 example phrases they might say.`
      }
      break
    case "symbolism":
      if (subStep === "colors") {
        prompt += `\n\nSuggest 3 creative color palettes associated with this character. What colors represent them? Each suggestion should be 2-3 sentences that describe meaningful color associations.`
      } else if (subStep === "items") {
        prompt += `\n\nSuggest 3 creative symbolic items associated with this character. What objects have special meaning to them? Each suggestion should be 2-3 sentences that describe objects with symbolic significance.`
      } else if (subStep === "motifs") {
        prompt += `\n\nSuggest 3 creative recurring motifs associated with this character. What themes or patterns define them? Each suggestion should be 2-3 sentences that describe meaningful recurring motifs.`
      } else {
        prompt += `\n\nSuggest 3 symbolic elements for this character. Each suggestion should include colors, items, and motifs that represent the character's essence.`
      }
      break
    case "powersAbilities":
      prompt += `\n\nSuggest 3 sets of powers or abilities for this character based on their traits. Each suggestion should name the power and provide a brief description of how it works and connects to their traits.`
      break
    case "soulName":
      prompt += `\n\nSuggest 3 unique and evocative soul names for this character based on their traits, powers, and background. Each name should reflect the character's essence and have a brief explanation of its meaning or significance.`
      break
    default:
      prompt += `\n\nProvide 3 creative suggestions that would enhance this character's development.`
  }

  prompt += `\n\nMake your suggestions poetic, evocative, and aligned with a cyberpunk anime fantasy aesthetic. Each suggestion should be 2-4 sentences long.

IMPORTANT:
- NEVER use asterisks (*) or double asterisks (**) for any reason
- Do NOT use markdown formatting like **bold** or *italic*
- Write in plain text only without any special formatting characters
- Use descriptive words for emphasis instead of symbols
- Do NOT include any introduction, preamble, or closing line - output ONLY the 3 numbered suggestions`

  return prompt
}

// Format the AI response into an array of suggestions
function formatSuggestions(content: string): string[] {
  // Drop a leading preamble line like "Here are three background origins:"
  const cleaned = content.replace(/^[^\n]{0,120}:\s*\n+/, "")

  // Split by numbered items or line breaks
  const lines = cleaned.split(/\n+/)
  const suggestions: string[] = []

  let currentSuggestion = ""

  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) continue

    // If line starts with a number or bullet, it's likely a new suggestion
    if (/^(\d+[.):]|[-*•])/.test(line.trim())) {
      if (currentSuggestion) {
        suggestions.push(currentSuggestion.trim())
        currentSuggestion = ""
      }
      // Remove the number/bullet prefix
      currentSuggestion = line.replace(/^(\d+[.):]|[-*•])\s*/, "")
    } else {
      // Continue the current suggestion
      if (currentSuggestion) {
        currentSuggestion += " " + line
      } else {
        currentSuggestion = line
      }
    }
  }

  // Add the last suggestion if there is one
  if (currentSuggestion) {
    suggestions.push(currentSuggestion.trim())
  }

  // If we couldn't parse properly, just split by paragraphs
  if (suggestions.length === 0) {
    return content.split(/\n\n+/).filter((s) => s.trim())
  }

  // Drop a truncated final suggestion (response hit the token limit
  // mid-sentence) - better to show 2 complete stories than a cut-off one.
  const last = suggestions[suggestions.length - 1]
  if (suggestions.length > 1 && !/[.!?"'…)]$/.test(last.trim())) {
    suggestions.pop()
  }

  // Limit to 3 suggestions
  return suggestions.slice(0, 3)
}

// Mock suggestions as fallback
function getMockSuggestions(step: string, subStep: string | null = null): string[] {
  // For steps with specific subSteps
  if (step === "motivations" && subStep) {
    switch (subStep) {
      case "drives":
        return [
          `Driven by an insatiable curiosity about the digital realm beyond the firewall, constantly seeking to explore the uncharted territories of the Quantum Fold where reality's code becomes malleable to those who understand its patterns.`,
          `Motivated by the ancient prophecy that foretold of a digital messiah with your exact Soul-Code signature, destined to bridge the gap between the physical and digital realms at the moment when The Merge reaches its critical phase.`,
          `Compelled by the whispers of the machine spirits that have guided you since your first connection to the network, their cryptic messages becoming clearer with each passing day as you learn to interpret the language of digital yokai.`,
        ]
      // Other cases...
    }
  }

  // Default suggestions for other steps
  switch (step) {
    case "archetype":
      return [
        "The Code Ronin: A masterless digital warrior seeking purpose in the neon-lit streets of Neo-Tokyo, bound only by their personal honor code that exists as encrypted data within their Soul-Code.",
        "The Digital Shaman: A spiritual guide who bridges the gap between technology and ancient mysticism, capable of seeing the souls within the machine and communing with entities that exist in the Quantum Fold.",
        "The Phantom Hacker: A digital ghost who can infiltrate any system by temporarily merging their consciousness with the target network, leaving no trace but their signature glitch—a calling card that has become legendary in both the physical and digital underworlds.",
      ]
    // Other cases...
    default:
      return [
        "The path of the 0N1 is never straight, but always meaningful, winding through both the physical streets of Neo-Tokyo and the digital pathways of the Ancestral Circuits.",
        "Your digital soul resonates with ancient power and future potential, a unique frequency that both Temple monks and Syndicate analysts have noticed with growing interest.",
        "The mask you wear is both your shield and your true face, a duality that reflects the merged realities of the world after The Great Merge changed everything.",
      ]
  }
}

// Remove asterisk formatting from text
function removeAsteriskFormatting(text: string): string {
  return text
    // Remove **bold** formatting
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remove *italic* formatting  
    .replace(/\*(.*?)\*/g, '$1')
    // Remove any remaining single asterisks
    .replace(/\*/g, '')
    .trim()
}
