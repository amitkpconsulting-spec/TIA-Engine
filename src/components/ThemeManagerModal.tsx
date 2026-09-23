import React, { useState, useMemo } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Sparkles, 
  Code, 
  Check, 
  AlertCircle, 
  Palette, 
  Sun, 
  Moon, 
  ExternalLink,
  Layers,
  HelpCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { PRESET_THEME_CODES, parseThemeCode } from '../utils/themeCodeParser';

interface ThemeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeManagerModal: React.FC<ThemeManagerModalProps> = ({ isOpen, onClose }) => {
  const { currentTheme, customThemes, addThemeByCode, removeTheme, setTheme } = useTheme();

  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'add' | 'manage'>('add');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Live parsed preview of whatever the user types or pastes
  const livePreview = useMemo(() => {
    if (!inputCode.trim()) return null;
    const res = parseThemeCode(inputCode);
    return res.success && res.theme ? res.theme : null;
  }, [inputCode]);

  if (!isOpen) return null;

  const handleAddTheme = () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!inputCode.trim()) {
      setErrorMsg('Please enter a theme code, CSS variables block, or JSON configuration.');
      return;
    }

    const res = addThemeByCode(inputCode);
    if (!res.success || !res.theme) {
      setErrorMsg(res.error || 'Failed to import theme from code.');
      return;
    }

    setSuccessMsg(`Successfully added and applied "${res.theme.name}"!`);
    setInputCode('');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1200);
  };

  const handleRemoveTheme = (id: string, name: string) => {
    const success = removeTheme(id);
    if (success) {
      setConfirmDeleteId(null);
      setSuccessMsg(`Removed theme "${name}".`);
      setTimeout(() => setSuccessMsg(null), 2000);
    }
  };

  const samplePresets = [
    { code: 'cmm2mehjy000004ibgt6g0rbu', name: 'Stella (TweakCN)', desc: 'Official warm retro amber' },
    { code: 'tokyo-night', name: 'Tokyo Night', desc: 'Neon cyber dark' },
    { code: 'catppuccin-mocha', name: 'Catppuccin', desc: 'Lavender pastel dark' },
    { code: 'dracula', name: 'Dracula', desc: 'Vampire pink & purple' },
    { code: 'emerald-matrix', name: 'Emerald Matrix', desc: 'Security terminal' },
    { code: 'rose-pine', name: 'Rosé Pine', desc: 'Warm pine & foam' },
    { code: 'amethyst-void', name: 'Amethyst', desc: 'Royal ultraviolet' },
    { code: 'paper-light', name: 'Paper Light', desc: 'Warm editorial daylight' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs font-mono text-[#D1D5DB]">
      <div 
        className="bg-[#0F0F10] border border-[#262626] rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#262626] flex items-center justify-between bg-[#141415]/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#FFAA6B]/15 text-[#FFAA6B] border border-[#FFAA6B]/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span>Theme Code Facility</span>
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-[#FFAA6B]/20 text-[#FFAA6B] border border-[#FFAA6B]/40">
                  TweakCN Ready
                </span>
              </h2>
              <p className="text-xs text-[#A1A1AA]">
                Import, preview, and remove themes via TweakCN code, CSS variables, or JSON
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#71717A] hover:text-white hover:bg-[#1F1F21] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-5 pt-3 border-b border-[#262626] flex items-center gap-2 bg-[#0F0F10]">
          <button
            onClick={() => setActiveTab('add')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'add'
                ? 'border-[#FFAA6B] text-[#FFAA6B]'
                : 'border-transparent text-[#71717A] hover:text-[#D1D5DB]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Theme by Code</span>
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'manage'
                ? 'border-[#FFAA6B] text-[#FFAA6B]'
                : 'border-transparent text-[#71717A] hover:text-[#D1D5DB]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Custom Themes ({customThemes.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'add' ? (
            <div className="space-y-4">
              {/* Input Area */}
              <div>
                <label className="block text-xs font-bold text-[#E5E7EB] mb-1.5 flex items-center justify-between">
                  <span>Enter Theme Code, TweakCN Identifier, or CSS Snippet:</span>
                  <span className="text-[10px] text-[#A1A1AA] font-normal">
                    Supports code IDs, URLs, CSS vars, & hex seeds
                  </span>
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={inputCode}
                    onChange={(e) => {
                      setInputCode(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="e.g. cmm2mehjy000004ibgt6g0rbu OR tokyo-night OR --primary: #3b82f6; --background: #0f172a;"
                    className="w-full bg-[#141415] border border-[#262626] rounded-xl p-3 text-xs text-[#E5E7EB] placeholder-[#71717A] focus:border-[#FFAA6B] focus:outline-none font-mono transition-colors"
                  />
                  {inputCode && (
                    <button
                      onClick={() => setInputCode('')}
                      className="absolute top-2.5 right-2.5 text-xs text-[#71717A] hover:text-[#D1D5DB] bg-[#1F1F21] px-1.5 py-0.5 rounded"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Preset Selector Chips */}
              <div>
                <div className="text-[11px] font-bold text-[#A1A1AA] mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#FFAA6B]" />
                  <span>Popular Theme Codes (Click to autofill):</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {samplePresets.map((preset) => (
                    <button
                      key={preset.code}
                      onClick={() => setInputCode(preset.code)}
                      className={`text-left p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                        inputCode === preset.code
                          ? 'bg-[#1F1F21] border-[#FFAA6B] text-white shadow-xs'
                          : 'bg-[#141415] hover:bg-[#18181A] border-[#262626] text-[#A1A1AA] hover:text-[#E5E7EB]'
                      }`}
                    >
                      <div className="font-bold truncate text-[11px] text-[#D1D5DB]">{preset.name}</div>
                      <div className="text-[9px] text-[#71717A] truncate font-mono mt-0.5">{preset.code}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Card */}
              {livePreview && (
                <div className="p-4 rounded-xl border border-[#3F3F46] bg-[#141415] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1">
                      <Code className="w-3 h-3 text-[#FFAA6B]" />
                      Live Theme Parser Preview
                    </span>
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded font-bold"
                      style={{
                        backgroundColor: `${livePreview.accentColor}25`,
                        color: livePreview.accentColor,
                        border: `1px solid ${livePreview.accentColor}50`,
                      }}
                    >
                      {livePreview.badgeText}
                    </span>
                  </div>

                  {/* Swatch & Palette display */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg border border-black/20"
                    style={{ backgroundColor: livePreview.bgPreviewColor }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg border border-white/20 flex flex-col overflow-hidden shrink-0 shadow-md relative"
                        style={{ backgroundColor: livePreview.bgPreviewColor }}
                      >
                        <div
                          className="h-1/2 w-full"
                          style={{ backgroundColor: livePreview.cardPreviewColor }}
                        />
                        <div
                          className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border border-black/30 shadow-xs"
                          style={{ backgroundColor: livePreview.accentColor }}
                        />
                      </div>
                      <div>
                        <div 
                          className="text-sm font-bold"
                          style={{ color: livePreview.colors?.textStrong || '#FFFFFF' }}
                        >
                          {livePreview.name}
                        </div>
                        <div 
                          className="text-[11px] line-clamp-1"
                          style={{ color: livePreview.colors?.textMuted || '#A1A1AA' }}
                        >
                          {livePreview.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-1 rounded border border-white/10"
                        style={{
                          backgroundColor: livePreview.cardPreviewColor,
                          color: livePreview.colors?.text || '#E2E8F0',
                          borderColor: livePreview.colors?.border || '#3F3F46',
                        }}
                      >
                        Card Surface
                      </span>
                      <span className="text-[10px] px-2 py-1 rounded font-bold"
                        style={{
                          backgroundColor: livePreview.accentColor,
                          color: livePreview.colors?.accentText || '#000000',
                        }}
                      >
                        Accent
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#A1A1AA] hover:text-white bg-[#141415] hover:bg-[#1E1E22] border border-[#262626] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddTheme}
                  disabled={!inputCode.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#FFAA6B] hover:bg-[#FFB76C] text-black shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add & Apply Theme</span>
                </button>
              </div>
            </div>
          ) : (
            /* Manage / Remove Tab */
            <div className="space-y-3">
              <div className="text-xs text-[#A1A1AA] pb-1">
                Custom themes added via theme codes can be activated or deleted below:
              </div>

              {customThemes.length === 0 ? (
                <div className="text-center py-10 bg-[#141415] border border-dashed border-[#262626] rounded-xl space-y-2">
                  <Palette className="w-8 h-8 mx-auto text-[#71717A]" />
                  <div className="text-xs font-bold text-[#E5E7EB]">No Custom Themes Added Yet</div>
                  <p className="text-[11px] text-[#A1A1AA] max-w-sm mx-auto">
                    Use the "Add Theme by Code" tab to import your favorite TweakCN or shadcn presets!
                  </p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="mt-2 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#FFAA6B]/20 text-[#FFAA6B] border border-[#FFAA6B]/40 hover:bg-[#FFAA6B]/30"
                  >
                    Import First Theme
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {customThemes.map((theme) => {
                    const isActive = theme.id === currentTheme;
                    const isConfirming = confirmDeleteId === theme.id;

                    return (
                      <div
                        key={theme.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                          isActive
                            ? 'bg-[#1C1710] border-[#FFAA6B]/50'
                            : 'bg-[#141415] border-[#262626]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Palette preview */}
                          <div
                            className="w-9 h-9 rounded-lg border border-black/30 flex flex-col overflow-hidden shrink-0 shadow-xs relative"
                            style={{ backgroundColor: theme.bgPreviewColor }}
                          >
                            <div
                              className="h-1/2 w-full"
                              style={{ backgroundColor: theme.cardPreviewColor }}
                            />
                            <div
                              className="absolute bottom-1 right-1 w-3 h-3 rounded-full border border-black/30"
                              style={{ backgroundColor: theme.accentColor }}
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#E5E7EB] truncate">
                                {theme.name}
                              </span>
                              {theme.isDark ? (
                                <Moon className="w-3 h-3 text-[#A1A1AA]" />
                              ) : (
                                <Sun className="w-3 h-3 text-amber-500" />
                              )}
                              {isActive && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-[#FFAA6B] text-black">
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#A1A1AA] truncate font-mono">
                              Code: {theme.code || theme.id}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          {!isActive && (
                            <button
                              onClick={() => setTheme(theme.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-[#1F1F21] hover:bg-[#262626] text-[#D1D5DB] border border-[#262626] cursor-pointer"
                            >
                              Apply
                            </button>
                          )}

                          {isConfirming ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleRemoveTheme(theme.id, theme.name)}
                                className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold cursor-pointer"
                              >
                                Confirm Delete
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1 rounded bg-[#262626] text-[#A1A1AA] hover:text-white text-[11px]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(theme.id)}
                              className="p-1.5 rounded-lg text-[#71717A] hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/40 transition-colors cursor-pointer"
                              title="Remove theme"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="px-5 py-3 border-t border-[#262626] bg-[#141415]/30 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#71717A]">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#FFAA6B]" />
            <span>Theme codes apply dynamically across 100% of UI elements and persist in your browser.</span>
          </div>
          <a
            href="https://tweakcn.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#FFAA6B] hover:underline"
          >
            <span>Browse TweakCN</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
