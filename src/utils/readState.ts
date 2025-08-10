export const READ_IDS_KEY = "bb_email_read_ids_v1";

export function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_IDS_KEY);
    if (!raw) return new Set();
    const arr: string[] = JSON.parse(raw);
    return new Set(arr);
  } catch {
    return new Set();
  }
}

export function addReadId(id: string) {
  try {
    const set = getReadIds();
    set.add(id);
    localStorage.setItem(READ_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export function removeReadId(id: string) {
  try {
    const set = getReadIds();
    set.delete(id);
    localStorage.setItem(READ_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}
