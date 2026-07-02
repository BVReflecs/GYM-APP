import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/storage/store';
import { getExercise } from '@/data/exercises';
import { colors, radius, spacing } from '@/theme';
import { Card, EmptyState, SectionHeader } from '@/components/ui';

export default function Progress() {
  const router = useRouter();
  const { logs, records, profile } = useStore();

  const prs = Object.values(records).sort((a, b) => b.bestSetVolume - a.bestSetVolume);
  const totalVolume = logs.reduce((s, l) => s + l.totalVolume, 0);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}
    >
      {/* Summary */}
      <View style={styles.summaryRow}>
        <SummaryTile value={String(logs.length)} label="Entrenamientos" color={colors.primary} />
        <SummaryTile value={String(prs.length)} label="Récords" color={colors.gold} />
        <SummaryTile
          value={totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : String(totalVolume)}
          label={`Volumen ${profile.unit}`}
          color={colors.info}
        />
      </View>

      {/* Personal records */}
      <View style={{ marginTop: spacing.xl }}>
        <SectionHeader title="Tus récords personales" />
        {prs.length === 0 ? (
          <Card>
            <EmptyState
              icon="trophy"
              title="Todavía no hay récords"
              subtitle="Registra un entrenamiento desde una rutina y tus marcas aparecerán aquí para superarlas."
            />
          </Card>
        ) : (
          <View style={{ gap: spacing.sm }}>
            {prs.map((pr) => {
              const ex = getExercise(pr.exerciseId);
              if (!ex) return null;
              const target = `${pr.lastWeight} ${profile.unit} × ${pr.lastReps + 1}`;
              return (
                <Card key={pr.exerciseId} onPress={() => router.push(`/exercise/${ex.id}`)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.medal}>
                      <Ionicons name="trophy" size={20} color={colors.gold} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.exName}>{ex.name}</Text>
                      <Text style={styles.exMeta}>
                        Mejor set: {pr.bestWeight} {profile.unit} × {pr.bestReps} reps
                      </Text>
                    </View>
                    <View style={styles.targetBox}>
                      <Text style={styles.targetLabel}>Meta</Text>
                      <Text style={styles.targetValue}>{target}</Text>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </View>

      {/* History */}
      {logs.length > 0 && (
        <View style={{ marginTop: spacing.xl }}>
          <SectionHeader title="Historial" />
          <View style={{ gap: spacing.sm }}>
            {logs.slice(0, 15).map((l) => (
              <Card key={l.id}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <View style={styles.calBox}>
                    <Text style={styles.calDay}>{new Date(l.date).getDate()}</Text>
                    <Text style={styles.calMonth}>
                      {new Date(l.date).toLocaleDateString('es-MX', { month: 'short' })}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exName}>{l.routineName}</Text>
                    <Text style={styles.exMeta}>
                      {l.exercises.length} ejercicios · {l.totalVolume.toLocaleString()} {profile.unit} de volumen
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function SummaryTile({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={styles.tile}>
      <Text style={[styles.tileValue, { color }]}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryRow: { flexDirection: 'row', gap: spacing.sm },
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: 4,
  },
  tileValue: { fontSize: 24, fontWeight: '900' },
  tileLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600', textAlign: 'center' },
  medal: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#2A230A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  exName: { fontSize: 16, fontWeight: '700', color: colors.text },
  exMeta: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  targetBox: { alignItems: 'flex-end' },
  targetLabel: { fontSize: 10, fontWeight: '800', color: colors.accent },
  targetValue: { fontSize: 15, fontWeight: '800', color: colors.text },
  calBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calDay: { fontSize: 18, fontWeight: '900', color: colors.text, lineHeight: 20 },
  calMonth: { fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', fontWeight: '700' },
});
