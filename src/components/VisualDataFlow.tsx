import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Server, 
  Globe, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Database,
  Building,
  RefreshCw,
  EyeOff,
  Scale
} from 'lucide-react';
import { TransferProfile, TIAEvaluationResult } from '../types/tia';
import { JURISDICTIONS } from '../data/jurisdictions';

interface VisualDataFlowProps {
  profile: TransferProfile;
  evaluation: TIAEvaluationResult;
}

export const VisualDataFlow: React.FC<VisualDataFlowProps> = ({ profile, evaluation }) => {
  const jurisdiction = JURISDICTIONS[profile.importerCountry];
  const [selectedNode, setSelectedNode] = React.useState<string | null>('hsm');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header info */}
      <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262626] pb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2 font-mono uppercase">
              <Globe className="w-4 h-4 text-emerald-400" />
              Cross-Border Data Lineage & Cryptographic Perimeter
            </h2>
            <p className="text-xs text-[#71717A] mt-1 font-mono">
              End-to-end architectural data flow mapping: Origin ➔ Custody ➔ Legal Conduit ➔ Destination Cloud Boundary.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-[#71717A]">ORIGIN:</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#141415] text-cyan-400 border border-cyan-800/60">
              🇬🇧 {profile.exporterCountry}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#52525B]" />
            <span className="text-[#71717A]">DEST:</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#141415] text-purple-400 border border-purple-800/60">
              {jurisdiction?.flagEmoji || '🌐'} {profile.importerCountry}
            </span>
          </div>
        </div>

        {/* Visual Lineage Diagram Map */}
        <div className="mt-6 bg-[#080809] p-5 rounded-lg border border-[#262626] text-white relative overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-15 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            {/* Node 1: Sovereign Exporter & Tokenization */}
            <div 
              onClick={() => setSelectedNode('exporter')}
              className={`p-3.5 rounded border transition-all cursor-pointer font-mono ${
                selectedNode === 'exporter' ? 'bg-[#141415] border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.25)]' : 'bg-[#0F0F10] border-[#262626] hover:border-[#3F3F46]'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1">
                  <Building className="w-3 h-3" /> 01 ORIGIN ZONE
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
              </div>
              <h3 className="font-bold text-xs text-white truncate">{profile.exporterName}</h3>
              <p className="text-[10px] text-[#71717A] mt-1 line-clamp-1">
                ROLE: {profile.exporterRole.toUpperCase()} ({profile.exporterType})
              </p>
              <div className="mt-3 pt-2 border-t border-[#1F1F21] flex items-center justify-between text-[9px] text-[#71717A]">
                <span>SENSITIVITY:</span>
                <span className="font-bold text-amber-400">{profile.dataCategories.specialCategoryArt9 ? 'Art 9 Special' : 'Standard PII'}</span>
              </div>
            </div>

            {/* Node 2: Cryptographic Custody & Tokenization Gate */}
            <div 
              onClick={() => setSelectedNode('hsm')}
              className={`p-3.5 rounded border transition-all cursor-pointer font-mono ${
                selectedNode === 'hsm' ? 'bg-[#141415] border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.25)]' : 'bg-[#0F0F10] border-[#262626] hover:border-[#3F3F46]'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1">
                  <KeyRound className="w-3 h-3" /> 02 KEY VAULT
                </span>
                <span className={`w-2 h-2 rounded-full ${profile.keyManagement === 'byok_local_hsm' ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'bg-amber-400'}`}></span>
              </div>
              <h3 className="font-bold text-xs text-white truncate">
                {profile.keyManagement === 'byok_local_hsm' ? 'Local HSM (BYOK)' : 'Customer KMS'}
              </h3>
              <p className="text-[10px] text-[#71717A] mt-1 truncate">
                ALGO: {profile.atRestAlgorithm}
              </p>
              <div className="mt-3 pt-2 border-t border-[#1F1F21] flex items-center justify-between text-[9px] text-[#71717A]">
                <span>PSEUDONYMIZED:</span>
                <span className={`font-bold ${profile.pseudonymizationPriorToTransfer ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {profile.pseudonymizationPriorToTransfer ? 'YES (On-Soil)' : 'NO (Clear)'}
                </span>
              </div>
            </div>

            {/* Node 3: Legal Conduit & Encryption in Transit */}
            <div 
              onClick={() => setSelectedNode('conduit')}
              className={`p-3.5 rounded border transition-all cursor-pointer font-mono ${
                selectedNode === 'conduit' ? 'bg-[#141415] border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.25)]' : 'bg-[#0F0F10] border-[#262626] hover:border-[#3F3F46]'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3" /> 03 TRANSIT / SCC
                </span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]"></span>
              </div>
              <h3 className="font-bold text-xs text-white truncate">
                {profile.transferMechanism.replace(/_/g, ' ').toUpperCase()}
              </h3>
              <p className="text-[10px] text-[#71717A] mt-1 truncate">
                TLS: {profile.transitProtocol}
              </p>
              <div className="mt-3 pt-2 border-t border-[#1F1F21] flex items-center justify-between text-[9px] text-[#71717A]">
                <span>PRA S165A AUDIT:</span>
                <span className={`font-bold ${profile.praDirectInspectionClause ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {profile.praDirectInspectionClause ? 'Enforced' : 'Missing'}
                </span>
              </div>
            </div>

            {/* Node 4: Third-Country Importer & Surveillance Boundary */}
            <div 
              onClick={() => setSelectedNode('importer')}
              className={`p-3.5 rounded border transition-all cursor-pointer font-mono ${
                selectedNode === 'importer' ? 'bg-[#141415] border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.25)]' : 'bg-[#0F0F10] border-[#262626] hover:border-[#3F3F46]'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1">
                  <Server className="w-3 h-3" /> 04 DEST CLOUD
                </span>
                <span className={`w-2 h-2 rounded-full ${
                  jurisdiction?.overallSurveillanceRisk === 'Critical' ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]' :
                  jurisdiction?.overallSurveillanceRisk === 'High' ? 'bg-amber-500' :
                  'bg-emerald-400'
                }`}></span>
              </div>
              <h3 className="font-bold text-xs text-white truncate">{profile.importerName}</h3>
              <p className="text-[10px] text-[#71717A] mt-1 truncate">
                {profile.importerCountry} ({jurisdiction?.surveillanceLaws[0]?.statuteName.split('(')[0] || 'Local Laws'})
              </p>
              <div className="mt-3 pt-2 border-t border-[#1F1F21] flex items-center justify-between text-[9px] text-[#71717A]">
                <span>WARRANT CONTEST:</span>
                <span className={`font-bold ${profile.foreignWarrantChallengeCommitment ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {profile.foreignWarrantChallengeCommitment ? 'Enforced' : 'Not Set'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Node Details Box */}
        <div className="mt-4 p-4 rounded bg-[#141415] border border-[#262626] text-xs font-mono">
          {selectedNode === 'exporter' && (
            <div>
              <h4 className="font-bold text-white text-xs mb-1 uppercase text-cyan-400">Origin Zone & Exporter Profile</h4>
              <p className="text-[#A1A1AA] leading-relaxed font-sans">
                Regulated entity <strong className="text-white">{profile.exporterName}</strong> based in <strong className="text-white">{profile.exporterCountry}</strong>.
                All initial raw records originate within the UK/EEA legal zone. Under GDPR Art 44, responsibility for ensuring essential equivalence rests with this exporter.
                Allocated Senior Management Function: <span className="font-semibold text-emerald-400">{profile.seniorManagerFunction || 'SMF24'}</span>.
              </p>
            </div>
          )}

          {selectedNode === 'hsm' && (
            <div>
              <h4 className="font-bold text-white text-xs mb-1 uppercase text-emerald-400">Sovereign Key Vault & Tokenization Engine (EDPB 01/2020 Use Case 1 & 2)</h4>
              <p className="text-[#A1A1AA] leading-relaxed font-sans">
                {profile.keyManagement === 'byok_local_hsm' ? (
                  <span className="text-emerald-400 font-medium">
                    Compliant: Cryptographic root keys are generated and held exclusively in the UK/EEA on-premises HSM. The third-country cloud provider receives only ciphertext without access to decryption keys, neutralizing foreign government decryption orders.
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium">
                    Warning: Keys are managed via cloud provider KMS. If the provider is subject to US CLOUD Act or FISA 702, US authorities could compel key disclosure. Migrate to BYOK Local HSM.
                  </span>
                )}
              </p>
            </div>
          )}

          {selectedNode === 'conduit' && (
            <div>
              <h4 className="font-bold text-white text-xs mb-1 uppercase text-blue-400">Legal Transfer Instrument & Transit Cryptography</h4>
              <p className="text-[#A1A1AA] leading-relaxed font-sans">
                Data travels via <strong className="text-white">{profile.transitProtocol}</strong> under <strong className="text-white">{evaluation.transferMechanismSummary}</strong>.
                Contractual clauses enforce PRA Section 165A/166 inspection rights and mandatory 24-hour notification if a foreign court or intelligence subpoena is received.
              </p>
            </div>
          )}

          {selectedNode === 'importer' && (
            <div>
              <h4 className="font-bold text-white text-xs mb-1 uppercase text-purple-400">Destination Cloud Infrastructure & Foreign Surveillance Boundary</h4>
              <p className="text-[#A1A1AA] leading-relaxed font-sans">
                Importer <strong className="text-white">{profile.importerName}</strong> operates in <strong className="text-white">{profile.importerCountry}</strong>.
                Local surveillance risks include: <em>{jurisdiction?.surveillanceLaws.map(s => s.statuteName).join('; ')}</em>.
                {profile.isMaterialOutsourcing && (
                  <span className="block mt-1 font-semibold text-amber-400">
                    PRA SS2/21 Stressed Exit Active: Multi-region failover and data portability guaranteed under impact tolerance threshold of {profile.impactToleranceHours}h.
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sub-processor Chain Table */}
      <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#262626] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white font-mono uppercase">
              Sub-processor & Fourth-Party Supply Chain (PRA SS2/21 Ch 9)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#71717A]">
            Prior Notice Period: <strong className="text-emerald-400">{profile.subprocessorNoticePeriodDays} Days</strong>
          </span>
        </div>

        {profile.subProcessors && profile.subProcessors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[#262626] rounded overflow-hidden">
              <thead className="bg-[#080809] text-[#71717A] font-mono text-[10px] uppercase tracking-wider border-b border-[#262626]">
                <tr>
                  <th className="py-2.5 px-3">Sub-Processor Name</th>
                  <th className="py-2.5 px-3">Country</th>
                  <th className="py-2.5 px-3">Service Scope</th>
                  <th className="py-2.5 px-3 text-center">Clear Data Access</th>
                  <th className="py-2.5 px-3">Transfer Tool</th>
                  <th className="py-2.5 px-3 text-center">Equivalent Audit Rights</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F21] text-[#D1D5DB]">
                {profile.subProcessors.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#151516] transition-colors font-mono">
                    <td className="py-2.5 px-3 font-semibold text-white">{sub.name}</td>
                    <td className="py-2.5 px-3 text-[#A1A1AA]">{sub.country}</td>
                    <td className="py-2.5 px-3 text-[#A1A1AA] font-sans text-xs">{sub.serviceDescription}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                        sub.hasAccessToClearData ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {sub.hasAccessToClearData ? 'YES (Cleartext)' : 'NO (Ciphertext Only)'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[10px] text-[#71717A]">{sub.transferTool}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                        sub.equivalentAuditRights ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {sub.equivalentAuditRights ? 'Enforced' : 'Gaps'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-[#71717A] font-mono italic py-2">
            No active sub-processors declared for this transfer flow. Primary importer hosts data directly without chain outsourcing.
          </p>
        )}
      </div>
    </div>
  );
};
