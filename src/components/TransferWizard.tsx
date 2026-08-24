import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Globe, 
  Lock, 
  Key, 
  ShieldAlert, 
  FileCheck, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Cpu,
  Share2,
  RefreshCw,
  Workflow,
  HardDrive,
  CheckCircle2,
  Clock,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  DownloadCloud,
  Check,
  Camera,
  Shield,
  Download,
  FolderOpen
} from 'lucide-react';
import { TransferProfile, KeyManagementModel, TransferMechanism, TransferType, EntityType, EntityRole } from '../types/tia';
import { JURISDICTIONS } from '../data/jurisdictions';
import { generateUniqueTiaId } from '../utils/tiaIdGenerator';
import { 
  saveDraftToStorage, 
  loadDraftFromStorage, 
  clearDraftFromStorage, 
  formatTimeAgo,
  StoredDraftBundle 
} from '../utils/autoSaveManager';
import { SnapshotModal } from './SnapshotModal';
import { PresetGalleryModal } from './PresetGalleryModal';

interface TransferWizardProps {
  profile: TransferProfile;
  onUpdateProfile: (updated: TransferProfile) => void;
  onRunAssessment: () => void;
}

export const TransferWizard: React.FC<TransferWizardProps> = ({
  profile,
  onUpdateProfile,
  onRunAssessment,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [showIntegrations, setShowIntegrations] = useState<boolean>(false);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState<boolean>(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState<boolean>(false);

  // Auto-Save State
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('saved');
  const [lastSavedIso, setLastSavedIso] = useState<string | null>(null);
  const [timeAgoText, setTimeAgoText] = useState<string>('Saved');
  const [detectedDraft, setDetectedDraft] = useState<StoredDraftBundle | null>(null);
  const [saveSuccessFeedback, setSaveSuccessFeedback] = useState<boolean>(false);
  const isInitialMount = useRef<boolean>(true);
  const debounceTimerRef = useRef<number | null>(null);

  // Check for existing auto-saved draft on mount
  useEffect(() => {
    const draft = loadDraftFromStorage();
    if (draft) {
      setLastSavedIso(draft.metadata.lastSaved);
      // If the draft has a different ID or title or different modification time, suggest restoring
      if (draft.profile.id !== profile.id || draft.profile.title !== profile.title) {
        setDetectedDraft(draft);
      }
    }
  }, []);

  // Periodic Auto-Save Timer (runs every 15 seconds)
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const periodicInterval = setInterval(() => {
      setAutoSaveStatus('saving');
      const result = saveDraftToStorage(profile, activeStep);
      if (result.success) {
        setLastSavedIso(result.timestamp);
        setAutoSaveStatus('saved');
      } else {
        setAutoSaveStatus('error');
      }
    }, 15000);

    return () => clearInterval(periodicInterval);
  }, [profile, activeStep, autoSaveEnabled]);

  // Debounced auto-save on profile or activeStep changes (1200ms)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!autoSaveEnabled) return;

    setAutoSaveStatus('saving');
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      const result = saveDraftToStorage(profile, activeStep);
      if (result.success) {
        setLastSavedIso(result.timestamp);
        setAutoSaveStatus('saved');
      } else {
        setAutoSaveStatus('error');
      }
    }, 1200);

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [profile, activeStep, autoSaveEnabled]);

  // Live timer tick to update relative time string ("Just now", "10s ago", etc.)
  useEffect(() => {
    const tickInterval = setInterval(() => {
      if (lastSavedIso) {
        setTimeAgoText(formatTimeAgo(lastSavedIso));
      }
    }, 3000);

    if (lastSavedIso) {
      setTimeAgoText(formatTimeAgo(lastSavedIso));
    }

    return () => clearInterval(tickInterval);
  }, [lastSavedIso]);

  // Manual Trigger: Save Now
  const handleManualSave = () => {
    setAutoSaveStatus('saving');
    const result = saveDraftToStorage(profile, activeStep);
    if (result.success) {
      setLastSavedIso(result.timestamp);
      setAutoSaveStatus('saved');
      setSaveSuccessFeedback(true);
      setTimeout(() => setSaveSuccessFeedback(false), 2000);
    } else {
      setAutoSaveStatus('error');
    }
  };

  // Restore Draft Action
  const handleRestoreDraft = (draftToRestore?: StoredDraftBundle) => {
    const draft = draftToRestore || loadDraftFromStorage();
    if (draft) {
      onUpdateProfile(draft.profile);
      if (draft.metadata.activeStep) {
        setActiveStep(draft.metadata.activeStep);
      }
      setLastSavedIso(draft.metadata.lastSaved);
      setDetectedDraft(null);
      setAutoSaveStatus('saved');
    }
  };

  // Clear Stored Draft Action
  const handleClearDraft = () => {
    if (window.confirm('Are you sure you want to clear the locally cached assessment draft from browser storage?')) {
      clearDraftFromStorage();
      setLastSavedIso(null);
      setDetectedDraft(null);
      setAutoSaveStatus('idle');
    }
  };

  // Restore from Encrypted Snapshot
  const handleRestoreSnapshot = (restoredProfile: TransferProfile, step: number) => {
    onUpdateProfile(restoredProfile);
    setActiveStep(step || 1);
    const saveRes = saveDraftToStorage(restoredProfile, step || 1);
    if (saveRes.success) {
      setLastSavedIso(saveRes.timestamp);
    }
    setDetectedDraft(null);
    setAutoSaveStatus('saved');
    setSaveSuccessFeedback(true);
    setTimeout(() => setSaveSuccessFeedback(false), 2500);
  };

  const updateField = <K extends keyof TransferProfile>(field: K, value: TransferProfile[K]) => {
    onUpdateProfile({
      ...profile,
      [field]: value,
      lastUpdated: new Date().toISOString().split('T')[0],
    });
  };

  const handleRegenerateTiaId = () => {
    const bundle = generateUniqueTiaId();
    onUpdateProfile({
      ...profile,
      tiaReferenceId: bundle.tiaReferenceId,
      universalUniqueIdentifier: bundle.universalUniqueIdentifier,
      crossFrameworkUrn: bundle.crossFrameworkUrn,
      externalIntegrations: bundle.externalIntegrations,
      lastUpdated: new Date().toISOString().split('T')[0],
    });
  };

  const updateDataCategory = (key: keyof TransferProfile['dataCategories'], val: boolean) => {
    onUpdateProfile({
      ...profile,
      dataCategories: {
        ...profile.dataCategories,
        [key]: val,
      },
      lastUpdated: new Date().toISOString().split('T')[0],
    });
  };

  const addSubProcessor = () => {
    const newSub = {
      id: `sub-${Date.now()}`,
      name: 'New Cloud / BPO Sub-processor',
      country: 'United States',
      serviceDescription: 'Infrastructure / Database Hosting',
      hasAccessToClearData: false,
      transferTool: 'UK Addendum to SCCs',
      equivalentAuditRights: true,
    };
    onUpdateProfile({
      ...profile,
      subProcessors: [...profile.subProcessors, newSub],
    });
  };

  const removeSubProcessor = (id: string) => {
    onUpdateProfile({
      ...profile,
      subProcessors: profile.subProcessors.filter(s => s.id !== id),
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Wizard Step Selector */}
      <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-4 shadow-sm font-mono">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-2">
          {[
            { step: 1, label: '1. Parties & Scope' },
            { step: 2, label: '2. Data Sensitivity' },
            { step: 3, label: '3. Legal Instrument' },
            { step: 4, label: '4. Tech & Keys' },
            { step: 5, label: '5. PRA SS2/21 & Exit' },
            { step: 6, label: '6. Sub-Processors' },
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => setActiveStep(item.step)}
              className={`px-3 py-2 rounded text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeStep === item.step
                  ? 'bg-[#1F1F21] text-emerald-400 font-bold border border-emerald-500/40 shadow-xs'
                  : 'bg-[#141415] text-[#71717A] hover:text-[#D1D5DB] border border-[#262626]'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Auto-Saved Draft Detected Recovery Notification */}
      {detectedDraft && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-900/60 border border-emerald-600/40 text-emerald-300 mt-0.5 sm:mt-0">
              <DownloadCloud className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                <span>Auto-saved Assessment Session Detected</span>
                <span className="text-[10px] bg-emerald-900 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-700">
                  {detectedDraft.metadata.tiaReferenceId || 'DRAFT'}
                </span>
                <span className="text-[10px] text-emerald-400">
                  ({formatTimeAgo(detectedDraft.metadata.lastSaved)})
                </span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                "{detectedDraft.metadata.profileTitle}" was preserved in browser storage. Would you like to resume this session?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={() => handleRestoreDraft(detectedDraft)}
              className="px-3 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded shadow-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Restore Draft
            </button>
            <button
              onClick={() => setDetectedDraft(null)}
              className="px-2.5 py-1.5 text-xs text-[#71717A] hover:text-white hover:bg-[#262626] rounded transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Auto-Save Status & Control Telemetry Strip */}
      <div className="bg-[#0F0F10] border border-[#262626] rounded-xl px-4 py-2.5 font-mono text-xs flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {autoSaveStatus === 'saving' ? (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            ) : autoSaveStatus === 'saved' && autoSaveEnabled ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            ) : autoSaveStatus === 'error' ? (
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#52525B]"></span>
            )}
            <span className="text-[#A1A1AA] text-[11px] font-semibold">
              {autoSaveStatus === 'saving' ? (
                <span className="text-amber-300">AUTO-SAVING TO STORAGE...</span>
              ) : autoSaveEnabled ? (
                <span className="text-emerald-400">AUTO-SAVE ACTIVE</span>
              ) : (
                <span className="text-[#71717A]">AUTO-SAVE PAUSED</span>
              )}
            </span>
          </div>

          <span className="text-[#3F3F46]">•</span>

          <div className="flex items-center gap-1 text-[11px] text-[#71717A]">
            <Clock className="w-3 h-3 text-[#52525B]" />
            <span>Last saved:</span>
            <strong className="text-[#D1D5DB]">
              {lastSavedIso ? timeAgoText : 'Not saved yet'}
            </strong>
            {lastSavedIso && (
              <span className="text-[10px] text-[#52525B] hidden sm:inline">
                ({new Date(lastSavedIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualSave}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded border transition-colors flex items-center gap-1.5 cursor-pointer ${
              saveSuccessFeedback 
                ? 'bg-emerald-950 text-emerald-300 border-emerald-600' 
                : 'bg-[#141415] text-[#D1D5DB] hover:text-white hover:bg-[#1F1F21] border-[#262626]'
            }`}
            title="Force immediate save to local storage"
          >
            {saveSuccessFeedback ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3 h-3 text-emerald-400" />
                <span>Save Draft</span>
              </>
            )}
          </button>

          {/* Snapshot Trigger Button */}
          <button
            onClick={() => setIsSnapshotModalOpen(true)}
            className="px-2.5 py-1 text-[11px] font-semibold text-cyan-300 hover:text-white bg-cyan-950/50 hover:bg-cyan-900/70 border border-cyan-700/50 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Trigger encrypted blob snapshot backup of current TIA state"
          >
            <Camera className="w-3 h-3 text-cyan-400" />
            <span>Snapshot</span>
          </button>

          {/* Preset Gallery Trigger Button */}
          <button
            onClick={() => setIsPresetModalOpen(true)}
            className="px-2.5 py-1 text-[11px] font-semibold text-amber-300 hover:text-white bg-amber-950/50 hover:bg-amber-900/70 border border-amber-700/50 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Browse and load from 14 regulated financial services scenario presets"
          >
            <FolderOpen className="w-3 h-3 text-amber-400" />
            <span>Presets (14)</span>
          </button>

          {lastSavedIso && (
            <button
              onClick={() => handleRestoreDraft()}
              className="px-2.5 py-1 text-[11px] font-semibold text-[#A1A1AA] hover:text-white bg-[#141415] hover:bg-[#1F1F21] border border-[#262626] rounded transition-colors flex items-center gap-1 cursor-pointer"
              title="Reload the saved profile from local storage"
            >
              <RotateCcw className="w-3 h-3 text-cyan-400" />
              <span className="hidden md:inline">Restore</span>
            </button>
          )}

          {lastSavedIso && (
            <button
              onClick={handleClearDraft}
              className="p-1 text-[#71717A] hover:text-rose-400 hover:bg-rose-950/40 rounded border border-transparent hover:border-rose-800/50 transition-colors cursor-pointer"
              title="Clear saved draft from browser storage"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
            className="flex items-center gap-1 text-[11px] text-[#71717A] hover:text-[#D1D5DB] px-1.5 py-1 rounded transition-colors cursor-pointer"
            title={autoSaveEnabled ? 'Pause continuous 15s auto-save' : 'Enable continuous 15s auto-save'}
          >
            {autoSaveEnabled ? (
              <ToggleRight className="w-4 h-4 text-emerald-400" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-[#52525B]" />
            )}
            <span className="hidden lg:inline">{autoSaveEnabled ? 'Auto (15s)' : 'Manual'}</span>
          </button>
        </div>
      </div>

      {/* STEP 1: Parties & Scoping */}
      {activeStep === 1 && (
        <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm space-y-6">
          <div className="border-b border-[#262626] pb-3">
            <h3 className="text-base font-bold text-white font-mono uppercase">Step 1: Transfer Profiling & Regulated Entity Information</h3>
            <p className="text-xs text-[#71717A] font-mono mt-0.5">Define the exporter entity, destination vendor, and Senior Management Function (SMF) governance.</p>
          </div>

          {/* Unique TIA Identification & Cross-Framework Registry Strip */}
          <div className="bg-[#141415] border border-emerald-500/30 rounded-xl p-4 font-mono space-y-3 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#262626] pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Unique TIA Assessment ID & Cross-Framework Registry
                </span>
                <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                  INTEROPERABLE
                </span>
              </div>
              <button
                type="button"
                onClick={handleRegenerateTiaId}
                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-800/40 hover:bg-emerald-900/60 transition-colors cursor-pointer w-fit"
              >
                <RefreshCw className="w-3 h-3" />
                Generate New Canonical ID Bundle
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#0A0A0B] p-2.5 rounded border border-[#262626]">
                <span className="text-[10px] text-[#71717A] block">CANONICAL TIA ID</span>
                <span className="text-emerald-400 font-bold tracking-wider">{profile.tiaReferenceId || 'TIA-2026-PENDING'}</span>
              </div>

              <div className="bg-[#0A0A0B] p-2.5 rounded border border-[#262626]">
                <span className="text-[10px] text-[#71717A] block">UNIVERSAL UUID (v4)</span>
                <span className="text-[#D1D5DB] font-mono text-[11px] truncate block">{profile.universalUniqueIdentifier || 'UUID-NOT-ASSIGNED'}</span>
              </div>

              <div className="bg-[#0A0A0B] p-2.5 rounded border border-[#262626]">
                <span className="text-[10px] text-[#71717A] block">CROSS-FRAMEWORK URN</span>
                <span className="text-indigo-400 font-mono text-[11px] truncate block">{profile.crossFrameworkUrn || 'urn:grc:tia:2026:pending'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-[#71717A]">
                Supports downstream sync with ServiceNow GRC, OneTrust, PRA Table 5 MTP Register & DORA ICT Register.
              </span>
              <button
                type="button"
                onClick={() => setShowIntegrations(!showIntegrations)}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <Workflow className="w-3 h-3" />
                {showIntegrations ? 'Hide Tool Mapping Keys' : 'Configure Tool Mapping Keys'}
              </button>
            </div>

            {showIntegrations && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-[#262626]">
                <div>
                  <label className="block text-[9px] text-[#71717A] mb-0.5">ServiceNow GRC ID</label>
                  <input
                    type="text"
                    value={profile.externalIntegrations?.serviceNowGrcId || ''}
                    onChange={(e) => updateField('externalIntegrations', {
                      ...(profile.externalIntegrations || {}),
                      serviceNowGrcId: e.target.value
                    })}
                    placeholder="SNOW-VRM-2026-XXXX"
                    className="w-full text-xs p-1.5 rounded border border-[#262626] bg-[#0A0A0B] text-white focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-[#71717A] mb-0.5">OneTrust TIA ID</label>
                  <input
                    type="text"
                    value={profile.externalIntegrations?.oneTrustTiaId || ''}
                    onChange={(e) => updateField('externalIntegrations', {
                      ...(profile.externalIntegrations || {}),
                      oneTrustTiaId: e.target.value
                    })}
                    placeholder="OT-TIA-2026-XXXX"
                    className="w-full text-xs p-1.5 rounded border border-[#262626] bg-[#0A0A0B] text-white focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-[#71717A] mb-0.5">PRA MTP Table 5 ID</label>
                  <input
                    type="text"
                    value={profile.externalIntegrations?.praMtpRegisterId || ''}
                    onChange={(e) => updateField('externalIntegrations', {
                      ...(profile.externalIntegrations || {}),
                      praMtpRegisterId: e.target.value
                    })}
                    placeholder="PRA-MTP-2026-XXXX"
                    className="w-full text-xs p-1.5 rounded border border-[#262626] bg-[#0A0A0B] text-white focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-[#71717A] mb-0.5">DORA ICT Register ID</label>
                  <input
                    type="text"
                    value={profile.externalIntegrations?.doraIctRegisterId || ''}
                    onChange={(e) => updateField('externalIntegrations', {
                      ...(profile.externalIntegrations || {}),
                      doraIctRegisterId: e.target.value
                    })}
                    placeholder="DORA-ICT-REG-2026-XXXX"
                    className="w-full text-xs p-1.5 rounded border border-[#262626] bg-[#0A0A0B] text-white focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Exporter Info */}
            <div className="space-y-4 bg-[#141415] p-4 rounded border border-[#262626]">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] font-mono flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-cyan-400" /> Data Exporter (Origin)
              </h4>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1 font-mono">Transfer Assessment Title</label>
                <input
                  type="text"
                  className="w-full text-xs p-2 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden font-mono"
                  value={profile.title}
                  onChange={(e) => updateField('title', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1 font-mono">Exporter Legal Name</label>
                <input
                  type="text"
                  className="w-full text-xs p-2 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden font-mono"
                  value={profile.exporterName}
                  onChange={(e) => updateField('exporterName', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">Regulated Entity Type</label>
                  <select
                    className="w-full text-xs p-2 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden"
                    value={profile.exporterType}
                    onChange={(e) => updateField('exporterType', e.target.value as EntityType)}
                  >
                    <option value="bank">Bank / Credit Institution</option>
                    <option value="insurer">Solvency II Insurer / Lloyd's</option>
                    <option value="investment_firm">PRA-Designated Investment Firm</option>
                    <option value="payment_institution">Payment / E-Money Institution</option>
                    <option value="credit_union">Credit Union</option>
                    <option value="general_enterprise">General Corporate Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">Origin Country</label>
                  <input
                    type="text"
                    className="w-full text-xs p-2 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden"
                    value={profile.exporterCountry}
                    onChange={(e) => updateField('exporterCountry', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">DPO Contact Point</label>
                  <input
                    type="text"
                    className="w-full text-xs p-2 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden"
                    value={profile.dpoContact}
                    onChange={(e) => updateField('dpoContact', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">SM&CR Prescribed SMF</label>
                  <input
                    type="text"
                    className="w-full text-xs p-2 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden"
                    value={profile.seniorManagerFunction || ''}
                    onChange={(e) => updateField('seniorManagerFunction', e.target.value)}
                    placeholder="SMF24 - Chief Operations"
                  />
                </div>
              </div>
            </div>

            {/* Importer Info */}
            <div className="space-y-4 bg-[#141415] p-4 rounded border border-[#262626]">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] font-mono flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-purple-400" /> Data Importer (Destination)
              </h4>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1 font-mono">Importer / Vendor Name</label>
                <input
                  type="text"
                  className="w-full text-xs p-2 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden font-mono"
                  value={profile.importerName}
                  onChange={(e) => updateField('importerName', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">Destination Jurisdiction</label>
                  <select
                    className="w-full text-xs p-2 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden"
                    value={profile.importerCountry}
                    onChange={(e) => updateField('importerCountry', e.target.value)}
                  >
                    {Object.keys(JURISDICTIONS).map((c) => (
                      <option key={c} value={c}>
                        {JURISDICTIONS[c].flagEmoji} {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">Importer GDPR Role</label>
                  <select
                    className="w-full text-xs p-2 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden"
                    value={profile.importerRole}
                    onChange={(e) => updateField('importerRole', e.target.value as EntityRole)}
                  >
                    <option value="processor">Processor (Article 28)</option>
                    <option value="controller">Controller (Article 4)</option>
                    <option value="joint_controller">Joint Controller (Article 26)</option>
                    <option value="sub_processor">Sub-processor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1 font-mono">Industry / Sector Description</label>
                <input
                  type="text"
                  className="w-full text-xs p-2 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden font-mono"
                  value={profile.importerSector}
                  onChange={(e) => updateField('importerSector', e.target.value)}
                  placeholder="e.g. Cloud IaaS, Core Ledger, Medical Claims BPO"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="sectorExemption"
                  className="rounded text-emerald-500 bg-[#080809] border-[#262626] w-4 h-4"
                  checked={profile.isCoveredBySectorExemption}
                  onChange={(e) => updateField('isCoveredBySectorExemption', e.target.checked)}
                />
                <label htmlFor="sectorExemption" className="text-xs text-[#A1A1AA] font-mono">
                  Covered by Sector-Specific Legal Protections (e.g. medical professional secrecy, legal privilege)
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Data Sensitivity & Scope */}
      {activeStep === 2 && (
        <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm space-y-6">
          <div className="border-b border-[#262626] pb-3">
            <h3 className="text-base font-bold text-white font-mono uppercase">Step 2: Data Sensitivity & Classification Mandates</h3>
            <p className="text-xs text-[#71717A] font-mono mt-0.5">Specify data categories in scope under GDPR Article 9/10/87 and PRA SS2/21 Chapter 7.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`p-4 rounded border cursor-pointer transition-all flex items-start gap-3 ${
              profile.dataCategories.specialCategoryArt9 ? 'bg-[#200D0D] border-rose-800' : 'bg-[#141415] border-[#262626]'
            }`}>
              <input
                type="checkbox"
                className="mt-1 rounded text-rose-500 bg-[#080809] border-[#262626] w-4 h-4"
                checked={profile.dataCategories.specialCategoryArt9}
                onChange={(e) => updateDataCategory('specialCategoryArt9', e.target.checked)}
              />
              <div>
                <span className="font-bold text-xs text-white block font-mono">GDPR Article 9 Special Category Data (High Risk)</span>
                <span className="text-xs text-[#A1A1AA] block mt-0.5">
                  Health records, medical injury diagnoses, biometrics for identification, racial/ethnic origin, political opinions.
                </span>
              </div>
            </label>

            <label className={`p-4 rounded border cursor-pointer transition-all flex items-start gap-3 ${
              profile.dataCategories.financialFraudSensitive ? 'bg-[#20180D] border-amber-800' : 'bg-[#141415] border-[#262626]'
            }`}>
              <input
                type="checkbox"
                className="mt-1 rounded text-amber-500 bg-[#080809] border-[#262626] w-4 h-4"
                checked={profile.dataCategories.financialFraudSensitive}
                onChange={(e) => updateDataCategory('financialFraudSensitive', e.target.checked)}
              />
              <div>
                <span className="font-bold text-xs text-white block font-mono">Financial & Fraud-Sensitive Payment Records</span>
                <span className="text-xs text-[#A1A1AA] block mt-0.5">
                  Credit card PAN, CVV, bank sort codes, IBANs, real-time transaction ledger feeds, authentication credentials.
                </span>
              </div>
            </label>

            <label className={`p-4 rounded border cursor-pointer transition-all flex items-start gap-3 ${
              profile.dataCategories.nationalIdentifierArt87 ? 'bg-[#0D1820] border-blue-800' : 'bg-[#141415] border-[#262626]'
            }`}>
              <input
                type="checkbox"
                className="mt-1 rounded text-blue-500 bg-[#080809] border-[#262626] w-4 h-4"
                checked={profile.dataCategories.nationalIdentifierArt87}
                onChange={(e) => updateDataCategory('nationalIdentifierArt87', e.target.checked)}
              />
              <div>
                <span className="font-bold text-xs text-white block font-mono">National Identification Numbers (Article 87 GDPR)</span>
                <span className="text-xs text-[#A1A1AA] block mt-0.5">
                  National Insurance (NI) numbers, French NIR/Social Security numbers, Social Security Numbers (SSN), Passport details.
                </span>
              </div>
            </label>

            <label className={`p-4 rounded border cursor-pointer transition-all flex items-start gap-3 ${
              profile.dataCategories.criminalConvictionsArt10 ? 'bg-[#1A0D20] border-purple-800' : 'bg-[#141415] border-[#262626]'
            }`}>
              <input
                type="checkbox"
                className="mt-1 rounded text-purple-500 bg-[#080809] border-[#262626] w-4 h-4"
                checked={profile.dataCategories.criminalConvictionsArt10}
                onChange={(e) => updateDataCategory('criminalConvictionsArt10', e.target.checked)}
              />
              <div>
                <span className="font-bold text-xs text-white block font-mono">Criminal Convictions & Offenses (Article 10 GDPR)</span>
                <span className="text-xs text-[#A1A1AA] block mt-0.5">
                  Police criminal record checks, fraud investigation registers, regulatory disciplinary history.
                </span>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">Volume of Records & Subjects in Scope</label>
              <input
                type="text"
                className="w-full text-xs p-2 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden"
                value={profile.estimatedDataSubjectsCount}
                onChange={(e) => updateField('estimatedDataSubjectsCount', e.target.value)}
                placeholder="e.g. 2,500,000 retail policyholders"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">Transfer Data Payload Volume</label>
              <input
                type="text"
                className="w-full text-xs p-2 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden"
                value={profile.dataVolume}
                onChange={(e) => updateField('dataVolume', e.target.value)}
                placeholder="e.g. 10 TB / month continuous API streaming"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1 font-mono">Detailed Description of Specific Transferred Fields</label>
            <textarea
              rows={2}
              className="w-full text-xs p-2 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden font-mono"
              value={profile.sensitiveDataDescription}
              onChange={(e) => updateField('sensitiveDataDescription', e.target.value)}
              placeholder="Describe the exact attributes sent across the border..."
            />
          </div>
        </div>
      )}

      {/* STEP 3: Transfer Mechanism */}
      {activeStep === 3 && (
        <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm space-y-6">
          <div className="border-b border-[#262626] pb-3">
            <h3 className="text-base font-bold text-white font-mono uppercase">Step 3: Legal Transfer Instrument (GDPR Chapter V)</h3>
            <p className="text-xs text-[#71717A] font-mono mt-0.5">Select the governing legal tool under Article 45, 46, or 49 GDPR.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">Article 46 Transfer Tool</label>
              <select
                className="w-full text-xs p-2 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden font-medium"
                value={profile.transferMechanism}
                onChange={(e) => updateField('transferMechanism', e.target.value as TransferMechanism)}
              >
                <option value="uk_addendum_scc">UK Addendum to EU Standard Contractual Clauses (SCCs)</option>
                <option value="uk_idta">UK International Data Transfer Agreement (IDTA)</option>
                <option value="eu_scc_module_2">EU SCCs Module 2 (Controller to Processor)</option>
                <option value="eu_scc_module_1">EU SCCs Module 1 (Controller to Controller)</option>
                <option value="eu_scc_module_3">EU SCCs Module 3 (Processor to Processor)</option>
                <option value="bcr_processor">Binding Corporate Rules for Processors (BCR-P)</option>
                <option value="bcr_controller">Binding Corporate Rules for Controllers (BCR-C)</option>
                <option value="adequacy_decision">Statutory Adequacy Decision (Article 45)</option>
                <option value="art_49_derogation">Article 49 Derogation (Exceptional Use Only)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">Transfer Modality</label>
              <select
                className="w-full text-xs p-2 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden font-medium"
                value={profile.transferType}
                onChange={(e) => updateField('transferType', e.target.value as TransferType)}
              >
                <option value="transmission_hosting_storage">Transmission and hosting/local storage in third country</option>
                <option value="remote_access_no_download">Remote access without download (VDI / Screen Rendered only)</option>
                <option value="remote_access_with_download">Remote access with local storage / download rights</option>
                <option value="continuous_api_streaming">Continuous real-time API pipeline / streaming</option>
              </select>
            </div>
          </div>

          <div className="bg-[#141415] p-4 rounded border border-[#262626] space-y-3 font-mono">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">Contractual Safeguard Clauses</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-xs text-[#D1D5DB]">
                <input
                  type="checkbox"
                  className="rounded text-emerald-500 bg-[#080809] border-[#262626]"
                  checked={profile.foreignWarrantNotificationClause}
                  onChange={(e) => updateField('foreignWarrantNotificationClause', e.target.checked)}
                />
                <span>Mandatory 24h Foreign Warrant Notification Clause</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-[#D1D5DB]">
                <input
                  type="checkbox"
                  className="rounded text-emerald-500 bg-[#080809] border-[#262626]"
                  checked={profile.foreignWarrantChallengeCommitment}
                  onChange={(e) => updateField('foreignWarrantChallengeCommitment', e.target.checked)}
                />
                <span>Contractual Obligation to Challenge Subpoenas in Court</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-[#D1D5DB]">
                <input
                  type="checkbox"
                  className="rounded text-emerald-500 bg-[#080809] border-[#262626]"
                  checked={profile.dataSubjectIndemnification}
                  onChange={(e) => updateField('dataSubjectIndemnification', e.target.checked)}
                />
                <span>Direct Data Subject Indemnification Clause</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-[#D1D5DB]">
                <input
                  type="checkbox"
                  className="rounded text-emerald-500 bg-[#080809] border-[#262626]"
                  checked={profile.immediateExitAndPurgeClause}
                  onChange={(e) => updateField('immediateExitAndPurgeClause', e.target.checked)}
                />
                <span>Right of Immediate Exit & Certified Cryptographic Purge</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Technical & Cryptographic Safeguards */}
      {activeStep === 4 && (
        <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm space-y-6">
          <div className="border-b border-[#262626] pb-3">
            <h3 className="text-base font-bold text-white font-mono uppercase">Step 4: Technical Controls & Cryptographic Key Custody</h3>
            <p className="text-xs text-[#71717A] font-mono mt-0.5">Crucial for neutralizing Schrems II surveillance risks (EDPB 01/2020 Annex 2 Use Cases 1-3).</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 font-mono">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">
                  Key Management & Custody Architecture (Pillar 1)
                </label>
                <select
                  className="w-full text-xs p-2.5 rounded border border-[#262626] bg-[#080809] text-emerald-400 font-bold focus:border-emerald-500 focus:outline-hidden"
                  value={profile.keyManagement}
                  onChange={(e) => updateField('keyManagement', e.target.value as KeyManagementModel)}
                >
                  <option value="byok_local_hsm">🛡️ Sovereign BYOK: Keys held in Local On-Premises HSM (Safe from US CLOUD Act)</option>
                  <option value="hyok_hold_your_own_key">🔐 Hold Your Own Key (HYOK) Cloud Envelope Architecture</option>
                  <option value="cloud_kms_customer_managed">⚠️ Customer-Managed Cloud KMS (Keys in Importer Cloud)</option>
                  <option value="provider_managed_keys">❌ Provider-Managed Keys (High Surveillance Vulnerability)</option>
                  <option value="no_encryption">❌ No Encryption / Plaintext Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">At-Rest Encryption Algorithm</label>
                <input
                  type="text"
                  className="w-full text-xs p-2 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden"
                  value={profile.atRestAlgorithm}
                  onChange={(e) => updateField('atRestAlgorithm', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">In-Transit Encryption & Mutual Authentication</label>
                <input
                  type="text"
                  className="w-full text-xs p-2 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden"
                  value={profile.transitProtocol}
                  onChange={(e) => updateField('transitProtocol', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3 bg-[#141415] p-4 rounded border border-[#262626] font-mono">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">Advanced Technical Shields</h4>

              <label className="flex items-start gap-2.5 text-xs text-[#D1D5DB] cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded text-emerald-500 bg-[#080809] border-[#262626]"
                  checked={profile.pseudonymizationPriorToTransfer}
                  onChange={(e) => updateField('pseudonymizationPriorToTransfer', e.target.checked)}
                />
                <div>
                  <span className="font-semibold text-white block">On-Soil Client-Side Pseudonymization</span>
                  <span className="text-[10px] text-[#71717A]">Salt and mapping repositories stored strictly within UK/EEA jurisdiction.</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-[#D1D5DB] cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded text-emerald-500 bg-[#080809] border-[#262626]"
                  checked={profile.confidentialComputingEnclaves}
                  onChange={(e) => updateField('confidentialComputingEnclaves', e.target.checked)}
                />
                <div>
                  <span className="font-semibold text-white block">Confidential Computing / Hardware Enclaves</span>
                  <span className="text-[10px] text-[#71717A]">Data-in-use protected via AMD SEV-SNP or Intel SGX memory encryption.</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-[#D1D5DB] cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded text-emerald-500 bg-[#080809] border-[#262626]"
                  checked={profile.zeroTrustNetworkAccess}
                  onChange={(e) => updateField('zeroTrustNetworkAccess', e.target.checked)}
                />
                <div>
                  <span className="font-semibold text-white block">Zero-Trust Network Access & Microsegmentation</span>
                  <span className="text-[10px] text-[#71717A]">Granular IP whitelisting, ephemeral certificates, and session recording.</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: PRA SS2/21 Operational Resilience & Exit */}
      {activeStep === 5 && (
        <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm space-y-6">
          <div className="border-b border-[#262626] pb-3">
            <h3 className="text-base font-bold text-white font-mono uppercase">Step 5: PRA SS2/21 Outsourcing & Resilience Mandates</h3>
            <p className="text-xs text-[#71717A] font-mono mt-0.5">Chapters 5, 8, and 10 of PRA SS2/21 compliance for Critical or Important Functions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 font-mono">
              <label className="p-3.5 rounded border bg-[#141415] border-cyan-800/60 flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 rounded text-cyan-500 bg-[#080809] border-[#262626] w-4 h-4"
                  checked={profile.isMaterialOutsourcing}
                  onChange={(e) => updateField('isMaterialOutsourcing', e.target.checked)}
                />
                <div>
                  <span className="font-bold text-xs text-white block">Classify as Material Outsourcing / CIF Function</span>
                  <span className="text-xs text-cyan-300 block mt-0.5">
                    Engagement supports a Critical or Important Function (e.g. core payments, underwriting, settlement, AI trading model).
                  </span>
                </div>
              </label>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">Supported Important Business Service (IBS)</label>
                <input
                  type="text"
                  className="w-full text-xs p-2 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden"
                  value={profile.importantBusinessService}
                  onChange={(e) => updateField('importantBusinessService', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">Maximum Impact Tolerance (Hours)</label>
                <input
                  type="number"
                  className="w-full text-xs p-2 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden"
                  value={profile.impactToleranceHours}
                  onChange={(e) => updateField('impactToleranceHours', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-4 bg-[#141415] p-4 rounded border border-[#262626] font-mono">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">Audit & Stressed Exit Provisions</h4>

              <label className="flex items-center gap-2 text-xs text-[#D1D5DB]">
                <input
                  type="checkbox"
                  className="rounded text-emerald-500 bg-[#080809] border-[#262626]"
                  checked={profile.praDirectInspectionClause}
                  onChange={(e) => updateField('praDirectInspectionClause', e.target.checked)}
                />
                <span>Sections 165A & 166 FSMA Unrestricted PRA/Bank Audit Clause</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-[#D1D5DB]">
                <input
                  type="checkbox"
                  className="rounded text-emerald-500 bg-[#080809] border-[#262626]"
                  checked={profile.testedStressedExitPlan}
                  onChange={(e) => updateField('testedStressedExitPlan', e.target.checked)}
                />
                <span>Documented & Tested Stressed Exit Plan (Insolvency/Failure)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-[#D1D5DB]">
                <input
                  type="checkbox"
                  className="rounded text-emerald-500 bg-[#080809] border-[#262626]"
                  checked={profile.multiRegionActiveFailover}
                  onChange={(e) => updateField('multiRegionActiveFailover', e.target.checked)}
                />
                <span>Multi-Region / Hybrid Cloud Standby Architecture</span>
              </label>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">Vendor Substitutability Rating</label>
                <select
                  className="w-full text-xs p-2 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden"
                  value={profile.substitutabilityRating}
                  onChange={(e) => updateField('substitutabilityRating', e.target.value as any)}
                >
                  <option value="immediate_hot_standby">Immediate Hot Standby / Instant Switch</option>
                  <option value="substitutable_under_3_months">Substitutable under 3 Months</option>
                  <option value="vendor_lock_in_complex">Vendor Lock-In / Highly Complex Exit</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: Sub-Processors */}
      {activeStep === 6 && (
        <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#262626] pb-3">
            <div>
              <h3 className="text-base font-bold text-white font-mono uppercase">Step 6: Chain Outsourcing & Sub-processors (PRA Chapter 9)</h3>
              <p className="text-xs text-[#71717A] font-mono mt-0.5">Map fourth-party dependencies and audit flow-down obligations.</p>
            </div>
            <button
              onClick={addSubProcessor}
              className="px-3 py-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 rounded transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Sub-processor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            <label className="flex items-center gap-2 text-xs text-[#D1D5DB]">
              <input
                type="checkbox"
                className="rounded text-emerald-500 bg-[#080809] border-[#262626]"
                checked={profile.priorWrittenAuthRequiredForSubprocessors}
                onChange={(e) => updateField('priorWrittenAuthRequiredForSubprocessors', e.target.checked)}
              />
              <span className="font-semibold">Prior Written Authorization Required for Sub-processors (GDPR Art 28)</span>
            </label>

            <div>
              <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">Sub-processor Change Notification Period (Days)</label>
              <input
                type="number"
                className="w-full text-xs p-2 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden"
                value={profile.subprocessorNoticePeriodDays}
                onChange={(e) => updateField('subprocessorNoticePeriodDays', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-3 font-mono">
            {profile.subProcessors.map((sub, index) => (
              <div key={sub.id} className="p-4 rounded border border-[#262626] bg-[#141415] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                  <div>
                    <span className="text-[10px] text-[#71717A] uppercase font-bold">Sub-Processor Name</span>
                    <input
                      type="text"
                      className="w-full text-xs p-2 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden font-medium"
                      value={sub.name}
                      onChange={(e) => {
                        const updated = [...profile.subProcessors];
                        updated[index].name = e.target.value;
                        updateField('subProcessors', updated);
                      }}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#71717A] uppercase font-bold">Country</span>
                    <input
                      type="text"
                      className="w-full text-xs p-2 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden"
                      value={sub.country}
                      onChange={(e) => {
                        const updated = [...profile.subProcessors];
                        updated[index].country = e.target.value;
                        updateField('subProcessors', updated);
                      }}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#71717A] uppercase font-bold">Service Function</span>
                    <input
                      type="text"
                      className="w-full text-xs p-2 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden"
                      value={sub.serviceDescription}
                      onChange={(e) => {
                        const updated = [...profile.subProcessors];
                        updated[index].serviceDescription = e.target.value;
                        updateField('subProcessors', updated);
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-[#D1D5DB]">
                    <input
                      type="checkbox"
                      className="rounded text-emerald-500 bg-[#080809] border-[#262626]"
                      checked={sub.hasAccessToClearData}
                      onChange={(e) => {
                        const updated = [...profile.subProcessors];
                        updated[index].hasAccessToClearData = e.target.checked;
                        updateField('subProcessors', updated);
                      }}
                    />
                    <span>Cleartext Access</span>
                  </label>
                  <button
                    onClick={() => removeSubProcessor(sub.id)}
                    className="p-1.5 text-rose-400 hover:bg-rose-950/60 rounded border border-transparent hover:border-rose-800 transition-colors"
                    title="Remove Sub-processor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0F0F10] text-[#D1D5DB] border border-[#262626] p-4 rounded-xl shadow-md font-mono">
        <div className="flex items-center gap-3 text-xs text-[#71717A]">
          <div className="flex items-center gap-1.5">
            {autoSaveStatus === 'saving' ? (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            ) : autoSaveStatus === 'saved' && autoSaveEnabled ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#52525B]"></span>
            )}
            <span className="text-[#A1A1AA] text-[11px]">
              {autoSaveStatus === 'saving' ? 'Auto-saving...' : `Protected (Saved ${timeAgoText})`}
            </span>
          </div>
          <span className="text-[#3F3F46] hidden md:inline">•</span>
          <span className="hidden md:inline text-[11px]">PRA SS2/21, GDPR Art 44-49 rules engine live.</span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          <button
            onClick={handleManualSave}
            className="px-3 py-2 text-xs font-semibold text-[#D1D5DB] hover:text-white bg-[#141415] hover:bg-[#1F1F21] border border-[#262626] rounded transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Save draft directly to browser storage"
          >
            {saveSuccessFeedback ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                <span>Save Draft</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsSnapshotModalOpen(true)}
            className="px-3 py-2 text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-700/60 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Trigger encrypted blob snapshot download as disaster recovery backup"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>Snapshot</span>
          </button>

          {activeStep < 6 && (
            <button
              onClick={() => setActiveStep(prev => Math.min(6, prev + 1))}
              className="px-4 py-2 text-xs font-semibold text-[#D1D5DB] bg-[#141415] hover:bg-[#1F1F21] border border-[#262626] rounded transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onRunAssessment}
            className="px-5 py-2 text-xs font-bold text-emerald-400 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 rounded shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            Generate Compliance Assessment Report
          </button>
        </div>
      </div>

      {/* Cryptographic Snapshot Modal */}
      <SnapshotModal
        isOpen={isSnapshotModalOpen}
        onClose={() => setIsSnapshotModalOpen(false)}
        profile={profile}
        activeStep={activeStep}
        onRestoreSnapshot={handleRestoreSnapshot}
      />

      {/* Preset Assessment Gallery Modal */}
      <PresetGalleryModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        currentProfileId={profile.id}
        onSelectPreset={(selectedPreset) => {
          onUpdateProfile(selectedPreset);
          saveDraftToStorage(selectedPreset, 1);
          setLastSavedIso(new Date().toISOString());
        }}
      />
    </div>
  );
};
