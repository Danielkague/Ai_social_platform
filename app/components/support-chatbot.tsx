"use client"

import { useState } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X, Shield, AlertTriangle, Heart, Phone, Users, Brain, MessageCircle, BookOpen } from "lucide-react"

interface SupportChatbotProps {
  onClose: () => void
}

export default function SupportChatbot({ onClose }: SupportChatbotProps) {
  const [reportType, setReportType] = useState<string>("")
  const [showResources, setShowResources] = useState(false)
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/support-chat",
    initialMessages: [
      {
        id: "1",
        role: "assistant",
        content: "Hi there! I'm Hope, your AI support companion. 💙 I'm here to listen, support, and help you through whatever you're going through. Whether you've experienced abuse, harassment, hate speech, or just need someone to talk to, I'm here for you. I care about your wellbeing and want to help you feel heard and supported. What's on your mind today?",
      },
    ],
  })

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

  const handleQuickAction = (action: any) => {
    setReportType(action.type)
    const message = `I need help with: ${action.label}`
    handleSubmit(new Event("submit") as any, {
      data: { reportType: action.type },
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl h-[700px] flex flex-col">
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

        <CardContent className="flex-1 flex flex-col">
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
                        <div className="text-xs text-gray-600">{resource.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-blue-700 mb-2">Professional Therapy</h4>
                  <div className="space-y-1">
                    {mentalHealthResources.therapy.map((resource, index) => (
                      <div key={index} className="text-sm">
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {resource.name}
                        </a>
                        <div className="text-xs text-gray-600">{resource.description}</div>
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
                        <div className="text-xs text-gray-600">{resource.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">How can I help you today?</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.type}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action)}
                    className="flex items-center gap-2 justify-start h-auto p-3"
                  >
                    <action.icon className={`w-4 h-4 ${action.color}`} />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-1">
                      <Heart className="w-4 h-4 text-pink-600" />
                      <Badge variant="secondary" className="text-xs">
                        Hope 💙
                      </Badge>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600"></div>
                    <span className="text-sm text-gray-600">Hope is thinking of you...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Share what's on your mind... I'm here to listen 💙"
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
