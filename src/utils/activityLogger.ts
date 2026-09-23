export interface ActivityLogEntry {
  id: string;
  timestamp: string; // ISO string
  userName: string;
  userRole: string;
  actionTaken: string;
  targetEntity: string;
  statusChange: string;
  severity: 'Critical' | 'Warning' | 'Compliant';
}

export const ACTIVITY_LOG_STORAGE_KEY = 'sovereign_tia_activity_log_v1';

const INITIAL_LOG_ENTRIES: ActivityLogEntry[] = [
  {
    id: 'log-init-001',
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
    userName: 'David Vance',
    userRole: 'SMF24 — Chief Operations',
    actionTaken: 'Initiated Cross-Border Transfer Assessment (Schrems II & PRA SS2/21)',
    targetEntity: 'Apex Cloud Banking Corp (Delaware, USA)',
    statusChange: 'Assessment Created (Baseline Scoping)',
    severity: 'Warning'
  },
  {
    id: 'log-init-002',
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    userName: 'Sarah Jenkins',
    userRole: 'Data Protection Officer (DPO)',
    actionTaken: 'Completed EDPB 02/2020 Essential Guarantees Screening',
    targetEntity: 'United States (FISA 702 & EO 14086 Review)',
    statusChange: 'Severity Flagged: Critical Surveillance Risk',
    severity: 'Critical'
  },
  {
    id: 'log-init-003',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    userName: 'Marcus Aurelius Vance',
    userRole: 'Chief Information Security Officer (CISO)',
    actionTaken: 'Mandated On-Soil BYOK Local HSM Cryptographic Isolation',
    targetEntity: 'Hardware Security Module (HSM) BYOK Key Custody',
    statusChange: 'Changed from Red to Green (Technical Shield Active)',
    severity: 'Compliant'
  },
  {
    id: 'log-init-004',
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
    userName: 'Compliance Team',
    userRole: 'Lead Regulatory Auditor',
    actionTaken: 'Verified S165A/S166 PRA Direct Inspection & Audit Rights Clauses',
    targetEntity: 'Master Outsourcing Services Agreement Schedule 4',
    statusChange: 'Changed from Warning to Green (Compliant)',
    severity: 'Compliant'
  }
];

export function getActivityLogs(): ActivityLogEntry[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_LOG_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ACTIVITY_LOG_STORAGE_KEY, JSON.stringify(INITIAL_LOG_ENTRIES));
      return INITIAL_LOG_ENTRIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_LOG_ENTRIES;
  } catch (e) {
    console.warn('Failed to parse activity logs from localStorage:', e);
    return INITIAL_LOG_ENTRIES;
  }
}

export function addActivityLog(entry: Omit<ActivityLogEntry, 'id' | 'timestamp'> & { timestamp?: string }): ActivityLogEntry {
  const current = getActivityLogs();
  const newEntry: ActivityLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: entry.timestamp || new Date().toISOString(),
    userName: entry.userName,
    userRole: entry.userRole,
    actionTaken: entry.actionTaken,
    targetEntity: entry.targetEntity,
    statusChange: entry.statusChange,
    severity: entry.severity
  };

  const updated = [newEntry, ...current];
  try {
    localStorage.setItem(ACTIVITY_LOG_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to persist activity log to localStorage:', e);
  }

  // Dispatch custom event so reactive components can update immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tia_activity_log_updated', { detail: newEntry }));
  }

  return newEntry;
}

export function exportActivityLogCsv(logs: ActivityLogEntry[]): void {
  const headers = ['Timestamp', 'User Name', 'Role', 'Action Taken', 'Target Entity', 'Status Change', 'Severity Level'];
  const rows = logs.map(l => [
    `"${l.timestamp}"`,
    `"${l.userName.replace(/"/g, '""')}"`,
    `"${l.userRole.replace(/"/g, '""')}"`,
    `"${l.actionTaken.replace(/"/g, '""')}"`,
    `"${l.targetEntity.replace(/"/g, '""')}"`,
    `"${l.statusChange.replace(/"/g, '""')}"`,
    `"${l.severity}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `TIA_Activity_Log_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
