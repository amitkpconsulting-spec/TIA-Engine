import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Globe, 
  Building2, 
  ArrowRight, 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  Layers,
  FileCheck
} from 'lucide-react';
import { TransferProfile } from '../types/tia';
import { CASE_STUDIES } from '../data/caseStudies';
import { addActivityLog } from '../utils/activityLogger';

interface OnboardingSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyConfig: (configuredProfile: TransferProfile) => void;
  onSkip: () => void;
}

export const PREDEFINED_REGIONS = [
  { 
    id: 'uk', 
    name: 'United Kingdom', 
    subtitle: 'UK GDPR, Data Protection Act 2018 & PRA SS2/21',
    flag: '🇬🇧',
    defaultCorridor: 'United States',
    recommendedPreset: 'core-banking-us-cloud'
  },
  { 
    id: 'eu', 
    name: 'European Union (EEA)', 
    subtitle: 'EU GDPR, EDPB 01/2020 & DORA Regulation',
    flag: '🇪🇺',
    defaultCorridor: 'Germany',
    recommendedPreset: 'lloyds-cat-risk-germany'
  },
  { 
    id: 'us', 
    name: 'United States', 
    subtitle: 'US CLOUD Act, State Privacy & GLBA Standards',
    flag: '🇺🇸',
    defaultCorridor: 'United States',
    recommendedPreset: 'neobank-biometrics-aml'
  },
  { 
    id: 'apac', 
    name: 'Asia-Pacific (APAC)', 
    subtitle: 'Singapore PDPA / MAS Outsourcing Guidelines & Hong Kong HKMA',
    flag: '🇸🇬',
    defaultCorridor: 'Singapore',
    recommendedPreset: 'quant-ai-model-singapore'
  },
  { 
    id: 'ch', 
    name: 'Switzerland', 
    subtitle: 'Swiss Revised FADP & FINMA Outsourcing Circular 2018/3',
    flag: '🇨🇭',
    defaultCorridor: 'Switzerland',
    recommendedPreset: 'private-wealth-switzerland'
  },
  { 
    id: 'uae', 
    name: 'Middle East (UAE / DIFC)', 
    subtitle: 'DIFC Data Protection Law No. 5 & ADGM Regulations',
    flag: '🇦🇪',
    defaultCorridor: 'United Arab Emirates',
    recommendedPreset: 'cryptoasset-mpc-difc'
  },
];

export const PREDEFINED_INDUSTRIES = [
  { 
    id: 'banking', 
    name: 'Retail & Commercial Banking', 
    subtitle: 'Core Banking, Ledgers, Clearing & Settlement',
    icon: '🏦',
    isMaterialOutsourcing: true,
    importantService: 'Core Banking Ledger & Payment Settlement',
    keyManagement: 'byok_local_hsm' as const,
    presetId: 'core-banking-us-cloud'
  },
  { 
    id: 'insurance', 
    name: 'Insurance & Reinsurance', 
    subtitle: 'Solvency II, Actuarial Underwriting & Policy BPO',
    icon: '🛡️',
    isMaterialOutsourcing: true,
    importantService: 'Policy Administration & Claims Settlement',
    keyManagement: 'byok_local_hsm' as const,
    presetId: 'solvency-insurer-bpo-india'
  },
  { 
    id: 'investment', 
    name: 'Investment Management & Hedge Funds', 
    subtitle: 'Quantitative AI Models, Algorithmic Execution & MIFID II',
    icon: '⚡',
    isMaterialOutsourcing: true,
    importantService: 'Quantitative Risk Modeling & Automated Execution',
    keyManagement: 'byok_local_hsm' as const,
    presetId: 'quant-ai-model-singapore'
  },
  { 
    id: 'payments', 
    name: 'Payments, FinTech & E-Money', 
    subtitle: 'PSD2, Anti-DDoS, Real-time AML & Biometrics',
    icon: '💳',
    isMaterialOutsourcing: true,
    importantService: 'Real-time Payment Screening & Card Auth',
    keyManagement: 'cloud_kms_customer_managed' as const,
    presetId: 'neobank-biometrics-aml'
  },
  { 
    id: 'crypto', 
    name: 'Digital Assets & Crypto Custody', 
    subtitle: 'MPC Key Sharding, High-Security HSM Vaults & MiCA',
    icon: '🔐',
    isMaterialOutsourcing: true,
    importantService: 'Cryptographic Key Sharding & Asset Custody',
    keyManagement: 'byok_local_hsm' as const,
    presetId: 'cryptoasset-mpc-difc'
  },
  { 
    id: 'enterprise', 
    name: 'Enterprise Cloud & HR SaaS', 
    subtitle: 'Cross-Border Employee Records, Global Payroll & ERP',
    icon: '🏢',
    isMaterialOutsourcing: false,
    importantService: 'Enterprise Corporate Services & Global Payroll',
    keyManagement: 'cloud_kms_customer_managed' as const,
    presetId: 'hr-payroll-cloud-canada'
  }
];

export const OnboardingSetupModal: React.FC<OnboardingSetupModalProps> = ({
  isOpen,
  onClose,
  onApplyConfig,
  onSkip
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [institutionName, setInstitutionName] = useState<string>('');
  
  // Validation errors
  const [regionError, setRegionError] = useState<string>('');
  const [industryError, setIndustryError] = useState<string>('');

  if (!isOpen) return null;

  const currentRegionObj = PREDEFINED_REGIONS.find(r => r.id === selectedRegion);
  const currentIndustryObj = PREDEFINED_INDUSTRIES.find(i => i.id === selectedIndustry);

  const handleNext = () => {
    let hasError = false;
    if (!selectedRegion) {
      setRegionError('Please select your operating regulatory region.');
      hasError = true;
    } else {
      setRegionError('');
    }

    if (!selectedIndustry) {
      setIndustryError('Please select your primary industry sector.');
      hasError = true;
    } else {
      setIndustryError('');
    }

    if (hasError) return;

    // Pick best matching preset based on industry or region
    const targetPresetKey = currentIndustryObj?.presetId || currentRegionObj?.recommendedPreset || 'core-banking-us-cloud';
    const basePreset = CASE_STUDIES[targetPresetKey] || CASE_STUDIES['core-banking-us-cloud'];

    // Clone and customize with user selections
    const customized: TransferProfile = {
      ...basePreset,
      id: `profile-${Date.now()}`,
      title: `${institutionName || currentRegionObj?.name || 'Regulated'} ${currentIndustryObj?.name || 'Financial'} Data Transfer Profile`,
      exporterName: institutionName || `${currentRegionObj?.name || 'UK'} Regulated Institution`,
      exporterCountry: currentRegionObj?.name || 'United Kingdom',
      exporterType: (currentIndustryObj?.id === 'insurance' ? 'insurer' : 
                     currentIndustryObj?.id === 'investment' ? 'investment_firm' : 
                     currentIndustryObj?.id === 'payments' ? 'payment_institution' : 'bank') as any,
      isMaterialOutsourcing: currentIndustryObj?.isMaterialOutsourcing ?? true,
      importantBusinessService: currentIndustryObj?.importantService || basePreset.importantBusinessService,
      keyManagement: currentIndustryObj?.keyManagement || 'byok_local_hsm',
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    // Log the onboarding configuration
    addActivityLog({
      userName: 'Compliance Lead',
      userRole: 'Regulatory Governance Officer',
      actionTaken: `Completed Guided Setup: Configured ${currentRegionObj?.name} / ${currentIndustryObj?.name}`,
      targetEntity: customized.title,
      statusChange: 'Smart Defaults & Baseline Settings Applied',
      severity: 'Compliant'
    });

    try {
      localStorage.setItem('tia_onboarding_completed', 'true');
      localStorage.removeItem('tia_onboarding_skipped');
    } catch (e) {
      // silent
    }

    onApplyConfig(customized);
    onClose();
  };

  const handleSkipForNow = () => {
    try {
      localStorage.setItem('tia_onboarding_skipped', 'true');
    } catch (e) {
      // silent
    }
    onSkip();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs font-sans text-[#D1D5DB]"
      onClick={handleSkipForNow}
    >
      <div 
        className="bg-[#0F0F10] border border-[#262626] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#262626] bg-[#141415]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.25)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                  Guided Compliance Setup
                </h2>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800 font-semibold font-mono">
                  Smart Defaults
                </span>
              </div>
              <p className="text-xs text-[#71717A] mt-0.5">
                Configure your regulatory jurisdiction and industry to automatically populate baseline compliance rules.
              </p>
            </div>
          </div>
          <button 
            onClick={handleSkipForNow}
            className="p-1.5 text-[#71717A] hover:text-white hover:bg-[#262626] rounded-lg transition-colors cursor-pointer"
            title="Skip for now"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-[#0A0A0B]">
          {/* Step Instructions */}
          <div className="bg-[#141415] border border-[#262626] p-3.5 rounded-xl flex items-start gap-3">
            <Globe className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div className="text-xs text-[#A1A1AA] leading-relaxed">
              Select your operating region and sector below. SovereignTIA will immediately calibrate <strong>EDPB 01/2020 transfer mechanisms</strong>, <strong>PRA SS2/21 operational resilience</strong> rules, and pre-load appropriate technical safeguards.
            </div>
          </div>

          {/* Institution / Org Name (Optional) */}
          <div>
            <label className="block text-xs font-mono font-semibold text-white uppercase tracking-wider mb-1.5">
              Institution or Entity Name <span className="text-[#71717A] font-normal normal-case">(Optional)</span>
            </label>
            <input
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder="e.g. Meridian Sterling Bank plc / Horizon Life Assurance"
              className="w-full bg-[#141415] border border-[#262626] rounded-lg px-3.5 py-2 text-xs text-white placeholder-[#52525B] focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Region Dropdown (Required) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                1. Regulatory Region <span className="text-rose-400 font-bold">*</span>
              </label>
              {selectedRegion && (
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Selected
                </span>
              )}
            </div>

            <div className="relative">
              <select
                aria-label="Operating Regulatory Region"
                value={selectedRegion}
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  if (regionError) setRegionError('');
                }}
                className={`w-full bg-[#141415] border rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors cursor-pointer appearance-none ${
                  regionError 
                    ? 'border-rose-500 focus:border-rose-500 bg-rose-950/20' 
                    : 'border-[#262626] focus:border-emerald-500'
                }`}
              >
                <option value="" disabled>-- Select Your Operating Region --</option>
                {PREDEFINED_REGIONS.map((reg) => (
                  <option key={reg.id} value={reg.id} className="bg-[#141415] text-white py-1">
                    {reg.flag} {reg.name} — {reg.subtitle}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#71717A]">
                <Globe className="w-4 h-4 text-[#71717A]" />
              </div>
            </div>

            {/* Inline Error Text */}
            {regionError && (
              <p className="text-xs text-rose-400 font-mono mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{regionError}</span>
              </p>
            )}
          </div>

          {/* Industry Dropdown (Required) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                2. Industry Sector <span className="text-rose-400 font-bold">*</span>
              </label>
              {selectedIndustry && (
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Selected
                </span>
              )}
            </div>

            <div className="relative">
              <select
                aria-label="Industry Sector"
                value={selectedIndustry}
                onChange={(e) => {
                  setSelectedIndustry(e.target.value);
                  if (industryError) setIndustryError('');
                }}
                className={`w-full bg-[#141415] border rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors cursor-pointer appearance-none ${
                  industryError 
                    ? 'border-rose-500 focus:border-rose-500 bg-rose-950/20' 
                    : 'border-[#262626] focus:border-emerald-500'
                }`}
              >
                <option value="" disabled>-- Select Your Industry Sector --</option>
                {PREDEFINED_INDUSTRIES.map((ind) => (
                  <option key={ind.id} value={ind.id} className="bg-[#141415] text-white py-1">
                    {ind.icon} {ind.name} — {ind.subtitle}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#71717A]">
                <Building2 className="w-4 h-4 text-[#71717A]" />
              </div>
            </div>

            {/* Inline Error Text */}
            {industryError && (
              <p className="text-xs text-rose-400 font-mono mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{industryError}</span>
              </p>
            )}
          </div>

          {/* Smart Defaults Applied Preview */}
          {selectedRegion && selectedIndustry && (
            <div className="bg-[#121214] border border-emerald-800/40 rounded-xl p-4 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Smart Defaults Preview:
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1 text-[#A1A1AA]">
                <div className="bg-[#161618] p-2.5 rounded border border-[#262626]">
                  <span className="text-[10px] text-[#71717A] uppercase block">Jurisdiction Scope</span>
                  <span className="text-white font-semibold mt-0.5 block">{currentRegionObj?.name}</span>
                </div>
                <div className="bg-[#161618] p-2.5 rounded border border-[#262626]">
                  <span className="text-[10px] text-[#71717A] uppercase block">Operational Resilience</span>
                  <span className="text-amber-400 font-semibold mt-0.5 block">
                    {currentIndustryObj?.isMaterialOutsourcing ? 'PRA SS2/21 CIF (Material)' : 'Standard Outsourcing'}
                  </span>
                </div>
                <div className="bg-[#161618] p-2.5 rounded border border-[#262626]">
                  <span className="text-[10px] text-[#71717A] uppercase block">Key Custody Baseline</span>
                  <span className="text-cyan-400 font-semibold mt-0.5 block">
                    {currentIndustryObj?.keyManagement === 'byok_local_hsm' ? 'BYOK (Local HSM)' : 'Cloud KMS Customer-Managed'}
                  </span>
                </div>
                <div className="bg-[#161618] p-2.5 rounded border border-[#262626]">
                  <span className="text-[10px] text-[#71717A] uppercase block">Important Business Service</span>
                  <span className="text-[#D1D5DB] font-semibold mt-0.5 block truncate" title={currentIndustryObj?.importantService}>
                    {currentIndustryObj?.importantService}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        <div className="p-4 border-t border-[#262626] bg-[#141415] flex items-center justify-between">
          <button
            type="button"
            onClick={handleSkipForNow}
            className="px-3.5 py-2 text-xs font-mono text-[#71717A] hover:text-white hover:bg-[#1F1F21] rounded-lg transition-colors cursor-pointer"
          >
            Skip for now
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 text-xs font-mono font-bold text-black bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.35)]"
            >
              <span>Apply & Launch Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
