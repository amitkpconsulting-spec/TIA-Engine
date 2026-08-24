import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  ExternalLink, 
  Code2, 
  ShieldCheck, 
  Database, 
  Layers, 
  FileJson, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw,
  Terminal,
  Cpu,
  Fingerprint,
  Building2,
  Workflow
} from 'lucide-react';
import { TransferProfile, TIAEvaluationResult, ExternalIntegrations } from '../types/tia';
import { generateUniqueTiaId, generateIntegrationCurlSnippet } from '../utils/tiaIdGenerator';

interface CrossFrameworkIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TransferProfile;
  evaluation: TIAEvaluationResult;
  onUpdateProfile: (updated: TransferProfile) => void;
}

export const CrossFrameworkIntegrationModal: React.FC<CrossFrameworkIntegrationModalProps> = ({
  isOpen,
  onClose,
  profile,
  evaluation,
  onUpdateProfile
}) => {
  const [activeTab, setActiveTab] = useState<'servicenow' | 'onetrust' | 'pra_mtp' | 'dora_ict' | 'oscal' | 'api_webhook'>('servicenow');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isEditingIds, setIsEditingIds] = useState(false);
  const [externalIds, setExternalIds] = useState<ExternalIntegrations>(
    profile.externalIntegrations || evaluation.externalIntegrations || {}
  );

  if (!isOpen) return null;

  const tiaId = profile.tiaReferenceId || evaluation.tiaReferenceId || 'TIA-2026-PENDING';
  const uuid = profile.universalUniqueIdentifier || evaluation.universalUniqueIdentifier || '';
  const urn = profile.crossFrameworkUrn || evaluation.crossFrameworkUrn || '';
  const fingerprint = evaluation.cryptographicFingerprint || '0x00000000000000000000000000000000';
  const payloads = evaluation.crossFrameworkPayloads;

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const handleRegenerateId = () => {
    if (window.confirm('Regenerate a new unique canonical TIA ID bundle for this assessment profile? All cross-framework references will be updated.')) {
      const bundle = generateUniqueTiaId();
      const updated: TransferProfile = {
        ...profile,
        tiaReferenceId: bundle.tiaReferenceId,
        universalUniqueIdentifier: bundle.universalUniqueIdentifier,
        crossFrameworkUrn: bundle.crossFrameworkUrn,
        externalIntegrations: bundle.externalIntegrations,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setExternalIds(bundle.externalIntegrations);
      onUpdateProfile(updated);
    }
  };

  const handleSaveExternalIds = () => {
    const updated: TransferProfile = {
      ...profile,
      externalIntegrations: externalIds,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    onUpdateProfile(updated);
    setIsEditingIds(false);
  };

  const curlSnippet = generateIntegrationCurlSnippet(tiaId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-[#0F0F10] border border-[#262626] rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#262626] bg-[#141415] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono tracking-tight">
                  Cross-Framework Integration & Unique TIA Registry
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  INTEROPERABILITY_ENGINE
                </span>
              </div>
              <p className="text-xs text-[#71717A] font-mono mt-0.5">
                Universal persistent ID, cryptographic fingerprinting & GRC payload dispatchers
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-[#71717A] hover:text-white p-2 rounded-lg hover:bg-[#1F1F20] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canonical ID & Identity Strip */}
        <div className="bg-[#0A0A0B] border-b border-[#262626] p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 1. Canonical TIA ID */}
            <div className="bg-[#141415] border border-[#262626] rounded-xl p-4 relative group">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#71717A] mb-1">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> CANONICAL_TIA_ID
                </span>
                <span className="text-[9px] bg-emerald-950/80 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                  STANDARD_FORMAT
                </span>
              </div>
              <div className="text-base font-mono font-bold text-white tracking-wider flex items-center justify-between mt-1">
                <span>{tiaId}</span>
                <button
                  onClick={() => handleCopy(tiaId, 'tiaId')}
                  className="text-[#71717A] hover:text-emerald-400 p-1.5 rounded hover:bg-[#1F1F20] transition-colors"
                  title="Copy Canonical TIA ID"
                >
                  {copiedKey === 'tiaId' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-[#52525B] font-mono mt-1">
                Standardised format for enterprise risk registers
              </p>
            </div>

            {/* 2. Universal UUID v4 */}
            <div className="bg-[#141415] border border-[#262626] rounded-xl p-4 relative group">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#71717A] mb-1">
                <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                  <Cpu className="w-3.5 h-3.5" /> UUID_v4
                </span>
                <span className="text-[9px] bg-cyan-950/80 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800">
                  RFC_4122
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-[#E5E7EB] tracking-tight truncate flex items-center justify-between mt-2">
                <span className="truncate mr-2">{uuid}</span>
                <button
                  onClick={() => handleCopy(uuid, 'uuid')}
                  className="text-[#71717A] hover:text-cyan-400 p-1.5 rounded hover:bg-[#1F1F20] transition-colors shrink-0"
                  title="Copy Universal UUID"
                >
                  {copiedKey === 'uuid' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-[#52525B] font-mono mt-1">
                Globally unique database primary key
              </p>
            </div>

            {/* 3. Cross-Framework URN */}
            <div className="bg-[#141415] border border-[#262626] rounded-xl p-4 relative group">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#71717A] mb-1">
                <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                  <Workflow className="w-3.5 h-3.5" /> GRC_URN_SCHEME
                </span>
                <span className="text-[9px] bg-indigo-950/80 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800">
                  OPEN_GRC
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-[#E5E7EB] tracking-tight truncate flex items-center justify-between mt-2">
                <span className="truncate mr-2">{urn}</span>
                <button
                  onClick={() => handleCopy(urn, 'urn')}
                  className="text-[#71717A] hover:text-indigo-400 p-1.5 rounded hover:bg-[#1F1F20] transition-colors shrink-0"
                  title="Copy Cross-Framework URN"
                >
                  {copiedKey === 'urn' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-[#52525B] font-mono mt-1">
                Semantic web & metadata graph locator
              </p>
            </div>

          </div>

          {/* SHA-256 Cryptographic Fingerprint Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-[#141415] border border-[#262626] text-xs font-mono">
            <div className="flex items-center gap-2 text-[#71717A] min-w-0">
              <Fingerprint className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[#A1A1AA] font-semibold shrink-0">SHA-256 AUDIT HASH:</span>
              <span className="text-[#D1D5DB] truncate font-mono text-[11px]">{fingerprint}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleCopy(fingerprint, 'fingerprint')}
                className="flex items-center gap-1 text-[11px] text-[#A1A1AA] hover:text-white px-2 py-1 rounded bg-[#1F1F20] hover:bg-[#2A2A2C] transition-colors"
              >
                {copiedKey === 'fingerprint' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Hash
              </button>
              <button
                onClick={handleRegenerateId}
                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded bg-emerald-950/60 border border-emerald-800/40 hover:bg-emerald-900/60 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate ID Bundle
              </button>
            </div>
          </div>
        </div>

        {/* Integration Selector Tabs */}
        <div className="border-b border-[#262626] bg-[#141415] px-6 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'servicenow', label: 'ServiceNow GRC / VRM', icon: Database, color: 'text-emerald-400' },
            { id: 'onetrust', label: 'OneTrust TIA / PIA', icon: ShieldCheck, color: 'text-cyan-400' },
            { id: 'pra_mtp', label: 'PRA Table 5 MTP Register', icon: Building2, color: 'text-amber-400' },
            { id: 'dora_ict', label: 'EU DORA ICT Register', icon: Layers, color: 'text-indigo-400' },
            { id: 'oscal', label: 'NIST OSCAL JSON', icon: FileJson, color: 'text-rose-400' },
            { id: 'api_webhook', label: 'REST & cURL Sync', icon: Terminal, color: 'text-purple-400' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-mono border-b-2 font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? 'border-emerald-500 text-white bg-[#1A1A1B]' 
                    : 'border-transparent text-[#71717A] hover:text-[#D1D5DB] hover:bg-[#171718]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${tab.color}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* 1. ServiceNow GRC */}
          {activeTab === 'servicenow' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    ServiceNow Vendor Risk Management (sn_vrm) Record
                  </h3>
                  <p className="text-xs text-[#71717A] font-mono mt-0.5">
                    Schema-compliant payload for ingesting TIA assessments into ServiceNow IRM / VRM tables
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#A1A1AA] bg-[#141415] px-2.5 py-1 rounded border border-[#262626]">
                    Ref: <strong className="text-emerald-400">{externalIds.serviceNowGrcId || `SNOW-VRM-${tiaId}`}</strong>
                  </span>
                  <button
                    onClick={() => handleCopy(JSON.stringify(payloads?.serviceNowPayload || {}, null, 2), 'snowPayload')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 hover:bg-emerald-900 transition-colors"
                  >
                    {copiedKey === 'snowPayload' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy ServiceNow JSON
                  </button>
                </div>
              </div>

              <div className="bg-[#0A0A0B] border border-[#262626] rounded-xl p-4 font-mono text-xs text-[#D1D5DB] overflow-x-auto max-h-[340px] relative">
                <pre>{JSON.stringify(payloads?.serviceNowPayload || {}, null, 2)}</pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-[#141415] border border-[#262626] rounded-lg p-3">
                  <span className="text-[#71717A] block text-[10px]">TARGET TABLE</span>
                  <span className="text-white font-semibold">sn_vrm_assessment_record</span>
                </div>
                <div className="bg-[#141415] border border-[#262626] rounded-lg p-3">
                  <span className="text-[#71717A] block text-[10px]">CORRELATION KEY</span>
                  <span className="text-emerald-400 font-semibold">{tiaId}</span>
                </div>
                <div className="bg-[#141415] border border-[#262626] rounded-lg p-3">
                  <span className="text-[#71717A] block text-[10px]">VERDICT MAPPING</span>
                  <span className="text-white font-semibold">{evaluation.verdict} ({evaluation.overallRiskScore}/100)</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. OneTrust */}
          {activeTab === 'onetrust' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    OneTrust Third-Party Risk & TIA Assessment Schema
                  </h3>
                  <p className="text-xs text-[#71717A] font-mono mt-0.5">
                    Pre-formatted payload for OneTrust Assessment Automation and Data Guidance TIA templates
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#A1A1AA] bg-[#141415] px-2.5 py-1 rounded border border-[#262626]">
                    Ref: <strong className="text-cyan-400">{externalIds.oneTrustTiaId || `OT-TIA-${tiaId}`}</strong>
                  </span>
                  <button
                    onClick={() => handleCopy(JSON.stringify(payloads?.oneTrustPayload || {}, null, 2), 'oneTrustPayload')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-600/40 hover:bg-cyan-900 transition-colors"
                  >
                    {copiedKey === 'oneTrustPayload' ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy OneTrust JSON
                  </button>
                </div>
              </div>

              <div className="bg-[#0A0A0B] border border-[#262626] rounded-xl p-4 font-mono text-xs text-[#D1D5DB] overflow-x-auto max-h-[340px]">
                <pre>{JSON.stringify(payloads?.oneTrustPayload || {}, null, 2)}</pre>
              </div>

              <div className="bg-[#141415] border border-[#262626] rounded-lg p-3 text-xs font-mono flex items-center justify-between">
                <span className="text-[#71717A]">OneTrust Assessment Template:</span>
                <span className="text-cyan-300 font-semibold">EDPB 01/2020 Schrems II Six-Step Methodology</span>
              </div>
            </div>
          )}

          {/* 3. Bank of England / PRA MTP Register */}
          {activeTab === 'pra_mtp' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    Bank of England / PRA SS2/21 Table 5 Material Third Party Register
                  </h3>
                  <p className="text-xs text-[#71717A] font-mono mt-0.5">
                    Statutory record format mandated under Chapter 6 & Chapter 8 for UK Prudential Regulation
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#A1A1AA] bg-[#141415] px-2.5 py-1 rounded border border-[#262626]">
                    Ref: <strong className="text-amber-400">{externalIds.praMtpRegisterId || `PRA-MTP-${tiaId}`}</strong>
                  </span>
                  <button
                    onClick={() => handleCopy(JSON.stringify(payloads?.praMtpPayload || {}, null, 2), 'praMtpPayload')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono bg-amber-950/80 text-amber-300 border border-amber-600/40 hover:bg-amber-900 transition-colors"
                  >
                    {copiedKey === 'praMtpPayload' ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Table 5 JSON
                  </button>
                </div>
              </div>

              <div className="bg-[#0A0A0B] border border-[#262626] rounded-xl p-4 font-mono text-xs text-[#D1D5DB] overflow-x-auto max-h-[340px]">
                <pre>{JSON.stringify(payloads?.praMtpPayload || {}, null, 2)}</pre>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-[#141415] border border-[#262626] rounded-lg p-3">
                  <span className="text-[#71717A] block text-[10px]">PRA MATERIALITY CLASSIFICATION</span>
                  <span className="text-amber-400 font-semibold">{profile.isMaterialOutsourcing ? 'CRITICAL / IMPORTANT FUNCTION (CIF)' : 'NON-MATERIAL'}</span>
                </div>
                <div className="bg-[#141415] border border-[#262626] rounded-lg p-3">
                  <span className="text-[#71717A] block text-[10px]">ACCOUNTABLE SMF HOLDER</span>
                  <span className="text-white font-semibold">{profile.seniorManagerFunction}</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. EU DORA ICT Register */}
          {activeTab === 'dora_ict' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    EU DORA (Regulation EU 2022/2554) Article 28(3) ICT Register
                  </h3>
                  <p className="text-xs text-[#71717A] font-mono mt-0.5">
                    European Supervisory Authorities (ESA) Information Register on ICT third-party arrangements
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#A1A1AA] bg-[#141415] px-2.5 py-1 rounded border border-[#262626]">
                    Ref: <strong className="text-indigo-400">{externalIds.doraIctRegisterId || `DORA-ICT-${tiaId}`}</strong>
                  </span>
                  <button
                    onClick={() => handleCopy(JSON.stringify(payloads?.doraRegisterPayload || {}, null, 2), 'doraPayload')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-600/40 hover:bg-indigo-900 transition-colors"
                  >
                    {copiedKey === 'doraPayload' ? <Check className="w-3.5 h-3.5 text-indigo-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy DORA JSON
                  </button>
                </div>
              </div>

              <div className="bg-[#0A0A0B] border border-[#262626] rounded-xl p-4 font-mono text-xs text-[#D1D5DB] overflow-x-auto max-h-[340px]">
                <pre>{JSON.stringify(payloads?.doraRegisterPayload || {}, null, 2)}</pre>
              </div>

              <div className="bg-[#141415] border border-[#262626] rounded-lg p-3 text-xs font-mono flex items-center justify-between">
                <span className="text-[#71717A]">Concentration & Lock-in Risk Classification:</span>
                <span className="text-indigo-300 font-semibold">{profile.substitutabilityRating.replace(/_/g, ' ').toUpperCase()}</span>
              </div>
            </div>
          )}

          {/* 5. NIST OSCAL JSON */}
          {activeTab === 'oscal' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                    <FileJson className="w-4 h-4 text-rose-400" />
                    NIST OSCAL (Open Security Controls Assessment Language) v1.1
                  </h3>
                  <p className="text-xs text-[#71717A] font-mono mt-0.5">
                    Standardised machine-readable assessment results model for automated compliance validation
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(JSON.stringify(payloads?.oscalJson || {}, null, 2), 'oscalPayload')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono bg-rose-950/80 text-rose-300 border border-rose-600/40 hover:bg-rose-900 transition-colors"
                  >
                    {copiedKey === 'oscalPayload' ? <Check className="w-3.5 h-3.5 text-rose-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy OSCAL JSON
                  </button>
                </div>
              </div>

              <div className="bg-[#0A0A0B] border border-[#262626] rounded-xl p-4 font-mono text-xs text-[#D1D5DB] overflow-x-auto max-h-[340px]">
                <pre>{JSON.stringify(payloads?.oscalJson || {}, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* 6. REST API & Webhook Dispatch */}
          {activeTab === 'api_webhook' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    Automated Webhook & REST API Synchronization
                  </h3>
                  <p className="text-xs text-[#71717A] font-mono mt-0.5">
                    Execute automated downstream synchronization via cURL, SOAR pipelines, or CI/CD policy gates
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(curlSnippet, 'curlSnippet')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono bg-purple-950/80 text-purple-300 border border-purple-600/40 hover:bg-purple-900 transition-colors"
                >
                  {copiedKey === 'curlSnippet' ? <Check className="w-3.5 h-3.5 text-purple-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy cURL Command
                </button>
              </div>

              <div className="bg-[#0A0A0B] border border-[#262626] rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
                <pre>{curlSnippet}</pre>
              </div>

              <div className="bg-[#141415] border border-[#262626] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#A1A1AA] font-bold">Universal Webhook Event Payload:</span>
                  <button
                    onClick={() => handleCopy(JSON.stringify(payloads?.restWebhookPayload || {}, null, 2), 'webhookPayload')}
                    className="text-purple-400 hover:text-purple-300 text-[11px] flex items-center gap-1"
                  >
                    {copiedKey === 'webhookPayload' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Event Payload
                  </button>
                </div>
                <div className="bg-[#0A0A0B] rounded-lg p-3 font-mono text-xs text-[#D1D5DB] overflow-x-auto max-h-[160px]">
                  <pre>{JSON.stringify(payloads?.restWebhookPayload || {}, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}

          {/* External Mapping ID Editor (Expandable) */}
          <div className="border border-[#262626] rounded-xl bg-[#141415] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  External System Identifier Mappings
                </h4>
              </div>
              <button
                onClick={() => setIsEditingIds(!isEditingIds)}
                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
              >
                {isEditingIds ? 'Collapse Editor' : 'Edit Tool Mapping IDs'}
              </button>
            </div>

            {isEditingIds && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] font-mono text-[#71717A] mb-1">ServiceNow Record ID</label>
                  <input
                    type="text"
                    value={externalIds.serviceNowGrcId || ''}
                    onChange={(e) => setExternalIds({ ...externalIds, serviceNowGrcId: e.target.value })}
                    placeholder="SNOW-VRM-2026-XXXX"
                    className="w-full bg-[#0A0A0B] border border-[#262626] rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#71717A] mb-1">OneTrust Assessment ID</label>
                  <input
                    type="text"
                    value={externalIds.oneTrustTiaId || ''}
                    onChange={(e) => setExternalIds({ ...externalIds, oneTrustTiaId: e.target.value })}
                    placeholder="OT-TIA-2026-XXXX"
                    className="w-full bg-[#0A0A0B] border border-[#262626] rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#71717A] mb-1">PRA MTP Table 5 ID</label>
                  <input
                    type="text"
                    value={externalIds.praMtpRegisterId || ''}
                    onChange={(e) => setExternalIds({ ...externalIds, praMtpRegisterId: e.target.value })}
                    placeholder="PRA-MTP-2026-XXXX"
                    className="w-full bg-[#0A0A0B] border border-[#262626] rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#71717A] mb-1">EU DORA ICT Register ID</label>
                  <input
                    type="text"
                    value={externalIds.doraIctRegisterId || ''}
                    onChange={(e) => setExternalIds({ ...externalIds, doraIctRegisterId: e.target.value })}
                    placeholder="DORA-ICT-REG-2026-XXXX"
                    className="w-full bg-[#0A0A0B] border border-[#262626] rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#71717A] mb-1">Jira GRC Issue Key</label>
                  <input
                    type="text"
                    value={externalIds.jiraIssueKey || ''}
                    onChange={(e) => setExternalIds({ ...externalIds, jiraIssueKey: e.target.value })}
                    placeholder="SEC-TIA-XXXX"
                    className="w-full bg-[#0A0A0B] border border-[#262626] rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#71717A] mb-1">Custom GRC Reference</label>
                  <input
                    type="text"
                    value={externalIds.customSystemId || ''}
                    onChange={(e) => setExternalIds({ ...externalIds, customSystemId: e.target.value })}
                    placeholder="CUSTOM-REF-XXXX"
                    className="w-full bg-[#0A0A0B] border border-[#262626] rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2 md:col-span-3 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingIds(false)}
                    className="px-3 py-1.5 rounded text-xs font-mono text-[#71717A] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveExternalIds}
                    className="px-3 py-1.5 rounded text-xs font-mono bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-colors"
                  >
                    Save Integration IDs
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#141415] border-t border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#71717A]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
            <span>All identifiers comply with Open-GRC, NIST OSCAL v1.1 and PRA SS2/21 Table 5 formats.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#262626] hover:bg-[#333] text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
