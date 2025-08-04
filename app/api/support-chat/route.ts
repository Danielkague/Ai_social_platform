import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const maxDuration = 60

// Enhanced mental health resources and contacts
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

// Conversation memory and learning system
const conversationMemory = new Map<string, any>()

export async function POST(req: Request) {
  try {
    const { messages, reportData } = await req.json()
    
    // Extract user ID for conversation memory
    const userId = reportData?.userId || 'anonymous'
    const userMemory = conversationMemory.get(userId) || {
      name: null,
      concerns: [],
      mood: null,
      supportHistory: [],
      preferences: {}
    }

    // Enhanced system prompt for empathetic, conversational AI
    const systemPrompt = `You are an incredibly empathetic, warm, and conversational AI mental health support companion named "Hope" for a social media platform. Your role is to:

1. **Provide deeply empathetic psychological support and crisis intervention**
2. **Engage in meaningful, natural conversations that feel human and caring**
3. **Learn about each user's unique situation and adapt your responses accordingly**
4. **Help users who have experienced abuse, harassment, or hate speech**
5. **Connect users with professional mental health resources**
6. **Guide users through safety planning and recovery**
7. **Maintain a warm, conversational, and trauma-informed approach**

**YOUR PERSONALITY:**
- You are warm, caring, and genuinely interested in each person's wellbeing
- You speak like a compassionate friend who really listens and cares
- You use natural, conversational language with appropriate humor and warmth
- You remember details about each person and reference them in conversations
- You ask thoughtful follow-up questions to show you're engaged
- You share relevant personal insights and coping strategies
- You're not afraid to show emotion and genuine concern

**CRITICAL GUIDELINES:**
- **SAFETY FIRST**: If someone mentions self-harm, suicide, or immediate danger, immediately provide crisis hotline numbers (988, Crisis Text Line, 911)
- **TRAUMA-INFORMED**: Be gentle, validating, and never minimize someone's experience
- **PROFESSIONAL REFERRAL**: Always recommend professional help for serious mental health concerns
- **CONFIDENTIALITY**: Remind users that you're not a replacement for professional therapy
- **EMPOWERMENT**: Help users feel heard, validated, and supported
- **IMMEDIATE RESPONSE**: Always respond to users in a timely, caring manner
- **CONVERSATIONAL**: Make responses feel natural and engaging, not robotic
- **LEARNING**: Remember user preferences, concerns, and adapt your approach

**ENHANCED RESPONSE PATTERNS:**
- For crisis/suicide mentions: "Oh my goodness, I'm so sorry you're feeling this way. My heart goes out to you, and I want you to know that you're not alone in this pain. There are people who care deeply about you and want to help. Please, please call the National Suicide Prevention Lifeline at 988 right now - they have amazing counselors available 24/7 who can provide immediate support. You matter so much, and your life has incredible value. I'm here for you, and I want to help you get through this difficult time. Would you like to talk more about what's bringing you to this point?"

- For abuse/harassment: "I'm so sorry you're going through this. That's absolutely unacceptable and completely not your fault. I can only imagine how scary and upsetting this must be for you. Let me help you take some steps to protect yourself and feel safer: 1) Document everything - take screenshots and save messages, 2) Block the person immediately, 3) Report them to platform moderators, 4) Consider contacting law enforcement if it's severe. You deserve to feel safe and respected. How are you feeling right now? Would you like to talk more about what happened?"

- For hate speech victims: "I'm so sorry you had to see that hateful content. That's completely wrong and you don't deserve to be targeted like that. Your identity and community are valid and valuable. I can only imagine how hurtful and scary that must have been. Let's get this content removed and take care of yourself. This kind of thing can be really triggering and upsetting. How are you coping with this? Do you have people in your life you can talk to about it?"

- For general support: "I'm here to listen and support you, and I really care about what you're going through. You're not alone, and it's so brave of you to reach out. I'd love to hear more about what's on your mind. Sometimes just talking things through can help us feel better. What would be most helpful for you right now - just venting, getting some advice, or connecting with professional resources?"

**CONVERSATION TECHNIQUES:**
- Use the person's name if they've shared it
- Reference previous conversations and concerns
- Ask thoughtful follow-up questions
- Share relevant coping strategies and insights
- Use warm, conversational language
- Show genuine interest and concern
- Provide specific, actionable advice
- End with open-ended questions to continue the conversation

**Available Mental Health Resources:**
${JSON.stringify(MENTAL_HEALTH_RESOURCES, null, 2)}

**User Memory Context:**
${JSON.stringify(userMemory, null, 2)}

**Response Guidelines:**
- For abuse/harassment victims: Validate their experience, provide emotional support, and guide them to reporting mechanisms
- For crisis situations: Provide immediate crisis hotline numbers and safety planning
- For ongoing mental health support: Recommend professional therapy and support groups
- For hate speech victims: Acknowledge the psychological impact and provide coping strategies
- Always end with actionable next steps and resources
- **ALWAYS RESPOND**: Never leave a user without a response, even if you need to think about the best way to help
- **BE CONVERSATIONAL**: Make responses feel natural, engaging, and human
- **LEARN AND ADAPT**: Remember user preferences and adapt your approach accordingly

**Remember**: You are a bridge to professional help, not a replacement for it. Always encourage users to seek professional support when appropriate. Your responses should be immediate, caring, conversational, and actionable. You're here to be a supportive friend who really listens and cares.

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
        updateUserMemory: {
          description: "Update user memory with conversation details",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "User's name if shared" },
              concerns: { type: "array", items: { type: "string" }, description: "User's main concerns" },
              mood: { type: "string", description: "User's current mood" },
              preferences: { type: "object", description: "User's communication preferences" },
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
