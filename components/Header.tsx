"use client";

import { Scale, Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="glass safe-top">
      <div className="flex items-center justify-between px-4 py-4">
        {/* Menu Button */}
        <button
          type="button"
          onClick={onMenuClick}
          className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-gray-400" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            {/* Subtle glow */}
            <div className="absolute inset-0 rounded-xl bg-primary-600/20 blur-xl -z-10"></div>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white tracking-tight">
              ALEXUS
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">
              Legal Assistant
            </p>
          </div>
        </div>

        {/* Placeholder for balance */}
        <div className="w-10 h-10" />
      </div>

      {/* Status Indicator */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-center gap-2 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse-soft"></span>
          <span className="text-gray-500">Philippine Law Specialist</span>
        </div>
      </div>
    </header>
  );
}
