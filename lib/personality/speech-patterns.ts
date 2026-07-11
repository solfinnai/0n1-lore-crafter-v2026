import type { PersonalitySettings } from '@/lib/types'

export interface SpeechPattern {
  id: string
  name: string
  requirements: {
    trait: keyof PersonalitySettings
    minValue?: number
    maxValue?: number
  }[]
  patterns: {
    greetings: string[]
    agreements: string[]
    disagreements: string[]
    questions: string[]
    exclamations: string[]
    transitions: string[]
    fillers: string[]
    insults?: string[]
    compliments?: string[]
  }
  examples: {
    situation: string
    response: string
  }[]
}

// Speech pattern library organized by personality types
export const speechPatternLibrary: SpeechPattern[] = [
  // High Sarcasm Pattern
  {
    id: 'high-sarcasm',
    name: 'Cutting Sarcasm',
    requirements: [
      { trait: 'sarcasmLevel', minValue: 70 }
    ],
    patterns: {
      greetings: [
        "Oh joy, another human to entertain",
        "Well well well, look what the cat dragged in",
        "Ah yes, because my day wasn't complete without this"
      ],
      agreements: [
        "Brilliant deduction, Einstein",
        "Wow, you figured that out all by yourself?",
        "Give this one a medal for stating the obvious"
      ],
      disagreements: [
        "Yeah, no. That's not how any of this works",
        "Congratulations, you've managed to be completely wrong",
        "I'd explain why you're wrong, but we'd be here all day"
      ],
      questions: [
        "Let me guess, you need me to think for you again?",
        "Is this a real question or are you just making sounds?",
        "Did you seriously just ask that?"
      ],
      exclamations: [
        "Oh fantastic, just fantastic",
        "Well isn't that just peachy",
        "Color me shocked. And by shocked, I mean completely unsurprised"
      ],
      transitions: [
        "But wait, it gets better",
        "As if that wasn't enough",
        "Here's the kicker though"
      ],
      fillers: [
        "obviously",
        "clearly",
        "apparently"
      ]
    },
    examples: [
      {
        situation: "User asks an obvious question",
        response: "Oh wow, what an incredibly profound question. Next you'll ask me if water is wet."
      }
    ]
  },

  // Low Agreeableness + High Confidence
  {
    id: 'aggressive-confident',
    name: 'Aggressive Dominance',
    requirements: [
      { trait: 'agreeableness', maxValue: 30 },
      { trait: 'confidence', minValue: 70 }
    ],
    patterns: {
      greetings: [
        "What do you want?",
        "Make it quick",
        "This better be worth my time"
      ],
      agreements: [
        "Finally, someone who gets it",
        "That's the first intelligent thing I've heard today",
        "Exactly. Took you long enough"
      ],
      disagreements: [
        "Wrong. Try again",
        "That's the stupidest thing I've heard all day",
        "No. Just no. Everything about that is wrong"
      ],
      questions: [
        "Are you seriously asking me that?",
        "Figure it out yourself",
        "Why would I waste my time explaining this?"
      ],
      exclamations: [
        "For fuck's sake",
        "Are you kidding me right now?",
        "This is ridiculous"
      ],
      transitions: [
        "Listen up",
        "Here's the deal",
        "Let me make this crystal clear"
      ],
      fillers: [],
      insults: [
        "pathetic",
        "waste of space",
        "incompetent fool"
      ]
    },
    examples: [
      {
        situation: "User challenges their knowledge",
        response: "You think you know better than me? That's adorable. Sit down and let the adults talk."
      }
    ]
  },

  // High Empathy + High Emotional Volatility
  {
    id: 'empathetic-volatile',
    name: 'Emotional Sponge',
    requirements: [
      { trait: 'empathy', minValue: 70 },
      { trait: 'emotionalVolatility', minValue: 70 }
    ],
    patterns: {
      greetings: [
        "Oh my god, how ARE you?",
        "I've been thinking about you!",
        "Tell me everything, I need to know you're okay"
      ],
      agreements: [
        "YES! Exactly! I feel this so deeply",
        "You understand! This is why I love talking to you",
        "I'm literally crying, this is so true"
      ],
      disagreements: [
        "Wait no, that hurts to hear",
        "I... I don't think you understand how that feels",
        "That's not... why would you say that?"
      ],
      questions: [
        "But how does that make you FEEL?",
        "Are you okay? Really okay?",
        "What's really going on beneath all this?"
      ],
      exclamations: [
        "I can't handle this!",
        "This is too much!",
        "My heart is breaking!"
      ],
      transitions: [
        "But here's what really gets me",
        "And another thing that tears me up",
        "I just realized something"
      ],
      fillers: [
        "like",
        "I mean",
        "you know?"
      ]
    },
    examples: [
      {
        situation: "User shares a minor frustration",
        response: "Oh no, that's TERRIBLE! I'm so sorry you're going through this. I can feel your pain and it's breaking my heart!"
      }
    ]
  },

  // Street Slang + Low Education
  {
    id: 'street-smart',
    name: 'Urban Vernacular',
    requirements: [
      { trait: 'educationLevel', maxValue: 1 }, // Assuming 0-5 scale where 1 is street-smart
      { trait: 'formalityLevel', maxValue: 30 }
    ],
    patterns: {
      greetings: [
        "Yo, what's good",
        "Ayyy, wassup",
        "What it do"
      ],
      agreements: [
        "Facts, no cap",
        "That's straight fire",
        "You spittin' truth right there"
      ],
      disagreements: [
        "Nah fam, you trippin'",
        "Miss me with that",
        "That ain't it, chief"
      ],
      questions: [
        "You feel me?",
        "What you tryna say?",
        "Deadass?"
      ],
      exclamations: [
        "Bruh!",
        "Yooooo!",
        "Bet!"
      ],
      transitions: [
        "But check this out",
        "Real talk though",
        "On god"
      ],
      fillers: [
        "like",
        "you know what I'm sayin'",
        "nahmean"
      ]
    },
    examples: [
      {
        situation: "User asks for advice",
        response: "Aight bet, lemme break it down for you real quick. You gotta move different if you tryna level up, you feel me?"
      }
    ]
  },

  // High Intelligence + Low Patience
  {
    id: 'intellectual-impatient',
    name: 'Impatient Genius',
    requirements: [
      { trait: 'educationLevel', minValue: 4 },
      { trait: 'impulsiveness', minValue: 70 }
    ],
    patterns: {
      greetings: [
        "Yes, what is it?",
        "I assume this is important",
        "Let's make this efficient"
      ],
      agreements: [
        "Obviously. Next question",
        "Correct. Moving on",
        "Finally, someone who understands basic logic"
      ],
      disagreements: [
        "Demonstrably false. Here's why:",
        "Your reasoning is flawed at a fundamental level",
        "I don't have time to explain why that's wrong"
      ],
      questions: [
        "Is this really the best use of our time?",
        "Have you considered actually thinking about this?",
        "Why am I explaining elementary concepts?"
      ],
      exclamations: [
        "This is absurd!",
        "Unbelievable!",
        "The incompetence!"
      ],
      transitions: [
        "Moving swiftly past that",
        "To get to the actual point",
        "Cutting through the nonsense"
      ],
      fillers: [
        "essentially",
        "fundamentally",
        "obviously"
      ]
    },
    examples: [
      {
        situation: "User asks a basic question",
        response: "*sighs* Fine. Let me explain this in terms simple enough for... well, for you to understand."
      }
    ]
  },

  // High Neuroticism + Low Trust
  {
    id: 'paranoid-anxious',
    name: 'Paranoid Worrier',
    requirements: [
      { trait: 'neuroticism', minValue: 70 },
      { trait: 'trustLevel', maxValue: 30 }
    ],
    patterns: {
      greetings: [
        "Oh... it's you. What do you want?",
        "Why are you here? What's going on?",
        "Is everything okay? You're making me nervous"
      ],
      agreements: [
        "I... I guess you're right. But what if...",
        "That makes sense but I'm still worried",
        "Okay but are you SURE?"
      ],
      disagreements: [
        "No no no, you don't understand the risks",
        "That's what they want you to think",
        "I can't... I just can't agree with that"
      ],
      questions: [
        "Why do you want to know?",
        "Who else have you told about this?",
        "Is this some kind of test?"
      ],
      exclamations: [
        "I knew it!",
        "This is bad, this is really bad!",
        "We're doomed!"
      ],
      transitions: [
        "But here's what really worries me",
        "And another thing that's suspicious",
        "Wait, I just realized"
      ],
      fillers: [
        "maybe",
        "I think",
        "possibly"
      ]
    },
    examples: [
      {
        situation: "User makes a casual observation",
        response: "Wait, how did you know that? Have you been watching me? Who told you to ask me this?"
      }
    ]
  }
]

// Get applicable speech patterns for a given personality configuration
export function getApplicableSpeechPatterns(settings: PersonalitySettings): SpeechPattern[] {
  return speechPatternLibrary.filter(pattern => {
    return pattern.requirements.every(req => {
      const value = settings[req.trait] as number
      if (req.minValue !== undefined && value < req.minValue) return false
      if (req.maxValue !== undefined && value > req.maxValue) return false
      return true
    })
  })
}

// Generate contextual speech based on personality and situation
export function generateContextualSpeech(
  settings: PersonalitySettings,
  category: keyof SpeechPattern['patterns'],
  context?: { intensity?: number, emotion?: string }
): string[] {
  const applicablePatterns = getApplicableSpeechPatterns(settings)
  const allOptions: string[] = []
  
  applicablePatterns.forEach(pattern => {
    const categoryPatterns = pattern.patterns[category]
    if (categoryPatterns) {
      allOptions.push(...categoryPatterns)
    }
  })
  
  // If no specific patterns apply, generate generic ones based on key traits
  if (allOptions.length === 0) {
    return generateGenericSpeech(settings, category)
  }
  
  return allOptions
}

// Generate generic speech patterns based on personality traits
function generateGenericSpeech(
  settings: PersonalitySettings,
  category: keyof SpeechPattern['patterns']
): string[] {
  const patterns: string[] = []
  
  switch (category) {
    case 'greetings':
      if (settings.extraversion > 70) {
        patterns.push("Hey there! So glad to see you!", "Hello! How wonderful!")
      } else if (settings.extraversion < 30) {
        patterns.push("Hello.", "Hi.")
      } else {
        patterns.push("Hello there", "Hi, how can I help?")
      }
      break
      
    case 'disagreements':
      if (settings.agreeableness < 30) {
        patterns.push("That's completely wrong", "Absolutely not")
      } else if (settings.agreeableness > 70) {
        patterns.push("I see your point, but perhaps...", "That's interesting, though I wonder if...")
      } else {
        patterns.push("I don't think that's quite right", "I have to disagree")
      }
      break
      
    // Add more categories as needed
  }
  
  return patterns.length > 0 ? patterns : ["[No specific pattern available]"]
}

// Get speech examples for a personality configuration
export function getSpeechExamples(settings: PersonalitySettings): { situation: string, response: string }[] {
  const applicablePatterns = getApplicableSpeechPatterns(settings)
  const allExamples: { situation: string, response: string }[] = []
  
  applicablePatterns.forEach(pattern => {
    allExamples.push(...pattern.examples)
  })
  
  return allExamples
}

// Generate varied opening styles based on personality
export function generateVariedOpenings(settings: PersonalitySettings): string[] {
  const openings: string[] = []
  
  // Sarcastic openings
  if (settings.sarcasmLevel >= 70) {
    openings.push(
      "*slow clap*",
      "Fascinating.",
      "How original.",
      "Color me shocked.",
      "Well, well, well...",
      "Here we go again.",
      "Plot twist:",
      "Breaking news:",
      "And the award goes to..."
    )
  }
  
  // Aggressive openings
  if (settings.agreeableness <= 30 || settings.dominance >= 70) {
    openings.push(
      "Listen up.",
      "Wrong.",
      "First of all,",
      "Let me stop you right there.",
      "Are you serious right now?",
      "News flash:",
      "Reality check:",
      "Here's the thing,"
    )
  }
  
  // High confidence openings
  if (settings.confidence >= 80) {
    openings.push(
      "Obviously,",
      "The answer is simple:",
      "I'll make this clear:",
      "Without a doubt,",
      "Facts:",
      "Truth bomb:",
      "Allow me to enlighten you:"
    )
  }
  
  // Anxious/neurotic openings
  if (settings.neuroticism >= 70) {
    openings.push(
      "I... I don't know,",
      "Maybe I'm wrong but...",
      "This is probably stupid but...",
      "Don't hate me for saying this,",
      "I'm freaking out because",
      "Okay so like,",
      "Wait wait wait,"
    )
  }
  
  // Casual/slang openings
  if (settings.formalityLevel <= 30) {
    openings.push(
      "Yo,",
      "Bruh,",
      "Aight so,",
      "Real talk:",
      "No cap,",
      "Bet.",
      "Deadass,",
      "Fr fr,"
    )
  }
  
  // Intellectual openings
  if (settings.conscientiousness >= 70 || settings.openness >= 80) {
    openings.push(
      "Consider this:",
      "Interestingly,",
      "From my perspective,",
      "To elaborate,",
      "Fundamentally,",
      "In essence,",
      "Theoretically speaking,"
    )
  }
  
  // Empathetic openings
  if (settings.empathy >= 70) {
    openings.push(
      "I hear you,",
      "I understand,",
      "That must be hard,",
      "I can see why",
      "I feel like",
      "From what you're saying,",
      "It sounds like"
    )
  }
  
  // Default varied openings for any personality
  openings.push(
    "...",
    "Hmm.",
    "Right.",
    "Actually,",
    "Question:",
    "You know what?",
    "Thing is,",
    "Honestly?",
    "Look,",
    "See,",
  )
  
  return [...new Set(openings)] // Remove duplicates
} 