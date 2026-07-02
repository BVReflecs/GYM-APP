import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PersonalRecord,
  Routine,
  UserProfile,
  WorkoutLog,
} from '../types';

const KEYS = {
  profile: 'gymforge.profile.v1',
  routines: 'gymforge.routines.v1',
  logs: 'gymforge.logs.v1',
};

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  goal: 'general',
  unit: 'lb',
  onboarded: false,
};

interface StoreValue {
  ready: boolean;
  profile: UserProfile;
  routines: Routine[];
  logs: WorkoutLog[];
  /** exerciseId -> personal record derived from logs. */
  records: Record<string, PersonalRecord>;

  saveProfile: (p: Partial<UserProfile>) => void;
  addRoutine: (r: Routine) => void;
  updateRoutine: (r: Routine) => void;
  deleteRoutine: (id: string) => void;
  addLog: (l: WorkoutLog) => void;
  deleteLog: (id: string) => void;
  /** The best set to beat next time for a given exercise, if any. */
  getTarget: (exerciseId: string) => PersonalRecord | undefined;
}

const StoreContext = createContext<StoreValue | null>(null);

/** Derive per-exercise personal records from the full workout history. */
function computeRecords(logs: WorkoutLog[]): Record<string, PersonalRecord> {
  const records: Record<string, PersonalRecord> = {};
  // Oldest -> newest so "last" ends up being the most recent session.
  const ordered = [...logs].sort((a, b) => a.date - b.date);

  for (const log of ordered) {
    for (const ex of log.exercises) {
      // Best performed set within this session.
      let sessionBest = { weight: 0, reps: 0, volume: -1 };
      for (const s of ex.sets) {
        if (!s.done) continue;
        const vol = s.weight * s.reps;
        if (vol > sessionBest.volume) {
          sessionBest = { weight: s.weight, reps: s.reps, volume: vol };
        }
      }
      if (sessionBest.volume < 0) continue; // nothing completed

      const prev = records[ex.exerciseId];
      const bestSetVolume = Math.max(prev?.bestSetVolume ?? 0, sessionBest.volume);
      const bestWeight = Math.max(prev?.bestWeight ?? 0, sessionBest.weight);
      const bestReps =
        sessionBest.weight >= (prev?.bestWeight ?? 0)
          ? Math.max(prev?.bestReps ?? 0, sessionBest.reps)
          : prev?.bestReps ?? sessionBest.reps;

      records[ex.exerciseId] = {
        exerciseId: ex.exerciseId,
        bestWeight,
        bestReps,
        bestSetVolume,
        // Always overwrite "last" with this (chronologically later) session.
        lastWeight: sessionBest.weight,
        lastReps: sessionBest.reps,
        date: log.date,
      };
    }
  }
  return records;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);

  // Load persisted state once on mount.
  useEffect(() => {
    (async () => {
      try {
        const [p, r, l] = await Promise.all([
          AsyncStorage.getItem(KEYS.profile),
          AsyncStorage.getItem(KEYS.routines),
          AsyncStorage.getItem(KEYS.logs),
        ]);
        if (p) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(p) });
        if (r) setRoutines(JSON.parse(r));
        if (l) setLogs(JSON.parse(l));
      } catch (e) {
        console.warn('Failed to load storage', e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback((key: string, value: unknown) => {
    AsyncStorage.setItem(key, JSON.stringify(value)).catch((e) =>
      console.warn('Failed to persist', key, e),
    );
  }, []);

  const saveProfile = useCallback(
    (p: Partial<UserProfile>) => {
      setProfile((prev) => {
        const next = { ...prev, ...p };
        persist(KEYS.profile, next);
        return next;
      });
    },
    [persist],
  );

  const addRoutine = useCallback(
    (routine: Routine) => {
      setRoutines((prev) => {
        const next = [routine, ...prev];
        persist(KEYS.routines, next);
        return next;
      });
    },
    [persist],
  );

  const updateRoutine = useCallback(
    (routine: Routine) => {
      setRoutines((prev) => {
        const next = prev.map((r) => (r.id === routine.id ? routine : r));
        persist(KEYS.routines, next);
        return next;
      });
    },
    [persist],
  );

  const deleteRoutine = useCallback(
    (id: string) => {
      setRoutines((prev) => {
        const next = prev.filter((r) => r.id !== id);
        persist(KEYS.routines, next);
        return next;
      });
    },
    [persist],
  );

  const addLog = useCallback(
    (log: WorkoutLog) => {
      setLogs((prev) => {
        const next = [log, ...prev];
        persist(KEYS.logs, next);
        return next;
      });
    },
    [persist],
  );

  const deleteLog = useCallback(
    (id: string) => {
      setLogs((prev) => {
        const next = prev.filter((l) => l.id !== id);
        persist(KEYS.logs, next);
        return next;
      });
    },
    [persist],
  );

  const records = useMemo(() => computeRecords(logs), [logs]);
  const getTarget = useCallback(
    (exerciseId: string) => records[exerciseId],
    [records],
  );

  const value: StoreValue = {
    ready,
    profile,
    routines,
    logs,
    records,
    saveProfile,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    addLog,
    deleteLog,
    getTarget,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
