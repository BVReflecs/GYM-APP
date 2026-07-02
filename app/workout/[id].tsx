import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

export default function Workout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { routines, records, profile, addLog } = useStore();

  const routine = routines.find((r) => r.id === id);

  // Seed each exercise's sets, prefilling with the last performance (to beat).
  const [state, setState] = useState<LoggedExercise[]>(() => {
    if (!routine) return [];
    return routine.exercises.map((re) => {
      const pr = records[re.exerciseId];
      const weight = pr?.lastWeight ?? re.weight ?? 0;
      const reps = re.reps;
      const sets: LoggedSet[] = Array.from({ length: re.sets }, () => ({
        weight,
        reps,
        done: false,
      }));
      return { exerciseId: re.exerciseId, sets };
    });
  });

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

  const update = (exIdx: number, setIdx: number, patch: Partial<LoggedSet>) => {
    setState((prev) =>
      prev.map((ex, i) =>
        i !== exIdx
          ? ex
          : { ...ex, sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, ...patch } : s)) },
      ),
    );
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
    };
    addLog(log);
    Alert.alert('¡Entrenamiento guardado! 💪', 'Tus marcas se actualizaron. ¡A superarlas la próxima!', [
      { text: 'Ver progreso', onPress: () => router.replace('/(tabs)/progress') },
    ]);
  };

  const confirmExit = () => {
    Alert.alert('Salir del entrenamiento', '¿Salir sin guardar? Se perderá lo registrado.', [
      { text: 'Seguir', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  const goal = getGoal(routine.goal);

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
        <View style={styles.livePulse}>
          <Ionicons name="barbell" size={18} color={colors.primary} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}>
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
  livePulse: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
