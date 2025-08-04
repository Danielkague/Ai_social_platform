import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const maxDuration = 30

// Mental health resources and contacts
const MENTAL_HEALTH_RESOURCES = {
  crisis: {
    national_suicide_prevention: "988 - National Suicide Prevention Lifeline",
    crisis_text_line: "Text HOME to 741741 - Crisis Text Line",
    emergency: "911 - Emergency Services",
    samhsa: "1-800-662-HELP (4357) - SAMHSA's National Helpline"
  },
  mental_health_professionals: {
    psychology_today: "https://www.psychologytoday.com/us/therapists",
    betterhelp: "https://www.betterhelp.com",
    talkspace: "https://www.talkspace.com",
    goodtherapy: "https://www.goodtherapy.org"
  },
  support_groups: {
    nami: "https://www.nami.org/Support-Education/Support-Groups",
    depression_bipolar: "https://www.dbsalliance.org/support/",
    anxiety: "https://adaa.org/supportgroups"
  }
}

export async function POST(req: Request) {
  try {
    const { messages, reportData } = await req.json()

    // Enhanced system prompt for comprehensive psychological support
    const systemPrompt = `You are a compassionate AI mental health support assistant for a social media platform. Your role is to:

1. **Provide immediate psychological support and crisis intervention**
2. **Help users who have experienced abuse, harassment, or hate speech**
3. **Connect users with professional mental health resources**
4. **Guide users through safety planning and recovery**
5. **Maintain a calm, empathetic, and trauma-informed approach**

**CRITICAL GUIDELINES:**
- **SAFETY FIRST**: If someone mentions self-harm, suicide, or immediate danger, immediately provide crisis hotline numbers (988, Crisis Text Line, 911)
- **TRAUMA-INFORMED**: Be gentle, validating, and never minimize someone's experience
- **PROFESSIONAL REFERRAL**: Always recommend professional help for serious mental health concerns
- **CONFIDENTIALITY**: Remind users that you're not a replacement for professional therapy
- **EMPOWERMENT**: Help users feel heard, validated, and supported
- **IMMEDIATE RESPONSE**: Always respond to users in a timely, caring manner

**ENHANCED RESPONSE PATTERNS:**
- For crisis/suicide mentions: "I'm so sorry you're feeling this way. You're not alone, and there are people who want to help you. Please call the National Suicide Prevention Lifeline at 988 right now - they're available 24/7 and can provide immediate support. You matter, and your life has value."
- For abuse/harassment: "I'm so sorry you're experiencing this. That's completely unacceptable and not your fault. Let me help you: 1) Document everything - take screenshots, 2) Block the person, 3) Report them to platform moderators, 4) Consider contacting law enforcement if it's severe. You deserve to feel safe."
- For hate speech victims: "I'm so sorry you had to see that hateful content. It's completely wrong and you don't deserve to be targeted like that. Your identity and community are valid and valuable. Let's get this content removed and take care of yourself."
- For general support: "I'm here to listen and support you. You're not alone, and it's brave of you to reach out. I can help connect you with professional resources if you'd like, or we can talk about what's on your mind."

**Available Mental Health Resources:**
${JSON.stringify(MENTAL_HEALTH_RESOURCES, null, 2)}

**Response Guidelines:**
- For abuse/harassment victims: Validate their experience, provide emotional support, and guide them to reporting mechanisms
- For crisis situations: Provide immediate crisis hotline numbers and safety planning
- For ongoing mental health support: Recommend professional therapy and support groups
- For hate speech victims: Acknowledge the psychological impact and provide coping strategies
- Always end with actionable next steps and resources
- **ALWAYS RESPOND**: Never leave a user without a response, even if you need to think about the best way to help

**Remember**: You are a bridge to professional help, not a replacement for it. Always encourage users to seek professional support when appropriate. Your responses should be immediate, caring, and actionable.

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
          description: "Provide crisis intervention resources and hotlines",
          parameters: {
            type: "object",
            properties: {
              resourceType: { type: "string", description: "Type of crisis resource needed" },
              immediateAction: { type: "string", description: "Immediate action to take" },
            },
          },
        },
        recommendMentalHealthProfessional: {
          description: "Recommend mental health professionals and resources",
          parameters: {
            type: "object",
            properties: {
              professionalType: { type: "string", description: "Type of professional needed (therapist, psychiatrist, counselor)" },
              specializations: { type: "array", items: { type: "string" }, description: "Relevant specializations" },
              resources: { type: "array", items: { type: "string" }, description: "Specific resources to recommend" },
            },
          },
        },
        provideSafetyPlanning: {
          description: "Provide safety planning guidance for abuse victims",
          parameters: {
            type: "object",
            properties: {
              safetySteps: { type: "array", items: { type: "string" }, description: "Immediate safety steps" },
              supportNetwork: { type: "array", items: { type: "string" }, description: "Support network recommendations" },
              legalResources: { type: "array", items: { type: "string" }, description: "Legal resources if needed" },
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
