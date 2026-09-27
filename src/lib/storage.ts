const prefix = 'green-api-chat:';

export function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(prefix + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(prefix + key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in private mode; app still works in memory.
  }
}

export function removeKey(key: string) {
  try {
    window.localStorage.removeItem(prefix + key);
  } catch {
    // noop
  }
}
