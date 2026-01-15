"use client";

import { Message } from "@/app/page";
import { Scale, User } from "lucide-react";
import React, { useState } from "react";
import Image from "next/image";

interface MessageBubbleProps {
  message: Message;
  isLatest: boolean;
}

export function MessageBubble({ message, isLatest }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [imageExpanded, setImageExpanded] = useState(false);

  return (
    <>
      <div
        className={`flex gap-3 animate-slide-up ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser
              ? "bg-gradient-to-br from-gray-700 to-gray-800"
              : "bg-gradient-to-br from-primary-600 to-primary-800"
          }`}
        >
          {isUser ? (
            <User className="w-4 h-4 text-gray-300" />
          ) : (
            <Scale className="w-4 h-4 text-white" />
          )}
        </div>

        {/* Message Content */}
        <div className={`max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
          <div
            className={`px-4 py-3 rounded-2xl ${
              isUser ? "message-user rounded-tr-md" : "message-ai rounded-tl-md"
            }`}
          >
            {/* Image Display */}
            {message.image && (
              <div className="mb-2">
                <button
                  onClick={() => setImageExpanded(true)}
                  className="block relative w-full max-w-[200px] aspect-[4/3] rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition-colors"
                >
                  <Image
                    src={message.image}
                    alt="Uploaded document"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="text-white text-xs opacity-0 hover:opacity-100">Click to expand</span>
                  </div>
                </button>
              </div>
            )}

            {isUser ? (
              <p className="text-white text-sm leading-relaxed">
                {message.content}
              </p>
            ) : (
              <div className="prose-legal text-sm">
                <FormattedContent content={message.content} />
              </div>
            )}
          </div>

          {/* Timestamp */}
          <p
            className={`text-[10px] text-gray-600 mt-1.5 px-1 ${
              isUser ? "text-right" : "text-left"
            }`}
          >
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>

      {/* Image Modal */}
      {imageExpanded && message.image && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setImageExpanded(false)}
        >
          <div className="relative max-w-full max-h-full">
            <Image
              src={message.image}
              alt="Uploaded document"
              width={800}
              height={600}
              className="max-h-[90vh] w-auto object-contain rounded-lg"
            />
            <button
              onClick={() => setImageExpanded(false)}
              className="absolute top-2 right-2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Helper function to parse inline formatting (bold, italic, code)
function parseInlineFormatting(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    // Find bold text **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);

    if (boldMatch && boldMatch.index !== undefined) {
      // Add text before the match
      if (boldMatch.index > 0) {
        parts.push(remaining.substring(0, boldMatch.index));
      }
      // Add the bold text
      parts.push(
        <strong key={`bold-${keyIndex++}`} className="text-white font-semibold">
          {boldMatch[1]}
        </strong>
      );
      // Continue with remaining text
      remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
    } else {
      // No more matches, add remaining text
      parts.push(remaining);
      break;
    }
  }

  return parts;
}

function FormattedContent({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <>
      {lines.map((line, index) => {
        // Headers
        if (line.startsWith("### ")) {
          return (
            <h3
              key={index}
              className="text-white font-semibold text-sm mt-3 mb-1"
            >
              {parseInlineFormatting(line.replace("### ", ""))}
            </h3>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h2
              key={index}
              className="text-white font-semibold text-base mt-3 mb-1"
            >
              {parseInlineFormatting(line.replace("## ", ""))}
            </h2>
          );
        }

        // Bullet points
        if (line.startsWith("- ") || line.startsWith("• ")) {
          const bulletContent = line.replace(/^[-•]\s/, "");
          return (
            <div key={index} className="flex gap-2 ml-1 my-1">
              <span className="text-primary-500 flex-shrink-0">•</span>
              <span className="text-gray-300">
                {parseInlineFormatting(bulletContent)}
              </span>
            </div>
          );
        }

        // Numbered lists
        if (/^\d+\.\s/.test(line)) {
          const match = line.match(/^(\d+)\.\s(.*)$/);
          if (match) {
            return (
              <div key={index} className="flex gap-2 ml-1 my-1">
                <span className="text-primary-500 font-medium flex-shrink-0 min-w-[1.25rem]">
                  {match[1]}.
                </span>
                <span className="text-gray-300">
                  {parseInlineFormatting(match[2])}
                </span>
              </div>
            );
          }
        }

        // Empty lines
        if (line.trim() === "") {
          return <div key={index} className="h-2" />;
        }

        // Regular paragraph
        return (
          <p key={index} className="text-gray-300 my-1 leading-relaxed">
            {parseInlineFormatting(line)}
          </p>
        );
      })}
    </>
  );
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}
