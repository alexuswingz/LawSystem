"use client";

import { Scale, BookOpen, Users, FileText, Shield, Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  {
    icon: Users,
    title: "Labor Rights",
    question: "What are my rights as an employee in the Philippines?",
  },
  {
    icon: FileText,
    title: "Contracts",
    question: "What makes a contract valid under Philippine law?",
  },
  {
    icon: Shield,
    title: "Criminal Law",
    question: "What is the difference between theft and robbery?",
  },
  {
    icon: BookOpen,
    title: "Family Law",
    question: "How does annulment work in the Philippines?",
  },
];

export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 animate-fade-in">
      {/* Logo */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
          <Scale className="w-10 h-10 text-white" />
        </div>
        {/* Glow effect */}
        <div className="absolute -inset-4 bg-primary-600/20 rounded-full blur-2xl -z-10"></div>
      </div>

      {/* Branding */}
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight mb-1">
          ALEXUS
        </h1>
        <p className="text-[11px] text-gray-500 uppercase tracking-[0.25em] mb-4">
          Legal Assistant
        </p>
        <p className="text-gray-400 text-sm max-w-xs">
          Your AI-powered guide to Philippine Law. Ask me anything about your legal concerns.
        </p>
      </div>

      {/* Features */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <FeatureBadge icon={Scale} text="Philippine Law" />
        <FeatureBadge icon={Sparkles} text="AI Powered" />
        <FeatureBadge icon={Shield} text="Private & Secure" />
      </div>

      {/* Suggestion Cards */}
      <div className="w-full max-w-sm space-y-2">
        <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium px-1 mb-3">
          Popular Questions
        </p>
        {suggestions.map((item, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(item.question)}
            className="w-full surface rounded-xl p-4 text-left hover:bg-dark-50 transition-all duration-200 active:scale-[0.98] group"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-600/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-600/20 transition-colors">
                <item.icon className="w-4 h-4 text-primary-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white mb-0.5">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {item.question}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function FeatureBadge({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-50 border border-dark-50 text-xs text-gray-400">
      <Icon className="w-3 h-3 text-primary-500" />
      {text}
    </span>
  );
}
