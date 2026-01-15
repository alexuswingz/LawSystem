"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { ChatInterface } from "@/components/ChatInterface";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { Sidebar, Conversation } from "@/components/Sidebar";
import { Send, ImagePlus, X } from "lucide-react";
import { getUserId } from "@/lib/user";
import Image from "next/image";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  image?: string; // Base64 image data
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          data.map((msg: { id: number; role: string; content: string; created_at: string; image_url?: string }) => ({
            id: msg.id.toString(),
            role: msg.role as "user" | "assistant",
            content: msg.content,
            timestamp: new Date(msg.created_at),
            image: msg.image_url || undefined,
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("Image size must be less than 10MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim() || (selectedImage ? "Please analyze this document/image." : ""),
      timestamp: new Date(),
      image: selectedImage || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    const imageToSend = selectedImage;
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      // Create conversation if this is the first message
      let conversationId = currentConversationId;
      if (!conversationId && userId) {
        const title = userMessage.content 
          ? userMessage.content.slice(0, 50) + (userMessage.content.length > 50 ? "..." : "")
          : "Document Analysis";
        const createResponse = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            userId: userId,
            title: title
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
          image: imageToSend,
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
            userImage: imageToSend,
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

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-30">
        <div className="max-w-2xl mx-auto">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>
      </div>

      {/* Main Content Area - with padding for fixed header and input */}
      <main className="flex flex-col min-h-screen min-h-[100dvh] max-w-2xl mx-auto pt-[120px] pb-[100px]">
        <div className="flex-1 flex flex-col">
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
      </main>

      {/* Fixed Input Area */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-black/95 backdrop-blur-lg border-t border-white/5">
        <div className="max-w-2xl mx-auto px-3 pt-2 pb-3 safe-bottom">
          {/* Image Preview */}
          {selectedImage && (
            <div className="mb-2 relative inline-block">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-white/10">
                <Image
                  src={selectedImage}
                  alt="Selected"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={removeSelectedImage}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="surface rounded-xl p-1.5 flex items-end gap-1">
              {/* Image Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                title="Upload image"
              >
                <ImagePlus className="w-5 h-5 text-gray-500" />
              </button>

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
                placeholder={selectedImage ? "Describe this image..." : "Ask about Philippine Law..."}
                className="flex-1 bg-transparent text-white placeholder-gray-600 resize-none px-2 py-2 focus:outline-none text-sm leading-snug"
                rows={1}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={(!input.trim() && !selectedImage) || isLoading}
                className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all duration-200 flex-shrink-0 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Disclaimer */}
          <p className="text-center text-[9px] text-gray-600 mt-2">
            For specific legal advice, consult a licensed attorney.
          </p>
        </div>
      </div>
    </>
  );
}
