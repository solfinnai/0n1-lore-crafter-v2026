"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, Send, RefreshCw, AlertCircle, Copy } from "lucide-react"
import type { CharacterData } from "@/lib/types"
import { toast } from "sonner"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface AiChatProps {
  characterData: CharacterData
  currentStep: string
  subStep?: string | null
}

export function AiChat({ characterData, currentStep, subStep = null }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isCollapsed, setIsCollapsed] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Add initial greeting message when component mounts or step changes
  useEffect(() => {
    const getInitialMessage = () => {
      switch (currentStep) {
        case "background":
          return "Hi there! I can help you craft your character's background story. What kind of origin are you thinking about? Feel free to ask for ideas or guidance."
        case "hopes":
          return "Let's explore your character's hopes and dreams. What aspirations do you envision for them? I can help brainstorm ideas that fit their traits and archetype."
        case "fears":
          return "What keeps your character up at night? I can help you develop compelling fears and anxieties that add depth to your character. Just ask!"
        case "personalityProfile":
          return "Ready to define your character's personality? I can suggest traits, temperaments, and psychological aspects that would create a compelling character."
        case "motivations":
          return subStep
            ? `Let's focus on your character's ${subStep === "drives" ? "inner drives" : subStep === "goals" ? "goals and ambitions" : "core values"}. What motivates them in this area?`
            : "What drives your character forward? I can help you explore their motivations, goals, and values. Just ask!"
        case "relationships":
          return subStep
            ? `Let's develop your character's ${subStep === "friends" ? "allies and friends" : subStep === "rivals" ? "rivals and enemies" : "family and mentors"}. Who are the important people in their life?`
            : "Who are the important people in your character's life? Let's discuss their relationships and connections."
        case "worldPosition":
          return subStep
            ? `Let's define your character's ${subStep === "societalRole" ? "role in society" : subStep === "classStatus" ? "class and status" : "public perception"}. How do they fit into the world?`
            : "Where does your character stand in the world? Let's explore their societal position and how others perceive them."
        case "voice":
          return subStep
            ? `Let's develop your character's ${subStep === "speechStyle" ? "speech style" : subStep === "innerDialogue" ? "inner dialogue" : "unique phrases"}. How do they express themselves?`
            : "How does your character speak and think? Let's craft their unique voice and expressions."
        case "symbolism":
          return subStep
            ? `Let's explore the ${subStep === "colors" ? "colors and palette" : subStep === "items" ? "symbolic items" : "recurring motifs"} associated with your character. What visual elements represent them?`
            : "What symbols and visual elements represent your character? Let's develop their symbolic language."
        case "soulName":
          return "I can help you find the perfect soul name for your character. What kind of name are you looking for? Something mysterious, powerful, poetic? Tell me what you're thinking!"
        default:
          return "Hello! I'm your AI assistant for this step. How can I help you develop your character?"
      }
    }

    setMessages([{ role: "assistant", content: getInitialMessage() }])
  }, [currentStep, subStep])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")
    setIsLoading(true)
    setError("")

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          characterData,
          currentStep,
          subStep,
          messages: [...messages, { role: "user", content: userMessage }],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        // Add fallback response if there's an error
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I'm having trouble connecting right now. Please try again or use the suggestions above for inspiration.",
          },
        ])
      } else {
        // Add AI response to chat
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }])
      }
    } catch (err) {
      console.error("Error in chat:", err)
      setError("Failed to communicate with AI")
      // Add fallback response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please try again or use the suggestions above for inspiration.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Get title based on current step and subStep
  const getChatTitle = () => {
    if (currentStep === "motivations" && subStep) {
      switch (subStep) {
        case "drives":
          return "CHAT ABOUT INNER DRIVES"
        case "goals":
          return "CHAT ABOUT GOALS & AMBITIONS"
        case "values":
          return "CHAT ABOUT CORE VALUES"
        default:
          return "CHAT WITH AI ASSISTANT"
      }
    } else if (currentStep === "relationships" && subStep) {
      switch (subStep) {
        case "friends":
          return "CHAT ABOUT ALLIES & FRIENDS"
        case "rivals":
          return "CHAT ABOUT RIVALS & ENEMIES"
        case "family":
          return "CHAT ABOUT FAMILY & MENTORS"
        default:
          return "CHAT WITH AI ASSISTANT"
      }
    } else if (currentStep === "worldPosition" && subStep) {
      switch (subStep) {
        case "societalRole":
          return "CHAT ABOUT SOCIETAL ROLE"
        case "classStatus":
          return "CHAT ABOUT CLASS & STATUS"
        case "perception":
          return "CHAT ABOUT PUBLIC PERCEPTION"
        default:
          return "CHAT WITH AI ASSISTANT"
      }
    } else if (currentStep === "voice" && subStep) {
      switch (subStep) {
        case "speechStyle":
          return "CHAT ABOUT SPEECH STYLE"
        case "innerDialogue":
          return "CHAT ABOUT INNER DIALOGUE"
        case "uniquePhrases":
          return "CHAT ABOUT UNIQUE PHRASES"
        default:
          return "CHAT WITH AI ASSISTANT"
      }
    } else if (currentStep === "symbolism" && subStep) {
      switch (subStep) {
        case "colors":
          return "CHAT ABOUT COLORS & PALETTE"
        case "items":
          return "CHAT ABOUT SYMBOLIC ITEMS"
        case "motifs":
          return "CHAT ABOUT RECURRING MOTIFS"
        default:
          return "CHAT WITH AI ASSISTANT"
      }
    } else if (currentStep === "soulName") {
      return "CHAT ABOUT SOUL NAME IDEAS"
    }

    return `CHAT ABOUT ${currentStep.toUpperCase()}`
  }

  // Handle copy message
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success("Message copied to clipboard")
  }

  return (
    <Card className="mt-6 border border-purple-500/30 bg-black/60 backdrop-blur-sm overflow-hidden transition-all duration-300">
      <CardHeader
        className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 py-2 px-4 flex flex-row items-center justify-between cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <CardTitle className="text-sm font-medium flex items-center">
          <Sparkles className="h-4 w-4 mr-2 text-purple-400" />
          {getChatTitle()}
        </CardTitle>
      </CardHeader>

      {!isCollapsed && (
        <>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px] p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`relative max-w-[80%] ${
                        message.role === "assistant" ? "group" : ""
                      }`}
                    >
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          message.role === "user"
                            ? "bg-purple-600/70 text-white"
                            : "bg-gray-800/70 border border-purple-500/30"
                        }`}
                      >
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </div>
                      </div>
                      {/* Copy button for assistant messages */}
                      {message.role === "assistant" && (
                        <Button
                          onClick={() => handleCopyMessage(message.content)}
                          size="sm"
                          variant="ghost"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-black/80 hover:bg-black/90 border border-purple-500/30 opacity-100"
                        >
                          <Copy className="h-3 w-3 text-purple-300" />
                          <span className="sr-only">Copy message</span>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-800/70 border border-purple-500/30 flex items-center">
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Thinking...
                    </div>
                  </div>
                )}
                {error && (
                  <div className="flex justify-center">
                    <div className="rounded-lg px-4 py-2 bg-red-950/30 border border-red-500/50 text-red-200 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {error}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-4 pt-2">
            <div className="flex w-full gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about this step..."
                className="min-h-[60px] bg-background/50 border-purple-500/30 focus-visible:ring-purple-500 resize-none"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-3"
                size="icon"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
