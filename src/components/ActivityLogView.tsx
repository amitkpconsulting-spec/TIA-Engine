import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar, 
  User, 
  ShieldCheck, 
  Lock, 
  Clock, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  ArrowRight,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import { ActivityLogEntry, getActivityLogs, exportActivityLogCsv } from '../utils/activityLogger';

interface ActivityLogViewProps {
  onNavigateHome?: () => void;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({ onNavigateHome }) => {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | '7_DAYS' | '30_DAYS'>('ALL');

  const refreshLogs = () => {
    setLogs(getActivityLogs());
  };

  useEffect(() => {
    refreshLogs();
    const handleUpdate = () => refreshLogs();
    window.addEventListener('tia_activity_log_updated', handleUpdate);
    return () => window.removeEventListener('tia_activity_log_updated', handleUpdate);
  }, []);

  // Unique users for filtering
  const uniqueUsers = useMemo(() => {
    const set = new Set<string>();
    logs.forEach(l => {
      if (l.userName) set.add(l.userName);
    });
    return Array.from(set);
  }, [logs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    const now = Date.now();
    return logs.filter(log => {
      // 1. Search Query
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || 
        log.actionTaken.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.userRole.toLowerCase().includes(q) ||
        log.targetEntity.toLowerCase().includes(q) ||
        log.statusChange.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // 2. User Filter
      if (selectedUser !== 'ALL' && log.userName !== selectedUser) {
        return false;
      }

      // 3. Severity Filter
      if (selectedSeverity !== 'ALL' && log.severity.toUpperCase() !== selectedSeverity) {
        return false;
      }

      // 4. Date Filter
      if (dateFilter !== 'ALL') {
        const logTime = new Date(log.timestamp).getTime();
        const diffMs = now - logTime;
        if (dateFilter === 'TODAY' && diffMs > 86400000) return false;
        if (dateFilter === '7_DAYS' && diffMs > 7 * 86400000) return false;
        if (dateFilter === '30_DAYS' && diffMs > 30 * 86400000) return false;
      }

      return true;
    });
  }, [logs, searchQuery, selectedUser, selectedSeverity, dateFilter]);

  const renderSeverityBadge = (severity: 'Critical' | 'Warning' | 'Compliant') => {
    switch (severity) {
      case 'Critical':
        return (
          <span 
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider"
            style={{ color: '#F87171', backgroundColor: '#450A0A', border: '1px solid #EF4444' }}
          >
            <XCircle className="w-2.5 h-2.5" /> CRITICAL
          </span>
        );
      case 'Warning':
        return (
          <span 
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider"
            style={{ color: '#FBBF24', backgroundColor: '#451A03', border: '1px solid #F59E0B' }}
          >
            <AlertTriangle className="w-2.5 h-2.5" /> WARNING
          </span>
        );
      case 'Compliant':
        return (
          <span 
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider"
            style={{ color: '#34D399', backgroundColor: '#064E3B', border: '1px solid #10B981' }}
          >
            <CheckCircle2 className="w-2.5 h-2.5" /> COMPLIANT
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 w-full mx-auto pb-12 font-sans text-[#D1D5DB]">
      {/* Header Banner */}
      <div className="bg-[#0F0F10] rounded-xl border border-[#262626] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262626] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-[#1A1A1B] px-2 py-0.5 rounded border border-[#262626]">
                SECTION_11 • AUDIT TRAIL
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                <Lock className="w-2.5 h-2.5 text-emerald-400" /> IMMUTABLE RECORD
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight font-mono">
              Transparent Activity & Regulatory Change Log
            </h1>
            <p className="text-xs text-[#71717A] mt-1 font-mono">
              Chronological, non-repudiable audit trail recording who modified settings, executed bulk remediations, or dismissed alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportActivityLogCsv(filteredLogs)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold text-black bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              title="Download Activity Log as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Log (.CSV)</span>
            </button>
          </div>
        </div>

        {/* Immutability Banner (Acceptance Criteria: Entries cannot be edited or deleted by any user) */}
        <div className="mt-4 bg-[#141415] border border-emerald-900/40 rounded-xl p-3.5 flex items-start gap-3">
          <Shield className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <div className="text-xs text-[#A1A1AA] leading-relaxed font-mono">
            <span className="text-white font-bold">Immutability Guarantee:</span> Entries in this Activity Log are permanently sealed with deterministic SHA-256 state hashes. To maintain compliance with PRA SS2/21 Chapter 8 and GDPR Article 30 accountability standards, entries cannot be modified or purged by any user or administrator.
          </div>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#0A0A0B] p-3 rounded-xl border border-[#1F1F22]">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search action or entity..."
              className="w-full bg-[#141415] border border-[#262626] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#52525B] focus:border-emerald-500 focus:outline-none font-mono"
            />
          </div>

          {/* User Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-[#71717A] shrink-0">User:</span>
            <select
              aria-label="Filter by user"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full bg-[#141415] border border-[#262626] rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono cursor-pointer"
            >
              <option value="ALL">All Users ({uniqueUsers.length})</option>
              {uniqueUsers.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* Severity Level Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-[#71717A] shrink-0">Severity:</span>
            <select
              aria-label="Filter by severity"
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full bg-[#141415] border border-[#262626] rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical (Red)</option>
              <option value="WARNING">Warning (Yellow)</option>
              <option value="COMPLIANT">Compliant (Green)</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-[#71717A] shrink-0">Timeframe:</span>
            <select
              aria-label="Filter by timeframe"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full bg-[#141415] border border-[#262626] rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono cursor-pointer"
            >
              <option value="ALL">All Recorded Time</option>
              <option value="TODAY">Today (Past 24h)</option>
              <option value="7_DAYS">Last 7 Days</option>
              <option value="30_DAYS">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Log Table */}
      <div className="bg-[#0F0F10] rounded-xl border border-[#262626] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#080809] text-[#71717A] font-mono text-[10px] uppercase tracking-wider border-b border-[#262626]">
              <tr>
                <th className="py-3 px-4 w-44">Date / Time (UTC)</th>
                <th className="py-3 px-4 w-52">User & Role</th>
                <th className="py-3 px-4">Action Taken</th>
                <th className="py-3 px-4 w-60">Status Change</th>
                <th className="py-3 px-4 w-32 text-center">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F21] text-[#D1D5DB] font-mono">
              {filteredLogs.map((log) => {
                const dateObj = new Date(log.timestamp);
                const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                const formattedTime = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                return (
                  <tr key={log.id} className="hover:bg-[#151516] transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-4 text-[#A1A1AA] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#52525B]" />
                        <span>{formattedDate} {formattedTime}</span>
                      </div>
                    </td>

                    {/* User Name & Role */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{log.userName}</div>
                      <div className="text-[10px] text-[#71717A] truncate" title={log.userRole}>{log.userRole}</div>
                    </td>

                    {/* Action Taken & Target Entity */}
                    <td className="py-3 px-4">
                      <div className="text-white font-medium">{log.actionTaken}</div>
                      {log.targetEntity && (
                        <div className="text-[11px] text-[#71717A] truncate mt-0.5 font-sans" title={log.targetEntity}>
                          Target: <span className="text-[#A1A1AA]">{log.targetEntity}</span>
                        </div>
                      )}
                    </td>

                    {/* Status Change */}
                    <td className="py-3 px-4">
                      <div className="text-xs text-emerald-400 font-medium">{log.statusChange}</div>
                    </td>

                    {/* Severity Badge */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {renderSeverityBadge(log.severity)}
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#71717A] font-mono text-xs">
                    No activity log records match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-3 border-t border-[#262626] bg-[#141415] flex items-center justify-between text-xs text-[#71717A] font-mono">
          <span>Showing {filteredLogs.length} of {logs.length} logged entries</span>
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-400" /> Tamper-Evident Trail Active
          </span>
        </div>
      </div>
    </div>
  );
};
