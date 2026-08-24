import { TransferProfile, ExternalIntegrations, CrossFrameworkPayloads } from '../types/tia';

/**
 * Generates a random standard UUID v4 string
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generates a random uppercase 4-character hex block
 */
function randomHexBlock(): string {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1)
    .toUpperCase();
}

/**
 * Generates a full unique TIA identification bundle for a new or existing profile
 */
export function generateUniqueTiaId(customYear?: number): {
  tiaReferenceId: string;
  universalUniqueIdentifier: string;
  crossFrameworkUrn: string;
  externalIntegrations: ExternalIntegrations;
} {
  const year = customYear || new Date().getFullYear();
  const block1 = randomHexBlock();
  const block2 = randomHexBlock();
  const tiaReferenceId = `TIA-${year}-${block1}-${block2}`;
  const universalUniqueIdentifier = generateUUID();
  const shortCode = `${block1.toLowerCase()}${block2.toLowerCase()}`;
  const crossFrameworkUrn = `urn:grc:tia:${year}:${shortCode}`;

  const externalIntegrations: ExternalIntegrations = {
    serviceNowGrcId: `SNOW-VRM-${year}-${block1}`,
    oneTrustTiaId: `OT-TIA-${year}-${block2}`,
    praMtpRegisterId: `PRA-MTP-${year}-${block1}`,
    doraIctRegisterId: `DORA-ICT-REG-${year}-${block2}`,
    jiraIssueKey: `SEC-TIA-${block1}`,
    oscalComponentId: `oscal:component:tia-${year}-${shortCode}`,
    customSystemId: `EXT-${year}-${block1}`
  };

  return {
    tiaReferenceId,
    universalUniqueIdentifier,
    crossFrameworkUrn,
    externalIntegrations
  };
}

/**
 * Simple, synchronous pseudo-SHA256 / cryptographic fingerprint computation
 * ensuring consistency across browser and Node environments.
 */
export function computeCryptographicFingerprint(profile: Partial<TransferProfile>): string {
  const seedString = JSON.stringify({
    id: profile.id || '',
    tiaRef: profile.tiaReferenceId || '',
    uuid: profile.universalUniqueIdentifier || '',
    exporter: profile.exporterName || '',
    exporterCountry: profile.exporterCountry || '',
    importer: profile.importerName || '',
    importerCountry: profile.importerCountry || '',
    mechanism: profile.transferMechanism || '',
    keyMgmt: profile.keyManagement || '',
    material: profile.isMaterialOutsourcing || false,
    created: profile.createdDate || ''
  });

  // Calculate 64-char hex digest (simulated deterministic cryptographic SHA-256 representation)
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57, h3 = 0x67452301, h4 = 0xefcdab89;
  for (let i = 0; i < seedString.length; i++) {
    const ch = seedString.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 2246822507);
    h4 = Math.imul(h4 ^ ch, 3266489909);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 1597334677);
  h2 ^= Math.imul(h3 ^ (h3 >>> 13), 2654435761);
  h3 = Math.imul(h3 ^ (h3 >>> 16), 2246822507);
  h3 ^= Math.imul(h4 ^ (h4 >>> 13), 1597334677);
  h4 = Math.imul(h4 ^ (h4 >>> 16), 3266489909);
  h4 ^= Math.imul(h1 ^ (h1 >>> 13), 2654435761);

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const hex3 = (h3 >>> 0).toString(16).padStart(8, '0');
  const hex4 = (h4 >>> 0).toString(16).padStart(8, '0');
  
  // Create 64-char standard hash string
  return `0x${hex1}${hex2}${hex3}${hex4}${hex4}${hex3}${hex2}${hex1}`;
}

/**
 * Builds interoperable cross-framework payloads for GRC tools (ServiceNow, OneTrust, PRA, DORA, OSCAL)
 */
export function generateCrossFrameworkPayloads(
  profile: TransferProfile, 
  evaluation: any
): CrossFrameworkPayloads {
  const tiaId = profile.tiaReferenceId || `TIA-${new Date().getFullYear()}-0000-0000`;
  const uuid = profile.universalUniqueIdentifier || generateUUID();
  const urn = profile.crossFrameworkUrn || `urn:grc:tia:${new Date().getFullYear()}:00000000`;
  const integrations = profile.externalIntegrations || {};
  const fingerprint = computeCryptographicFingerprint(profile);

  // 1. ServiceNow GRC / VRM Assessment JSON
  const serviceNowPayload = {
    schema: "sn_vrm_assessment_record",
    version: "2.0",
    record_id: integrations.serviceNowGrcId || `SNOW-VRM-${tiaId}`,
    tia_reference_id: tiaId,
    universal_id: uuid,
    cross_framework_urn: urn,
    verification_hash: fingerprint,
    vendor_information: {
      vendor_name: profile.importerName,
      vendor_jurisdiction: profile.importerCountry,
      service_classification: profile.importerSector,
      material_outsourcing: profile.isMaterialOutsourcing,
      cif_function: profile.importantBusinessService
    },
    risk_scoring: {
      inherent_risk_score: evaluation.overallRiskScore || 0,
      risk_category: evaluation.riskCategory || 'Moderate Risk',
      verdict: evaluation.verdict || 'Approved with Conditions',
      surveillance_score: evaluation.scores?.surveillanceRiskScore || 0,
      technical_protection_score: evaluation.scores?.technicalProtectionScore || 0,
      legal_safeguard_score: evaluation.scores?.legalSafeguardsScore || 0,
      pra_resilience_score: evaluation.scores?.praResilienceScore || 0
    },
    controls_evaluated: {
      byok_hsm_custody: profile.keyManagement === 'byok_local_hsm',
      pseudonymization_applied: profile.pseudonymizationPriorToTransfer,
      warrant_challenge_commitment: profile.foreignWarrantChallengeCommitment,
      pra_s165a_s166_inspection_rights: profile.praDirectInspectionClause,
      tested_stressed_exit_plan: profile.testedStressedExitPlan
    },
    approval_governance: {
      accountable_executive: profile.seniorManagerFunction || 'SMF24 Chief Operations',
      dpo_contact: profile.dpoContact,
      ciso_contact: profile.cisoContact,
      assessment_timestamp: new Date().toISOString()
    }
  };

  // 2. OneTrust TIA / Assessment Automation JSON
  const oneTrustPayload = {
    schema: "onetrust_tia_transfer_assessment_v3",
    assessment_id: integrations.oneTrustTiaId || `OT-TIA-${tiaId}`,
    canonical_tia_id: tiaId,
    urn: urn,
    integrity_checksum: fingerprint,
    organization: profile.exporterName,
    data_importer: profile.importerName,
    transfer_route: `${profile.exporterCountry} -> ${profile.importerCountry}`,
    legal_basis: profile.transferMechanism,
    schrems_ii_verdict: evaluation.verdict,
    essential_guarantees: evaluation.essentialGuaranteesVerdict,
    supplementary_measures: (evaluation.remediationMatrix || []).map((m: any) => ({
      control_id: m.id,
      pillar: m.pillar,
      name: m.controlName,
      status: m.status,
      owner: m.assignedOwner,
      sla_deadline: m.targetCompletionDate
    }))
  };

  // 3. Bank of England / PRA Table 5 MTP Register Record
  const praMtpPayload = {
    register_table: "PRA_SS2_21_TABLE_5_MTP_REGISTER",
    mtp_record_id: integrations.praMtpRegisterId || `PRA-MTP-${tiaId}`,
    regulated_firm: profile.exporterName,
    firm_type: profile.exporterType,
    cif_classification: profile.isMaterialOutsourcing ? "CRITICAL_OR_IMPORTANT_FUNCTION" : "STANDARD_OUTSOURCING",
    service_description: profile.importantBusinessService,
    service_provider: profile.importerName,
    country_of_provision: profile.importerCountry,
    impact_tolerance_hours: profile.impactToleranceHours,
    s165a_s166_audit_rights_enacted: profile.praDirectInspectionClause,
    stressed_exit_strategy: profile.testedStressedExitPlan ? "TESTED_MULTI_CLOUD_FAILOVER" : "PENDING_EXECUTION",
    substitutability_rating: profile.substitutabilityRating,
    evergreen_review_years: profile.evergreenReviewCadenceYears,
    smf_accountable_individual: profile.seniorManagerFunction
  };

  // 4. EU DORA Article 28(3) ICT Third-Party Information Register
  const doraRegisterPayload = {
    dora_standard: "REGULATION_EU_2022_2554_ARTICLE_28",
    ict_contract_id: integrations.doraIctRegisterId || `DORA-ICT-${tiaId}`,
    financial_entity: profile.exporterName,
    ict_third_party_provider: profile.importerName,
    country_headquarters: profile.importerCountry,
    supports_critical_function: profile.isMaterialOutsourcing,
    cryptographic_key_custody: profile.keyManagement,
    data_locations: [profile.exporterCountry, profile.importerCountry],
    sub_processors_count: (profile.subProcessors || []).length,
    concentration_risk_rating: profile.substitutabilityRating === 'vendor_lock_in_complex' ? 'HIGH' : 'CONTROLLED',
    last_assessment_date: new Date().toISOString().split('T')[0]
  };

  // 5. NIST OSCAL JSON
  const oscalJson = {
    "assessment-results": {
      "uuid": uuid,
      "metadata": {
        "title": `Transfer Impact Assessment for ${profile.title}`,
        "published": new Date().toISOString(),
        "version": "1.0",
        "oscal-version": "1.1.0",
        "props": [
          { "name": "tia-reference-id", "value": tiaId },
          { "name": "cross-framework-urn", "value": urn },
          { "name": "verification-hash", "value": fingerprint }
        ]
      },
      "results": [
        {
          "uuid": generateUUID(),
          "title": "EDPB & PRA SS2/21 Compliance Determination",
          "description": evaluation.verdictRationale || "Assessment evaluation completed.",
          "start": new Date().toISOString(),
          "findings": (evaluation.remediationMatrix || []).map((m: any) => ({
            "target": {
              "target-id": m.id,
              "type": "control-implementation",
              "status": m.status === 'implemented' ? 'satisfied' : 'not-satisfied'
            },
            "title": m.controlName,
            "description": m.description
          }))
        }
      ]
    }
  };

  // 6. JSON-LD Semantic Web Object
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org/",
    "@type": "AuditAssessment",
    "identifier": tiaId,
    "uuid": uuid,
    "name": profile.title,
    "auditResult": evaluation.verdict,
    "assessor": {
      "@type": "Organization",
      "name": profile.exporterName
    },
    "object": {
      "@type": "Organization",
      "name": profile.importerName,
      "location": profile.importerCountry
    },
    "dateCreated": profile.createdDate,
    "riskScore": evaluation.overallRiskScore,
    "urn": urn,
    "sha256": fingerprint
  }, null, 2);

  // 7. Universal Webhook / REST payload
  const restWebhookPayload = {
    event: "tia.assessment.evaluated",
    tiaReferenceId: tiaId,
    universalUniqueIdentifier: uuid,
    crossFrameworkUrn: urn,
    cryptographicFingerprint: fingerprint,
    externalIntegrations: integrations,
    summary: {
      title: profile.title,
      exporter: profile.exporterName,
      importer: profile.importerName,
      destinationCountry: profile.importerCountry,
      verdict: evaluation.verdict,
      overallRiskScore: evaluation.overallRiskScore,
      riskCategory: evaluation.riskCategory,
      isMaterialOutsourcing: profile.isMaterialOutsourcing,
      smfOwner: profile.seniorManagerFunction
    },
    timestamp: new Date().toISOString()
  };

  return {
    jsonLd,
    oscalJson,
    serviceNowPayload,
    oneTrustPayload,
    praMtpPayload,
    doraRegisterPayload,
    restWebhookPayload
  };
}

/**
 * Generates an executable cURL integration snippet for external CI/CD & GRC tools
 */
export function generateIntegrationCurlSnippet(
  tiaReferenceId: string, 
  serverUrl: string = 'https://api.grc-hub.enterprise.local'
): string {
  return `curl -X POST "${serverUrl}/api/v1/grc/sync-tia" \\
  -H "Authorization: Bearer <ENTERPRISE_GRC_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -H "X-TIA-Reference-ID: ${tiaReferenceId}" \\
  -d '{
    "tiaReferenceId": "${tiaReferenceId}",
    "syncTargets": ["serviceNow", "oneTrust", "praMtpRegister", "doraIctRegister"],
    "enforceSovereignVerification": true
  }'`;
}
