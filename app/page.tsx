"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { ChatInterface } from "@/components/ChatInterface";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { Sidebar, Conversation } from "@/components/Sidebar";
import { Send } from "lucide-react";
import { getUserId } from "@/lib/user";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Initialize database and load conversations on mount
  useEffect(() => {
    const init = async () => {
      try {
        // Get or create user ID
        const id = getUserId();
        setUserId(id);
        
        // Initialize database tables
        await fetch("/api/init-db", { method: "POST" });
        
        // Load conversations for this user
        if (id) {
          await loadConversationsForUser(id);
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsLoadingConversations(false);
      }
    };
    init();
  }, []);

  const loadConversationsForUser = async (uid: string) => {
    try {
      const response = await fetch(`/api/conversations?userId=${uid}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const loadConversations = async () => {
    if (userId) {
      await loadConversationsForUser(userId);
    }
  };

  const loadMessages = useCallback(async (conversationId: number) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(
          data.map((msg: { id: number; role: string; content: string; created_at: string }) => ({
            id: msg.id.toString(),
            role: msg.role as "user" | "assistant",
            content: msg.content,
            timestamp: new Date(msg.created_at),
          }))
        );
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  }, []);

  const handleSelectConversation = async (conversationId: number) => {
    setCurrentConversationId(conversationId);
    await loadMessages(conversationId);
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  const handleDeleteConversation = async (conversationId: number) => {
    try {
      await fetch(`/api/conversations/${conversationId}`, { method: "DELETE" });
      await loadConversations();
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      // Create conversation if this is the first message
      let conversationId = currentConversationId;
      if (!conversationId && userId) {
        const createResponse = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            userId: userId,
            title: userMessage.content.slice(0, 50) + (userMessage.content.length > 50 ? "..." : "") 
          }),
        });
        if (createResponse.ok) {
          const newConversation = await createResponse.json();
          conversationId = newConversation.id;
          setCurrentConversationId(conversationId);
          await loadConversations();
        }
      }

      // Send message to API with conversation context
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      let fullContent = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          fullContent += chunk;

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, content: fullContent }
                : m
            )
          );
        }
      }

      // Save messages to database after streaming is complete
      if (conversationId) {
        await fetch(`/api/conversations/${conversationId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userMessage: userMessage.content,
            assistantMessage: fullContent,
          }),
        });
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    textareaRef.current?.focus();
  };

  return (
    <>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        isLoading={isLoadingConversations}
      />

      <main className="flex flex-col h-screen h-[100dvh] max-w-2xl mx-auto">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <div className="flex-1 overflow-hidden flex flex-col">
          {messages.length === 0 ? (
            <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
          ) : (
            <ChatInterface
              messages={messages}
              isLoading={isLoading}
              messagesEndRef={messagesEndRef}
            />
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 safe-bottom">
          <form onSubmit={handleSubmit} className="relative">
            <div className="surface rounded-2xl p-2 flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask about Philippine Law..."
                className="flex-1 bg-transparent text-white placeholder-gray-600 resize-none px-3 py-2.5 focus:outline-none text-sm leading-relaxed"
                rows={1}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Disclaimer */}
          <p className="text-center text-[10px] text-gray-600 mt-3 px-4">
            Alexus provides general legal information only. For specific legal
            advice, please consult a licensed attorney.
          </p>
        </div>
      </main>
    </>
  );
}
