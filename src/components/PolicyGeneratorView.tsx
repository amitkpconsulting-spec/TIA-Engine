import React from 'react';
import { 
  FileText, 
  Download, 
  Copy, 
  Printer, 
  Sparkles, 
  Edit3, 
  Eye, 
  Check, 
  RotateCcw,
  ShieldCheck,
  Building,
  KeyRound,
  FileCheck
} from 'lucide-react';
import { TransferProfile, TIAEvaluationResult } from '../types/tia';

interface PolicyGeneratorViewProps {
  profile: TransferProfile;
  evaluation: TIAEvaluationResult;
  onUpdatePolicyText: (newText: string) => void;
}

export const PolicyGeneratorView: React.FC<PolicyGeneratorViewProps> = ({
  profile,
  evaluation,
  onUpdatePolicyText
}) => {
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [copied, setCopied] = React.useState<boolean>(false);
  const [aiRefining, setAiRefining] = React.useState<boolean>(false);
  const [aiCustomInstruction, setAiCustomInstruction] = React.useState<string>('');
  const [showAiModal, setShowAiModal] = React.useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(evaluation.generatedPolicyDocument);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([evaluation.generatedPolicyDocument], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Data_Sovereignty_Policy_${profile.id}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRunAiRefinement = async () => {
    setAiRefining(true);
    try {
      const response = await fetch('/api/ai/refine-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transferProfile: profile,
          assessmentSummary: {
            materiality: profile.isMaterialOutsourcing ? 'Material Outsourcing / CIF' : 'Non-Material Outsourcing',
            verdict: evaluation.verdict,
            riskScore: evaluation.overallRiskScore
          },
          policyDraft: evaluation.generatedPolicyDocument,
          customPrompt: aiCustomInstruction || 'Strengthen Section 3 on BYOK local HSM custody, add strict 24h foreign warrant challenge protocols, and ensure explicit S165A/S166 FSMA supervisory audit terms.'
        })
      });

      const data = await response.json();
      if (data.refinedText) {
        onUpdatePolicyText(data.refinedText);
      }
      setShowAiModal(false);
    } catch (err) {
      console.error('AI refinement error:', err);
    } finally {
      setAiRefining(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Policy Studio Header */}
      <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262626] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 uppercase font-mono">
                Automated Policy Artifact
              </span>
              <span className="text-[10px] text-[#71717A] font-mono">
                REF: POL-SOV-TIA-{profile.id.toUpperCase()}
              </span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight mt-2 font-mono uppercase">
              Data Sovereignty, Localization & Cross-Border Transfer Policy
            </h2>
            <p className="text-xs text-[#71717A] mt-1 font-mono">
              Formally structured binding corporate policy tailored to {profile.exporterName} and {profile.importerCountry} data transfers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono">
            <button
              onClick={() => setShowAiModal(true)}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/60 rounded transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Clause Refinement
            </button>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.5 text-xs font-semibold text-[#D1D5DB] bg-[#141415] hover:bg-[#1F1F21] border border-[#262626] rounded transition-colors flex items-center gap-1.5"
            >
              {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              {isEditing ? 'Preview' : 'Edit Text'}
            </button>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-semibold text-[#D1D5DB] bg-[#141415] hover:bg-[#1F1F21] border border-[#262626] rounded transition-colors flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : 'Copy'}
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="px-3 py-1.5 text-xs font-semibold text-[#D1D5DB] bg-[#141415] hover:bg-[#1F1F21] border border-[#262626] rounded transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download .MD
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1F1F21] hover:bg-[#262626] border border-[#3F3F46] rounded transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
          </div>
        </div>

        {/* Policy Meta Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 font-mono text-xs">
          <div className="p-3 rounded bg-[#141415] border border-[#262626]">
            <span className="text-[10px] uppercase font-bold text-[#71717A] block">Policy Scope</span>
            <span className="text-xs font-bold text-white block mt-1">PRA SS2/21 & GDPR Art 44-49</span>
          </div>
          <div className="p-3 rounded bg-[#141415] border border-[#262626]">
            <span className="text-[10px] uppercase font-bold text-[#71717A] block">Key Custody Mandate</span>
            <span className="text-xs font-bold text-emerald-400 block mt-1">
              {profile.keyManagement === 'byok_local_hsm' ? 'Local Sovereign HSM (BYOK)' : 'Customer Managed'}
            </span>
          </div>
          <div className="p-3 rounded bg-[#141415] border border-[#262626]">
            <span className="text-[10px] uppercase font-bold text-[#71717A] block">Warrant Escalation</span>
            <span className="text-xs font-bold text-amber-400 block mt-1">Mandatory 24h DPO Notice</span>
          </div>
          <div className="p-3 rounded bg-[#141415] border border-[#262626]">
            <span className="text-[10px] uppercase font-bold text-[#71717A] block">Annual Audit Cadence</span>
            <span className="text-xs font-bold text-cyan-400 block mt-1">
              Every {evaluation.reEvaluationSchedule.intervalMonths} Months
            </span>
          </div>
        </div>
      </div>

      {/* Main Document Body */}
      <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm">
        {isEditing ? (
          <div>
            <div className="flex items-center justify-between mb-2 font-mono">
              <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                Raw Markdown Policy Editor
              </label>
              <span className="text-[10px] text-[#71717A]">Edits are saved in real-time</span>
            </div>
            <textarea
              rows={24}
              className="w-full font-mono text-xs p-4 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden leading-relaxed"
              value={evaluation.generatedPolicyDocument}
              onChange={(e) => onUpdatePolicyText(e.target.value)}
            />
          </div>
        ) : (
          <div>
            <div className="bg-[#080809] p-6 rounded border border-[#262626] font-mono text-xs text-[#D1D5DB] whitespace-pre-wrap leading-relaxed">
              {evaluation.generatedPolicyDocument}
            </div>
          </div>
        )}
      </div>

      {/* AI Refinement Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono">
          <div className="bg-[#0F0F10] rounded-xl max-w-lg w-full p-6 shadow-2xl border border-[#262626] space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">AI Clause Refinement Studio</h3>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-[#71717A] hover:text-white font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#A1A1AA] font-sans">
              Provide custom legal instructions or regulatory priorities to refine this policy document using the embedded compliance intelligence model.
            </p>

            <div>
              <label className="block text-[10px] font-bold uppercase text-[#71717A] mb-1">Custom Legal & Regulatory Prompt</label>
              <textarea
                rows={4}
                className="w-full text-xs p-3 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden font-mono"
                value={aiCustomInstruction}
                onChange={(e) => setAiCustomInstruction(e.target.value)}
                placeholder="e.g. Include specific cross-border liability indemnity caps, strengthen TUPE transition covenants under Chapter 10, or expand on Confidential Computing SGX enclaves..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-3 py-1.5 text-xs text-[#71717A] hover:text-white bg-[#141415] rounded border border-[#262626]"
              >
                Cancel
              </button>
              <button
                onClick={handleRunAiRefinement}
                disabled={aiRefining}
                className="px-4 py-2 text-xs font-bold text-emerald-400 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 disabled:opacity-50 rounded flex items-center gap-2 shadow-sm"
              >
                {aiRefining ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
                    Refining Policy with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Apply AI Enhancement
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
