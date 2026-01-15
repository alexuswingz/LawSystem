"use client";

import { RefObject } from "react";
import { Message } from "@/app/page";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
}

export function ChatInterface({
  messages,
  isLoading,
  messagesEndRef,
}: ChatInterfaceProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          isLatest={index === messages.length - 1}
        />
      ))}

      {isLoading && messages[messages.length - 1]?.role === "user" && (
        <TypingIndicator />
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
