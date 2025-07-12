"use client"

import { useState } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X, Shield, AlertTriangle, Heart, Phone } from "lucide-react"

interface SupportChatbotProps {
  onClose: () => void
}

export default function SupportChatbot({ onClose }: SupportChatbotProps) {
  const [reportType, setReportType] = useState<string>("")
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/support-chat",
    initialMessages: [
      {
        id: "1",
        role: "assistant",
        content: "Hi! I'm here to help with any safety concerns or if you need support. How can I assist you today?",
      },
    ],
  })

  const quickActions = [
    { label: "Report Harassment", type: "harassment", icon: AlertTriangle },
    { label: "Report Hate Speech", type: "hate_speech", icon: Shield },
    { label: "Need Emotional Support", type: "support", icon: Heart },
    { label: "Crisis Help", type: "crisis", icon: Phone },
  ]

  const handleQuickAction = (action: any) => {
    setReportType(action.type)
    const message = `I need help with: ${action.label}`
    handleSubmit(new Event("submit") as any, {
      data: { reportType: action.type },
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Safety & Support Assistant
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
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

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Quick Actions:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.type}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action)}
                    className="flex items-center gap-2 justify-start"
                  >
                    <action.icon className="w-4 h-4" />
                    {action.label}
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
                      <Shield className="w-4 h-4 text-blue-600" />
                      <Badge variant="secondary" className="text-xs">
                        AI Support
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
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600">AI is thinking...</span>
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
              placeholder="Describe your concern or ask for help..."
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
