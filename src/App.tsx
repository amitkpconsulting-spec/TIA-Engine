import React, { useState, useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { AssessmentReportView } from './components/AssessmentReportView';
import { ComparisonModeView } from './components/ComparisonModeView';
import { RemediationDashboardView } from './components/RemediationDashboardView';
import { ServerStatusView } from './components/ServerStatusView';
import { VisualDataFlow } from './components/VisualDataFlow';
import { TransferWizard } from './components/TransferWizard';
import { ThreePillarMatrixView } from './components/ThreePillarMatrixView';
import { PrudentialChecklistView } from './components/PrudentialChecklistView';
import { PolicyGeneratorView } from './components/PolicyGeneratorView';
import { JurisdictionLibrary } from './components/JurisdictionLibrary';
import { AirGapConsole } from './components/AirGapConsole';
import { CrossFrameworkIntegrationModal } from './components/CrossFrameworkIntegrationModal';
import { CustomizablePrintModal } from './components/CustomizablePrintModal';
import { CASE_STUDIES } from './data/caseStudies';
import { TransferProfile } from './types/tia';
import { evaluateTIA } from './utils/tiaEngine';
import { generateUniqueTiaId } from './utils/tiaIdGenerator';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('assessment');
  const [profile, setProfile] = useState<TransferProfile>(CASE_STUDIES['core-banking-us-cloud']);
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [customPolicyText, setCustomPolicyText] = useState<string | null>(null);

  // Compute evaluation dynamically whenever profile changes
  const evaluation = useMemo(() => {
    const res = evaluateTIA(profile);
    if (customPolicyText) {
      return {
        ...res,
        generatedPolicyDocument: customPolicyText
      };
    }
    return res;
  }, [profile, customPolicyText]);

  const handleSelectCaseStudy = (newProfile: TransferProfile) => {
    setProfile(newProfile);
    setCustomPolicyText(null);
    setActiveTab('assessment');
  };

  const handleResetNew = () => {
    const idBundle = generateUniqueTiaId();
    const blankProfile: TransferProfile = {
      id: `profile-${idBundle.universalUniqueIdentifier}`,
      tiaReferenceId: idBundle.tiaReferenceId,
      universalUniqueIdentifier: idBundle.universalUniqueIdentifier,
      crossFrameworkUrn: idBundle.crossFrameworkUrn,
      externalIntegrations: idBundle.externalIntegrations,
      title: 'Custom Cross-Border Data Transfer Assessment',
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      
      exporterName: 'UK Regulated Financial Institution',
      exporterType: 'bank',
      exporterRole: 'controller',
      exporterCountry: 'United Kingdom',
      dpoContact: 'dpo@institution.co.uk',
      cisoContact: 'ciso@institution.co.uk',
      seniorManagerFunction: 'SMF24 — Chief Operations',

      importerName: 'Global Cloud Service Provider',
      importerRole: 'processor',
      importerCountry: 'United States',
      importerSector: 'Enterprise Cloud Infrastructure / SaaS',
      isCoveredBySectorExemption: false,

      transferMechanism: 'uk_addendum_scc',
      transferType: 'transmission_hosting_storage',
      transferFrequency: 'regular_continuous',
      estimatedDataSubjectsCount: '1,000,000 subjects',
      dataVolume: '5 TB / month',

      dataCategories: {
        basicOperational: true,
        lowRiskPii: true,
        specialCategoryArt9: false,
        criminalConvictionsArt10: false,
        nationalIdentifierArt87: false,
        financialFraudSensitive: true,
        intellectualPropertyConfidential: false,
      },
      sensitiveDataDescription: 'Customer transaction records, payment data, corporate email addresses.',

      isMaterialOutsourcing: true,
      importantBusinessService: 'Retail Payment Processing & Settlement',
      impactToleranceHours: 4,
      stepInRiskAcknowledged: true,
      intragroupArrangement: false,
      controlAndInfluenceLevel: 'medium',

      transitEncryption: true,
      transitProtocol: 'TLS 1.3 with mTLS',
      atRestEncryption: true,
      atRestAlgorithm: 'AES-256-GCM',
      keyManagement: 'byok_local_hsm',
      pseudonymizationPriorToTransfer: true,
      confidentialComputingEnclaves: false,
      zeroTrustNetworkAccess: true,

      hasDirectAuditRights: true,
      praDirectInspectionClause: true,
      foreignWarrantNotificationClause: true,
      foreignWarrantChallengeCommitment: true,
      transparencyReportAvailable: true,
      pastSurveillanceRequestsCount: 0,
      dataSubjectIndemnification: true,
      unannouncedAuditPermitted: true,
      immediateExitAndPurgeClause: true,

      testedStressedExitPlan: true,
      multiRegionActiveFailover: true,
      substitutabilityRating: 'substitutable_under_3_months',
      evergreenReviewCadenceYears: 1,

      subProcessors: [],
      priorWrittenAuthRequiredForSubprocessors: true,
      subprocessorNoticePeriodDays: 30,
    };
    setProfile(blankProfile);
    setCustomPolicyText(null);
    setActiveTab('wizard');
  };

  const handleExportJson = () => {
    const exportPacket = {
      meta: {
        system: 'SovereignTIA Regulatory Engine',
        standard: 'PRA SS2/21, GDPR Articles 44-49, EDPB 01/2020 & CNIL TIA',
        generatedAt: new Date().toISOString(),
        tiaReferenceId: evaluation.tiaReferenceId || profile.tiaReferenceId,
        universalUniqueIdentifier: evaluation.universalUniqueIdentifier || profile.universalUniqueIdentifier,
        crossFrameworkUrn: evaluation.crossFrameworkUrn || profile.crossFrameworkUrn,
        cryptographicFingerprint: evaluation.cryptographicFingerprint,
      },
      profile,
      evaluation
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPacket, null, 2));
    const downloadAnchor = document.createElement('a');
    const safeRef = evaluation.tiaReferenceId || profile.tiaReferenceId || profile.id;
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `TIA_Dossier_${safeRef}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#D1D5DB] flex flex-col font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navigation */}
      <Navbar
        currentProfile={profile}
        onSelectCaseStudy={handleSelectCaseStudy}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetNew={handleResetNew}
        onExportJson={handleExportJson}
        onOpenConsole={() => setIsConsoleOpen(true)}
        onOpenIntegrationModal={() => setIsIntegrationModalOpen(true)}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        isAiAvailable={true}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'assessment' && (
          <AssessmentReportView
            profile={profile}
            evaluation={evaluation}
            onNavigateTab={setActiveTab}
            onOpenIntegrationModal={() => setIsIntegrationModalOpen(true)}
          />
        )}

        {activeTab === 'comparison' && (
          <ComparisonModeView
            currentActiveProfile={profile}
            onSelectActiveProfile={(newProfile) => {
              setProfile(newProfile);
              setCustomPolicyText(null);
            }}
            onNavigateToWizard={() => setActiveTab('wizard')}
          />
        )}

        {activeTab === 'remediation' && (
          <RemediationDashboardView
            profile={profile}
            evaluation={evaluation}
          />
        )}

        {activeTab === 'dataflow' && (
          <VisualDataFlow
            profile={profile}
            evaluation={evaluation}
          />
        )}

        {activeTab === 'wizard' && (
          <TransferWizard
            profile={profile}
            onUpdateProfile={(updated) => {
              setProfile(updated);
              setCustomPolicyText(null);
            }}
            onRunAssessment={() => setActiveTab('assessment')}
          />
        )}

        {activeTab === 'threepillars' && (
          <ThreePillarMatrixView
            evaluation={evaluation}
            profile={profile}
          />
        )}

        {activeTab === 'prudential' && (
          <PrudentialChecklistView
            profile={profile}
            evaluation={evaluation}
          />
        )}

        {activeTab === 'policy' && (
          <PolicyGeneratorView
            profile={profile}
            evaluation={evaluation}
            onUpdatePolicyText={(newText) => setCustomPolicyText(newText)}
          />
        )}

        {activeTab === 'jurisdictions' && (
          <JurisdictionLibrary />
        )}

        {activeTab === 'server' && (
          <ServerStatusView
            onOpenConsole={() => setIsConsoleOpen(true)}
          />
        )}
      </main>

      {/* Technical Telemetry & Compliance Footer */}
      <footer className="py-3 bg-[#080809] text-[#71717A] text-[10px] font-mono border-t border-[#262626] uppercase tracking-wider">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1.5 text-center md:text-left">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
              <span className="text-[#D1D5DB] font-semibold">TIA-ENGINE v4.2</span>
            </div>
            <span className="text-[#3F3F46] hidden sm:inline">|</span>
            <div className="flex items-center gap-1 text-[#A1A1AA]">
              <span>LICENSE:</span>
              <span className="text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">PROPRIETARY</span>
            </div>
            <span className="text-[#3F3F46] hidden sm:inline">|</span>
            <div className="flex items-center gap-1">
              <span>CONTACT:</span>
              <a
                href="https://www.technoscope.co.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline font-semibold transition-colors normal-case tracking-normal flex items-center gap-1"
                title="Visit Technoscope (www.technoscope.co.in)"
              >
                <span>www.technoscope.co.in</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-3 gap-y-1.5 text-[#52525B]">
            <span className="hidden lg:inline text-[9px] text-[#52525B]">
              PRA SS2/21 • GDPR ART 44-49 • EDPB 01/2020 • DORA
            </span>
            <span className="hidden lg:inline text-[#3F3F46]">•</span>
            <button
              onClick={() => setActiveTab('server')}
              className="text-[#A1A1AA] hover:text-emerald-400 cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>SERVER: ONLINE</span>
            </button>
            <span className="text-[#3F3F46]">•</span>
            <button 
              onClick={() => setIsConsoleOpen(true)}
              className="text-emerald-500 hover:text-emerald-400 cursor-pointer font-bold flex items-center gap-1 transition-colors"
            >
              CONSOLE &gt;_
            </button>
          </div>
        </div>
      </footer>

      {/* Air-Gap Terminal Modal */}
      <AirGapConsole
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
        profile={profile}
        evaluation={evaluation}
      />

      {/* Cross-Framework GRC Interoperability & Unique TIA Registry Modal */}
      <CrossFrameworkIntegrationModal
        isOpen={isIntegrationModalOpen}
        onClose={() => setIsIntegrationModalOpen(false)}
        profile={profile}
        evaluation={evaluation}
        onUpdateProfile={(updated) => {
          setProfile(updated);
          setCustomPolicyText(null);
        }}
      />

      {/* Customizable Print & Dossier Export Modal */}
      <CustomizablePrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        onGoHome={() => {
          setIsPrintModalOpen(false);
          setActiveTab('assessment');
        }}
        profile={profile}
        evaluation={evaluation}
      />
    </div>
  );
}
