import { useState, useEffect, useRef } from "react";

export function usePersistentState<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(initialValue);
  const isLoaded = useRef(false);

  // Load from localStorage on client mount (SSR-safe)
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const item = window.localStorage.getItem(key);
        if (item !== null) {
          const parsed = JSON.parse(item);
          setState(parsed);
        }
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    isLoaded.current = true;
  }, [key]);

  // Persist to localStorage on state change (only after initial load has finished)
  useEffect(() => {
    if (!isLoaded.current) return;
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(state));
      }
    } catch (error) {
      console.warn(`Error saving to localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}
