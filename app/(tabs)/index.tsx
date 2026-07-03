import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/storage/store';
import { getGoal } from '@/data/goals';
import { getExercise } from '@/data/exercises';
import { colors, goalColors, radius, spacing } from '@/theme';
import { Card, Chip, EmptyState, PrimaryButton, SectionHeader } from '@/components/ui';
import { formatDuration, startOfWeek } from '@/utils/dates';

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, routines, logs, records, streak, activeWorkout, setActiveWorkout } = useStore();
  const goal = getGoal(profile.goal);
  const activeRoutine = activeWorkout
    ? routines.find((r) => r.id === activeWorkout.routineId)
    : undefined;

  const weekStart = startOfWeek();
  const weekLogs = logs.filter((l) => l.date >= weekStart);
  const weekVolume = weekLogs.reduce((sum, l) => sum + l.totalVolume, 0);
  const prCount = Object.keys(records).length;

  // Next targets: the 3 most recently trained exercises, with the set to beat.
  const targets = Object.values(records)
    .sort((a, b) => b.date - a.date)
    .slice(0, 3);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.lg,
        paddingBottom: spacing.xxl,
        paddingHorizontal: spacing.lg,
      }}
    >
      {/* Greeting */}
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>
            Hola{profile.name ? `, ${profile.name}` : ''} 👋
          </Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('es-MX', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/settings')}
          style={[styles.goalBadge, { borderColor: goalColors[goal.id] + '66' }]}
        >
          <Text style={{ fontSize: 18 }}>{goal.emoji}</Text>
        </Pressable>
      </View>

      {/* Resume in-progress workout */}
      {activeWorkout && activeRoutine && (
        <Card
          style={{ marginBottom: spacing.lg, borderColor: colors.accent + '66', backgroundColor: colors.accentDim }}
          onPress={() => router.push(`/workout/${activeWorkout.routineId}`)}
        >
          <View style={styles.routineRow}>
            <View style={[styles.routineIcon, { backgroundColor: colors.accent + '33' }]}>
              <Ionicons name="play" size={22} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.routineName}>Continuar entrenamiento</Text>
              <Text style={styles.routineMeta}>
                {activeRoutine.name} · empezó hace {formatDuration(Math.floor((Date.now() - activeWorkout.startedAt) / 1000))}
              </Text>
            </View>
            <Pressable
              hitSlop={10}
              onPress={() => setActiveWorkout(null)}
              style={styles.dismissBtn}
            >
              <Ionicons name="close" size={16} color={colors.textMuted} />
            </Pressable>
          </View>
        </Card>
      )}

      {/* Weekly stats */}
      <View style={styles.statsRow}>
        <Stat icon="flame" value={String(weekLogs.length)} label="Esta semana" color={colors.primary} />
        <Stat
          icon="ribbon"
          value={String(streak)}
          label={streak === 1 ? 'Semana seguida' : 'Semanas seguidas'}
          color={colors.accent}
        />
        <Stat
          icon="stats-chart"
          value={weekVolume >= 1000 ? `${(weekVolume / 1000).toFixed(1)}k` : String(weekVolume)}
          label={`Volumen (${profile.unit})`}
          color={colors.info}
        />
        <Stat icon="trophy" value={String(prCount)} label="Récords" color={colors.gold} />
      </View>

      {/* Goal card */}
      <Card style={{ marginTop: spacing.lg, borderColor: goalColors[goal.id] + '44' }}>
        <Text style={styles.cardKicker}>TU OBJETIVO</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <Text style={styles.goalTitle}>{goal.title}</Text>
        </View>
        <Text style={styles.goalDesc}>{goal.description}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.md }}>
          <Chip label={`Rango: ${goal.repRange}`} color={goalColors[goal.id]} />
          <Chip label={`Descanso ${goal.restSeconds}s`} color={colors.textMuted} />
        </View>
      </Card>

      {/* Routines */}
      <View style={{ marginTop: spacing.xl }}>
        <SectionHeader
          title="Empezar entrenamiento"
          action="Ver todas"
          onAction={() => router.push('/(tabs)/routines')}
        />
        {routines.length === 0 ? (
          <Card>
            <EmptyState
              icon="add-circle"
              title="Aún no tienes rutinas"
              subtitle="Crea tu primera rutina eligiendo ejercicios según tu objetivo."
            />
            <PrimaryButton
              label="Crear rutina"
              icon="add"
              onPress={() => router.push('/routine/new')}
            />
          </Card>
        ) : (
          <View style={{ gap: spacing.sm }}>
            {routines.slice(0, 3).map((r) => {
              const c = goalColors[r.goal];
              return (
                <Card key={r.id} onPress={() => router.push(`/routine/${r.id}`)}>
                  <View style={styles.routineRow}>
                    <View style={[styles.routineIcon, { backgroundColor: c + '22' }]}>
                      <Ionicons name="barbell" size={22} color={c} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.routineName}>{r.name}</Text>
                      <Text style={styles.routineMeta}>
                        {r.exercises.length} ejercicios · {getGoal(r.goal).title}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </View>

      {/* Targets to beat */}
      {targets.length > 0 && (
        <View style={{ marginTop: spacing.xl }}>
          <SectionHeader
            title="Metas a superar"
            action="Ver progreso"
            onAction={() => router.push('/(tabs)/progress')}
          />
          <View style={{ gap: spacing.sm }}>
            {targets.map((t) => {
              const ex = getExercise(t.exerciseId);
              if (!ex) return null;
              return (
                <Card key={t.exerciseId} onPress={() => router.push(`/exercise/${ex.id}`)}>
                  <View style={styles.routineRow}>
                    <View style={[styles.routineIcon, { backgroundColor: colors.accentDim }]}>
                      <Ionicons name="trending-up" size={20} color={colors.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.routineName}>{ex.name}</Text>
                      <Text style={styles.routineMeta}>
                        Última vez: {t.lastWeight} {profile.unit} × {t.lastReps} reps
                      </Text>
                    </View>
                    <View style={styles.beatBox}>
                      <Text style={styles.beatLabel}>SUPERAR</Text>
                      <Text style={styles.beatValue}>
                        {t.lastWeight} × {t.lastReps + 1}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function Stat({
  icon,
  value,
  label,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  hello: { fontSize: 26, fontWeight: '900', color: colors.text },
  date: { fontSize: 14, color: colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
  goalBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { fontSize: 22, fontWeight: '900', color: colors.text },
  statLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '600', textAlign: 'center' },
  cardKicker: { fontSize: 11, fontWeight: '800', color: colors.textFaint, letterSpacing: 1 },
  goalTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  goalDesc: { fontSize: 14, color: colors.textMuted, marginTop: 4, lineHeight: 20 },
  routineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  routineIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routineName: { fontSize: 16, fontWeight: '700', color: colors.text },
  routineMeta: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  beatBox: { alignItems: 'flex-end' },
  beatLabel: { fontSize: 9, fontWeight: '800', color: colors.accent, letterSpacing: 0.5 },
  beatValue: { fontSize: 15, fontWeight: '800', color: colors.text },
  dismissBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
