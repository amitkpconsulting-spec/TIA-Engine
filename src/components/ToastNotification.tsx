import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastNotificationProps {
  message: string | null;
  onDismiss: () => void;
  duration?: number;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  onDismiss,
  duration = 4500
}) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
      <div className="bg-[#0F1412] border border-emerald-500/80 rounded-xl px-4 py-3 shadow-[0_0_25px_rgba(16,185,129,0.35)] flex items-center gap-3 text-xs font-mono text-white max-w-md">
        <div className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex-1 font-medium leading-snug">
          {message}
        </div>
        <button
          onClick={onDismiss}
          className="text-[#71717A] hover:text-white p-1 rounded transition-colors cursor-pointer shrink-0"
          title="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
