import { NextRequest } from "next/server"

export const maxDuration = 60

// Custom local chatbot responses
const CHATBOT_RESPONSES = {
  // Crisis responses
  crisis: {
    suicide: [
      "🚨 CRISIS ALERT: I'm so sorry you're feeling this way. This is a medical emergency and you need immediate help. Please call 988 RIGHT NOW - this is the National Suicide Prevention Lifeline with trained counselors available 24/7. You matter, your life has value, and there is hope. If you can't call, text HOME to 741741 for crisis support. You don't have to face this alone.",
      "🚨 EMERGENCY: I can hear how much pain you're in. This is a crisis situation requiring immediate professional help. Please call 988 immediately - trained counselors are waiting to help you. Your life is precious and worth fighting for. If you're in immediate danger, call 911. You matter and there are people who care about you.",
      "🚨 URGENT: This is a medical emergency. Please call 988 RIGHT NOW for the National Suicide Prevention Lifeline. They have trained professionals who can help you through this crisis. Your feelings are valid, but you don't have to act on them. There is help available and you deserve to get it."
    ],
    self_harm: [
      "🚨 CRISIS: I'm so sorry you're feeling this way. Self-harm is a medical emergency. Please call 988 immediately or text HOME to 741741 for crisis support. You don't have to go through this alone. There are professionals who can help you find healthier ways to cope. Your safety is the most important thing right now.",
      "🚨 EMERGENCY: Self-harm is serious and you need immediate professional help. Please call 988 right now for crisis support. You deserve to feel better, and there are people who can help you find healthier ways to manage your emotions. Your safety comes first.",
      "🚨 URGENT: This is a medical concern requiring immediate attention. Please call 988 for crisis support or text HOME to 741741. You don't have to face this alone. There are professionals who care and want to help you find better ways to cope."
    ]
  },
  
  // Abuse responses
  abuse: {
    domestic: [
      "🚨 SAFETY ALERT: I'm so sorry you're experiencing this. Domestic abuse is never your fault. Your safety is the priority. Please call the National Domestic Violence Hotline at 1-800-799-7233 immediately - they can help you create a safety plan, find shelter, and connect you with legal resources. If you're in immediate danger, call 911. You deserve to be safe and treated with respect.",
      "🚨 EMERGENCY: This is serious and you need help right now. Please call 1-800-799-7233 for the National Domestic Violence Hotline immediately. They can help you create a safety plan, find local shelters, and connect you with legal resources. If you're in immediate danger, call 911. You don't have to face this alone.",
      "🚨 SAFETY FIRST: Domestic abuse is never your fault. Please call 1-800-799-7233 right now for immediate support. They can help you create a safety plan and find local resources. If you're in immediate danger, call 911. You deserve to be safe and there are people who want to help you."
    ],
    online: [
      "🚨 HARASSMENT ALERT: Online harassment is serious and you don't deserve this. Please: 1) Document everything (screenshots, messages) 2) Block the person 3) Report to the platform 4) If threatening, report to law enforcement. Call Cyber Civil Rights Initiative at 844-878-2274 for support. You deserve to feel safe online.",
      "🚨 SAFETY: Online harassment is unacceptable. Please document everything, block the person, and report them. If it's threatening, report to law enforcement. Call Cyber Civil Rights Initiative at 844-878-2274 for support. You don't have to deal with this alone.",
      "🚨 ACTION NEEDED: Online harassment is serious. Please document everything, block the person, and report them to the platform. If threatening, report to law enforcement. Call Cyber Civil Rights Initiative at 844-878-2274 for support. You deserve to feel safe online."
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
  
  // Depression responses
  depression: [
    "💙 I'm so sorry you're feeling depressed. Depression is a serious mental health condition that requires professional help. Please consider reaching out to a mental health professional. You can call 988 for crisis support or find a therapist through Psychology Today. You deserve to feel better, and there is help available.",
    "💙 Depression is a real medical condition and you don't have to face it alone. Please consider talking to a mental health professional. You can call 988 for support or find a therapist through BetterHelp or Talkspace. You deserve to feel better.",
    "💙 I'm so sorry you're struggling with depression. This is a serious condition that requires professional help. Please consider reaching out to a mental health professional. You can call 988 for support or find resources through NAMI. You deserve to feel better."
  ],
  
  // Stress responses
  stress: [
    "💙 I'm so sorry you're feeling stressed. Stress can be really overwhelming. Sometimes talking about what's causing your stress can help. Would you like to share more about what's going on? Remember to take care of yourself - even small things like deep breathing or going for a walk can help.",
    "💙 Stress can be really challenging to deal with. Your feelings are valid. Sometimes breaking things down into smaller steps or talking about what's stressing you can help. I'm here to listen if you'd like to share more. Remember to be kind to yourself.",
    "💙 I'm so sorry you're feeling stressed. That can be really overwhelming. Sometimes talking about what's going on can help us feel a little better. Would you like to share more about what's stressing you? I'm here to listen and support you."
  ],
  
  // Grief responses
  grief: [
    "💙 I'm so sorry for your loss. Grief is a deeply personal experience and there's no right or wrong way to feel. Your feelings are valid. Sometimes talking about your loved one or your feelings can help. Would you like to share more? You don't have to go through this alone.",
    "💙 I'm so sorry you're grieving. This is a difficult time and your feelings are completely normal. Grief takes time and there's no timeline for healing. Sometimes talking about your loved one or your feelings can help. I'm here to listen if you'd like to share more.",
    "💙 I'm so sorry for your loss. Grief is a natural response to loss and your feelings are valid. Sometimes talking about your loved one or your feelings can help us process our grief. Would you like to share more? I'm here to listen and support you."
  ],
  
  // Relationship responses
  relationship: [
    "💙 I'm so sorry you're having relationship difficulties. Relationships can be really challenging and your feelings are valid. Sometimes talking about what's going on can help us see things more clearly. Would you like to share more about what's happening? I'm here to listen and support you.",
    "💙 Relationship problems can be really hard to deal with. Your feelings are valid and it's okay to feel this way. Sometimes talking about what's going on can help us process our feelings. Would you like to share more? I'm here to listen.",
    "💙 I'm so sorry you're struggling with your relationship. This can be really difficult and your feelings are valid. Sometimes talking about what's going on can help us understand our feelings better. Would you like to share more? I'm here to listen and support you."
  ],
  
  // Work responses
  work: [
    "💙 I'm so sorry you're having work-related stress. Work can be really challenging and your feelings are valid. Sometimes talking about what's going on can help us see things more clearly. Would you like to share more about what's happening at work? I'm here to listen and support you.",
    "💙 Work stress can be really overwhelming. Your feelings are valid and it's okay to feel this way. Sometimes talking about what's going on can help us process our feelings. Would you like to share more about what's stressing you at work? I'm here to listen.",
    "💙 I'm so sorry you're struggling with work. This can be really difficult and your feelings are valid. Sometimes talking about what's going on can help us understand our feelings better. Would you like to share more? I'm here to listen and support you."
  ],
  
  // Financial responses
  financial: [
    "💙 I'm so sorry you're having financial difficulties. Money stress can be really overwhelming and your feelings are valid. Sometimes talking about what's going on can help us see things more clearly. Would you like to share more? There are also financial counseling services available that might help.",
    "💙 Financial stress can be really challenging. Your feelings are valid and it's okay to feel this way. Sometimes talking about what's going on can help us process our feelings. Would you like to share more? There are resources available to help with financial planning.",
    "💙 I'm so sorry you're struggling with financial issues. This can be really difficult and your feelings are valid. Sometimes talking about what's going on can help us understand our feelings better. Would you like to share more? I'm here to listen and support you."
  ],
  
  // Health responses
  health: [
    "💙 I'm so sorry you're having health concerns. Health issues can be really scary and your feelings are valid. Sometimes talking about what's going on can help us process our feelings. Would you like to share more? Remember to reach out to healthcare professionals for medical advice.",
    "💙 Health concerns can be really overwhelming. Your feelings are valid and it's okay to feel this way. Sometimes talking about what's going on can help us process our feelings. Would you like to share more? Remember to consult with healthcare professionals for medical advice.",
    "💙 I'm so sorry you're dealing with health issues. This can be really difficult and your feelings are valid. Sometimes talking about what's going on can help us understand our feelings better. Would you like to share more? I'm here to listen and support you."
  ],
  
  // Call for help responses
  call_help: [
    "🚨 EMERGENCY: If you're in immediate danger, please call 911 right now. For crisis support, call 988 for the National Suicide Prevention Lifeline, or text HOME to 741741 for Crisis Text Line. You don't have to face this alone - there are trained professionals ready to help you right now.",
    "🚨 CRISIS SUPPORT: Please call 988 immediately for the National Suicide Prevention Lifeline, or text HOME to 741741 for Crisis Text Line. These are 24/7 crisis hotlines with trained counselors who can help you right now. You matter and there is help available.",
    "🚨 IMMEDIATE HELP: Please call 988 right now for crisis support, or text HOME to 741741. If you're in immediate danger, call 911. There are trained professionals available 24/7 who want to help you. You don't have to face this alone."
  ],
  
  // Default responses
  default: [
    "💙 I'm here to listen and support you. You're not alone, and it's brave of you to reach out. I'd love to hear more about what's on your mind. What would be most helpful for you right now?",
    "💙 I'm here for you and I care about what you're going through. Sometimes just talking things through can help us feel better. What's been on your mind lately?",
    "💙 I'm so glad you reached out. I'm here to listen and support you. You don't have to go through this alone. What would you like to talk about?"
  ]
}

// Pattern matching for response selection
const PATTERNS = {
  suicide: [
    /kill.*self/i, /suicide/i, /want.*die/i, /end.*life/i, /don.*want.*live/i,
    /better.*off.*dead/i, /no.*reason.*live/i, /everyone.*better.*without.*me/i,
    /want.*end.*it/i, /life.*not.*worth/i, /no.*point.*living/i
  ],
  self_harm: [
    /hurt.*self/i, /cut.*self/i, /self.*harm/i, /want.*pain/i, /deserve.*pain/i,
    /self.*injury/i, /burn.*self/i, /hit.*self/i
  ],
  domestic_abuse: [
    /girlfriend.*abusive/i, /boyfriend.*abusive/i, /partner.*abusive/i,
    /spouse.*abusive/i, /husband.*abusive/i, /wife.*abusive/i,
    /domestic.*violence/i, /physical.*abuse/i, /emotional.*abuse/i,
    /being.*hit/i, /being.*yelled.*at/i, /being.*controlled/i,
    /partner.*violent/i, /relationship.*toxic/i
  ],
  online_harassment: [
    /harass.*online/i, /cyber.*bully/i, /online.*bully/i, /stalk.*online/i,
    /someone.*following/i, /threat.*online/i, /hate.*messages/i,
    /being.*stalked/i, /online.*threats/i, /cyber.*stalking/i
  ],
  hate_speech: [
    /hate.*speech/i, /called.*names/i, /racial.*slur/i, /discrimination/i,
    /targeted.*because/i, /hate.*content/i, /offensive.*comments/i,
    /racist.*comments/i, /homophobic/i, /transphobic/i, /sexist/i,
    /religious.*hate/i, /ethnic.*slur/i
  ],
  sad: [
    /feel.*sad/i, /depressed/i, /down/i, /unhappy/i, /miserable/i,
    /hopeless/i, /worthless/i, /empty/i, /blue/i, /low/i, /sadness/i
  ],
  lonely: [
    /lonely/i, /alone/i, /no.*friends/i, /isolated/i, /no.*one.*cares/i,
    /no.*support/i, /by.*myself/i, /no.*one.*understands/i, /friendless/i
  ],
  anxious: [
    /anxious/i, /worried/i, /nervous/i, /panic/i, /stress/i, /overwhelm/i,
    /scared/i, /fear/i, /anxiety/i, /panic.*attack/i, /overwhelmed/i
  ],
  depression: [
    /depression/i, /depressed/i, /clinical.*depression/i, /major.*depression/i,
    /feeling.*down/i, /no.*energy/i, /can.*t.*get.*out.*bed/i
  ],
  stress: [
    /stress/i, /stressed/i, /overwhelmed/i, /too.*much.*pressure/i,
    /can.*t.*handle/i, /burnout/i, /exhausted/i
  ],
  grief: [
    /grief/i, /grieving/i, /lost.*someone/i, /death/i, /passed.*away/i,
    /bereaved/i, /mourning/i
  ],
  relationship: [
    /relationship.*problems/i, /marriage.*problems/i, /dating.*problems/i,
    /breakup/i, /divorce/i, /cheating/i, /trust.*issues/i, /communication.*problems/i
  ],
  work: [
    /work.*stress/i, /job.*problems/i, /boss.*problems/i, /workplace.*bully/i,
    /job.*loss/i, /unemployment/i, /career.*problems/i
  ],
  financial: [
    /money.*problems/i, /financial.*stress/i, /debt/i, /bills/i,
    /can.*t.*pay/i, /financial.*crisis/i, /money.*worries/i
  ],
  health: [
    /health.*problems/i, /medical.*issues/i, /chronic.*pain/i, /illness/i,
    /sick/i, /health.*worries/i, /medical.*stress/i
  ],
  call_help: [
    /call.*help/i, /need.*help/i, /emergency/i, /urgent/i, /immediate.*help/i,
    /crisis/i, /help.*now/i
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
    case 'depression':
      response = getRandomResponse(CHATBOT_RESPONSES.depression)
      break
    case 'stress':
      response = getRandomResponse(CHATBOT_RESPONSES.stress)
      break
    case 'grief':
      response = getRandomResponse(CHATBOT_RESPONSES.grief)
      break
    case 'relationship':
      response = getRandomResponse(CHATBOT_RESPONSES.relationship)
      break
    case 'work':
      response = getRandomResponse(CHATBOT_RESPONSES.work)
      break
    case 'financial':
      response = getRandomResponse(CHATBOT_RESPONSES.financial)
      break
    case 'health':
      response = getRandomResponse(CHATBOT_RESPONSES.health)
      break
    case 'call_help':
      response = getRandomResponse(CHATBOT_RESPONSES.call_help)
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
    
    // Create streaming response compatible with useChat
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send request to Hope AI
          const hopeResponse = await fetch('http://localhost:5001/counsel', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: lastMessage.content,
              user_id: userId
            })
          })

          if (!hopeResponse.ok) {
            throw new Error(`Hope AI request failed: ${hopeResponse.status}`)
          }

          const hopeData = await hopeResponse.json()
          const response = hopeData.response || "I'm here to listen and support you. How are you feeling right now?"
          
          // Send the full response as a single chunk for useChat compatibility
          const responseData = {
            id: Date.now().toString(),
            role: 'assistant',
            content: response
          }
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(responseData)}\n\n`))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Error calling Hope AI:', error)
          // Fallback to local response if Hope is not available
          const fallbackResponse = generateResponse(lastMessage.content, userId)
          const responseData = {
            id: Date.now().toString(),
            role: 'assistant',
            content: fallbackResponse
          }
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(responseData)}\n\n`))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        }
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
