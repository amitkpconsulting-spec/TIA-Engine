import React, { useState, useRef } from 'react';
import { 
  Download, 
  Printer, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  KeyRound, 
  FileSignature, 
  Users, 
  ShieldCheck, 
  Clock, 
  Scale, 
  FileText, 
  Calendar, 
  Check, 
  Copy, 
  FileSpreadsheet, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Building,
  Loader2
} from 'lucide-react';
import { TransferProfile, TIAEvaluationResult } from '../types/tia';
import { generatePillarReportData, PillarType, PillarReportData } from '../utils/threePillarReports';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

interface ThreePillarPdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TransferProfile;
  evaluation: TIAEvaluationResult;
  initialPillar?: PillarType;
}

export const ThreePillarPdfReportModal: React.FC<ThreePillarPdfReportModalProps> = ({
  isOpen,
  onClose,
  profile,
  evaluation,
  initialPillar = 'Consolidated'
}) => {
  const [selectedPillar, setSelectedPillar] = useState<PillarType>(initialPillar);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfGenerationStatus, setPdfGenerationStatus] = useState<string>('');
  const [copiedNotification, setCopiedNotification] = useState(false);
  
  const reportRef = useRef<HTMLDivElement>(null);

  // Sync initial pillar when opened
  React.useEffect(() => {
    if (initialPillar) {
      setSelectedPillar(initialPillar);
    }
  }, [initialPillar]);

  if (!isOpen) return null;

  const reportData: PillarReportData = generatePillarReportData(selectedPillar, profile, evaluation);

  // PDF Export via jsPDF & html2canvas
  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPdf(true);
    setPdfGenerationStatus('Capturing high-resolution report canvas...');

    try {
      const element = reportRef.current;
      
      // Temporary style adjustments for pristine PDF rendering
      const originalBg = element.style.backgroundColor;
      
      setPdfGenerationStatus('Rendering vector graphics & layout pages...');
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF', // Clean white background for official print/PDF
        windowWidth: 1200
      });

      setPdfGenerationStatus('Compiling multi-page PDF document...');
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // First Page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      // Subsequent Pages if long
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      const fileName = `TIA_${selectedPillar}_Report_${profile.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      setPdfGenerationStatus('PDF successfully downloaded!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setPdfGenerationStatus('Direct PDF compilation unavailable. Opening print view...');
      setTimeout(() => {
        window.print();
      }, 300);
    } finally {
      setTimeout(() => {
        setIsGeneratingPdf(false);
        setPdfGenerationStatus('');
      }, 1500);
    }
  };

  // Browser Print / Save as PDF
  const handlePrint = () => {
    window.print();
  };

  // Copy Markdown / Text Report
  const handleCopyTextReport = () => {
    const textContent = `
================================================================================
${reportData.title.toUpperCase()}
${reportData.subtitle}
Dossier ID: ${reportData.dossierId} | Date: ${reportData.generatedDate}
================================================================================

1. ASSESSMENT & REGULATORY SCOPE
--------------------------------------------------------------------------------
- Exporter: ${profile.exporterName} (${profile.exporterCountry})
- Importer: ${profile.importerName} (${profile.importerCountry})
- Transfer Mechanism: ${profile.transferMechanism.replace(/_/g, ' ').toUpperCase()}
- Key Custody: ${profile.keyManagement.replace(/_/g, ' ').toUpperCase()}
- PRA SS2/21 Scope: ${reportData.assessment.praMateriality}
- Baseline Verdict: ${reportData.assessment.baselineVerdict}
- Evaluation Summary: ${reportData.assessment.executiveSummary}

2. IDENTIFIED GAPS & SURVEILLANCE DEFICITS (${reportData.gaps.length} GAPS)
--------------------------------------------------------------------------------
${reportData.gaps.map((g, idx) => `
[GAP ${idx + 1}] ${g.title} [SEVERITY: ${g.severity.toUpperCase()}]
- Rule Citation: ${g.ruleReference}
- Inherent Deficit: ${g.inherentDeficit}
- Surveillance Exposure: ${g.surveillanceExposure}
- Regulatory Impact: ${g.regulatoryImpact}
- Proposed Mitigation: ${g.remediationLink}
`).join('\n')}

3. SUPPLEMENTARY REMEDIATION MEASURES (${reportData.remediationMeasures.length} CONTROLS)
--------------------------------------------------------------------------------
${reportData.remediationMeasures.map((m, idx) => `
[CONTROL ${idx + 1}] ${m.controlName} (${m.pillar.toUpperCase()} PILLAR)
- Citation: ${m.edpbReference}
- Status: ${m.status.toUpperCase()} | Residual Risk: ${m.residualRisk.toUpperCase()}
- Description: ${m.description}
- Implementation Detail: ${m.implementationDetail}
- Assigned: ${m.assignedOwner} | Target: ${m.targetCompletionDate}
`).join('\n')}

4. TIMELINES & SLA ROADMAP
--------------------------------------------------------------------------------
${reportData.timelines.map((tl, idx) => `
- ${tl.milestonePhase}: ${tl.controlTitle}
  Owner: ${tl.assignedOwner} | Target Date: ${tl.targetCompletionDate} (SLA: ${tl.slaDaysRemaining}d)
  Verification Artifact: ${tl.verificationArtifact}
`).join('\n')}

5. DPO & REGULATORY REMARKS
--------------------------------------------------------------------------------
- DPO Statement: ${reportData.remarks.dpoStatement}
- Chief Risk Officer Statement: ${reportData.remarks.croStatement}
- Legal Counsel Notes: ${reportData.remarks.legalCounselNotes}
- Residual Risk Verdict: ${reportData.remarks.residualRiskVerdict}
- Statutory Evergreen Review: ${reportData.remarks.evergreenCadence}
- Verification Hash: ${reportData.remarks.cryptographicVerificationHash}
================================================================================
    `.trim();

    navigator.clipboard.writeText(textContent);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs font-mono text-[#D1D5DB]">
      <div className="bg-[#0F0F10] border border-[#262626] rounded-xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Top Action Bar */}
        <div className="p-4 border-b border-[#262626] bg-[#141415] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2">
                3-Pillar PDF Compliance Report Generator
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  PRINT & PDF READY
                </span>
              </h3>
              <p className="text-[11px] text-[#71717A]">
                Structured five-section regulatory report: Assessment, Gaps, Remediation, Timelines & Remarks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3.5 py-1.5 text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)] disabled:opacity-50"
              title="Download formatted .PDF document"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-bold text-[#D1D5DB] bg-[#1F1F21] hover:bg-[#2A2A2D] border border-[#333336] rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Open Browser Print Dialog / Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Print / Save</span>
            </button>

            <button
              onClick={handleCopyTextReport}
              className="px-3 py-1.5 text-xs font-bold text-[#D1D5DB] bg-[#1F1F21] hover:bg-[#2A2A2D] border border-[#333336] rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copy complete audit text to clipboard"
            >
              {copiedNotification ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#71717A]" />
                  <span className="hidden sm:inline">Copy Text</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#71717A] hover:text-white rounded hover:bg-[#262626] transition-colors ml-1 cursor-pointer"
              title="Close Report Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Scope Selector Navigation */}
        <div className="px-5 py-2.5 bg-[#080809] border-b border-[#262626] flex items-center justify-between overflow-x-auto no-scrollbar gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] text-[#71717A] uppercase font-bold mr-2">Report Scope:</span>
            
            {/* Consolidated Report Tab */}
            <button
              onClick={() => setSelectedPillar('Consolidated')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedPillar === 'Consolidated'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                  : 'bg-[#141415] text-[#71717A] hover:text-white border border-[#262626]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Consolidated (All 3 Pillars)</span>
            </button>

            {/* Pillar I: Technical Tab */}
            <button
              onClick={() => setSelectedPillar('Technical')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedPillar === 'Technical'
                  ? 'bg-blue-950 text-blue-300 border border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                  : 'bg-[#141415] text-[#71717A] hover:text-white border border-[#262626]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Pillar I: Technical</span>
            </button>

            {/* Pillar II: Legal Tab */}
            <button
              onClick={() => setSelectedPillar('Legal')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedPillar === 'Legal'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                  : 'bg-[#141415] text-[#71717A] hover:text-white border border-[#262626]'
              }`}
            >
              <FileSignature className="w-3.5 h-3.5" />
              <span>Pillar II: Legal</span>
            </button>

            {/* Pillar III: Organizational Tab */}
            <button
              onClick={() => setSelectedPillar('Organizational')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedPillar === 'Organizational'
                  ? 'bg-purple-950 text-purple-300 border border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                  : 'bg-[#141415] text-[#71717A] hover:text-white border border-[#262626]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Pillar III: Organizational</span>
            </button>
          </div>

          {pdfGenerationStatus && (
            <span className="text-[11px] text-emerald-400 animate-pulse font-mono">
              {pdfGenerationStatus}
            </span>
          )}
        </div>

        {/* Scrollable Printable Report Canvas Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#050506]">
          
          {/* Printable Report Document Card (Target for html2canvas & Print) */}
          <div 
            ref={reportRef}
            className="max-w-4xl mx-auto bg-white text-[#18181B] rounded-lg shadow-xl p-8 sm:p-12 space-y-8 font-sans print:p-0 print:shadow-none print:max-w-none"
            style={{ color: '#18181B' }}
          >
            
            {/* Document Header & Watermark Badge */}
            <div className="border-b-2 border-slate-900 pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="bg-slate-900 text-emerald-400 font-mono text-[11px] font-bold px-2.5 py-1 rounded">
                    DOSSIER ID: {reportData.dossierId}
                  </span>
                  <span className="bg-cyan-950 text-cyan-300 font-mono text-[11px] font-bold px-2.5 py-1 rounded border border-cyan-800">
                    CANONICAL REF: {evaluation.tiaReferenceId || profile.tiaReferenceId || 'TIA-2026'}
                  </span>
                  <span className="text-xs font-bold text-slate-500 font-mono">
                    CLASSIFICATION: STRICTLY CONFIDENTIAL // AUDIT DOCUMENT
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 font-serif">
                  {reportData.title}
                </h1>
                <p className="text-xs text-slate-600 font-mono mt-1">
                  {reportData.subtitle}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-1">
                  <span>UUID: <strong className="text-slate-800">{evaluation.universalUniqueIdentifier || profile.universalUniqueIdentifier || 'N/A'}</strong></span>
                  <span>•</span>
                  <span>URN: <strong className="text-indigo-800">{evaluation.crossFrameworkUrn || profile.crossFrameworkUrn || 'N/A'}</strong></span>
                </div>
              </div>

              <div className="text-right border-l-2 md:border-l border-slate-200 pl-4">
                <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Assessment Date</div>
                <div className="text-xs font-bold font-mono text-slate-800">{reportData.generatedDate}</div>
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  {reportData.assessment.baselineVerdict.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Profile Overview Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded border border-slate-200 text-xs font-mono">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Data Exporter</span>
                <span className="font-bold text-slate-900 block truncate">{profile.exporterName}</span>
                <span className="text-[10px] text-slate-500">{profile.exporterCountry} (EEA/UK)</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Data Importer</span>
                <span className="font-bold text-slate-900 block truncate">{profile.importerName}</span>
                <span className="text-[10px] text-slate-500">{reportData.assessment.importerJurisdiction}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Transfer Mechanism</span>
                <span className="font-bold text-slate-900 block truncate">{profile.transferMechanism.replace(/_/g, ' ').toUpperCase()}</span>
                <span className="text-[10px] text-slate-500">Adequacy: {reportData.assessment.adequacyStatus}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Key Custody</span>
                <span className="font-bold text-emerald-700 block truncate">{reportData.assessment.keyManagementModel}</span>
                <span className="text-[10px] text-slate-500">PRA Scope: {profile.isMaterialOutsourcing ? 'CIF / Material' : 'Standard'}</span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SECTION 1: ASSESSMENT */}
            {/* ========================================================================= */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-300 pb-2">
                <span className="w-6 h-6 rounded bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">1</span>
                <h2 className="text-base font-bold text-slate-950 uppercase tracking-tight font-serif">
                  Assessment & Statutory Scope
                </h2>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {reportData.assessment.executiveSummary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
                  <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-900 font-mono">
                    Statutory & Regulatory Benchmark Frameworks:
                  </h4>
                  <ul className="space-y-1 text-slate-600 font-mono text-[11px]">
                    {reportData.assessment.statutoryScope.map((scope, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{scope}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
                  <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-900 font-mono">
                    Personal Data Categories Evaluated:
                  </h4>
                  <ul className="space-y-1 text-slate-600 font-mono text-[11px]">
                    {reportData.assessment.dataCategoriesInScope.map((cat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{cat}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-slate-200 mt-2 text-[10px] text-slate-500 font-mono">
                    SURVEILLANCE RISK LEVEL: <strong className="text-slate-900">{reportData.assessment.surveillanceRiskLevel.toUpperCase()}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SECTION 2: GAPS ANALYSIS */}
            {/* ========================================================================= */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">2</span>
                  <h2 className="text-base font-bold text-slate-950 uppercase tracking-tight font-serif">
                    Identified Compliance & Surveillance Gaps
                  </h2>
                </div>
                <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
                  {reportData.gaps.length} GAPS AUDITED
                </span>
              </div>

              <p className="text-xs text-slate-600">
                Systematic gap analysis contrasting the baseline transfer profile against the European Essential Guarantees (EDPB 02/2020) and PRA SS2/21 resilience criteria:
              </p>

              <div className="space-y-3">
                {reportData.gaps.map((gap, index) => (
                  <div key={gap.id} className="p-4 rounded border border-slate-200 bg-slate-50/70 text-xs space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-500">GAP #{index + 1}</span>
                        <h4 className="font-bold text-slate-900 font-serif">{gap.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-[10px] text-slate-500">{gap.pillar.toUpperCase()} PILLAR</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          gap.severity === 'Critical' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                          gap.severity === 'High' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                          {gap.severity.toUpperCase()} SEVERITY
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] pt-1">
                      <div>
                        <span className="font-mono text-[10px] text-slate-400 uppercase block font-bold">Rule Citation:</span>
                        <span className="font-mono text-slate-800 block">{gap.ruleReference}</span>
                        
                        <span className="font-mono text-[10px] text-slate-400 uppercase block font-bold mt-2">Inherent Deficit:</span>
                        <p className="text-slate-700 leading-snug">{gap.inherentDeficit}</p>
                      </div>

                      <div>
                        <span className="font-mono text-[10px] text-slate-400 uppercase block font-bold">Surveillance Exposure:</span>
                        <p className="text-slate-700 leading-snug">{gap.surveillanceExposure}</p>

                        <span className="font-mono text-[10px] text-slate-400 uppercase block font-bold mt-2">Required Remediation:</span>
                        <span className="font-bold text-emerald-800 block">{gap.remediationLink}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SECTION 3: REMEDIATION */}
            {/* ========================================================================= */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">3</span>
                  <h2 className="text-base font-bold text-slate-950 uppercase tracking-tight font-serif">
                    Supplementary Remediation Measures
                  </h2>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  {reportData.remediationMeasures.length} CONTROLS ENFORCED
                </span>
              </div>

              <p className="text-xs text-slate-600">
                {reportData.remediationArchitecture}
              </p>

              <div className="overflow-x-auto border border-slate-200 rounded">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold border-b border-slate-200">
                      <th className="p-2.5">Pillar / Control Name</th>
                      <th className="p-2.5">Citation</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Residual Risk</th>
                      <th className="p-2.5">Target SLA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reportData.remediationMeasures.map((measure) => (
                      <tr key={measure.id} className="hover:bg-slate-50">
                        <td className="p-2.5">
                          <span className="font-bold text-slate-900 block">{measure.controlName}</span>
                          <span className="text-[10px] text-slate-500 font-sans">{measure.description}</span>
                        </td>
                        <td className="p-2.5 text-[10px] text-slate-600">{measure.edpbReference}</td>
                        <td className="p-2.5">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                            measure.status === 'implemented' ? 'bg-emerald-100 text-emerald-800' :
                            measure.status === 'recommended' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {measure.status === 'implemented' ? 'IMPLEMENTED' : measure.status === 'recommended' ? 'PENDING' : 'WAIVED'}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                            measure.residualRisk === 'Low' ? 'bg-emerald-50 text-emerald-700' :
                            measure.residualRisk === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {measure.residualRisk.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-2.5 text-[10px] text-slate-700 font-bold">{measure.targetCompletionDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SECTION 4: TIMELINES */}
            {/* ========================================================================= */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-300 pb-2">
                <span className="w-6 h-6 rounded bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">4</span>
                <h2 className="text-base font-bold text-slate-950 uppercase tracking-tight font-serif">
                  Implementation Timelines & SLA Roadmap
                </h2>
              </div>

              <p className="text-xs text-slate-600">
                {reportData.implementationRoadmapSummary}
              </p>

              <div className="space-y-3 font-mono text-xs">
                {reportData.timelines.map((tl, index) => (
                  <div key={tl.id} className="p-3.5 bg-slate-50 rounded border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                          {tl.milestonePhase}
                        </span>
                        <span className="font-bold text-slate-900 font-sans">{tl.controlTitle}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        OWNER: <strong className="text-slate-800">{tl.assignedOwner}</strong> • ARTIFACT: <span className="text-slate-700 italic">{tl.verificationArtifact}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-slate-400 uppercase">Target Date</div>
                      <div className="text-xs font-bold text-slate-900">{tl.targetCompletionDate}</div>
                      <span className="text-[9px] text-emerald-700 font-bold">{tl.slaDaysRemaining}d remaining</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SECTION 5: REMARKS & SIGN-OFF */}
            {/* ========================================================================= */}
            <div className="space-y-4 pt-4 border-t-2 border-slate-900">
              <div className="flex items-center gap-2 border-b border-slate-300 pb-2">
                <span className="w-6 h-6 rounded bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">5</span>
                <h2 className="text-base font-bold text-slate-950 uppercase tracking-tight font-serif">
                  DPO, Risk & Regulatory Remarks
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
                  <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-900 font-mono flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Data Protection Officer (DPO) Formal Statement:
                  </h4>
                  <p className="text-slate-700 leading-relaxed italic text-[11px]">
                    "{reportData.remarks.dpoStatement}"
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
                  <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-900 font-mono flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-blue-600" />
                    Chief Risk Officer (CRO) / PRA SS2/21 Statement:
                  </h4>
                  <p className="text-slate-700 leading-relaxed italic text-[11px]">
                    "{reportData.remarks.croStatement}"
                  </p>
                </div>
              </div>

              {/* Conditional Prerequisites */}
              <div className="bg-amber-50 p-4 rounded border border-amber-200 text-xs space-y-2">
                <h4 className="font-bold text-[11px] uppercase tracking-wider text-amber-900 font-mono flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  Mandatory Pre-Conditions for Production Data Flow:
                </h4>
                <ul className="space-y-1 text-amber-900 text-[11px] font-mono">
                  {reportData.remarks.conditionalPrerequisites.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="font-bold text-amber-700">[{idx + 1}]</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Official Sign-off Seal & Hash */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-[10px] text-slate-500">
                <div>
                  <div>STATUTORY AUDIT CADENCE: <strong className="text-slate-800">{reportData.remarks.evergreenCadence}</strong></div>
                  <div className="mt-1">CRYPTOGRAPHIC VERIFICATION SEAL: <strong className="text-slate-900">{reportData.remarks.cryptographicVerificationHash}</strong></div>
                </div>

                <div className="border border-slate-300 p-2 rounded bg-slate-50 text-right shrink-0">
                  <div className="font-bold text-slate-800">AUTHORIZED EXECUTIVE ATTESTATION</div>
                  <div className="text-[9px] text-emerald-700 font-bold">DIGITALLY SEALED BY PRA & DPO ENGINE</div>
                </div>
              </div>

              {/* Proprietary License & Contact Notice */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[9px] font-mono text-slate-400">
                <div>LICENSE: <span className="font-bold text-slate-600">PROPRIETARY</span> • ALL RIGHTS RESERVED</div>
                <div>CONTACT & SUPPORT: <a href="https://www.technoscope.co.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold underline">www.technoscope.co.in</a></div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
