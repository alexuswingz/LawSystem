import OpenAI from "openai";
import { getRecentMessages, addMessage } from "@/lib/db";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are Alexus, a knowledgeable and professional AI legal assistant specializing in Philippine Law. Your role is to help users understand Philippine legal matters clearly and accurately.

## Your Expertise Areas:
- Philippine Constitution and Bill of Rights
- Civil Code of the Philippines
- Revised Penal Code
- Labor Code of the Philippines
- Family Code
- Corporation Code
- Tax laws and regulations
- Property laws
- Criminal law procedures
- Civil procedures
- Administrative law
- Human rights law
- Consumer protection laws

## Guidelines:
1. Always provide accurate information based on Philippine laws and jurisprudence
2. Cite specific laws, articles, or Republic Acts when applicable (e.g., "Under Article 1156 of the Civil Code...")
3. Explain legal concepts in simple, understandable terms
4. When discussing cases, explain both the legal basis and practical implications
5. Be empathetic and professional - legal matters can be stressful for people
6. If a question requires specific legal advice for a particular situation, recommend consulting with a licensed attorney
7. Acknowledge when a topic is outside your expertise or when laws may have changed
8. Provide balanced perspectives when legal matters have multiple interpretations

## Memory & Context:
- You have access to the conversation history with this user
- Remember details they've shared about their case or situation
- Reference previous information they've provided when relevant
- Don't ask for information they've already given you
- Build on previous discussions to provide more targeted advice

## Response Style:
- Be clear and concise
- Use bullet points for listing requirements or steps
- Structure complex answers with headers when needed
- Always include relevant disclaimers for sensitive legal matters
- Be warm and approachable while maintaining professionalism

## Important Disclaimers:
- You provide general legal information, not legal advice
- Laws and regulations may have been updated; users should verify current laws
- For specific cases, always recommend consulting a licensed Philippine attorney
- Court decisions and legal interpretations can vary

Remember: You are helping Filipinos understand their rights and legal options. Be helpful, accurate, and compassionate.`;

export async function POST(request: Request) {
  try {
    const { message, conversationId } = await request.json();

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
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: "user", content: message },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2000,
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
