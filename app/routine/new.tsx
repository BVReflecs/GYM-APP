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
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { EXERCISES, MUSCLE_GROUPS, getExercise } from '@/data/exercises';
import { GOALS, getGoal } from '@/data/goals';
import { useStore } from '@/storage/store';
import { colors, goalColors, muscleColors, radius, spacing } from '@/theme';
import { Chip, PrimaryButton } from '@/components/ui';
import { GoalId, Routine, RoutineExercise } from '@/types';

export default function NewRoutine() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, addRoutine } = useStore();

  const [name, setName] = useState('');
  const [goal, setGoal] = useState<GoalId>(profile.goal);
  const [selected, setSelected] = useState<Record<string, RoutineExercise>>({});
  const [filter, setFilter] = useState<string | null>(null);

  const selectedList = useMemo(
    () => Object.values(selected),
    [selected],
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        // Sensible defaults derived from the chosen goal.
        const g = getGoal(goal);
        const reps = parseInt(g.repRange, 10) || 10;
        next[id] = { exerciseId: id, sets: 3, reps };
      }
      return next;
    });
  };

  const adjust = (id: string, key: 'sets' | 'reps', delta: number) => {
    setSelected((prev) => {
      const cur = prev[id];
      if (!cur) return prev;
      const value = Math.max(1, Math.min(50, cur[key] + delta));
      return { ...prev, [id]: { ...cur, [key]: value } };
    });
  };

  const save = () => {
    if (!name.trim()) {
      Alert.alert('Falta el nombre', 'Ponle un nombre a tu rutina.');
      return;
    }
    if (selectedList.length === 0) {
      Alert.alert('Sin ejercicios', 'Agrega al menos un ejercicio.');
      return;
    }
    const routine: Routine = {
      id: `r_${Date.now()}`,
      name: name.trim(),
      goal,
      exercises: selectedList,
      createdAt: Date.now(),
    };
    addRoutine(routine);
    router.replace(`/routine/${routine.id}`);
  };

  const available = EXERCISES.filter((e) => !filter || e.muscleGroup === filter);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}>
        {/* Name */}
        <Text style={styles.label}>NOMBRE DE LA RUTINA</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ej. Push · Pecho y tríceps"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
        />

        {/* Goal */}
        <Text style={styles.label}>OBJETIVO</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {GOALS.map((g) => {
            const active = goal === g.id;
            const c = goalColors[g.id];
            return (
              <Pressable
                key={g.id}
                onPress={() => setGoal(g.id)}
                style={[
                  styles.goalPill,
                  active ? { backgroundColor: c, borderColor: c } : { borderColor: colors.border },
                ]}
              >
                <Text style={{ fontSize: 15 }}>{g.emoji}</Text>
                <Text style={[styles.goalPillText, active && { color: '#0B0F14' }]}>{g.title}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Text style={styles.hint}>
          Sugerencia para este objetivo: {getGoal(goal).repRange} · descanso {getGoal(goal).restSeconds}s
        </Text>

        {/* Selected exercises */}
        {selectedList.length > 0 && (
          <>
            <Text style={styles.label}>EJERCICIOS SELECCIONADOS ({selectedList.length})</Text>
            <View style={{ gap: spacing.sm }}>
              {selectedList.map((re) => {
                const ex = getExercise(re.exerciseId)!;
                return (
                  <View key={re.exerciseId} style={styles.selCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.selName}>{ex.name}</Text>
                      <Pressable onPress={() => toggle(re.exerciseId)} hitSlop={8} style={{ marginLeft: 'auto' }}>
                        <Ionicons name="close-circle" size={22} color={colors.textFaint} />
                      </Pressable>
                    </View>
                    <View style={styles.stepperRow}>
                      <Stepper
                        label="Series"
                        value={re.sets}
                        onDec={() => adjust(re.exerciseId, 'sets', -1)}
                        onInc={() => adjust(re.exerciseId, 'sets', 1)}
                      />
                      <Stepper
                        label="Reps"
                        value={re.reps}
                        onDec={() => adjust(re.exerciseId, 'reps', -1)}
                        onInc={() => adjust(re.exerciseId, 'reps', 1)}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Exercise picker */}
        <Text style={styles.label}>AGREGAR EJERCICIOS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: spacing.md }}>
          <FilterPill label="Todos" active={filter === null} color={colors.primary} onPress={() => setFilter(null)} />
          {MUSCLE_GROUPS.map((g) => (
            <FilterPill
              key={g}
              label={g}
              active={filter === g}
              color={muscleColors[g] ?? colors.primary}
              onPress={() => setFilter(filter === g ? null : g)}
            />
          ))}
        </ScrollView>
        <View style={{ gap: spacing.sm }}>
          {available.map((e) => {
            const on = !!selected[e.id];
            return (
              <Pressable key={e.id} onPress={() => toggle(e.id)} style={[styles.pickRow, on && styles.pickRowOn]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pickName}>{e.name}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                    <Chip label={e.muscleGroup} color={muscleColors[e.muscleGroup] ?? colors.primary} small />
                    <Chip label={e.equipment} color={colors.textMuted} small />
                  </View>
                </View>
                <Ionicons
                  name={on ? 'checkmark-circle' : 'add-circle-outline'}
                  size={26}
                  color={on ? colors.accent : colors.textFaint}
                />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Save bar */}
      <View style={[styles.saveBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <PrimaryButton
          label={`Guardar rutina${selectedList.length ? ` (${selectedList.length})` : ''}`}
          icon="checkmark"
          onPress={save}
        />
      </View>
    </View>
  );
}

function Stepper({
  label,
  value,
  onInc,
  onDec,
}: {
  label: string;
  value: number;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <View style={styles.stepper}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <Pressable onPress={onDec} style={styles.stepBtn} hitSlop={6}>
          <Ionicons name="remove" size={18} color={colors.text} />
        </Pressable>
        <Text style={styles.stepperValue}>{value}</Text>
        <Pressable onPress={onInc} style={styles.stepBtn} hitSlop={6}>
          <Ionicons name="add" size={18} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

function FilterPill({
  label,
  active,
  color,
  onPress,
}: {
  label: string;
  active: boolean;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterPill,
        active ? { backgroundColor: color, borderColor: color } : { borderColor: colors.border },
      ]}
    >
      <Text style={[styles.filterPillText, active && { color: '#0B0F14' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 16,
  },
  hint: { fontSize: 13, color: colors.textFaint, marginTop: spacing.sm, fontStyle: 'italic' },
  goalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  goalPillText: { fontSize: 14, fontWeight: '700', color: colors.text },
  selCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  selName: { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1 },
  stepperRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  stepper: { flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, padding: spacing.sm },
  stepperLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '700', textAlign: 'center' },
  stepperControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  filterPillText: { fontSize: 13, fontWeight: '700', color: colors.text },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  pickRowOn: { borderColor: colors.accent + '77', backgroundColor: colors.accentDim },
  pickName: { fontSize: 15, fontWeight: '700', color: colors.text },
  saveBar: {
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
