export function saveData(key: string, value: any): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadData<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}
