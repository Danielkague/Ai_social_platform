import { NextResponse } from 'next/server'

// Comprehensive mental health resources database
const MENTAL_HEALTH_RESOURCES = {
  crisis: {
    immediate: [
      {
        name: "National Suicide Prevention Lifeline",
        contact: "988",
        description: "24/7 crisis support and suicide prevention",
        available: "24/7",
        type: "phone"
      },
      {
        name: "Crisis Text Line",
        contact: "Text HOME to 741741",
        description: "Text-based crisis support",
        available: "24/7",
        type: "text"
      },
      {
        name: "Emergency Services",
        contact: "911",
        description: "Immediate emergency help",
        available: "24/7",
        type: "phone"
      }
    ]
  },
  therapy: {
    online_platforms: [
      {
        name: "BetterHelp",
        url: "https://www.betterhelp.com",
        description: "Online therapy platform with licensed therapists",
        cost: "Starting at $60/week"
      },
      {
        name: "Talkspace",
        url: "https://www.talkspace.com",
        description: "Online therapy and psychiatry services",
        cost: "Starting at $69/week"
      }
    ],
    directories: [
      {
        name: "Psychology Today",
        url: "https://www.psychologytoday.com/us/therapists",
        description: "Find local therapists by location and specialization"
      }
    ]
  },
  support_groups: [
    {
      name: "NAMI Support Groups",
      url: "https://www.nami.org/Support-Education/Support-Groups",
      description: "Mental health support groups nationwide"
    },
    {
      name: "Depression and Bipolar Support Alliance",
      url: "https://www.dbsalliance.org/support/",
      description: "Support groups for mood disorders"
    }
  ]
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      resources: MENTAL_HEALTH_RESOURCES,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching mental health resources:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
} 