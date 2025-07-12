import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages, reportData } = await req.json()

    // Enhanced system prompt for psychological support and abuse reporting
    const systemPrompt = `You are a compassionate AI support assistant for a social media platform. Your role is to:

1. Provide psychological support and crisis intervention
2. Help users report abuse and harassment
3. Guide users through safety resources
4. Maintain a calm, empathetic, and professional tone

Guidelines:
- Always prioritize user safety
- If someone mentions self-harm or suicide, provide crisis hotline numbers
- For abuse reports, gather necessary details while being sensitive
- Offer practical steps and resources
- Never minimize someone's concerns
- If the situation requires human intervention, recommend contacting platform moderators

Available actions you can take:
- File abuse reports
- Connect users with crisis resources
- Escalate to human moderators
- Provide safety planning assistance

${reportData ? `Context: User is reporting: ${JSON.stringify(reportData)}` : ""}`

    const result = streamText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages,
      tools: {
        fileAbuseReport: {
          description: "File an abuse report with collected information",
          parameters: {
            type: "object",
            properties: {
              reportType: { type: "string", description: "Type of abuse being reported" },
              description: { type: "string", description: "Description of the incident" },
              urgency: { type: "string", enum: ["low", "medium", "high", "critical"] },
            },
          },
        },
        provideCrisisResources: {
          description: "Provide crisis intervention resources",
          parameters: {
            type: "object",
            properties: {
              resourceType: { type: "string", description: "Type of crisis resource needed" },
            },
          },
        },
      },
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Support chat error:", error)
    return new Response("Error processing support request", { status: 500 })
  }
}
