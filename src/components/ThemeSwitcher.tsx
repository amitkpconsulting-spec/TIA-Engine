import React, { useState, useRef, useEffect } from 'react';
import { 
  Palette, 
  Check, 
  ExternalLink, 
  Sun, 
  Moon, 
  Sparkles, 
  ChevronDown, 
  Plus, 
  Trash2, 
  Code 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ThemeManagerModal } from './ThemeManagerModal';

export const ThemeSwitcher: React.FC = () => {
  const { currentTheme, themeConfig, setTheme, availableThemes, removeTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <div className="relative inline-block text-left" ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-200 cursor-pointer border shadow-sm bg-[#141415] hover:bg-[#1E1E22] text-[#D1D5DB] border-[#262626]"
          title="Switch UI Theme or Add/Remove by Theme Code"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <div className="relative flex items-center justify-center">
            <Palette className="w-3.5 h-3.5" />
            <span
              className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: themeConfig.accentColor }}
            />
          </div>
          <span className="hidden md:inline font-semibold">{themeConfig.name}</span>
          <span className="md:hidden font-semibold">Theme</span>
          <ChevronDown className={`w-3 h-3 text-[#A1A1AA] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-[#262626] bg-[#0F0F10] text-[#D1D5DB] p-2 z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="px-3 py-2 border-b border-[#262626] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FFAA6B]" />
                <div>
                  <div className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                    Theme Switcher
                  </div>
                  <div className="text-[10px] text-[#A1A1AA]">
                    TweakCN & Custom Themes
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsManagerOpen(true);
                }}
                className="text-[10px] font-mono px-2 py-1 rounded bg-[#FFAA6B]/20 text-[#FFAA6B] hover:bg-[#FFAA6B]/30 border border-[#FFAA6B]/40 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="Add or remove theme using code"
              >
                <Code className="w-3 h-3" />
                <span>Code Tool</span>
              </button>
            </div>

            {/* Theme list */}
            <div className="py-1.5 space-y-1 max-h-72 overflow-y-auto custom-scrollbar">
              {availableThemes.map((theme) => {
                const isSelected = theme.id === currentTheme;
                const isCustom = !!theme.isCustom;

                return (
                  <div
                    key={theme.id}
                    className={`w-full text-left p-2 rounded-lg flex items-center gap-2.5 transition-colors group border ${
                      isSelected
                        ? 'bg-[#1F1F21] border-[#FFAA6B]/50'
                        : 'bg-transparent hover:bg-[#141415] border-transparent'
                    }`}
                  >
                    {/* Clickable Area for Theme Selection */}
                    <button
                      onClick={() => {
                        setTheme(theme.id);
                        setIsOpen(false);
                      }}
                      className="flex-1 flex items-center gap-2.5 min-w-0 text-left cursor-pointer"
                    >
                      {/* Swatch palette preview */}
                      <div
                        className="w-7 h-7 rounded-md border border-black/30 flex flex-col overflow-hidden shrink-0 shadow-xs relative"
                        style={{ backgroundColor: theme.bgPreviewColor }}
                      >
                        <div
                          className="h-1/2 w-full"
                          style={{ backgroundColor: theme.cardPreviewColor }}
                        />
                        <div
                          className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-black/30"
                          style={{ backgroundColor: theme.accentColor }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold font-sans truncate text-inherit">
                            {theme.name}
                          </span>
                          {theme.isDark ? (
                            <Moon className="w-3 h-3 text-[#A1A1AA] shrink-0" />
                          ) : (
                            <Sun className="w-3 h-3 text-amber-500 shrink-0" />
                          )}
                          {isCustom && (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-800/40 shrink-0">
                              custom
                            </span>
                          )}
                        </div>

                        {theme.code && (
                          <p className="text-[10px] text-[#71717A] truncate font-mono">
                            {theme.code}
                          </p>
                        )}
                      </div>

                      {/* Check icon */}
                      {isSelected && (
                        <div className="shrink-0">
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: theme.accentColor, color: '#000000' }}
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        </div>
                      )}
                    </button>

                    {/* Remove button for custom themes */}
                    {isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTheme(theme.id);
                        }}
                        className="p-1 rounded text-[#71717A] hover:text-red-400 hover:bg-red-950/40 transition-colors shrink-0 cursor-pointer"
                        title={`Remove custom theme "${theme.name}"`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Action to Add Theme by Code */}
            <div className="mt-1 pt-2 border-t border-[#262626] flex items-center justify-between gap-2 px-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsManagerOpen(true);
                }}
                className="w-full py-1.5 px-2 rounded-lg bg-[#141415] hover:bg-[#1E1E22] text-[#FFAA6B] hover:text-[#FFB76C] border border-[#262626] text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add / Remove Theme by Code</span>
              </button>
            </div>

            {/* Footer citation */}
            <div className="mt-1 pt-1.5 border-t border-[#262626] px-2 py-1 text-[10px] text-[#71717A] flex items-center justify-between font-mono">
              <span>Code: cmm2mehjy000004ibgt6g0rbu</span>
              <a
                href="https://tweakcn.com/themes/cmm2mehjy000004ibgt6g0rbu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FFAA6B] hover:underline flex items-center gap-1"
              >
                <span>TweakCN</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Theme Manager Modal */}
      <ThemeManagerModal
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
      />
    </>
  );
};
