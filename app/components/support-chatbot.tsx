"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X, Shield, AlertTriangle, Heart, Phone, Users, Brain, MessageCircle, BookOpen, Send, ChevronDown } from "lucide-react"

interface SupportChatbotProps {
  onClose: () => void
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function SupportChatbot({ onClose }: SupportChatbotProps) {
  const [reportType, setReportType] = useState<string>("")
  const [showResources, setShowResources] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi there! I'm Hope, your AI support companion. 💙 I'm here to listen, support, and help you through whatever you're going through. Whether you've experienced abuse, harassment, hate speech, or just need someone to talk to, I'm here for you. I care about your wellbeing and want to help you feel heard and supported. What's on your mind today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [newMessagesIndicator, setNewMessagesIndicator] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Check if user is near bottom to determine if we should auto-scroll
  const isNearBottom = () => {
    if (!messagesContainerRef.current) return true
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    return scrollTop + clientHeight >= scrollHeight - 100
  }

  // Handle scroll events to show/hide scroll button
  const handleScroll = () => {
    if (!messagesContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50
    setShowScrollButton(!isAtBottom)
    
    // Hide new messages indicator when user scrolls to bottom
    if (isAtBottom) {
      setNewMessagesIndicator(false)
    }
  }

  // Auto-scroll when messages change
  useEffect(() => {
    if (isNearBottom()) {
      scrollToBottom()
      setNewMessagesIndicator(false)
    } else {
      // Show indicator if user is not at bottom and new message arrives
      setNewMessagesIndicator(true)
    }
  }, [messages])

  // Auto-scroll when loading state changes
  useEffect(() => {
    if (isLoading) {
      scrollToBottom()
    }
  }, [isLoading])

  // Add scroll event listener
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const quickActions = [
    { label: "Experienced Hate Speech", type: "hate_speech", icon: AlertTriangle, color: "text-red-600" },
    { label: "Been Harassed/Abused", type: "harassment", icon: Shield, color: "text-orange-600" },
    { label: "Need Emotional Support", type: "support", icon: Heart, color: "text-pink-600" },
    { label: "Crisis Help", type: "crisis", icon: Phone, color: "text-red-700" },
    { label: "Find Therapist", type: "therapy", icon: Brain, color: "text-blue-600" },
    { label: "Support Groups", type: "groups", icon: Users, color: "text-green-600" },
  ]

  const mentalHealthResources = {
    crisis: [
      { name: "National Suicide Prevention Lifeline", contact: "988", description: "24/7 crisis support" },
      { name: "Crisis Text Line", contact: "Text HOME to 741741", description: "Text-based crisis support" },
      { name: "Emergency Services", contact: "911", description: "Immediate emergency help" },
    ],
    therapy: [
      { name: "Psychology Today", url: "https://www.psychologytoday.com/us/therapists", description: "Find local therapists" },
      { name: "BetterHelp", url: "https://www.betterhelp.com", description: "Online therapy platform" },
      { name: "Talkspace", url: "https://www.talkspace.com", description: "Online therapy and psychiatry" },
    ],
    support: [
      { name: "NAMI Support Groups", url: "https://www.nami.org/Support-Education/Support-Groups", description: "Mental health support groups" },
      { name: "Depression & Bipolar Support", url: "https://www.dbsalliance.org/support/", description: "Mood disorder support" },
      { name: "Anxiety Support", url: "https://adaa.org/supportgroups", description: "Anxiety disorder support" },
    ]
  }

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/support-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [userMessage],
          reportData: { userId: "user" }
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No response body")
      }

      let assistantMessage = ""
      const assistantMessageId = (Date.now() + 1).toString()

      // Add empty assistant message to show loading
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              // Message complete
              setMessages(prev => prev.map(msg => 
                msg.id === assistantMessageId 
                  ? { ...msg, content: assistantMessage }
                  : msg
              ))
              setIsLoading(false)
              return
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                assistantMessage = parsed.content
                // Update the message in real-time
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: assistantMessage }
                    : msg
                ))
              }
            } catch (e) {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)
      // Add error message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date(),
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input.trim()) {
        sendMessage(input)
      }
    }
    // Ctrl/Cmd + Enter to scroll to bottom
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      scrollToBottom()
    }
  }

  const handleQuickAction = (action: any) => {
    setReportType(action.type)
    const message = `I need help with: ${action.label}`
    sendMessage(message)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="w-full max-w-4xl h-[700px] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600" />
            Hope - Your AI Support Companion
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowResources(!showResources)}
              className="flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Resources
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col min-h-0">
          {/* Crisis Resources Banner */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-red-800 font-semibold mb-1">
              <Phone className="w-4 h-4" />
              Crisis Resources
            </div>
            <p className="text-sm text-red-700">
              If you're in immediate danger, call 911. For crisis support: National Suicide Prevention Lifeline 988
            </p>
          </div>

          {/* Mental Health Resources Panel */}
          {showResources && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Mental Health Resources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-red-700 mb-2">Crisis Help</h4>
                  <div className="space-y-1">
                    {mentalHealthResources.crisis.map((resource, index) => (
                      <div key={index} className="text-sm">
                        <strong>{resource.name}:</strong> {resource.contact}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-blue-700 mb-2">Therapy & Counseling</h4>
                  <div className="space-y-1">
                    {mentalHealthResources.therapy.map((resource, index) => (
                      <div key={index} className="text-sm">
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {resource.name}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Support Groups</h4>
                  <div className="space-y-1">
                    {mentalHealthResources.support.map((resource, index) => (
                      <div key={index} className="text-sm">
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                          {resource.name}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Actions:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action)}
                    disabled={isLoading}
                    className={`text-xs h-auto py-2 px-3 ${action.color}`}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {action.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 flex flex-col min-h-0">
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 relative"
              style={{
                scrollBehavior: 'smooth',
                scrollbarWidth: 'thin',
                scrollbarColor: '#d1d5db #f3f4f6'
              }}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 shadow-sm ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-200 text-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.role === "assistant" && (
                        <Heart className="w-4 h-4 text-pink-500" />
                      )}
                      <span className="text-xs opacity-70">
                        {message.role === "assistant" ? "Hope" : "You"}
                      </span>
                      <span className="text-xs opacity-50">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pink-500" />
                      <span className="text-xs opacity-70">Hope</span>
                    </div>
                    <div className="flex space-x-1 mt-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              {/* Invisible element for auto-scrolling */}
              <div ref={messagesEndRef} className="pb-16" />
              
              {/* Scroll to bottom button */}
              {showScrollButton && (
                <Button
                  onClick={scrollToBottom}
                  className="absolute bottom-4 right-4 w-10 h-10 rounded-full shadow-lg bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-200 z-10"
                  size="sm"
                >
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                  {newMessagesIndicator && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here... (Enter to send, Ctrl+Enter to scroll to bottom)"
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
