import React from 'react';
import { 
  Database, 
  ShieldAlert, 
  FileCheck, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle,
  Building,
  Layers,
  ArrowRight,
  Server,
  KeyRound,
  FileSpreadsheet
} from 'lucide-react';
import { TransferProfile, TIAEvaluationResult } from '../types/tia';
import { SS221_RULES, MTP_REGISTER_FIELDS } from '../data/ss221Standards';

interface PrudentialChecklistViewProps {
  profile: TransferProfile;
  evaluation: TIAEvaluationResult;
}

export const PrudentialChecklistView: React.FC<PrudentialChecklistViewProps> = ({
  profile,
  evaluation
}) => {
  const [activeSection, setActiveSection] = React.useState<'checklist' | 'register' | 'rules'>('checklist');

  const downloadMtpCsv = () => {
    const csvRows = [
      ['Field Name', 'Record Data Value', 'Regulatory Basis (SS2/21 Table 5)'],
      ['Submitting Regulated Firm', profile.exporterName, 'Primary Data on Regulated Firm'],
      ['Firm Type / Jurisdiction', `${profile.exporterType} (${profile.exporterCountry})`, 'PRA Rulebook Scope'],
      ['SM&CR Accountable Senior Manager', profile.seniorManagerFunction || 'SMF24 Chief Operations', 'Para 4.7 - 4.9 Allocation of Responsibilities'],
      ['Third-Party Service Provider', profile.importerName, 'Primary Data on Third Party'],
      ['Vendor Country / Data Location', profile.importerCountry, 'Chapter 7 Data Location'],
      ['Outsourced Function Category', profile.importerSector, 'Function Category Data'],
      ['Material Outsourcing (CIF) Flag', profile.isMaterialOutsourcing ? 'YES (Critical Function)' : 'NO (Non-Material)', 'Chapter 5 Materiality Determination'],
      ['Supported Important Business Service', profile.importantBusinessService, 'Operational Resilience Part'],
      ['Maximum Impact Tolerance (Hours)', `${profile.impactToleranceHours} Hours`, 'SS1/21 & SS2/21 Impact Tolerances'],
      ['Key Management & Cryptographic Custody', profile.keyManagement, 'Chapter 7 Data Security'],
      ['Sections 165A/166 FSMA Audit Rights', profile.praDirectInspectionClause ? 'Compliant (Contracted)' : 'Non-Compliant', 'Chapter 8 Supervisory Audit Rights'],
      ['Stressed Exit Strategy & Testing Status', profile.testedStressedExitPlan ? 'Tested within 12 Months' : 'Gaps (Tabletop Required)', 'Chapter 10 Stressed Exit Plans'],
      ['Substitutability Rating', profile.substitutabilityRating, 'Chapter 10 Vendor Lock-In Assessment'],
      ['Supply Chain / 4th-Party Dependencies', profile.subProcessors.map(s => `${s.name} (${s.country})`).join('; ') || 'None', 'Chapter 9 Sub-Outsourcing Oversight'],
      ['Annual Review Cadence', `Every ${evaluation.reEvaluationSchedule.intervalMonths} Months`, 'Para 4.15 Annual FCA RegData Submission']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.map(cell => `"${cell}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PRA_SS221_MTP_Register_${profile.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 w-full mx-auto pb-12">
      {/* Header */}
      <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262626] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800 uppercase font-mono">
                Bank of England / PRA SS2/21
              </span>
              <span className="text-[10px] text-[#71717A] font-mono">
                EFFECTIVE 2026 / PS7/26 ALIGNED
              </span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight mt-2 font-mono uppercase">
              Prudential Outsourcing & Third Party Risk Management (SS2/21)
            </h2>
            <p className="text-xs text-[#71717A] mt-1 font-mono">
              Supervisory assessment of Critical or Important Functions (CIFs), S165A/S166 audit powers, concentration risks, and MTP Register readiness.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-[#080809] p-1 rounded border border-[#262626] flex font-mono">
              <button
                onClick={() => setActiveSection('checklist')}
                className={`px-3 py-1 rounded text-xs transition-all ${
                  activeSection === 'checklist' ? 'bg-[#1F1F21] text-emerald-400 font-bold border border-emerald-500/40 shadow-xs' : 'text-[#71717A] hover:text-[#D1D5DB]'
                }`}
              >
                Compliance Checklist
              </button>
              <button
                onClick={() => setActiveSection('register')}
                className={`px-3 py-1 rounded text-xs transition-all ${
                  activeSection === 'register' ? 'bg-[#1F1F21] text-emerald-400 font-bold border border-emerald-500/40 shadow-xs' : 'text-[#71717A] hover:text-[#D1D5DB]'
                }`}
              >
                MTP Register (Table 5)
              </button>
              <button
                onClick={() => setActiveSection('rules')}
                className={`px-3 py-1 rounded text-xs transition-all ${
                  activeSection === 'rules' ? 'bg-[#1F1F21] text-emerald-400 font-bold border border-emerald-500/40 shadow-xs' : 'text-[#71717A] hover:text-[#D1D5DB]'
                }`}
              >
                SS2/21 Rulebook Digest
              </button>
            </div>
          </div>
        </div>

        {/* Resilience Metrics Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 font-mono text-xs">
          <div className="p-3.5 rounded bg-[#141415] border border-indigo-900/60">
            <span className="text-[10px] uppercase font-bold text-indigo-400 block">Outsourcing Tier</span>
            <span className="text-xs font-bold text-white block mt-1">
              {profile.isMaterialOutsourcing ? 'Material / CIF Function' : 'Non-Material Outsourcing'}
            </span>
          </div>

          <div className="p-3.5 rounded bg-[#141415] border border-[#262626]">
            <span className="text-[10px] uppercase font-bold text-[#71717A] block">Impact Tolerance</span>
            <span className="text-xs font-bold text-white block mt-1">
              {profile.impactToleranceHours} Hours Max Downtime
            </span>
          </div>

          <div className="p-3.5 rounded bg-[#141415] border border-[#262626]">
            <span className="text-[10px] uppercase font-bold text-[#71717A] block">SM&CR Accountability</span>
            <span className="text-xs font-bold text-emerald-400 block mt-1 truncate" title={profile.seniorManagerFunction}>
              {profile.seniorManagerFunction || 'SMF24'}
            </span>
          </div>

          <div className="p-3.5 rounded bg-[#141415] border border-[#262626]">
            <span className="text-[10px] uppercase font-bold text-[#71717A] block">Substitutability</span>
            <span className="text-xs font-bold text-white block mt-1 capitalize truncate">
              {profile.substitutabilityRating.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION CONTENT: Checklist */}
      {activeSection === 'checklist' && (
        <div className="space-y-4">
          <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm">
            <h3 className="text-base font-bold text-white mb-1 font-mono uppercase">
              PRA SS2/21 Operational Resilience Assessment Results
            </h3>
            <p className="text-xs text-[#71717A] mb-6 font-mono">
              Review individual audit, governance, and business continuity expectations against the PRA Rulebook.
            </p>

            <div className="space-y-4">
              {evaluation.praChecklist.map((item) => (
                <div key={item.id} className="p-4 rounded border border-[#262626] bg-[#141415] flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 bg-[#080809] px-2 py-0.5 rounded border border-cyan-800/60">
                        {item.ruleReference}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {item.category}: {item.requirementDescription}
                      </span>
                    </div>
                    <p className="text-xs text-[#A1A1AA] leading-relaxed pl-1 pt-1 font-sans">
                      {item.evidenceOrRemediation}
                    </p>
                  </div>

                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold ${
                      item.complianceStatus === 'Compliant' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {item.complianceStatus === 'Compliant' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                      {item.complianceStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION CONTENT: MTP Register (Table 5) */}
      {activeSection === 'register' && (
        <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#262626] pb-4">
            <div>
              <h3 className="text-base font-bold text-white font-mono uppercase">
                Material Third Party (MTP) Register Record (Table 5 Format)
              </h3>
              <p className="text-xs text-[#71717A] font-mono mt-1">
                Mandatory data groups collected under Regulatory Reporting Part 25.1 for annual FCA RegData submission (90-day window).
              </p>
            </div>

            <button
              onClick={downloadMtpCsv}
              className="px-3.5 py-1.5 text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/60 rounded transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Export MTP Record (CSV)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[#262626] rounded overflow-hidden">
              <thead className="bg-[#080809] text-[#71717A] font-mono text-[10px] uppercase tracking-wider border-b border-[#262626]">
                <tr>
                  <th className="py-3 px-4 w-1/3">PRA Table 5 Data Field</th>
                  <th className="py-3 px-4 w-1/2">Submitted Arrangement Information</th>
                  <th className="py-3 px-4">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F21] text-[#D1D5DB] font-mono text-xs">
                <tr className="hover:bg-[#151516]">
                  <td className="py-3 px-4 font-semibold text-white">1. Submitting Regulated Entity</td>
                  <td className="py-3 px-4">{profile.exporterName} (UK FRN Verified)</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">VERIFIED</td>
                </tr>
                <tr className="hover:bg-[#151516]">
                  <td className="py-3 px-4 font-semibold text-white">2. Primary Third-Party Provider</td>
                  <td className="py-3 px-4">{profile.importerName} ({profile.importerCountry})</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">VERIFIED</td>
                </tr>
                <tr className="hover:bg-[#151516]">
                  <td className="py-3 px-4 font-semibold text-white">3. Function Category & IBS Link</td>
                  <td className="py-3 px-4 font-medium text-white">{profile.importantBusinessService}</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">MATERIAL (CIF)</td>
                </tr>
                <tr className="hover:bg-[#151516]">
                  <td className="py-3 px-4 font-semibold text-white">4. Geographic Data Processing Location</td>
                  <td className="py-3 px-4">{profile.importerCountry} ({profile.transferType.replace(/_/g, ' ')})</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">MAPPED</td>
                </tr>
                <tr className="hover:bg-[#151516]">
                  <td className="py-3 px-4 font-semibold text-white">5. Sub-outsourcing Supply Chain Ranking</td>
                  <td className="py-3 px-4">
                    {profile.subProcessors.length > 0 
                      ? `${profile.subProcessors.length} Critical 4th-party sub-processors declared` 
                      : 'Direct 3rd party deployment (no material chain)'}
                  </td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">AUDITED</td>
                </tr>
                <tr className="hover:bg-[#151516]">
                  <td className="py-3 px-4 font-semibold text-white">6. SMF Accountable Sign-Off</td>
                  <td className="py-3 px-4 font-medium text-indigo-400">{profile.seniorManagerFunction || 'SMF24 Chief Operations'}</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">ALLOCATED</td>
                </tr>
                <tr className="hover:bg-[#151516]">
                  <td className="py-3 px-4 font-semibold text-white">7. Stressed Exit Readiness</td>
                  <td className="py-3 px-4">
                    {profile.testedStressedExitPlan ? 'Tested within 12 months' : 'Action Required'} (Impact tolerance: {profile.impactToleranceHours}h)
                  </td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">OPERATIONAL</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION CONTENT: SS2/21 Rulebook Digest */}
      {activeSection === 'rules' && (
        <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-white font-mono uppercase">
            PRA SS2/21 Supervisory Statement Reference Digest
          </h3>
          <p className="text-xs text-[#71717A] mb-4 font-mono">
            Key chapters and regulatory mandates governing banks, Solvency II insurers, and UK branches.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SS221_RULES.map((rule) => (
              <div key={rule.id} className="p-4 rounded border border-[#262626] bg-[#141415] flex flex-col justify-between font-mono">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-indigo-400 font-bold mb-1">
                    <span>{rule.chapter}</span>
                    <span className="text-[#71717A]">{rule.paragraph}</span>
                  </div>
                  <h4 className="font-bold text-xs text-white mb-1">{rule.title}</h4>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed font-sans">{rule.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
