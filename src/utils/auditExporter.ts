import { TransferProfile, TIAEvaluationResult } from '../types/tia';

export interface AuditRecordItem {
  severity: 'Critical' | 'Warning' | 'Compliant';
  plainEnglishSummary: string;
  legalRegulation: string;
  exactError: string;
  status: 'COMPLIANT' | 'ACTION_REQUIRED' | 'DEFICIT_IDENTIFIED';
  recommendedRemediation: string;
}

export function generateAuditCsvData(profile: TransferProfile, evaluation: TIAEvaluationResult): string {
  const timestamp = new Date().toISOString();
  const companyName = profile.exporterName || 'UK Regulated Entity';
  const dossierId = evaluation.tiaReferenceId || profile.tiaReferenceId || evaluation.evaluationId;

  // Compile full set of items with risk hierarchy: Critical first, then Warnings, then Compliant
  const items: AuditRecordItem[] = [
    // 1. Key custody
    {
      severity: profile.keyManagement === 'byok_local_hsm' ? 'Compliant' : 'Critical',
      plainEnglishSummary: profile.keyManagement === 'byok_local_hsm'
        ? 'Customer encryption keys are kept in on-premises hardware security modules; foreign cloud provider cannot decrypt records.'
        : 'Foreign cloud vendor has access to encryption keys; customer data is exposed to unauthorized overseas decryption.',
      legalRegulation: 'UK & EU GDPR Art. 46(1) & EDPB Recommendations 01/2020 Annex 2',
      exactError: profile.keyManagement === 'byok_local_hsm'
        ? 'None'
        : 'Decryption keys are managed in the cloud provider infrastructure, vulnerable to FISA 702 or foreign warrants.',
      status: profile.keyManagement === 'byok_local_hsm' ? 'COMPLIANT' : 'DEFICIT_IDENTIFIED',
      recommendedRemediation: 'Implement Client-Side BYOK key custody using an on-premises Local HSM.'
    },
    // 2. Tokenization
    {
      severity: profile.pseudonymizationPriorToTransfer ? 'Compliant' : 'Critical',
      plainEnglishSummary: profile.pseudonymizationPriorToTransfer
        ? 'Direct personal identifiers are irreversibly tokenized before crossing borders.'
        : 'Customer names and direct personal identifiers are transferred without pre-export tokenization.',
      legalRegulation: 'GDPR Art. 4(5), Art. 32(1)(a) & EDPB 01/2020 Use Case 2',
      exactError: profile.pseudonymizationPriorToTransfer
        ? 'None'
        : 'Direct customer identifying data leaves the home jurisdiction in clear form.',
      status: profile.pseudonymizationPriorToTransfer ? 'COMPLIANT' : 'DEFICIT_IDENTIFIED',
      recommendedRemediation: 'Deploy on-premises tokenization proxy to replace direct identifiers before egress.'
    },
    // 3. Foreign Warrant Challenge
    {
      severity: profile.foreignWarrantChallengeCommitment ? 'Compliant' : 'Critical',
      plainEnglishSummary: profile.foreignWarrantChallengeCommitment
        ? 'Vendor is legally bound to contest foreign government data warrants in local courts.'
        : 'Foreign government surveillance warrants can be answered by the vendor without mandatory legal challenge.',
      legalRegulation: 'EDPB 01/2020 Paragraphs 128-143 & Schrems II Ruling',
      exactError: profile.foreignWarrantChallengeCommitment
        ? 'None'
        : 'No contractual clause requiring supplier to challenge extraterritorial warrants in court.',
      status: profile.foreignWarrantChallengeCommitment ? 'COMPLIANT' : 'DEFICIT_IDENTIFIED',
      recommendedRemediation: 'Execute mandatory Warrant Challenge Addendum obligating supplier to challenge orders.'
    },
    // 4. Foreign Warrant DPO Notification
    {
      severity: profile.foreignWarrantNotificationClause ? 'Compliant' : 'Warning',
      plainEnglishSummary: profile.foreignWarrantNotificationClause
        ? 'Vendor must notify institution DPO within 24 hours of any foreign government surveillance request.'
        : 'Vendor is not contractually obligated to alert the institution if foreign authorities request customer data.',
      legalRegulation: 'UK GDPR Art. 48 & EDPB Recommendations 01/2020',
      exactError: profile.foreignWarrantNotificationClause
        ? 'None'
        : 'Supplier terms do not mandate prompt notification of data access subpoenas to DPO.',
      status: profile.foreignWarrantNotificationClause ? 'COMPLIANT' : 'ACTION_REQUIRED',
      recommendedRemediation: 'Incorporate mandatory 24-hour emergency DPO disclosure notification clause.'
    },
    // 5. PRA Direct Inspection
    {
      severity: profile.praDirectInspectionClause ? 'Compliant' : (profile.isMaterialOutsourcing ? 'Critical' : 'Warning'),
      plainEnglishSummary: profile.praDirectInspectionClause
        ? 'UK Prudential Regulation Authority (PRA) has full statutory inspection and audit rights over supplier premises.'
        : 'Regulator (PRA) lacks direct physical and remote inspection rights over the overseas vendor.',
      legalRegulation: 'PRA SS2/21 Chapter 8 & Rule 165A/166 FSMA 2000',
      exactError: profile.praDirectInspectionClause
        ? 'None'
        : 'Agreement lacks explicit terms permitting UK regulators unhindered operational inspection.',
      status: profile.praDirectInspectionClause ? 'COMPLIANT' : 'DEFICIT_IDENTIFIED',
      recommendedRemediation: 'Append standard PRA SS2/21 Section 8 regulatory audit and S165A direct access clause.'
    },
    // 6. Stressed Exit
    {
      severity: profile.testedStressedExitPlan ? 'Compliant' : 'Warning',
      plainEnglishSummary: profile.testedStressedExitPlan
        ? 'Emergency exit plan is formally documented and tested to ensure business continuity during vendor failure.'
        : 'Emergency transition plan has not been tested to ensure continuity if the vendor abruptly shuts down.',
      legalRegulation: 'PRA SS2/21 Chapter 10 (Stressed Exit) & DORA Art. 12',
      exactError: profile.testedStressedExitPlan
        ? 'None'
        : 'No tested stressed exit simulation demonstrating transfer of operations within 4-hour tolerance.',
      status: profile.testedStressedExitPlan ? 'COMPLIANT' : 'ACTION_REQUIRED',
      recommendedRemediation: 'Complete stressed exit technical simulation and document secondary standby runbook.'
    },
    // 7. Multi-Region Failover
    {
      severity: profile.multiRegionActiveFailover ? 'Compliant' : 'Warning',
      plainEnglishSummary: profile.multiRegionActiveFailover
        ? 'Automated multi-region failover active; service will automatically survive an overseas regional cloud outage.'
        : 'Important business service has a single point of failure and lacks automated regional cloud failover.',
      legalRegulation: 'PRA SS2/21 Chapter 9 & Operational Continuity in Resolution (OCIR)',
      exactError: profile.multiRegionActiveFailover
        ? 'None'
        : 'Architecture relies on a single availability zone/region, exceeding impact tolerance during outage.',
      status: profile.multiRegionActiveFailover ? 'COMPLIANT' : 'ACTION_REQUIRED',
      recommendedRemediation: 'Provision secondary standby region with automated DNS failover.'
    },
    // 8. Transit TLS
    {
      severity: profile.transitEncryption ? 'Compliant' : 'Critical',
      plainEnglishSummary: profile.transitEncryption
        ? 'Data in transit is protected with TLS 1.3 encryption and mutual certificate authentication.'
        : 'Data in transit is unprotected or utilizes legacy cipher suites vulnerable to network wiretapping.',
      legalRegulation: 'GDPR Art. 32(1)(a) & NCSC Cryptographic Guidance',
      exactError: profile.transitEncryption
        ? 'None'
        : 'Network transport does not enforce TLS 1.3 cipher suites with mutual client/server certificate auth.',
      status: profile.transitEncryption ? 'COMPLIANT' : 'DEFICIT_IDENTIFIED',
      recommendedRemediation: 'Enforce TLS 1.3 cipher suites and mandate mutual TLS (mTLS).'
    },
    // 9. Subprocessor Authorization
    {
      severity: profile.priorWrittenAuthRequiredForSubprocessors ? 'Compliant' : 'Warning',
      plainEnglishSummary: profile.priorWrittenAuthRequiredForSubprocessors
        ? 'Vendor must obtain prior written consent and give 30 days notice before engaging new sub-processors.'
        : 'Vendor can subcontract customer data processing to overseas third parties without prior bank consent.',
      legalRegulation: 'UK GDPR Art. 28(2) & PRA SS2/21 Chapter 7',
      exactError: profile.priorWrittenAuthRequiredForSubprocessors
        ? 'None'
        : 'Blanket sub-processor authorization without right to object or terminate.',
      status: profile.priorWrittenAuthRequiredForSubprocessors ? 'COMPLIANT' : 'ACTION_REQUIRED',
      recommendedRemediation: 'Mandate specific prior written authorization and minimum 30-day notice period.'
    },
    // 10. Unannounced Audit
    {
      severity: profile.unannouncedAuditPermitted ? 'Compliant' : 'Warning',
      plainEnglishSummary: profile.unannouncedAuditPermitted
        ? 'Institution and independent auditors are permitted to conduct unannounced security spot-checks.'
        : 'Institution is barred from conducting unannounced audits or emergency security investigations on supplier sites.',
      legalRegulation: 'PRA SS2/21 Chapter 8 & EBA Outsourcing Guidelines',
      exactError: profile.unannouncedAuditPermitted
        ? 'None'
        : 'Audit clauses restrict inspection to scheduled annual windows, preventing emergency investigations.',
      status: profile.unannouncedAuditPermitted ? 'COMPLIANT' : 'ACTION_REQUIRED',
      recommendedRemediation: 'Amend audit clause to permit unannounced spot-checks in event of security compromise.'
    }
  ];

  // Hierarchy sort: Critical first (3), Warnings middle (2), Compliant bottom (1)
  const severityScore: Record<string, number> = { Critical: 3, Warning: 2, Compliant: 1 };
  items.sort((a, b) => severityScore[b.severity] - severityScore[a.severity]);

  const escapeCsv = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;

  const headerLines = [
    `# AUDIT COMPLIANCE REPORT — SOVEREIGN TIA ENGINE`,
    `# Generated At: ${timestamp}`,
    `# Company / Exporter: ${companyName}`,
    `# Importer / Counterparty: ${profile.importerName} (${profile.importerCountry})`,
    `# Dossier Reference ID: ${dossierId}`,
    `# Overall Risk Score: ${evaluation.overallRiskScore}/100 — Status: ${evaluation.verdict}`,
    `# Risk Hierarchy: Critical issues listed first, followed by Warnings and Compliant controls`,
    ``
  ];

  const columns = [
    'Export Timestamp',
    'Company (Exporter)',
    'Importer (Recipient)',
    'Dossier Ref ID',
    'Severity Level',
    'Finding Status',
    'Plain English Summary',
    'Governing Legal Regulation',
    'Identified Technical/Legal Error',
    'Recommended Remediation Action'
  ];

  const rows = items.map(item => [
    escapeCsv(timestamp),
    escapeCsv(companyName),
    escapeCsv(profile.importerName),
    escapeCsv(dossierId),
    escapeCsv(item.severity),
    escapeCsv(item.status),
    escapeCsv(item.plainEnglishSummary),
    escapeCsv(item.legalRegulation),
    escapeCsv(item.exactError),
    escapeCsv(item.recommendedRemediation)
  ]);

  return [...headerLines, columns.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function downloadAuditCsv(profile: TransferProfile, evaluation: TIAEvaluationResult): void {
  const csvContent = generateAuditCsvData(profile, evaluation);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const safeId = (evaluation.tiaReferenceId || profile.tiaReferenceId || 'TIA-2026').replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  anchor.href = url;
  anchor.download = `Compliance_Audit_Report_${safeId}_${dateStr}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
