import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeftRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingDown,
  TrendingUp,
  Download,
  Upload,
  Save,
  Trash2,
  Sparkles,
  Layers,
  FileJson,
  Lock,
  Cpu,
  Scale,
  Database,
  Globe2,
  Search,
  Filter,
  Check,
  Eye,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  BookmarkPlus
} from 'lucide-react';
import { TransferProfile } from '../types/tia';
import { CASE_STUDIES } from '../data/caseStudies';
import {
  compareProfiles,
  ParameterDiffItem,
  ProfileComparisonAnalysis
} from '../utils/tiaComparison';
import {
  getAllLocalStorageProfiles,
  saveProfileToLibrary,
  getSavedProfilesFromLibrary,
  deleteProfileFromLibrary,
  loadDraftFromStorage,
  AvailableStorageProfileOption,
  formatTimeAgo
} from '../utils/autoSaveManager';
import { decryptSnapshot } from '../utils/cryptoSnapshot';

interface ComparisonModeViewProps {
  currentActiveProfile: TransferProfile;
  onSelectActiveProfile: (profile: TransferProfile) => void;
  onNavigateToWizard?: () => void;
}

export const ComparisonModeView: React.FC<ComparisonModeViewProps> = ({
  currentActiveProfile,
  onSelectActiveProfile,
  onNavigateToWizard
}) => {
  // Local storage options state
  const [storageOptions, setStorageOptions] = useState<AvailableStorageProfileOption[]>([]);
  
  // Selected Profile keys
  const [selectedKeyA, setSelectedKeyA] = useState<string>('active');
  const [selectedKeyB, setSelectedKeyB] = useState<string>('case_core_banking');
  
  // Concrete profile objects
  const [customProfileA, setCustomProfileA] = useState<TransferProfile | null>(null);
  const [customProfileB, setCustomProfileB] = useState<TransferProfile | null>(null);

  // Filter and search state
  const [filterMode, setFilterMode] = useState<'all' | 'diffs_only'>('diffs_only');
  const [selectedPillarFilter, setSelectedPillarFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Save to Library Modal State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [saveProfileTarget, setSaveProfileTarget] = useState<'A' | 'B' | 'active'>('active');
  const [saveProfileTag, setSaveProfileTag] = useState<string>('Baseline Transfer 2026');
  const [saveNotes, setSaveNotes] = useState<string>('');
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // File upload input ref
  const fileInputRefA = useRef<HTMLInputElement>(null);
  const fileInputRefB = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Refresh available profiles list from LocalStorage
  const refreshStorageList = () => {
    const ls = getAllLocalStorageProfiles();
    setStorageOptions(ls);
  };

  useEffect(() => {
    refreshStorageList();
  }, []);

  // Resolve Profile A
  const profileA = useMemo<TransferProfile>(() => {
    if (customProfileA) return customProfileA;
    if (selectedKeyA === 'active') return currentActiveProfile;
    if (selectedKeyA === 'draft') {
      const draft = loadDraftFromStorage();
      if (draft) return draft.profile;
    }
    if (selectedKeyA.startsWith('ls_lib_')) {
      const id = selectedKeyA.replace('ls_lib_', '');
      const item = getSavedProfilesFromLibrary().find(x => x.id === id);
      if (item) return item.profile;
    }
    if (selectedKeyA.startsWith('case_')) {
      const key = selectedKeyA.replace('case_', '');
      if (CASE_STUDIES[key]) return CASE_STUDIES[key];
      const match = Object.values(CASE_STUDIES).find(cs => cs.id === key);
      if (match) return match;
      const firstKey = Object.keys(CASE_STUDIES)[0];
      if (CASE_STUDIES[firstKey]) return CASE_STUDIES[firstKey];
    }
    return currentActiveProfile;
  }, [selectedKeyA, customProfileA, currentActiveProfile, storageOptions]);

  // Resolve Profile B
  const profileB = useMemo<TransferProfile>(() => {
    if (customProfileB) return customProfileB;
    if (selectedKeyB === 'active') return currentActiveProfile;
    if (selectedKeyB === 'draft') {
      const draft = loadDraftFromStorage();
      if (draft) return draft.profile;
    }
    if (selectedKeyB.startsWith('ls_lib_')) {
      const id = selectedKeyB.replace('ls_lib_', '');
      const item = getSavedProfilesFromLibrary().find(x => x.id === id);
      if (item) return item.profile;
    }
    if (selectedKeyB.startsWith('case_')) {
      const key = selectedKeyB.replace('case_', '');
      if (CASE_STUDIES[key]) return CASE_STUDIES[key];
      const match = Object.values(CASE_STUDIES).find(cs => cs.id === key);
      if (match) return match;
      const secondKey = Object.keys(CASE_STUDIES)[1] || Object.keys(CASE_STUDIES)[0];
      if (CASE_STUDIES[secondKey]) return CASE_STUDIES[secondKey];
    }
    return CASE_STUDIES['claims-offshoring-india'] || currentActiveProfile;
  }, [selectedKeyB, customProfileB, currentActiveProfile, storageOptions]);

  // Compute Full Comparison Analysis
  const comparison = useMemo<ProfileComparisonAnalysis>(() => {
    return compareProfiles(profileA, profileB);
  }, [profileA, profileB]);

  // Swap Profiles
  const handleSwapProfiles = () => {
    const tempKey = selectedKeyA;
    const tempCustom = customProfileA;

    setSelectedKeyA(selectedKeyB);
    setCustomProfileA(customProfileB);

    setSelectedKeyB(tempKey);
    setCustomProfileB(tempCustom);
  };

  // Upload file parser (JSON or encrypted snapshot)
  const handleFileUpload = async (file: File, target: 'A' | 'B') => {
    setUploadError(null);
    try {
      const text = await file.text();
      let parsed: TransferProfile | null = null;

      // Test if encrypted snapshot
      if (text.includes('SOVEREIGN_TIA_ENCRYPTED_SNAPSHOT_V1')) {
        const decrypted = await decryptSnapshot(text);
        parsed = decrypted.profile;
      } else {
        const rawJson = JSON.parse(text);
        parsed = rawJson.profile || rawJson;
      }

      if (parsed && parsed.id && parsed.importerCountry) {
        if (target === 'A') {
          setCustomProfileA(parsed);
          setSelectedKeyA('uploaded_a');
        } else {
          setCustomProfileB(parsed);
          setSelectedKeyB('uploaded_b');
        }
      } else {
        setUploadError('Uploaded file does not contain a valid TransferProfile.');
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to parse snapshot/JSON file.');
    }
  };

  // Save profile to LocalStorage library
  const handleSaveToLibrary = () => {
    const targetProfile = saveProfileTarget === 'A' 
      ? profileA 
      : saveProfileTarget === 'B' 
        ? profileB 
        : currentActiveProfile;

    const res = saveProfileToLibrary(targetProfile, saveProfileTag, saveNotes);
    if (res.success) {
      setSaveFeedback('Profile saved to LocalStorage library successfully!');
      refreshStorageList();
      setTimeout(() => {
        setIsSaveModalOpen(false);
        setSaveFeedback(null);
      }, 1200);
    } else {
      setSaveFeedback(res.error || 'Failed to save to local storage.');
    }
  };

  // Filter diff items
  const filteredDiffItems = useMemo(() => {
    return comparison.diffItems.filter(item => {
      // Diff mode filter
      if (filterMode === 'diffs_only' && item.status === 'identical') {
        return false;
      }
      // Pillar filter
      if (selectedPillarFilter !== 'all' && item.pillar !== selectedPillarFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.standardReference.toLowerCase().includes(q) ||
          item.displayValueA.toLowerCase().includes(q) ||
          item.displayValueB.toLowerCase().includes(q) ||
          item.pillarLabel.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [comparison.diffItems, filterMode, selectedPillarFilter, searchQuery]);

  // Export comparison summary JSON
  const handleExportComparisonJson = () => {
    const payload = {
      meta: {
        reportType: 'SOVEREIGN_TIA_PROFILE_COMPARISON',
        generatedAt: new Date().toISOString(),
        standard: 'PRA SS2/21, CJEU Schrems II, EDPB 01/2020 & EU SCCs 2021/914',
        engineVersion: '4.2'
      },
      comparison: {
        profileA: {
          id: profileA.id,
          tiaReferenceId: profileA.tiaReferenceId,
          title: profileA.title,
          verdict: comparison.evaluationA.verdict,
          overallRiskScore: comparison.evaluationA.overallRiskScore,
          scores: comparison.evaluationA.scores
        },
        profileB: {
          id: profileB.id,
          tiaReferenceId: profileB.tiaReferenceId,
          title: profileB.title,
          verdict: comparison.evaluationB.verdict,
          overallRiskScore: comparison.evaluationB.overallRiskScore,
          scores: comparison.evaluationB.scores
        },
        deltaAnalysis: {
          scoreDelta: comparison.scoreDelta,
          scorePercentChange: `${comparison.scorePercentChange}%`,
          technicalScoreDelta: comparison.technicalScoreDelta,
          legalScoreDelta: comparison.legalScoreDelta,
          resilienceScoreDelta: comparison.resilienceScoreDelta,
          remediatedGapsCount: comparison.gapsComparison.remediatedInB.length,
          remediatedGaps: comparison.gapsComparison.remediatedInB,
          regressedGaps: comparison.gapsComparison.regressedInB,
          persistentGaps: comparison.gapsComparison.sharedOpenGaps
        },
        granularParameterDiffs: comparison.diffItems
      }
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `TIA_Comparison_${profileA.tiaReferenceId || 'A'}_vs_${profileB.tiaReferenceId || 'B'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getVerdictBadge = (verdict: string) => {
    if (verdict === 'Approved') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Approved</span>
        </span>
      );
    }
    if (verdict === 'Approved with Conditions') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>Approved w/ Conditions</span>
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/40 flex items-center gap-1">
        <XCircle className="w-3 h-3 text-rose-400" />
        <span>Prohibited</span>
      </span>
    );
  };

  const getRiskScoreBadge = (score: number) => {
    if (score <= 25) {
      return <span className="text-emerald-400 font-bold">{score}/100 (Low)</span>;
    }
    if (score <= 50) {
      return <span className="text-cyan-400 font-bold">{score}/100 (Moderate)</span>;
    }
    if (score <= 75) {
      return <span className="text-amber-400 font-bold">{score}/100 (High)</span>;
    }
    return <span className="text-rose-400 font-bold">{score}/100 (Critical)</span>;
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Hidden File Upload Inputs */}
      <input
        type="file"
        ref={fileInputRefA}
        accept=".json,.tiasnap"
        onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'A')}
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRefB}
        accept=".json,.tiasnap"
        onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'B')}
        className="hidden"
      />

      {/* Top Banner & Header */}
      <div className="bg-[#0F0F10] border border-[#262626] rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-950 to-emerald-950 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  Side-by-Side TIA Profile Comparison Mode
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                  DELTA ENGINE v4.2
                </span>
              </div>
              <p className="text-xs text-[#71717A] mt-0.5">
                Compare multiple LocalStorage drafts, saved library snapshots, or preset regulatory benchmarks to evaluate risk reduction & remediation progress
              </p>
            </div>
          </div>

          {/* Quick Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSaveProfileTarget('active');
                setIsSaveModalOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-[#D1D5DB] hover:text-white bg-[#1A1A1D] hover:bg-[#262629] border border-[#3F3F46] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Save current active profile to browser LocalStorage library"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Save Active to Library</span>
            </button>

            <button
              onClick={handleExportComparisonJson}
              className="px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-700/50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Export complete comparative difference analysis as JSON"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Comparison JSON</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.25)]"
            >
              <span>Print Comparison Dossier</span>
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="mt-4 p-3 bg-rose-950/50 border border-rose-600/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Dual Profile Selector Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Profile A (Baseline / Prior State) */}
        <div className="lg:col-span-5 bg-[#121214] border border-[#262626] rounded-2xl p-4 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.7)]"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Profile A (Baseline / Prior State)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fileInputRefA.current?.click()}
                className="text-[11px] text-[#A1A1AA] hover:text-white px-2 py-0.5 rounded bg-[#1A1A1C] border border-[#262626] flex items-center gap-1 cursor-pointer"
                title="Upload custom .json or .tiasnap file for Profile A"
              >
                <Upload className="w-3 h-3 text-cyan-400" />
                <span>Upload</span>
              </button>
              <button
                onClick={() => onSelectActiveProfile(profileA)}
                className="text-[11px] text-cyan-300 hover:text-white px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 flex items-center gap-1 cursor-pointer"
                title="Set Profile A as the live active working profile in the application"
              >
                <Check className="w-3 h-3 text-cyan-400" />
                <span>Activate in App</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-[#71717A] uppercase font-semibold">Select Profile Source:</label>
            <select
              value={customProfileA ? 'uploaded_a' : selectedKeyA}
              onChange={e => {
                setCustomProfileA(null);
                setSelectedKeyA(e.target.value);
              }}
              className="w-full bg-[#0A0A0B] border border-[#333336] rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-hidden cursor-pointer"
            >
              <optgroup label="💾 Browser LocalStorage Sessions">
                <option value="active">🟢 Current Active Working Profile</option>
                {storageOptions.filter(o => o.sourceType === 'draft').map(opt => (
                  <option key={opt.key} value={opt.key}>{opt.label}</option>
                ))}
                {storageOptions.filter(o => o.sourceType === 'library').map(opt => (
                  <option key={opt.key} value={opt.key}>{opt.label}</option>
                ))}
              </optgroup>
              <optgroup label="📁 Preset Transfer Profiles (14 Case Studies)">
                {Object.entries(CASE_STUDIES).map(([key, cs]) => (
                  <option key={key} value={`case_${key}`}>
                    {cs.exporterType === 'bank' ? '🏦 ' : cs.exporterType === 'insurer' ? '🛡️ ' : '⚡ '}
                    {cs.title}
                  </option>
                ))}
              </optgroup>
              {customProfileA && (
                <optgroup label="📤 Custom Uploaded File">
                  <option value="uploaded_a">📄 Custom: {customProfileA.title}</option>
                </optgroup>
              )}
            </select>
          </div>

          {/* Quick Profile A Metadata Strip */}
          <div className="p-2.5 bg-[#09090A] border border-[#1F1F22] rounded-xl text-[11px] space-y-1">
            <div className="flex items-center justify-between text-white font-semibold truncate">
              <span className="truncate">{profileA.title}</span>
              <span className="text-[10px] text-cyan-400 font-mono shrink-0 ml-2">
                {profileA.tiaReferenceId || 'UNCOMMITTED'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#71717A] text-[10px]">
              <span>Corridor: {profileA.exporterCountry} ➔ {profileA.importerCountry}</span>
              <span>Mechanism: {profileA.transferMechanism}</span>
            </div>
          </div>
        </div>

        {/* Swap Profiles Button (Center Column) */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center">
          <button
            onClick={handleSwapProfiles}
            className="p-3 bg-[#18181B] hover:bg-[#27272A] border border-[#3F3F46] hover:border-cyan-500 rounded-full text-[#D1D5DB] hover:text-white shadow-lg transition-all transform hover:scale-105 cursor-pointer"
            title="Swap Profile A and Profile B"
          >
            <ArrowLeftRight className="w-5 h-5 text-cyan-400" />
          </button>
          <span className="text-[10px] text-[#71717A] font-semibold mt-1">SWAP (A ↔ B)</span>
        </div>

        {/* Profile B (Target / Proposed State) */}
        <div className="lg:col-span-5 bg-[#121214] border border-[#262626] rounded-2xl p-4 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Profile B (Target / Proposed State)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fileInputRefB.current?.click()}
                className="text-[11px] text-[#A1A1AA] hover:text-white px-2 py-0.5 rounded bg-[#1A1A1C] border border-[#262626] flex items-center gap-1 cursor-pointer"
                title="Upload custom .json or .tiasnap file for Profile B"
              >
                <Upload className="w-3 h-3 text-emerald-400" />
                <span>Upload</span>
              </button>
              <button
                onClick={() => onSelectActiveProfile(profileB)}
                className="text-[11px] text-emerald-300 hover:text-white px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 flex items-center gap-1 cursor-pointer"
                title="Set Profile B as the live active working profile in the application"
              >
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Activate in App</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-[#71717A] uppercase font-semibold">Select Profile Source:</label>
            <select
              value={customProfileB ? 'uploaded_b' : selectedKeyB}
              onChange={e => {
                setCustomProfileB(null);
                setSelectedKeyB(e.target.value);
              }}
              className="w-full bg-[#0A0A0B] border border-[#333336] rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-hidden cursor-pointer"
            >
              <optgroup label="💾 Browser LocalStorage Sessions">
                <option value="active">🟢 Current Active Working Profile</option>
                {storageOptions.filter(o => o.sourceType === 'draft').map(opt => (
                  <option key={opt.key} value={opt.key}>{opt.label}</option>
                ))}
                {storageOptions.filter(o => o.sourceType === 'library').map(opt => (
                  <option key={opt.key} value={opt.key}>{opt.label}</option>
                ))}
              </optgroup>
              <optgroup label="📁 Preset Transfer Profiles (14 Case Studies)">
                {Object.entries(CASE_STUDIES).map(([key, cs]) => (
                  <option key={key} value={`case_${key}`}>
                    {cs.exporterType === 'bank' ? '🏦 ' : cs.exporterType === 'insurer' ? '🛡️ ' : '⚡ '}
                    {cs.title}
                  </option>
                ))}
              </optgroup>
              {customProfileB && (
                <optgroup label="📤 Custom Uploaded File">
                  <option value="uploaded_b">📄 Custom: {customProfileB.title}</option>
                </optgroup>
              )}
            </select>
          </div>

          {/* Quick Profile B Metadata Strip */}
          <div className="p-2.5 bg-[#09090A] border border-[#1F1F22] rounded-xl text-[11px] space-y-1">
            <div className="flex items-center justify-between text-white font-semibold truncate">
              <span className="truncate">{profileB.title}</span>
              <span className="text-[10px] text-emerald-400 font-mono shrink-0 ml-2">
                {profileB.tiaReferenceId || 'UNCOMMITTED'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#71717A] text-[10px]">
              <span>Corridor: {profileB.exporterCountry} ➔ {profileB.importerCountry}</span>
              <span>Mechanism: {profileB.transferMechanism}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Risk & Verdict Delta Summary Dashboard */}
      <div className="bg-[#0F0F10] border border-[#262626] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#262626] pb-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Executive Regulatory Risk Delta Analysis
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#71717A]">Risk Delta:</span>
            {comparison.scoreDelta <= 0 ? (
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                <span>{comparison.scoreDelta} pts ({comparison.scorePercentChange}%)</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold border border-rose-500/40 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                <span>+{comparison.scoreDelta} pts (+{comparison.scorePercentChange}%)</span>
              </span>
            )}
          </div>
        </div>

        {/* 4 Core Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Card 1: Regulatory Verdict */}
          <div className="bg-[#141416] border border-[#262626] rounded-xl p-4 space-y-2.5">
            <span className="text-[#71717A] text-[10px] font-bold uppercase tracking-wider">
              GDPR & PRA Verdict Transition
            </span>
            <div className="flex items-center justify-between gap-1 pt-1">
              <div className="space-y-1">
                <span className="text-[10px] text-cyan-400 font-bold">Profile A</span>
                <div>{getVerdictBadge(comparison.evaluationA.verdict)}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#71717A] shrink-0 mt-3" />
              <div className="space-y-1 text-right">
                <span className="text-[10px] text-emerald-400 font-bold">Profile B</span>
                <div>{getVerdictBadge(comparison.evaluationB.verdict)}</div>
              </div>
            </div>
            <div className="pt-2 border-t border-[#1F1F22] text-[10px]">
              {comparison.verdictProgression.isImprovement ? (
                <span className="text-emerald-400 font-semibold">✓ Verdict elevated to permissible status</span>
              ) : comparison.verdictProgression.isWorse ? (
                <span className="text-rose-400 font-semibold">⚠ Warning: Verdict degraded into prohibited scope</span>
              ) : (
                <span className="text-[#71717A]">Verdicts remain identical</span>
              )}
            </div>
          </div>

          {/* Card 2: Overall Composite Risk Score */}
          <div className="bg-[#141416] border border-[#262626] rounded-xl p-4 space-y-2.5">
            <span className="text-[#71717A] text-[10px] font-bold uppercase tracking-wider">
              Overall Risk Score (0-100)
            </span>
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-[10px] text-cyan-400 font-bold">Profile A: </span>
                <span className="text-sm font-bold text-white">{comparison.evaluationA.overallRiskScore}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-400 font-bold">Profile B: </span>
                <span className="text-sm font-bold text-white">{comparison.evaluationB.overallRiskScore}</span>
              </div>
            </div>
            {/* Visual Delta Bar */}
            <div className="space-y-1">
              <div className="h-2 w-full bg-[#262626] rounded-full overflow-hidden flex">
                <div 
                  className="bg-cyan-500 transition-all" 
                  style={{ width: `${comparison.evaluationA.overallRiskScore}%` }}
                />
              </div>
              <div className="h-2 w-full bg-[#262626] rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-500 transition-all" 
                  style={{ width: `${comparison.evaluationB.overallRiskScore}%` }}
                />
              </div>
            </div>
            <div className="text-[10px] text-[#71717A] flex justify-between pt-1">
              <span>{getRiskScoreBadge(comparison.evaluationA.overallRiskScore)}</span>
              <span>{getRiskScoreBadge(comparison.evaluationB.overallRiskScore)}</span>
            </div>
          </div>

          {/* Card 3: Technical Safeguards (EDPB 01/2020) */}
          <div className="bg-[#141416] border border-[#262626] rounded-xl p-4 space-y-2.5">
            <span className="text-[#71717A] text-[10px] font-bold uppercase tracking-wider">
              Technical Insulation (EDPB)
            </span>
            <div className="flex items-center justify-between pt-1">
              <span className="text-white font-bold">
                {comparison.evaluationA.scores.technicalProtectionScore}% ➔ {comparison.evaluationB.scores.technicalProtectionScore}%
              </span>
              <span className={`font-bold ${comparison.technicalScoreDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {comparison.technicalScoreDelta >= 0 ? `+${comparison.technicalScoreDelta}%` : `${comparison.technicalScoreDelta}%`}
              </span>
            </div>
            <div className="h-2 w-full bg-[#262626] rounded-full overflow-hidden flex">
              <div 
                className="bg-cyan-500" 
                style={{ width: `${comparison.evaluationA.scores.technicalProtectionScore}%` }}
              />
            </div>
            <div className="h-2 w-full bg-[#262626] rounded-full overflow-hidden flex">
              <div 
                className="bg-emerald-500" 
                style={{ width: `${comparison.evaluationB.scores.technicalProtectionScore}%` }}
              />
            </div>
            <p className="text-[10px] text-[#71717A] truncate">
              BYOK custody & Transit/Rest encryption
            </p>
          </div>

          {/* Card 4: PRA SS2/21 Operational Resilience */}
          <div className="bg-[#141416] border border-[#262626] rounded-xl p-4 space-y-2.5">
            <span className="text-[#71717A] text-[10px] font-bold uppercase tracking-wider">
              PRA SS2/21 Resilience
            </span>
            <div className="flex items-center justify-between pt-1">
              <span className="text-white font-bold">
                {comparison.evaluationA.scores.praResilienceScore}% ➔ {comparison.evaluationB.scores.praResilienceScore}%
              </span>
              <span className={`font-bold ${comparison.resilienceScoreDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {comparison.resilienceScoreDelta >= 0 ? `+${comparison.resilienceScoreDelta}%` : `${comparison.resilienceScoreDelta}%`}
              </span>
            </div>
            <div className="h-2 w-full bg-[#262626] rounded-full overflow-hidden flex">
              <div 
                className="bg-cyan-500" 
                style={{ width: `${comparison.evaluationA.scores.praResilienceScore}%` }}
              />
            </div>
            <div className="h-2 w-full bg-[#262626] rounded-full overflow-hidden flex">
              <div 
                className="bg-emerald-500" 
                style={{ width: `${comparison.evaluationB.scores.praResilienceScore}%` }}
              />
            </div>
            <p className="text-[10px] text-[#71717A] truncate">
              Stressed exit plan & multi-region failover
            </p>
          </div>
        </div>
      </div>

      {/* Remediation Gap-to-Action Delta Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Closed & Remediated Gaps in B */}
        <div className="bg-[#0F0F10] border border-emerald-500/30 rounded-2xl p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Remediated in Profile B
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              {comparison.gapsComparison.remediatedInB.length} Gaps Solved
            </span>
          </div>
          <p className="text-[11px] text-[#71717A]">
            Regulatory deficits that were present in Profile A but successfully mitigated in Profile B:
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {comparison.gapsComparison.remediatedInB.length === 0 ? (
              <div className="p-3 bg-[#141416] rounded-xl text-[11px] text-[#52525B] text-center italic">
                No gap closures between these profiles.
              </div>
            ) : (
              comparison.gapsComparison.remediatedInB.map((gap, idx) => (
                <div key={idx} className="p-2.5 bg-emerald-950/20 border border-emerald-500/30 rounded-lg text-[11px] text-emerald-300 flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{gap}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Persistent Open Gaps */}
        <div className="bg-[#0F0F10] border border-[#262626] rounded-2xl p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Shared Persistent Gaps
              </span>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
              {comparison.gapsComparison.sharedOpenGaps.length} Open Gaps
            </span>
          </div>
          <p className="text-[11px] text-[#71717A]">
            Open compliance gaps that remain unaddressed in both transfer configurations:
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {comparison.gapsComparison.sharedOpenGaps.length === 0 ? (
              <div className="p-3 bg-[#141416] rounded-xl text-[11px] text-emerald-400 text-center font-semibold">
                ✓ Zero shared gaps remaining!
              </div>
            ) : (
              comparison.gapsComparison.sharedOpenGaps.map((gap, idx) => (
                <div key={idx} className="p-2.5 bg-amber-950/20 border border-amber-500/30 rounded-lg text-[11px] text-amber-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5"></span>
                  <span>{gap}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Regressed / Introduced Gaps in B */}
        <div className="bg-[#0F0F10] border border-rose-500/30 rounded-2xl p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Introduced Risks in B
              </span>
            </div>
            <span className="text-xs font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
              {comparison.gapsComparison.regressedInB.length} New Risks
            </span>
          </div>
          <p className="text-[11px] text-[#71717A]">
            New gaps or security concessions introduced in Profile B that were absent in Profile A:
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {comparison.gapsComparison.regressedInB.length === 0 ? (
              <div className="p-3 bg-[#141416] rounded-xl text-[11px] text-emerald-400 text-center font-semibold">
                ✓ No regressions introduced in Profile B!
              </div>
            ) : (
              comparison.gapsComparison.regressedInB.map((gap, idx) => (
                <div key={idx} className="p-2.5 bg-rose-950/20 border border-rose-500/30 rounded-lg text-[11px] text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>{gap}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Granular Parameter Diff Table & Filtering Strip */}
      <div className="bg-[#0F0F10] border border-[#262626] rounded-2xl overflow-hidden shadow-xl space-y-0">
        {/* Table Filter Toolbar */}
        <div className="p-4 border-b border-[#262626] bg-[#121214] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Diff vs All Toggle */}
            <div className="bg-[#0A0A0B] border border-[#262626] rounded-lg p-0.5 flex items-center text-xs">
              <button
                onClick={() => setFilterMode('diffs_only')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  filterMode === 'diffs_only'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-xs'
                    : 'text-[#71717A] hover:text-white'
                }`}
              >
                Only Differences ({comparison.differingItemsCount})
              </button>
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-[#262629] text-white border border-[#3F3F46] shadow-xs'
                    : 'text-[#71717A] hover:text-white'
                }`}
              >
                All Controls ({comparison.diffItems.length})
              </button>
            </div>

            {/* Pillar Selector Pills */}
            <div className="flex flex-wrap items-center gap-1 text-[11px]">
              {[
                { id: 'all', label: 'All Pillars' },
                { id: 'technical', label: 'Technical EDPB' },
                { id: 'legal', label: 'Legal & SCC' },
                { id: 'resilience', label: 'PRA SS2/21' },
                { id: 'corridor', label: 'Corridor & Scope' },
                { id: 'data', label: 'Data Sensitivity' },
              ].map(pillar => (
                <button
                  key={pillar.id}
                  onClick={() => setSelectedPillarFilter(pillar.id)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    selectedPillarFilter === pillar.id
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50 font-bold'
                      : 'bg-[#18181A] text-[#71717A] hover:text-[#D1D5DB] border border-[#262626]'
                  }`}
                >
                  {pillar.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search parameter or standard..."
              className="w-full bg-[#0A0A0B] border border-[#262626] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#52525B] focus:border-cyan-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Side-by-Side Parameter Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-[#141416] border-b border-[#262626] text-[#71717A] text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4 font-bold w-1/4">Control & Standard Reference</th>
                <th className="py-3 px-4 font-bold w-1/3 text-cyan-400 bg-cyan-950/20 border-l border-r border-[#262626]">
                  Profile A (Baseline)
                </th>
                <th className="py-3 px-3 font-bold text-center w-24">Status Delta</th>
                <th className="py-3 px-4 font-bold w-1/3 text-emerald-400 bg-emerald-950/20 border-l border-[#262626]">
                  Profile B (Target)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F22]">
              {filteredDiffItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#71717A] text-xs">
                    No matching parameters found for the selected filter and query.
                  </td>
                </tr>
              ) : (
                filteredDiffItems.map((item, idx) => {
                  return (
                    <tr key={item.id || idx} className="hover:bg-[#141416] transition-colors">
                      {/* Control Name & Pillar */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-semibold text-white">{item.name}</div>
                        <div className="text-[10px] text-[#71717A] mt-0.5 flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded bg-[#18181A] border border-[#262626]">
                            {item.pillarLabel}
                          </span>
                          <span className="truncate">{item.standardReference}</span>
                        </div>
                      </td>

                      {/* Profile A Value */}
                      <td className="py-3.5 px-4 align-top bg-cyan-950/5 border-l border-r border-[#1F1F22] text-[#D1D5DB]">
                        <div className="font-mono text-xs text-white leading-relaxed">
                          {item.displayValueA}
                        </div>
                      </td>

                      {/* Status Delta Badge */}
                      <td className="py-3.5 px-2 align-middle text-center">
                        {item.status === 'improved' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                            <TrendingDown className="w-3 h-3" />
                            <span>Enhanced</span>
                          </span>
                        )}
                        {item.status === 'regressed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-500/40">
                            <TrendingUp className="w-3 h-3" />
                            <span>Regressed</span>
                          </span>
                        )}
                        {item.status === 'changed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-600/40">
                            <ArrowLeftRight className="w-3 h-3" />
                            <span>Delta</span>
                          </span>
                        )}
                        {item.status === 'identical' && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] text-[#52525B] font-mono">
                            Identical
                          </span>
                        )}
                      </td>

                      {/* Profile B Value */}
                      <td className="py-3.5 px-4 align-top bg-emerald-950/5 border-l border-[#1F1F22] text-[#D1D5DB]">
                        <div className="font-mono text-xs text-white leading-relaxed">
                          {item.displayValueB}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save to Local Storage Library Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-mono">
          <div 
            className="bg-[#0D0D0E] border border-[#262626] rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Save Profile to LocalStorage Library</h3>
              </div>
              <button 
                onClick={() => setIsSaveModalOpen(false)}
                className="text-[#71717A] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] text-[#A1A1AA] mb-1 font-semibold">
                  Select Profile to Save:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSaveProfileTarget('active')}
                    className={`p-2 rounded-lg border text-center font-semibold cursor-pointer ${
                      saveProfileTarget === 'active' 
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500' 
                        : 'bg-[#141416] text-[#71717A] border-[#262626]'
                    }`}
                  >
                    Active Profile
                  </button>
                  <button
                    onClick={() => setSaveProfileTarget('A')}
                    className={`p-2 rounded-lg border text-center font-semibold cursor-pointer ${
                      saveProfileTarget === 'A' 
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-500' 
                        : 'bg-[#141416] text-[#71717A] border-[#262626]'
                    }`}
                  >
                    Profile A
                  </button>
                  <button
                    onClick={() => setSaveProfileTarget('B')}
                    className={`p-2 rounded-lg border text-center font-semibold cursor-pointer ${
                      saveProfileTarget === 'B' 
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500' 
                        : 'bg-[#141416] text-[#71717A] border-[#262626]'
                    }`}
                  >
                    Profile B
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#A1A1AA] mb-1 font-semibold">
                  Custom Tag / Label:
                </label>
                <input
                  type="text"
                  value={saveProfileTag}
                  onChange={e => setSaveProfileTag(e.target.value)}
                  placeholder="e.g. Q3 2026 Core Banking Migration"
                  className="w-full bg-[#0A0A0B] border border-[#262626] rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#A1A1AA] mb-1 font-semibold">
                  Regulatory Notes / Rationale (Optional):
                </label>
                <textarea
                  rows={3}
                  value={saveNotes}
                  onChange={e => setSaveNotes(e.target.value)}
                  placeholder="e.g. Assessed prior to executing supplementary BYOK HSM contract addendum."
                  className="w-full bg-[#0A0A0B] border border-[#262626] rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              {saveFeedback && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{saveFeedback}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#262626]">
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="px-4 py-2 text-xs text-[#71717A] hover:text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveToLibrary}
                className="px-5 py-2 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-md transition-all cursor-pointer"
              >
                Save to Local Storage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
