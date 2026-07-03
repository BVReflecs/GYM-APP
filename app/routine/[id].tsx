import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/storage/store';
import { getExercise } from '@/data/exercises';
import { getGoal } from '@/data/goals';
import { colors, goalColors, muscleColors, radius, spacing } from '@/theme';
import { Card, Chip, EmptyState, PrimaryButton } from '@/components/ui';

export default function RoutineDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { routines, records, profile } = useStore();

  const routine = routines.find((r) => r.id === id);
  if (!routine) {
    return <EmptyState icon="alert-circle" title="Rutina no encontrada" />;
  }

  const goal = getGoal(routine.goal);
  const c = goalColors[routine.goal];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <Text style={[styles.title, { flex: 1 }]}>{routine.name}</Text>
          <Pressable
            onPress={() => router.push(`/routine/new?edit=${routine.id}`)}
            style={styles.editBtn}
            hitSlop={8}
          >
            <Ionicons name="pencil" size={16} color={colors.text} />
            <Text style={styles.editBtnText}>Editar</Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.sm }}>
          <Chip label={goal.title} color={c} />
          <Chip label={`${routine.exercises.length} ejercicios`} color={colors.textMuted} />
        </View>
        <Text style={styles.hint}>
          Objetivo: {goal.repRange} · descanso recomendado {goal.restSeconds}s
        </Text>

        <View style={{ gap: spacing.sm, marginTop: spacing.xl }}>
          {routine.exercises.map((re, idx) => {
            const ex = getExercise(re.exerciseId);
            if (!ex) return null;
            const pr = records[re.exerciseId];
            return (
              <Card key={re.exerciseId} onPress={() => router.push(`/exercise/${ex.id}`)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <View style={styles.idx}>
                    <Text style={styles.idxText}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exName}>{ex.name}</Text>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, alignItems: 'center' }}>
                      <Chip label={ex.muscleGroup} color={muscleColors[ex.muscleGroup] ?? colors.primary} small />
                      <Text style={styles.exTarget}>
                        {re.sets} series × {re.reps} reps
                      </Text>
                    </View>
                    {pr && (
                      <Text style={styles.pr}>
                        🎯 Meta: superar {pr.lastWeight} {profile.unit} × {pr.lastReps} reps
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.startBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <PrimaryButton
          label="Iniciar entrenamiento"
          icon="play"
          onPress={() => router.push(`/workout/${routine.id}`)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '900', color: colors.text },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: spacing.md,
  },
  editBtnText: { fontSize: 13, fontWeight: '700', color: colors.text },
  hint: { fontSize: 13, color: colors.textFaint, marginTop: spacing.md, fontStyle: 'italic' },
  idx: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idxText: { fontSize: 15, fontWeight: '800', color: colors.text },
  exName: { fontSize: 16, fontWeight: '700', color: colors.text },
  exTarget: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  pr: { fontSize: 12, color: colors.accent, marginTop: 6, fontWeight: '600' },
  startBar: {
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
