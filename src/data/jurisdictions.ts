import { JurisdictionIntelligence } from '../types/tia';

export const JURISDICTIONS: Record<string, JurisdictionIntelligence> = {
  'United States': {
    countryCode: 'US',
    countryName: 'United States',
    flagEmoji: '🇺🇸',
    adequacyStatus: 'partial_adequacy', // EU-US DPF applies only to certified entities
    adequacyDetails: 'EU-US Data Privacy Framework (July 2023) covers certified commercial entities. Non-certified entities or non-DPF flows require Article 46 transfer tools (SCCs) plus supplementary measures under Schrems II.',
    dataProtectionLaw: 'State-level privacy acts (CCPA/CPRA, CPA, VCDPA) and sector-specific federal laws (GLBA, HIPAA). No omnibus federal privacy act.',
    hasIndependentDPA: false,
    dpaName: 'Federal Trade Commission (FTC) & State Attorneys General / CPPA',
    surveillanceLaws: [
      {
        statuteName: 'FISA Section 702 (Foreign Intelligence Surveillance Act)',
        scopeAndPowers: 'Authorizes targeting of non-US persons located abroad via electronic communications service providers without individualized judicial warrants.',
        extraterritorialReach: true,
        appliesToCloudProviders: true,
        bulkCollectionRisk: 'High',
      },
      {
        statuteName: 'Executive Order 12333',
        scopeAndPowers: 'Signals intelligence collection on foreign telecommunications and transit conduits outside US territory without judicial oversight.',
        extraterritorialReach: true,
        appliesToCloudProviders: false,
        bulkCollectionRisk: 'High',
      },
      {
        statuteName: 'CLOUD Act (Clarifying Lawful Overseas Use of Data)',
        scopeAndPowers: 'Compels US-based cloud providers to provide customer data within their possession, custody, or control, regardless of whether data is stored inside or outside the US.',
        extraterritorialReach: true,
        appliesToCloudProviders: true,
        bulkCollectionRisk: 'Medium',
      },
      {
        statuteName: 'Executive Order 14086 (Redress Mechanism)',
        scopeAndPowers: 'Introduces proportionality safeguards for US signals intelligence and establishes the Data Protection Review Court (DPRC). Validated for DPF, scrutinized for SCC transfers.',
        extraterritorialReach: false,
        appliesToCloudProviders: true,
        bulkCollectionRisk: 'Low',
      }
    ],
    guarantees: {
      clearPreciseRules: true,
      clearPreciseRulesNotes: 'Surveillance authorities are published under 50 U.S.C. § 1881a, but broad operational definitions allow wide collection scope.',
      necessaryAndProportionate: false,
      necessaryAndProportionateNotes: 'CJEU Schrems II held that Section 702 mass surveillance exceeds European proportionality standards for non-US persons.',
      independentOversight: false,
      independentOversightNotes: 'FISC approves programmatic annual certifications rather than individualized warrants for target selectors.',
      effectiveRedressForForeigners: false,
      effectiveRedressNotes: 'EO 14086 DPRC offers two-tier review, but standing hurdles and state secrets privilege remain for standard SCC data flows.'
    },
    overallSurveillanceRisk: 'High',
    legalRiskSummary: 'FISA 702 and CLOUD Act compel cloud CSPs to disclose data in cleartext unless customer holds exclusive cryptographic keys outside US reach (BYOK/HYOK).',
    recommendedSupplementaryPillars: ['technical', 'organizational', 'legal']
  },

  'India': {
    countryCode: 'IN',
    countryName: 'India',
    flagEmoji: '🇮🇳',
    adequacyStatus: 'no_adequacy',
    adequacyDetails: 'No adequacy decision from EU or UK. Standard Contractual Clauses (SCCs) or UK IDTA required alongside rigorous TIA.',
    dataProtectionLaw: 'Digital Personal Data Protection Act, 2023 (DPDPA) & Information Technology Act 2000.',
    hasIndependentDPA: true,
    dpaName: 'Data Protection Board of India (DPBI)',
    surveillanceLaws: [
      {
        statuteName: 'Section 69 Information Technology Act, 2000',
        scopeAndPowers: 'Grants central and state governments power to intercept, monitor, or decrypt any electronic information for national sovereignty and public order.',
        extraterritorialReach: false,
        appliesToCloudProviders: true,
        bulkCollectionRisk: 'High',
      },
      {
        statuteName: 'CERT-In Cyber Security Directions (April 2022)',
        scopeAndPowers: 'Mandates 6-hour mandatory security incident reporting and 5-year subscriber/IP log retention for cloud and VPN providers.',
        extraterritorialReach: false,
        appliesToCloudProviders: true,
        bulkCollectionRisk: 'Medium',
      }
    ],
    guarantees: {
      clearPreciseRules: true,
      clearPreciseRulesNotes: 'Decryption and interception rules codified under IT Procedure Rules 2009.',
      necessaryAndProportionate: false,
      necessaryAndProportionateNotes: 'Broad public order exemptions in DPDPA Section 17 permit state surveillance with limited necessity checks.',
      independentOversight: false,
      independentOversightNotes: 'Interception authorization is executive (Home Secretary) rather than prior judicial review.',
      effectiveRedressForForeigners: false,
      effectiveRedressNotes: 'Limited judicial standing for non-resident data subjects to contest executive interception orders.'
    },
    overallSurveillanceRisk: 'High',
    legalRiskSummary: 'Executive-led decryption powers under Section 69 IT Act make on-premise pseudonymization and client-side encryption imperative before data export to India BPO/sub-processors.',
    recommendedSupplementaryPillars: ['technical', 'organizational', 'legal']
  },

  'China': {
    countryCode: 'CN',
    countryName: 'China (PRC)',
    flagEmoji: '🇨🇳',
    adequacyStatus: 'high_risk_list',
    adequacyDetails: 'No adequacy decision. Identified on QBE/PRA high risk transfer list. Strict cross-border data transfer security assessments by CAC.',
    dataProtectionLaw: 'Personal Information Protection Law (PIPL), Data Security Law (DSL), Cybersecurity Law (CSL).',
    hasIndependentDPA: false,
    dpaName: 'Cyberspace Administration of China (CAC)',
    surveillanceLaws: [
      {
        statuteName: 'National Intelligence Law (Article 7 & 14)',
        scopeAndPowers: 'Mandates that any organization or citizen must support, assist, and cooperate with state intelligence work and maintain state secrets.',
        extraterritorialReach: true,
        appliesToCloudProviders: true,
        bulkCollectionRisk: 'Critical',
      },
      {
        statuteName: 'Data Security Law (DSL) Core Data System',
        scopeAndPowers: 'Categorizes data into Core, Important, and General. Core data cannot leave the mainland under any circumstance.',
        extraterritorialReach: true,
        appliesToCloudProviders: true,
        bulkCollectionRisk: 'Critical',
      },
      {
        statuteName: 'Anti-Espionage Law (2023 Revision)',
        scopeAndPowers: 'Extends inspection powers of national security authorities over electronic devices and cloud databases for state security.',
        extraterritorialReach: true,
        appliesToCloudProviders: true,
        bulkCollectionRisk: 'Critical',
      }
    ],
    guarantees: {
      clearPreciseRules: false,
      clearPreciseRulesNotes: 'Vague definitions of "national interest" and "important data" create unpredictable regulatory intervention.',
      necessaryAndProportionate: false,
      necessaryAndProportionateNotes: 'State intelligence cooperation obligations contain no democratic proportionality limits.',
      independentOversight: false,
      independentOversightNotes: 'National security decisions are immune from independent judicial or constitutional review.',
      effectiveRedressForForeigners: false,
      effectiveRedressNotes: 'No mechanism for foreign nationals to seek legal redress against state security data requisitions.'
    },
    overallSurveillanceRisk: 'Critical',
    legalRiskSummary: 'National Intelligence Law Article 7 legally prohibits companies from refusing government data access requests. Transfers of identifiable personal data are generally prohibited or require irreversible pseudonymization.',
    recommendedSupplementaryPillars: ['technical', 'organizational', 'legal']
  },

  'United Kingdom': {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    flagEmoji: '🇬🇧',
    adequacyStatus: 'full_adequacy',
    adequacyDetails: 'European Commission Adequacy Decision granted in June 2021 (valid until 2025/2029 review). Mutual recognition between UK and EU/EEA.',
    dataProtectionLaw: 'UK GDPR & Data Protection Act 2018 (supplemented by PRA SS2/21 and FCA SYSC 8).',
    hasIndependentDPA: true,
    dpaName: 'Information Commissioner’s Office (ICO)',
    surveillanceLaws: [
      {
        statuteName: 'Investigatory Powers Act 2016 (IPA)',
        scopeAndPowers: 'Governs targeted and bulk interception subject to "double-lock" judicial commissioner approval.',
        extraterritorialReach: false,
        appliesToCloudProviders: true,
        bulkCollectionRisk: 'Low',
      }
    ],
    guarantees: {
      clearPreciseRules: true,
      clearPreciseRulesNotes: 'Comprehensive primary statutory framework scrutinized by EU adequacy assessment.',
      necessaryAndProportionate: true,
      necessaryAndProportionateNotes: 'Explicit necessity and proportionality tests enforced by the Investigatory Powers Tribunal.',
      independentOversight: true,
      independentOversightNotes: 'Judicial Commissioners (IPCO) must independently approve ministerial interception warrants.',
      effectiveRedressForForeigners: true,
      effectiveRedressNotes: 'Investigatory Powers Tribunal (IPT) provides accessible judicial remedy regardless of nationality.'
    },
    overallSurveillanceRisk: 'Low',
    legalRiskSummary: 'UK possesses full EU adequacy status. Standard business transfers require no supplementary TIA measures, though PRA SS2/21 CIF outsourcing expectations still apply.',
    recommendedSupplementaryPillars: []
  },

  'Switzerland': {
    countryCode: 'CH',
    countryName: 'Switzerland',
    flagEmoji: '🇨🇭',
    adequacyStatus: 'full_adequacy',
    adequacyDetails: 'European Commission Adequacy Decision renewed in January 2024. UK adequacy recognition.',
    dataProtectionLaw: 'Federal Act on Data Protection (Revised FADP 2023).',
    hasIndependentDPA: true,
    dpaName: 'Federal Data Protection and Information Commissioner (FDPIC)',
    surveillanceLaws: [
      {
        statuteName: 'Federal Act on the Intelligence Service (IntelSA)',
        scopeAndPowers: 'Regulates surveillance measures with mandatory prior authorization by the Federal Administrative Court.',
        extraterritorialReach: false,
        appliesToCloudProviders: true,
        bulkCollectionRisk: 'Low',
      }
    ],
    guarantees: {
      clearPreciseRules: true,
      clearPreciseRulesNotes: 'Transparent statutory safeguards and strict banking secrecy laws.',
      necessaryAndProportionate: true,
      necessaryAndProportionateNotes: 'Strict proportionality review by judicial authorities.',
      independentOversight: true,
      independentOversightNotes: 'Federal Administrative Court provides independent prior scrutiny.',
      effectiveRedressForForeigners: true,
      effectiveRedressNotes: 'Full access to Swiss courts and FDPIC complaint procedures.'
    },
    overallSurveillanceRisk: 'Low',
    legalRiskSummary: 'Switzerland affords essentially equivalent data protection. No supplementary Schrems II measures needed for data transfers.',
    recommendedSupplementaryPillars: []
  },

  'Singapore': {
    countryCode: 'SG',
    countryName: 'Singapore',
    flagEmoji: '🇸🇬',
    adequacyStatus: 'no_adequacy',
    adequacyDetails: 'No formal adequacy decision from EU or UK. Standard Contractual Clauses (SCCs) or UK IDTA required.',
    dataProtectionLaw: 'Personal Data Protection Act 2012 (PDPA) as amended 2020.',
    hasIndependentDPA: true,
    dpaName: 'Personal Data Protection Commission (PDPC)',
    surveillanceLaws: [
      {
        statuteName: 'Cybersecurity Act & Computer Misuse Act',
        scopeAndPowers: 'Grants authorities power to inspect systems supporting Critical Information Infrastructure (CII).',
        extraterritorialReach: false,
        appliesToCloudProviders: true,
        bulkCollectionRisk: 'Medium',
      },
      {
        statuteName: 'Criminal Procedure Code (Section 20)',
        scopeAndPowers: 'Police power to order production of electronic documents or decrypted data in criminal investigations.',
        extraterritorialReach: false,
        appliesToCloudProviders: true,
        bulkCollectionRisk: 'Medium',
      }
    ],
    guarantees: {
      clearPreciseRules: true,
      clearPreciseRulesNotes: 'Clear legislative codification under MAS guidelines and PDPA.',
      necessaryAndProportionate: true,
      necessaryAndProportionateNotes: 'Surveillance is generally targeted rather than bulk dragnet collection.',
      independentOversight: true,
      independentOversightNotes: 'Substantial judicial review mechanisms through Singapore High Court.',
      effectiveRedressForForeigners: true,
      effectiveRedressNotes: 'Foreign data subjects can file complaints with PDPC or file civil actions.'
    },
    overallSurveillanceRisk: 'Medium',
    legalRiskSummary: 'Singapore has strong commercial data laws and MAS financial outsourcing rules, but lack of formal EU adequacy requires SCCs with contractual warrant notification clauses.',
    recommendedSupplementaryPillars: ['organizational', 'legal']
  },

  'Canada': {
    countryCode: 'CA',
    countryName: 'Canada',
    flagEmoji: '🇨🇦',
    adequacyStatus: 'partial_adequacy',
    adequacyDetails: 'Partial Adequacy Decision under PIPEDA for commercial organizations. Public sector and non-commercial activities require Article 46 safeguards.',
    dataProtectionLaw: 'Personal Information Protection and Electronic Documents Act (PIPEDA) & Provincial Acts (e.g., Quebec Law 25).',
    hasIndependentDPA: true,
    dpaName: 'Office of the Privacy Commissioner of Canada (OPC)',
    surveillanceLaws: [
      {
        statuteName: 'Canadian Security Intelligence Service Act (CSIS Act)',
        scopeAndPowers: 'Authorizes intelligence collection with mandatory Federal Court judicial warrant requirement.',
        extraterritorialReach: false,
        appliesToCloudProviders: true,
        bulkCollectionRisk: 'Low',
      }
    ],
    guarantees: {
      clearPreciseRules: true,
      clearPreciseRulesNotes: 'Clear statutory limitations under Canadian Charter of Rights and Freedoms.',
      necessaryAndProportionate: true,
      necessaryAndProportionateNotes: 'Section 8 Charter guarantees against unreasonable search and seizure.',
      independentOversight: true,
      independentOversightNotes: 'National Security and Intelligence Review Agency (NSIRA) and Federal Court oversight.',
      effectiveRedressForForeigners: true,
      effectiveRedressNotes: 'Federal Court and OPC provide accessible legal remedies.'
    },
    overallSurveillanceRisk: 'Low',
    legalRiskSummary: 'Commercial transfers are covered by EU adequacy. If processing falls outside commercial scope, SCCs apply with minimal technical overhead.',
    recommendedSupplementaryPillars: ['organizational']
  },

  'Japan': {
    countryCode: 'JP',
    countryName: 'Japan',
    flagEmoji: '🇯🇵',
    adequacyStatus: 'full_adequacy',
    adequacyDetails: 'Mutual EU and UK Adequacy Decisions confirmed with supplementary rules for cross-border personal information handling.',
    dataProtectionLaw: 'Act on the Protection of Personal Information (APPI).',
    hasIndependentDPA: true,
    dpaName: 'Personal Information Protection Commission (PPC Japan)',
    surveillanceLaws: [
      {
        statuteName: 'Code of Criminal Procedure (Act No. 131 of 1948)',
        scopeAndPowers: 'Strict judicial warrant requirement for seizure and inspection of electronic communications.',
        extraterritorialReach: false,
        appliesToCloudProviders: true,
        bulkCollectionRisk: 'Low',
      }
    ],
    guarantees: {
      clearPreciseRules: true,
      clearPreciseRulesNotes: 'Constitution of Japan Article 35 guarantees privacy of correspondence.',
      necessaryAndProportionate: true,
      necessaryAndProportionateNotes: 'Supreme Court jurisprudence strictly enforces proportionality in investigations.',
      independentOversight: true,
      independentOversightNotes: 'Independent judicial magistrate prior authorization required for all interception.',
      effectiveRedressForForeigners: true,
      effectiveRedressNotes: 'PPC mediation and direct court litigation available to foreign data subjects.'
    },
    overallSurveillanceRisk: 'Low',
    legalRiskSummary: 'Full mutual adequacy with UK and EU. Preferred Asia-Pacific hub for low-friction, high-compliance financial cloud hosting.',
    recommendedSupplementaryPillars: []
  },

  'Australia': {
    countryCode: 'AU',
    countryName: 'Australia',
    flagEmoji: '🇦🇺',
    adequacyStatus: 'no_adequacy',
    adequacyDetails: 'No formal adequacy decision from EU or UK. Standard Contractual Clauses (SCCs) or UK IDTA required alongside TIA assessment.',
    dataProtectionLaw: 'Privacy Act 1988 (Cth) & Australian Privacy Principles (APPs).',
    hasIndependentDPA: true,
    dpaName: 'Office of the Australian Information Commissioner (OAIC)',
    surveillanceLaws: [
      {
        statuteName: 'Telecommunications and Other Legislation Amendment (TOLA Act 2018)',
        scopeAndPowers: 'Enables issuance of Technical Assistance Notices (TAN) and Technical Capability Notices (TCN) to compel decrypted communication access.',
        extraterritorialReach: false,
        appliesToCloudProviders: true,
        bulkCollectionRisk: 'Medium',
      },
      {
        statuteName: 'Telecommunications (Interception and Access) Act 1979 (TICA)',
        scopeAndPowers: 'Warrant-based lawful intercept overseen by Administrative Appeals Tribunal (AAT).',
        extraterritorialReach: false,
        appliesToCloudProviders: true,
        bulkCollectionRisk: 'Medium',
      }
    ],
    guarantees: {
      clearPreciseRules: true,
      clearPreciseRulesNotes: 'TOLA legislation is defined, though powers to compel technical assistance face privacy scrutiny.',
      necessaryAndProportionate: true,
      necessaryAndProportionateNotes: 'Proportionality test applies to warrant issuance under TICA.',
      independentOversight: true,
      independentOversightNotes: 'Inspector-General of Intelligence and Security (IGIS) oversight.',
      effectiveRedressForForeigners: false,
      effectiveRedressNotes: 'No direct constitutional right to privacy; OAIC handling is primary recourse.'
    },
    overallSurveillanceRisk: 'Medium',
    legalRiskSummary: 'TOLA Act technical assistance powers require strong client-held encryption keys (BYOK) and contractual warrant pushback terms.',
    recommendedSupplementaryPillars: ['technical', 'legal']
  },

  'Germany': {
    countryCode: 'DE',
    countryName: 'Germany',
    flagEmoji: '🇩🇪',
    adequacyStatus: 'full_adequacy',
    adequacyDetails: 'Intra-EEA/UK equivalent transfer. Full EU GDPR baseline with rigorous Federal and State supervisory authorities (BfDI / LfD).',
    dataProtectionLaw: 'EU GDPR & Federal Data Protection Act (BDSG).',
    hasIndependentDPA: true,
    dpaName: 'Federal Commissioner for Data Protection and Freedom of Information (BfDI)',
    surveillanceLaws: [
      {
        statuteName: 'G-10 Act (Act on Restriction of Privacy of Correspondence, Post and Telecommunications)',
        scopeAndPowers: 'Surveillance strictly controlled by the parliamentary G10 Commission with constitutionally protected core rights.',
        extraterritorialReach: false,
        appliesToCloudProviders: true,
        bulkCollectionRisk: 'Low',
      }
    ],
    guarantees: {
      clearPreciseRules: true,
      clearPreciseRulesNotes: 'German Federal Constitutional Court (BVerfG) enforces highest European privacy standards.',
      necessaryAndProportionate: true,
      necessaryAndProportionateNotes: 'Strict proportionality enshrined in constitutional doctrine.',
      independentOversight: true,
      independentOversightNotes: 'Parliamentary G10 Commission and Federal Administrative Court.',
      effectiveRedressForForeigners: true,
      effectiveRedressNotes: 'Universal access to Administrative and Constitutional Courts.'
    },
    overallSurveillanceRisk: 'Low',
    legalRiskSummary: 'Gold standard data protection jurisdiction. Fully compliant under UK and EU frameworks without supplementary transfer obstacles.',
    recommendedSupplementaryPillars: []
  },

  'United Arab Emirates': {
    countryCode: 'AE',
    countryName: 'United Arab Emirates',
    flagEmoji: '🇦🇪',
    adequacyStatus: 'no_adequacy',
    adequacyDetails: 'No adequacy for federal UAE. DIFC and ADGM financial free zones have dedicated GDPR-aligned privacy regimes (DIFC Law No. 5 of 2020).',
    dataProtectionLaw: 'Federal Decree-Law No. 45/2021 on PDPL & DIFC Data Protection Law No. 5/2020.',
    hasIndependentDPA: true,
    dpaName: 'UAE Data Office & DIFC Commissioner of Data Protection',
    surveillanceLaws: [
      {
        statuteName: 'Federal Cybercrime Law (Federal Decree-Law No. 34/2021)',
        scopeAndPowers: 'Law enforcement interception authorized by Public Prosecution for state security and cybercrime investigation.',
        extraterritorialReach: false,
        appliesToCloudProviders: true,
        bulkCollectionRisk: 'High',
      }
    ],
    guarantees: {
      clearPreciseRules: true,
      clearPreciseRulesNotes: 'DIFC regulations provide high clarity; federal onshore statutes allow broader discretion.',
      necessaryAndProportionate: false,
      necessaryAndProportionateNotes: 'Broad public security exceptions exist in onshore federal legislation.',
      independentOversight: false,
      independentOversightNotes: 'DIFC courts provide common law oversight; federal processes are executive-led.',
      effectiveRedressForForeigners: true,
      effectiveRedressNotes: 'DIFC jurisdiction provides transparent remedies; onshore federal access is limited.'
    },
    overallSurveillanceRisk: 'Medium',
    legalRiskSummary: 'Transfers to DIFC/ADGM require Standard Contractual Clauses with robust technical BYOK controls to insulate from onshore surveillance reach.',
    recommendedSupplementaryPillars: ['technical', 'organizational', 'legal']
  },

  'Brazil': {
    countryCode: 'BR',
    countryName: 'Brazil',
    flagEmoji: '🇧🇷',
    adequacyStatus: 'no_adequacy',
    adequacyDetails: 'No formal adequacy. LGPD standard contractual clauses (Cláusulas-Padrão Contratuais - CPC) published by ANPD in 2024.',
    dataProtectionLaw: 'Lei Geral de Proteção de Dados Pessoais (LGPD - Law No. 13.709/2018).',
    hasIndependentDPA: true,
    dpaName: 'Autoridade Nacional de Proteção de Dados (ANPD)',
    surveillanceLaws: [
      {
        statuteName: 'Marco Civil da Internet (Law No. 12.965/2014) & Telecommunications Act',
        scopeAndPowers: 'Court order required for intercept of communications and data disclosures.',
        extraterritorialReach: false,
        appliesToCloudProviders: true,
        bulkCollectionRisk: 'Low',
      }
    ],
    guarantees: {
      clearPreciseRules: true,
      clearPreciseRulesNotes: 'Marco Civil provides judicialized procedures for access to connection logs.',
      necessaryAndProportionate: true,
      necessaryAndProportionateNotes: 'Federal Constitution of Brazil Article 5 protects secrecy of communications.',
      independentOversight: true,
      independentOversightNotes: 'Federal and State judiciary oversight over all interception requests.',
      effectiveRedressForForeigners: true,
      effectiveRedressNotes: 'Habeas Data and civil actions available to all individuals under LGPD.'
    },
    overallSurveillanceRisk: 'Low',
    legalRiskSummary: 'LGPD provides strong alignment with GDPR principles. SCCs with standard encryption protocols are sufficient for financial services.',
    recommendedSupplementaryPillars: ['organizational', 'legal']
  },

  'South Africa': {
    countryCode: 'ZA',
    countryName: 'South Africa',
    flagEmoji: '🇿🇦',
    adequacyStatus: 'no_adequacy',
    adequacyDetails: 'No formal EU/UK adequacy. Section 72 POPIA regulates cross-border transfers with binding agreements or substantial similarity.',
    dataProtectionLaw: 'Protection of Personal Information Act, 2013 (POPIA).',
    hasIndependentDPA: true,
    dpaName: 'Information Regulator (South Africa)',
    surveillanceLaws: [
      {
        statuteName: 'RICA (Regulation of Interception of Communications and Provision of Communication-related Information Act 70 of 2002)',
        scopeAndPowers: 'Constitutional Court ruling in Amabhungane (2021) struck down portions of RICA for inadequate post-surveillance notification safeguards.',
        extraterritorialReach: false,
        appliesToCloudProviders: true,
        bulkCollectionRisk: 'Medium',
      }
    ],
    guarantees: {
      clearPreciseRules: true,
      clearPreciseRulesNotes: 'Constitutional Court mandates reformed surveillance standards.',
      necessaryAndProportionate: true,
      necessaryAndProportionateNotes: 'Section 14 of the Constitution protects fundamental right to privacy.',
      independentOversight: true,
      independentOversightNotes: 'Designated RICA judge prior authorization.',
      effectiveRedressForForeigners: true,
      effectiveRedressNotes: 'Direct complaint to Information Regulator and High Court review.'
    },
    overallSurveillanceRisk: 'Medium',
    legalRiskSummary: 'POPIA is closely modeled on GDPR. UK Addendum with RICA pushback clauses and cloud KMS encryption provides compliant posture.',
    recommendedSupplementaryPillars: ['organizational', 'legal']
  },

  'Hong Kong': {
    countryCode: 'HK',
    countryName: 'Hong Kong SAR',
    flagEmoji: '🇭🇰',
    adequacyStatus: 'no_adequacy',
    adequacyDetails: 'No EU/UK adequacy. Section 33 PDPO guidance on cross-border data transfer applies.',
    dataProtectionLaw: 'Personal Data (Privacy) Ordinance (PDPO - Cap. 486).',
    hasIndependentDPA: true,
    dpaName: 'Privacy Commissioner for Personal Data (PCPD)',
    surveillanceLaws: [
      {
        statuteName: 'National Security Law (NSL 2020) & Safeguarding National Security Ordinance (2024)',
        scopeAndPowers: 'Article 43 Implementation Rules permit law enforcement electronic surveillance with Chief Executive approval in place of judicial warrants.',
        extraterritorialReach: true,
        appliesToCloudProviders: true,
        bulkCollectionRisk: 'High',
      }
    ],
    guarantees: {
      clearPreciseRules: false,
      clearPreciseRulesNotes: 'National security provisions grant broad executive discretion over interception.',
      necessaryAndProportionate: false,
      necessaryAndProportionateNotes: 'Executive discretion supersedes standard PDPO principles for national security.',
      independentOversight: false,
      independentOversightNotes: 'Chief Executive executive approval without independent judicial warrant.',
      effectiveRedressForForeigners: false,
      effectiveRedressNotes: 'Limited judicial review under Article 43 NSL implementation rules.'
    },
    overallSurveillanceRisk: 'High',
    legalRiskSummary: 'NSL executive surveillance powers create Schrems II exposure. Strict HYOK/BYOK encryption with keys held exclusively in UK/EEA is mandatory.',
    recommendedSupplementaryPillars: ['technical', 'organizational', 'legal']
  },

  'Israel': {
    countryCode: 'IL',
    countryName: 'Israel',
    flagEmoji: '🇮🇱',
    adequacyStatus: 'full_adequacy',
    adequacyDetails: 'EU Adequacy Decision re-confirmed in January 2024 for automated personal data transfers.',
    dataProtectionLaw: 'Protection of Privacy Law, 5741-1981 and Privacy Protection Regulations 2017.',
    hasIndependentDPA: true,
    dpaName: 'Privacy Protection Authority (PPA)',
    surveillanceLaws: [
      {
        statuteName: 'Wiretap Law, 1979',
        scopeAndPowers: 'Requires court order for law enforcement wiretaps; defense minister authorization for state security with judicial review.',
        extraterritorialReach: false,
        appliesToCloudProviders: true,
        bulkCollectionRisk: 'Medium',
      }
    ],
    guarantees: {
      clearPreciseRules: true,
      clearPreciseRulesNotes: 'Detailed regulations and strong Supreme Court constitutional jurisprudence.',
      necessaryAndProportionate: true,
      necessaryAndProportionateNotes: 'Strict proportionality review by Israeli judicial bodies.',
      independentOversight: true,
      independentOversightNotes: 'District Court and Supreme Court judicial oversight.',
      effectiveRedressForForeigners: true,
      effectiveRedressNotes: 'Access to judicial review and administrative remedies under PPA.'
    },
    overallSurveillanceRisk: 'Low',
    legalRiskSummary: 'Israel maintains full EU adequacy status. Common destination for specialized cybersecurity and threat intelligence providers.',
    recommendedSupplementaryPillars: []
  },

  'Russia': {
    countryCode: 'RU',
    countryName: 'Russian Federation',
    flagEmoji: '🇷🇺',
    adequacyStatus: 'high_risk_list',
    adequacyDetails: 'No adequacy. High risk country. Mandatory data localization requirements (Law No. 242-FZ).',
    dataProtectionLaw: 'Federal Law No. 152-FZ on Personal Data.',
    hasIndependentDPA: false,
    dpaName: 'Roskomnadzor',
    surveillanceLaws: [
      {
        statuteName: 'SORM (System of Operative-Investigative Measures)',
        scopeAndPowers: 'Mandates direct, back-door hardware taps by FSB into telecom and cloud infrastructure without prior notification to service providers.',
        extraterritorialReach: true,
        appliesToCloudProviders: true,
        bulkCollectionRisk: 'Critical',
      },
      {
        statuteName: 'Yarovaya Law (2016)',
        scopeAndPowers: 'Compels telecom operators and internet providers to store metadata and message content and provide encryption backdoors to security services.',
        extraterritorialReach: false,
        appliesToCloudProviders: true,
        bulkCollectionRisk: 'Critical',
      }
    ],
    guarantees: {
      clearPreciseRules: false,
      clearPreciseRulesNotes: 'Executive decree powers with minimal transparency.',
      necessaryAndProportionate: false,
      necessaryAndProportionateNotes: 'Direct, permanent access taps via SORM violate EDPB essential safeguards.',
      independentOversight: false,
      independentOversightNotes: 'No independent oversight of FSB surveillance actions.',
      effectiveRedressForForeigners: false,
      effectiveRedressNotes: 'No judicial redress for foreign data subjects.'
    },
    overallSurveillanceRisk: 'Critical',
    legalRiskSummary: 'Direct interception architecture (SORM) makes compliance with GDPR Article 44-49 impossible without 100% on-soil pseudonymization with keys locked in UK/EEA.',
    recommendedSupplementaryPillars: ['technical', 'organizational', 'legal']
  }
};
