import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Wrench, 
  ShieldAlert, 
  Sparkles, 
  Filter, 
  CheckSquare, 
  Square,
  ArrowRight,
  Info,
  Scale,
  Lock,
  Layers,
  FileCheck,
  Zap,
  HelpCircle,
  X
} from 'lucide-react';
import { TransferProfile, TIAEvaluationResult } from '../types/tia';
import { addActivityLog } from '../utils/activityLogger';

export interface ComplianceActionItem {
  id: string;
  severity: 'Critical' | 'Warning' | 'Compliant';
  plainEnglishSummary: string;
  legalRegulation: string;
  exactError: string;
  recommendedFix: string;
  isResolved: boolean;
  category: 'Cryptographic' | 'Contractual' | 'Resilience' | 'Sub-Outsourcing' | 'Governance';
  applyFix: (current: TransferProfile) => Partial<TransferProfile>;
}

interface PrioritizedComplianceActionItemsProps {
  profile: TransferProfile;
  evaluation: TIAEvaluationResult;
  onUpdateProfile: (updatedProfile: TransferProfile) => void;
  onShowToast: (message: string) => void;
}

export const PrioritizedComplianceActionItems: React.FC<PrioritizedComplianceActionItemsProps> = ({
  profile,
  evaluation,
  onUpdateProfile,
  onShowToast
}) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'COMPLIANT'>('ALL');

  // Build the complete list of items evaluated against the profile
  const actionItems: ComplianceActionItem[] = useMemo(() => {
    const list: ComplianceActionItem[] = [
      // 1. Cryptographic BYOK HSM Key Custody (Critical if provider-managed keys)
      {
        id: 'item-key-custody',
        severity: profile.keyManagement === 'byok_local_hsm' ? 'Compliant' : 'Critical',
        plainEnglishSummary: profile.keyManagement === 'byok_local_hsm'
          ? 'Customer encryption keys are kept in on-premises hardware security modules; foreign cloud provider cannot decrypt records.'
          : 'Foreign cloud vendor has access to encryption keys; customer data is exposed to unauthorized overseas decryption.',
        legalRegulation: 'UK & EU GDPR Art. 46(1) & EDPB Recommendations 01/2020 Annex 2 (Use Cases 1 & 3)',
        exactError: profile.keyManagement === 'byok_local_hsm'
          ? 'No error: Key custody is fully held on-soil by the data exporter.'
          : 'Decryption keys are managed in the cloud provider’s infrastructure, leaving cleartext vulnerable to extraterritorial subpoenas (e.g., FISA 702).',
        recommendedFix: 'Implement client-side BYOK key management using an on-premises or UK/EEA local Hardware Security Module (HSM).',
        isResolved: profile.keyManagement === 'byok_local_hsm',
        category: 'Cryptographic',
        applyFix: () => ({ keyManagement: 'byok_local_hsm' })
      },
      // 2. Pre-Export Pseudonymization & Tokenization
      {
        id: 'item-tokenization',
        severity: profile.pseudonymizationPriorToTransfer ? 'Compliant' : 'Critical',
        plainEnglishSummary: profile.pseudonymizationPriorToTransfer
          ? 'Direct personal identifiers are irreversibly tokenized before crossing borders.'
          : 'Customer names and direct personal identifiers are transferred without pre-export tokenization.',
        legalRegulation: 'GDPR Art. 4(5), Art. 32(1)(a) & EDPB 01/2020 Use Case 2 (§85)',
        exactError: profile.pseudonymizationPriorToTransfer
          ? 'No error: Cryptographic pseudonymization is active prior to egress.'
          : 'Direct customer identifying data leaves the home jurisdiction in clear, non-pseudonymized form, exposing data subjects to mass surveillance matching.',
        recommendedFix: 'Deploy an on-premises tokenization proxy to replace direct customer identifiers with cryptographic pseudonyms before data egress.',
        isResolved: profile.pseudonymizationPriorToTransfer,
        category: 'Cryptographic',
        applyFix: () => ({ pseudonymizationPriorToTransfer: true })
      },
      // 3. Foreign Warrant Challenge Commitment (Critical/Warning)
      {
        id: 'item-warrant-challenge',
        severity: profile.foreignWarrantChallengeCommitment ? 'Compliant' : 'Critical',
        plainEnglishSummary: profile.foreignWarrantChallengeCommitment
          ? 'Vendor is legally bound to contest foreign government data warrants in local courts.'
          : 'Foreign government surveillance warrants can be answered by the vendor without mandatory legal challenge.',
        legalRegulation: 'EDPB 01/2020 Paragraphs 128-143 & CJEU Schrems II Ruling',
        exactError: profile.foreignWarrantChallengeCommitment
          ? 'No error: Mandatory warrant challenge commitment executed in contract schedule.'
          : 'Contract lacks an explicit obligation requiring vendor legal counsel to exhaust judicial remedies to quash extraterritorial warrants.',
        recommendedFix: 'Execute mandatory Warrant Challenge Addendum obligating supplier to challenge government access orders in court.',
        isResolved: profile.foreignWarrantChallengeCommitment,
        category: 'Contractual',
        applyFix: () => ({ foreignWarrantChallengeCommitment: true })
      },
      // 4. Foreign Warrant DPO Notification Protocol (Warning)
      {
        id: 'item-warrant-notify',
        severity: profile.foreignWarrantNotificationClause ? 'Compliant' : 'Warning',
        plainEnglishSummary: profile.foreignWarrantNotificationClause
          ? 'Vendor must notify institution DPO within 24 hours of any foreign government surveillance request.'
          : 'Vendor is not contractually obligated to alert the institution if foreign authorities request customer data.',
        legalRegulation: 'UK GDPR Art. 48 & EDPB Recommendations 01/2020 §135',
        exactError: profile.foreignWarrantNotificationClause
          ? 'No error: 24-hour emergency DPO notification protocol is contractual.'
          : 'Supplier terms do not mandate prompt notification of data access subpoenas, preventing the institution from seeking injunctive relief.',
        recommendedFix: 'Incorporate mandatory 24-hour emergency DPO disclosure notification clause into the Master Services Agreement.',
        isResolved: profile.foreignWarrantNotificationClause,
        category: 'Contractual',
        applyFix: () => ({ foreignWarrantNotificationClause: true })
      },
      // 5. PRA Direct Inspection & Audit Rights (Warning / Critical if CIF)
      {
        id: 'item-pra-inspection',
        severity: profile.praDirectInspectionClause ? 'Compliant' : (profile.isMaterialOutsourcing ? 'Critical' : 'Warning'),
        plainEnglishSummary: profile.praDirectInspectionClause
          ? 'UK Prudential Regulation Authority (PRA) has full statutory inspection and audit rights over supplier premises.'
          : 'Regulator (PRA) lacks direct physical and remote inspection rights over the overseas vendor.',
        legalRegulation: 'PRA SS2/21 Chapter 8 (Audit & Access Rights) & Rule 165A/166 FSMA 2000',
        exactError: profile.praDirectInspectionClause
          ? 'No error: S165A/S166 regulatory inspection right is explicitly granted.'
          : 'Master agreement does not grant the PRA and Bank of England direct, unrestricted access to inspect books, records, and systems.',
        recommendedFix: 'Append standard PRA SS2/21 Section 8 regulatory audit and S165A direct access clause to vendor agreement.',
        isResolved: profile.praDirectInspectionClause,
        category: 'Governance',
        applyFix: () => ({ praDirectInspectionClause: true, hasDirectAuditRights: true })
      },
      // 6. Stressed Exit Plan & Operational Resilience
      {
        id: 'item-stressed-exit',
        severity: profile.testedStressedExitPlan ? 'Compliant' : 'Warning',
        plainEnglishSummary: profile.testedStressedExitPlan
          ? 'Emergency exit plan is formally documented and tested to ensure business continuity during vendor failure.'
          : 'Emergency transition plan has not been tested to ensure continuity if the vendor abruptly shuts down.',
        legalRegulation: 'PRA SS2/21 Chapter 10 (Stressed Exit) & DORA Art. 12',
        exactError: profile.testedStressedExitPlan
          ? 'No error: Stressed exit plan walk-through simulation completed.'
          : 'No evidence of a tested stressed exit simulation demonstrating transfer of operations within the 4-hour impact tolerance.',
        recommendedFix: 'Complete a stressed exit technical simulation and document runbook for migrating workload to secondary standby.',
        isResolved: profile.testedStressedExitPlan,
        category: 'Resilience',
        applyFix: () => ({ testedStressedExitPlan: true })
      },
      // 7. Multi-Region Active Failover
      {
        id: 'item-multi-region',
        severity: profile.multiRegionActiveFailover ? 'Compliant' : 'Warning',
        plainEnglishSummary: profile.multiRegionActiveFailover
          ? 'Automated multi-region failover active; service will automatically survive an overseas regional cloud outage.'
          : 'Important business service has a single point of failure and lacks automated regional cloud failover.',
        legalRegulation: 'PRA SS2/21 Chapter 9 & Operational Continuity in Resolution (OCIR)',
        exactError: profile.multiRegionActiveFailover
          ? 'No error: Active multi-region redundancy configured.'
          : 'Architecture relies on a single availability zone/region, exceeding the 4-hour impact tolerance during a major outage.',
        recommendedFix: 'Provision secondary standby region with automated DNS health-check failover and synchronized data replication.',
        isResolved: profile.multiRegionActiveFailover,
        category: 'Resilience',
        applyFix: () => ({ multiRegionActiveFailover: true })
      },
      // 8. Transit Encryption (TLS 1.3 with mTLS)
      {
        id: 'item-transit-tls',
        severity: profile.transitEncryption ? 'Compliant' : 'Critical',
        plainEnglishSummary: profile.transitEncryption
          ? 'Data in transit is protected with TLS 1.3 encryption and mutual certificate authentication.'
          : 'Data in transit is unprotected or utilizes legacy cipher suites vulnerable to network wiretapping.',
        legalRegulation: 'GDPR Art. 32(1)(a) & NCSC Cryptographic Guidance for Transport Layer',
        exactError: profile.transitEncryption
          ? 'No error: TLS 1.3 with mTLS is active.'
          : 'Network transport does not enforce modern TLS 1.3 cipher suites with mutual client/server certificate authentication.',
        recommendedFix: 'Enforce TLS 1.3 cipher suites and mandate mutual TLS (mTLS) for all cross-border API endpoints.',
        isResolved: profile.transitEncryption,
        category: 'Cryptographic',
        applyFix: () => ({ transitEncryption: true, transitProtocol: 'TLS 1.3 with mTLS' })
      },
      // 9. Subprocessor Prior Written Authorization
      {
        id: 'item-subprocessors',
        severity: profile.priorWrittenAuthRequiredForSubprocessors ? 'Compliant' : 'Warning',
        plainEnglishSummary: profile.priorWrittenAuthRequiredForSubprocessors
          ? 'Vendor must obtain prior written consent and give 30 days notice before engaging new sub-processors.'
          : 'Vendor can subcontract customer data processing to overseas third parties without prior bank consent.',
        legalRegulation: 'UK GDPR Art. 28(2) & PRA SS2/21 Chapter 7 (Sub-outsourcing)',
        exactError: profile.priorWrittenAuthRequiredForSubprocessors
          ? 'No error: Specific written authorization and notice period enforced.'
          : 'Contract grants blanket sub-processor authorization without right to object or terminate prior to implementation.',
        recommendedFix: 'Contractually mandate specific prior written authorization and minimum 30-day notice period for sub-processors.',
        isResolved: profile.priorWrittenAuthRequiredForSubprocessors,
        category: 'Sub-Outsourcing',
        applyFix: () => ({ priorWrittenAuthRequiredForSubprocessors: true, subprocessorNoticePeriodDays: 30 })
      },
      // 10. Unannounced Physical & Systems Audit Rights
      {
        id: 'item-unannounced-audit',
        severity: profile.unannouncedAuditPermitted ? 'Compliant' : 'Warning',
        plainEnglishSummary: profile.unannouncedAuditPermitted
          ? 'Institution and independent auditors are permitted to conduct unannounced security spot-checks.'
          : 'Institution is barred from conducting unannounced audits or emergency security investigations on supplier sites.',
        legalRegulation: 'PRA SS2/21 Chapter 8 (Audit Rights) & EBA Outsourcing Guidelines §89',
        exactError: profile.unannouncedAuditPermitted
          ? 'No error: Unannounced audit right included in schedule.'
          : 'Audit clauses restrict inspection to scheduled annual windows, preventing emergency investigations following a data breach.',
        recommendedFix: 'Amend audit clause to permit unannounced spot-checks in the event of suspected security compromise.',
        isResolved: profile.unannouncedAuditPermitted,
        category: 'Contractual',
        applyFix: () => ({ unannouncedAuditPermitted: true })
      }
    ];

    // STRICT HIERARCHY SORT:
    // 1. Critical (Red) at the top
    // 2. Warnings (Yellow) in the middle
    // 3. Compliant/Resolved (Green) at the bottom
    const severityWeight: Record<string, number> = {
      Critical: 3,
      Warning: 2,
      Compliant: 1
    };

    return list.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity]);
  }, [profile]);

  // Counts by severity
  const counts = useMemo(() => {
    return {
      critical: actionItems.filter(i => i.severity === 'Critical').length,
      warning: actionItems.filter(i => i.severity === 'Warning').length,
      compliant: actionItems.filter(i => i.severity === 'Compliant').length,
      total: actionItems.length,
      unresolved: actionItems.filter(i => !i.isResolved).length
    };
  }, [actionItems]);

  // Filtered items
  const filteredItems = useMemo(() => {
    if (activeFilter === 'ALL') return actionItems;
    return actionItems.filter(i => i.severity.toUpperCase() === activeFilter);
  }, [actionItems, activeFilter]);

  // Unresolved IDs that can be selected
  const selectableUnresolvedIds = useMemo(() => {
    return filteredItems.filter(i => !i.isResolved).map(i => i.id);
  }, [filteredItems]);

  const isAllSelected = selectableUnresolvedIds.length > 0 && 
    selectableUnresolvedIds.every(id => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(prev => prev.filter(id => !selectableUnresolvedIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...selectableUnresolvedIds])));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Single Item Fix
  const handleApplySingleFix = (item: ComplianceActionItem) => {
    const patch = item.applyFix(profile);
    const updated = { ...profile, ...patch, lastUpdated: new Date().toISOString().split('T')[0] };
    
    // Log the single fix
    addActivityLog({
      userName: 'Compliance Manager',
      userRole: 'Regulatory Governance Officer',
      actionTaken: `Remediated Finding: ${item.plainEnglishSummary}`,
      targetEntity: item.legalRegulation,
      statusChange: `Changed from ${item.severity} to Compliant (Green)`,
      severity: 'Compliant'
    });

    onUpdateProfile(updated);
    onShowToast(`✓ Remediated: ${item.plainEnglishSummary}`);
  };

  // Bulk Apply Fixes Confirmation
  const handleConfirmBulkRemediation = () => {
    const selectedItems = actionItems.filter(i => selectedIds.includes(i.id));
    if (selectedItems.length === 0) return;

    let combinedPatch: Partial<TransferProfile> = {};
    selectedItems.forEach(item => {
      combinedPatch = { ...combinedPatch, ...item.applyFix(profile) };
    });

    const updated = {
      ...profile,
      ...combinedPatch,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    // Log the bulk action
    addActivityLog({
      userName: 'Compliance Lead',
      userRole: 'Lead DPO / SMF24',
      actionTaken: `Executed Bulk Remediation on ${selectedItems.length} compliance findings`,
      targetEntity: `Transfer Assessment: ${profile.title}`,
      statusChange: `Bulk Updated: ${selectedItems.length} findings changed to Compliant (Green)`,
      severity: 'Compliant'
    });

    onUpdateProfile(updated);
    setSelectedIds([]);
    setIsConfirmModalOpen(false);
    onShowToast(`✓ Successfully resolved ${selectedItems.length} compliance findings. Status changed to Compliant!`);
  };

  // Consistent Status Badge Tag Renderer (Exact same hex styling & top-right placement)
  const renderStatusTag = (severity: 'Critical' | 'Warning' | 'Compliant') => {
    switch (severity) {
      case 'Critical':
        return (
          <span 
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 bg-rose-950/80 border border-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.25)]"
            style={{ color: '#F87171', backgroundColor: '#450A0A', borderColor: '#EF4444' }}
          >
            <XCircle className="w-3 h-3 text-rose-400" />
            CRITICAL
          </span>
        );
      case 'Warning':
        return (
          <span 
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 border border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
            style={{ color: '#FBBF24', backgroundColor: '#451A03', borderColor: '#F59E0B' }}
          >
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            WARNING
          </span>
        );
      case 'Compliant':
        return (
          <span 
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.25)]"
            style={{ color: '#34D399', backgroundColor: '#064E3B', borderColor: '#10B981' }}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            COMPLIANT
          </span>
        );
    }
  };

  return (
    <section className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm space-y-4">
      {/* Header with Title and Severity Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262626] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#1A1A1B] text-emerald-400 border border-[#262626] flex items-center justify-center font-mono text-xs font-bold">
              02
            </div>
            <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
              Prioritized Compliance Action Items
              {counts.unresolved > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                  {counts.unresolved} Require Action
                </span>
              )}
            </h2>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-mono">
            Sorted strictly by risk severity (Critical ➔ Warnings ➔ Compliant). Plain English summaries with 1-click bulk remediation.
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
              activeFilter === 'ALL'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold'
                : 'bg-[#141415] text-[#71717A] hover:text-white border border-[#262626]'
            }`}
          >
            All ({counts.total})
          </button>

          <button
            onClick={() => setActiveFilter('CRITICAL')}
            className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer flex items-center gap-1 ${
              activeFilter === 'CRITICAL'
                ? 'bg-rose-950 text-rose-300 border border-rose-600 font-bold'
                : 'bg-[#141415] text-rose-400/80 hover:text-rose-300 border border-[#262626]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Critical ({counts.critical})
          </button>

          <button
            onClick={() => setActiveFilter('WARNING')}
            className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer flex items-center gap-1 ${
              activeFilter === 'WARNING'
                ? 'bg-amber-950 text-amber-300 border border-amber-600 font-bold'
                : 'bg-[#141415] text-amber-400/80 hover:text-amber-300 border border-[#262626]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Warnings ({counts.warning})
          </button>

          <button
            onClick={() => setActiveFilter('COMPLIANT')}
            className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer flex items-center gap-1 ${
              activeFilter === 'COMPLIANT'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold'
                : 'bg-[#141415] text-emerald-400/80 hover:text-emerald-300 border border-[#262626]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Compliant ({counts.compliant})
          </button>
        </div>
      </div>

      {/* Select All Bar */}
      {selectableUnresolvedIds.length > 0 && (
        <div className="flex items-center justify-between bg-[#121214] border border-[#262626] rounded-lg px-3 py-2 text-xs font-mono">
          <label className="flex items-center gap-2 text-[#D1D5DB] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-[#333336] text-emerald-500 focus:ring-emerald-500 bg-[#1A1A1B] cursor-pointer"
            />
            <span className="font-semibold text-white">Select All Action Items ({selectableUnresolvedIds.length})</span>
          </label>
          <span className="text-[11px] text-[#71717A]">
            {selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''} selected
          </span>
        </div>
      )}

      {/* Action Items List */}
      <div className="space-y-2.5">
        {filteredItems.map((item) => {
          const isExpanded = !!expandedIds[item.id];
          const isSelected = selectedIds.includes(item.id);

          return (
            <div
              key={item.id}
              className={`rounded-xl border transition-all ${
                item.severity === 'Critical'
                  ? 'border-rose-900/60 bg-[#140D0E]/80 hover:border-rose-700/80'
                  : item.severity === 'Warning'
                  ? 'border-amber-900/60 bg-[#14110B]/80 hover:border-amber-700/80'
                  : 'border-[#222225] bg-[#121214]/60 hover:border-emerald-800/60'
              } ${isSelected ? 'ring-1 ring-emerald-500' : ''}`}
            >
              {/* Single-line Summary Row (Progressive Disclosure) */}
              <div className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Checkbox (only for unresolved items) */}
                  {!item.isResolved ? (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectItem(item.id)}
                      className="w-4 h-4 rounded border-[#333336] text-emerald-500 focus:ring-emerald-500 bg-[#1A1A1B] cursor-pointer shrink-0"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}

                  {/* Plain English Summary */}
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-medium leading-snug truncate ${
                      item.isResolved ? 'text-[#A1A1AA]' : 'text-white'
                    }`} title={item.plainEnglishSummary}>
                      {item.plainEnglishSummary}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-[#71717A]">
                      <span className="text-[#A1A1AA]">{item.category}</span>
                      <span>•</span>
                      <span className="truncate max-w-[280px]">{item.legalRegulation}</span>
                    </div>
                  </div>
                </div>

                {/* Status Tag (Consistent Hex & Placement) */}
                <div className="flex items-center gap-2.5 shrink-0">
                  {renderStatusTag(item.severity)}

                  {/* View Details Chevron Button */}
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="p-1 rounded text-[#71717A] hover:text-white hover:bg-[#262626] transition-colors cursor-pointer"
                    title={isExpanded ? 'Collapse details' : 'View legal regulation & recommended fix'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Detail Pane (Specific Legal Regulation, Exact Error, Recommended Fix) */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-[#1F1F22] space-y-3 bg-[#0A0A0B]/80 rounded-b-xl text-xs font-mono animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {/* Specific Legal Regulation */}
                    <div className="bg-[#121214] p-3 rounded-lg border border-[#262626]">
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 uppercase font-bold mb-1">
                        <Scale className="w-3.5 h-3.5" /> Specific Legal Regulation
                      </div>
                      <p className="text-white font-semibold text-xs leading-relaxed">
                        {item.legalRegulation}
                      </p>
                    </div>

                    {/* Exact Error / Deficit */}
                    <div className="bg-[#121214] p-3 rounded-lg border border-[#262626]">
                      <div className="flex items-center gap-1.5 text-[10px] text-rose-400 uppercase font-bold mb-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> Exact Identified Deficit
                      </div>
                      <p className="text-[#D1D5DB] text-xs leading-relaxed font-sans">
                        {item.exactError}
                      </p>
                    </div>
                  </div>

                  {/* Recommended Fix Box & Action Button */}
                  <div className="bg-[#141415] p-3.5 rounded-lg border border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 uppercase font-bold mb-0.5">
                        <Wrench className="w-3.5 h-3.5" /> Recommended Remediation Step
                      </div>
                      <p className="text-xs text-[#D1D5DB] font-sans">
                        {item.recommendedFix}
                      </p>
                    </div>

                    {!item.isResolved && (
                      <button
                        onClick={() => handleApplySingleFix(item)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold text-black bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.3)] shrink-0 active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Apply Fix</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bulk Actions Floating Toolbar (Epic 3: Selection & Action Trigger) */}
      {selectedIds.length > 0 && (
        <div className="sticky bottom-4 z-40 bg-[#141415] border border-emerald-500/60 rounded-xl p-3.5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-600 flex items-center justify-center font-mono text-xs font-bold">
              {selectedIds.length}
            </div>
            <div>
              <div className="text-xs font-bold text-white font-mono">
                {selectedIds.length} compliance warning{selectedIds.length > 1 ? 's' : ''} selected
              </div>
              <div className="text-[11px] text-[#71717A] font-mono">
                Apply standardized safeguards and contractual clauses simultaneously.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 text-xs font-mono text-[#71717A] hover:text-white bg-[#1F1F21] rounded-lg border border-[#262626] transition-colors cursor-pointer"
            >
              Clear
            </button>

            <button
              onClick={() => setIsConfirmModalOpen(true)}
              className="px-4 py-1.5 text-xs font-mono font-bold text-black bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.4)]"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Apply Fix to Selected ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal (Epic 3 Acceptance Criteria: "You are about to update X records. Proceed?") */}
      {isConfirmModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs font-sans text-[#D1D5DB]"
          onClick={() => setIsConfirmModalOpen(false)}
        >
          <div 
            className="bg-[#0F0F10] border border-[#262626] rounded-2xl w-full max-w-lg p-6 flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                    Confirm Bulk Remediation
                  </h3>
                  <p className="text-[11px] text-[#71717A] font-mono">
                    Automated regulatory safeguard execution
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="p-1 text-[#71717A] hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <p className="text-white font-semibold leading-relaxed">
                You are about to update <span className="text-emerald-400 font-bold">{selectedIds.length}</span> compliance records. Proceed?
              </p>

              <div className="bg-[#141415] border border-[#262626] rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                {actionItems.filter(i => selectedIds.includes(i.id)).map(item => (
                  <div key={item.id} className="flex items-start gap-2 text-[11px] text-[#A1A1AA] font-mono">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item.plainEnglishSummary}</span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-[#71717A] leading-relaxed">
                This will automatically apply the recommended cryptographic controls, mandatory contractual addenda, and resilience protocols to the current profile. The audit trail will record this action permanently.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#262626]">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-mono text-[#71717A] hover:text-white bg-[#1F1F21] rounded-lg border border-[#262626] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkRemediation}
                className="px-4 py-1.5 text-xs font-mono font-bold text-black bg-emerald-400 hover:bg-emerald-300 rounded-lg cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              >
                Proceed & Apply Fixes
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
