export interface Participant {
  id: string;
  name: string;
  college: string;
  teamId?: string;
  registeredAt: string;
}

const PARTICIPANT_KEY = 'ptl_participant_v1';
const SOUND_KEY = 'ptl_sound_enabled';

export function getStoredParticipant(): Participant | null {
  try {
    const raw = localStorage.getItem(PARTICIPANT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveParticipant(p: Participant): void {
  try {
    localStorage.setItem(PARTICIPANT_KEY, JSON.stringify(p));
  } catch (e) {
    console.error('Failed to store participant in localStorage', e);
  }
}

export function clearParticipant(): void {
  try {
    localStorage.removeItem(PARTICIPANT_KEY);
  } catch {}
}

export function getSoundPreference(): boolean {
  try {
    const val = localStorage.getItem(SOUND_KEY);
    return val !== 'false';
  } catch {
    return true;
  }
}

export function setSoundPreference(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_KEY, String(enabled));
  } catch {}
}
