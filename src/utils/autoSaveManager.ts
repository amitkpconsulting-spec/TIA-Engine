import { TransferProfile } from '../types/tia';

export const AUTOSAVE_STORAGE_KEY = 'sovereign_tia_autosave_profile_v1';
export const AUTOSAVE_META_KEY = 'sovereign_tia_autosave_meta_v1';
export const SAVED_LIBRARY_STORAGE_KEY = 'sovereign_tia_saved_library_v1';

export interface AutoSaveMetadata {
  lastSaved: string;
  profileId: string;
  tiaReferenceId?: string;
  profileTitle: string;
  activeStep?: number;
  importerCountry?: string;
  version: string;
}

export interface StoredDraftBundle {
  profile: TransferProfile;
  metadata: AutoSaveMetadata;
}

export interface SavedLibraryEntry {
  id: string;
  savedAt: string;
  profile: TransferProfile;
  tag?: string;
  notes?: string;
}

/**
 * Persists the current TransferProfile and wizard step into LocalStorage.
 */
export function saveDraftToStorage(
  profile: TransferProfile,
  activeStep?: number
): { success: boolean; error?: string; timestamp: string } {
  const timestamp = new Date().toISOString();
  try {
    const metadata: AutoSaveMetadata = {
      lastSaved: timestamp,
      profileId: profile.id,
      tiaReferenceId: profile.tiaReferenceId,
      profileTitle: profile.title || 'Untitled TIA Assessment',
      activeStep: activeStep || 1,
      importerCountry: profile.importerCountry,
      version: '4.2',
    };

    localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(profile));
    localStorage.setItem(AUTOSAVE_META_KEY, JSON.stringify(metadata));
    return { success: true, timestamp };
  } catch (err) {
    console.warn('[AutoSave] Failed to write to local storage:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown LocalStorage error',
      timestamp 
    };
  }
}

/**
 * Loads the auto-saved draft if one exists in LocalStorage.
 */
export function loadDraftFromStorage(): StoredDraftBundle | null {
  try {
    const rawProfile = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
    const rawMeta = localStorage.getItem(AUTOSAVE_META_KEY);

    if (!rawProfile) return null;

    const profile: TransferProfile = JSON.parse(rawProfile);
    const metadata: AutoSaveMetadata = rawMeta
      ? JSON.parse(rawMeta)
      : {
          lastSaved: new Date().toISOString(),
          profileId: profile.id,
          tiaReferenceId: profile.tiaReferenceId,
          profileTitle: profile.title,
          activeStep: 1,
          version: '4.2',
        };

    return { profile, metadata };
  } catch (err) {
    console.warn('[AutoSave] Failed to load draft from storage:', err);
    return null;
  }
}

/**
 * Checks if a valid draft exists in LocalStorage.
 */
export function hasAutoSavedDraft(): boolean {
  try {
    return !!localStorage.getItem(AUTOSAVE_STORAGE_KEY);
  } catch {
    return false;
  }
}

/**
 * Removes the auto-saved draft from LocalStorage.
 */
export function clearDraftFromStorage(): void {
  try {
    localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
    localStorage.removeItem(AUTOSAVE_META_KEY);
  } catch (err) {
    console.warn('[AutoSave] Failed to clear storage draft:', err);
  }
}

/**
 * Retrieves all saved custom profiles from the LocalStorage library.
 */
export function getSavedProfilesFromLibrary(): SavedLibraryEntry[] {
  try {
    const raw = localStorage.getItem(SAVED_LIBRARY_STORAGE_KEY);
    if (!raw) return [];
    const parsed: SavedLibraryEntry[] = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[LocalStorage Library] Failed to load library:', err);
    return [];
  }
}

/**
 * Saves or updates a profile in the LocalStorage library.
 */
export function saveProfileToLibrary(
  profile: TransferProfile,
  tag: string = 'User Saved Profile',
  notes?: string
): { success: boolean; entry: SavedLibraryEntry; error?: string } {
  try {
    const library = getSavedProfilesFromLibrary();
    const existingIndex = library.findIndex(item => item.profile.id === profile.id);
    
    const entry: SavedLibraryEntry = {
      id: profile.id,
      savedAt: new Date().toISOString(),
      profile: { ...profile },
      tag,
      notes
    };

    if (existingIndex >= 0) {
      library[existingIndex] = entry;
    } else {
      library.unshift(entry);
    }

    localStorage.setItem(SAVED_LIBRARY_STORAGE_KEY, JSON.stringify(library));
    return { success: true, entry };
  } catch (err) {
    console.warn('[LocalStorage Library] Failed to save profile to library:', err);
    return { 
      success: false, 
      entry: { id: profile.id, savedAt: new Date().toISOString(), profile, tag }, 
      error: err instanceof Error ? err.message : 'Unknown LocalStorage error' 
    };
  }
}

/**
 * Removes a profile from the LocalStorage library by ID.
 */
export function deleteProfileFromLibrary(profileId: string): boolean {
  try {
    const library = getSavedProfilesFromLibrary();
    const filtered = library.filter(item => item.profile.id !== profileId);
    localStorage.setItem(SAVED_LIBRARY_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.warn('[LocalStorage Library] Failed to delete profile:', err);
    return false;
  }
}

export interface AvailableStorageProfileOption {
  key: string;
  sourceType: 'active' | 'draft' | 'library' | 'casestudy' | 'uploaded';
  label: string;
  subLabel: string;
  profile: TransferProfile;
  lastUpdated?: string;
  badge: string;
}

/**
 * Aggregates all available profiles from LocalStorage (draft + library).
 */
export function getAllLocalStorageProfiles(): AvailableStorageProfileOption[] {
  const options: AvailableStorageProfileOption[] = [];

  // 1. Auto-saved draft
  const draftBundle = loadDraftFromStorage();
  if (draftBundle && draftBundle.profile) {
    options.push({
      key: 'ls_draft',
      sourceType: 'draft',
      label: `[Draft] ${draftBundle.profile.title || 'Auto-Saved Session'}`,
      subLabel: `Step ${draftBundle.metadata.activeStep || 1} • Saved ${formatTimeAgo(draftBundle.metadata.lastSaved)} • Ref: ${draftBundle.profile.tiaReferenceId || 'DRAFT'}`,
      profile: draftBundle.profile,
      lastUpdated: draftBundle.metadata.lastSaved,
      badge: 'LocalStorage Draft'
    });
  }

  // 2. Saved Library Profiles
  const library = getSavedProfilesFromLibrary();
  library.forEach((entry, idx) => {
    options.push({
      key: `ls_lib_${entry.id || idx}`,
      sourceType: 'library',
      label: `[Library] ${entry.profile.title || 'Saved TIA Profile'}`,
      subLabel: `${entry.tag || 'Saved'} • Saved ${formatTimeAgo(entry.savedAt)} • Ref: ${entry.profile.tiaReferenceId || entry.profile.id}`,
      profile: entry.profile,
      lastUpdated: entry.savedAt,
      badge: 'Local Library'
    });
  }
  );

  return options;
}

/**
 * Human-friendly relative time formatter.
 */
export function formatTimeAgo(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSecs < 5) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Recently';
  }
}
