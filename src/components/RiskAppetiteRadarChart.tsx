import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip
} from 'recharts';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Layers, 
  Scale, 
  Lock, 
  Server, 
  Eye, 
  TrendingUp, 
  Activity 
} from 'lucide-react';
import { TransferProfile, TIAEvaluationResult } from '../types/tia';

interface RiskAppetiteRadarChartProps {
  profile: TransferProfile;
  evaluation: TIAEvaluationResult;
}

export type RiskAppetiteTier = 'conservative_cif' | 'balanced_standard' | 'flexible_low_impact' | 'custom';

interface DimensionData {
  dimension: string;
  category: 'Legal' | 'Operational' | 'Technical' | 'Surveillance' | 'Supply Chain' | 'Data Sensitivity';
  currentRisk: number; // 0-100 (Higher = more risk)
  appetiteThreshold: number; // 0-100 (Threshold limit)
  mitigationStrength: number; // 0-100 (Safeguard coverage)
  status: 'compliant' | 'warning' | 'breach';
  keySafeguard: string;
  rationale: string;
}

export const RiskAppetiteRadarChart: React.FC<RiskAppetiteRadarChartProps> = ({
  profile,
  evaluation
}) => {
  // Risk appetite presets
  const [appetiteTier, setAppetiteTier] = useState<RiskAppetiteTier>(
    profile.isMaterialOutsourcing ? 'conservative_cif' : 'balanced_standard'
  );
  const [customThreshold, setCustomThreshold] = useState<number>(35);
  const [showMitigationCoverage, setShowMitigationCoverage] = useState<boolean>(true);
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);

  // Compute thresholds based on tier
  const appetiteThresholds = useMemo(() => {
    switch (appetiteTier) {
      case 'conservative_cif':
        // Strict thresholds for Critical Important Functions (PRA SS2/21 CIF)
        return {
          legal: 25,
          operational: 20,
          technical: 25,
          surveillance: 30,
          supplyChain: 25,
          dataSensitivity: 25
        };
      case 'balanced_standard':
        // Standard financial institution threshold
        return {
          legal: 40,
          operational: 35,
          technical: 40,
          surveillance: 45,
          supplyChain: 40,
          dataSensitivity: 40
        };
      case 'flexible_low_impact':
        // Non-material, low impact outsourcing
        return {
          legal: 60,
          operational: 55,
          technical: 60,
          surveillance: 65,
          supplyChain: 60,
          dataSensitivity: 60
        };
      case 'custom':
        return {
          legal: customThreshold,
          operational: Math.max(15, customThreshold - 5),
          technical: customThreshold,
          surveillance: Math.min(85, customThreshold + 5),
          supplyChain: customThreshold,
          dataSensitivity: customThreshold
        };
    }
  }, [appetiteTier, customThreshold]);

  // Compute dimension scores
  const chartData: DimensionData[] = useMemo(() => {
    // 1. Legal Risk (0-100)
    const legalRisk = Math.max(5, 100 - (evaluation.scores?.legalSafeguardsScore ?? 50));
    const legalThreshold = appetiteThresholds.legal;
    const legalStatus: 'compliant' | 'warning' | 'breach' = 
      legalRisk <= legalThreshold ? 'compliant' : legalRisk <= legalThreshold + 15 ? 'warning' : 'breach';

    // 2. Operational & BCP Risk (PRA SS2/21)
    const operationalRisk = Math.max(5, 100 - (evaluation.scores?.praResilienceScore ?? 50));
    const operationalThreshold = appetiteThresholds.operational;
    const operationalStatus: 'compliant' | 'warning' | 'breach' = 
      operationalRisk <= operationalThreshold ? 'compliant' : operationalRisk <= operationalThreshold + 15 ? 'warning' : 'breach';

    // 3. Technical & Cryptographic Risk
    const technicalRisk = Math.max(5, 100 - (evaluation.scores?.technicalProtectionScore ?? 50));
    const technicalThreshold = appetiteThresholds.technical;
    const technicalStatus: 'compliant' | 'warning' | 'breach' = 
      technicalRisk <= technicalThreshold ? 'compliant' : technicalRisk <= technicalThreshold + 15 ? 'warning' : 'breach';

    // 4. Surveillance Exposure Risk
    const surveillanceRisk = Math.max(5, evaluation.scores?.surveillanceRiskScore ?? 50);
    const surveillanceThreshold = appetiteThresholds.surveillance;
    const surveillanceStatus: 'compliant' | 'warning' | 'breach' = 
      surveillanceRisk <= surveillanceThreshold ? 'compliant' : surveillanceRisk <= surveillanceThreshold + 15 ? 'warning' : 'breach';

    // 5. Supply Chain / Sub-processor Risk
    let subProcRisk = 20;
    if (profile.subProcessors && profile.subProcessors.length > 0) {
      subProcRisk += profile.subProcessors.length * 8;
      if (profile.subProcessors.some(sp => sp.hasAccessToClearData)) subProcRisk += 25;
      if (!profile.priorWrittenAuthRequiredForSubprocessors) subProcRisk += 20;
      if (profile.subprocessorNoticePeriodDays < 30) subProcRisk += 10;
    } else {
      subProcRisk = 15;
    }
    subProcRisk = Math.min(95, Math.max(10, subProcRisk));
    const supplyChainThreshold = appetiteThresholds.supplyChain;
    const supplyChainStatus: 'compliant' | 'warning' | 'breach' = 
      subProcRisk <= supplyChainThreshold ? 'compliant' : subProcRisk <= supplyChainThreshold + 15 ? 'warning' : 'breach';

    // 6. Data Sensitivity & Criticality Risk
    let dataRiskScore = 15;
    if (profile.dataCategories?.specialCategoryArt9) dataRiskScore += 25;
    if (profile.dataCategories?.criminalConvictionsArt10) dataRiskScore += 20;
    if (profile.dataCategories?.financialFraudSensitive) dataRiskScore += 20;
    if (profile.dataCategories?.nationalIdentifierArt87) dataRiskScore += 15;
    if (profile.dataCategories?.intellectualPropertyConfidential) dataRiskScore += 15;
    dataRiskScore = Math.min(95, Math.max(10, dataRiskScore));
    const dataThreshold = appetiteThresholds.dataSensitivity;
    const dataStatus: 'compliant' | 'warning' | 'breach' = 
      dataRiskScore <= dataThreshold ? 'compliant' : dataRiskScore <= dataThreshold + 15 ? 'warning' : 'breach';

    return [
      {
        dimension: 'Legal & Terms',
        category: 'Legal',
        currentRisk: legalRisk,
        appetiteThreshold: legalThreshold,
        mitigationStrength: evaluation.scores?.legalSafeguardsScore ?? 50,
        status: legalStatus,
        keySafeguard: profile.foreignWarrantChallengeCommitment ? 'Warrant Challenge Clause + S166 FSMA Audit' : 'Standard Contractual Clauses (SCCs)',
        rationale: `Contractual safeguards scored ${evaluation.scores?.legalSafeguardsScore ?? 0}/100.`
      },
      {
        dimension: 'Operational (PRA)',
        category: 'Operational',
        currentRisk: operationalRisk,
        appetiteThreshold: operationalThreshold,
        mitigationStrength: evaluation.scores?.praResilienceScore ?? 50,
        status: operationalStatus,
        keySafeguard: profile.testedStressedExitPlan ? 'Tested Stressed Exit + Multi-Region Active Failover' : 'Basic BCP & SLA Monitoring',
        rationale: `PRA SS2/21 operational resilience evaluated at ${evaluation.scores?.praResilienceScore ?? 0}/100.`
      },
      {
        dimension: 'Technical Shield',
        category: 'Technical',
        currentRisk: technicalRisk,
        appetiteThreshold: technicalThreshold,
        mitigationStrength: evaluation.scores?.technicalProtectionScore ?? 50,
        status: technicalStatus,
        keySafeguard: profile.keyManagement === 'byok_local_hsm' ? 'BYOK (Local HSM Key Isolation)' : `${profile.transitProtocol} + ${profile.atRestAlgorithm}`,
        rationale: `Technical encryption & key isolation evaluated at ${evaluation.scores?.technicalProtectionScore ?? 0}/100.`
      },
      {
        dimension: 'Surveillance Exp.',
        category: 'Surveillance',
        currentRisk: surveillanceRisk,
        appetiteThreshold: surveillanceThreshold,
        mitigationStrength: Math.max(0, 100 - surveillanceRisk),
        status: surveillanceStatus,
        keySafeguard: 'Essential Guarantees Screening & Country Index',
        rationale: `Foreign intelligence/surveillance risk evaluated at ${surveillanceRisk}/100 in ${profile.importerCountry}.`
      },
      {
        dimension: 'Supply Chain',
        category: 'Supply Chain',
        currentRisk: subProcRisk,
        appetiteThreshold: supplyChainThreshold,
        mitigationStrength: Math.max(10, 100 - subProcRisk),
        status: supplyChainStatus,
        keySafeguard: profile.priorWrittenAuthRequiredForSubprocessors ? `Prior Written Auth (${profile.subprocessorNoticePeriodDays}d Notice)` : 'General Subcontractor Authorisation',
        rationale: `${profile.subProcessors?.length || 0} downstream sub-processors in supply chain.`
      },
      {
        dimension: 'Data Sensitivity',
        category: 'Data Sensitivity',
        currentRisk: dataRiskScore,
        appetiteThreshold: dataThreshold,
        mitigationStrength: Math.max(10, 100 - dataRiskScore),
        status: dataStatus,
        keySafeguard: profile.pseudonymizationPriorToTransfer ? 'Pre-Transfer Field-Level Pseudonymization' : 'Encrypted Raw Ingestion',
        rationale: `Data category risk classified at ${dataRiskScore}/100.`
      }
    ];
  }, [profile, evaluation, appetiteThresholds]);

  // Overall appetite breach summary
  const summaryStats = useMemo(() => {
    const breaches = chartData.filter(d => d.status === 'breach').length;
    const warnings = chartData.filter(d => d.status === 'warning').length;
    const compliant = chartData.filter(d => d.status === 'compliant').length;
    const maxBreach = chartData.reduce((max, item) => Math.max(max, item.currentRisk - item.appetiteThreshold), 0);

    return {
      breaches,
      warnings,
      compliant,
      isOverallCompliant: breaches === 0,
      maxBreachPoints: maxBreach > 0 ? maxBreach : 0
    };
  }, [chartData]);

  // Custom Radar Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: DimensionData = payload[0].payload;
      return (
        <div className="bg-[#0D0D0E] border border-[#333336] p-3 rounded-lg shadow-2xl font-mono text-xs max-w-xs z-50">
          <div className="flex items-center justify-between border-b border-[#262626] pb-1.5 mb-2">
            <span className="font-bold text-white uppercase text-[11px]">{data.dimension}</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
              data.status === 'compliant' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
              data.status === 'warning' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
              'bg-rose-950 text-rose-400 border border-rose-800'
            }`}>
              {data.status.toUpperCase()}
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#71717A]">Current Transfer Risk:</span>
              <span className="font-bold text-rose-400">{data.currentRisk}/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#71717A]">Risk Appetite Limit:</span>
              <span className="font-bold text-cyan-400">{data.appetiteThreshold}/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#71717A]">Variance / Delta:</span>
              <span className={`font-bold ${data.currentRisk > data.appetiteThreshold ? 'text-rose-400' : 'text-emerald-400'}`}>
                {data.currentRisk > data.appetiteThreshold ? `+${data.currentRisk - data.appetiteThreshold} pts (Breach)` : `${data.currentRisk - data.appetiteThreshold} pts (Within Appetite)`}
              </span>
            </div>
            {showMitigationCoverage && (
              <div className="flex justify-between pt-1 border-t border-[#1F1F21]">
                <span className="text-[#71717A]">Mitigation Coverage:</span>
                <span className="font-bold text-emerald-400">{data.mitigationStrength}%</span>
              </div>
            )}
          </div>

          <div className="mt-2 pt-1.5 border-t border-[#262626] text-[10px] text-[#A1A1AA] font-sans leading-tight">
            <span className="text-emerald-400 font-mono font-bold block mb-0.5">Key Safeguard:</span>
            {data.keySafeguard}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#262626] pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#1A1A1B] text-cyan-400 border border-cyan-800/60 flex items-center justify-center font-mono text-xs font-bold shadow-[0_0_10px_rgba(6,182,212,0.15)]">
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                Risk Profile vs. Institution Risk Appetite Thresholds
              </h2>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                RECHARTS RADAR ANALYSIS
              </span>
            </div>
            <p className="text-[11px] text-[#71717A] font-mono">
              Multivariate benchmark comparing Transfer Risk across 6 governance vectors against Board-approved tolerance limits
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex flex-wrap items-center gap-2">
          {summaryStats.isOverallCompliant ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ALL DIMENSIONS WITHIN RISK APPETITE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold bg-rose-950/80 text-rose-400 border border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.2)]">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              {summaryStats.breaches} APPETITE BREACH{summaryStats.breaches > 1 ? 'ES' : ''} DETECTED
            </span>
          )}
        </div>
      </div>

      {/* Interactive Controls & Appetite Preset Selector */}
      <div className="bg-[#141415] rounded-lg border border-[#262626] p-3.5 mb-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase font-bold text-[#71717A] flex items-center gap-1">
            <Sliders className="w-3 h-3 text-cyan-400" /> Risk Appetite Tier:
          </span>
          {[
            { id: 'conservative_cif', label: 'Tier 1 Bank / CIF (Strict)', badge: '20-30 Limit' },
            { id: 'balanced_standard', label: 'Standard Enterprise (Balanced)', badge: '35-45 Limit' },
            { id: 'flexible_low_impact', label: 'Low-Impact / Non-Material', badge: '55-65 Limit' },
            { id: 'custom', label: 'Custom Slider', badge: `${customThreshold} Limit` }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setAppetiteTier(t.id as RiskAppetiteTier)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                appetiteTier === t.id
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 font-bold shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                  : 'bg-[#1A1A1B] text-[#A1A1AA] hover:text-white border border-[#262626]'
              }`}
            >
              <span>{t.label}</span>
              <span className="text-[9px] opacity-75 font-sans">({t.badge})</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          {appetiteTier === 'custom' && (
            <div className="flex items-center gap-2 bg-[#0A0A0B] px-2.5 py-1 rounded border border-[#262626]">
              <span className="text-[10px] text-[#71717A]">Threshold:</span>
              <input
                type="range"
                min="15"
                max="80"
                value={customThreshold}
                onChange={(e) => setCustomThreshold(Number(e.target.value))}
                className="w-20 accent-cyan-400 cursor-pointer"
              />
              <span className="text-xs font-bold text-cyan-400">{customThreshold}</span>
            </div>
          )}

          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#A1A1AA] hover:text-white select-none">
            <input
              type="checkbox"
              checked={showMitigationCoverage}
              onChange={(e) => setShowMitigationCoverage(e.target.checked)}
              className="rounded bg-[#262626] border-[#3F3F46] text-emerald-500 focus:ring-0 accent-emerald-500 cursor-pointer"
            />
            <span>Show Safeguard Strength</span>
          </label>
        </div>
      </div>

      {/* Main Grid: Radar Chart + Dimensional Breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left / Center: Radar Chart Canvas */}
        <div className="lg:col-span-6 bg-[#121214] rounded-lg border border-[#262626] p-4 flex flex-col items-center justify-center relative min-h-[380px]">
          
          {/* Quick Legend Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 text-[10px] font-mono z-10 bg-[#0A0A0B]/80 backdrop-blur-xs p-2 rounded border border-[#262626]">
            <div className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 border border-rose-400"></span>
              <span>Current Transfer Risk (Lower is better)</span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500/40 border border-cyan-400 border-dashed"></span>
              <span>Appetite Threshold (Max Allowed)</span>
            </div>
            {showMitigationCoverage && (
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 border border-emerald-400"></span>
                <span>Mitigation Coverage (Higher is better)</span>
              </div>
            )}
          </div>

          <div className="w-full h-80 sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="54%" outerRadius="72%" data={chartData}>
                <PolarGrid stroke="#262626" strokeDasharray="3 3" />
                
                <PolarAngleAxis 
                  dataKey="dimension" 
                  tick={{ fill: '#A1A1AA', fontSize: 11, fontFamily: 'monospace' }}
                />
                
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: '#52525B', fontSize: 9, fontFamily: 'monospace' }}
                  stroke="#333336"
                />

                <Tooltip content={<CustomTooltip />} />

                {/* 1. Current Transfer Risk Polygon */}
                <Radar
                  name="Current Transfer Risk"
                  dataKey="currentRisk"
                  stroke="#F43F5E"
                  fill="#F43F5E"
                  fillOpacity={0.45}
                  strokeWidth={2}
                />

                {/* 2. Appetite Threshold Polygon */}
                <Radar
                  name="Risk Appetite Limit"
                  dataKey="appetiteThreshold"
                  stroke="#06B6D4"
                  fill="#06B6D4"
                  fillOpacity={0.15}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />

                {/* 3. Mitigation Strength (Optional) */}
                {showMitigationCoverage && (
                  <Radar
                    name="Mitigation Coverage"
                    dataKey="mitigationStrength"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.18}
                    strokeWidth={1.5}
                  />
                )}
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] text-[#71717A] font-mono mt-1 text-center">
            *Outer vertices represent high scores (100). Hover vertices to inspect specific dimensional metrics.
          </div>
        </div>

        {/* Right: Detailed Dimensional Metric Cards & Variance Analysis */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase font-bold text-[#A1A1AA] flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              Dimensional Risk vs Appetite Scorecard
            </h3>
            <span className="text-[10px] font-mono text-[#71717A]">
              Baseline Scale: 0 (Negligible) - 100 (Critical)
            </span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {chartData.map((item) => {
              const variance = item.currentRisk - item.appetiteThreshold;
              const isBreached = variance > 0;

              return (
                <div
                  key={item.dimension}
                  onMouseEnter={() => setSelectedDimension(item.dimension)}
                  onMouseLeave={() => setSelectedDimension(null)}
                  className={`p-3 rounded-lg border transition-all text-xs font-mono ${
                    selectedDimension === item.dimension
                      ? 'bg-[#18181B] border-cyan-500/80 shadow-md'
                      : 'bg-[#141415] border-[#262626] hover:border-[#3F3F46]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{item.dimension}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        item.status === 'compliant' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' :
                        item.status === 'warning' ? 'bg-amber-950 text-amber-400 border border-amber-800/60' :
                        'bg-rose-950 text-rose-400 border border-rose-800/60'
                      }`}>
                        {item.status === 'compliant' ? 'WITHIN APPETITE' : item.status === 'warning' ? 'TOLERANCE WATCH' : 'THRESHOLD BREACH'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <span className="text-[10px] text-[#71717A] block">Transfer Risk:</span>
                        <span className="font-bold text-rose-400">{item.currentRisk}<span className="text-[9px] text-[#71717A]">/100</span></span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#71717A] block">Limit:</span>
                        <span className="font-bold text-cyan-400">{item.appetiteThreshold}<span className="text-[9px] text-[#71717A]">/100</span></span>
                      </div>
                      <div className="min-w-[65px]">
                        <span className="text-[10px] text-[#71717A] block">Variance:</span>
                        <span className={`font-bold ${isBreached ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {isBreached ? `+${variance}` : `${variance}`} pts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar Comparing Risk vs Threshold */}
                  <div className="relative w-full h-1.5 bg-[#1F1F21] rounded-full overflow-hidden my-2">
                    {/* Risk Bar */}
                    <div
                      className={`h-full rounded-full transition-all ${
                        isBreached ? 'bg-rose-500' : item.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, item.currentRisk)}%` }}
                    />
                  </div>

                  {/* Key Safeguard Note */}
                  <div className="flex items-center justify-between text-[10px] text-[#71717A] font-sans pt-1 border-t border-[#1F1F21]">
                    <span className="truncate max-w-[280px]">
                      <strong className="text-[#A1A1AA] font-mono">Control:</strong> {item.keySafeguard}
                    </span>
                    <span className="text-emerald-400 font-mono text-[9px]">
                      {item.mitigationStrength}% Mitigation
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Callout if breaches exist */}
          {summaryStats.breaches > 0 && (
            <div className="p-2.5 rounded bg-rose-950/30 border border-rose-800/40 text-[11px] font-mono text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Board Risk Tolerance Action Required:</span>
                Enforce additional 3-Pillar Supplementary Measures or obtain Formal Senior Management Function (SMF24/DPO) Risk Acceptance sign-off.
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
