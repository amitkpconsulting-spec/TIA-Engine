import React, { useState, useEffect } from 'react';
import { 
  X, 
  FolderOpen, 
  Search, 
  Check, 
  ShieldCheck, 
  Globe, 
  ArrowRight, 
  Building2, 
  Cpu, 
  Server, 
  Lock, 
  FileText 
} from 'lucide-react';
import { TransferProfile } from '../types/tia';
import { CASE_STUDIES } from '../data/caseStudies';

interface PresetGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfileId: string;
  onSelectPreset: (preset: TransferProfile) => void;
}

const COUNTRY_FLAGS: Record<string, string> = {
  'United States': '🇺🇸',
  'India': '🇮🇳',
  'Singapore': '🇸🇬',
  'Canada': '🇨🇦',
  'Israel': '🇮🇱',
  'Switzerland': '🇨🇭',
  'Australia': '🇦🇺',
  'Japan': '🇯🇵',
  'Germany': '🇩🇪',
  'United Arab Emirates': '🇦🇪',
  'Brazil': '🇧🇷',
  'South Africa': '🇿🇦',
  'Hong Kong': '🇭🇰',
  'United Kingdom': '🇬🇧',
};

export const PresetGalleryModal: React.FC<PresetGalleryModalProps> = ({
  isOpen,
  onClose,
  currentProfileId,
  onSelectPreset,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'bank' | 'insurer' | 'investment_firm' | 'payment_institution'>('all');

  // Keyboard shortcut listener (Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const presetsList = Object.values(CASE_STUDIES);

  const filteredPresets = presetsList.filter(preset => {
    const matchesFilter = selectedFilter === 'all' || preset.exporterType === selectedFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      preset.title.toLowerCase().includes(q) ||
      preset.importerCountry.toLowerCase().includes(q) ||
      preset.exporterName.toLowerCase().includes(q) ||
      preset.importerName.toLowerCase().includes(q) ||
      preset.transferMechanism.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-mono"
      onClick={onClose}
    >
      <div 
        className="bg-[#0F0F10] border border-[#262626] rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#262626] bg-[#141415]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Preset Transfer Assessment Library
                </h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800 font-semibold">
                  14 Industry Presets
                </span>
              </div>
              <p className="text-[11px] text-[#71717A] mt-0.5">
                Select a regulated financial services scenario to auto-populate all assessment steps, legal instruments, and technical controls.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-[#71717A] hover:text-white hover:bg-[#262626] rounded-lg transition-colors cursor-pointer"
            title="Close modal (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-[#1F1F22] bg-[#0A0A0B] flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Presets (14)' },
              { id: 'bank', label: '🏦 Banks' },
              { id: 'insurer', label: '🛡️ Insurers' },
              { id: 'investment_firm', label: '⚡ Investment / AI' },
              { id: 'payment_institution', label: '💳 Payments & FinTech' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedFilter === tab.id
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-[#141415] text-[#71717A] hover:text-[#D1D5DB] border border-[#262626]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by vendor, country, tool..."
              className="w-full bg-[#141415] border border-[#262626] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#52525B] focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Presets Grid */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3 bg-[#0A0A0B]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredPresets.map((preset) => {
              const isCurrent = preset.id === currentProfileId;
              const flag = COUNTRY_FLAGS[preset.importerCountry] || '🌐';
              const sensitiveCount = Object.values(preset.dataCategories).filter(Boolean).length;

              return (
                <div
                  key={preset.id}
                  className={`bg-[#121214] border rounded-xl p-4 flex flex-col justify-between transition-all hover:border-emerald-500/50 ${
                    isCurrent ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-[#262626]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl" title={preset.importerCountry}>{flag}</span>
                        <span className="text-[10px] uppercase font-bold text-[#71717A]">
                          {preset.exporterType.replace('_', ' ')}
                        </span>
                        {preset.isMaterialOutsourcing && (
                          <span className="text-[9px] bg-amber-950/60 text-amber-300 border border-amber-800/60 px-1.5 py-0.2 rounded">
                            PRA SS2/21 CIF
                          </span>
                        )}
                      </div>
                      {isCurrent && (
                        <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> CURRENT ACTIVE
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-2">
                      {preset.title}
                    </h4>

                    <div className="space-y-1 text-[11px] text-[#A1A1AA] pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[#71717A]">Corridor:</span>
                        <span className="text-[#D1D5DB] font-medium">{preset.exporterCountry} ➔ {preset.importerCountry}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#71717A]">Transfer Tool:</span>
                        <span className="text-cyan-400 font-mono text-[10px]">
                          {preset.transferMechanism.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#71717A]">Key Control:</span>
                        <span className="text-[#D1D5DB] text-[10px]">
                          {preset.keyManagement.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#71717A]">Sensitive Categories:</span>
                        <span className="text-amber-400 font-bold">{sensitiveCount} categories</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#1F1F22] flex items-center justify-between gap-2">
                    <span className="text-[9px] font-mono text-[#52525B] truncate">
                      {preset.tiaReferenceId || 'TIA-2026'}
                    </span>

                    <button
                      onClick={() => {
                        onSelectPreset(preset);
                        onClose();
                      }}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isCurrent
                          ? 'bg-[#1F1F21] text-[#71717A] border border-[#333336]'
                          : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-700 hover:border-emerald-500 shadow-xs'
                      }`}
                    >
                      <span>{isCurrent ? 'Reload Form' : 'Load Preset'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPresets.length === 0 && (
            <div className="py-12 text-center text-[#71717A]">
              <p className="text-xs">No preset profiles match your current search query.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#262626] bg-[#141415] flex items-center justify-between text-xs text-[#71717A]">
          <span>Tip: You can also compare any two of these presets in the <strong>Comparison Mode</strong> tab.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#1F1F21] text-[#D1D5DB] hover:text-white rounded border border-[#262626] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
