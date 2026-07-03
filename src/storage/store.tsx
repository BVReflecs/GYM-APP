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
  ActiveWorkout,
  BodyWeightEntry,
  PersonalRecord,
  Routine,
  UserProfile,
  WorkoutLog,
} from '../types';
import { weeklyStreak } from '../utils/dates';

const KEYS = {
  profile: 'gymforge.profile.v1',
  routines: 'gymforge.routines.v1',
  logs: 'gymforge.logs.v1',
  active: 'gymforge.active.v1',
  bodyweight: 'gymforge.bodyweight.v1',
};

const EXPORT_VERSION = 1;

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
  /** Live session that survives app restarts (null when not training). */
  activeWorkout: ActiveWorkout | null;
  bodyWeights: BodyWeightEntry[];
  /** Consecutive weeks with at least one workout. */
  streak: number;

  saveProfile: (p: Partial<UserProfile>) => void;
  addRoutine: (r: Routine) => void;
  updateRoutine: (r: Routine) => void;
  deleteRoutine: (id: string) => void;
  addLog: (l: WorkoutLog) => void;
  deleteLog: (id: string) => void;
  setActiveWorkout: (a: ActiveWorkout | null) => void;
  addBodyWeight: (e: BodyWeightEntry) => void;
  deleteBodyWeight: (date: number) => void;
  /** Serialize all user data as a JSON backup string. */
  exportData: () => string;
  /** Restore a backup created by exportData. Throws on invalid input. */
  importData: (json: string) => void;
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
  const [activeWorkout, setActiveWorkoutState] = useState<ActiveWorkout | null>(null);
  const [bodyWeights, setBodyWeights] = useState<BodyWeightEntry[]>([]);

  // Load persisted state once on mount.
  useEffect(() => {
    (async () => {
      try {
        const [p, r, l, a, w] = await Promise.all([
          AsyncStorage.getItem(KEYS.profile),
          AsyncStorage.getItem(KEYS.routines),
          AsyncStorage.getItem(KEYS.logs),
          AsyncStorage.getItem(KEYS.active),
          AsyncStorage.getItem(KEYS.bodyweight),
        ]);
        if (p) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(p) });
        if (r) setRoutines(JSON.parse(r));
        if (l) setLogs(JSON.parse(l));
        if (a) setActiveWorkoutState(JSON.parse(a));
        if (w) setBodyWeights(JSON.parse(w));
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

  const setActiveWorkout = useCallback(
    (a: ActiveWorkout | null) => {
      setActiveWorkoutState(a);
      if (a) {
        persist(KEYS.active, a);
      } else {
        AsyncStorage.removeItem(KEYS.active).catch(() => {});
      }
    },
    [persist],
  );

  const addBodyWeight = useCallback(
    (entry: BodyWeightEntry) => {
      setBodyWeights((prev) => {
        const next = [...prev, entry].sort((a, b) => a.date - b.date);
        persist(KEYS.bodyweight, next);
        return next;
      });
    },
    [persist],
  );

  const deleteBodyWeight = useCallback(
    (date: number) => {
      setBodyWeights((prev) => {
        const next = prev.filter((e) => e.date !== date);
        persist(KEYS.bodyweight, next);
        return next;
      });
    },
    [persist],
  );

  const exportData = useCallback(() => {
    return JSON.stringify(
      {
        app: 'gymforge',
        version: EXPORT_VERSION,
        exportedAt: Date.now(),
        profile,
        routines,
        logs,
        bodyWeights,
      },
      null,
      2,
    );
  }, [profile, routines, logs, bodyWeights]);

  const importData = useCallback(
    (json: string) => {
      const data = JSON.parse(json);
      if (data?.app !== 'gymforge' || !Array.isArray(data.routines) || !Array.isArray(data.logs)) {
        throw new Error('El archivo no es un respaldo válido de GymForge.');
      }
      const nextProfile = { ...DEFAULT_PROFILE, ...(data.profile ?? {}), onboarded: true };
      const nextRoutines: Routine[] = data.routines;
      const nextLogs: WorkoutLog[] = data.logs;
      const nextWeights: BodyWeightEntry[] = Array.isArray(data.bodyWeights) ? data.bodyWeights : [];
      setProfile(nextProfile);
      setRoutines(nextRoutines);
      setLogs(nextLogs);
      setBodyWeights(nextWeights);
      persist(KEYS.profile, nextProfile);
      persist(KEYS.routines, nextRoutines);
      persist(KEYS.logs, nextLogs);
      persist(KEYS.bodyweight, nextWeights);
    },
    [persist],
  );

  const records = useMemo(() => computeRecords(logs), [logs]);
  const streak = useMemo(() => weeklyStreak(logs.map((l) => l.date)), [logs]);
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
    activeWorkout,
    bodyWeights,
    streak,
    saveProfile,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    addLog,
    deleteLog,
    setActiveWorkout,
    addBodyWeight,
    deleteBodyWeight,
    exportData,
    importData,
    getTarget,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
