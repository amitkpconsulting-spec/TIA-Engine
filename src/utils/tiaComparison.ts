import { TransferProfile, TIAEvaluationResult } from '../types/tia';
import { evaluateTIA } from './tiaEngine';
import { JURISDICTIONS } from '../data/jurisdictions';

export type DiffStatus = 'improved' | 'regressed' | 'changed' | 'identical';

export interface ParameterDiffItem {
  id: string;
  pillar: 'technical' | 'legal' | 'resilience' | 'corridor' | 'data';
  pillarLabel: string;
  name: string;
  standardReference: string;
  valueA: string | boolean | number;
  valueB: string | boolean | number;
  displayValueA: string;
  displayValueB: string;
  status: DiffStatus;
  statusText: string;
  riskImpact: 'high' | 'medium' | 'low' | 'neutral';
}

export interface RemediationGapComparison {
  remediatedInB: string[]; // Fixed in B
  regressedInB: string[];  // Open in B but not A
  sharedOpenGaps: string[]; // Open in both
}

export interface ProfileComparisonAnalysis {
  profileA: TransferProfile;
  profileB: TransferProfile;
  evaluationA: TIAEvaluationResult;
  evaluationB: TIAEvaluationResult;
  
  // Delta Metrics
  scoreDelta: number; // evalB.overallRiskScore - evalA.overallRiskScore (negative is good)
  scorePercentChange: number;
  technicalScoreDelta: number;
  legalScoreDelta: number;
  resilienceScoreDelta: number;
  
  verdictProgression: {
    from: TIAEvaluationResult['verdict'];
    to: TIAEvaluationResult['verdict'];
    isImprovement: boolean;
    isWorse: boolean;
    isUnchanged: boolean;
  };
  
  diffItems: ParameterDiffItem[];
  differingItemsCount: number;
  identicalItemsCount: number;
  
  gapsComparison: RemediationGapComparison;
}

/**
 * Compares two Transfer Profiles and computes delta metrics, parameter diffs, and remediation statuses.
 */
export function compareProfiles(
  profileA: TransferProfile,
  profileB: TransferProfile
): ProfileComparisonAnalysis {
  const evalA = evaluateTIA(profileA);
  const evalB = evaluateTIA(profileB);

  const scoreDelta = evalB.overallRiskScore - evalA.overallRiskScore;
  const scorePercentChange = evalA.overallRiskScore > 0 
    ? Math.round(((evalB.overallRiskScore - evalA.overallRiskScore) / evalA.overallRiskScore) * 100)
    : 0;

  const technicalScoreDelta = evalB.scores.technicalProtectionScore - evalA.scores.technicalProtectionScore;
  const legalScoreDelta = evalB.scores.legalSafeguardsScore - evalA.scores.legalSafeguardsScore;
  const resilienceScoreDelta = evalB.scores.praResilienceScore - evalA.scores.praResilienceScore;

  // Verdict evaluation rank: Approved (3) > Approved with Conditions (2) > Prohibited (1)
  const getVerdictRank = (v: TIAEvaluationResult['verdict']) => {
    if (v === 'Approved') return 3;
    if (v === 'Approved with Conditions') return 2;
    return 1;
  };

  const rankA = getVerdictRank(evalA.verdict);
  const rankB = getVerdictRank(evalB.verdict);

  const verdictProgression = {
    from: evalA.verdict,
    to: evalB.verdict,
    isImprovement: rankB > rankA,
    isWorse: rankB < rankA,
    isUnchanged: rankB === rankA
  };

  const diffItems: ParameterDiffItem[] = [];

  // Helper to add boolean/enum diffs
  const addDiff = (
    id: string,
    pillar: ParameterDiffItem['pillar'],
    pillarLabel: string,
    name: string,
    standardReference: string,
    valA: any,
    valB: any,
    format: (v: any) => string,
    higherIsBetter: boolean | 'enum' = true,
    riskImpact: ParameterDiffItem['riskImpact'] = 'medium'
  ) => {
    const displayA = format(valA);
    const displayB = format(valB);
    const isSame = valA === valB;

    let status: DiffStatus = 'identical';
    let statusText = 'Identical';

    if (!isSame) {
      if (typeof valA === 'boolean' && typeof valB === 'boolean') {
        if (valB && !valA) {
          status = higherIsBetter ? 'improved' : 'regressed';
          statusText = higherIsBetter ? 'Enhanced' : 'Regressed';
        } else if (!valB && valA) {
          status = higherIsBetter ? 'regressed' : 'improved';
          statusText = higherIsBetter ? 'Regressed' : 'Enhanced';
        }
      } else if (higherIsBetter === 'enum') {
        status = 'changed';
        statusText = 'Changed';
      } else {
        status = 'changed';
        statusText = 'Different';
      }
    }

    diffItems.push({
      id,
      pillar,
      pillarLabel,
      name,
      standardReference,
      valueA: valA,
      valueB: valB,
      displayValueA: displayA,
      displayValueB: displayB,
      status,
      statusText,
      riskImpact
    });
  };

  // 1. CORRIDOR & METADATA
  addDiff(
    'corridor_origin',
    'corridor',
    'Corridor & Scope',
    'Data Exporter Origin',
    'GDPR Art 44 Scope',
    profileA.exporterCountry,
    profileB.exporterCountry,
    v => `${v} (${profileA.exporterType})`,
    'enum',
    'neutral'
  );

  addDiff(
    'corridor_destination',
    'corridor',
    'Corridor & Scope',
    'Data Importer Country',
    'GDPR Art 45-46 Third Country',
    profileA.importerCountry,
    profileB.importerCountry,
    v => v,
    'enum',
    'high'
  );

  addDiff(
    'transfer_mechanism',
    'legal',
    'Legal & Contractual',
    'Transfer Mechanism',
    'GDPR Articles 46 & 49',
    profileA.transferMechanism,
    profileB.transferMechanism,
    v => {
      const map: Record<string, string> = {
        'uk_addendum_scc': 'UK Addendum to EU SCCs',
        'uk_idta': 'UK IDTA Agreement',
        'eu_scc_module_1': 'EU SCCs Module 1 (C-to-C)',
        'eu_scc_module_2': 'EU SCCs Module 2 (C-to-P)',
        'eu_scc_module_3': 'EU SCCs Module 3 (P-to-P)',
        'eu_scc_module_4': 'EU SCCs Module 4 (P-to-C)',
        'bcr_controller': 'Binding Corporate Rules (Controller)',
        'bcr_processor': 'Binding Corporate Rules (Processor)',
        'adequacy_decision': 'Adequacy Decision',
        'art_49_derogation': 'Article 49 Derogations',
        'ad_hoc_clauses': 'Ad Hoc Contractual Clauses'
      };
      return map[v] || v;
    },
    'enum',
    'high'
  );

  // 2. TECHNICAL SAFEGUARDS (EDPB 01/2020)
  addDiff(
    'key_management',
    'technical',
    'Technical Safeguards',
    'Cryptographic Key Custody Architecture',
    'EDPB 01/2020 Recommendation 1 Use-Case 6',
    profileA.keyManagement,
    profileB.keyManagement,
    v => {
      const map: Record<string, string> = {
        'byok_local_hsm': 'BYOK (Exclusive On-Prem / Local HSM in UK/EEA)',
        'hyok_hold_your_own_key': 'HYOK (Hold Your Own Key)',
        'cloud_kms_customer_managed': 'Cloud KMS (Customer Managed in Cloud)',
        'provider_managed_keys': 'Provider Managed Keys (Cleartext Risk)',
        'no_encryption': 'No Encryption (Plaintext)'
      };
      return map[v] || v;
    },
    'enum',
    'high'
  );

  // Check if key management improved
  const keyScore = (k: string) => {
    if (k === 'byok_local_hsm' || k === 'hyok_hold_your_own_key') return 3;
    if (k === 'cloud_kms_customer_managed') return 2;
    if (k === 'provider_managed_keys') return 1;
    return 0;
  };
  const keyItem = diffItems[diffItems.length - 1];
  if (keyScore(profileB.keyManagement) > keyScore(profileA.keyManagement)) {
    keyItem.status = 'improved';
    keyItem.statusText = 'Enhanced Key Custody';
  } else if (keyScore(profileB.keyManagement) < keyScore(profileA.keyManagement)) {
    keyItem.status = 'regressed';
    keyItem.statusText = 'Key Custody Regressed';
  }

  addDiff(
    'pseudonymization',
    'technical',
    'Technical Safeguards',
    'Pre-Export Pseudonymization',
    'EDPB 01/2020 Technical Measure 2',
    profileA.pseudonymizationPriorToTransfer,
    profileB.pseudonymizationPriorToTransfer,
    v => v ? 'Enforced before transit' : 'Not Implemented',
    true,
    'high'
  );

  addDiff(
    'confidential_computing',
    'technical',
    'Technical Safeguards',
    'Confidential Computing Enclaves',
    'Hardware-Isolated Memory (AMD SEV / Intel SGX)',
    profileA.confidentialComputingEnclaves,
    profileB.confidentialComputingEnclaves,
    v => v ? 'Active Memory Enclave Isolation' : 'Standard Virtual Memory',
    true,
    'medium'
  );

  addDiff(
    'zero_trust',
    'technical',
    'Technical Safeguards',
    'Zero Trust Network Access (ZTNA)',
    'NIST SP 800-207 & Perimeter Insulation',
    profileA.zeroTrustNetworkAccess,
    profileB.zeroTrustNetworkAccess,
    v => v ? 'ZTNA Multi-factor Identity Gated' : 'Standard Network Routing',
    true,
    'medium'
  );

  addDiff(
    'transit_encryption',
    'technical',
    'Technical Safeguards',
    'In-Transit Encryption & mTLS',
    'EDPB Use-Case 1 (Transport Security)',
    profileA.transitEncryption,
    profileB.transitEncryption,
    v => v ? `${profileA.transitProtocol || 'TLS 1.3'}` : 'Unencrypted',
    true,
    'high'
  );

  addDiff(
    'at_rest_encryption',
    'technical',
    'Technical Safeguards',
    'At-Rest Storage Encryption',
    'AES-256 GCM Storage Partitioning',
    profileA.atRestEncryption,
    profileB.atRestEncryption,
    v => v ? `${profileA.atRestAlgorithm || 'AES-256'}` : 'Unencrypted Storage',
    true,
    'high'
  );

  // 3. LEGAL & CONTRACTUAL (SCC Clauses 14-15)
  addDiff(
    'pra_direct_inspection',
    'legal',
    'Legal & Contractual',
    'PRA Direct Inspection Rights (S165A/S166)',
    'PRA SS2/21 Chapter 5 & FSMA 2000',
    profileA.praDirectInspectionClause,
    profileB.praDirectInspectionClause,
    v => v ? 'Contractually Guaranteed' : 'Missing Clause',
    true,
    'high'
  );

  addDiff(
    'foreign_warrant_challenge',
    'legal',
    'Legal & Contractual',
    'Foreign Warrant Challenge Commitment',
    'EU SCC 2021/914 Clause 15.1(b)',
    profileA.foreignWarrantChallengeCommitment,
    profileB.foreignWarrantChallengeCommitment,
    v => v ? 'Obligation to exhaust all legal remedies' : 'No legal challenge commitment',
    true,
    'high'
  );

  addDiff(
    'foreign_warrant_notification',
    'legal',
    'Legal & Contractual',
    'Foreign Warrant Notification Clause',
    'EU SCC Clause 15.1(a) & EDPB Measure',
    profileA.foreignWarrantNotificationClause,
    profileB.foreignWarrantNotificationClause,
    v => v ? 'Prompt notification mandated' : 'No notice clause',
    true,
    'high'
  );

  addDiff(
    'data_subject_indemnification',
    'legal',
    'Legal & Contractual',
    'Direct Data Subject Indemnification',
    'SCC Clause 12 & GDPR Art 82',
    profileA.dataSubjectIndemnification,
    profileB.dataSubjectIndemnification,
    v => v ? 'Direct compensation liability accepted' : 'Standard liability cap',
    true,
    'medium'
  );

  addDiff(
    'subprocessor_auth',
    'legal',
    'Legal & Contractual',
    'Prior Written Auth for Subprocessors',
    'SCC Clause 9 & GDPR Art 28(2)',
    profileA.priorWrittenAuthRequiredForSubprocessors,
    profileB.priorWrittenAuthRequiredForSubprocessors,
    v => v ? `Mandatory (${profileA.subprocessorNoticePeriodDays || 30} days notice)` : 'General authorization',
    true,
    'medium'
  );

  // 4. OPERATIONAL RESILIENCE & PRA SS2/21
  addDiff(
    'material_outsourcing',
    'resilience',
    'Operational Resilience',
    'PRA Material Outsourcing Determination',
    'PRA SS2/21 Section 3 Materiality',
    profileA.isMaterialOutsourcing,
    profileB.isMaterialOutsourcing,
    v => v ? `Yes (IBS: ${profileA.importantBusinessService || 'Core'})` : 'Non-material outsourcing',
    'enum',
    'medium'
  );

  addDiff(
    'tested_stressed_exit_plan',
    'resilience',
    'Operational Resilience',
    'Tested Stressed Exit Plan',
    'PRA SS2/21 Chapter 6 Exit Strategy',
    profileA.testedStressedExitPlan,
    profileB.testedStressedExitPlan,
    v => v ? 'Documented & Stressed Tested' : 'Untested / Concept only',
    true,
    'high'
  );

  addDiff(
    'multi_region_failover',
    'resilience',
    'Operational Resilience',
    'Multi-Region Active Failover',
    'PRA SS2/21 Business Continuity §8',
    profileA.multiRegionActiveFailover,
    profileB.multiRegionActiveFailover,
    v => v ? 'Active-Active Multi-Region' : 'Single Region Dependency',
    true,
    'high'
  );

  addDiff(
    'direct_audit_rights',
    'resilience',
    'Operational Resilience',
    'Direct Full Audit & Access Rights',
    'PRA SS2/21 Chapter 5 Access Rights',
    profileA.hasDirectAuditRights,
    profileB.hasDirectAuditRights,
    v => v ? 'Unrestricted audit rights' : 'Third-party SOC reports only',
    true,
    'high'
  );

  addDiff(
    'evergreen_review_cadence',
    'resilience',
    'Operational Resilience',
    'Review Governance Cadence',
    'PRA SS2/21 §4 Ongoing Monitoring',
    profileA.evergreenReviewCadenceYears,
    profileB.evergreenReviewCadenceYears,
    v => `Every ${v} year(s)`,
    (profileB.evergreenReviewCadenceYears <= profileA.evergreenReviewCadenceYears),
    'medium'
  );

  // 5. SENSITIVE DATA CATEGORIES
  const countCats = (p: TransferProfile) => {
    let cnt = 0;
    if (p.dataCategories.specialCategoryArt9) cnt++;
    if (p.dataCategories.criminalConvictionsArt10) cnt++;
    if (p.dataCategories.nationalIdentifierArt87) cnt++;
    if (p.dataCategories.financialFraudSensitive) cnt++;
    if (p.dataCategories.intellectualPropertyConfidential) cnt++;
    return cnt;
  };

  addDiff(
    'sensitive_data_scope',
    'data',
    'Data Scope',
    'Sensitive & Special Category Scope',
    'GDPR Articles 9, 10 & 87',
    countCats(profileA),
    countCats(profileB),
    v => `${v} high-risk data categories active`,
    'enum',
    'high'
  );

  // Extract Gaps comparison from remediationMatrix and praChecklist
  const getProfileGaps = (ev: TIAEvaluationResult): string[] => {
    const gaps: string[] = [];
    ev.remediationMatrix.forEach(m => {
      if (m.status !== 'implemented') {
        gaps.push(`${m.controlName} (${m.pillar})`);
      }
    });
    ev.praChecklist.forEach(item => {
      if (item.complianceStatus === 'Gaps Identified') {
        gaps.push(`${item.requirementDescription} [${item.ruleReference}]`);
      }
    });
    return gaps;
  };

  const gapsA = getProfileGaps(evalA);
  const gapsB = getProfileGaps(evalB);

  const remediatedInB = gapsA.filter(g => !gapsB.includes(g));
  const regressedInB = gapsB.filter(g => !gapsA.includes(g));
  const sharedOpenGaps = gapsA.filter(g => gapsB.includes(g));

  const differingItemsCount = diffItems.filter(i => i.status !== 'identical').length;
  const identicalItemsCount = diffItems.filter(i => i.status === 'identical').length;

  return {
    profileA,
    profileB,
    evaluationA: evalA,
    evaluationB: evalB,
    scoreDelta,
    scorePercentChange,
    technicalScoreDelta,
    legalScoreDelta,
    resilienceScoreDelta,
    verdictProgression,
    diffItems,
    differingItemsCount,
    identicalItemsCount,
    gapsComparison: {
      remediatedInB,
      regressedInB,
      sharedOpenGaps
    }
  };
}
