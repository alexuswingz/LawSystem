"use client";

import { MessageSquare, Plus, Trash2, X } from "lucide-react";

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  currentConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: number) => void;
  isLoading: boolean;
}

export function Sidebar({
  isOpen,
  onClose,
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isLoading,
}: SidebarProps) {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 z-50 h-full w-80 max-w-[85vw] surface-elevated flex flex-col animate-slide-in-left"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="font-display font-semibold text-white">
            Conversations
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* New Conversation Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewConversation();
              onClose();
            }}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm text-white"
          >
            <Plus className="w-4 h-4" />
            New Conversation
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No conversations yet</p>
              <p className="text-gray-600 text-xs mt-1">
                Start a new conversation to get help
              </p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group relative flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  currentConversationId === conversation.id
                    ? "bg-primary-600/20 border border-primary-600/30"
                    : "hover:bg-white/5"
                }`}
                onClick={() => {
                  onSelectConversation(conversation.id);
                  onClose();
                }}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    currentConversationId === conversation.id
                      ? "bg-primary-600/30"
                      : "bg-white/5"
                  }`}
                >
                  <MessageSquare
                    className={`w-4 h-4 ${
                      currentConversationId === conversation.id
                        ? "text-primary-400"
                        : "text-gray-500"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      currentConversationId === conversation.id
                        ? "text-white"
                        : "text-gray-300"
                    }`}
                  >
                    {conversation.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDate(conversation.updated_at)}
                  </p>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/20 transition-all"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <p className="text-[10px] text-gray-600 text-center">
            Your conversations are saved securely
          </p>
        </div>
      </aside>
    </>
  );
}
