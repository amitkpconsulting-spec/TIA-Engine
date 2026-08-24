export type EntityType = 
  | 'bank' 
  | 'insurer' 
  | 'investment_firm' 
  | 'payment_institution' 
  | 'credit_union' 
  | 'general_enterprise';

export type EntityRole = 'controller' | 'joint_controller' | 'processor' | 'sub_processor';

export type TransferMechanism = 
  | 'eu_scc_module_1' // Controller to Controller
  | 'eu_scc_module_2' // Controller to Processor
  | 'eu_scc_module_3' // Processor to Processor
  | 'eu_scc_module_4' // Processor to Controller
  | 'uk_idta' // UK International Data Transfer Agreement
  | 'uk_addendum_scc' // UK Addendum to EU SCCs
  | 'bcr_controller' // Binding Corporate Rules Controller
  | 'bcr_processor' // Binding Corporate Rules Processor
  | 'adequacy_decision' // European Commission / UK Adequacy
  | 'art_49_derogation' // Explicit consent, vital interests, contract necessity
  | 'ad_hoc_clauses';

export type TransferType = 
  | 'remote_access_no_download' 
  | 'remote_access_with_download' 
  | 'transmission_hosting_storage' 
  | 'continuous_api_streaming';

export type KeyManagementModel = 
  | 'byok_local_hsm' // Keys generated, stored and controlled on-premises / in EEA/UK
  | 'hyok_hold_your_own_key' // Hold Your Own Key
  | 'cloud_kms_customer_managed' // Cloud KMS (KMS in provider cloud, customer managed)
  | 'provider_managed_keys' // Provider holds & manages keys (High risk for foreign surveillance)
  | 'no_encryption'; // Plaintext

export interface ExternalIntegrations {
  serviceNowGrcId?: string;
  oneTrustTiaId?: string;
  praMtpRegisterId?: string;
  doraIctRegisterId?: string;
  jiraIssueKey?: string;
  oscalComponentId?: string;
  customSystemId?: string;
}

export interface CrossFrameworkPayloads {
  jsonLd: string;
  oscalJson: Record<string, any>;
  serviceNowPayload: Record<string, any>;
  oneTrustPayload: Record<string, any>;
  praMtpPayload: Record<string, any>;
  doraRegisterPayload: Record<string, any>;
  restWebhookPayload: Record<string, any>;
}

export interface SubProcessor {
  id: string;
  name: string;
  country: string;
  serviceDescription: string;
  hasAccessToClearData: boolean;
  transferTool: string;
  equivalentAuditRights: boolean;
}

export interface TransferProfile {
  id: string;
  tiaReferenceId?: string; // Standard canonical TIA ID e.g., 'TIA-2026-8A4F-E29B'
  universalUniqueIdentifier?: string; // UUID v4
  crossFrameworkUrn?: string; // URN scheme e.g., 'urn:grc:tia:2026:8a4fe29b'
  externalIntegrations?: ExternalIntegrations;
  title: string;
  createdDate: string;
  lastUpdated: string;
  
  // Exporter Info
  exporterName: string;
  exporterType: EntityType;
  exporterRole: EntityRole;
  exporterCountry: string; // Origin, e.g. 'United Kingdom', 'France', 'Germany'
  dpoContact: string;
  cisoContact: string;
  seniorManagerFunction?: string; // e.g. 'SMF24 - Chief Operations'

  // Importer Info
  importerName: string;
  importerRole: EntityRole;
  importerCountry: string; // Destination, e.g. 'United States', 'India', 'China'
  importerSector: string;
  isCoveredBySectorExemption: boolean;

  // Transfer Characteristics
  transferMechanism: TransferMechanism;
  transferType: TransferType;
  transferFrequency: 'single' | 'occasional' | 'regular_continuous';
  estimatedDataSubjectsCount: string;
  dataVolume: string;

  // Data Categories
  dataCategories: {
    basicOperational: boolean; // Standard corporate/ops
    lowRiskPii: boolean; // Name, corporate email, job title, employee ID
    specialCategoryArt9: boolean; // Health, biometric, racial, political, sexual
    criminalConvictionsArt10: boolean; // Police record checks
    nationalIdentifierArt87: boolean; // French NIR, SSN, Tax ID
    financialFraudSensitive: boolean; // Credit card PAN, CVV, bank account, transactional
    intellectualPropertyConfidential: boolean; // Trading algorithms, risk models
  };
  sensitiveDataDescription: string;

  // PRA SS2/21 Criticality & Materiality
  isMaterialOutsourcing: boolean; // CIF determination
  importantBusinessService: string; // e.g., 'Retail Payment Processing & Settlement'
  impactToleranceHours: number; // e.g. 4 hours
  stepInRiskAcknowledged: boolean;
  intragroupArrangement: boolean;
  controlAndInfluenceLevel: 'high' | 'medium' | 'low';
  
  // Technical Baseline
  transitEncryption: boolean;
  transitProtocol: string; // e.g., 'TLS 1.3 / mTLS'
  atRestEncryption: boolean;
  atRestAlgorithm: string; // e.g., 'AES-256-GCM'
  keyManagement: KeyManagementModel;
  pseudonymizationPriorToTransfer: boolean;
  confidentialComputingEnclaves: boolean;
  zeroTrustNetworkAccess: boolean;

  // Organizational & Contractual Baseline
  hasDirectAuditRights: boolean;
  praDirectInspectionClause: boolean; // S165A/S166 FSMA right
  foreignWarrantNotificationClause: boolean;
  foreignWarrantChallengeCommitment: boolean;
  transparencyReportAvailable: boolean;
  pastSurveillanceRequestsCount: number;
  dataSubjectIndemnification: boolean;
  unannouncedAuditPermitted: boolean;
  immediateExitAndPurgeClause: boolean;
  
  // Stressed Exit & Continuity
  testedStressedExitPlan: boolean;
  multiRegionActiveFailover: boolean;
  substitutabilityRating: 'immediate_hot_standby' | 'substitutable_under_3_months' | 'vendor_lock_in_complex';
  evergreenReviewCadenceYears: number; // Default 3 years or 1 year for CIF

  // Sub-processors / Supply chain
  subProcessors: SubProcessor[];
  priorWrittenAuthRequiredForSubprocessors: boolean;
  subprocessorNoticePeriodDays: number;
}

export interface JurisdictionIntelligence {
  countryCode: string;
  countryName: string;
  flagEmoji: string;
  adequacyStatus: 'full_adequacy' | 'partial_adequacy' | 'no_adequacy' | 'high_risk_list';
  adequacyDetails: string;
  dataProtectionLaw: string;
  hasIndependentDPA: boolean;
  dpaName: string;
  
  // Surveillance & Public Authority Access
  surveillanceLaws: {
    statuteName: string;
    scopeAndPowers: string;
    extraterritorialReach: boolean;
    appliesToCloudProviders: boolean;
    bulkCollectionRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  }[];

  // EDPB 02/2020 Essential Guarantees Assessment
  guarantees: {
    clearPreciseRules: boolean; // Guarantee A
    clearPreciseRulesNotes: string;
    necessaryAndProportionate: boolean; // Guarantee B
    necessaryAndProportionateNotes: string;
    independentOversight: boolean; // Guarantee C
    independentOversightNotes: string;
    effectiveRedressForForeigners: boolean; // Guarantee D
    effectiveRedressNotes: string;
  };

  overallSurveillanceRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  legalRiskSummary: string;
  recommendedSupplementaryPillars: ('technical' | 'organizational' | 'legal')[];
}

export interface SupplementaryMeasure {
  id: string;
  pillar: 'Technical' | 'Organizational' | 'Legal';
  controlName: string;
  description: string;
  implementationDetail: string;
  edpbReference: string; // e.g. EDPB 01/2020 Annex 2 Use Case 1/3
  status: 'implemented' | 'recommended' | 'waived_with_risk_acceptance';
  riskMitigated: string;
  residualRisk: 'Low' | 'Medium' | 'High';
  assignedOwner: string;
  targetCompletionDate: string;
}

export interface PraChecklistItem {
  id: string;
  category: 'Audit & Access' | 'Materiality & Governance' | 'Sub-Outsourcing' | 'Stressed Exit & BCP' | 'MTP Register';
  ruleReference: string; // e.g., SS2/21 Chapter 8 / Rule 165A FSMA
  requirementDescription: string;
  complianceStatus: 'Compliant' | 'Gaps Identified' | 'Not Applicable';
  evidenceOrRemediation: string;
}

export interface TIAEvaluationResult {
  evaluationId: string;
  timestamp: string;
  profileId: string;
  tiaReferenceId: string; // Canonical TIA Reference ID e.g. TIA-2026-8A4F-E29B
  universalUniqueIdentifier: string; // UUID v4
  crossFrameworkUrn: string; // urn:grc:tia:2026:8a4fe29b
  cryptographicFingerprint: string; // SHA-256 integrity hash of assessment state
  externalIntegrations: ExternalIntegrations;
  crossFrameworkPayloads?: CrossFrameworkPayloads;
  
  // Executive Verdict
  verdict: 'Approved' | 'Approved with Conditions' | 'Prohibited';
  verdictRationale: string;
  overallRiskScore: number; // 0 to 100
  riskCategory: 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Critical Risk';
  
  // Pillar Scores
  scores: {
    surveillanceRiskScore: number; // 0-100
    technicalProtectionScore: number; // 0-100
    legalSafeguardsScore: number; // 0-100
    praResilienceScore: number; // 0-100
  };

  // Screening summaries
  transferMechanismSummary: string;
  targetCountryRiskSummary: string;
  praCriticalityAssessment: 'Material Outsourcing / Critical Function (CIF)' | 'Non-Material Outsourcing';
  
  // Detailed Matrix & Checklist
  remediationMatrix: SupplementaryMeasure[];
  praChecklist: PraChecklistItem[];
  essentialGuaranteesVerdict: {
    guaranteeA: boolean;
    guaranteeB: boolean;
    guaranteeC: boolean;
    guaranteeD: boolean;
    impairmentIdentified: boolean;
  };
  
  // Required Follow-up Actions (CNIL Step 5)
  actionPlan: {
    actionNumber: number;
    title: string;
    owner: string;
    daysEstimated: number;
    deadline: string;
    priority: 'Critical' | 'High' | 'Medium';
  }[];

  // Re-evaluation cadence (CNIL Step 6)
  reEvaluationSchedule: {
    intervalMonths: number;
    nextReviewDate: string;
    triggerEvents: string[];
  };

  // Formally Generated Policy
  generatedPolicyDocument: string;
}
