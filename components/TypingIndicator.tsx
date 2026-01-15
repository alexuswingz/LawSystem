"use client";

import { Scale } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800">
        <Scale className="w-4 h-4 text-white" />
      </div>

      {/* Typing Dots */}
      <div className="message-ai px-4 py-3 rounded-2xl rounded-tl-md">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 typing-dot"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 typing-dot"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 typing-dot"></span>
        </div>
      </div>
    </div>
  );
}
