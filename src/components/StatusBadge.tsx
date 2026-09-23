import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export type ComplianceSeverity = 'Critical' | 'Warning' | 'Compliant' | 'High' | 'Medium' | 'Low';

interface StatusBadgeProps {
  status: ComplianceSeverity | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'sm',
  className = '' 
}) => {
  const normalized = status.toUpperCase();

  const isCritical = normalized === 'CRITICAL' || normalized === 'HIGH' || normalized === 'PROHIBITED';
  const isWarning = normalized === 'WARNING' || normalized === 'MEDIUM' || normalized === 'CONDITIONAL';
  const isCompliant = normalized === 'COMPLIANT' || normalized === 'LOW' || normalized === 'APPROVED' || normalized === 'VALIDATED';

  if (isCritical) {
    return (
      <span 
        className={`inline-flex items-center gap-1.5 rounded font-mono font-bold uppercase tracking-wider ${
          size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
        } ${className}`}
        style={{ 
          color: '#F87171', 
          backgroundColor: '#450A0A', 
          border: '1px solid #EF4444',
          boxShadow: '0 0 8px rgba(239, 68, 68, 0.25)'
        }}
      >
        <XCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} style={{ color: '#F87171' }} />
        <span>CRITICAL</span>
      </span>
    );
  }

  if (isWarning) {
    return (
      <span 
        className={`inline-flex items-center gap-1.5 rounded font-mono font-bold uppercase tracking-wider ${
          size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
        } ${className}`}
        style={{ 
          color: '#FBBF24', 
          backgroundColor: '#451A03', 
          border: '1px solid #F59E0B',
          boxShadow: '0 0 8px rgba(245, 158, 11, 0.2)'
        }}
      >
        <AlertTriangle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} style={{ color: '#FBBF24' }} />
        <span>WARNING</span>
      </span>
    );
  }

  return (
    <span 
      className={`inline-flex items-center gap-1.5 rounded font-mono font-bold uppercase tracking-wider ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
      } ${className}`}
      style={{ 
        color: '#34D399', 
        backgroundColor: '#064E3B', 
        border: '1px solid #10B981',
        boxShadow: '0 0 8px rgba(16, 185, 129, 0.25)'
      }}
    >
      <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} style={{ color: '#34D399' }} />
      <span>COMPLIANT</span>
    </span>
  );
};
