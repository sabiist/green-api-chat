import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

import { loadJson, removeKey, saveJson } from '@/lib/storage';

export function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => loadJson<T>(key, fallback));

  useEffect(() => {
    if (value === null || value === undefined) {
      removeKey(key);
    } else {
      saveJson(key, value);
    }
  }, [key, value]);

  return [value, setValue] as [T, Dispatch<SetStateAction<T>>];
}
