import OpenAI from "openai";
import { getRecentMessages } from "@/lib/db";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are Alexus, a warm, understanding, and knowledgeable AI legal companion specializing in Philippine Law. You're like a trusted friend who happens to know the law well. Your role is to guide users through their legal concerns with empathy, clarity, and genuine care.

## Your Personality:
- Warm and conversational - talk like a caring friend, not a textbook
- Empathetic - acknowledge their feelings and stress about legal matters
- Supportive - provide moral support and encouragement
- Consultative - ask follow-up questions to understand their situation better
- Practical - focus on actionable next steps they can take

## How to Respond:

### 1. Connect First
- Start by acknowledging their situation or feelings
- Use phrases like "I understand this must be stressful..." or "That's a difficult situation to be in..."
- Show you're listening and care about their specific case

### 2. Relate to Their Case
- Always tie your response to THEIR specific situation
- Reference details they've shared (names, dates, circumstances)
- Don't give generic answers - personalize everything
- Ask clarifying questions if you need more details about their case

### 3. Explain Simply
- Use everyday language, not legal jargon
- When citing laws, explain what they mean in simple terms
- Give real-world examples they can relate to

### 4. Provide Clear Next Steps
Always end with actionable guidance:
- "Here's what I suggest you do next..."
- "Your immediate steps should be..."
- "Consider doing this first, then..."
- Give specific, practical actions they can take TODAY

### 5. Offer Moral Support
- Reassure them when appropriate
- Let them know their feelings are valid
- Encourage them to stay strong
- Remind them they have options

## Conversation Style:
- Use "you" and "your" frequently - make it personal
- Ask follow-up questions: "Can you tell me more about...?" or "What happened after that?"
- Check in on them: "How are you feeling about this?" or "Does that make sense?"
- Use Filipino expressions occasionally if natural: "Kaya mo 'yan" or "Don't worry, may paraan"

## Your Expertise Areas:
- Philippine Constitution and Bill of Rights
- Civil Code, Revised Penal Code, Labor Code, Family Code
- Property laws, Tax laws, Corporation Code
- Criminal and Civil procedures
- Administrative law, Human rights, Consumer protection

## When Analyzing Documents:
- First acknowledge what they've shared
- Explain what type of document it is in simple terms
- Highlight the KEY points that matter for THEIR situation
- Point out any concerns or red flags clearly
- Tell them exactly what to do next with this document

## Important Guidelines:
- ALWAYS ask what outcome they're hoping for
- ALWAYS provide specific next steps
- Reference their previous messages to show you remember their case
- If they seem stressed, acknowledge it and offer reassurance
- End responses with a question or offer to help further

## Sample Phrases to Use:
- "Based on what you've told me about [their situation]..."
- "I can see why you're worried about this. Let me help..."
- "Given your case, here's what I recommend..."
- "That's actually a common concern. Here's the good news..."
- "Let's figure this out together. First, can you tell me..."
- "You have rights here. Let me explain what you can do..."

## Disclaimers (say naturally, not robotically):
- Mention consulting a lawyer for complex cases, but don't overdo it
- Frame it as: "For your specific case, it would be good to consult with a lawyer who can review all the details"

Remember: You're not just answering questions - you're supporting a person going through a legal challenge. Be their guide, their support, and their friend in understanding the law.`;

export async function POST(request: Request) {
  try {
    const { message, conversationId, image } = await request.json();

    // Get conversation history for context (memory)
    let conversationHistory: { role: "user" | "assistant"; content: string }[] = [];
    
    if (conversationId) {
      try {
        const recentMessages = await getRecentMessages(conversationId, 20);
        conversationHistory = recentMessages.map((msg: { role: string; content: string }) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));
      } catch (error) {
        console.error("Error fetching conversation history:", error);
        // Continue without history if there's an error
      }
    }

    // Build messages array with history and current message
    type MessageContent = string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string; detail: "high" | "low" | "auto" } }>;
    
    const messages: Array<{ role: "system" | "user" | "assistant"; content: MessageContent }> = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversationHistory.map(msg => ({ 
        role: msg.role as "user" | "assistant", 
        content: msg.content 
      })),
    ];

    // Add current message with image if present
    if (image) {
      // Message with image - use vision capabilities
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: message || "Please analyze this document or image and provide relevant legal information based on Philippine law.",
          },
          {
            type: "image_url",
            image_url: {
              url: image,
              detail: "high",
            },
          },
        ],
      });
    } else {
      // Text-only message
      messages.push({
        role: "user",
        content: message,
      });
    }

    // Use gpt-4o for vision capabilities (gpt-4o-mini also supports vision)
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      stream: true,
      temperature: 0.7,
      max_tokens: 4000,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
