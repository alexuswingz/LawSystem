import { addMessage, getMessages } from "@/lib/db";
import { NextResponse } from "next/server";

// GET - Get all messages for a conversation
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = parseInt(params.id);
    const messages = await getMessages(conversationId);
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST - Add messages to conversation (both user and assistant)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = parseInt(params.id);
    const { userMessage, assistantMessage, userImage } = await request.json();

    // Save user message with optional image
    if (userMessage || userImage) {
      await addMessage(conversationId, "user", userMessage || "", userImage);
    }

    // Save assistant message
    if (assistantMessage) {
      await addMessage(conversationId, "assistant", assistantMessage);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding messages:", error);
    return NextResponse.json(
      { error: "Failed to add messages" },
      { status: 500 }
    );
  }
}
