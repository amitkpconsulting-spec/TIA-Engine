import React from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Download, 
  Printer, 
  Terminal, 
  Database, 
  Globe2, 
  Cpu, 
  Sparkles, 
  CheckCircle2,
  FolderOpen,
  TrendingDown,
  Server,
  Share2,
  ArrowLeftRight,
  Home
} from 'lucide-react';
import { CASE_STUDIES } from '../data/caseStudies';
import { TransferProfile } from '../types/tia';

interface NavbarProps {
  currentProfile: TransferProfile;
  onSelectCaseStudy: (profile: TransferProfile) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onResetNew: () => void;
  onExportJson: () => void;
  onOpenConsole: () => void;
  onOpenIntegrationModal?: () => void;
  onOpenPrintModal?: () => void;
  isAiAvailable: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProfile,
  onSelectCaseStudy,
  activeTab,
  setActiveTab,
  onResetNew,
  onExportJson,
  onOpenConsole,
  onOpenIntegrationModal,
  onOpenPrintModal,
  isAiAvailable
}) => {
  return (
    <header className="bg-[#0F0F10] text-[#D1D5DB] border-b border-[#262626] sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title (Clickable Home Action) */}
          <button
            onClick={() => setActiveTab('assessment')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none transition-opacity hover:opacity-95"
            title="Go to Home Assessment (Dashboard)"
          >
            <div className="w-9 h-9 rounded bg-[#1A1A1B] border border-[#262626] group-hover:border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)] transition-colors">
              <ShieldCheck className="w-5 h-5 group-hover:scale-105 transition-transform" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white font-mono group-hover:text-emerald-300 transition-colors">
                  TIA ENGINE <span className="text-emerald-400 font-light text-xs">by Technoscope</span>
                </span>
                <span className="text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                  PRA SS2/21
                </span>
              </div>
              <p className="text-[10px] text-[#71717A] font-mono hidden sm:flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
                AIRGAPPED_INSTANCE • DPO & CISO REGULATORY SUITE
              </p>
            </div>
          </button>

          {/* Preset Case Studies Dropdown */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="relative flex items-center">
              <span className="text-[11px] font-mono text-[#71717A] mr-2 flex items-center gap-1">
                <FolderOpen className="w-3.5 h-3.5 text-emerald-400" /> Presets:
              </span>
              <select
                aria-label="Preset Case Studies"
                className="bg-[#141415] border border-[#262626] text-[#D1D5DB] text-xs font-mono rounded px-3 py-1.5 focus:border-emerald-500 focus:outline-none max-w-[320px] truncate cursor-pointer hover:border-[#3F3F46] transition-colors"
                value={currentProfile.id}
                onChange={(e) => {
                  const key = Object.keys(CASE_STUDIES).find(k => CASE_STUDIES[k].id === e.target.value);
                  if (key && CASE_STUDIES[key]) {
                    onSelectCaseStudy(CASE_STUDIES[key]);
                  }
                }}
              >
                <option value="" disabled>Select Preset Transfer Profile (14 available)</option>
                {Object.values(CASE_STUDIES).map(cs => {
                  const flagMap: Record<string, string> = {
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
                  const flag = flagMap[cs.importerCountry] || '🌐';
                  return (
                    <option key={cs.id} value={cs.id}>
                      {flag} {cs.title}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Air-gap / Local LLM indicator (Navigates to server config) */}
            <button
              onClick={() => setActiveTab('server')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono border transition-colors cursor-pointer ${
                activeTab === 'server' 
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500' 
                  : 'bg-[#141415] text-emerald-400 border-[#262626] hover:border-emerald-500/50 hover:bg-[#1A1A1B]'
              }`}
              title="Click to manage Server, Database & Local LLM Endpoints"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse"></span>
              <span>LLM & DB: READY</span>
            </button>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            {onOpenIntegrationModal && (
              <button
                onClick={onOpenIntegrationModal}
                className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-400 bg-emerald-950/70 hover:bg-emerald-900/80 rounded border border-emerald-500/40 transition-colors flex items-center gap-1.5 cursor-pointer shadow-[0_0_8px_rgba(16,185,129,0.15)]"
                title="Open Unique ID & Cross-Framework GRC Interoperability Engine"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">{currentProfile.tiaReferenceId || 'TIA-ID-SYNC'}</span>
              </button>
            )}

            <button
              onClick={onResetNew}
              className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-[#D1D5DB] bg-[#1A1A1B] hover:bg-[#262626] hover:text-white rounded border border-[#262626] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">New Profile</span>
            </button>

            <button
              onClick={onExportJson}
              className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-[#D1D5DB] bg-[#1A1A1B] hover:bg-[#262626] hover:text-white rounded border border-[#262626] transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Export Full TIA Dossier as JSON"
            >
              <Download className="w-3.5 h-3.5 text-[#71717A]" />
              <span className="hidden sm:inline">Export JSON</span>
            </button>

            <button
              onClick={onOpenPrintModal ? onOpenPrintModal : () => window.print()}
              className="px-3.5 py-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)] hover:shadow-[0_0_16px_rgba(16,185,129,0.5)] cursor-pointer active:scale-98"
              title="Open Customizable Print Studio (Assessment, Gaps & Remediations)"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <span>Print Dossier</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-[#262626] pt-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'assessment', label: 'Home (Assessment)', icon: Home, code: 'SEC_01' },
            { id: 'comparison', label: 'Comparison Mode', icon: ArrowLeftRight, code: 'SEC_02' },
            { id: 'remediation', label: 'Remediation Graphs', icon: TrendingDown, code: 'SEC_03' },
            { id: 'dataflow', label: 'Lineage Map', icon: Globe2, code: 'SEC_04' },
            { id: 'wizard', label: 'Transfer Profiler', icon: Cpu, code: 'SEC_05' },
            { id: 'threepillars', label: '3-Pillar Matrix', icon: CheckCircle2, code: 'SEC_06' },
            { id: 'prudential', label: 'SS2/21 MTP Register', icon: Database, code: 'SEC_07' },
            { id: 'policy', label: 'Policy Studio', icon: FileText, code: 'SEC_08' },
            { id: 'jurisdictions', label: 'Surveillance DB', icon: Globe2, code: 'SEC_09' },
            { id: 'server', label: 'Server Status', icon: Server, code: 'SEC_10' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2.5 px-3 border-b-2 text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'border-emerald-500 text-white bg-[#1A1A1B] font-semibold'
                    : 'border-transparent text-[#71717A] hover:text-[#D1D5DB] hover:border-[#333336]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? (tab.id === 'server' ? 'text-cyan-400' : 'text-emerald-400') : 'text-[#71717A]'}`} />
                <span>{tab.label}</span>
                {tab.id === 'server' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
