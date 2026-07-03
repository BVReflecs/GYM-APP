import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/storage/store';
import { getExercise } from '@/data/exercises';
import { getGoal } from '@/data/goals';
import { colors, radius, spacing } from '@/theme';
import { EmptyState, PrimaryButton } from '@/components/ui';
import { LoggedExercise, LoggedSet, WorkoutLog } from '@/types';
import { formatDuration } from '@/utils/dates';

export default function Workout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { routines, records, profile, addLog, activeWorkout, setActiveWorkout } = useStore();

  const routine = routines.find((r) => r.id === id);
  // Resume a persisted session for this routine if one exists.
  const resumed = activeWorkout && activeWorkout.routineId === id ? activeWorkout : null;

  const [startedAt] = useState<number>(() => resumed?.startedAt ?? Date.now());
  const [state, setState] = useState<LoggedExercise[]>(() => {
    if (resumed) return resumed.exercises;
    if (!routine) return [];
    return routine.exercises.map((re) => {
      const pr = records[re.exerciseId];
      const weight = pr?.lastWeight ?? re.weight ?? 0;
      const sets: LoggedSet[] = Array.from({ length: re.sets }, () => ({
        weight,
        reps: re.reps,
        done: false,
      }));
      return { exerciseId: re.exerciseId, sets };
    });
  });

  // Session clock, ticking every second.
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const elapsed = Math.floor((now - startedAt) / 1000);

  // Rest countdown: absolute end timestamp (null = no timer running).
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null);
  const restLeft = restEndsAt ? Math.ceil((restEndsAt - now) / 1000) : 0;
  const vibrated = useRef(false);
  useEffect(() => {
    if (restEndsAt && restLeft <= 0) {
      if (!vibrated.current) {
        vibrated.current = true;
        Vibration.vibrate([0, 300, 150, 300]);
      }
      setRestEndsAt(null);
    } else if (restLeft > 0) {
      vibrated.current = false;
    }
  }, [restEndsAt, restLeft]);

  // Persist the live session on every change so it survives app restarts.
  useEffect(() => {
    if (!routine) return;
    setActiveWorkout({ routineId: routine.id, startedAt, exercises: state });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, startedAt, routine?.id]);

  const totalVolume = useMemo(
    () =>
      state.reduce(
        (sum, ex) =>
          sum + ex.sets.reduce((s, set) => s + (set.done ? set.weight * set.reps : 0), 0),
        0,
      ),
    [state],
  );
  const doneCount = useMemo(
    () => state.reduce((n, ex) => n + ex.sets.filter((s) => s.done).length, 0),
    [state],
  );

  if (!routine) {
    return <EmptyState icon="alert-circle" title="Rutina no encontrada" />;
  }

  const goal = getGoal(routine.goal);

  const update = (exIdx: number, setIdx: number, patch: Partial<LoggedSet>) => {
    setState((prev) =>
      prev.map((ex, i) =>
        i !== exIdx
          ? ex
          : { ...ex, sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, ...patch } : s)) },
      ),
    );
    // Completing a set starts (or restarts) the rest timer.
    if (patch.done === true) {
      setRestEndsAt(Date.now() + goal.restSeconds * 1000);
    } else if (patch.done === false) {
      setRestEndsAt(null);
    }
  };

  const addSet = (exIdx: number) => {
    setState((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex;
        const last = ex.sets[ex.sets.length - 1] ?? { weight: 0, reps: 10, done: false };
        return { ...ex, sets: [...ex.sets, { ...last, done: false }] };
      }),
    );
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    setState((prev) =>
      prev.map((ex, i) =>
        i !== exIdx ? ex : { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) },
      ),
    );
  };

  const finish = () => {
    if (doneCount === 0) {
      Alert.alert('Nada registrado', 'Marca al menos una serie como completada.');
      return;
    }
    const log: WorkoutLog = {
      id: `w_${Date.now()}`,
      routineId: routine.id,
      routineName: routine.name,
      date: Date.now(),
      // Keep only completed sets in history.
      exercises: state
        .map((ex) => ({ ...ex, sets: ex.sets.filter((s) => s.done) }))
        .filter((ex) => ex.sets.length > 0),
      totalVolume,
      durationSeconds: Math.floor((Date.now() - startedAt) / 1000),
    };
    addLog(log);
    setActiveWorkout(null);
    Alert.alert('¡Entrenamiento guardado! 💪', 'Tus marcas se actualizaron. ¡A superarlas la próxima!', [
      { text: 'Ver progreso', onPress: () => router.replace('/(tabs)/progress') },
    ]);
  };

  const confirmExit = () => {
    Alert.alert('Salir del entrenamiento', 'Tu sesión queda guardada y puedes continuarla desde Inicio.', [
      { text: 'Seguir entrenando', style: 'cancel' },
      { text: 'Salir (guardar sesión)', onPress: () => router.back() },
      {
        text: 'Descartar sesión',
        style: 'destructive',
        onPress: () => {
          setActiveWorkout(null);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Live header */}
      <View style={styles.liveBar}>
        <Pressable onPress={confirmExit} hitSlop={8} style={styles.exitBtn}>
          <Ionicons name="close" size={22} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.liveTitle}>{routine.name}</Text>
          <Text style={styles.liveMeta}>
            {doneCount} series · {totalVolume.toLocaleString()} {profile.unit}
          </Text>
        </View>
        <View style={styles.clockBox}>
          <Ionicons name="time-outline" size={14} color={colors.primary} />
          <Text style={styles.clockText}>{formatDuration(elapsed)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 190 }}>
        <Text style={styles.repHint}>Rango sugerido para {goal.title}: {goal.repRange}</Text>

        {state.map((ex, exIdx) => {
          const meta = getExercise(ex.exerciseId)!;
          const pr = records[ex.exerciseId];
          return (
            <View key={ex.exerciseId} style={styles.exBlock}>
              <View style={styles.exHead}>
                <Text style={styles.exTitle}>{meta.name}</Text>
                <Pressable onPress={() => router.push(`/exercise/${meta.id}`)} hitSlop={8}>
                  <Ionicons name="information-circle-outline" size={22} color={colors.textFaint} />
                </Pressable>
              </View>
              {pr ? (
                <Text style={styles.beat}>
                  🎯 A superar: {pr.lastWeight} {profile.unit} × {pr.lastReps} reps
                </Text>
              ) : (
                <Text style={styles.beatNew}>✨ Primera vez — hoy marcas tu récord base</Text>
              )}

              {/* Column headers */}
              <View style={styles.colHead}>
                <Text style={[styles.colLabel, { width: 34 }]}>SET</Text>
                <Text style={[styles.colLabel, { flex: 1, textAlign: 'center' }]}>
                  PESO ({profile.unit})
                </Text>
                <Text style={[styles.colLabel, { flex: 1, textAlign: 'center' }]}>REPS</Text>
                <Text style={[styles.colLabel, { width: 44, textAlign: 'center' }]}>✓</Text>
              </View>

              {ex.sets.map((set, setIdx) => (
                <View key={setIdx} style={[styles.setRow, set.done && styles.setRowDone]}>
                  <Text style={styles.setNum}>{setIdx + 1}</Text>
                  <TextInput
                    value={set.weight ? String(set.weight) : ''}
                    onChangeText={(t) =>
                      update(exIdx, setIdx, { weight: parseFloat(t.replace(',', '.')) || 0 })
                    }
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.textFaint}
                    style={styles.cellInput}
                  />
                  <TextInput
                    value={set.reps ? String(set.reps) : ''}
                    onChangeText={(t) => update(exIdx, setIdx, { reps: parseInt(t, 10) || 0 })}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.textFaint}
                    style={styles.cellInput}
                  />
                  <Pressable
                    onPress={() => update(exIdx, setIdx, { done: !set.done })}
                    onLongPress={() => removeSet(exIdx, setIdx)}
                    style={[styles.check, set.done && styles.checkOn]}
                    hitSlop={6}
                  >
                    <Ionicons
                      name={set.done ? 'checkmark' : 'ellipse-outline'}
                      size={20}
                      color={set.done ? '#0B0F14' : colors.textFaint}
                    />
                  </Pressable>
                </View>
              ))}

              <Pressable onPress={() => addSet(exIdx)} style={styles.addSet}>
                <Ionicons name="add" size={16} color={colors.primary} />
                <Text style={styles.addSetText}>Agregar serie</Text>
              </Pressable>
            </View>
          );
        })}
        <Text style={styles.tip}>Mantén presionada la ✓ para borrar una serie.</Text>
      </ScrollView>

      {/* Rest timer banner */}
      {restEndsAt !== null && restLeft > 0 && (
        <View style={[styles.restBar, { bottom: insets.bottom + 86 }]}>
          <Ionicons name="hourglass" size={18} color={colors.bg} />
          <Text style={styles.restText}>Descanso: {formatDuration(restLeft)}</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginLeft: 'auto' }}>
            <Pressable
              onPress={() => setRestEndsAt((e) => (e ? e + 15000 : e))}
              style={styles.restBtn}
              hitSlop={6}
            >
              <Text style={styles.restBtnText}>+15s</Text>
            </Pressable>
            <Pressable onPress={() => setRestEndsAt(null)} style={styles.restBtn} hitSlop={6}>
              <Text style={styles.restBtnText}>Saltar</Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={[styles.finishBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <PrimaryButton label="Terminar y guardar" icon="checkmark-done" variant="success" onPress={finish} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  liveBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: 54,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exitBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  liveMeta: { fontSize: 13, color: colors.textMuted, marginTop: 1 },
  clockBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryDim,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  clockText: { fontSize: 14, fontWeight: '800', color: colors.primary, fontVariant: ['tabular-nums'] },
  repHint: { fontSize: 13, color: colors.textFaint, fontStyle: 'italic', marginBottom: spacing.md },
  exBlock: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  exHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  exTitle: { fontSize: 17, fontWeight: '800', color: colors.text, flex: 1 },
  beat: { fontSize: 13, color: colors.accent, fontWeight: '700', marginTop: 4 },
  beatNew: { fontSize: 13, color: colors.info, fontWeight: '700', marginTop: 4 },
  colHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md, marginBottom: 4 },
  colLabel: { fontSize: 10, fontWeight: '800', color: colors.textFaint, letterSpacing: 0.5 },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  setRowDone: { backgroundColor: colors.accentDim },
  setNum: { width: 34, textAlign: 'center', fontSize: 15, fontWeight: '800', color: colors.textMuted },
  cellInput: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingVertical: 10,
    textAlign: 'center',
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  check: {
    width: 44,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  checkOn: { backgroundColor: colors.accent },
  addSet: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm, paddingVertical: 6 },
  addSetText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  tip: { fontSize: 12, color: colors.textFaint, textAlign: 'center', marginTop: spacing.sm },
  restBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  restText: { fontSize: 15, fontWeight: '900', color: colors.bg, fontVariant: ['tabular-nums'] },
  restBtn: {
    backgroundColor: '#00000022',
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  restBtnText: { fontSize: 13, fontWeight: '800', color: colors.bg },
  finishBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
});
