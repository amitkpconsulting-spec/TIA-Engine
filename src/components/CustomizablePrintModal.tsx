import React, { useState, useRef, useEffect } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Check, 
  Copy, 
  Sliders, 
  Layers, 
  KeyRound, 
  FileSignature, 
  Users, 
  Scale, 
  Calendar, 
  Lock, 
  Eye, 
  Loader2, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Home,
  Filter,
  FileCode,
  CheckSquare,
  Square
} from 'lucide-react';
import { TransferProfile, TIAEvaluationResult } from '../types/tia';
import { generatePillarReportData, PillarReportData } from '../utils/threePillarReports';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CustomizablePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoHome?: () => void;
  profile: TransferProfile;
  evaluation: TIAEvaluationResult;
}

export type PrintPreset = 'full' | 'assessment_only' | 'gaps_only' | 'remediations_only' | 'executive_summary';

export const CustomizablePrintModal: React.FC<CustomizablePrintModalProps> = ({
  isOpen,
  onClose,
  onGoHome,
  profile,
  evaluation
}) => {
  // Customization Toggles
  const [includeAssessment, setIncludeAssessment] = useState<boolean>(true);
  const [includeGaps, setIncludeGaps] = useState<boolean>(true);
  const [includeRemediations, setIncludeRemediations] = useState<boolean>(true);
  const [includeLineage, setIncludeLineage] = useState<boolean>(true);
  const [includeSignoff, setIncludeSignoff] = useState<boolean>(true);
  
  // Display & formatting options
  const [classification, setClassification] = useState<string>('STRICTLY CONFIDENTIAL // PRA SS2/21 AUDIT GRADE');
  const [customReportTitle, setCustomReportTitle] = useState<string>(
    `Transfer Impact Assessment Dossier — ${profile.title}`
  );
  const [inspectorName, setInspectorName] = useState<string>('DPO & Lead Risk Assessor');
  const [fontSizeScale, setFontSizeScale] = useState<'compact' | 'standard' | 'spacious'>('standard');
  const [activePreset, setActivePreset] = useState<PrintPreset>('full');

  // Export states
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<string>('');
  const [copiedText, setCopiedText] = useState(false);

  const printableRef = useRef<HTMLDivElement>(null);

  // Keyboard Escape key handler to easily dismiss modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        if (onGoHome) onGoHome();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onGoHome]);

  if (!isOpen) return null;

  const reportData: PillarReportData = generatePillarReportData('Consolidated', profile, evaluation);

  // Apply quick presets
  const handleApplyPreset = (preset: PrintPreset) => {
    setActivePreset(preset);
    switch (preset) {
      case 'full':
        setIncludeAssessment(true);
        setIncludeGaps(true);
        setIncludeRemediations(true);
        setIncludeLineage(true);
        setIncludeSignoff(true);
        break;
      case 'assessment_only':
        setIncludeAssessment(true);
        setIncludeGaps(false);
        setIncludeRemediations(false);
        setIncludeLineage(false);
        setIncludeSignoff(true);
        break;
      case 'gaps_only':
        setIncludeAssessment(false);
        setIncludeGaps(true);
        setIncludeRemediations(false);
        setIncludeLineage(false);
        setIncludeSignoff(true);
        break;
      case 'remediations_only':
        setIncludeAssessment(false);
        setIncludeGaps(false);
        setIncludeRemediations(true);
        setIncludeLineage(false);
        setIncludeSignoff(true);
        break;
      case 'executive_summary':
        setIncludeAssessment(true);
        setIncludeGaps(false);
        setIncludeRemediations(false);
        setIncludeLineage(false);
        setIncludeSignoff(true);
        break;
    }
  };

  // Browser Print trigger
  const handlePrint = () => {
    window.print();
  };

  // PDF Export via jsPDF & html2canvas
  const handleDownloadPdf = async () => {
    if (!printableRef.current) return;
    setIsGeneratingPdf(true);
    setPdfStatus('Rendering print document canvas...');

    try {
      const element = printableRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        windowWidth: 1200
      });

      setPdfStatus('Assembling PDF pages...');
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Page 1
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      // Multi-page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      const safeName = (profile.tiaReferenceId || profile.id || 'TIA_Assessment').replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`TIA_Assessment_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`);
      setPdfStatus('PDF Downloaded Successfully!');
    } catch (err) {
      console.error('PDF Generation Error:', err);
      window.print();
    } finally {
      setTimeout(() => {
        setIsGeneratingPdf(false);
        setPdfStatus('');
      }, 1800);
    }
  };

  // Copy Markdown / Plain Text
  const handleCopyMarkdown = () => {
    let content = `================================================================================
${customReportTitle.toUpperCase()}
CLASSIFICATION: ${classification}
CANONICAL REF: ${profile.tiaReferenceId || 'TIA-ID-SYNC'} | UUID: ${profile.universalUniqueIdentifier || 'N/A'}
DATE: ${new Date().toISOString().split('T')[0]} | INSPECTOR: ${inspectorName}
================================================================================\n\n`;

    if (includeAssessment) {
      content += `1. ASSESSMENT & REGULATORY PROFILE
--------------------------------------------------------------------------------
- Exporter: ${profile.exporterName} (${profile.exporterCountry}) [${profile.exporterRole.toUpperCase()}]
- Importer: ${profile.importerName} (${profile.importerCountry}) [${profile.importerRole.toUpperCase()}]
- Transfer Mechanism: ${profile.transferMechanism.replace(/_/g, ' ').toUpperCase()}
- Key Custody Architecture: ${profile.keyManagement.replace(/_/g, ' ').toUpperCase()}
- PRA SS2/21 Scope: ${profile.isMaterialOutsourcing ? 'Material Outsource / Critical Important Service' : 'Standard'}
- Overall Risk Score: ${evaluation.overallRiskScore} / 100 (${evaluation.riskCategory})
- Verdict: ${evaluation.verdict}
- Surveillance Risk Score: ${evaluation.scores?.surveillanceRiskScore ?? 0} / 100
- Technical Protection Score: ${evaluation.scores?.technicalProtectionScore ?? 0} / 100
- Legal Safeguards Score: ${evaluation.scores?.legalSafeguardsScore ?? 0} / 100
- PRA SS2/21 Resilience Score: ${evaluation.scores?.praResilienceScore ?? 0} / 100
- Executive Summary: ${reportData.assessment.executiveSummary}\n\n`;
    }

    if (includeGaps) {
      content += `2. IDENTIFIED COMPLIANCE & SURVEILLANCE GAPS (${reportData.gaps.length} GAPS)
--------------------------------------------------------------------------------\n`;
      reportData.gaps.forEach((gap, idx) => {
        content += `[GAP ${idx + 1}] ${gap.title} (Severity: ${gap.severity.toUpperCase()})
- Pillar: ${gap.pillar} | Rule Citation: ${gap.ruleReference}
- Inherent Deficit: ${gap.inherentDeficit}
- Surveillance Exposure: ${gap.surveillanceExposure}
- Remediation Required: ${gap.remediationLink}\n\n`;
      });
    }

    if (includeRemediations) {
      content += `3. SUPPLEMENTARY REMEDIATION MEASURES & CONTROLS (${reportData.remediationMeasures.length} CONTROLS)
--------------------------------------------------------------------------------\n`;
      reportData.remediationMeasures.forEach((m, idx) => {
        content += `[CONTROL ${idx + 1}] ${m.controlName} (${m.pillar.toUpperCase()})
- Status: ${m.status.toUpperCase()} | Residual Impact: ${m.residualRisk.toUpperCase()}
- Citation: ${m.edpbReference}
- Implementation Details: ${m.description}
- Assigned Lead: ${m.assignedOwner} | Target Completion: ${m.targetCompletionDate}\n\n`;
      });
    }

    if (includeSignoff) {
      content += `4. REGULATORY ATTESTATION & STATUTORY REMARKS
--------------------------------------------------------------------------------
- DPO Attestation: "${reportData.remarks.dpoStatement}"
- Chief Risk Officer Statement: "${reportData.remarks.croStatement}"
- Statutory Evergreen Cadence: ${reportData.remarks.evergreenCadence}
- Cryptographic Verification Hash: ${evaluation.cryptographicFingerprint || reportData.remarks.cryptographicVerificationHash}
================================================================================
Proprietary Sovereign Compliance Engine — www.technoscope.co.in
`;
    }

    navigator.clipboard.writeText(content);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Download Standalone HTML report
  const handleDownloadHtml = () => {
    if (!printableRef.current) return;
    const bodyHtml = printableRef.current.innerHTML;
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${customReportTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 40px; background: #fff; color: #1e293b; line-height: 1.5; }
    h1, h2, h3, h4 { color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
    th { background-color: #f1f5f9; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; }
    .border-b { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TIA_Report_${(profile.tiaReferenceId || profile.id).replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xs font-mono text-[#D1D5DB]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
          if (onGoHome) onGoHome();
        }
      }}
    >
      <div className="bg-[#0F0F10] border border-[#262626] rounded-xl w-full max-w-6xl h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="p-4 border-b border-[#262626] bg-[#141415] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            {/* Quick Home / Back Button */}
            <button
              onClick={() => {
                onClose();
                if (onGoHome) onGoHome();
              }}
              className="px-2.5 py-1.5 rounded bg-[#1A1A1B] text-[#A1A1AA] hover:text-white hover:bg-[#262626] border border-[#333336] transition-all flex items-center gap-1.5 text-xs font-bold font-mono cursor-pointer active:scale-98"
              title="Return to Home Assessment (Esc)"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Home</span>
            </button>

            <div className="w-9 h-9 rounded bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-tight font-mono">
                  Customizable Print & Dossier Studio
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono font-bold">
                  CLIENT-SIDE DETERMINISTIC • ZERO AI/SERVER DEPENDENCY
                </span>
              </div>
              <p className="text-[11px] text-[#71717A] font-mono">
                Select sections (Assessment, Gaps, Remediations) & export board-grade audit dossiers.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-end lg:self-auto">
            {/* Prominent Return Home Button */}
            <button
              onClick={() => {
                onClose();
                if (onGoHome) onGoHome();
              }}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#1E1E22] hover:bg-[#2A2A30] border border-[#3F3F46] hover:border-emerald-500/50 rounded transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
              title="Close Dossier Studio and return to Home (Esc)"
            >
              <Home className="w-3.5 h-3.5 text-emerald-400" />
              <span>Home</span>
              <kbd className="text-[9px] bg-[#121214] text-[#A1A1AA] border border-[#2E2E33] px-1 py-0.2 rounded font-mono font-bold">ESC</kbd>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              title="Open System Print Dialog (Ctrl+P / Command+P)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Assessment</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3.5 py-1.5 text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)] disabled:opacity-50"
              title="Download compiled high-res PDF file"
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
              onClick={handleDownloadHtml}
              className="px-3 py-1.5 text-xs font-bold text-[#D1D5DB] bg-[#1A1A1B] hover:bg-[#262626] border border-[#333336] rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Export Standalone Offline HTML File"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Export HTML</span>
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 text-xs font-bold text-[#D1D5DB] bg-[#1A1A1B] hover:bg-[#262626] border border-[#333336] rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copy formatted markdown audit summary"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#71717A]" />
                  <span className="hidden sm:inline">Copy Text</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                onClose();
                if (onGoHome) onGoHome();
              }}
              className="p-1.5 text-[#71717A] hover:text-white rounded hover:bg-[#262626] transition-colors ml-1 cursor-pointer flex items-center gap-1"
              title="Close Print Dialog (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Customization Controls Panel */}
        <div className="bg-[#121214] border-b border-[#262626] p-4 shrink-0 space-y-3">
          
          {/* Quick Presets & Options */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-[#71717A] flex items-center gap-1">
                <Sliders className="w-3 h-3 text-emerald-400" /> Print Presets:
              </span>
              {[
                { id: 'full', label: 'Full Dossier (All Sections)' },
                { id: 'assessment_only', label: 'Assessment Only' },
                { id: 'gaps_only', label: 'Gaps Audit Only' },
                { id: 'remediations_only', label: 'Remediations Plan' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleApplyPreset(p.id as PrintPreset)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                    activePreset === p.id 
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500 font-bold' 
                      : 'bg-[#1A1A1B] text-[#A1A1AA] hover:text-white border border-[#262626]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {pdfStatus && (
              <div className="text-xs text-cyan-400 font-mono animate-pulse flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{pdfStatus}</span>
              </div>
            )}
          </div>

          {/* Section Toggles Checkboxes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-1 border-t border-[#262626]">
            
            {/* 1. Assessment Checkbox */}
            <label className="flex items-center gap-2 p-2 rounded bg-[#18181A] border border-[#262626] cursor-pointer hover:border-emerald-500/40 transition-colors">
              <input
                type="checkbox"
                checked={includeAssessment}
                onChange={(e) => setIncludeAssessment(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-[#262626] border-[#3F3F46] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-emerald-500"
              />
              <div className="text-xs">
                <span className="font-bold text-white block">1. Assessment</span>
                <span className="text-[10px] text-[#71717A]">Profile & Scores</span>
              </div>
            </label>

            {/* 2. Gaps Checkbox */}
            <label className="flex items-center gap-2 p-2 rounded bg-[#18181A] border border-[#262626] cursor-pointer hover:border-rose-500/40 transition-colors">
              <input
                type="checkbox"
                checked={includeGaps}
                onChange={(e) => setIncludeGaps(e.target.checked)}
                className="w-4 h-4 rounded text-rose-500 bg-[#262626] border-[#3F3F46] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-rose-500"
              />
              <div className="text-xs">
                <span className="font-bold text-white block">2. Gaps Analysis</span>
                <span className="text-[10px] text-[#71717A]">{reportData.gaps.length} Legal Deficits</span>
              </div>
            </label>

            {/* 3. Remediations Checkbox */}
            <label className="flex items-center gap-2 p-2 rounded bg-[#18181A] border border-[#262626] cursor-pointer hover:border-blue-500/40 transition-colors">
              <input
                type="checkbox"
                checked={includeRemediations}
                onChange={(e) => setIncludeRemediations(e.target.checked)}
                className="w-4 h-4 rounded text-blue-500 bg-[#262626] border-[#3F3F46] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-blue-500"
              />
              <div className="text-xs">
                <span className="font-bold text-white block">3. Remediations</span>
                <span className="text-[10px] text-[#71717A]">{reportData.remediationMeasures.length} Controls & SLAs</span>
              </div>
            </label>

            {/* 4. Lineage Checkbox */}
            <label className="flex items-center gap-2 p-2 rounded bg-[#18181A] border border-[#262626] cursor-pointer hover:border-purple-500/40 transition-colors">
              <input
                type="checkbox"
                checked={includeLineage}
                onChange={(e) => setIncludeLineage(e.target.checked)}
                className="w-4 h-4 rounded text-purple-500 bg-[#262626] border-[#3F3F46] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-purple-500"
              />
              <div className="text-xs">
                <span className="font-bold text-white block">4. Data Lineage</span>
                <span className="text-[10px] text-[#71717A]">Chain & Vendors</span>
              </div>
            </label>

            {/* 5. Attestation Checkbox */}
            <label className="flex items-center gap-2 p-2 rounded bg-[#18181A] border border-[#262626] cursor-pointer hover:border-amber-500/40 transition-colors">
              <input
                type="checkbox"
                checked={includeSignoff}
                onChange={(e) => setIncludeSignoff(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-[#262626] border-[#3F3F46] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-amber-500"
              />
              <div className="text-xs">
                <span className="font-bold text-white block">5. Attestation Seal</span>
                <span className="text-[10px] text-[#71717A]">DPO & Hash Seal</span>
              </div>
            </label>

          </div>

          {/* Additional Report Metadata Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <div>
              <label className="text-[10px] uppercase font-bold text-[#71717A] block mb-1">
                Classification Banner:
              </label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
                className="w-full bg-[#18181A] border border-[#262626] text-[#D1D5DB] text-xs rounded px-2.5 py-1 font-mono focus:border-emerald-500 focus:outline-none"
              >
                <option value="STRICTLY CONFIDENTIAL // PRA SS2/21 AUDIT GRADE">STRICTLY CONFIDENTIAL // PRA AUDIT GRADE</option>
                <option value="CONFIDENTIAL // BOARD OF DIRECTORS DOSSIER">CONFIDENTIAL // BOARD DOSSIER</option>
                <option value="RESTRICTED // INTERNAL DATA GOVERNANCE">RESTRICTED // INTERNAL DATA GOVERNANCE</option>
                <option value="PUBLIC // SANITIZED EXECUTIVE SUMMARY">PUBLIC // SANITIZED SUMMARY</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-[#71717A] block mb-1">
                Lead Inspector / Auditor:
              </label>
              <input
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                placeholder="e.g. Data Protection Officer"
                className="w-full bg-[#18181A] border border-[#262626] text-[#D1D5DB] text-xs rounded px-2.5 py-1 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-[#71717A] block mb-1">
                Font & Spacing Density:
              </label>
              <div className="flex items-center gap-1">
                {(['compact', 'standard', 'spacious'] as const).map((scale) => (
                  <button
                    key={scale}
                    onClick={() => setFontSizeScale(scale)}
                    className={`flex-1 py-1 rounded text-xs font-mono uppercase transition-colors cursor-pointer ${
                      fontSizeScale === scale
                        ? 'bg-[#262626] text-white border border-[#3F3F46] font-bold'
                        : 'bg-[#18181A] text-[#71717A] border border-[#262626] hover:text-white'
                    }`}
                  >
                    {scale}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Scrollable Printable Live Preview Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#050506]">
          
          {/* Printable Report Document Card (Target for html2canvas & Browser Print) */}
          <div 
            ref={printableRef}
            className={`max-w-4xl mx-auto bg-white text-[#18181B] rounded-lg shadow-xl p-8 sm:p-12 space-y-8 font-sans print:p-0 print:shadow-none print:max-w-none ${
              fontSizeScale === 'compact' ? 'text-xs' : fontSizeScale === 'spacious' ? 'text-sm' : 'text-xs'
            }`}
            style={{ color: '#18181B' }}
          >
            
            {/* Document Header & Watermark Badge */}
            <div className="border-b-2 border-slate-900 pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="bg-slate-900 text-emerald-400 font-mono text-[11px] font-bold px-2.5 py-1 rounded">
                    DOSSIER ID: {profile.tiaReferenceId || 'TIA-ID-SYNC'}
                  </span>
                  <span className="bg-cyan-950 text-cyan-300 font-mono text-[11px] font-bold px-2.5 py-1 rounded border border-cyan-800">
                    CANONICAL REF: {evaluation.tiaReferenceId || profile.tiaReferenceId || 'TIA-2026'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 font-mono">
                    {classification}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 font-serif">
                  {customReportTitle}
                </h1>
                
                <p className="text-xs text-slate-600 font-mono mt-1">
                  TIA ENGINE by Technoscope • Cross-Border Data Transfer & PRA SS2/21 Compliance Assessment
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-mono mt-2">
                  <span>UUID: <strong className="text-slate-800">{evaluation.universalUniqueIdentifier || profile.universalUniqueIdentifier || 'N/A'}</strong></span>
                  <span>•</span>
                  <span>INSPECTOR: <strong className="text-slate-800">{inspectorName}</strong></span>
                  <span>•</span>
                  <span>DATE: <strong className="text-slate-800">{new Date().toISOString().split('T')[0]}</strong></span>
                </div>
              </div>

              <div className="text-right border-l-2 md:border-l border-slate-200 pl-4 shrink-0">
                <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Assessment Verdict</div>
                <div className={`mt-1 inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded ${
                  evaluation.verdict.toLowerCase().includes('approved') && !evaluation.verdict.toLowerCase().includes('condition')
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : evaluation.verdict.toLowerCase().includes('condition')
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {evaluation.verdict.toUpperCase()}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  Overall Risk: <strong className="text-slate-900">{evaluation.overallRiskScore}/100</strong>
                </div>
              </div>
            </div>

            {/* Profile Overview Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded border border-slate-200 text-xs font-mono">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Data Exporter</span>
                <span className="font-bold text-slate-900 block truncate">{profile.exporterName}</span>
                <span className="text-[10px] text-slate-500">{profile.exporterCountry} ({profile.exporterRole.toUpperCase()})</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Data Importer</span>
                <span className="font-bold text-slate-900 block truncate">{profile.importerName}</span>
                <span className="text-[10px] text-slate-500">{profile.importerCountry} ({profile.importerRole.toUpperCase()})</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Transfer Mechanism</span>
                <span className="font-bold text-slate-900 block truncate">{profile.transferMechanism.replace(/_/g, ' ').toUpperCase()}</span>
                <span className="text-[10px] text-slate-500">Vol: {profile.dataVolume}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Key Custody</span>
                <span className="font-bold text-emerald-700 block truncate">{profile.keyManagement.replace(/_/g, ' ').toUpperCase()}</span>
                <span className="text-[10px] text-slate-500">PRA SS2/21: {profile.isMaterialOutsourcing ? 'Material Outsource' : 'Standard'}</span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 1. ASSESSMENT SECTION */}
            {/* ========================================================================= */}
            {includeAssessment && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">1</span>
                    <h2 className="text-base font-bold text-slate-950 uppercase tracking-tight font-serif">
                      Transfer Impact Assessment & Risk Scoring
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-300">
                    OVERALL RISK: {evaluation.overallRiskScore}/100 ({evaluation.riskCategory.toUpperCase()})
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {reportData.assessment.executiveSummary}
                </p>

                {/* Score Breakdown Radar Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 text-center font-mono">
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">Surveillance Risk</span>
                    <span className="text-sm font-bold text-slate-900">{evaluation.scores?.surveillanceRiskScore ?? 0}/100</span>
                    <span className="text-[9px] text-slate-600 block">Jurisdiction Index</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 text-center font-mono">
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">Technical Protection</span>
                    <span className="text-sm font-bold text-emerald-700">{evaluation.scores?.technicalProtectionScore ?? 0}/100</span>
                    <span className="text-[9px] text-emerald-600 block">Encryption & Enclaves</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 text-center font-mono">
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">Legal Safeguards</span>
                    <span className="text-sm font-bold text-blue-700">{evaluation.scores?.legalSafeguardsScore ?? 0}/100</span>
                    <span className="text-[9px] text-blue-600 block">Warrant & Audit Clauses</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 text-center font-mono">
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">PRA SS2/21 Resilience</span>
                    <span className="text-sm font-bold text-purple-700">{evaluation.scores?.praResilienceScore ?? 0}/100</span>
                    <span className="text-[9px] text-purple-600 block">BCP & Exit Controls</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
                    <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-900 font-mono">
                      Statutory Benchmark Frameworks:
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
                      Personal Data Scope & Classifications:
                    </h4>
                    <ul className="space-y-1 text-slate-600 font-mono text-[11px]">
                      {reportData.assessment.dataCategoriesInScope.map((cat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>{cat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. GAPS ANALYSIS SECTION */}
            {/* ========================================================================= */}
            {includeGaps && (
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
                  Comprehensive audit of potential legal surveillance exposure (FISA Section 702, EO 12333, Cloud Act) and PRA SS2/21 operational resilience deficits:
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

                          <span className="font-mono text-[10px] text-slate-400 uppercase block font-bold mt-2">Enforced Remediation:</span>
                          <span className="font-bold text-emerald-800 block">{gap.remediationLink}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. REMEDIATION MEASURES SECTION */}
            {/* ========================================================================= */}
            {includeRemediations && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">3</span>
                    <h2 className="text-base font-bold text-slate-950 uppercase tracking-tight font-serif">
                      Supplementary Remediation Measures (3-Pillars)
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
                        <th className="p-2.5">Residual Impact</th>
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
                              {measure.status === 'implemented' ? 'IMPLEMENTED' : 'PENDING'}
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
            )}

            {/* ========================================================================= */}
            {/* 4. DATA LINEAGE & VENDORS (OPTIONAL) */}
            {/* ========================================================================= */}
            {includeLineage && (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center gap-2 border-b border-slate-300 pb-2">
                  <span className="w-6 h-6 rounded bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">4</span>
                  <h2 className="text-base font-bold text-slate-950 uppercase tracking-tight font-serif">
                    Data Lineage & Sub-Processor Governance
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded border border-slate-200">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Transfer Type</span>
                    <span className="font-bold text-slate-900">{profile.transferType.replace(/_/g, ' ')}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Frequency</span>
                    <span className="font-bold text-slate-900">{profile.transferFrequency.replace(/_/g, ' ')}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Sub-processor Authorization</span>
                    <span className="font-bold text-emerald-700">Prior Written Consent ({profile.subprocessorNoticePeriodDays}d Notice)</span>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 5. ATTESTATION & SIGN-OFF */}
            {/* ========================================================================= */}
            {includeSignoff && (
              <div className="space-y-4 pt-4 border-t-2 border-slate-900">
                <div className="flex items-center gap-2 border-b border-slate-300 pb-2">
                  <span className="w-6 h-6 rounded bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">5</span>
                  <h2 className="text-base font-bold text-slate-950 uppercase tracking-tight font-serif">
                    DPO Attestation & Executive Sign-off
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
                    <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-900 font-mono flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Data Protection Officer (DPO) Attestation:
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

                {/* Official Sign-off Seal & Hash */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-[10px] text-slate-500">
                  <div>
                    <div>STATUTORY CADENCE: <strong className="text-slate-800">{reportData.remarks.evergreenCadence}</strong></div>
                    <div className="mt-1">CRYPTOGRAPHIC SEAL: <strong className="text-slate-900">{evaluation.cryptographicFingerprint || reportData.remarks.cryptographicVerificationHash}</strong></div>
                  </div>

                  <div className="border border-slate-300 p-2 rounded bg-slate-50 text-right shrink-0">
                    <div className="font-bold text-slate-800">ATTESTED BY {inspectorName.toUpperCase()}</div>
                    <div className="text-[9px] text-emerald-700 font-bold">DIGITALLY SEALED & VERIFIED</div>
                  </div>
                </div>

                {/* Footer Notice */}
                <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[9px] font-mono text-slate-400">
                  <div>TIA ENGINE by Technoscope • PROPRIETARY REGULATORY PLATFORM</div>
                  <div>CONTACT: <a href="https://www.technoscope.co.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold underline">www.technoscope.co.in</a></div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Bottom Sticky Action Bar */}
        <div className="p-3 bg-[#141415] border-t border-[#262626] flex items-center justify-between shrink-0 text-xs font-mono">
          <div className="text-[#71717A] text-[11px] flex items-center gap-2">
            <span>Press <kbd className="px-1.5 py-0.5 bg-[#1F1F22] border border-[#333336] rounded text-[10px] text-[#A1A1AA] font-bold">Esc</kbd> or click outside to close</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                if (onGoHome) onGoHome();
              }}
              className="px-4 py-1.5 text-xs font-bold text-[#D1D5DB] hover:text-white bg-[#1F1F22] hover:bg-[#2A2A30] border border-[#3F3F46] rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
            >
              <Home className="w-3.5 h-3.5 text-emerald-400" />
              <span>Return to Home</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.25)]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Assessment</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
