import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface SavedReading {
  id: string;
  vendor: string;
  kwh: string;
  md: string;
  savedAt: string;
}

interface ReadingsContextType {
  readings: SavedReading[];
  saveReading: (vendor: string, kwh: string, md: string) => void;
  deleteReading: (id: string) => void;
}

const ReadingsContext = createContext<ReadingsContextType | null>(null);
const STORAGE_KEY = "desiboy_readings";

export function ReadingsProvider({ children }: { children: ReactNode }) {
  const [readings, setReadings] = useState<SavedReading[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setReadings(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const persist = (list: SavedReading[]) => {
    setReadings(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const saveReading = (vendor: string, kwh: string, md: string) => {
    const entry: SavedReading = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      vendor,
      kwh,
      md,
      savedAt: new Date().toISOString(),
    };
    persist([entry, ...readings]);
  };

  const deleteReading = (id: string) => {
    persist(readings.filter((r) => r.id !== id));
  };

  return (
    <ReadingsContext.Provider value={{ readings, saveReading, deleteReading }}>
      {children}
    </ReadingsContext.Provider>
  );
}

export function useReadings() {
  const ctx = useContext(ReadingsContext);
  if (!ctx) throw new Error("useReadings must be used inside ReadingsProvider");
  return ctx;
}
