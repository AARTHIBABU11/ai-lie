export interface Participant {
  id: string;
  name: string;
  college: string;
  teamId?: string;
  registeredAt: string;
  eventId?: string;
}

export const CURRENT_EVENT_ID = 'ai_lie_symposium_2026';
const PARTICIPANT_KEY = `ptl_participant_${CURRENT_EVENT_ID}`;
const SOUND_KEY = 'ptl_sound_enabled';

export function getStoredParticipant(): Participant | null {
  try {
    // Proactively clear any legacy test participants from earlier versions
    if (typeof localStorage !== 'undefined' && localStorage.getItem('ptl_participant_v1')) {
      localStorage.removeItem('ptl_participant_v1');
    }
    const raw = localStorage.getItem(PARTICIPANT_KEY);
    if (!raw) return null;
    const parsed: Participant = JSON.parse(raw);
    if (parsed.eventId && parsed.eventId !== CURRENT_EVENT_ID) {
      localStorage.removeItem(PARTICIPANT_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveParticipant(p: Participant): void {
  try {
    const data: Participant = { ...p, eventId: CURRENT_EVENT_ID };
    localStorage.setItem(PARTICIPANT_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to store participant in localStorage', e);
  }
}

export function clearParticipant(): void {
  try {
    localStorage.removeItem(PARTICIPANT_KEY);
    if (typeof localStorage !== 'undefined' && localStorage.getItem('ptl_participant_v1')) {
      localStorage.removeItem('ptl_participant_v1');
    }
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
