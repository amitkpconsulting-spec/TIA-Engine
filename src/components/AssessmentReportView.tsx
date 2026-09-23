import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Scale, 
  Server, 
  KeyRound, 
  Lock, 
  FileText, 
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Download,
  Copy,
  Info,
  Clock,
  Building,
  Layers,
  ArrowRight,
  Printer,
  Share2,
  Fingerprint,
  ArrowLeftRight,
  FileSpreadsheet,
  Sparkles
} from 'lucide-react';
import { TransferProfile, TIAEvaluationResult } from '../types/tia';
import { JURISDICTIONS } from '../data/jurisdictions';
import { ThreePillarPdfReportModal } from './ThreePillarPdfReportModal';
import { RiskAppetiteRadarChart } from './RiskAppetiteRadarChart';
import { PillarType } from '../utils/threePillarReports';
import { PrioritizedComplianceActionItems } from './PrioritizedComplianceActionItems';
import { downloadAuditCsv } from '../utils/auditExporter';
import { StatusBadge } from './StatusBadge';

interface AssessmentReportViewProps {
  profile: TransferProfile;
  evaluation: TIAEvaluationResult;
  onNavigateTab: (tab: string) => void;
  onOpenIntegrationModal?: () => void;
  onOpenPrintModal?: () => void;
  onUpdateProfile?: (updated: TransferProfile) => void;
  onOpenGuidedSetup?: () => void;
  onShowToast?: (message: string) => void;
}

export const AssessmentReportView: React.FC<AssessmentReportViewProps> = ({
  profile,
  evaluation,
  onNavigateTab,
  onOpenIntegrationModal,
  onOpenPrintModal,
  onUpdateProfile,
  onOpenGuidedSetup,
  onShowToast
}) => {
  const jurisdiction = JURISDICTIONS[profile.importerCountry];
  const [copied, setCopied] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfModalPillar, setPdfModalPillar] = useState<PillarType>('Consolidated');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isOnboardingSkipped, setIsOnboardingSkipped] = useState(false);

  useEffect(() => {
    try {
      const skipped = localStorage.getItem('tia_onboarding_skipped') === 'true';
      setIsOnboardingSkipped(skipped);
    } catch (e) {
      // silent
    }
  }, []);

  const handleOpenPdf = (pillar: PillarType) => {
    setPdfModalPillar(pillar);
    setIsPdfModalOpen(true);
  };

  const handleCopyPolicy = () => {
    navigator.clipboard.writeText(evaluation.generatedPolicyDocument);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    downloadAuditCsv(profile, evaluation);
    if (onShowToast) {
      onShowToast('✓ Downloaded Compliance Audit Report (.CSV) sorted Critical-first.');
    }
  };

  const handleDownloadPdf = () => {
    if (onOpenPrintModal) {
      onOpenPrintModal();
    } else {
      handleOpenPdf('Consolidated');
    }
  };

  const getVerdictBadge = (verdict: string) => {
    return <StatusBadge status={verdict} size="md" />;
  };

  const getRiskColor = (score: number) => {
    if (score > 70) return 'text-rose-400 bg-rose-950/40 border-rose-800/60';
    if (score > 40) return 'text-amber-400 bg-amber-950/40 border-amber-800/60';
    return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
  };

  return (
    <div className="space-y-6 w-full mx-auto pb-12 font-sans">
      {/* Onboarding Bypass Banner (Prompt to configure settings later) */}
      {isOnboardingSkipped && onOpenGuidedSetup && (
        <div className="bg-amber-950/50 border border-amber-500/50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono shadow-sm">
          <div className="flex items-center gap-2.5 text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Baseline Configuration Notice:</strong> You are currently using default generic compliance settings. Launch the setup wizard to configure your specific regulatory region & industry sector.
            </span>
          </div>
          <button
            onClick={onOpenGuidedSetup}
            className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.25)]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Guided Setup</span>
          </button>
        </div>
      )}

      {/* Top Banner / Assessment Meta */}
      <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#262626] pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-[#1A1A1B] px-2 py-0.5 rounded border border-[#262626]">
                DOSSIER_ID: {evaluation.evaluationId}
              </span>
              <button
                onClick={onOpenIntegrationModal}
                className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900/90 px-2.5 py-0.5 rounded border border-cyan-500/40 flex items-center gap-1.5 transition-colors cursor-pointer shadow-[0_0_8px_rgba(6,182,212,0.15)]"
                title="View & Export Cross-Framework Integration Registry (ServiceNow, OneTrust, PRA MTP, DORA)"
              >
                <Share2 className="w-3 h-3 text-cyan-400" />
                <span>TIA_REF: {evaluation.tiaReferenceId || profile.tiaReferenceId || 'TIA-2026'}</span>
              </button>
              <span className="text-[#52525B]">•</span>
              <span className="text-xs text-[#71717A] font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#52525B]" />
                {new Date(evaluation.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight font-mono mt-1">
              {profile.title}
            </h1>
            <p className="text-xs text-[#A1A1AA] font-mono mt-1">
              ORIGIN: <span className="text-white font-semibold">{profile.exporterName}</span> ({profile.exporterCountry}) ➔ DESTINATION: <span className="text-white font-semibold">{profile.importerName}</span> ({profile.importerCountry})
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#141415] p-1 rounded-xl border border-[#262626]">
              <button
                onClick={() => onNavigateTab('comparison')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-700/50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Compare this TIA against another draft, saved profile, or benchmark"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
                <span>Compare</span>
              </button>

              {/* Epic 4: Audit-Ready Export Report Dropdown (.PDF / .CSV) */}
              <div className="relative">
                <button
                  onClick={() => setIsExportMenuOpen(prev => !prev)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-black bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.35)]"
                  title="Export Audit-Ready Report (.PDF or .CSV)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Report</span>
                  <ChevronDown className="w-3 h-3 text-black" />
                </button>

                {isExportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#141415] border border-[#262626] rounded-xl shadow-2xl z-50 p-1.5 font-mono text-xs animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={() => {
                        setIsExportMenuOpen(false);
                        handleDownloadCsv();
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#1E1E22] text-[#D1D5DB] hover:text-white flex items-start gap-2.5 cursor-pointer transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>Download .CSV</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">Critical First</span>
                        </div>
                        <div className="text-[10px] text-[#71717A] mt-0.5">
                          Audit summary dataset sorted by risk hierarchy
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsExportMenuOpen(false);
                        handleDownloadPdf();
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#1E1E22] text-[#D1D5DB] hover:text-white flex items-start gap-2.5 cursor-pointer transition-colors mt-0.5 border-t border-[#1F1F22]"
                    >
                      <FileText className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>Download .PDF Dossier</span>
                        </div>
                        <div className="text-[10px] text-[#71717A] mt-0.5">
                          Formatted print dossier with timestamp & company metadata
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-[#71717A] font-mono uppercase">Status Verdict</div>
              <div className="mt-0.5">{getVerdictBadge(evaluation.verdict)}</div>
            </div>
            <div className={`px-4 py-2 rounded-lg border flex flex-col items-center justify-center font-mono ${getRiskColor(evaluation.overallRiskScore)}`}>
              <span className="text-[9px] uppercase tracking-widest font-semibold text-[#A1A1AA]">Risk Index</span>
              <span className="text-2xl font-black">{evaluation.overallRiskScore}<span className="text-xs font-normal text-[#71717A]">/100</span></span>
            </div>
          </div>
        </div>

        {/* Quick KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-[#141415] p-3 rounded border border-[#262626]">
            <span className="text-[10px] font-mono uppercase text-[#71717A] block">Transfer Mechanism</span>
            <span className="text-xs font-mono font-bold text-white block mt-1 truncate" title={evaluation.transferMechanismSummary}>
              {profile.transferMechanism.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
          <div className="bg-[#141415] p-3 rounded border border-[#262626]">
            <span className="text-[10px] font-mono uppercase text-[#71717A] block">PRA SS2/21 Scope</span>
            <span className={`text-xs font-mono font-bold block mt-1 ${profile.isMaterialOutsourcing ? 'text-amber-400' : 'text-emerald-400'}`}>
              {profile.isMaterialOutsourcing ? 'CIF / Material' : 'Standard Outsourcing'}
            </span>
          </div>
          <div className="bg-[#141415] p-3 rounded border border-[#262626]">
            <span className="text-[10px] font-mono uppercase text-[#71717A] block">Cryptographic Custody</span>
            <span className="text-xs font-mono font-bold text-emerald-400 block mt-1 truncate">
              {profile.keyManagement === 'byok_local_hsm' ? 'BYOK (Local HSM)' : profile.keyManagement.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="bg-[#141415] p-3 rounded border border-[#262626]">
            <span className="text-[10px] font-mono uppercase text-[#71717A] block">Audit Cadence</span>
            <span className="text-xs font-mono font-bold text-white block mt-1">
              {evaluation.reEvaluationSchedule.intervalMonths}M EVERGREEN
            </span>
          </div>
        </div>
      </div>

      {/* Prioritized Compliance Action Items (Epic 2 & Epic 3: Plain Language & Bulk Actions) */}
      {onUpdateProfile && (
        <PrioritizedComplianceActionItems
          profile={profile}
          evaluation={evaluation}
          onUpdateProfile={onUpdateProfile}
          onShowToast={onShowToast || (() => {})}
        />
      )}

      {/* SECTION 1: Executive Summary & Risk Rating */}
      <section className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#262626] pb-3 mb-4">
          <div className="w-6 h-6 rounded bg-[#1A1A1B] text-emerald-400 border border-[#262626] flex items-center justify-center font-mono text-xs font-bold">
            01
          </div>
          <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide">
            Executive Summary & Risk Index
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center py-2 border-b border-[#1F1F21]">
              <span className="text-[#71717A]">Transfer Mechanism:</span>
              <span className="font-semibold text-white text-right max-w-xs">{evaluation.transferMechanismSummary}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#1F1F21]">
              <span className="text-[#71717A]">Target Country & Legal Risk:</span>
              <span className="font-semibold text-white">{evaluation.targetCountryRiskSummary}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#1F1F21]">
              <span className="text-[#71717A]">PRA SS2/21 Criticality:</span>
              <span className="font-semibold text-amber-400">{evaluation.praCriticalityAssessment}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#1F1F21]">
              <span className="text-[#71717A]">Important Business Service (IBS):</span>
              <span className="font-semibold text-white">{profile.importantBusinessService}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#71717A]">Overall Verdict:</span>
              <span>{getVerdictBadge(evaluation.verdict)}</span>
            </div>
          </div>

          <div className="bg-[#141415] p-4 rounded-lg border border-[#262626] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest mb-2">
                <Info className="w-3.5 h-3.5" />
                Legal & Regulatory Rationale
              </div>
              <p className="text-xs text-[#D1D5DB] leading-relaxed font-sans">
                {evaluation.verdictRationale}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#262626] grid grid-cols-4 gap-2 text-center font-mono">
              <div className="bg-[#0A0A0B] p-2 rounded border border-[#1F1F21]">
                <div className="text-[9px] text-[#71717A] uppercase">Surveillance</div>
                <div className="text-xs font-bold text-rose-400">{evaluation.scores.surveillanceRiskScore}/100</div>
              </div>
              <div className="bg-[#0A0A0B] p-2 rounded border border-[#1F1F21]">
                <div className="text-[9px] text-[#71717A] uppercase">Tech Shield</div>
                <div className="text-xs font-bold text-emerald-400">{evaluation.scores.technicalProtectionScore}/100</div>
              </div>
              <div className="bg-[#0A0A0B] p-2 rounded border border-[#1F1F21]">
                <div className="text-[9px] text-[#71717A] uppercase">Legal Terms</div>
                <div className="text-xs font-bold text-blue-400">{evaluation.scores.legalSafeguardsScore}/100</div>
              </div>
              <div className="bg-[#0A0A0B] p-2 rounded border border-[#1F1F21]">
                <div className="text-[9px] text-[#71717A] uppercase">PRA BCP</div>
                <div className="text-xs font-bold text-purple-400">{evaluation.scores.praResilienceScore}/100</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Multivariate Risk Profile vs Institution Risk Appetite (Radar Chart) */}
      <RiskAppetiteRadarChart profile={profile} evaluation={evaluation} />

      {/* SECTION 3: Legal Landscape & Surveillance Risk Analysis */}
      <section className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#262626] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#1A1A1B] text-emerald-400 border border-[#262626] flex items-center justify-center font-mono text-xs font-bold">
              03
            </div>
            <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide">
              Legal Landscape & Surveillance Analysis ({profile.importerCountry})
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('jurisdictions')}
            className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            Explore Global Database <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {jurisdiction ? (
          <div className="space-y-4">
            <div className="bg-[#141415] border border-[#262626] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{jurisdiction.flagEmoji}</span>
                  <div>
                    <h3 className="text-xs font-bold text-white font-mono">{jurisdiction.countryName} Regulatory Profile</h3>
                    <p className="text-[11px] text-[#71717A] font-mono">Governing Privacy Law: <span className="text-[#D1D5DB] font-semibold">{jurisdiction.dataProtectionLaw}</span></p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A1A1B] text-emerald-400 border border-[#262626]">
                  DPA: {jurisdiction.dpaName}
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA] mt-2 leading-relaxed font-sans">
                {jurisdiction.legalRiskSummary}
              </p>
            </div>

            {/* Third Country Surveillance Statutes */}
            <div>
              <h4 className="text-[10px] font-mono uppercase text-[#71717A] tracking-widest mb-2">
                Public Authority & Intelligence Surveillance Statutes
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {jurisdiction.surveillanceLaws.map((law, idx) => (
                  <div key={idx} className="bg-[#141415] p-3.5 rounded border border-[#262626]">
                    <div className="flex items-start justify-between">
                      <span className="font-semibold text-xs text-white font-mono">{law.statuteName}</span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        law.bulkCollectionRisk === 'Critical' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                        law.bulkCollectionRisk === 'High' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-blue-950 text-blue-400 border border-blue-800'
                      }`}>
                        {law.bulkCollectionRisk} RISK
                      </span>
                    </div>
                    <p className="text-xs text-[#A1A1AA] mt-1.5 leading-relaxed font-sans">{law.scopeAndPowers}</p>
                    <div className="flex gap-2 mt-2 text-[10px] text-[#52525B] font-mono">
                      <span>Extraterritorial: {law.extraterritorialReach ? 'Yes' : 'No'}</span>
                      <span>•</span>
                      <span>Cloud Scope: {law.appliesToCloudProviders ? 'Direct' : 'Indirect'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* EDPB 02/2020 Essential Guarantees Scorecard */}
            <div className="mt-4 pt-4 border-t border-[#262626]">
              <h4 className="text-[10px] font-mono uppercase text-emerald-400 tracking-widest mb-2 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-400" />
                EDPB Recommendations 02/2020: Essential Guarantees Scorecard
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    code: 'Guarantee A',
                    title: 'Clear & Precise Rules',
                    met: jurisdiction.guarantees.clearPreciseRules,
                    notes: jurisdiction.guarantees.clearPreciseRulesNotes,
                  },
                  {
                    code: 'Guarantee B',
                    title: 'Proportionality & Necessity',
                    met: jurisdiction.guarantees.necessaryAndProportionate,
                    notes: jurisdiction.guarantees.necessaryAndProportionateNotes,
                  },
                  {
                    code: 'Guarantee C',
                    title: 'Independent Oversight',
                    met: jurisdiction.guarantees.independentOversight,
                    notes: jurisdiction.guarantees.independentOversightNotes,
                  },
                  {
                    code: 'Guarantee D',
                    title: 'Judicial Redress',
                    met: jurisdiction.guarantees.effectiveRedressForForeigners,
                    notes: jurisdiction.guarantees.effectiveRedressNotes,
                  },
                ].map((g, idx) => (
                  <div key={idx} className={`p-3 rounded border text-xs font-mono ${g.met ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-rose-950/20 border-rose-800/40'}`}>
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-[#D1D5DB]">{g.code}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${g.met ? 'bg-emerald-950 text-emerald-400 border border-emerald-600' : 'bg-rose-950 text-rose-400 border border-rose-600'}`}>
                        {g.met ? 'SATISFIED' : 'DEFICIT'}
                      </span>
                    </div>
                    <div className="font-semibold text-white mt-1">{g.title}</div>
                    <div className="text-[11px] text-[#71717A] mt-1 line-clamp-3 font-sans" title={g.notes}>
                      {g.notes}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#71717A] font-mono">Jurisdiction profile not loaded.</p>
        )}
      </section>

      {/* SECTION 4: Remediation Matrix (Three Pillars) */}
      <section className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#262626] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#1A1A1B] text-emerald-400 border border-[#262626] flex items-center justify-center font-mono text-xs font-bold">
              04
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                Remediation Matrix: Three-Pillar Supplementary Measures
              </h2>
              <p className="text-[11px] text-[#71717A] font-mono">
                EDPB Recommendations 01/2020 Annex 2 & CNIL TIA Methodology
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('threepillars')}
            className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            Customize Controls <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[#262626] rounded overflow-hidden">
            <thead className="bg-[#080809] text-[#71717A] font-mono text-[10px] uppercase tracking-wider border-b border-[#262626]">
              <tr>
                <th className="py-2.5 px-3 w-28">Pillar</th>
                <th className="py-2.5 px-3 w-56">Supplementary Control</th>
                <th className="py-2.5 px-3">Implementation Detail</th>
                <th className="py-2.5 px-3 w-36">EDPB Ref</th>
                <th className="py-2.5 px-3 w-24 text-center">Residual Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F21] text-[#D1D5DB]">
              {evaluation.remediationMatrix.map((item) => (
                <tr key={item.id} className="hover:bg-[#151516] transition-colors">
                  <td className="py-2.5 px-3 font-mono">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                      item.pillar === 'Technical' ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800' :
                      item.pillar === 'Organizational' ? 'bg-purple-950/80 text-purple-400 border border-purple-800' :
                      'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                    }`}>
                      {item.pillar}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium text-white">
                    {item.controlName}
                  </td>
                  <td className="py-2.5 px-3 leading-relaxed text-xs text-[#A1A1AA] font-sans">
                    {item.implementationDetail}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-[#71717A]">
                    {item.edpbReference}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                      item.residualRisk === 'Low' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      item.residualRisk === 'Medium' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {item.residualRisk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 5: PRA SS2/21 Operational Resilience Checklist */}
      <section className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#262626] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#1A1A1B] text-emerald-400 border border-[#262626] flex items-center justify-center font-mono text-xs font-bold">
              05
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                PRA SS2/21 Operational Resilience & Governance
              </h2>
              <p className="text-[11px] text-[#71717A] font-mono">
                Prudential Outsourcing Compliance (Chapters 4, 6, 7, 8, 9 & 10)
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('prudential')}
            className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            View MTP Register <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {evaluation.praChecklist.map((item) => (
            <div key={item.id} className="p-3.5 rounded border border-[#262626] bg-[#141415] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] uppercase font-bold text-emerald-400 font-mono">{item.ruleReference}</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    item.complianceStatus === 'Compliant' ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' :
                    'bg-amber-950 text-amber-400 border border-amber-700'
                  }`}>
                    {item.complianceStatus}
                  </span>
                </div>
                <h4 className="text-xs font-mono font-bold text-white mb-1">{item.category}: {item.requirementDescription}</h4>
                <p className="text-xs text-[#A1A1AA] mt-1.5 leading-relaxed font-sans">{item.evidenceOrRemediation}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: Automated Generated Artifact (Data Sovereignty Policy) */}
      <section className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#262626] pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#1A1A1B] text-emerald-400 border border-[#262626] flex items-center justify-center font-mono text-xs font-bold">
              06
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                Automated Policy Dossier: Data Sovereignty & Transfer Framework
              </h2>
              <p className="text-[11px] text-[#71717A] font-mono">
                Production-grade compliance policy generated per PRA SS2/21 and GDPR Post-Schrems II
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPolicy}
              className="px-3 py-1.5 text-xs font-mono text-[#D1D5DB] bg-[#1A1A1B] hover:bg-[#262626] hover:text-white rounded border border-[#262626] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-[#71717A]" />
              {copied ? 'COPIED_TO_CLIPBOARD' : 'COPY_MARKDOWN'}
            </button>
            <button
              onClick={() => onNavigateTab('policy')}
              className="px-3 py-1.5 text-xs font-mono font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors flex items-center gap-1.5 shadow-[0_0_8px_rgba(16,185,129,0.2)] cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              POLICY_STUDIO &gt;
            </button>
          </div>
        </div>

        {/* Formatted Policy Document Preview */}
        <div className="bg-[#080809] text-[#D1D5DB] p-4 rounded font-mono text-xs max-h-96 overflow-y-auto leading-relaxed border border-[#262626] shadow-inner">
          <pre className="whitespace-pre-wrap font-mono text-[#A1A1AA]">{evaluation.generatedPolicyDocument}</pre>
        </div>
      </section>

      {/* 3-Pillar PDF Export Modal */}
      <ThreePillarPdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        profile={profile}
        evaluation={evaluation}
        initialPillar={pdfModalPillar}
      />
    </div>
  );
};
