import React from 'react';
import { 
  Globe2, 
  Search, 
  Filter, 
  Scale, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  ExternalLink,
  Lock,
  Building,
  KeyRound
} from 'lucide-react';
import { JURISDICTIONS } from '../data/jurisdictions';
import { JurisdictionIntelligence } from '../types/tia';

export const JurisdictionLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterRisk, setFilterRisk] = React.useState<string>('all');
  const [selectedCountryKey, setSelectedCountryKey] = React.useState<string>('United States');

  const countries = Object.values(JURISDICTIONS);

  const filteredCountries = countries.filter((c) => {
    const matchesSearch = c.countryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.dataProtectionLaw.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'all' || c.overallSurveillanceRisk.toLowerCase() === filterRisk.toLowerCase();
    return matchesSearch && matchesRisk;
  });

  const selectedCountry = JURISDICTIONS[selectedCountryKey] || countries[0];

  return (
    <div className="space-y-6 w-full mx-auto pb-12">
      {/* Header */}
      <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262626] pb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2 font-mono uppercase">
              <Globe2 className="w-4 h-4 text-emerald-400" />
              Global Third-Country Surveillance & Legal Intelligence Library
            </h2>
            <p className="text-xs text-[#71717A] mt-1 font-mono">
              Comparative analysis of surveillance statutes, judicial redress mechanisms, and EDPB 02/2020 Essential Safeguards across 30+ jurisdictions.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search country or statute..."
                className="pl-8 pr-3 py-1.5 text-xs rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] focus:border-emerald-500 focus:outline-hidden w-48 sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Risk Filter */}
            <select
              aria-label="Filter by surveillance risk"
              className="text-xs py-1.5 px-2.5 rounded border border-[#262626] bg-[#080809] text-[#D1D5DB] font-mono focus:border-emerald-500 focus:outline-hidden"
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
            >
              <option value="all">All Risk Levels</option>
              <option value="critical">Critical Surveillance Risk</option>
              <option value="high">High Surveillance Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk / Adequate</option>
            </select>
          </div>
        </div>

        {/* Quick Country Selector Badges */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar py-1 font-mono">
          {filteredCountries.map((c) => (
            <button
              key={c.countryName}
              onClick={() => setSelectedCountryKey(c.countryName)}
              className={`px-3 py-1.5 rounded text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCountryKey === c.countryName
                  ? 'bg-[#1F1F21] text-emerald-400 font-bold border border-emerald-500/40 shadow-xs'
                  : 'bg-[#141415] text-[#71717A] hover:text-[#D1D5DB] border border-[#262626]'
              }`}
            >
              <span>{c.flagEmoji}</span>
              <span>{c.countryName}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                c.overallSurveillanceRisk === 'Critical' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                c.overallSurveillanceRisk === 'High' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}>
                {c.overallSurveillanceRisk}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Country Deep Dive */}
      <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262626] pb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{selectedCountry.flagEmoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono uppercase">{selectedCountry.countryName}</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#141415] text-cyan-400 border border-cyan-800/60">
                  {selectedCountry.countryCode}
                </span>
              </div>
              <p className="text-xs text-[#71717A] mt-1 font-mono">
                Primary Privacy Legislation: <strong className="text-[#D1D5DB]">{selectedCountry.dataProtectionLaw}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <div className="text-right">
              <span className="text-[10px] text-[#71717A] uppercase block">Adequacy Status</span>
              <span className="text-xs font-bold text-white uppercase">
                {selectedCountry.adequacyStatus.replace(/_/g, ' ')}
              </span>
            </div>
            <div className={`px-3 py-1 rounded border font-bold text-xs ${
              selectedCountry.overallSurveillanceRisk === 'Critical' ? 'bg-rose-950 border-rose-800 text-rose-400' :
              selectedCountry.overallSurveillanceRisk === 'High' ? 'bg-amber-950 border-amber-800 text-amber-400' :
              selectedCountry.overallSurveillanceRisk === 'Medium' ? 'bg-blue-950 border-blue-800 text-blue-400' :
              'bg-emerald-950 border-emerald-800 text-emerald-400'
            }`}>
              {selectedCountry.overallSurveillanceRisk.toUpperCase()} SURVEILLANCE RISK
            </div>
          </div>
        </div>

        {/* Adequacy & Legal Rationale */}
        <div className="bg-[#141415] p-4 rounded border border-[#262626]">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] mb-1 font-mono">
            Adequacy & Regulatory Assessment
          </h4>
          <p className="text-xs text-[#D1D5DB] leading-relaxed font-sans">
            {selectedCountry.adequacyDetails}
          </p>
          <div className="mt-3 pt-3 border-t border-[#262626] text-xs text-[#71717A] font-mono">
            <strong className="text-white">Supervisory Authority (DPA):</strong> {selectedCountry.dpaName} ({selectedCountry.hasIndependentDPA ? 'Independent Authority' : 'Executive/Sectoral Agency'})
          </div>
        </div>

        {/* Surveillance Statutes */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#71717A] mb-3 flex items-center gap-1.5 font-mono">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Statutory Public Authority Surveillance & Law Enforcement Powers
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedCountry.surveillanceLaws.map((law, index) => (
              <div key={index} className="p-4 rounded border border-[#262626] bg-[#141415] flex flex-col justify-between font-mono">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">{law.statuteName}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      law.bulkCollectionRisk === 'Critical' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                      law.bulkCollectionRisk === 'High' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-blue-950 text-blue-400 border border-blue-800'
                    }`}>
                      {law.bulkCollectionRisk} Bulk Risk
                    </span>
                  </div>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed mt-1.5 font-sans">
                    {law.scopeAndPowers}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#262626] flex gap-4 text-[10px] text-[#71717A]">
                  <span>Extraterritorial: <strong className="text-white">{law.extraterritorialReach ? 'Yes' : 'No'}</strong></span>
                  <span>CSPs Scope: <strong className="text-white">{law.appliesToCloudProviders ? 'Direct' : 'No'}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EDPB 02/2020 European Essential Safeguards Matrix */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#71717A] mb-3 flex items-center gap-1.5 font-mono">
            <Scale className="w-4 h-4 text-emerald-400" />
            EDPB Recommendations 02/2020: European Essential Guarantees Benchmark
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded border font-mono ${selectedCountry.guarantees.clearPreciseRules ? 'bg-[#0D2015] border-emerald-900/60' : 'bg-[#200D0D] border-rose-900/60'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white uppercase">Guarantee A</span>
                {selectedCountry.guarantees.clearPreciseRules ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
              </div>
              <div className="text-xs font-semibold text-[#D1D5DB] mt-1">Clear & Accessible Rules</div>
              <p className="text-[10px] text-[#A1A1AA] mt-2 leading-relaxed font-sans">{selectedCountry.guarantees.clearPreciseRulesNotes}</p>
            </div>

            <div className={`p-4 rounded border font-mono ${selectedCountry.guarantees.necessaryAndProportionate ? 'bg-[#0D2015] border-emerald-900/60' : 'bg-[#200D0D] border-rose-900/60'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white uppercase">Guarantee B</span>
                {selectedCountry.guarantees.necessaryAndProportionate ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
              </div>
              <div className="text-xs font-semibold text-[#D1D5DB] mt-1">Proportionate & Necessary</div>
              <p className="text-[10px] text-[#A1A1AA] mt-2 leading-relaxed font-sans">{selectedCountry.guarantees.necessaryAndProportionateNotes}</p>
            </div>

            <div className={`p-4 rounded border font-mono ${selectedCountry.guarantees.independentOversight ? 'bg-[#0D2015] border-emerald-900/60' : 'bg-[#200D0D] border-rose-900/60'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white uppercase">Guarantee C</span>
                {selectedCountry.guarantees.independentOversight ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
              </div>
              <div className="text-xs font-semibold text-[#D1D5DB] mt-1">Independent Oversight</div>
              <p className="text-[10px] text-[#A1A1AA] mt-2 leading-relaxed font-sans">{selectedCountry.guarantees.independentOversightNotes}</p>
            </div>

            <div className={`p-4 rounded border font-mono ${selectedCountry.guarantees.effectiveRedressForForeigners ? 'bg-[#0D2015] border-emerald-900/60' : 'bg-[#200D0D] border-rose-900/60'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white uppercase">Guarantee D</span>
                {selectedCountry.guarantees.effectiveRedressForForeigners ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
              </div>
              <div className="text-xs font-semibold text-[#D1D5DB] mt-1">Effective Judicial Redress</div>
              <p className="text-[10px] text-[#A1A1AA] mt-2 leading-relaxed font-sans">{selectedCountry.guarantees.effectiveRedressNotes}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
