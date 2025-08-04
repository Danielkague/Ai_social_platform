import { NextRequest } from "next/server"

export const maxDuration = 60

// Custom local chatbot responses
const CHATBOT_RESPONSES = {
  // Crisis responses
  crisis: {
    suicide: [
      "I'm so sorry you're feeling this way. My heart goes out to you, and I want you to know that you're not alone in this pain. There are people who care deeply about you and want to help. Please, please call the National Suicide Prevention Lifeline at 988 right now - they have amazing counselors available 24/7 who can provide immediate support. You matter so much, and your life has incredible value. I'm here for you, and I want to help you get through this difficult time.",
      "I can hear how much pain you're in, and I want you to know that your feelings are valid. But I also want you to know that there is hope and help available. Please call 988 right now - this is the National Suicide Prevention Lifeline, and they have trained counselors who can help you through this crisis. You don't have to face this alone. Your life has meaning and value, and there are people who want to support you."
    ],
    self_harm: [
      "I'm so sorry you're feeling this way. I can hear how much you're hurting, and I want you to know that you deserve help and support. Please call the Crisis Text Line by texting HOME to 741741, or call 988 for immediate support. You don't have to go through this alone. There are people who care about you and want to help you find healthier ways to cope with your pain.",
      "I understand you're in a lot of pain right now, and I want you to know that your feelings matter. But hurting yourself isn't the answer. Please reach out for help - call 988 or text HOME to 741741. These are crisis hotlines with trained counselors who can help you through this difficult time. You deserve support and care."
    ]
  },
  
  // Abuse responses
  abuse: {
    domestic: [
      "I'm so sorry you're going through this. That's absolutely unacceptable and completely not your fault. I can only imagine how scary and upsetting this must be for you. Let me help you take some steps to protect yourself and feel safer: 1) Document everything - take screenshots and save messages, 2) Block the person immediately, 3) Report them to platform moderators, 4) Consider contacting law enforcement if it's severe. You deserve to feel safe and respected. How are you feeling right now?",
      "I'm so sorry you're experiencing this abuse. No one deserves to be treated this way. Your safety is the most important thing right now. Please consider: 1) Reaching out to a domestic violence hotline at 1-800-799-SAFE, 2) Making a safety plan, 3) Documenting all incidents, 4) Seeking support from trusted friends or family. You're not alone, and there are people who want to help you."
    ],
    online: [
      "I'm so sorry you're being harassed online. That's completely unacceptable and not your fault. Let me help you take some steps to protect yourself: 1) Document everything - take screenshots and save messages, 2) Block the person immediately, 3) Report them to platform moderators, 4) Consider contacting law enforcement if it's severe. You deserve to feel safe and respected. How are you feeling right now?",
      "Online harassment can be really scary and upsetting. You don't deserve this treatment. Here's what you can do: 1) Block and report the person, 2) Take screenshots of all messages, 3) Report to the platform's safety team, 4) Consider reaching out to a counselor or therapist for support. You're not alone in this."
    ]
  },
  
  // Hate speech responses
  hate_speech: [
    "I'm so sorry you had to see that hateful content. That's completely wrong and you don't deserve to be targeted like that. Your identity and community are valid and valuable. I can only imagine how hurtful and scary that must have been. Let's get this content removed and take care of yourself. This kind of thing can be really triggering and upsetting. How are you coping with this?",
    "I'm so sorry you experienced that hate speech. That's completely unacceptable and you don't deserve to be treated that way. Your worth and dignity are not defined by someone else's hate. Please report the content to platform moderators, and consider reaching out to supportive communities or a counselor. You matter, and you're not alone."
  ],
  
  // General support responses
  general: {
    sad: [
      "I'm here to listen and support you, and I really care about what you're going through. You're not alone, and it's so brave of you to reach out. I'd love to hear more about what's on your mind. Sometimes just talking things through can help us feel better. What would be most helpful for you right now?",
      "I'm so sorry you're feeling sad. Your feelings are valid, and it's okay to not be okay. I'm here to listen and support you. Sometimes when we're feeling down, it helps to talk about what's going on. Would you like to share more about what's bringing you down? I care about you and want to help."
    ],
    lonely: [
      "I understand how lonely you must be feeling right now. That's a really difficult emotion to carry, and I want you to know that you're not alone in feeling this way. I'm here to listen and support you. Sometimes connecting with others, even just through conversation, can help ease that loneliness. What's been going on in your life lately?",
      "I'm so sorry you're feeling lonely. That's such a painful feeling, and I want you to know that your feelings matter. I'm here to listen and support you. Sometimes when we're lonely, it helps to reach out to others or find ways to connect. Would you like to talk more about what's going on?"
    ],
    anxious: [
      "I can hear how anxious you're feeling, and I want you to know that anxiety is really challenging to deal with. Your feelings are valid, and it's okay to feel this way. I'm here to listen and support you. Sometimes talking about what's making us anxious can help us feel a bit better. What's been on your mind?",
      "I'm so sorry you're feeling anxious. That can be really overwhelming and scary. I'm here to listen and support you. Sometimes when we're anxious, it helps to talk about what's worrying us or practice some breathing exercises. What would be most helpful for you right now?"
    ]
  },
  
  // Default responses
  default: [
    "I'm here to listen and support you. You're not alone, and it's brave of you to reach out. I'd love to hear more about what's on your mind. What would be most helpful for you right now?",
    "I'm here for you and I care about what you're going through. Sometimes just talking things through can help us feel better. What's been on your mind lately?",
    "I'm so glad you reached out. I'm here to listen and support you. You don't have to go through this alone. What would you like to talk about?"
  ]
}

// Pattern matching for response selection
const PATTERNS = {
  suicide: [
    /kill.*self/i, /suicide/i, /want.*die/i, /end.*life/i, /don.*want.*live/i,
    /better.*off.*dead/i, /no.*reason.*live/i, /everyone.*better.*without.*me/i
  ],
  self_harm: [
    /hurt.*self/i, /cut.*self/i, /self.*harm/i, /want.*pain/i, /deserve.*pain/i
  ],
  domestic_abuse: [
    /girlfriend.*abusive/i, /boyfriend.*abusive/i, /partner.*abusive/i,
    /spouse.*abusive/i, /husband.*abusive/i, /wife.*abusive/i,
    /domestic.*violence/i, /physical.*abuse/i, /emotional.*abuse/i
  ],
  online_harassment: [
    /harass.*online/i, /cyber.*bully/i, /online.*bully/i, /stalk.*online/i,
    /someone.*following/i, /threat.*online/i, /hate.*messages/i
  ],
  hate_speech: [
    /hate.*speech/i, /called.*names/i, /racial.*slur/i, /discrimination/i,
    /targeted.*because/i, /hate.*content/i, /offensive.*comments/i
  ],
  sad: [
    /feel.*sad/i, /depressed/i, /down/i, /unhappy/i, /miserable/i,
    /hopeless/i, /worthless/i, /empty/i
  ],
  lonely: [
    /lonely/i, /alone/i, /no.*friends/i, /isolated/i, /no.*one.*cares/i,
    /no.*support/i, /by.*myself/i
  ],
  anxious: [
    /anxious/i, /worried/i, /nervous/i, /panic/i, /stress/i, /overwhelm/i,
    /scared/i, /fear/i
  ]
}

// User memory for personalized responses
const userMemory = new Map<string, any>()

function getResponseType(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  // Check patterns in order of priority
  for (const [type, patterns] of Object.entries(PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(lowerMessage)) {
        return type
      }
    }
  }
  
  return 'default'
}

function getRandomResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)]
}

function generateResponse(message: string, userId: string): string {
  const responseType = getResponseType(message)
  let response = ""
  
  // Get user memory
  const memory = userMemory.get(userId) || {
    name: null,
    concerns: [],
    mood: null,
    conversationCount: 0
  }
  
  // Update conversation count
  memory.conversationCount++
  userMemory.set(userId, memory)
  
  // Generate response based on type
  switch (responseType) {
    case 'suicide':
      response = getRandomResponse(CHATBOT_RESPONSES.crisis.suicide)
      break
    case 'self_harm':
      response = getRandomResponse(CHATBOT_RESPONSES.crisis.self_harm)
      break
    case 'domestic_abuse':
      response = getRandomResponse(CHATBOT_RESPONSES.abuse.domestic)
      break
    case 'online_harassment':
      response = getRandomResponse(CHATBOT_RESPONSES.abuse.online)
      break
    case 'hate_speech':
      response = getRandomResponse(CHATBOT_RESPONSES.hate_speech)
      break
    case 'sad':
      response = getRandomResponse(CHATBOT_RESPONSES.general.sad)
      break
    case 'lonely':
      response = getRandomResponse(CHATBOT_RESPONSES.general.lonely)
      break
    case 'anxious':
      response = getRandomResponse(CHATBOT_RESPONSES.general.anxious)
      break
    default:
      response = getRandomResponse(CHATBOT_RESPONSES.default)
  }
  
  // Add personalization if we have user info
  if (memory.name) {
    response = response.replace(/you/g, memory.name)
  }
  
  // Add follow-up question for engagement
  const followUps = [
    " How are you feeling right now?",
    " What would be most helpful for you right now?",
    " Would you like to talk more about what's going on?",
    " Is there anything specific you'd like to discuss?",
    " How can I best support you today?"
  ]
  
  response += getRandomResponse(followUps)
  
  return response
}

export async function POST(req: NextRequest) {
  try {
    const { messages, reportData } = await req.json()
    
    if (!messages || messages.length === 0) {
      return new Response("No messages provided", { status: 400 })
    }
    
    const lastMessage = messages[messages.length - 1]
    const userId = reportData?.userId || 'anonymous'
    
    // Generate response
    const response = generateResponse(lastMessage.content, userId)
    
    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        // Send response in chunks to simulate streaming
        const chunks = response.split(' ')
        let index = 0
        
        const sendChunk = () => {
          if (index < chunks.length) {
            const chunk = chunks[index] + (index < chunks.length - 1 ? ' ' : '')
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`))
            index++
            setTimeout(sendChunk, 50) // 50ms delay between words
          } else {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          }
        }
        
        sendChunk()
      }
    })
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
    
  } catch (error) {
    console.error("Support chat error:", error)
    return new Response("Error processing support request", { status: 500 })
  }
}
