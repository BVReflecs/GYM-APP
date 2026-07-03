import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/storage/store';
import { getExercise } from '@/data/exercises';
import { colors, radius, spacing } from '@/theme';
import { Card, EmptyState, MuscleChip, PrimaryButton } from '@/components/ui';
import { formatDuration } from '@/utils/dates';

export default function HistoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { logs, profile, deleteLog } = useStore();

  const log = logs.find((l) => l.id === id);
  if (!log) {
    return <EmptyState icon="alert-circle" title="Entrenamiento no encontrado" />;
  }

  const confirmDelete = () => {
    Alert.alert('Eliminar entrenamiento', 'Se quitará del historial y tus récords se recalcularán.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          deleteLog(log.id);
          router.back();
        },
      },
    ]);
  };

  const totalSets = log.exercises.reduce((n, e) => n + e.sets.length, 0);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}
    >
      <Text style={styles.title}>{log.routineName}</Text>
      <Text style={styles.date}>
        {new Date(log.date).toLocaleDateString('es-MX', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </Text>

      {/* Summary */}
      <View style={styles.statsRow}>
        <Stat icon="barbell" value={String(log.exercises.length)} label="Ejercicios" />
        <Stat icon="layers" value={String(totalSets)} label="Series" />
        <Stat
          icon="stats-chart"
          value={
            log.totalVolume >= 10000
              ? `${(log.totalVolume / 1000).toFixed(1)}k`
              : log.totalVolume.toLocaleString()
          }
          label={`Volumen ${profile.unit}`}
        />
        {log.durationSeconds != null && (
          <Stat icon="time" value={formatDuration(log.durationSeconds)} label="Duración" />
        )}
      </View>

      {/* Exercises */}
      <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
        {log.exercises.map((ex) => {
          const meta = getExercise(ex.exerciseId);
          if (!meta) return null;
          return (
            <Card key={ex.exerciseId}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Text style={styles.exName}>{meta.name}</Text>
                <View style={{ marginLeft: 'auto' }}>
                  <MuscleChip group={meta.muscleGroup} small />
                </View>
              </View>
              <View style={{ marginTop: spacing.md, gap: 6 }}>
                {ex.sets.map((s, i) => (
                  <View key={i} style={styles.setRow}>
                    <Text style={styles.setNum}>Set {i + 1}</Text>
                    <Text style={styles.setValue}>
                      {s.weight} {profile.unit} × {s.reps} reps
                    </Text>
                    <Text style={styles.setVolume}>
                      = {(s.weight * s.reps).toLocaleString()} {profile.unit}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          );
        })}
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <PrimaryButton label="Eliminar entrenamiento" icon="trash" variant="outline" onPress={confirmDelete} />
      </View>
    </ScrollView>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '900', color: colors.text },
  date: { fontSize: 14, color: colors.textMuted, marginTop: 4, textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 3,
  },
  statValue: { fontSize: 16, fontWeight: '900', color: colors.text },
  statLabel: { fontSize: 9, color: colors.textMuted, fontWeight: '700', textAlign: 'center' },
  exName: { fontSize: 16, fontWeight: '800', color: colors.text, flexShrink: 1 },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
  },
  setNum: { fontSize: 12, fontWeight: '800', color: colors.textFaint, width: 48 },
  setValue: { fontSize: 14, fontWeight: '700', color: colors.text },
  setVolume: { fontSize: 12, color: colors.textMuted, marginLeft: 'auto', fontWeight: '600' },
});
