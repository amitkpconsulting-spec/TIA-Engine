import React, { useState } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  FileSignature, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  ChevronRight,
  ExternalLink,
  Lock,
  Layers,
  Download,
  Printer,
  FileText,
  Clock,
  Scale,
  Calendar,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { SupplementaryMeasure, TransferProfile, TIAEvaluationResult } from '../types/tia';
import { ThreePillarPdfReportModal } from './ThreePillarPdfReportModal';
import { generatePillarReportData, PillarType } from '../utils/threePillarReports';

interface ThreePillarMatrixViewProps {
  evaluation: TIAEvaluationResult;
  profile: TransferProfile;
}

export const ThreePillarMatrixView: React.FC<ThreePillarMatrixViewProps> = ({
  evaluation,
  profile
}) => {
  const [activePillar, setActivePillar] = useState<'All' | 'Technical' | 'Organizational' | 'Legal'>('All');
  const [activeSection, setActiveSection] = useState<'all' | 'assessment' | 'gaps' | 'remediation' | 'timelines' | 'remarks'>('all');
  
  // PDF Export Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [exportModalPillar, setExportModalPillar] = useState<PillarType>('Consolidated');

  const handleOpenPdfExport = (pillar: PillarType) => {
    setExportModalPillar(pillar);
    setIsPdfModalOpen(true);
  };

  // Convert active pillar to PillarType for data retrieval
  const currentPillarType: PillarType = activePillar === 'All' ? 'Consolidated' : activePillar;
  const pillarReport = generatePillarReportData(currentPillarType, profile, evaluation);

  const filteredMeasures = evaluation.remediationMatrix.filter(
    m => activePillar === 'All' || m.pillar === activePillar
  );

  return (
    <div className="space-y-6 w-full mx-auto pb-12 font-mono">
      
      {/* ========================================================================= */}
      {/* TOP PDF EXPORT ACTION BAR & HEADER */}
      {/* ========================================================================= */}
      <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#262626] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                EDPB 01/2020 & PRA SS2/21
              </span>
              <span className="text-[#52525B]">•</span>
              <span className="text-xs text-[#71717A]">
                DOSSIER: {evaluation.evaluationId}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 uppercase">
              <Layers className="w-5 h-5 text-emerald-400" />
              Three-Pillar Supplementary Remediation Framework
            </h2>
            <p className="text-xs text-[#A1A1AA] mt-1 font-sans">
              Structured mitigation architecture implementing EDPB Recommendations 01/2020 (Annex 2) and CNIL TIA Step 4.
            </p>
          </div>

          {/* Export PDF Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenPdfExport('Consolidated')}
              className="px-3.5 py-2 rounded text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              title="Export Consolidated 3-Pillar PDF Report (Assessment, Gaps, Remediation, Timelines, Remarks)"
            >
              <Download className="w-4 h-4" />
              <span>Export Consolidated PDF</span>
            </button>

            <div className="flex items-center bg-[#141415] p-1 rounded border border-[#262626] gap-1">
              <button
                onClick={() => handleOpenPdfExport('Technical')}
                className="px-2.5 py-1 text-[11px] font-bold text-blue-400 hover:bg-[#1F1F21] rounded transition-colors flex items-center gap-1 cursor-pointer"
                title="Export Pillar I Technical PDF Report"
              >
                <KeyRound className="w-3 h-3" />
                <span>Pillar I PDF</span>
              </button>

              <button
                onClick={() => handleOpenPdfExport('Legal')}
                className="px-2.5 py-1 text-[11px] font-bold text-cyan-400 hover:bg-[#1F1F21] rounded transition-colors flex items-center gap-1 cursor-pointer"
                title="Export Pillar II Legal PDF Report"
              >
                <FileSignature className="w-3 h-3" />
                <span>Pillar II PDF</span>
              </button>

              <button
                onClick={() => handleOpenPdfExport('Organizational')}
                className="px-2.5 py-1 text-[11px] font-bold text-purple-400 hover:bg-[#1F1F21] rounded transition-colors flex items-center gap-1 cursor-pointer"
                title="Export Pillar III Organizational PDF Report"
              >
                <Users className="w-3 h-3" />
                <span>Pillar III PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Pillar Summary Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Pillar 1: Technical */}
          <div 
            onClick={() => setActivePillar(activePillar === 'Technical' ? 'All' : 'Technical')}
            className={`p-4 rounded border transition-all cursor-pointer flex flex-col justify-between ${
              activePillar === 'Technical' 
                ? 'border-blue-500 bg-[#0E1A2B] shadow-[0_0_12px_rgba(59,130,246,0.3)] ring-1 ring-blue-500' 
                : 'border-blue-900/60 bg-[#0D1520] hover:border-blue-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" /> Pillar I: Technical
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  {evaluation.scores.technicalProtectionScore}% PROTECTION
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA] leading-relaxed font-sans">
                On-soil BYOK/HYOK Local HSM key custody, client-side format-preserving tokenization, and Confidential Computing memory enclaves.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-blue-900/40 flex items-center justify-between text-[10px] text-blue-400 font-medium">
              <span>Primary FISA 702 / CLOUD Act Shield</span>
              <span className="text-white underline">View Details &rarr;</span>
            </div>
          </div>

          {/* Pillar 2: Legal */}
          <div 
            onClick={() => setActivePillar(activePillar === 'Legal' ? 'All' : 'Legal')}
            className={`p-4 rounded border transition-all cursor-pointer flex flex-col justify-between ${
              activePillar === 'Legal' 
                ? 'border-cyan-500 bg-[#0B1E24] shadow-[0_0_12px_rgba(6,182,212,0.3)] ring-1 ring-cyan-500' 
                : 'border-cyan-900/60 bg-[#0D201E] hover:border-cyan-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileSignature className="w-3.5 h-3.5" /> Pillar II: Legal
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {evaluation.scores.legalSafeguardsScore}% SAFEGUARDS
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA] leading-relaxed font-sans">
                Mandatory warrant stay-of-execution covenants, 24h rapid notification SLA, PRA S165A/S166 direct audit rights, and certified deletion.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-cyan-900/40 flex items-center justify-between text-[10px] text-cyan-400 font-medium">
              <span>Binding Contractual Addenda & SLAs</span>
              <span className="text-white underline">View Details &rarr;</span>
            </div>
          </div>

          {/* Pillar 3: Organizational */}
          <div 
            onClick={() => setActivePillar(activePillar === 'Organizational' ? 'All' : 'Organizational')}
            className={`p-4 rounded border transition-all cursor-pointer flex flex-col justify-between ${
              activePillar === 'Organizational' 
                ? 'border-purple-500 bg-[#1A0E2B] shadow-[0_0_12px_rgba(168,85,247,0.3)] ring-1 ring-purple-500' 
                : 'border-purple-900/60 bg-[#150D20] hover:border-purple-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Pillar III: Organizational
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  {evaluation.scores.praResilienceScore}% RESILIENCE
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA] leading-relaxed font-sans">
                Multi-party RBAC, 12-month tested stressed exit and BCP continuity playbooks, subprocessor authorization, and DPO escalation SOPs.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-purple-900/40 flex items-center justify-between text-[10px] text-purple-400 font-medium">
              <span>PRA SS2/21 Stressed Exit & Governance</span>
              <span className="text-white underline">View Details &rarr;</span>
            </div>
          </div>
        </div>

        {/* Pillar Filter Tabs & Report Section Sub-Navigator */}
        <div className="mt-6 pt-5 border-t border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#71717A] uppercase font-bold">Filter Pillar:</span>
            <div className="flex items-center bg-[#080809] p-1 rounded border border-[#262626]">
              {(['All', 'Technical', 'Organizational', 'Legal'] as const).map((pillar) => (
                <button
                  key={pillar}
                  onClick={() => setActivePillar(pillar)}
                  className={`px-3 py-1 rounded text-xs transition-all cursor-pointer ${
                    activePillar === pillar
                      ? 'bg-[#1F1F21] text-emerald-400 font-bold border border-emerald-500/40 shadow-xs'
                      : 'text-[#71717A] hover:text-[#D1D5DB]'
                  }`}
                >
                  {pillar}
                </button>
              ))}
            </div>
          </div>

          {/* 5-Section Quick Filter */}
          <div className="flex items-center gap-1.5 bg-[#080809] p-1 rounded border border-[#262626] overflow-x-auto no-scrollbar">
            <span className="text-[9px] text-[#71717A] uppercase font-bold px-1 hidden md:inline">Jump to:</span>
            {(['all', 'assessment', 'gaps', 'remediation', 'timelines', 'remarks'] as const).map((sec) => (
              <button
                key={sec}
                onClick={() => setActiveSection(sec)}
                className={`px-2.5 py-0.5 rounded text-[11px] uppercase font-bold transition-colors cursor-pointer ${
                  activeSection === sec
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'text-[#71717A] hover:text-white'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: ASSESSMENT */}
      {/* ========================================================================= */}
      {(activeSection === 'all' || activeSection === 'assessment') && (
        <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#262626] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-emerald-950 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-800">1</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                Assessment & Statutory Transfer Baseline
              </h3>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800">
              {pillarReport.assessment.baselineVerdict.toUpperCase()}
            </span>
          </div>

          <p className="text-xs text-[#A1A1AA] leading-relaxed font-sans">
            {pillarReport.assessment.executiveSummary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-[#141415] p-3.5 rounded border border-[#262626]">
              <span className="text-[10px] text-[#71717A] uppercase block mb-1">Target Jurisdiction & Adequacy</span>
              <span className="font-bold text-white block">{pillarReport.assessment.importerJurisdiction}</span>
              <span className="text-[10px] text-[#A1A1AA] mt-1 block">Status: {pillarReport.assessment.adequacyStatus}</span>
            </div>

            <div className="bg-[#141415] p-3.5 rounded border border-[#262626]">
              <span className="text-[10px] text-[#71717A] uppercase block mb-1">PRA Materiality Classification</span>
              <span className="font-bold text-amber-400 block">{pillarReport.assessment.praMateriality}</span>
              <span className="text-[10px] text-[#A1A1AA] mt-1 block">Impact Tolerance: {profile.impactToleranceHours}h</span>
            </div>

            <div className="bg-[#141415] p-3.5 rounded border border-[#262626]">
              <span className="text-[10px] text-[#71717A] uppercase block mb-1">Key Custody Architecture</span>
              <span className="font-bold text-emerald-400 block">{pillarReport.assessment.keyManagementModel}</span>
              <span className="text-[10px] text-[#A1A1AA] mt-1 block">Pseudonymization: {profile.pseudonymizationPriorToTransfer ? 'Active (Pre-export)' : 'Inactive'}</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: GAPS ANALYSIS */}
      {/* ========================================================================= */}
      {(activeSection === 'all' || activeSection === 'gaps') && (
        <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#262626] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-rose-950 text-rose-400 text-xs font-bold flex items-center justify-center border border-rose-800">2</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Identified Compliance & Surveillance Gaps ({pillarReport.gaps.length})
              </h3>
            </div>
            <span className="text-[10px] text-rose-400 bg-rose-950/60 px-2.5 py-0.5 rounded border border-rose-800">
              GAP ANALYSIS MATRIX
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {pillarReport.gaps.map((gap, idx) => (
              <div key={gap.id} className="bg-[#141415] p-4 rounded border border-[#262626] space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#262626] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#1F1F21] text-[#A1A1AA]">
                      GAP #{idx + 1}
                    </span>
                    <h4 className="font-bold text-xs text-white">{gap.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#71717A]">{gap.pillar.toUpperCase()} PILLAR</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      gap.severity === 'Critical' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                      gap.severity === 'High' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-blue-950 text-blue-400 border border-blue-800'
                    }`}>
                      {gap.severity.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-[#71717A] uppercase block">Rule Citation:</span>
                    <span className="text-emerald-400 text-[11px]">{gap.ruleReference}</span>
                    <span className="text-[10px] text-[#71717A] uppercase block mt-2">Inherent Deficit:</span>
                    <p className="text-[#A1A1AA] font-sans text-xs">{gap.inherentDeficit}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#71717A] uppercase block">Surveillance Exposure:</span>
                    <p className="text-[#A1A1AA] font-sans text-xs">{gap.surveillanceExposure}</p>
                    <span className="text-[10px] text-[#71717A] uppercase block mt-2">Mandated Remediation:</span>
                    <span className="text-white font-semibold text-xs">{gap.remediationLink}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: REMEDIATION */}
      {/* ========================================================================= */}
      {(activeSection === 'all' || activeSection === 'remediation') && (
        <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#262626] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-blue-950 text-blue-400 text-xs font-bold flex items-center justify-center border border-blue-800">3</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                Supplementary Remediation Controls Matrix ({filteredMeasures.length})
              </h3>
            </div>
            <span className="text-[10px] text-blue-400 bg-blue-950/60 px-2.5 py-0.5 rounded border border-blue-800">
              SUPPLEMENTARY BLUEPRINT
            </span>
          </div>

          <div className="space-y-3">
            {filteredMeasures.map((measure) => (
              <div key={measure.id} className="bg-[#141415] rounded border border-[#262626] p-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#262626] pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      measure.pillar === 'Technical' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                      measure.pillar === 'Organizational' ? 'bg-purple-950 text-purple-400 border border-purple-800' :
                      'bg-cyan-950 text-cyan-400 border border-cyan-800'
                    }`}>
                      {measure.pillar.toUpperCase()}
                    </span>
                    <h4 className="font-bold text-xs text-white">{measure.controlName}</h4>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#71717A]">RESIDUAL:</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      measure.residualRisk === 'Low' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      measure.residualRisk === 'Medium' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {measure.residualRisk.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-[#71717A] uppercase block">Control Description:</span>
                    <p className="text-[#A1A1AA] font-sans leading-relaxed">{measure.description}</p>
                    <div className="mt-2 text-[10px] text-[#71717A]">
                      CITATION: <strong className="text-emerald-400">{measure.edpbReference}</strong>
                    </div>
                  </div>

                  <div className="bg-[#080809] p-3 rounded border border-[#262626]">
                    <span className="text-[10px] text-[#71717A] uppercase block">Operational Architecture:</span>
                    <p className="text-[#D1D5DB] font-sans text-xs leading-relaxed">{measure.implementationDetail}</p>
                    <div className="mt-2 pt-2 border-t border-[#262626] flex items-center justify-between text-[10px] text-[#71717A]">
                      <span>OWNER: <strong className="text-white">{measure.assignedOwner}</strong></span>
                      <span>TARGET SLA: <strong className="text-emerald-400">{measure.targetCompletionDate}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: TIMELINES */}
      {/* ========================================================================= */}
      {(activeSection === 'all' || activeSection === 'timelines') && (
        <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#262626] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-purple-950 text-purple-400 text-xs font-bold flex items-center justify-center border border-purple-800">4</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                Implementation Timelines & SLA Roadmap
              </h3>
            </div>
            <span className="text-[10px] text-purple-400 bg-purple-950/60 px-2.5 py-0.5 rounded border border-purple-800">
              PHASED ROLLOUT
            </span>
          </div>

          <div className="space-y-3">
            {pillarReport.timelines.map((tl) => (
              <div key={tl.id} className="bg-[#141415] p-3.5 rounded border border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1F1F21] text-emerald-400 border border-[#333336]">
                      {tl.milestonePhase}
                    </span>
                    <span className="font-bold text-white">{tl.controlTitle}</span>
                  </div>
                  <div className="text-[10px] text-[#71717A] mt-1">
                    OWNER: <strong className="text-[#D1D5DB]">{tl.assignedOwner}</strong> • ARTIFACT: <span className="text-white italic">{tl.verificationArtifact}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] text-[#71717A] uppercase">Target Date</div>
                  <div className="text-xs font-bold text-white">{tl.targetCompletionDate}</div>
                  <span className="text-[10px] text-emerald-400 font-bold">{tl.slaDaysRemaining}d remaining</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: REMARKS */}
      {/* ========================================================================= */}
      {(activeSection === 'all' || activeSection === 'remarks') && (
        <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#262626] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-emerald-950 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-800">5</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                DPO, Risk & Regulatory Remarks
              </h3>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800">
              AUDIT SIGN-OFF
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#141415] p-4 rounded border border-[#262626] space-y-2">
              <span className="text-[10px] text-emerald-400 font-bold uppercase block flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Data Protection Officer (DPO) Statement:
              </span>
              <p className="text-[#A1A1AA] font-sans leading-relaxed italic text-xs">
                "{pillarReport.remarks.dpoStatement}"
              </p>
            </div>

            <div className="bg-[#141415] p-4 rounded border border-[#262626] space-y-2">
              <span className="text-[10px] text-blue-400 font-bold uppercase block flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                Chief Risk Officer / PRA SS2/21 Statement:
              </span>
              <p className="text-[#A1A1AA] font-sans leading-relaxed italic text-xs">
                "{pillarReport.remarks.croStatement}"
              </p>
            </div>
          </div>

          {/* Conditional Prerequisites */}
          <div className="bg-[#1A1208] p-4 rounded border border-amber-900/60 text-xs space-y-2">
            <span className="text-[10px] text-amber-400 font-bold uppercase block flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Mandatory Pre-Conditions for Production Transfer Authorization:
            </span>
            <ul className="space-y-1 text-amber-200/90 text-xs font-sans">
              {pillarReport.remarks.conditionalPrerequisites.map((req, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="font-bold text-amber-400 font-mono">[{idx + 1}]</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Digital Signature & Seal Bar */}
          <div className="pt-3 border-t border-[#262626] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px] text-[#71717A]">
            <div>
              <span>EVERGREEN CADENCE: <strong className="text-white">{pillarReport.remarks.evergreenCadence}</strong></span>
              <div className="mt-0.5 font-mono text-[9px] text-[#A1A1AA]">
                SEAL: {pillarReport.remarks.cryptographicVerificationHash}
              </div>
            </div>

            <button
              onClick={() => handleOpenPdfExport(currentPillarType)}
              className="px-3 py-1 text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 rounded transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export {currentPillarType} PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DEDICATED PDF REPORT MODAL */}
      {/* ========================================================================= */}
      <ThreePillarPdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        profile={profile}
        evaluation={evaluation}
        initialPillar={exportModalPillar}
      />
    </div>
  );
};
