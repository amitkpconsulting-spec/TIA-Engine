import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  FileCode, 
  Clock, 
  HardDrive,
  Eye,
  EyeOff,
  Sparkles,
  FileJson,
  Hash,
  Shield
} from 'lucide-react';
import { TransferProfile } from '../types/tia';
import { 
  createEncryptedSnapshot, 
  decryptSnapshot, 
  triggerBlobDownload,
  EncryptedSnapshotEnvelope
} from '../utils/cryptoSnapshot';

interface SnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TransferProfile;
  activeStep: number;
  onRestoreSnapshot: (restoredProfile: TransferProfile, step: number) => void;
}

export const SnapshotModal: React.FC<SnapshotModalProps> = ({
  isOpen,
  onClose,
  profile,
  activeStep,
  onRestoreSnapshot
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'restore'>('create');
  
  // Create snapshot state
  const [useCustomPassphrase, setUseCustomPassphrase] = useState<boolean>(false);
  const [passphrase, setPassphrase] = useState<string>('');
  const [confirmPassphrase, setConfirmPassphrase] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationSuccess, setGenerationSuccess] = useState<boolean>(false);
  const [lastGeneratedMeta, setLastGeneratedMeta] = useState<{ filename: string; sha: string } | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  // Restore snapshot state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [restorePassphrase, setRestorePassphrase] = useState<string>('');
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restorePreview, setRestorePreview] = useState<EncryptedSnapshotEnvelope | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadSnapshot = async () => {
    setCreateError(null);
    if (useCustomPassphrase) {
      if (!passphrase || passphrase.length < 6) {
        setCreateError('Master passphrase must be at least 6 characters.');
        return;
      }
      if (passphrase !== confirmPassphrase) {
        setCreateError('Passphrases do not match. Please re-enter.');
        return;
      }
    }

    try {
      setIsGenerating(true);
      const { blob, filename, envelope } = await createEncryptedSnapshot(
        profile,
        activeStep,
        useCustomPassphrase ? passphrase : undefined
      );

      triggerBlobDownload(blob, filename);
      setLastGeneratedMeta({
        filename,
        sha: envelope.integrity.sha256Digest
      });
      setGenerationSuccess(true);
      setTimeout(() => setGenerationSuccess(false), 5000);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Encryption failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRestoreError(null);
    setRestorePreview(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.format === 'SOVEREIGN_TIA_ENCRYPTED_SNAPSHOT_V1') {
          setRestorePreview(parsed);
        } else {
          setRestoreError('File is not a valid SovereignTIA encrypted snapshot.');
        }
      } catch {
        setRestoreError('Failed to read file as JSON snapshot.');
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = async () => {
    if (!uploadedFile) {
      setRestoreError('Please select a snapshot file to restore.');
      return;
    }

    setRestoreError(null);
    setIsRestoring(true);

    try {
      const text = await uploadedFile.text();
      const result = await decryptSnapshot(text, restorePassphrase);
      onRestoreSnapshot(result.profile, result.activeStep);
      onClose();
    } catch (err) {
      setRestoreError(err instanceof Error ? err.message : 'Decryption failed.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-mono">
      <div 
        className="bg-[#0D0D0E] border border-[#262626] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between bg-[#121214]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Cryptographic State Snapshot Backup</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  AES-GCM-256
                </span>
              </div>
              <p className="text-xs text-[#71717A] mt-0.5">
                Client-side encrypted blob download & disaster recovery for TIA profiles
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#71717A] hover:text-white p-1 rounded-lg hover:bg-[#262626] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#262626] bg-[#0A0A0B] text-xs font-semibold px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-2.5 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'create'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-[#71717A] hover:text-[#D1D5DB]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Create Encrypted Backup</span>
          </button>
          <button
            onClick={() => setActiveTab('restore')}
            className={`pb-2.5 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'restore'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-[#71717A] hover:text-[#D1D5DB]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Restore from Snapshot</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#D1D5DB]">
          {activeTab === 'create' ? (
            <>
              {/* Snapshot Target Profile Summary */}
              <div className="bg-[#141416] border border-[#262626] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#71717A] font-semibold text-[11px] uppercase tracking-wider">
                    Target Assessment State
                  </span>
                  <span className="text-emerald-400 text-[10px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 font-mono">
                    REF: {profile.tiaReferenceId || 'UNCOMMITTED'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-[#71717A]">Title:</span>{' '}
                    <strong className="text-white">{profile.title || 'Untitled Assessment'}</strong>
                  </div>
                  <div>
                    <span className="text-[#71717A]">Corridor:</span>{' '}
                    <strong className="text-white">
                      {profile.exporterCountry} → {profile.importerCountry} ({profile.transferMechanism})
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#71717A]">Active Step:</span>{' '}
                    <span className="text-cyan-300 font-semibold">Step {activeStep} of 6</span>
                  </div>
                  <div>
                    <span className="text-[#71717A]">Data Categories:</span>{' '}
                    <span className="text-[#D1D5DB]">{profile.dataCategories?.length || 0} categories mapped</span>
                  </div>
                </div>
              </div>

              {/* Encryption Method */}
              <div className="space-y-3">
                <label className="block text-[#A1A1AA] font-bold text-xs">
                  Encryption Key Architecture
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div 
                    onClick={() => setUseCustomPassphrase(false)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      !useCustomPassphrase 
                        ? 'bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
                        : 'bg-[#141416] border-[#262626] hover:border-[#3F3F46]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-white">System Sovereign Key</span>
                    </div>
                    <p className="text-[11px] text-[#71717A] mt-1.5 leading-relaxed">
                      Zero-friction 1-click snapshot. Encrypted via AES-256 with auto-restoration across SovereignTIA workspace instances.
                    </p>
                  </div>

                  <div 
                    onClick={() => setUseCustomPassphrase(true)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      useCustomPassphrase 
                        ? 'bg-cyan-950/30 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.15)]' 
                        : 'bg-[#141416] border-[#262626] hover:border-[#3F3F46]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-white">Custom Passphrase</span>
                    </div>
                    <p className="text-[11px] text-[#71717A] mt-1.5 leading-relaxed">
                      Bank-grade security. Protected with a private master passphrase via PBKDF2 (100,000 rounds) + AES-GCM.
                    </p>
                  </div>
                </div>
              </div>

              {/* Passphrase inputs if custom selected */}
              {useCustomPassphrase && (
                <div className="bg-[#121214] border border-[#262626] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400">Master Secret Passphrase</span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[#71717A] hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showPassword ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-[#71717A] mb-1">Passphrase (min 6 chars)</label>
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        value={passphrase}
                        onChange={e => setPassphrase(e.target.value)}
                        placeholder="Enter master key..."
                        className="w-full bg-[#0A0A0B] border border-[#262626] rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#71717A] mb-1">Confirm Passphrase</label>
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassphrase}
                        onChange={e => setConfirmPassphrase(e.target.value)}
                        placeholder="Re-enter master key..."
                        className="w-full bg-[#0A0A0B] border border-[#262626] rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-amber-400/80 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Make sure to record this passphrase securely. Without it, encrypted blobs cannot be recovered.</span>
                  </p>
                </div>
              )}

              {createError && (
                <div className="p-3 bg-rose-950/40 border border-rose-600/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              {generationSuccess && lastGeneratedMeta && (
                <div className="p-3.5 bg-emerald-950/50 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs space-y-1 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Snapshot Created & Downloaded Successfully!</span>
                  </div>
                  <div className="text-[11px] text-emerald-400/90 font-mono break-all">
                    File: <span className="text-white">{lastGeneratedMeta.filename}</span>
                  </div>
                  <div className="text-[10px] text-emerald-500/80 font-mono break-all">
                    SHA-256 Digest: {lastGeneratedMeta.sha}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* RESTORE TAB */
            <div className="space-y-4">
              <div className="border-2 border-dashed border-[#262626] hover:border-cyan-500/50 rounded-xl p-6 text-center transition-colors bg-[#0A0A0B]">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept=".json,.tiasnap,.bin"
                  onChange={handleFileChange}
                  className="hidden" 
                />
                <HardDrive className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-semibold text-white">Select SovereignTIA Encrypted Snapshot File</p>
                <p className="text-[11px] text-[#71717A] mt-1 mb-3">Accepts .tiasnap.json, .json, or binary snapshot envelopes</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-[#1A1A1D] hover:bg-[#262629] text-cyan-300 border border-[#3F3F46] rounded-lg font-semibold text-xs cursor-pointer transition-colors"
                >
                  Browse Snapshot File...
                </button>
              </div>

              {uploadedFile && restorePreview && (
                <div className="bg-[#141416] border border-[#262626] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <FileJson className="w-4 h-4 text-emerald-400" />
                      {uploadedFile.name}
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      FORMAT VALID
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#A1A1AA]">
                    <div>Snapshot Title: <strong className="text-white">{restorePreview.profileTitle}</strong></div>
                    <div>Ref ID: <strong className="text-white">{restorePreview.tiaReferenceId || 'N/A'}</strong></div>
                    <div>Timestamp: <span className="text-[#D1D5DB]">{new Date(restorePreview.timestamp).toLocaleString()}</span></div>
                    <div>Key Type: <span className={restorePreview.encryption.isCustomPassphrase ? 'text-cyan-400 font-bold' : 'text-emerald-400'}>{restorePreview.encryption.isCustomPassphrase ? 'Custom Passphrase' : 'System Key'}</span></div>
                  </div>

                  {restorePreview.encryption.isCustomPassphrase && (
                    <div className="pt-2 border-t border-[#262626]">
                      <label className="block text-[11px] text-cyan-300 font-bold mb-1">
                        Enter Passphrase used during snapshot creation:
                      </label>
                      <input 
                        type="password"
                        value={restorePassphrase}
                        onChange={e => setRestorePassphrase(e.target.value)}
                        placeholder="Enter master key..."
                        className="w-full bg-[#0A0A0B] border border-[#262626] rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-hidden"
                      />
                    </div>
                  )}
                </div>
              )}

              {restoreError && (
                <div className="p-3 bg-rose-950/40 border border-rose-600/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{restoreError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-[#262626] bg-[#121214] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-[#71717A]">
            <Hash className="w-3.5 h-3.5 text-emerald-400" />
            <span>SHA-256 Tamper Evident Verification Enabled</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#71717A] hover:text-white rounded-lg hover:bg-[#1F1F21] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {activeTab === 'create' ? (
              <button
                type="button"
                onClick={handleDownloadSnapshot}
                disabled={isGenerating}
                className="px-5 py-2 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isGenerating ? 'Encrypting & Packaging...' : 'Download Encrypted Snapshot'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleExecuteRestore}
                disabled={!uploadedFile || isRestoring}
                className="px-5 py-2 text-xs font-bold text-cyan-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isRestoring ? 'Decrypting & Loading...' : 'Decrypt & Restore Assessment'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
