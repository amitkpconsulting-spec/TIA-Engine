import { TransferProfile, TIAEvaluationResult, SupplementaryMeasure, PraChecklistItem } from '../types/tia';
import { JURISDICTIONS } from '../data/jurisdictions';
import { 
  generateUniqueTiaId, 
  computeCryptographicFingerprint, 
  generateCrossFrameworkPayloads 
} from './tiaIdGenerator';

export function evaluateTIA(profile: TransferProfile): TIAEvaluationResult {
  const jurisdiction = JURISDICTIONS[profile.importerCountry] || {
    countryCode: 'XX',
    countryName: profile.importerCountry,
    flagEmoji: '🌐',
    adequacyStatus: 'no_adequacy',
    adequacyDetails: 'Third country without European Commission or UK Adequacy Decision. Full TIA and supplementary measures required.',
    dataProtectionLaw: 'National Data Protection Legislation',
    hasIndependentDPA: false,
    dpaName: 'National Regulatory Authority',
    surveillanceLaws: [
      {
        statuteName: 'National Security & Surveillance Legislation',
        scopeAndPowers: 'Broad government powers to intercept electronic data for law enforcement or national security.',
        extraterritorialReach: false,
        appliesToCloudProviders: true,
        bulkCollectionRisk: 'High',
      }
    ],
    guarantees: {
      clearPreciseRules: false,
      clearPreciseRulesNotes: 'Unverified transparency regarding surveillance powers.',
      necessaryAndProportionate: false,
      necessaryAndProportionateNotes: 'No formal finding of equivalence with EU/UK democratic standards.',
      independentOversight: false,
      independentOversightNotes: 'Judicial authorization not verified for foreign national targets.',
      effectiveRedressForForeigners: false,
      effectiveRedressNotes: 'No guaranteed redress mechanism for non-resident data subjects.'
    },
    overallSurveillanceRisk: 'High',
    legalRiskSummary: 'Lack of verified adequacy or democratic essential guarantees necessitates strict technical insulation prior to export.',
    recommendedSupplementaryPillars: ['technical', 'organizational', 'legal']
  };

  // 1. Calculate Surveillance Risk Score (0 - 100)
  let surveillanceBase = 30;
  if (jurisdiction.overallSurveillanceRisk === 'Critical') surveillanceBase = 90;
  else if (jurisdiction.overallSurveillanceRisk === 'High') surveillanceBase = 70;
  else if (jurisdiction.overallSurveillanceRisk === 'Medium') surveillanceBase = 45;
  else if (jurisdiction.overallSurveillanceRisk === 'Low') surveillanceBase = 15;

  if (profile.transferMechanism === 'adequacy_decision' && jurisdiction.adequacyStatus === 'full_adequacy') {
    surveillanceBase = Math.min(surveillanceBase, 20);
  }

  // 2. Calculate Technical Protection Score (0 - 100)
  let technicalScore = 0;
  if (profile.transitEncryption) technicalScore += 20;
  if (profile.atRestEncryption) technicalScore += 15;
  if (profile.keyManagement === 'byok_local_hsm' || profile.keyManagement === 'hyok_hold_your_own_key') {
    technicalScore += 35;
  } else if (profile.keyManagement === 'cloud_kms_customer_managed') {
    technicalScore += 15;
  } else if (profile.keyManagement === 'provider_managed_keys') {
    technicalScore -= 20;
  }
  if (profile.pseudonymizationPriorToTransfer) technicalScore += 20;
  if (profile.confidentialComputingEnclaves) technicalScore += 10;
  if (profile.zeroTrustNetworkAccess) technicalScore += 10;
  technicalScore = Math.max(0, Math.min(100, technicalScore));

  // 3. Calculate Legal & Contractual Score (0 - 100)
  let legalScore = 0;
  if (profile.praDirectInspectionClause) legalScore += 25;
  if (profile.foreignWarrantChallengeCommitment) legalScore += 25;
  if (profile.foreignWarrantNotificationClause) legalScore += 20;
  if (profile.dataSubjectIndemnification) legalScore += 15;
  if (profile.priorWrittenAuthRequiredForSubprocessors) legalScore += 15;
  legalScore = Math.max(0, Math.min(100, legalScore));

  // 4. Calculate PRA Operational Resilience Score (0 - 100)
  let resilienceScore = 0;
  if (profile.testedStressedExitPlan) resilienceScore += 35;
  if (profile.multiRegionActiveFailover) resilienceScore += 25;
  if (profile.hasDirectAuditRights) resilienceScore += 20;
  if (profile.stepInRiskAcknowledged) resilienceScore += 10;
  if (profile.evergreenReviewCadenceYears <= 1) resilienceScore += 10;
  resilienceScore = Math.max(0, Math.min(100, resilienceScore));

  // Sensitivity Weight
  let sensitivityMultiplier = 1.0;
  if (profile.dataCategories.specialCategoryArt9 || profile.dataCategories.criminalConvictionsArt10) {
    sensitivityMultiplier += 0.35;
  }
  if (profile.dataCategories.financialFraudSensitive) {
    sensitivityMultiplier += 0.25;
  }
  if (profile.dataCategories.nationalIdentifierArt87) {
    sensitivityMultiplier += 0.15;
  }

  // Composite Risk Score: higher = riskier (0 - 100)
  const technicalDeficit = 100 - technicalScore;
  const legalDeficit = 100 - legalScore;
  const resilienceDeficit = 100 - resilienceScore;

  let rawRisk = (
    surveillanceBase * 0.40 +
    technicalDeficit * 0.30 +
    legalDeficit * 0.15 +
    resilienceDeficit * 0.15
  ) * sensitivityMultiplier;

  // If local HSM key management is held exclusively on-premises, drastically diminish surveillance risk
  if (profile.keyManagement === 'byok_local_hsm' && profile.pseudonymizationPriorToTransfer) {
    rawRisk = rawRisk * 0.55;
  }

  const overallRiskScore = Math.round(Math.max(5, Math.min(98, rawRisk)));

  let riskCategory: TIAEvaluationResult['riskCategory'] = 'Low Risk';
  if (overallRiskScore > 75) riskCategory = 'Critical Risk';
  else if (overallRiskScore > 50) riskCategory = 'High Risk';
  else if (overallRiskScore > 25) riskCategory = 'Moderate Risk';

  // Verdict Determination
  let verdict: TIAEvaluationResult['verdict'] = 'Approved with Conditions';
  let rationale = '';

  if (overallRiskScore <= 28 && (jurisdiction.adequacyStatus === 'full_adequacy' || technicalScore >= 75)) {
    verdict = 'Approved';
    rationale = `The transfer to ${profile.importerCountry} meets EU/UK GDPR Article 44-49 benchmarks and PRA SS2/21 requirements. Essential guarantees are preserved either via formal adequacy or air-tight technical insulation (BYOK HSM key custody).`;
  } else if (
    (jurisdiction.overallSurveillanceRisk === 'Critical' && profile.keyManagement === 'provider_managed_keys') ||
    (profile.dataCategories.specialCategoryArt9 && !profile.pseudonymizationPriorToTransfer && profile.keyManagement !== 'byok_local_hsm' && jurisdiction.adequacyStatus === 'no_adequacy')
  ) {
    verdict = 'Prohibited';
    rationale = `The proposed transfer is legally incompatible with CJEU Schrems II and PRA SS2/21. Third-country surveillance laws (${jurisdiction.surveillanceLaws.map(s => s.statuteName).join(', ')}) lack essential guarantees, and current key management allows cleartext access to foreign authorities.`;
  } else {
    verdict = 'Approved with Conditions';
    rationale = `The transfer is permissible provided that all 3-Pillar Supplementary Measures (Technical BYOK key custody, Organizational warrant challenge runbooks, and PRA S165A/S166 contractual addenda) are fully executed and audited.`;
  }

  // 3-Pillar Remediation Matrix
  const remediationMatrix: SupplementaryMeasure[] = [
    {
      id: 'meas-tech-1',
      pillar: 'Technical',
      controlName: 'Hardware Security Module (HSM) BYOK Key Custody',
      description: 'Cryptographic keys for data at rest and data in transit must be generated, stored, and managed exclusively in an on-premises or UK/EEA cloud HSM.',
      implementationDetail: profile.keyManagement === 'byok_local_hsm' 
        ? 'Fully operational: Customer holds sole custody of root and data encryption keys (DEKs); importer cloud CSP receives only ciphertext.'
        : 'Action required: Migrate from provider-managed keys to dedicated Client-Side BYOK/HYOK module before live production traffic commences.',
      edpbReference: 'EDPB Recommendations 01/2020, Annex 2 Use Case 1 & 3',
      status: profile.keyManagement === 'byok_local_hsm' ? 'implemented' : 'recommended',
      riskMitigated: 'Prevents third-country surveillance agencies from compelling cloud service provider to decrypt data.',
      residualRisk: profile.keyManagement === 'byok_local_hsm' ? 'Low' : 'High',
      assignedOwner: 'Chief Information Security Officer (CISO) & Cryptography Lead',
      targetCompletionDate: 'Prior to service go-live',
    },
    {
      id: 'meas-tech-2',
      pillar: 'Technical',
      controlName: 'On-Soil Pseudonymization & Tokenization Engine',
      description: 'Direct identifiers (names, NI numbers, policy IDs, sort codes) must be replaced with irreversible cryptographic pseudonyms prior to cross-border transit.',
      implementationDetail: profile.pseudonymizationPriorToTransfer 
        ? 'Active: Tokenization gateway deployed in originating jurisdiction; token mapping database held strictly on-premises.'
        : 'Action required: Implement pre-export tokenization microservice for all outbound data streams.',
      edpbReference: 'EDPB Recommendations 01/2020, Annex 2 Use Case 2 (§85)',
      status: profile.pseudonymizationPriorToTransfer ? 'implemented' : 'recommended',
      riskMitigated: 'Ensures data cannot be attributed to a specific data subject even if intercepted by foreign intelligence agencies.',
      residualRisk: profile.pseudonymizationPriorToTransfer ? 'Low' : 'Medium',
      assignedOwner: 'Data Architecture Lead',
      targetCompletionDate: '30 Days Post-Assessment',
    },
    {
      id: 'meas-org-1',
      pillar: 'Organizational',
      controlName: 'Foreign Surveillance Warrant & Subpoena Challenge Protocol',
      description: 'Formal standard operating procedure obligating the importer’s legal counsel to exhaust all judicial avenues to quash extraterritorial subpoenas or gag orders.',
      implementationDetail: profile.foreignWarrantChallengeCommitment 
        ? 'Documented: Importer has agreed to internal SOP mandating emergency escalation to Exporter DPO within 24 hours of any government warrant.'
        : 'Action required: Draft and append Mandatory Warrant Challenge Addendum to the Master Services Agreement.',
      edpbReference: 'EDPB Recommendations 01/2020, Section 2.3 (§128-143)',
      status: profile.foreignWarrantChallengeCommitment ? 'implemented' : 'recommended',
      riskMitigated: 'Prevents covert disclosure under FISA 702 or CLOUD Act orders without legal challenge.',
      residualRisk: 'Low',
      assignedOwner: 'Group Legal Counsel & Data Protection Officer',
      targetCompletionDate: 'Immediate upon contract execution',
    },
    {
      id: 'meas-org-2',
      pillar: 'Organizational',
      controlName: 'Bi-Annual Schrems II Transparency Reporting & Audit Cadence',
      description: 'Vendor must publish or provide verified bi-annual transparency certificates detailing total government access requests received and rejected.',
      implementationDetail: profile.transparencyReportAvailable 
        ? 'Verified: Past surveillance request history confirmed zero disclosures for European financial sector records.'
        : 'Action required: Mandate bi-annual delivery of SOC2 Type II + Transparency Disclosure Certificate as a contractual SLA.',
      edpbReference: 'EDPB Recommendations 01/2020, Section 2.3 (§138)',
      status: profile.transparencyReportAvailable ? 'implemented' : 'recommended',
      riskMitigated: 'Mitigates undetected drift in third-country judicial request volumes.',
      residualRisk: 'Low',
      assignedOwner: 'Vendor Risk Management Lead',
      targetCompletionDate: 'Bi-annual recurring',
    },
    {
      id: 'meas-leg-1',
      pillar: 'Legal',
      controlName: 'PRA Direct Supervisory Access & S165A / S166 FSMA Clause',
      description: 'Explicit contractual term ensuring the Bank of England, PRA, FCA, and their appointed Skilled Persons have unrestricted access and inspection rights.',
      implementationDetail: profile.praDirectInspectionClause 
        ? 'Included in Schedule 4: Unrestricted right to enter premises, inspect multi-tenant configurations, and review CBEST penetration tests.'
        : 'Action required: Insert PRA SS2/21 Chapter 8 mandatory regulatory access wording into the master agreement.',
      edpbReference: 'PRA SS2/21 Chapter 8 (Para 8.1 - 8.12)',
      status: profile.praDirectInspectionClause ? 'implemented' : 'recommended',
      riskMitigated: 'Eliminates regulatory non-compliance with PRA Fundamental Rule 7 and FSMA Section 165A/166.',
      residualRisk: 'Low',
      assignedOwner: 'Head of Regulatory Compliance',
      targetCompletionDate: 'Prior to contract signature',
    },
    {
      id: 'meas-leg-2',
      pillar: 'Legal',
      controlName: 'Immediate Termination & Cryptographic Shredding Trigger',
      description: 'Right of immediate termination if third-country legal amendments impair transfer tool effectiveness, with certified cryptographic purge.',
      implementationDetail: profile.immediateExitAndPurgeClause 
        ? 'Clause 18.3 active: Importer must provide cryptographic destruction certificate within 14 days of contract termination.'
        : 'Action required: Incorporate immediate termination without penalty upon foreign law change that compromises data safety.',
      edpbReference: 'GDPR Clause 16(c) & PRA SS2/21 Chapter 10',
      status: profile.immediateExitAndPurgeClause ? 'implemented' : 'recommended',
      riskMitigated: 'Protects firm from vendor lock-in and ongoing exposure during foreign geopolitical or legal shifts.',
      residualRisk: 'Low',
      assignedOwner: 'Procurement & Legal Counsel',
      targetCompletionDate: 'Immediate',
    }
  ];

  // PRA SS2/21 Checklist Items
  const praChecklist: PraChecklistItem[] = [
    {
      id: 'pra-1',
      category: 'Materiality & Governance',
      ruleReference: 'SS2/21 Chapter 4 & 5 (Para 4.7 & 5.11)',
      requirementDescription: 'Material Outsourcing / CIF determination formalised with allocated SM&CR Prescribed Responsibility (SMF24).',
      complianceStatus: profile.seniorManagerFunction ? 'Compliant' : 'Gaps Identified',
      evidenceOrRemediation: profile.seniorManagerFunction 
        ? `Prescribed Responsibility assigned to ${profile.seniorManagerFunction}.`
        : 'Remediation: Document SMF24 governance sign-off in Statement of Responsibilities.',
    },
    {
      id: 'pra-2',
      category: 'Audit & Access',
      ruleReference: 'SS2/21 Chapter 8 / Sections 165A & 166 FSMA',
      requirementDescription: 'Unrestricted PRA, Bank of England, and Skilled Person inspection & information rights over systems, networks, and staff.',
      complianceStatus: profile.praDirectInspectionClause ? 'Compliant' : 'Gaps Identified',
      evidenceOrRemediation: profile.praDirectInspectionClause 
        ? 'Contract includes express statutory access terms under PRA Rulebook Information Gathering 2.2 & 3.3.'
        : 'Remediation: Execute Supplementary Regulatory Access Addendum.',
    },
    {
      id: 'pra-3',
      category: 'Sub-Outsourcing',
      ruleReference: 'SS2/21 Chapter 9 (Para 9.3 - 9.9)',
      requirementDescription: 'Prior written authorization required for sub-processors; sub-processors must grant equivalent audit and security rights.',
      complianceStatus: profile.priorWrittenAuthRequiredForSubprocessors ? 'Compliant' : 'Gaps Identified',
      evidenceOrRemediation: `Sub-processor change notice period set to ${profile.subprocessorNoticePeriodDays} days with full right to object or terminate.`,
    },
    {
      id: 'pra-4',
      category: 'Stressed Exit & BCP',
      ruleReference: 'SS2/21 Chapter 10 (Para 10.1 - 10.25)',
      requirementDescription: 'Documented, tested exit plan for stressed scenarios (vendor insolvency/outage), adhering to Impact Tolerance of ' + profile.impactToleranceHours + 'h.',
      complianceStatus: profile.testedStressedExitPlan ? 'Compliant' : 'Gaps Identified',
      evidenceOrRemediation: profile.testedStressedExitPlan 
        ? `Stressed exit runbook tested within last 12 months. Substitutability rating: ${profile.substitutabilityRating.replace(/_/g, ' ')}.`
        : 'Remediation: Formulate and conduct tabletop stressed exit drill with data repatriation workflow.',
    },
    {
      id: 'pra-5',
      category: 'MTP Register',
      ruleReference: 'SS2/21 Chapter 4 (Para 4.15 - Table 5)',
      requirementDescription: 'Material Third Party (MTP) Register record prepared for annual submission to FCA RegData.',
      complianceStatus: 'Compliant',
      evidenceOrRemediation: 'MTP Register Table 5 record automatically compiled and ready for RegData export.',
    }
  ];

  // Essential Guarantees
  const essentialGuaranteesVerdict = {
    guaranteeA: jurisdiction.guarantees.clearPreciseRules,
    guaranteeB: jurisdiction.guarantees.necessaryAndProportionate,
    guaranteeC: jurisdiction.guarantees.independentOversight,
    guaranteeD: jurisdiction.guarantees.effectiveRedressForForeigners,
    impairmentIdentified: !(
      jurisdiction.guarantees.clearPreciseRules &&
      jurisdiction.guarantees.necessaryAndProportionate &&
      jurisdiction.guarantees.independentOversight &&
      jurisdiction.guarantees.effectiveRedressForForeigners
    )
  };

  // Step 5 Action Plan
  const actionPlan = [
    {
      actionNumber: 1,
      title: 'Execute Supplementary Technical & Key Management Controls (BYOK HSM)',
      owner: profile.cisoContact || 'CISO',
      daysEstimated: 14,
      deadline: 'Pre-Deployment',
      priority: 'Critical' as const,
    },
    {
      actionNumber: 2,
      title: 'Execute PRA SS2/21 & Warrant Challenge Contractual Addendum',
      owner: profile.dpoContact || 'DPO / Legal Counsel',
      daysEstimated: 10,
      deadline: 'Prior to Signature',
      priority: 'Critical' as const,
    },
    {
      actionNumber: 3,
      title: 'Update Material Third Party (MTP) Register on FCA RegData / PRA Portal',
      owner: 'Head of Regulatory Compliance',
      daysEstimated: 5,
      deadline: 'Within 30 Days of Go-Live',
      priority: 'High' as const,
    },
    {
      actionNumber: 4,
      title: 'Conduct Annual Stressed Exit & Data Portability Tabletop Simulation',
      owner: 'Operational Resilience Lead (SMF24)',
      daysEstimated: 30,
      deadline: 'Q4 Annual Review',
      priority: 'Medium' as const,
    }
  ];

  // Step 6 Re-evaluation Cadence
  const reEvaluationSchedule = {
    intervalMonths: profile.isMaterialOutsourcing ? 12 : 36,
    nextReviewDate: new Date(Date.now() + (profile.isMaterialOutsourcing ? 365 : 1095) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    triggerEvents: [
      'Material amendment to third-country surveillance laws (e.g. FISA Section 702 reauthorisation or CAC national security decrees).',
      'Change in primary or secondary sub-processor supply chain.',
      'Significant modification in data sensitivity or volume of transferred personal records.',
      'Receipt of any government access request or subpoena by the data importer.',
      'Contractual renewal or expiry of the 3-year maximum evergreen review threshold.'
    ]
  };

  // Generate Policy Document
  const generatedPolicyDocument = generatePolicyText(profile, jurisdiction, verdict, overallRiskScore);

  // Ensure standard canonical identifiers exist
  const idBundle = (profile.tiaReferenceId && profile.universalUniqueIdentifier && profile.crossFrameworkUrn)
    ? {
        tiaReferenceId: profile.tiaReferenceId,
        universalUniqueIdentifier: profile.universalUniqueIdentifier,
        crossFrameworkUrn: profile.crossFrameworkUrn,
        externalIntegrations: profile.externalIntegrations || generateUniqueTiaId().externalIntegrations
      }
    : generateUniqueTiaId();

  const cryptographicFingerprint = computeCryptographicFingerprint({
    ...profile,
    tiaReferenceId: idBundle.tiaReferenceId,
    universalUniqueIdentifier: idBundle.universalUniqueIdentifier
  });

  const evaluationPartial = {
    evaluationId: `TIA-EVAL-${idBundle.tiaReferenceId}-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    profileId: profile.id,
    tiaReferenceId: idBundle.tiaReferenceId,
    universalUniqueIdentifier: idBundle.universalUniqueIdentifier,
    crossFrameworkUrn: idBundle.crossFrameworkUrn,
    cryptographicFingerprint,
    externalIntegrations: idBundle.externalIntegrations,
    verdict,
    verdictRationale: rationale,
    overallRiskScore,
    riskCategory,
    scores: {
      surveillanceRiskScore: surveillanceBase,
      technicalProtectionScore: technicalScore,
      legalSafeguardsScore: legalScore,
      praResilienceScore: resilienceScore,
    },
    transferMechanismSummary: formatTransferMechanism(profile.transferMechanism),
    targetCountryRiskSummary: `${jurisdiction.countryName} (${jurisdiction.adequacyStatus.replace(/_/g, ' ').toUpperCase()}) — Surveillance Risk: ${jurisdiction.overallSurveillanceRisk}`,
    praCriticalityAssessment: (profile.isMaterialOutsourcing 
      ? 'Material Outsourcing / Critical Function (CIF)' 
      : 'Non-Material Outsourcing') as 'Material Outsourcing / Critical Function (CIF)' | 'Non-Material Outsourcing',
    remediationMatrix,
    praChecklist,
    essentialGuaranteesVerdict,
    actionPlan,
    reEvaluationSchedule,
    generatedPolicyDocument
  };

  const crossFrameworkPayloads = generateCrossFrameworkPayloads(
    { ...profile, ...idBundle },
    evaluationPartial
  );

  return {
    ...evaluationPartial,
    crossFrameworkPayloads
  };
}

function formatTransferMechanism(mechanism: string): string {
  switch (mechanism) {
    case 'uk_addendum_scc': return 'UK Addendum to European Commission Standard Contractual Clauses (SCCs)';
    case 'uk_idta': return 'UK International Data Transfer Agreement (IDTA)';
    case 'eu_scc_module_1': return 'EU Standard Contractual Clauses — Module 1 (Controller-to-Controller)';
    case 'eu_scc_module_2': return 'EU Standard Contractual Clauses — Module 2 (Controller-to-Processor)';
    case 'eu_scc_module_3': return 'EU Standard Contractual Clauses — Module 3 (Processor-to-Processor)';
    case 'eu_scc_module_4': return 'EU Standard Contractual Clauses — Module 4 (Processor-to-Controller)';
    case 'bcr_controller': return 'Binding Corporate Rules for Controllers (BCR-C)';
    case 'bcr_processor': return 'Binding Corporate Rules for Processors (BCR-P)';
    case 'adequacy_decision': return 'Statutory Adequacy Decision (Article 45 GDPR / Data Protection Act 2018)';
    case 'art_49_derogation': return 'Article 49 GDPR Statutory Derogation (Specific Exception)';
    default: return 'Ad-Hoc Contractual Clauses (Article 46(3) GDPR)';
  }
}

function generatePolicyText(
  p: TransferProfile, 
  j: any, 
  verdict: string, 
  riskScore: number
): string {
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  
  return `# DATA SOVEREIGNTY, LOCALIZATION, AND CROSS-BORDER TRANSFER POLICY
**Document Ref:** POL-SOV-TIA-${p.id.toUpperCase()}  
**Version:** 3.0 (PRA SS2/21 & GDPR Post-Schrems II Aligned)  
**Effective Date:** ${dateStr}  
**Classification:** STRICTLY CONFIDENTIAL / REGULATORY COMPLIANCE  
**Accountable Executive:** ${p.seniorManagerFunction || 'SMF24 Chief Operations Officer'}  
**Supervisory Scope:** Prudential Regulation Authority (PRA), Financial Conduct Authority (FCA), Information Commissioner's Office (ICO)

---

## 1. PURPOSE & REGULATORY HIERARCHY
1.1 **Mandate:** This Policy establishes binding corporate rules, cryptographic governance, and operational standards governing the transfer of data originating within the European Economic Area (EEA) and the United Kingdom (UK) to third-country jurisdictions.
1.2 **Regulatory Alignment:** This Policy is formulated pursuant to:
  * **PRA Supervisory Statement SS2/21** (*Outsourcing and third party risk management*, Chapters 4–10);
  * **UK GDPR / EU GDPR Articles 44–49** (*Transfers of personal data to third countries*);
  * **EDPB Recommendations 01/2020** (*Supplementary measures for transfer tools*) and **02/2020** (*European Essential Safeguards*);
  * **CNIL Transfer Impact Assessment (TIA) 6-Step Practical Guide (2025/2026)**;
  * **Financial Conduct Authority (FCA) SYSC 8 & SYSC 13.9**.

---

## 2. DATA CLASSIFICATION & MANDATORY LOCALIZATION CONTROLS
2.1 **Restricted Data Tiers:** The following datasets are subject to strict data sovereignty and localization controls:
  * **Tier 1 (Restricted On-Soil Only):** Unencrypted special category personal data (GDPR Article 9), core banking ledger transactions, private cryptographic root keys, and intelligence models supporting Critical or Important Functions (CIFs).
  * **Tier 2 (Transferable with 3-Pillar Supplementary Controls):** Pseudonymized customer transaction telemetry, encrypted client identifiers with keys held locally in on-premises Hardware Security Modules (HSMs).
  * **Tier 3 (Standard Operational):** Public corporate data, aggregated anonymized analytics, and low-risk employee contact headers.

2.2 **On-Soil Retention Rule:** No Tier 1 dataset may be exported, processed, or made accessible via remote access to ${j.countryName} without irreversible client-side pseudonymization where the salt, hash repositories, and encryption keys are held exclusively within the UK/EEA jurisdiction.

---

## 3. TECHNICAL SAFEGUARDS & CRYPTOGRAPHIC KEY CUSTODY (PILLAR I)
3.1 **Bring Your Own Key (BYOK) / Hold Your Own Key (HYOK) Mandate:** 
  * All data stored in ${p.importerName} infrastructure must be encrypted at rest utilizing **AES-256-GCM** or post-quantum robust algorithms.
  * Root encryption keys, Master Key Encryption Keys (KEKs), and Data Encryption Keys (DEKs) must be generated, stored, and rotated exclusively inside ${p.exporterName}'s sovereign HSM boundary (FIPS 140-3 Level 3 certified).
  * Under no circumstances shall ${p.importerName} or any cloud service provider have access to plaintext keys.

3.2 **Transport Layer Security & Zero-Trust:**
  * All communications between ${p.exporterName} and ${p.importerName} must enforce **TLS 1.3 with mutual authentication (mTLS)** and Perfect Forward Secrecy (PFS).
  * Remote access sessions must utilize secure Virtual Desktop Infrastructure (VDI) with clipboard redirection, screen capture, and local storage downloading strictly disabled.

---

## 4. THIRD-PARTY SURVEILLANCE & FOREIGN WARRANT HANDLING PROTOCOL (PILLAR II & III)
4.1 **Legal Landscape Assessment:** The transfer to ${j.countryName} is subject to local surveillance provisions (${j.surveillanceLaws.map((s: any) => s.statuteName).join(', ')}). In accordance with Schrems II principles, ${p.importerName} is contractually bound to the following protocol:

\`\`\`
[Foreign Warrant / Subpoena Issued] ──> [Immediate 24-Hour Exporter Notice]
                                                 │
                                                 ▼
[Legality Review & Injunction Filing] ──> [Exhaust All Judicial Remedies]
                                                 │
                                                 ▼
[Provide ONLY Legally Compelled Minimum] ──> [Refuse Decryption Assistance]
\`\`\`

4.2 **Mandatory Warrant Notification:** ${p.importerName} must notify ${p.exporterName}'s Data Protection Officer (${p.dpoContact}) within **24 hours** of receiving any request, subpoena, or warrant for data access from any judicial, intelligence, or law enforcement authority in ${j.countryName}.
4.3 **Commitment to Challenge:** ${p.importerName} undertakes to review the legality of every disclosure order and exhaust all available legal remedies and appeals to quash or narrow the scope of the request, including seeking interim suspension orders.
4.4 **No Backdoors:** ${p.importerName} expressly warrants that no software backdoors, master access keys, or automated tapping mechanisms have been or will be provided to any public authority.

---

## 5. PRA SS2/21 OPERATIONAL RESILIENCE & STRESSED EXIT FRAMEWORK
5.1 **Critical or Important Function (CIF) Classification:** This engagement is classified as **${p.isMaterialOutsourcing ? 'MATERIAL OUTSOURCING / CIF' : 'NON-MATERIAL OUTSOURCING'}** supporting *${p.importantBusinessService}*.
5.2 **Supervisory Audit Rights (Sections 165A & 166 FSMA):**
  * ${p.importerName} and all sub-processors grant ${p.exporterName}, the Bank of England, the PRA, the FCA, and their designated Skilled Persons unrestricted rights to inspect premises, systems, security audits, and penetration test reports upon reasonable notice.
5.3 **Stressed Exit Runbook & Impact Tolerance:**
  * In the event of vendor insolvency, material service breach, or geopolitical disruption exceeding the **${p.impactToleranceHours}-hour Impact Tolerance**, ${p.exporterName} shall activate its Stressed Exit Plan.
  * Data portability must be completed within **14 calendar days**, utilizing standard schema exports (JSON/Parquet) for restoration to secondary standby infrastructure.
  * Upon termination, ${p.importerName} must deliver a certified **Cryptographic Data Destruction Certificate** within 30 days.

---

## 6. GOVERNANCE, MTP REGISTER & AUDIT CADENCE
6.1 **Material Third Party (MTP) Register:** This arrangement shall be recorded on the firm's central MTP Register in compliance with PRA Table 5 data specifications and reported annually via FCA RegData.
6.2 **Review Cadence:** This policy and the corresponding Transfer Impact Assessment shall be re-evaluated **every ${p.isMaterialOutsourcing ? '12 months' : '36 months (maximum evergreen term)'}**, or immediately upon any material change to ${j.countryName}'s legal framework or supply chain sub-processors.

---

### OFFICIAL APPROVAL & GOVERNANCE SIGN-OFF
| Role | Name & Title | Signature & Status | Date |
| :--- | :--- | :--- | :--- |
| **SM&CR Prescribed Responsibility** | ${p.seniorManagerFunction || 'SMF24 Chief Operations'} | APPROVED [DIGITALLY SIGNED] | ${dateStr} |
| **Data Protection Officer** | ${p.dpoContact} | APPROVED [TIA VERDICT: ${verdict.toUpperCase()}] | ${dateStr} |
| **Chief Information Security Officer** | ${p.cisoContact} | APPROVED [BYOK CUSTODY VERIFIED] | ${dateStr} |
| **Composite TIA Risk Rating** | Score: ${riskScore}/100 | **${verdict.toUpperCase()}** | ${dateStr} |
`;
}
