import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Scale, 
  Layers, 
  TrendingDown, 
  Filter, 
  Plus, 
  Download, 
  ChevronDown,
  ChevronUp,
  FileCheck,
  ArrowUpDown,
  Search,
  Calendar,
  User,
  Eye,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Table,
  LayoutGrid,
  AlertCircle,
  FileSpreadsheet,
  Copy,
  Check,
  X,
  Sparkles,
  ArrowUp,
  ArrowDown,
  FileText,
  KeyRound,
  FileSignature,
  Users,
  Zap,
  Lightbulb,
  ArrowRight,
  ShieldAlert,
  Cpu,
  Lock,
  Wand2,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { TIAEvaluationResult, TransferProfile, SupplementaryMeasure } from '../types/tia';
import { ThreePillarPdfReportModal } from './ThreePillarPdfReportModal';
import { PillarType } from '../utils/threePillarReports';

interface RemediationDashboardProps {
  evaluation: TIAEvaluationResult;
  profile: TransferProfile;
  onUpdateMeasureStatus?: (measureId: string, newStatus: 'implemented' | 'recommended' | 'waived_with_risk_acceptance') => void;
}

type SortField = 'controlName' | 'status' | 'priority' | 'targetDate' | 'pillar' | 'assignedOwner';
type SortOrder = 'asc' | 'desc';
type GridDensity = 'compact' | 'standard' | 'comfortable';
type DateFilterType = 'ALL' | 'OVERDUE' | 'DUE_30' | 'DUE_90' | 'IMPLEMENTED' | 'CUSTOM';

export interface SuggestedActionItem {
  id: string;
  pillar: 'Technical' | 'Legal' | 'Organizational';
  title: string;
  controlName: string;
  category: string;
  severity: 'Critical' | 'High' | 'Medium';
  gapCausation: string;
  heuristicRationale: string;
  statutoryReference: string;
  suggestedAction: string;
  implementationDetail: string;
  targetOwner: string;
  defaultSlaDays: number;
  residualRiskScoreImpact: number;
  pillarScoreImprovement: number;
  blueprintSnippet: string;
  isAlreadyAdopted: boolean;
  isImplemented: boolean;
}

// Helper to reliably parse target dates for sorting and filtering
const parseDateToTimestamp = (dateStr?: string): number => {
  if (!dateStr) return Number.MAX_SAFE_INTEGER;
  // If format is ISO YYYY-MM-DD
  const isoMatch = dateStr.match(/^\d{4}-\d{2}-\d{2}/);
  if (isoMatch) {
    const timestamp = new Date(isoMatch[0]).getTime();
    if (!isNaN(timestamp)) return timestamp;
  }
  // If format is relative like "30 Days" or "30 days"
  const daysMatch = dateStr.match(/^(\d+)\s*(days|day|d)/i);
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10);
    return Date.now() + days * 86400000;
  }
  const monthsMatch = dateStr.match(/^(\d+)\s*(months|month|m)/i);
  if (monthsMatch) {
    const months = parseInt(monthsMatch[1], 10);
    return Date.now() + months * 30 * 86400000;
  }
  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) return parsed;
  return Number.MAX_SAFE_INTEGER;
};

// Format target date nicely for display
const formatTargetDate = (dateStr?: string): { display: string; isOverdue: boolean; daysRemaining: number | null } => {
  if (!dateStr) return { display: 'Unspecified', isOverdue: false, daysRemaining: null };
  
  const timestamp = parseDateToTimestamp(dateStr);
  if (timestamp === Number.MAX_SAFE_INTEGER) {
    return { display: dateStr, isOverdue: false, daysRemaining: null };
  }
  
  const now = Date.now();
  const diffDays = Math.ceil((timestamp - now) / 86400000);
  const isOverdue = diffDays < 0;

  // If already standard ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return { display: dateStr, isOverdue, daysRemaining: diffDays };
  }

  const dateObj = new Date(timestamp);
  const formatted = dateObj.toISOString().split('T')[0];
  return { display: formatted, isOverdue, daysRemaining: diffDays };
};

// Priority weight helper
const getPriorityWeight = (measure: SupplementaryMeasure): number => {
  if (measure.residualRisk === 'High' || (measure.pillar === 'Technical' && measure.status === 'recommended')) return 3;
  if (measure.residualRisk === 'Medium') return 2;
  return 1;
};

const getPriorityLabel = (measure: SupplementaryMeasure): 'Critical' | 'High' | 'Medium' | 'Low' => {
  if (measure.residualRisk === 'High') return 'Critical';
  if (measure.pillar === 'Technical' && measure.status === 'recommended') return 'High';
  if (measure.residualRisk === 'Medium') return 'Medium';
  return 'Low';
};

export const RemediationDashboardView: React.FC<RemediationDashboardProps> = ({
  evaluation,
  profile,
  onUpdateMeasureStatus
}) => {
  // Local state for interactive remediation items
  const [localMeasures, setLocalMeasures] = useState<SupplementaryMeasure[]>(() => {
    // Ensure all initial measures have normalized targetCompletionDate
    return evaluation.remediationMatrix.map((m, idx) => ({
      ...m,
      targetCompletionDate: m.targetCompletionDate || new Date(Date.now() + (idx + 1) * 14 * 86400000).toISOString().split('T')[0]
    }));
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [pillarFilter, setPillarFilter] = useState<'ALL' | 'Technical' | 'Legal' | 'Organizational'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'implemented' | 'recommended' | 'waived_with_risk_acceptance'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'Critical' | 'High' | 'Medium' | 'Low'>('ALL');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [activePreset, setActivePreset] = useState<string>('ALL');

  // Sorting States
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Grid Controls
  const [gridDensity, setGridDensity] = useState<GridDensity>('compact');
  const [viewMode, setViewMode] = useState<'grid' | 'cards'>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedActionId, setExpandedActionId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // PDF Export Modal State (3-Pillar & Consolidated)
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfExportPillar, setPdfExportPillar] = useState<PillarType>('Consolidated');

  const handleOpenPdfExport = (pillar: PillarType) => {
    setPdfExportPillar(pillar);
    setIsPdfModalOpen(true);
  };

  // New action form state
  const [newControlName, setNewControlName] = useState('');
  const [newPillar, setNewPillar] = useState<'Technical' | 'Legal' | 'Organizational'>('Technical');
  const [newDescription, setNewDescription] = useState('');
  const [newOwner, setNewOwner] = useState('SecOps / Legal');
  const [newEdpbRef, setNewEdpbRef] = useState('EDPB 01/2020 & PRA SS2/21');
  const [newResidualRisk, setNewResidualRisk] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [newTargetDate, setNewTargetDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);

  // Suggested Actions State (Simulated Intelligence Heuristic)
  const [suggestedPillarFilter, setSuggestedPillarFilter] = useState<'ALL' | 'Technical' | 'Legal' | 'Organizational'>('ALL');
  const [expandedSuggestionIds, setExpandedSuggestionIds] = useState<string[]>([]);
  const [suggestionFeedback, setSuggestionFeedback] = useState<string | null>(null);

  const toggleSuggestionExpand = (id: string) => {
    setExpandedSuggestionIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Handle single status update
  const handleStatusChange = (id: string, newStatus: 'implemented' | 'recommended' | 'waived_with_risk_acceptance') => {
    const updated = localMeasures.map(m => m.id === id ? { ...m, status: newStatus } : m);
    setLocalMeasures(updated);
    if (onUpdateMeasureStatus) {
      onUpdateMeasureStatus(id, newStatus);
    }
  };

  // Bulk status update
  const handleBulkStatusChange = (newStatus: 'implemented' | 'recommended' | 'waived_with_risk_acceptance') => {
    if (selectedIds.length === 0) return;
    const updated = localMeasures.map(m => selectedIds.includes(m.id) ? { ...m, status: newStatus } : m);
    setLocalMeasures(updated);
    if (onUpdateMeasureStatus) {
      selectedIds.forEach(id => onUpdateMeasureStatus(id, newStatus));
    }
    setSelectedIds([]);
  };

  // Select all / deselect all
  const handleSelectAll = (filteredItems: SupplementaryMeasure[]) => {
    if (selectedIds.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(m => m.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Add custom remediation step
  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newControlName) return;
    const newMeasure: SupplementaryMeasure = {
      id: `custom-rem-${Date.now()}`,
      pillar: newPillar,
      controlName: newControlName,
      description: newDescription || 'Custom supplementary mitigation measure.',
      implementationDetail: 'Action step drafted by Compliance & Security engineering team.',
      edpbReference: newEdpbRef,
      status: 'recommended',
      riskMitigated: 'Third-country access & PRA operational resilience',
      residualRisk: newResidualRisk,
      assignedOwner: newOwner,
      targetCompletionDate: newTargetDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
    };
    setLocalMeasures([newMeasure, ...localMeasures]);
    setShowAddModal(false);
    setNewControlName('');
    setNewDescription('');
  };

  // Handle Sort Header Click
  const handleHeaderSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setPillarFilter('ALL');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setDateFilter('ALL');
    setCustomStartDate('');
    setCustomEndDate('');
    setActivePreset('ALL');
  };

  // Quick Preset Handlers
  const handleApplyPreset = (preset: string) => {
    setActivePreset(preset);
    if (preset === 'ALL') {
      handleResetFilters();
    } else if (preset === 'OVERDUE') {
      setSearchQuery('');
      setPillarFilter('ALL');
      setStatusFilter('recommended');
      setPriorityFilter('ALL');
      setDateFilter('OVERDUE');
    } else if (preset === 'CRITICAL_TECH') {
      setSearchQuery('');
      setPillarFilter('Technical');
      setStatusFilter('recommended');
      setPriorityFilter('High');
      setDateFilter('ALL');
    } else if (preset === 'LEGAL_WARRANTS') {
      setSearchQuery('warrant');
      setPillarFilter('Legal');
      setStatusFilter('ALL');
      setPriorityFilter('ALL');
      setDateFilter('ALL');
    } else if (preset === 'PRA_MATERIAL') {
      setSearchQuery('PRA');
      setPillarFilter('ALL');
      setStatusFilter('ALL');
      setPriorityFilter('ALL');
      setDateFilter('ALL');
    } else if (preset === 'IMPLEMENTED') {
      setSearchQuery('');
      setPillarFilter('ALL');
      setStatusFilter('implemented');
      setPriorityFilter('ALL');
      setDateFilter('ALL');
    }
  };

  // Compute live counts and progress
  const totalCount = localMeasures.length;
  const implementedCount = localMeasures.filter(m => m.status === 'implemented').length;
  const pendingCount = localMeasures.filter(m => m.status === 'recommended').length;
  const waivedCount = localMeasures.filter(m => m.status === 'waived_with_risk_acceptance').length;
  const completionPercentage = totalCount > 0 ? Math.round((implementedCount / totalCount) * 100) : 0;

  // Pillar 3-Way Metrics & Progress (Technical, Organizational, Legal)
  const pillarStats = useMemo(() => {
    const techItems = localMeasures.filter(m => m.pillar === 'Technical');
    const orgItems = localMeasures.filter(m => m.pillar === 'Organizational');
    const legalItems = localMeasures.filter(m => m.pillar === 'Legal');

    const techTotal = techItems.length;
    const techCompleted = techItems.filter(m => m.status === 'implemented').length;
    const techPending = techItems.filter(m => m.status === 'recommended').length;
    const techWaived = techItems.filter(m => m.status === 'waived_with_risk_acceptance').length;
    const techPercentage = techTotal > 0 ? Math.round((techCompleted / techTotal) * 100) : 0;

    const orgTotal = orgItems.length;
    const orgCompleted = orgItems.filter(m => m.status === 'implemented').length;
    const orgPending = orgItems.filter(m => m.status === 'recommended').length;
    const orgWaived = orgItems.filter(m => m.status === 'waived_with_risk_acceptance').length;
    const orgPercentage = orgTotal > 0 ? Math.round((orgCompleted / orgTotal) * 100) : 0;

    const legalTotal = legalItems.length;
    const legalCompleted = legalItems.filter(m => m.status === 'implemented').length;
    const legalPending = legalItems.filter(m => m.status === 'recommended').length;
    const legalWaived = legalItems.filter(m => m.status === 'waived_with_risk_acceptance').length;
    const legalPercentage = legalTotal > 0 ? Math.round((legalCompleted / legalTotal) * 100) : 0;

    return {
      technical: {
        total: techTotal,
        completed: techCompleted,
        pending: techPending,
        waived: techWaived,
        percentage: techPercentage
      },
      organizational: {
        total: orgTotal,
        completed: orgCompleted,
        pending: orgPending,
        waived: orgWaived,
        percentage: orgPercentage
      },
      legal: {
        total: legalTotal,
        completed: legalCompleted,
        pending: legalPending,
        waived: legalWaived,
        percentage: legalPercentage
      }
    };
  }, [localMeasures]);

  // Simulated Intelligence Heuristic for Gap-to-Action Synthesis
  const suggestedActions = useMemo<SuggestedActionItem[]>(() => {
    const list: SuggestedActionItem[] = [];

    // Helper to check adoption status in localMeasures
    const checkStatus = (ctrlName: string, id: string) => {
      const match = localMeasures.find(m => 
        m.id === id || 
        m.controlName.toLowerCase().includes(ctrlName.toLowerCase().slice(0, 15)) ||
        ctrlName.toLowerCase().includes(m.controlName.toLowerCase().slice(0, 15))
      );
      return {
        isAlreadyAdopted: !!match,
        isImplemented: match?.status === 'implemented'
      };
    };

    // 1. Technical: Dedicated Local Hardware HSM Key Custody (BYOK/HYOK)
    if (profile.keyManagement !== 'byok_local_hsm' && profile.keyManagement !== 'hyok_hold_your_own_key') {
      const statusInfo = checkStatus('Hardware Key Custody Vault (BYOK/HYOK) Provisioning', 'GAP-TECH-01');
      list.push({
        id: 'sug-tech-byok-hsm',
        pillar: 'Technical',
        title: 'Institute On-Soil Hardware Key Custody Vault (BYOK/HYOK)',
        controlName: 'Hardware Key Custody Vault (BYOK/HYOK) Provisioning',
        category: 'Cryptographic Key Sovereign Escrow',
        severity: 'Critical',
        gapCausation: `Keys managed via ${profile.keyManagement.replace(/_/g, ' ')} allow cloud provider compliance with foreign surveillance subpoenas (FISA 702) without exporter authorization.`,
        heuristicRationale: 'EDPB Recommendations 01/2020 (Annex 2 Use Case 1) mandates that cryptographic keys remain exclusively under the exporter\'s territorial custody in the UK/EEA.',
        statutoryReference: 'EDPB 01/2020 Annex 2 (Use Case 1) & CJEU Schrems II Paras 178-188',
        suggestedAction: 'Provision a dedicated FIPS 140-3 Level 3 HSM cluster inside the UK/EEA boundary and re-encrypt payload envelopes client-side.',
        implementationDetail: 'Deploy dedicated Cloud HSM / Thales Luna cluster with PKCS#11 key wrapping and zero-knowledge KMS token binding.',
        targetOwner: 'Cloud SecOps & Cryptographic Engineering',
        defaultSlaDays: 21,
        residualRiskScoreImpact: -22,
        pillarScoreImprovement: 35,
        blueprintSnippet: 'Resource: Dedicated HSM (FIPS 140-3 L3) -> Envelope Asymmetric AES-256-GCM -> Exporter Sovereign Keyring',
        ...statusInfo
      });
    }

    // 2. Technical: Pre-Export Split-Knowledge Format-Preserving Tokenization
    if (!profile.pseudonymizationPriorToTransfer) {
      const statusInfo = checkStatus('Pre-Export Format-Preserving Tokenization Pipeline', 'GAP-TECH-02');
      list.push({
        id: 'sug-tech-tokenization',
        pillar: 'Technical',
        title: 'Deploy Split-Knowledge Pre-Export Tokenization Pipeline',
        controlName: 'Pre-Export Format-Preserving Tokenization Pipeline',
        category: 'Data-at-Rest & In-Transit Anonymization',
        severity: 'High',
        gapCausation: 'Direct cleartext transfer of direct/indirect personal identifiers (PAN, national IDs, names) allows interception and single-point correlation.',
        heuristicRationale: 'EDPB 01/2020 Use Case 2 requires deterministic tokenization prior to transfer with sovereign correlation keys held locally.',
        statutoryReference: 'EDPB 01/2020 Use Case 2 & GDPR Art 4(5) / Art 32',
        suggestedAction: 'Integrate client-side FP-AES tokenization gateway prior to API egress, routing mapping tables to on-soil isolated vaults.',
        implementationDetail: 'Implement Format-Preserving Encryption (FPE / FF1) with sovereign split-knowledge identity tables in UK/EEA database.',
        targetOwner: 'Application Security Architecture',
        defaultSlaDays: 30,
        residualRiskScoreImpact: -18,
        pillarScoreImprovement: 28,
        blueprintSnippet: 'API Gateway Egress Filter -> FF1 Tokenization -> Local Secret Share Table -> Transferred Synthetic Data',
        ...statusInfo
      });
    }

    // 3. Technical: Confidential Computing Hardware Memory Enclaves
    if (!profile.confidentialComputingEnclaves) {
      const statusInfo = checkStatus('Confidential Computing Enclave Deployment', 'GAP-TECH-03');
      list.push({
        id: 'sug-tech-confidential-vm',
        pillar: 'Technical',
        title: 'Enforce Hardware-Isolated Confidential Computing Memory Enclaves',
        controlName: 'Confidential Computing Enclave Deployment (AMD SEV-SNP)',
        category: 'Data-in-Use Cryptographic Isolation',
        severity: 'Medium',
        gapCausation: 'Data-in-use resides in standard hypervisor memory buffers vulnerable to kernel-level administrative dumps and memory surveillance.',
        heuristicRationale: 'PRA SS2/21 Chapter 7 and EDPB 01/2020 require runtime cryptographic memory isolation for third-country processing.',
        statutoryReference: 'EDPB 01/2020 Paras 78-81 & PRA SS2/21 Chapter 7',
        suggestedAction: 'Migrate importer compute workloads to AMD SEV-SNP / Intel SGX Confidential VMs with remote hardware attestation.',
        implementationDetail: 'Configure confidential VM instances with vTPM attestation verification and encrypted memory state.',
        targetOwner: 'Cloud Infrastructure & Platform Engineering',
        defaultSlaDays: 45,
        residualRiskScoreImpact: -12,
        pillarScoreImprovement: 18,
        blueprintSnippet: 'Workload Migration -> AMD SEV-SNP Secure Memory -> Remote Hardware Attestation Handshake',
        ...statusInfo
      });
    }

    // 4. Legal: Supplementary Foreign Warrant Judicial Challenge & Stay of Execution Addendum
    if (!profile.foreignWarrantChallengeCommitment) {
      const statusInfo = checkStatus('Supplementary Warrant Challenge Addendum', 'GAP-LEG-01');
      list.push({
        id: 'sug-leg-warrant-challenge',
        pillar: 'Legal',
        title: 'Execute Warrant Judicial Challenge & Stay-of-Execution Covenant',
        controlName: 'Supplementary Warrant Challenge Addendum',
        category: 'Judicial Redress & Foreign State Protection',
        severity: 'Critical',
        gapCausation: 'Importer lacks a binding legal obligation to exhaust judicial appeals and petition for stays of execution before government disclosure.',
        heuristicRationale: 'European Essential Guarantees B & D require binding judicial challenge commitments in supplementary legal addenda.',
        statutoryReference: 'EDPB 01/2020 Annex 2 Safeguard L2 & EEG Guarantee B/D',
        suggestedAction: 'Draft and execute bilateral Warrant Challenge Addendum requiring importer legal team to contest unlawful surveillance requests.',
        implementationDetail: 'Execute contractual addendum: Importer must file emergency stay-of-execution motions and notify exporter DPO within 24 hours.',
        targetOwner: 'Legal & Regulatory Affairs',
        defaultSlaDays: 14,
        residualRiskScoreImpact: -20,
        pillarScoreImprovement: 32,
        blueprintSnippet: 'SCC Rider Clause 15.2 -> Mandatory Judicial Motion to Quash -> Injunction & Stay-of-Execution Filing',
        ...statusInfo
      });
    }

    // 5. Legal: PRA SS2/21 Direct Regulatory Inspection Rights & S166 Skilled Person Rider
    if (!profile.praDirectInspectionClause) {
      const statusInfo = checkStatus('PRA SS2/21 Regulatory Inspection Rider', 'GAP-LEG-02');
      list.push({
        id: 'sug-leg-pra-audit',
        pillar: 'Legal',
        title: 'Incorporate PRA SS2/21 Chapter 8 Direct Regulatory Audit & S166 Rider',
        controlName: 'PRA SS2/21 Regulatory Inspection Rider',
        category: 'Prudential Supervision & Regulatory Access',
        severity: profile.isMaterialOutsourcing ? 'Critical' : 'High',
        gapCausation: 'Master services agreement lacks explicit provision for PRA/FCA unrestricted physical/logical access and skilled person audits.',
        heuristicRationale: 'Mandatory under PRA Outsourcing Rulebook for Material Outsourcing (CIF) under Section 165A/166 FSMA 2000.',
        statutoryReference: 'PRA SS2/21 Chapter 8 & FSMA 2000 Section 165A/166',
        suggestedAction: 'Incorporate statutory audit covenant giving the Bank of England, PRA, and FCA unhindered inspection access to data centers.',
        implementationDetail: 'Contractual rider executing Section 165A/166 direct audit authority, multi-firm pooling rights, and skilled person indemnity.',
        targetOwner: 'Group Compliance & Banking Regulatory Counsel',
        defaultSlaDays: 21,
        residualRiskScoreImpact: -16,
        pillarScoreImprovement: 30,
        blueprintSnippet: 'FSMA S165A/166 Clause -> Direct PRA/FCA Physical & Logical Access -> 5-Day Unannounced Inspection Right',
        ...statusInfo
      });
    }

    // 6. Legal: SCC Clause 15.1 Emergency Warrant Notification SLA (24h)
    if (!profile.foreignWarrantNotificationClause) {
      const statusInfo = checkStatus('SCC Clause 15.1 Rapid Warrant Notification Addendum', 'GAP-LEG-03');
      list.push({
        id: 'sug-leg-warrant-notice',
        pillar: 'Legal',
        title: 'Institute SCC Clause 15.1 Emergency Warrant Notification SLA (24h)',
        controlName: 'SCC Clause 15.1 Rapid Warrant Notification Addendum',
        category: 'Contractual Transparency & Gag-Order Alerting',
        severity: 'High',
        gapCausation: 'Exporters remain uninformed of foreign surveillance production orders due to statutory gag order compliance without prompt notification.',
        heuristicRationale: 'Standard Contractual Clauses 2021/914 Module 2/3 require prompt 24-hour notification or immediate legal challenge.',
        statutoryReference: 'EU SCCs 2021/914 Clause 15.1 & UK IDTA Part 2',
        suggestedAction: 'Amend master contract with Clause 15.1 rapid notification covenant and annual transparency reporting requirement.',
        implementationDetail: 'Contractual SLA: Mandatory 24-hour encrypted alerting to exporter DPO with bi-annual transparency summaries.',
        targetOwner: 'Commercial Contracting & Privacy Counsel',
        defaultSlaDays: 14,
        residualRiskScoreImpact: -14,
        pillarScoreImprovement: 22,
        blueprintSnippet: 'Contract Amendment -> 24h SLA Notice Trigger -> Encrypted DPO Alert Channel -> Immediate Pipe Pause',
        ...statusInfo
      });
    }

    // 7. Organizational: 12-Month Tested Stressed Exit & Data Repatriation Protocol
    if (!profile.testedStressedExitPlan) {
      const statusInfo = checkStatus('Stressed Exit & BCP Disaster Recovery Dry-Run', 'GAP-ORG-01');
      list.push({
        id: 'sug-org-stressed-exit',
        pillar: 'Organizational',
        title: 'Formulate & Validate 12-Month Tested Stressed Exit Protocol',
        controlName: 'Stressed Exit & BCP Disaster Recovery Dry-Run',
        category: 'Business Continuity & Operational Resilience',
        severity: profile.isMaterialOutsourcing ? 'Critical' : 'High',
        gapCausation: 'No validated multi-cloud or on-soil repatriation mechanism exists to ensure operational continuity within PRA impact tolerance.',
        heuristicRationale: 'PRA SS2/21 Chapter 10 requires annual tested stressed exit plans with complete data portability guarantees.',
        statutoryReference: 'PRA SS2/21 Chapter 10 & EBA Outsourcing Guidelines Section 16',
        suggestedAction: 'Author comprehensive Stressed Exit Playbook and execute annual dry-run cross-cloud failover simulation.',
        implementationDetail: 'Automated Terraform cross-cloud portability pipeline with 4-hour RTO and 15-minute RPO simulation.',
        targetOwner: 'Resilience Office & Site Reliability Engineering',
        defaultSlaDays: 60,
        residualRiskScoreImpact: -15,
        pillarScoreImprovement: 26,
        blueprintSnippet: 'IaC Multi-Cloud Manifest -> Cross-Cloud Automated Repatriation -> 4h RTO Validation Sandbox',
        ...statusInfo
      });
    }

    // 8. Organizational: Sub-processor Governance Register with 30-Day Exporter Veto SLA
    if (!profile.priorWrittenAuthRequiredForSubprocessors) {
      const statusInfo = checkStatus('Sub-Processor Chain-of-Custody & Audit Register', 'GAP-ORG-02');
      list.push({
        id: 'sug-org-subprocessor',
        pillar: 'Organizational',
        title: 'Establish Sub-processor Register with 30-Day Exporter Veto SLA',
        controlName: 'Sub-Processor Chain-of-Custody & Audit Register',
        category: 'Supply-Chain & 4th-Party Sub-Outsourcing Oversight',
        severity: 'High',
        gapCausation: '4th-party sub-processors can be engaged without exporter consent, transferring data to untested high-risk jurisdictions.',
        heuristicRationale: 'GDPR Article 28(2) and PRA SS2/21 Chapter 9 require specific prior written authorization and strict 30-day notice.',
        statutoryReference: 'GDPR Art 28(2) & PRA SS2/21 Chapter 9 (Sub-outsourcing)',
        suggestedAction: 'Institute automated sub-processor tracking register requiring 30-day written notice and binding exporter veto rights.',
        implementationDetail: 'Automated sub-processor notification portal with binding 30-day veto right and mandatory flow-down SCCs.',
        targetOwner: 'Vendor Risk Management & Third-Party Oversight',
        defaultSlaDays: 30,
        residualRiskScoreImpact: -10,
        pillarScoreImprovement: 18,
        blueprintSnippet: 'Sub-processor Intake Workflow -> 30-Day Notice Gateway -> Exporter Veto SLA -> Flow-down Audit Pass',
        ...statusInfo
      });
    }

    // 9. Technical / Special: Dual-Custodian Automated Revocation Circuit-Breaker
    if (['US', 'IN', 'SG', 'CN'].includes(profile.importerCountry)) {
      const statusInfo = checkStatus('Emergency Key Revocation & Ingestion Kill-Switch', 'sug-tech-killswitch');
      list.push({
        id: 'sug-tech-killswitch',
        pillar: 'Technical',
        title: 'Institute Automated Sovereign Key Revocation Circuit-Breaker',
        controlName: 'Emergency Key Revocation & Ingestion Kill-Switch',
        category: 'Emergency Revocation & Ingestion Suspension',
        severity: 'High',
        gapCausation: `Destination jurisdiction (${profile.importerCountry}) has statutory surveillance regimes with potential secret production orders.`,
        heuristicRationale: 'Allows the Data Exporter to instantly render all transferred data cryptographically inaccessible in the event of an unresolvable surveillance warrant.',
        statutoryReference: 'EDPB Recommendations 01/2020 Safeguard T4',
        suggestedAction: 'Deploy dual-authorized emergency zeroization webhook that drops cryptographic master keys within 60 seconds of trigger.',
        implementationDetail: 'Dual-authorized cryptographic zeroization API triggering immediate Master Key destruction across remote enclaves.',
        targetOwner: 'Chief Information Security Officer (CISO)',
        defaultSlaDays: 14,
        residualRiskScoreImpact: -14,
        pillarScoreImprovement: 24,
        blueprintSnippet: 'Multi-Sig Approval -> Zeroization API Call -> Instant Remote KMS Shredding -> Egress Pipeline Sever',
        ...statusInfo
      });
    }

    return list;
  }, [profile, localMeasures]);

  // Handle adopting a single suggested action
  const handleAdoptSuggestion = (sug: SuggestedActionItem) => {
    const existingIdx = localMeasures.findIndex(m => 
      m.id === sug.id || 
      m.controlName.toLowerCase().includes(sug.controlName.toLowerCase().slice(0, 15)) ||
      sug.controlName.toLowerCase().includes(m.controlName.toLowerCase().slice(0, 15))
    );

    if (existingIdx >= 0) {
      const updated = [...localMeasures];
      updated[existingIdx] = {
        ...updated[existingIdx],
        status: 'implemented'
      };
      setLocalMeasures(updated);
      if (onUpdateMeasureStatus) {
        onUpdateMeasureStatus(updated[existingIdx].id, 'implemented');
      }
    } else {
      const newMeasure: SupplementaryMeasure = {
        id: sug.id,
        pillar: sug.pillar,
        controlName: sug.controlName,
        description: sug.gapCausation,
        implementationDetail: sug.implementationDetail,
        edpbReference: sug.statutoryReference,
        status: 'implemented',
        riskMitigated: `Mitigates ${sug.severity.toLowerCase()} risk: ${sug.title}`,
        residualRisk: 'Low',
        assignedOwner: sug.targetOwner,
        targetCompletionDate: new Date(Date.now() + sug.defaultSlaDays * 86400000).toISOString().split('T')[0]
      };
      setLocalMeasures([newMeasure, ...localMeasures]);
      if (onUpdateMeasureStatus) {
        onUpdateMeasureStatus(newMeasure.id, 'implemented');
      }
    }

    setSuggestionFeedback(`Adopted & implemented control: "${sug.controlName}"!`);
    setTimeout(() => {
      setSuggestionFeedback(null);
    }, 4000);
  };

  // Handle adopting all suggestions in 1-click
  const handleAdoptAllSuggestions = () => {
    const unadopted = suggestedActions.filter(s => !s.isImplemented);
    if (unadopted.length === 0) return;

    let updated = [...localMeasures];
    unadopted.forEach(sug => {
      const existingIdx = updated.findIndex(m => 
        m.id === sug.id || 
        m.controlName.toLowerCase().includes(sug.controlName.toLowerCase().slice(0, 15)) ||
        sug.controlName.toLowerCase().includes(m.controlName.toLowerCase().slice(0, 15))
      );

      if (existingIdx >= 0) {
        updated[existingIdx] = {
          ...updated[existingIdx],
          status: 'implemented'
        };
        if (onUpdateMeasureStatus) {
          onUpdateMeasureStatus(updated[existingIdx].id, 'implemented');
        }
      } else {
        const newMeasure: SupplementaryMeasure = {
          id: sug.id,
          pillar: sug.pillar,
          controlName: sug.controlName,
          description: sug.gapCausation,
          implementationDetail: sug.implementationDetail,
          edpbReference: sug.statutoryReference,
          status: 'implemented',
          riskMitigated: `Mitigates ${sug.severity.toLowerCase()} risk: ${sug.title}`,
          residualRisk: 'Low',
          assignedOwner: sug.targetOwner,
          targetCompletionDate: new Date(Date.now() + sug.defaultSlaDays * 86400000).toISOString().split('T')[0]
        };
        updated = [newMeasure, ...updated];
        if (onUpdateMeasureStatus) {
          onUpdateMeasureStatus(newMeasure.id, 'implemented');
        }
      }
    });

    setLocalMeasures(updated);
    setSuggestionFeedback(`Successfully adopted all ${unadopted.length} suggested controls into the remediation plan!`);
    setTimeout(() => {
      setSuggestionFeedback(null);
    }, 4000);
  };

  // Dynamic recalculation of residual risk score
  const dynamicResidualScore = useMemo(() => {
    const baseScore = evaluation.overallRiskScore;
    const reductionPerItem = totalCount > 0 ? ((baseScore - 15) / totalCount) : 0;
    const currentScore = Math.max(12, Math.round(baseScore - (implementedCount * reductionPerItem)));
    return currentScore;
  }, [evaluation.overallRiskScore, totalCount, implementedCount]);

  // Chart Data: Radar chart for Safeguard Maturity
  const radarData = useMemo(() => {
    const techCompleted = localMeasures.filter(m => m.pillar === 'Technical' && m.status === 'implemented').length;
    const legalCompleted = localMeasures.filter(m => m.pillar === 'Legal' && m.status === 'implemented').length;
    const orgCompleted = localMeasures.filter(m => m.pillar === 'Organizational' && m.status === 'implemented').length;

    return [
      {
        subject: 'Key Custody (BYOK)',
        BaselineRisk: 85,
        CurrentState: profile.keyManagement === 'byok_local_hsm' ? 95 : 40 + (techCompleted * 10),
        TargetState: 95
      },
      {
        subject: 'Warrant Challenge',
        BaselineRisk: 90,
        CurrentState: profile.foreignWarrantChallengeCommitment ? 88 : 35 + (legalCompleted * 12),
        TargetState: 92
      },
      {
        subject: 'S165A Audit Rights',
        BaselineRisk: 75,
        CurrentState: profile.praDirectInspectionClause ? 90 : 30 + (legalCompleted * 10),
        TargetState: 95
      },
      {
        subject: 'Stressed Exit (12M)',
        BaselineRisk: 80,
        CurrentState: profile.testedStressedExitPlan ? 92 : 45 + (orgCompleted * 10),
        TargetState: 90
      },
      {
        subject: 'Subprocessor Chain',
        BaselineRisk: 70,
        CurrentState: profile.priorWrittenAuthRequiredForSubprocessors ? 85 : 35 + (orgCompleted * 8),
        TargetState: 90
      },
      {
        subject: 'Client-side Pseudonym',
        BaselineRisk: 80,
        CurrentState: profile.pseudonymizationPriorToTransfer ? 95 : 20 + (techCompleted * 15),
        TargetState: 95
      }
    ];
  }, [profile, localMeasures]);

  // Chart Data: Risk Burndown Curve
  const burndownData = useMemo(() => {
    return [
      { milestone: 'Initial TIA Audit', InherentRisk: 82, ResidualRisk: 82 },
      { milestone: 'Legal Addenda & SCCs', InherentRisk: 82, ResidualRisk: 64 },
      { milestone: 'HSM Key Vault (EEA)', InherentRisk: 82, ResidualRisk: 46 },
      { milestone: 'On-Soil Pseudonymization', InherentRisk: 82, ResidualRisk: 30 },
      { milestone: 'Stressed Exit Playbook', InherentRisk: 82, ResidualRisk: 22 },
      { milestone: 'Current Progress', InherentRisk: 82, ResidualRisk: dynamicResidualScore },
      { milestone: 'Target Sign-off', InherentRisk: 82, ResidualRisk: 14 }
    ];
  }, [dynamicResidualScore]);

  // Chart Data: PRA SS2/21 Chapter Breakdown (Chapters 6-10)
  const chapterData = useMemo(() => {
    return [
      { chapter: 'Ch 6: Agreements', Completed: 3, Pending: 1, Total: 4 },
      { chapter: 'Ch 7: Data Security', Completed: profile.keyManagement === 'byok_local_hsm' ? 4 : 2, Pending: profile.keyManagement === 'byok_local_hsm' ? 0 : 2, Total: 4 },
      { chapter: 'Ch 8: Audit & S165A', Completed: profile.praDirectInspectionClause ? 3 : 1, Pending: profile.praDirectInspectionClause ? 0 : 2, Total: 3 },
      { chapter: 'Ch 9: Sub-outsourcing', Completed: profile.priorWrittenAuthRequiredForSubprocessors ? 3 : 1, Pending: profile.priorWrittenAuthRequiredForSubprocessors ? 0 : 2, Total: 3 },
      { chapter: 'Ch 10: Exit & BCP', Completed: profile.testedStressedExitPlan ? 3 : 1, Pending: profile.testedStressedExitPlan ? 0 : 2, Total: 3 }
    ];
  }, [profile]);

  // Chart Data: Pillar Progress
  const pillarPieData = [
    { name: 'Technical (EDPB Use Cases)', value: localMeasures.filter(m => m.pillar === 'Technical').length, color: '#10B981' },
    { name: 'Legal / Contractual', value: localMeasures.filter(m => m.pillar === 'Legal').length, color: '#06B6D4' },
    { name: 'Organizational & BCP', value: localMeasures.filter(m => m.pillar === 'Organizational').length, color: '#8B5CF6' }
  ];

  // Filtered and Sorted Data Pipeline
  const filteredAndSortedMeasures = useMemo(() => {
    const now = Date.now();

    const filtered = localMeasures.filter(m => {
      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.controlName.toLowerCase().includes(q);
        const matchesDesc = m.description.toLowerCase().includes(q);
        const matchesEdpb = (m.edpbReference || '').toLowerCase().includes(q);
        const matchesOwner = (m.assignedOwner || '').toLowerCase().includes(q);
        const matchesDetail = (m.implementationDetail || '').toLowerCase().includes(q);
        const matchesRisk = (m.riskMitigated || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesEdpb && !matchesOwner && !matchesDetail && !matchesRisk) {
          return false;
        }
      }

      // Pillar Filter
      if (pillarFilter !== 'ALL' && m.pillar !== pillarFilter) {
        return false;
      }

      // Status Filter
      if (statusFilter !== 'ALL' && m.status !== statusFilter) {
        return false;
      }

      // Priority Filter
      if (priorityFilter !== 'ALL') {
        const pLabel = getPriorityLabel(m);
        if (pLabel !== priorityFilter) {
          return false;
        }
      }

      // Implementation / Target Date Filter
      if (dateFilter !== 'ALL') {
        const itemTs = parseDateToTimestamp(m.targetCompletionDate);
        if (dateFilter === 'OVERDUE') {
          if (m.status === 'implemented' || itemTs >= now) return false;
        } else if (dateFilter === 'DUE_30') {
          const in30Days = now + 30 * 86400000;
          if (itemTs < now || itemTs > in30Days) return false;
        } else if (dateFilter === 'DUE_90') {
          const in90Days = now + 90 * 86400000;
          if (itemTs < now || itemTs > in90Days) return false;
        } else if (dateFilter === 'IMPLEMENTED') {
          if (m.status !== 'implemented') return false;
        } else if (dateFilter === 'CUSTOM') {
          if (customStartDate) {
            const startTs = new Date(customStartDate).getTime();
            if (itemTs < startTs) return false;
          }
          if (customEndDate) {
            const endTs = new Date(customEndDate).getTime() + 86400000;
            if (itemTs > endTs) return false;
          }
        }
      }

      return true;
    });

    // Sort Pipeline
    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'controlName':
          comparison = a.controlName.localeCompare(b.controlName);
          break;
        case 'status': {
          const statusOrderMap = { recommended: 3, implemented: 2, waived_with_risk_acceptance: 1 };
          comparison = (statusOrderMap[a.status] || 0) - (statusOrderMap[b.status] || 0);
          break;
        }
        case 'priority': {
          const weightA = getPriorityWeight(a);
          const weightB = getPriorityWeight(b);
          comparison = weightA - weightB;
          break;
        }
        case 'targetDate': {
          const tsA = parseDateToTimestamp(a.targetCompletionDate);
          const tsB = parseDateToTimestamp(b.targetCompletionDate);
          comparison = tsA - tsB;
          break;
        }
        case 'pillar':
          comparison = a.pillar.localeCompare(b.pillar);
          break;
        case 'assignedOwner':
          comparison = (a.assignedOwner || '').localeCompare(b.assignedOwner || '');
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [localMeasures, searchQuery, pillarFilter, statusFilter, priorityFilter, dateFilter, customStartDate, customEndDate, sortField, sortOrder]);

  // Export filtered items as CSV
  const handleExportCsv = () => {
    const itemsToExport = selectedIds.length > 0 
      ? localMeasures.filter(m => selectedIds.includes(m.id))
      : filteredAndSortedMeasures;

    const headers = ["ID", "Control Name", "Pillar", "EDPB / PRA Reference", "Status", "Priority", "Residual Risk", "Owner", "Target Completion Date", "Implementation Blueprint"];
    const rows = itemsToExport.map(m => [
      `"${m.id}"`,
      `"${m.controlName.replace(/"/g, '""')}"`,
      `"${m.pillar}"`,
      `"${(m.edpbReference || '').replace(/"/g, '""')}"`,
      `"${m.status}"`,
      `"${getPriorityLabel(m)}"`,
      `"${m.residualRisk}"`,
      `"${(m.assignedOwner || '').replace(/"/g, '""')}"`,
      `"${formatTargetDate(m.targetCompletionDate).display}"`,
      `"${(m.implementationDetail || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Remediation_DataGrid_${profile.id}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Copy JSON Audit Summary to Clipboard
  const handleCopyJsonAudit = () => {
    const itemsToExport = selectedIds.length > 0 
      ? localMeasures.filter(m => selectedIds.includes(m.id))
      : filteredAndSortedMeasures;

    const auditPayload = {
      profileId: profile.id,
      timestamp: new Date().toISOString(),
      inherentRisk: evaluation.overallRiskScore,
      residualRisk: dynamicResidualScore,
      totalControls: itemsToExport.length,
      implementedControls: itemsToExport.filter(m => m.status === 'implemented').length,
      pendingControls: itemsToExport.filter(m => m.status === 'recommended').length,
      remediationMatrix: itemsToExport
    };

    navigator.clipboard.writeText(JSON.stringify(auditPayload, null, 2));
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  // Check if any filters are active
  const isAnyFilterActive = searchQuery || pillarFilter !== 'ALL' || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || dateFilter !== 'ALL';

  return (
    <div className="space-y-6 w-full mx-auto pb-16 font-mono text-[#D1D5DB]">
      {/* Top Banner & Header */}
      <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                Remediation & Risk Reduction Dashboard
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#1A1A1B] text-emerald-400 border border-emerald-500/30">
                  HIGH-DENSITY DATA GRID
                </span>
              </h2>
              <p className="text-xs text-[#71717A] mt-0.5">
                Multi-factor sorting, filtering, SLA milestone auditing & live PRA SS2/21 risk burndown calculation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Consolidated PDF Export */}
          <button
            id="btn-export-consolidated-pdf"
            onClick={() => handleOpenPdfExport('Consolidated')}
            className="px-3.5 py-1.5 text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.3)]"
            title="Export Consolidated 3-Pillar PDF Compliance Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Full PDF</span>
          </button>

          {/* Individual 3-Pillar PDF Exports */}
          <div className="flex items-center bg-[#141415] p-0.5 rounded border border-[#262626] gap-1">
            <button
              onClick={() => handleOpenPdfExport('Technical')}
              className="px-2 py-1 text-[11px] font-bold text-blue-400 hover:bg-[#1F1F21] rounded transition-colors flex items-center gap-1 cursor-pointer"
              title="Export Pillar I: Technical Protection PDF Report"
            >
              <KeyRound className="w-3 h-3" />
              <span>Tech PDF</span>
            </button>
            <button
              onClick={() => handleOpenPdfExport('Legal')}
              className="px-2 py-1 text-[11px] font-bold text-cyan-400 hover:bg-[#1F1F21] rounded transition-colors flex items-center gap-1 cursor-pointer"
              title="Export Pillar II: Legal Safeguards PDF Report"
            >
              <FileSignature className="w-3 h-3" />
              <span>Legal PDF</span>
            </button>
            <button
              onClick={() => handleOpenPdfExport('Organizational')}
              className="px-2 py-1 text-[11px] font-bold text-purple-400 hover:bg-[#1F1F21] rounded transition-colors flex items-center gap-1 cursor-pointer"
              title="Export Pillar III: Organizational Governance PDF Report"
            >
              <Users className="w-3 h-3" />
              <span>Org PDF</span>
            </button>
          </div>

          <button
            id="btn-add-action-item"
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Measure</span>
          </button>

          <button
            id="btn-export-csv"
            onClick={handleExportCsv}
            className="px-3 py-1.5 text-xs font-bold text-[#D1D5DB] bg-[#141415] hover:bg-[#1A1A1B] border border-[#262626] hover:border-[#3F3F46] rounded transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Export current filtered view to CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>CSV</span>
          </button>

          <button
            id="btn-copy-json"
            onClick={handleCopyJsonAudit}
            className="px-3 py-1.5 text-xs font-bold text-[#D1D5DB] bg-[#141415] hover:bg-[#1A1A1B] border border-[#262626] hover:border-[#3F3F46] rounded transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Copy audit log payload to clipboard"
          >
            {copiedNotification ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#71717A]" />
                <span>JSON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Telemetry Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-[#0F0F10] p-4 rounded border border-[#262626]">
          <span className="text-[10px] uppercase text-[#71717A] block font-bold">Total Remediation Steps</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-white">{totalCount}</span>
            <span className="text-xs text-[#71717A]">Controls</span>
          </div>
          <span className="text-[10px] text-cyan-400 mt-1 block">3-Pillar & PRA SS2/21</span>
        </div>

        <div className="bg-[#0F0F10] p-4 rounded border border-[#262626]">
          <span className="text-[10px] uppercase text-[#71717A] block font-bold">Implemented / Closed</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-400">{implementedCount}</span>
            <span className="text-xs text-[#71717A]">/ {totalCount}</span>
          </div>
          <div className="w-full bg-[#1A1A1B] h-1.5 rounded-full mt-2 overflow-hidden border border-[#262626]">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-[#0F0F10] p-4 rounded border border-[#262626]">
          <span className="text-[10px] uppercase text-[#71717A] block font-bold">Pending Actions</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-400">{pendingCount}</span>
            <span className="text-xs text-[#71717A]">Active items</span>
          </div>
          <span className="text-[10px] text-amber-400/80 mt-1 block">Requires Sign-off</span>
        </div>

        <div className="bg-[#0F0F10] p-4 rounded border border-[#262626]">
          <span className="text-[10px] uppercase text-[#71717A] block font-bold">Inherent Risk Score</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-rose-400">{evaluation.overallRiskScore}</span>
            <span className="text-xs text-[#71717A]">/ 100</span>
          </div>
          <span className="text-[10px] text-rose-400/80 mt-1 block">Pre-Mitigation Level</span>
        </div>

        <div className="bg-[#0F0F10] p-4 rounded border border-emerald-500/40 bg-emerald-950/20 col-span-2 lg:col-span-1">
          <span className="text-[10px] uppercase text-emerald-400 block font-bold">Live Residual Risk</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-300">{dynamicResidualScore}</span>
            <span className="text-xs text-emerald-400/80">/ 100</span>
          </div>
          <span className="text-[10px] text-emerald-400 mt-1 block flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            {dynamicResidualScore < 30 ? 'Low Risk (DPO Approving)' : 'Conditionally Mitigated'}
          </span>
        </div>
      </div>

      {/* THREE PILLARS PROGRESS METRICS & ACTIONS */}
      <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#262626] pb-3">
          <div>
            <h3 className="text-xs font-bold uppercase text-white tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Three-Pillar Safeguards Progress & Action Completion
            </h3>
            <p className="text-[11px] text-[#71717A] mt-0.5">
              Completion velocity across Technical (EDPB Use Cases 1-3), Legal/Contractual, and Organizational Governance (PRA SS2/21).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#141415] text-[#A1A1AA] border border-[#262626] font-mono">
              OVERALL: {completionPercentage}% COMPLETED ({implementedCount}/{totalCount})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* PILLAR 1: TECHNICAL PROTECTION */}
          <div className="bg-[#141415] rounded-lg border border-[#262626] hover:border-blue-500/50 p-4 transition-all space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded bg-blue-950/60 border border-blue-800/50 text-blue-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wide">Pillar I: Technical</h4>
                  <p className="text-[10px] text-[#71717A]">EDPB 01/2020 & BYOK Key Vault</p>
                </div>
              </div>
              <button
                onClick={() => handleOpenPdfExport('Technical')}
                className="p-1 rounded text-[#71717A] hover:text-blue-400 hover:bg-[#1F1F21] transition-colors cursor-pointer"
                title="Export Pillar I Technical PDF Report"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-mono text-2xl font-bold text-blue-400">{pillarStats.technical.percentage}%</span>
                <span className="text-[11px] text-[#A1A1AA] font-mono">
                  {pillarStats.technical.completed} of {pillarStats.technical.total} tasks
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#1A1A1B] h-2 rounded-full overflow-hidden border border-[#262626]">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                  style={{ width: `${pillarStats.technical.percentage}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#1F1F21] text-[10px]">
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/30">
                  {pillarStats.technical.completed} Done
                </span>
                <span className="text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/30">
                  {pillarStats.technical.pending} Pending
                </span>
                {pillarStats.technical.waived > 0 && (
                  <span className="text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-700/30">
                    {pillarStats.technical.waived} Waived
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setPillarFilter('Technical');
                  setSearchQuery('');
                }}
                className="text-[10px] text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
              >
                Filter Grid
              </button>
            </div>
          </div>

          {/* PILLAR 2: LEGAL & CONTRACTUAL SAFEGUARDS */}
          <div className="bg-[#141415] rounded-lg border border-[#262626] hover:border-cyan-500/50 p-4 transition-all space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
                  <FileSignature className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wide">Pillar II: Legal</h4>
                  <p className="text-[10px] text-[#71717A]">SCCs 2021/914 & Warrant Clauses</p>
                </div>
              </div>
              <button
                onClick={() => handleOpenPdfExport('Legal')}
                className="p-1 rounded text-[#71717A] hover:text-cyan-400 hover:bg-[#1F1F21] transition-colors cursor-pointer"
                title="Export Pillar II Legal Safeguards PDF Report"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-mono text-2xl font-bold text-cyan-400">{pillarStats.legal.percentage}%</span>
                <span className="text-[11px] text-[#A1A1AA] font-mono">
                  {pillarStats.legal.completed} of {pillarStats.legal.total} tasks
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#1A1A1B] h-2 rounded-full overflow-hidden border border-[#262626]">
                <div 
                  className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                  style={{ width: `${pillarStats.legal.percentage}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#1F1F21] text-[10px]">
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/30">
                  {pillarStats.legal.completed} Done
                </span>
                <span className="text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/30">
                  {pillarStats.legal.pending} Pending
                </span>
                {pillarStats.legal.waived > 0 && (
                  <span className="text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-700/30">
                    {pillarStats.legal.waived} Waived
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setPillarFilter('Legal');
                  setSearchQuery('');
                }}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-medium cursor-pointer"
              >
                Filter Grid
              </button>
            </div>
          </div>

          {/* PILLAR 3: ORGANIZATIONAL GOVERNANCE & BCP */}
          <div className="bg-[#141415] rounded-lg border border-[#262626] hover:border-purple-500/50 p-4 transition-all space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded bg-purple-950/60 border border-purple-800/50 text-purple-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wide">Pillar III: Organizational</h4>
                  <p className="text-[10px] text-[#71717A]">PRA SS2/21 BCP & Sub-Outsourcing</p>
                </div>
              </div>
              <button
                onClick={() => handleOpenPdfExport('Organizational')}
                className="p-1 rounded text-[#71717A] hover:text-purple-400 hover:bg-[#1F1F21] transition-colors cursor-pointer"
                title="Export Pillar III Organizational PDF Report"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-mono text-2xl font-bold text-purple-400">{pillarStats.organizational.percentage}%</span>
                <span className="text-[11px] text-[#A1A1AA] font-mono">
                  {pillarStats.organizational.completed} of {pillarStats.organizational.total} tasks
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#1A1A1B] h-2 rounded-full overflow-hidden border border-[#262626]">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-purple-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(139,92,246,0.4)]"
                  style={{ width: `${pillarStats.organizational.percentage}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#1F1F21] text-[10px]">
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/30">
                  {pillarStats.organizational.completed} Done
                </span>
                <span className="text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/30">
                  {pillarStats.organizational.pending} Pending
                </span>
                {pillarStats.organizational.waived > 0 && (
                  <span className="text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-700/30">
                    {pillarStats.organizational.waived} Waived
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setPillarFilter('Organizational');
                  setSearchQuery('');
                }}
                className="text-[10px] text-purple-400 hover:text-purple-300 underline font-medium cursor-pointer"
              >
                Filter Grid
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SIMULATED INTELLIGENCE HEURISTIC SUGGESTED ACTIONS PANEL */}
      {/* ========================================================================= */}
      <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-5 shadow-sm space-y-4">
        {/* Panel Header & Summary Telemetry */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#262626] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-emerald-950/70 border border-emerald-700/50 text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold uppercase text-white tracking-wider flex items-center gap-2">
                Suggested Actions Engine
                <span className="text-[10px] normal-case font-normal px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                  Cognitive Gap-to-Control Heuristic
                </span>
              </h3>
            </div>
            <p className="text-xs text-[#A1A1AA]">
              Inference heuristic mapping detected jurisdiction surveillance laws, key escrow vulnerabilities, and PRA SS2/21 deficits to high-impact technical, legal, and operational controls.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-[#141415] border border-[#262626] rounded-lg px-3 py-1.5 text-xs font-mono">
              <span className="text-[#71717A]">Gaps Detected:</span>
              <span className="text-amber-400 font-bold">{suggestedActions.length}</span>
              <span className="text-[#3F3F46]">|</span>
              <span className="text-[#71717A]">Pending:</span>
              <span className="text-rose-400 font-bold">{suggestedActions.filter(s => !s.isImplemented).length}</span>
            </div>

            {suggestedActions.some(s => !s.isImplemented) && (
              <button
                onClick={handleAdoptAllSuggestions}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                title="Adopt all suggested remediation controls with 1 click"
              >
                <Zap className="w-3.5 h-3.5" />
                Adopt All Suggestions ({suggestedActions.filter(s => !s.isImplemented).length})
              </button>
            )}
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {suggestionFeedback && (
          <div className="flex items-center gap-2.5 bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 px-4 py-2.5 rounded-lg text-xs font-medium animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{suggestionFeedback}</span>
          </div>
        )}

        {/* Filter Tabs by Pillar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 bg-[#141415] rounded-lg border border-[#262626] p-1 text-xs">
            {(['ALL', 'Technical', 'Legal', 'Organizational'] as const).map((pillar) => {
              const count = pillar === 'ALL' 
                ? suggestedActions.length 
                : suggestedActions.filter(s => s.pillar === pillar).length;
              
              const isSelected = suggestedPillarFilter === pillar;
              
              return (
                <button
                  key={pillar}
                  onClick={() => setSuggestedPillarFilter(pillar)}
                  className={`px-3 py-1 rounded font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isSelected 
                      ? 'bg-[#1F1F21] text-white shadow-xs' 
                      : 'text-[#71717A] hover:text-[#D1D5DB]'
                  }`}
                >
                  <span>{pillar === 'ALL' ? 'All Gaps & Controls' : pillar}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-emerald-950 text-emerald-400' : 'bg-[#262626] text-[#A1A1AA]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-[#71717A] flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Heuristic prioritizes Critical EDPB & PRA Chapter 8 regulatory mandates</span>
          </div>
        </div>

        {/* Suggestions List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
          {suggestedActions
            .filter(sug => suggestedPillarFilter === 'ALL' || sug.pillar === suggestedPillarFilter)
            .map((sug) => {
              const isExpanded = expandedSuggestionIds.includes(sug.id);

              return (
                <div 
                  key={sug.id}
                  className={`rounded-xl border transition-all p-4 space-y-3 flex flex-col justify-between ${
                    sug.isImplemented 
                      ? 'bg-[#121614] border-emerald-900/40 hover:border-emerald-800/60' 
                      : 'bg-[#141415] border-[#262626] hover:border-[#3F3F46]'
                  }`}
                >
                  {/* Top Metadata Strip */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Pillar Tag */}
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider font-mono border ${
                          sug.pillar === 'Technical'
                            ? 'bg-blue-950/60 text-blue-400 border-blue-800/40'
                            : sug.pillar === 'Legal'
                            ? 'bg-cyan-950/60 text-cyan-400 border-cyan-800/40'
                            : 'bg-purple-950/60 text-purple-400 border-purple-800/40'
                        }`}>
                          {sug.pillar}
                        </span>

                        {/* Severity */}
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono border ${
                          sug.severity === 'Critical'
                            ? 'bg-rose-950/60 text-rose-400 border-rose-800/40'
                            : sug.severity === 'High'
                            ? 'bg-amber-950/60 text-amber-400 border-amber-800/40'
                            : 'bg-yellow-950/60 text-yellow-400 border-yellow-800/40'
                        }`}>
                          {sug.severity} Deficit
                        </span>

                        {/* Impact Pill */}
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/30 font-mono font-bold">
                          Risk {sug.residualRiskScoreImpact} pts
                        </span>
                      </div>

                      {/* Implementation Status Pill */}
                      {sug.isImplemented ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50 font-mono shrink-0">
                          <CheckCircle2 className="w-3 h-3" /> Implemented
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/40 font-mono shrink-0">
                          <Clock className="w-3 h-3" /> Action Needed
                        </span>
                      )}
                    </div>

                    {/* Action Title */}
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug">
                      {sug.title}
                    </h4>

                    {/* Gap Causation */}
                    <div className="p-2.5 rounded bg-[#0A0A0B] border border-[#1F1F21] space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-400">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Identified Gap / Exposure:</span>
                      </div>
                      <p className="text-xs text-[#A1A1AA] leading-relaxed">
                        {sug.gapCausation}
                      </p>
                    </div>

                    {/* Heuristic Rationale */}
                    <div className="text-xs text-[#D1D5DB] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#71717A] tracking-wider block">
                        Heuristic Recommendation:
                      </span>
                      <p className="text-xs text-[#E4E4E7] leading-relaxed">
                        {sug.suggestedAction}
                      </p>
                    </div>

                    {/* Target Owner & Statutory Reference */}
                    <div className="flex flex-wrap items-center justify-between text-[10px] text-[#71717A] gap-2 pt-1">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-[#A1A1AA]" />
                        <span>Owner: <strong className="text-[#D1D5DB]">{sug.targetOwner}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono">
                        <Calendar className="w-3 h-3 text-[#A1A1AA]" />
                        <span>SLA: <strong className="text-cyan-400">{sug.defaultSlaDays} Days</strong></span>
                      </div>
                    </div>

                    {/* Expanded Blueprint Details */}
                    {isExpanded && (
                      <div className="mt-3 p-3 rounded-lg bg-[#0D0D0E] border border-[#262626] space-y-2 text-xs animate-fadeIn">
                        <div>
                          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                            Legal & Statutory Precedent
                          </span>
                          <p className="text-[11px] text-[#A1A1AA] font-mono">
                            {sug.statutoryReference}
                          </p>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                            Technical & Contractual Architecture Blueprint
                          </span>
                          <p className="text-[11px] text-[#D1D5DB] leading-relaxed">
                            {sug.implementationDetail}
                          </p>
                        </div>

                        <div className="bg-[#050505] p-2 rounded border border-[#1F1F21] font-mono text-[10px] text-emerald-300 overflow-x-auto">
                          {sug.blueprintSnippet}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA Strip */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#1F1F21] gap-2">
                    <button
                      onClick={() => toggleSuggestionExpand(sug.id)}
                      className="text-[11px] text-[#A1A1AA] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Hide Blueprint</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>View Blueprint & Precedent</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      {sug.isImplemented ? (
                        <button
                          disabled
                          className="px-3 py-1.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 rounded-lg text-xs font-bold flex items-center gap-1.5 opacity-90 cursor-default"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Active in Plan
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAdoptSuggestion(sug)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                          title="Adopt this specific control into the Remediation Plan"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Adopt Control
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* GRAPHS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRAPH 1: Residual Risk & Safeguard Maturity Radar */}
        <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#262626] pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase text-white tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Safeguard Maturity & Surveillance Shielding
              </h3>
              <p className="text-[10px] text-[#71717A]">
                Comparison between Baseline Inherent Exposure vs Post-Remediation Controls.
              </p>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#141415] text-emerald-400 border border-[#262626]">
              POLAR GRID
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#262626" />
                <PolarAngleAxis dataKey="subject" stroke="#71717A" tick={{ fill: '#A1A1AA', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#262626" tick={{ fill: '#52525B', fontSize: 9 }} />
                <Radar name="Baseline Exposure" dataKey="BaselineRisk" stroke="#F43F5E" fill="#F43F5E" fillOpacity={0.15} />
                <Radar name="Current Implemented State" dataKey="CurrentState" stroke="#10B981" fill="#10B981" fillOpacity={0.4} />
                <Radar name="Target Compliant State" dataKey="TargetState" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.1} />
                <Legend 
                  wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} 
                  formatter={(value) => <span className="text-[#D1D5DB]">{value}</span>}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F0F10', borderColor: '#262626', fontSize: '11px', borderRadius: '6px', color: '#FFF' }} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 2: Risk Burndown & Remediation Timeline */}
        <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#262626] pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase text-white tracking-wider flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-cyan-400" />
                Risk Burndown & Milestone Trajectory
              </h3>
              <p className="text-[10px] text-[#71717A]">
                Projected risk decay from initial assessment to final regulatory sign-off.
              </p>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#141415] text-cyan-400 border border-[#262626]">
              BURNDOWN CURVE
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={burndownData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="milestone" stroke="#71717A" tick={{ fill: '#71717A', fontSize: 9 }} interval={0} angle={-15} textAnchor="end" height={45} />
                <YAxis stroke="#71717A" tick={{ fill: '#71717A', fontSize: 10 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0F0F10', borderColor: '#262626', fontSize: '11px', borderRadius: '6px', color: '#FFF' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} formatter={(value) => <span className="text-[#D1D5DB]">{value}</span>} />
                <Line type="monotone" dataKey="InherentRisk" stroke="#F43F5E" strokeDasharray="4 4" strokeWidth={2} name="Unmitigated Inherent Risk" />
                <Area type="monotone" dataKey="ResidualRisk" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#riskGrad)" name="Remediated Residual Risk" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HIGH-DENSITY REMEDIATION DATA GRID COMPONENT */}
      {/* ========================================================================= */}
      <div className="bg-[#0F0F10] rounded-xl border border-[#262626] shadow-sm space-y-4 overflow-hidden">
        
        {/* Data Grid Header & Quick Presets */}
        <div className="p-5 border-b border-[#262626] space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Table className="w-4 h-4 text-emerald-400" />
                  Remediation Controls Data Grid
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#141415] text-[#A1A1AA] border border-[#262626] font-mono">
                  {filteredAndSortedMeasures.length} of {localMeasures.length} CONTROLS
                </span>
              </div>
              <p className="text-xs text-[#71717A] mt-0.5">
                High-density compliance matrix with column sorting, status toggles, and implementation SLA tracking.
              </p>
            </div>

            {/* Density & View Mode Controls */}
            <div className="flex items-center gap-2 self-stretch lg:self-auto justify-end">
              {/* Density Mode */}
              <div className="flex items-center bg-[#141415] rounded border border-[#262626] p-0.5 text-[10px]">
                {(['compact', 'standard', 'comfortable'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setGridDensity(d)}
                    className={`px-2 py-1 uppercase font-bold rounded transition-colors cursor-pointer ${
                      gridDensity === d 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50' 
                        : 'text-[#71717A] hover:text-[#D1D5DB]'
                    }`}
                    title={`Set grid density to ${d}`}
                  >
                    {d === 'compact' ? 'Compact' : d === 'standard' ? 'Std' : 'Comfort'}
                  </button>
                ))}
              </div>

              {/* View Switcher */}
              <div className="flex items-center bg-[#141415] rounded border border-[#262626] p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-[#1F1F21] text-emerald-400' : 'text-[#71717A] hover:text-[#D1D5DB]'
                  }`}
                  title="Table Data Grid View"
                >
                  <Table className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${
                    viewMode === 'cards' ? 'bg-[#1F1F21] text-emerald-400' : 'text-[#71717A] hover:text-[#D1D5DB]'
                  }`}
                  title="Card List View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Preset Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-[#71717A] uppercase font-bold mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Presets:
            </span>
            {[
              { id: 'ALL', label: 'All Items' },
              { id: 'OVERDUE', label: '🚨 Overdue Pending' },
              { id: 'CRITICAL_TECH', label: '⚡ Critical Technical' },
              { id: 'LEGAL_WARRANTS', label: '⚖️ Legal & Warrants' },
              { id: 'PRA_MATERIAL', label: '🏛️ PRA SS2/21 Mapped' },
              { id: 'IMPLEMENTED', label: '✅ Implemented' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => handleApplyPreset(p.id)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-full border transition-colors cursor-pointer ${
                  activePreset === p.id 
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
                    : 'bg-[#141415] text-[#A1A1AA] border-[#262626] hover:border-[#3F3F46] hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Multi-Faceted Filter Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2">
            {/* Search Input */}
            <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
              <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-2.5 top-2.5" />
              <input
                id="search-remediation-grid"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActivePreset('CUSTOM');
                }}
                placeholder="Search controls, owner, EDPB..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#080809] border border-[#262626] rounded text-[#D1D5DB] placeholder-[#52525B] focus:border-emerald-500 focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-[#71717A] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div>
              <select
                id="filter-status-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setActivePreset('CUSTOM');
                }}
                className="w-full py-1.5 px-2.5 text-xs bg-[#080809] border border-[#262626] rounded text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">Status: All</option>
                <option value="recommended">Status: Pending Remediation</option>
                <option value="implemented">Status: Implemented & Verified</option>
                <option value="waived_with_risk_acceptance">Status: Waived / Formal Acceptance</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                id="filter-priority-select"
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value as any);
                  setActivePreset('CUSTOM');
                }}
                className="w-full py-1.5 px-2.5 text-xs bg-[#080809] border border-[#262626] rounded text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">Priority: All</option>
                <option value="Critical">Priority: Critical</option>
                <option value="High">Priority: High</option>
                <option value="Medium">Priority: Medium</option>
                <option value="Low">Priority: Low</option>
              </select>
            </div>

            {/* Implementation / Target Date Filter */}
            <div>
              <select
                id="filter-date-select"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value as any);
                  setActivePreset('CUSTOM');
                }}
                className="w-full py-1.5 px-2.5 text-xs bg-[#080809] border border-[#262626] rounded text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">Date: All Deadlines</option>
                <option value="OVERDUE">🚨 Overdue SLA</option>
                <option value="DUE_30">Due in &lt; 30 Days</option>
                <option value="DUE_90">Due in &lt; 90 Days</option>
                <option value="IMPLEMENTED">Completed / Closed</option>
                <option value="CUSTOM">Custom Date Range...</option>
              </select>
            </div>

            {/* Pillar Filter & Clear */}
            <div className="flex items-center gap-1.5">
              <select
                id="filter-pillar-select"
                value={pillarFilter}
                onChange={(e) => {
                  setPillarFilter(e.target.value as any);
                  setActivePreset('CUSTOM');
                }}
                className="flex-1 py-1.5 px-2.5 text-xs bg-[#080809] border border-[#262626] rounded text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">Pillar: All</option>
                <option value="Technical">Technical (EDPB)</option>
                <option value="Legal">Legal (Contract)</option>
                <option value="Organizational">Organizational</option>
              </select>

              {isAnyFilterActive && (
                <button
                  onClick={handleResetFilters}
                  className="px-2 py-1.5 text-xs text-[#71717A] hover:text-white bg-[#141415] border border-[#262626] hover:border-[#3F3F46] rounded transition-colors"
                  title="Reset all filters"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Custom Date Range Picker Sub-row */}
          {dateFilter === 'CUSTOM' && (
            <div className="flex items-center gap-3 bg-[#080809] p-2.5 rounded border border-[#262626] text-xs">
              <span className="text-[10px] uppercase font-bold text-[#71717A] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Range:
              </span>
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-[#71717A]">From:</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="p-1 bg-[#141415] border border-[#262626] rounded text-[#D1D5DB] text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-[#71717A]">To:</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="p-1 bg-[#141415] border border-[#262626] rounded text-[#D1D5DB] text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions Floating Bar */}
        {selectedIds.length > 0 && (
          <div className="mx-5 p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-white">{selectedIds.length} item(s) selected</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleBulkStatusChange('implemented')}
                className="px-2.5 py-1 text-[11px] font-bold bg-emerald-700 hover:bg-emerald-600 text-white rounded transition-colors cursor-pointer flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Mark Implemented</span>
              </button>

              <button
                onClick={() => handleBulkStatusChange('recommended')}
                className="px-2.5 py-1 text-[11px] font-bold bg-amber-800 hover:bg-amber-700 text-white rounded transition-colors cursor-pointer flex items-center gap-1"
              >
                <Clock className="w-3 h-3" />
                <span>Mark Pending</span>
              </button>

              <button
                onClick={() => handleBulkStatusChange('waived_with_risk_acceptance')}
                className="px-2.5 py-1 text-[11px] font-bold bg-[#1F1F21] hover:bg-[#2A2A2D] text-[#D1D5DB] border border-[#333336] rounded transition-colors cursor-pointer"
              >
                Mark Waived
              </button>

              <button
                onClick={handleExportCsv}
                className="px-2.5 py-1 text-[11px] font-bold bg-[#141415] hover:bg-[#1A1A1B] text-cyan-400 border border-[#262626] rounded transition-colors cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>Export ({selectedIds.length})</span>
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="text-[11px] text-[#71717A] hover:text-white ml-2 underline cursor-pointer"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: HIGH-DENSITY DATA GRID (TABLE) */}
        {/* ========================================================================= */}
        {viewMode === 'grid' ? (
          <div className="overflow-x-auto border-t border-[#262626]">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-[#080809] border-b border-[#262626] text-[10px] uppercase text-[#71717A] font-bold tracking-wider select-none sticky top-0 z-10">
                  {/* Select Checkbox */}
                  <th className="p-3 w-10 text-center">
                    <button
                      onClick={() => handleSelectAll(filteredAndSortedMeasures)}
                      className="cursor-pointer text-[#71717A] hover:text-white"
                      title="Select / Deselect all visible items"
                    >
                      {selectedIds.length > 0 && selectedIds.length === filteredAndSortedMeasures.length ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>

                  {/* Status Column (Sortable) */}
                  <th 
                    onClick={() => handleHeaderSort('status')}
                    className="p-3 cursor-pointer hover:text-white transition-colors w-40"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Status</span>
                      {sortField === 'status' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-400" /> : <ArrowDown className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-[#3F3F46]" />
                      )}
                    </div>
                  </th>

                  {/* Priority Column (Sortable) */}
                  <th 
                    onClick={() => handleHeaderSort('priority')}
                    className="p-3 cursor-pointer hover:text-white transition-colors w-28"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Priority</span>
                      {sortField === 'priority' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-400" /> : <ArrowDown className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-[#3F3F46]" />
                      )}
                    </div>
                  </th>

                  {/* Control Title & Reference (Sortable) */}
                  <th 
                    onClick={() => handleHeaderSort('controlName')}
                    className="p-3 cursor-pointer hover:text-white transition-colors min-w-[260px]"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Control Measure & EDPB Reference</span>
                      {sortField === 'controlName' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-400" /> : <ArrowDown className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-[#3F3F46]" />
                      )}
                    </div>
                  </th>

                  {/* Pillar (Sortable) */}
                  <th 
                    onClick={() => handleHeaderSort('pillar')}
                    className="p-3 cursor-pointer hover:text-white transition-colors w-32"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Pillar Domain</span>
                      {sortField === 'pillar' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-400" /> : <ArrowDown className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-[#3F3F46]" />
                      )}
                    </div>
                  </th>

                  {/* Implementation / Target Date (Sortable) */}
                  <th 
                    onClick={() => handleHeaderSort('targetDate')}
                    className="p-3 cursor-pointer hover:text-white transition-colors w-36"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Target SLA Date</span>
                      {sortField === 'targetDate' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-400" /> : <ArrowDown className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-[#3F3F46]" />
                      )}
                    </div>
                  </th>

                  {/* Assigned Owner (Sortable) */}
                  <th 
                    onClick={() => handleHeaderSort('assignedOwner')}
                    className="p-3 cursor-pointer hover:text-white transition-colors w-36"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Assigned Owner</span>
                      {sortField === 'assignedOwner' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-400" /> : <ArrowDown className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-[#3F3F46]" />
                      )}
                    </div>
                  </th>

                  {/* Actions Column */}
                  <th className="p-3 w-16 text-right">Details</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#1A1A1B]">
                {filteredAndSortedMeasures.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-[#71717A] bg-[#0A0A0B]">
                      <div className="max-w-md mx-auto space-y-2">
                        <AlertCircle className="w-6 h-6 text-[#52525B] mx-auto" />
                        <p className="font-bold text-white">No remediation items match the active filters.</p>
                        <p className="text-[11px]">Try adjusting your search query, status, priority, or date filters.</p>
                        <button
                          onClick={handleResetFilters}
                          className="mt-2 px-3 py-1 bg-[#141415] hover:bg-[#1A1A1B] text-emerald-400 border border-[#262626] rounded text-xs"
                        >
                          Reset Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedMeasures.map((measure, idx) => {
                    const isSelected = selectedIds.includes(measure.id);
                    const isExpanded = expandedActionId === measure.id;
                    const isDone = measure.status === 'implemented';
                    const isWaived = measure.status === 'waived_with_risk_acceptance';
                    const priorityLabel = getPriorityLabel(measure);
                    const dateInfo = formatTargetDate(measure.targetCompletionDate);

                    // Row Padding based on gridDensity
                    const rowPadding = gridDensity === 'compact' ? 'py-1.5 px-3' : gridDensity === 'standard' ? 'py-2.5 px-3' : 'py-4 px-3';

                    return (
                      <React.Fragment key={measure.id}>
                        <tr 
                          className={`transition-colors group ${
                            isSelected 
                              ? 'bg-emerald-950/30' 
                              : isDone 
                                ? 'bg-[#0B100E]/40 hover:bg-[#0E1613]' 
                                : idx % 2 === 0 
                                  ? 'bg-[#0F0F10] hover:bg-[#141416]' 
                                  : 'bg-[#0B0B0C] hover:bg-[#141416]'
                          }`}
                        >
                          {/* Row Checkbox */}
                          <td className={`${rowPadding} text-center`}>
                            <button
                              onClick={() => handleToggleSelectRow(measure.id)}
                              className="cursor-pointer text-[#71717A] hover:text-white"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-[#3F3F46] group-hover:text-[#71717A]" />
                              )}
                            </button>
                          </td>

                          {/* Status Select / Indicator */}
                          <td className={rowPadding}>
                            <select
                              value={measure.status}
                              onChange={(e) => handleStatusChange(measure.id, e.target.value as any)}
                              className={`text-[11px] font-mono rounded px-2 py-0.5 font-bold border focus:outline-hidden cursor-pointer transition-colors ${
                                isDone 
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600/70 hover:bg-emerald-900' 
                                  : isWaived
                                    ? 'bg-[#1A1A1B] text-[#71717A] border-[#333336] hover:bg-[#222225]'
                                    : 'bg-amber-950/80 text-amber-300 border-amber-600/70 hover:bg-amber-900'
                              }`}
                            >
                              <option value="recommended">⏳ Pending</option>
                              <option value="implemented">✅ Implemented</option>
                              <option value="waived_with_risk_acceptance">⚪ Waived</option>
                            </select>
                          </td>

                          {/* Priority Badge */}
                          <td className={rowPadding}>
                            <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              priorityLabel === 'Critical' 
                                ? 'bg-rose-950/80 text-rose-300 border border-rose-700/60' 
                                : priorityLabel === 'High'
                                  ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                                  : priorityLabel === 'Medium'
                                    ? 'bg-sky-950/80 text-sky-300 border border-sky-700/60'
                                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                priorityLabel === 'Critical' ? 'bg-rose-400 animate-pulse' :
                                priorityLabel === 'High' ? 'bg-amber-400' :
                                priorityLabel === 'Medium' ? 'bg-sky-400' : 'bg-emerald-400'
                              }`}></span>
                              {priorityLabel}
                            </span>
                          </td>

                          {/* Control Title & EDPB reference */}
                          <td className={rowPadding}>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className={`font-semibold text-xs ${isDone ? 'text-[#D1D5DB]' : 'text-white'}`}>
                                  {measure.controlName}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-[#71717A]">
                                <span className="text-cyan-400/90 font-mono">{measure.edpbReference || 'EDPB 01/2020'}</span>
                                <span>•</span>
                                <span className="truncate max-w-[320px] text-[#A1A1AA]">{measure.description}</span>
                              </div>
                            </div>
                          </td>

                          {/* Pillar Domain */}
                          <td className={rowPadding}>
                            <span className={`inline-block text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                              measure.pillar === 'Technical' 
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-700/40' 
                                : measure.pillar === 'Legal' 
                                  ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-700/40' 
                                  : 'bg-purple-950/60 text-purple-400 border border-purple-700/40'
                            }`}>
                              {measure.pillar}
                            </span>
                          </td>

                          {/* Target SLA Date */}
                          <td className={rowPadding}>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 text-[11px] font-mono text-[#D1D5DB]">
                                <Calendar className="w-3 h-3 text-[#71717A]" />
                                <span>{dateInfo.display}</span>
                              </div>
                              {measure.status !== 'implemented' && (
                                <div className="text-[9px]">
                                  {dateInfo.isOverdue ? (
                                    <span className="text-rose-400 font-bold flex items-center gap-0.5">
                                      <AlertTriangle className="w-2.5 h-2.5" /> Overdue ({Math.abs(dateInfo.daysRemaining || 0)}d)
                                    </span>
                                  ) : dateInfo.daysRemaining !== null ? (
                                    <span className={dateInfo.daysRemaining <= 30 ? 'text-amber-400' : 'text-[#71717A]'}>
                                      Due in {dateInfo.daysRemaining} days
                                    </span>
                                  ) : null}
                                </div>
                              )}
                              {measure.status === 'implemented' && (
                                <span className="text-[9px] text-emerald-400/80">Completed</span>
                              )}
                            </div>
                          </td>

                          {/* Assigned Owner */}
                          <td className={rowPadding}>
                            <div className="flex items-center gap-1.5 text-[11px] text-[#A1A1AA]">
                              <User className="w-3 h-3 text-[#52525B]" />
                              <span className="truncate max-w-[120px]">{measure.assignedOwner || 'SecOps / DPO'}</span>
                            </div>
                          </td>

                          {/* Row Details Expansion Toggle */}
                          <td className={`${rowPadding} text-right`}>
                            <button
                              onClick={() => setExpandedActionId(isExpanded ? null : measure.id)}
                              className={`p-1 rounded transition-colors cursor-pointer ${
                                isExpanded ? 'bg-emerald-950 text-emerald-400' : 'text-[#71717A] hover:text-white hover:bg-[#1F1F21]'
                              }`}
                              title="Toggle Technical Implementation Specifications"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Drawer Details */}
                        {isExpanded && (
                          <tr className="bg-[#070708] border-b border-[#262626]">
                            <td colSpan={8} className="p-4 space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                                <div className="bg-[#121214] p-3 rounded border border-[#262626]">
                                  <span className="text-[9px] uppercase text-[#71717A] block font-bold">Control Identifier</span>
                                  <span className="font-mono text-emerald-400 mt-0.5 block">{measure.id}</span>
                                </div>
                                <div className="bg-[#121214] p-3 rounded border border-[#262626]">
                                  <span className="text-[9px] uppercase text-[#71717A] block font-bold">Assigned Stakeholders</span>
                                  <span className="text-white mt-0.5 block">{measure.assignedOwner || 'DPO & SecOps'}</span>
                                </div>
                                <div className="bg-[#121214] p-3 rounded border border-[#262626]">
                                  <span className="text-[9px] uppercase text-[#71717A] block font-bold">Risk Mitigated</span>
                                  <span className="text-cyan-400 mt-0.5 block">{measure.riskMitigated}</span>
                                </div>
                                <div className="bg-[#121214] p-3 rounded border border-[#262626]">
                                  <span className="text-[9px] uppercase text-[#71717A] block font-bold">Residual Risk Level</span>
                                  <span className="text-emerald-400 mt-0.5 block font-bold">{measure.residualRisk}</span>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[10px] uppercase text-emerald-400 block font-bold">
                                  Technical & Contractual Implementation Blueprint:
                                </span>
                                <div className="p-3.5 rounded bg-[#121214] border border-[#262626] text-[#A1A1AA] text-xs leading-relaxed">
                                  {measure.implementationDetail}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: CARD LIST VIEW */
          /* ========================================================================= */
          <div className="p-5 space-y-3 border-t border-[#262626]">
            {filteredAndSortedMeasures.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#71717A] bg-[#141415] rounded border border-[#262626]">
                No remediation items matching current filter criteria.
              </div>
            ) : (
              filteredAndSortedMeasures.map((measure) => {
                const isExpanded = expandedActionId === measure.id;
                const isDone = measure.status === 'implemented';
                const isWaived = measure.status === 'waived_with_risk_acceptance';
                const priorityLabel = getPriorityLabel(measure);
                const dateInfo = formatTargetDate(measure.targetCompletionDate);

                return (
                  <div
                    key={measure.id}
                    className={`rounded-lg border transition-all ${
                      isDone 
                        ? 'bg-[#0E1412] border-emerald-800/50' 
                        : isWaived 
                          ? 'bg-[#141415] border-[#333336] opacity-75' 
                          : 'bg-[#141415] border-[#262626] hover:border-[#3F3F46]'
                    }`}
                  >
                    <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-0.5">
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : isWaived ? (
                            <div className="w-5 h-5 rounded-full border border-[#52525B] flex items-center justify-center text-[9px] text-[#71717A]">W</div>
                          ) : (
                            <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-xs text-white">{measure.controlName}</span>
                            
                            <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                              measure.pillar === 'Technical' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/50' :
                              measure.pillar === 'Legal' ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-700/50' :
                              'bg-purple-950/80 text-purple-400 border border-purple-700/50'
                            }`}>
                              {measure.pillar}
                            </span>

                            <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                              priorityLabel === 'Critical' ? 'bg-rose-950/80 text-rose-300 border border-rose-700/60' :
                              priorityLabel === 'High' ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60' :
                              'bg-sky-950/80 text-sky-300 border border-sky-700/60'
                            }`}>
                              {priorityLabel}
                            </span>

                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1F1F21] text-[#A1A1AA] border border-[#262626]">
                              {measure.edpbReference}
                            </span>
                          </div>

                          <p className="text-xs text-[#A1A1AA] leading-relaxed">
                            {measure.description}
                          </p>

                          <div className="flex items-center gap-4 text-[10px] text-[#71717A] pt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-cyan-400" />
                              Target SLA: <strong className="text-white">{dateInfo.display}</strong>
                              {dateInfo.isOverdue && !isDone && <span className="text-rose-400 font-bold ml-1">(OVERDUE)</span>}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              Owner: <strong className="text-[#D1D5DB]">{measure.assignedOwner || 'SecOps / Legal'}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Toggle & Details button */}
                      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-[#262626]">
                        <select
                          value={measure.status}
                          onChange={(e) => handleStatusChange(measure.id, e.target.value as any)}
                          className={`text-[11px] font-mono rounded px-2.5 py-1 font-bold border focus:outline-hidden cursor-pointer ${
                            isDone 
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-600' 
                              : isWaived
                                ? 'bg-[#1A1A1B] text-[#71717A] border-[#333336]'
                                : 'bg-amber-950/80 text-amber-300 border-amber-600'
                          }`}
                        >
                          <option value="recommended">Pending Remediation</option>
                          <option value="implemented">Implemented & Verified</option>
                          <option value="waived_with_risk_acceptance">Waived (Formal Acceptance)</option>
                        </select>

                        <button
                          onClick={() => setExpandedActionId(isExpanded ? null : measure.id)}
                          className="p-1 text-[#71717A] hover:text-white rounded hover:bg-[#1F1F21] transition-colors cursor-pointer"
                          title="Toggle Detailed Specifications"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Specs */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-[#262626] bg-[#0A0A0B] text-xs space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
                          <div className="bg-[#141415] p-2.5 rounded border border-[#262626]">
                            <span className="text-[9px] uppercase text-[#71717A] block font-bold">Assigned Owner</span>
                            <span className="font-semibold text-white mt-0.5 block">{measure.assignedOwner || 'DPO & CISO Team'}</span>
                          </div>
                          <div className="bg-[#141415] p-2.5 rounded border border-[#262626]">
                            <span className="text-[9px] uppercase text-[#71717A] block font-bold">Target SLA Deadline</span>
                            <span className="font-semibold text-cyan-400 mt-0.5 block">{measure.targetCompletionDate || '30 Days'}</span>
                          </div>
                          <div className="bg-[#141415] p-2.5 rounded border border-[#262626]">
                            <span className="text-[9px] uppercase text-[#71717A] block font-bold">Residual Risk Level</span>
                            <span className="font-semibold text-emerald-400 mt-0.5 block">{measure.residualRisk}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase text-emerald-400 block font-bold mb-1">
                            Technical & Contractual Implementation Blueprint:
                          </span>
                          <div className="p-3 rounded bg-[#141415] border border-[#262626] text-[#A1A1AA] leading-relaxed">
                            {measure.implementationDetail}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Data Grid Footer Summary */}
        <div className="p-3 bg-[#080809] border-t border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#71717A]">
          <div className="flex items-center gap-3">
            <span>Showing <strong className="text-white">{filteredAndSortedMeasures.length}</strong> of <strong className="text-white">{localMeasures.length}</strong> controls</span>
            <span>•</span>
            <span>Sorted by: <strong className="text-cyan-400 uppercase">{sortField}</strong> ({sortOrder.toUpperCase()})</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-bold">{implementedCount} Completed</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">{pendingCount} In Progress</span>
            <span>•</span>
            <span className="text-[#A1A1AA]">{waivedCount} Waived</span>
          </div>
        </div>
      </div>

      {/* ADD ACTION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono">
          <div className="bg-[#0F0F10] border border-[#262626] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Add Remediation Measure
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-[#71717A] hover:text-white text-xs cursor-pointer"
              >
                ESC / CLOSE
              </button>
            </div>

            <form onSubmit={handleAddAction} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#71717A] mb-1">Control Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hardware Security Module (HSM) on UK soil"
                  value={newControlName}
                  onChange={(e) => setNewControlName(e.target.value)}
                  className="w-full p-2 bg-[#080809] border border-[#262626] rounded text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#71717A] mb-1">Pillar Domain</label>
                  <select
                    value={newPillar}
                    onChange={(e) => setNewPillar(e.target.value as any)}
                    className="w-full p-2 bg-[#080809] border border-[#262626] rounded text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="Technical">Technical (Encryption/HSM/Pseudonym)</option>
                    <option value="Legal">Legal (Warrant litigation/SCC Clauses)</option>
                    <option value="Organizational">Organizational (Exit BCP/Audits)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#71717A] mb-1">Assigned Owner</label>
                  <input
                    type="text"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full p-2 bg-[#080809] border border-[#262626] rounded text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#71717A] mb-1">Target SLA Date</label>
                  <input
                    type="date"
                    required
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full p-2 bg-[#080809] border border-[#262626] rounded text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#71717A] mb-1">Residual Risk Level</label>
                  <select
                    value={newResidualRisk}
                    onChange={(e) => setNewResidualRisk(e.target.value as any)}
                    className="w-full p-2 bg-[#080809] border border-[#262626] rounded text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#71717A] mb-1">Regulatory / EDPB Reference</label>
                <input
                  type="text"
                  value={newEdpbRef}
                  onChange={(e) => setNewEdpbRef(e.target.value)}
                  className="w-full p-2 bg-[#080809] border border-[#262626] rounded text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#71717A] mb-1">Technical Implementation Detail</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Specify key rotation, warrant notification window, or failover procedure..."
                  className="w-full p-2 bg-[#080809] border border-[#262626] rounded text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-[#71717A] hover:text-white bg-[#141415] rounded border border-[#262626] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors cursor-pointer"
                >
                  Add Control Step
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3-Pillar & Consolidated PDF Export Modal */}
      <ThreePillarPdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        profile={profile}
        evaluation={evaluation}
        initialPillar={pdfExportPillar}
      />
    </div>
  );
};
