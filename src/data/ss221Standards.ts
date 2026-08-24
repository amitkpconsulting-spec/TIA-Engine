export interface RuleRequirement {
  id: string;
  chapter: string;
  paragraph: string;
  title: string;
  summary: string;
  mandatoryForMaterial: boolean;
  appliesToInsurers: boolean;
  appliesToBanks: boolean;
}

export interface GoogleContractMappingItem {
  id: number;
  chapterNumber: number;
  chapterTitle: string;
  frameworkRef: string;
  frameworkRequirement: string;
  googleCloudCommentary: string;
  contractReference: string;
  relevancePillar: 'Technical' | 'Contractual' | 'Organizational' | 'Governance';
  praRiskCategory: 'Data Security' | 'Audit & Access' | 'Sub-Outsourcing' | 'Exit & Resilience' | 'Agreements';
}

export const PRA_SS221_GOOGLE_MAPPINGS: GoogleContractMappingItem[] = [
  // Chapter 6: Outsourcing Agreements
  {
    id: 1,
    chapterNumber: 6,
    chapterTitle: "Chapter 6: Outsourcing agreements",
    frameworkRef: "6.1",
    frameworkRequirement: "In line with Article 31(3) of MODR (banks) and 274(3)(c) of Solvency II (insurers), all outsourcing arrangements must be set out in a written agreement.",
    googleCloudCommentary: "The Google Cloud Financial Services Contract is the written contract between the parties.",
    contractReference: "Financial Services Contract",
    relevancePillar: "Contractual",
    praRiskCategory: "Agreements"
  },
  {
    id: 2,
    chapterNumber: 6,
    chapterTitle: "Chapter 6: Outsourcing agreements",
    frameworkRef: "6.2",
    frameworkRequirement: "Where there is a master service agreement allowing adding/removing services, each outsourced service should be appropriately documented.",
    googleCloudCommentary: "Google Workspace services are described on the services summary page. The customer decides which services to use and the arrangement scope.",
    contractReference: "Definitions & Services Summary",
    relevancePillar: "Governance",
    praRiskCategory: "Agreements"
  },
  {
    id: 3,
    chapterNumber: 6,
    chapterTitle: "Chapter 6: Outsourcing agreements",
    frameworkRef: "6.3",
    frameworkRequirement: "Written agreements must include contractual safeguards to monitor risks and ensure agreements do not impede PRA's supervisory ability.",
    googleCloudCommentary: "SLAs provide measurable performance standards. Google grants audit, access and information rights to regulated entities and supervisory authorities.",
    contractReference: "Services & Enabling Customer Compliance",
    relevancePillar: "Contractual",
    praRiskCategory: "Audit & Access"
  },
  {
    id: 4,
    chapterNumber: 6,
    chapterTitle: "Chapter 6: Outsourcing agreements",
    frameworkRef: "6.4 (a)",
    frameworkRequirement: "Clear description of the outsourced function and technical support services to be provided.",
    googleCloudCommentary: "Google Workspace services and Technical Support Services Guidelines (TSSG) are clearly defined.",
    contractReference: "Technical Support Guidelines",
    relevancePillar: "Contractual",
    praRiskCategory: "Agreements"
  },
  {
    id: 5,
    chapterNumber: 6,
    chapterTitle: "Chapter 6: Outsourcing agreements",
    frameworkRef: "6.4 (b)",
    frameworkRequirement: "Start date, renewal date, end date, and notice periods regarding termination for the service provider and the firm.",
    googleCloudCommentary: "Explicitly governed in the Term and Termination clauses of the Google Cloud Financial Services Contract.",
    contractReference: "Term and Termination",
    relevancePillar: "Contractual",
    praRiskCategory: "Agreements"
  },
  {
    id: 6,
    chapterNumber: 6,
    chapterTitle: "Chapter 6: Outsourcing agreements",
    frameworkRef: "6.4 (c)",
    frameworkRequirement: "Governing law of the agreement and financial payment obligations.",
    googleCloudCommentary: "Governing Law (English Law for UK entities) and Payment Terms explicitly agreed.",
    contractReference: "Governing Law & Payment Terms",
    relevancePillar: "Contractual",
    praRiskCategory: "Agreements"
  },
  {
    id: 7,
    chapterNumber: 6,
    chapterTitle: "Chapter 6: Outsourcing agreements",
    frameworkRef: "6.4 (d)",
    frameworkRequirement: "Data location(s) where data will be stored, processed, or transferred, and advance notice before changing locations.",
    googleCloudCommentary: "Customer choice of storage regions (e.g. EU/UK Data Residency), plus contractual commitment not to move outside selected regions.",
    contractReference: "Data Location (Service Specific Terms)",
    relevancePillar: "Technical",
    praRiskCategory: "Data Security"
  },
  {
    id: 8,
    chapterNumber: 6,
    chapterTitle: "Chapter 6: Outsourcing agreements",
    frameworkRef: "6.4 (e)",
    frameworkRequirement: "Right of the firm to monitor ongoing performance (KPIs/SLAs), Access Transparency, and Status Dashboard logs.",
    googleCloudCommentary: "Real-time Status Dashboard, Admin Console Reports, and Access Transparency logs revealing who accessed user content and why.",
    contractReference: "Ongoing Performance Monitoring & Access Transparency",
    relevancePillar: "Organizational",
    praRiskCategory: "Audit & Access"
  },
  {
    id: 9,
    chapterNumber: 6,
    chapterTitle: "Chapter 6: Outsourcing agreements",
    frameworkRef: "6.4 (f)",
    frameworkRequirement: "Business continuity and disaster recovery requirements; data access on insolvency.",
    googleCloudCommentary: "Annual testing of BCP; customer retains all IP and can export data anytime including throughout post-termination transition term.",
    contractReference: "BCP / Disaster Recovery & Data Export",
    relevancePillar: "Organizational",
    praRiskCategory: "Exit & Resilience"
  },
  {
    id: 10,
    chapterNumber: 6,
    chapterTitle: "Chapter 6: Outsourcing agreements",
    frameworkRef: "6.4 (g)",
    frameworkRequirement: "Cooperation with PRA and Bank of England as resolution authority (Banking Act 2009 / BRRD Sec 48Z/70C-D).",
    googleCloudCommentary: "Google commits to continue providing Services during resolution as required by BRRD, supporting financial stability.",
    contractReference: "Support through Resolution (BRRD)",
    relevancePillar: "Contractual",
    praRiskCategory: "Agreements"
  },

  // Chapter 7: Data Security
  {
    id: 11,
    chapterNumber: 7,
    chapterTitle: "Chapter 7: Data security",
    frameworkRef: "7.1 - 7.5",
    frameworkRequirement: "Broad interpretation of data; risk-based data classification (confidential, personal, sensitive, transactional).",
    googleCloudCommentary: "Customer classifies data; Google protects all customer data under Cloud Data Processing Addendum (CDPA) commitments.",
    contractReference: "CDPA Definitions & Security Measures",
    relevancePillar: "Governance",
    praRiskCategory: "Data Security"
  },
  {
    id: 12,
    chapterNumber: 7,
    chapterTitle: "Chapter 7: Data security",
    frameworkRef: "7.6 - 7.9",
    frameworkRequirement: "Risk-based data location approach leveraging multi-zone and multi-region resilience while managing legal access risks.",
    googleCloudCommentary: "Multi-zone data centers worldwide, EU data location controls, with consistent contractual commitments across all facilities.",
    contractReference: "Data Transfers (CDPA) & Service Terms",
    relevancePillar: "Technical",
    praRiskCategory: "Data Security"
  },
  {
    id: 13,
    chapterNumber: 7,
    chapterTitle: "Chapter 7: Data security",
    frameworkRef: "7.10 - 7.11",
    frameworkRequirement: "Encryption at rest, encryption in transit (TLS 1.3), configuration management, IAM, and insider threat monitoring.",
    googleCloudCommentary: "Default AES-256 encryption at rest, in-transit encryption across WAN, Cloud IAM, Security Center, and Cloud Audit Logs.",
    contractReference: "Data Security (CDPA) & Encryption Whitepaper",
    relevancePillar: "Technical",
    praRiskCategory: "Data Security"
  },
  {
    id: 14,
    chapterNumber: 7,
    chapterTitle: "Chapter 7: Data security",
    frameworkRef: "7.12",
    frameworkRequirement: "Encryption keys kept secure by the firm (BYOK/HYOK) and unencrypted data accessible to PRA upon regulatory demand.",
    googleCloudCommentary: "Google Workspace Client-Side Encryption (CSE) & Cloud KMS / EKM allow customer to hold keys on-premises or with 3rd-party HSM.",
    contractReference: "Customer Information, Audit & Access",
    relevancePillar: "Technical",
    praRiskCategory: "Data Security"
  },

  // Chapter 8: Access, Audit and Information Rights
  {
    id: 15,
    chapterNumber: 8,
    chapterTitle: "Chapter 8: Access, audit, and information rights",
    frameworkRef: "8.1 - 8.4",
    frameworkRequirement: "Statutory information gathering powers (Section 165A/166 FSMA), full access rights, penetration test results.",
    googleCloudCommentary: "Google grants full audit, access and information rights to regulated entities and PRA. Independent 3rd-party pen test reports provided.",
    contractReference: "Regulator & Customer Audit & Access",
    relevancePillar: "Contractual",
    praRiskCategory: "Audit & Access"
  },
  {
    id: 16,
    chapterNumber: 8,
    chapterTitle: "Chapter 8: Access, audit, and information rights",
    frameworkRef: "8.9 - 8.12",
    frameworkRequirement: "Third party certificates and reports (ISO 27001, ISO 27017, ISO 27018, SOC 1/2/3) and on-site audit rights.",
    googleCloudCommentary: "Annual third-party SOC 1/2/3 and ISO audits available on Compliance Reports Manager; on-site audit rights without artificial preconditions.",
    contractReference: "Certifications and Audit Reports",
    relevancePillar: "Organizational",
    praRiskCategory: "Audit & Access"
  },
  {
    id: 17,
    chapterNumber: 8,
    chapterTitle: "Chapter 8: Access, audit, and information rights",
    frameworkRef: "8.13 - 8.14",
    frameworkRequirement: "Pooled audits organized by groups of regulated financial firms for efficiency and shared findings.",
    googleCloudCommentary: "Google actively supports pooled audits (e.g. CCAG Cloud Compliance Advisory Group) for European and UK financial institutions.",
    contractReference: "Enabling Customer Compliance (Pooled Audits)",
    relevancePillar: "Organizational",
    praRiskCategory: "Audit & Access"
  },

  // Chapter 9: Sub-outsourcing
  {
    id: 18,
    chapterNumber: 9,
    chapterTitle: "Chapter 9: Sub-outsourcing",
    frameworkRef: "9.1 - 9.5",
    frameworkRequirement: "Oversight of chain outsourcing, sub-processor registry visibility, and impact assessment on operational resilience.",
    googleCloudCommentary: "Google publishes complete list of subcontractors, provides advance notice of changes, and assesses subcontractor suitability.",
    contractReference: "Google Subcontractors (CDPA)",
    relevancePillar: "Governance",
    praRiskCategory: "Sub-Outsourcing"
  },
  {
    id: 19,
    chapterNumber: 9,
    chapterTitle: "Chapter 9: Sub-outsourcing",
    frameworkRef: "9.6 - 9.9",
    frameworkRequirement: "Prior written authorization (GDPR Art 28), contractual flow-down of audit rights, and right to object/terminate.",
    googleCloudCommentary: "Subcontractors bound to equivalent high standards; regulated entity retains contractual right to terminate if changes increase risk.",
    contractReference: "Google Subcontractors Flow-Down",
    relevancePillar: "Contractual",
    praRiskCategory: "Sub-Outsourcing"
  },

  // Chapter 10: Business Continuity and Exit Plans
  {
    id: 20,
    chapterNumber: 10,
    chapterTitle: "Chapter 10: Business continuity and exit plans",
    frameworkRef: "10.1 - 10.5",
    frameworkRequirement: "Documented exit plans for both stressed (insolvency/liquidation) and non-stressed exits; cloud resiliency options.",
    googleCloudCommentary: "Annual BCP testing, multi-region architecture, hybrid cloud (Anthos), and open data export tools.",
    contractReference: "Business Continuity & Disaster Recovery",
    relevancePillar: "Organizational",
    praRiskCategory: "Exit & Resilience"
  },
  {
    id: 21,
    chapterNumber: 10,
    chapterTitle: "Chapter 10: Business continuity and exit plans",
    frameworkRef: "10.10 - 10.16",
    frameworkRequirement: "Stressed exit provisions, 12-month post-termination transition term, open data standards (SWIPO), and repatriation to on-premises.",
    googleCloudCommentary: "Google provides 12 months transition assistance post-termination, supports SWIPO Data Portability Codes, and full data export.",
    contractReference: "Transition Term & Data Export (CDPA)",
    relevancePillar: "Organizational",
    praRiskCategory: "Exit & Resilience"
  }
];

export const SS221_RULES: RuleRequirement[] = [
  {
    id: 'gov-smf24',
    chapter: 'Chapter 4: Governance & Record-Keeping',
    paragraph: 'Para 4.7 - 4.9',
    title: 'SM&CR Prescribed Responsibility (SMF24)',
    summary: 'Allocation of Prescribed Responsibility for outsourcing and third-party risk management to a Senior Management Function (typically SMF24 Chief Operations). Statements of Responsibilities must explicitly document this framework.',
    mandatoryForMaterial: true,
    appliesToInsurers: true,
    appliesToBanks: true,
  },
  {
    id: 'gov-empty-shells',
    chapter: 'Chapter 4: Governance & Record-Keeping',
    paragraph: 'Para 4.6',
    title: 'Threshold Conditions & Prohibition of Empty Shells',
    summary: 'Firms must retain appropriate non-financial and financial resources to supervise third parties and avoid becoming "empty shells" incapable of fulfilling Threshold Conditions.',
    mandatoryForMaterial: true,
    appliesToInsurers: true,
    appliesToBanks: true,
  },
  {
    id: 'mat-cif-definition',
    chapter: 'Chapter 5: Pre-Outsourcing Phase',
    paragraph: 'Para 5.1 - 5.14 / Table 6 & 7',
    title: 'Material Outsourcing / Critical Function (CIF) Assessment',
    summary: 'Assessment whether failure would impair the firm’s safety and soundness, compliance with Fundamental Rules, policyholder protection (insurers), or UK financial stability (O-SIIs). Cloud core systems, settlement, and AI trading models are strictly material.',
    mandatoryForMaterial: true,
    appliesToInsurers: true,
    appliesToBanks: true,
  },
  {
    id: 'notif-pra-23b',
    chapter: 'Chapter 5: Pre-Outsourcing Phase',
    paragraph: 'Para 5.19 - 5.21 (Rule 2.3B)',
    title: 'Prior Notification to PRA / FCA via FCA Connect',
    summary: 'Firms must submit notifications of material third-party arrangements prior to execution or material change using the regulatory notification template.',
    mandatoryForMaterial: true,
    appliesToInsurers: true,
    appliesToBanks: true,
  },
  {
    id: 'con-lockin',
    chapter: 'Chapter 5: Pre-Outsourcing Phase',
    paragraph: 'Para 5.25',
    title: 'Concentration Risk & Supply Chain Dependencies',
    summary: 'Management of firm-wide concentration risk, fourth-party supply chain bottlenecks, vendor lock-in, and geographical aggregation in single non-EEA/UK jurisdictions.',
    mandatoryForMaterial: true,
    appliesToInsurers: true,
    appliesToBanks: true,
  },
  {
    id: 'agr-written',
    chapter: 'Chapter 6: Outsourcing Agreements',
    paragraph: 'Para 6.4',
    title: 'Mandatory Contractual Minimum Provisions',
    summary: 'Written agreements must set out service levels, governing law, data location notification, business continuity obligations, resolution references (BRRD Sec 48Z/70C-D Banking Act), and termination triggers.',
    mandatoryForMaterial: true,
    appliesToInsurers: true,
    appliesToBanks: true,
  },
  {
    id: 'sec-data-key-mgmt',
    chapter: 'Chapter 7: Data Security & Key Custody',
    paragraph: 'Para 7.10 - 7.12',
    title: 'Data-in-Transit, Data-at-Rest & Key Custody',
    summary: 'Robust controls for data encryption. Encryption keys must be kept secure by the firm (e.g. BYOK/HYOK in local HSM). Data must be accessible to the PRA in an unencrypted readable format upon regulatory request.',
    mandatoryForMaterial: true,
    appliesToInsurers: true,
    appliesToBanks: true,
  },
  {
    id: 'aud-s165a-s166',
    chapter: 'Chapter 8: Access, Audit & Information Rights',
    paragraph: 'Para 8.1 - 8.12 / Table 8 & 9',
    title: 'Unrestricted PRA & Bank Access (Section 165A / 166 FSMA)',
    summary: 'Unrestricted rights for firms, their auditors, and the PRA/Bank to inspect systems, premises, penetration tests, and personnel. Third parties must agree to cooperate with Section 166 skilled persons.',
    mandatoryForMaterial: true,
    appliesToInsurers: true,
    appliesToBanks: true,
  },
  {
    id: 'sub-chain-controls',
    chapter: 'Chapter 9: Sub-Outsourcing & Chain Risk',
    paragraph: 'Para 9.3 - 9.9',
    title: 'Sub-Outsourcing Authorisation & Audit Flow-Down',
    summary: 'Prior written authorization required before sub-contracting. Sub-processors must grant equivalent audit, inspection, and security rights to the firm, Bank, and PRA.',
    mandatoryForMaterial: true,
    appliesToInsurers: true,
    appliesToBanks: true,
  },
  {
    id: 'exit-stressed-bcp',
    chapter: 'Chapter 10: Business Continuity & Stressed Exit',
    paragraph: 'Para 10.1 - 10.25 / Table 11',
    title: 'Stressed Exit Strategy & Multi-Region Cloud Resilience',
    summary: 'Documented, tested exit plan for insolvency or sudden termination. Evaluation of hybrid cloud, multi-region failover, data repatriation to on-premises, and TUPE employee transfer provisions.',
    mandatoryForMaterial: true,
    appliesToInsurers: true,
    appliesToBanks: true,
  }
];

export const MTP_REGISTER_FIELDS = [
  { field: 'Firm FRN & Legal Name', desc: 'Financial Conduct Authority / PRA Firm Reference Number' },
  { field: 'Service Provider Name & LEI', desc: 'Legal Entity Identifier of Primary Vendor' },
  { field: 'Function Category & CIF Flag', desc: 'Classification of outsourced function and linkage to Important Business Services' },
  { field: 'Data Storage & Processing Location', desc: 'Exact geographic regions and availability zones where data is processed' },
  { field: 'Supply Chain / Sub-outsourcer Ranking', desc: 'Identification of 4th party critical dependencies' },
  { field: 'SMF Accountable Executive', desc: 'SMF24 or designated Senior Manager responsible for sign-off' },
  { field: 'Exit Plan Testing Date', desc: 'Last date stressed exit and data portability was validated' }
];
