import { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/storage/store';
import { getExercise } from '@/data/exercises';
import { colors, radius, spacing } from '@/theme';
import { Card, EmptyState, SectionHeader } from '@/components/ui';

export default function Progress() {
  const router = useRouter();
  const { logs, records, profile, bodyWeights, addBodyWeight } = useStore();
  const [weightInput, setWeightInput] = useState('');
  const [showWeightForm, setShowWeightForm] = useState(false);

  const prs = Object.values(records).sort((a, b) => b.bestSetVolume - a.bestSetVolume);
  const totalVolume = logs.reduce((s, l) => s + l.totalVolume, 0);

  const lastWeight = bodyWeights[bodyWeights.length - 1];
  const prevWeight = bodyWeights[bodyWeights.length - 2];
  const weightDelta = lastWeight && prevWeight ? lastWeight.weight - prevWeight.weight : null;

  const saveWeight = () => {
    const w = parseFloat(weightInput.replace(',', '.'));
    if (!w || w <= 0) {
      Alert.alert('Peso inválido', 'Escribe tu peso corporal, por ejemplo 176.5');
      return;
    }
    addBodyWeight({ date: Date.now(), weight: w });
    setWeightInput('');
    setShowWeightForm(false);
  };

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

      {/* Body weight */}
      <View style={{ marginTop: spacing.xl }}>
        <SectionHeader
          title="Peso corporal"
          action={showWeightForm ? undefined : '+ Registrar'}
          onAction={() => setShowWeightForm(true)}
        />
        <Card>
          {showWeightForm && (
            <View style={styles.weightForm}>
              <TextInput
                value={weightInput}
                onChangeText={setWeightInput}
                keyboardType="numeric"
                placeholder={`Tu peso de hoy (${profile.unit})`}
                placeholderTextColor={colors.textFaint}
                style={styles.weightInput}
                autoFocus
              />
              <Pressable onPress={saveWeight} style={styles.weightSave} hitSlop={6}>
                <Ionicons name="checkmark" size={20} color="#0B0F14" />
              </Pressable>
              <Pressable
                onPress={() => setShowWeightForm(false)}
                style={[styles.weightSave, { backgroundColor: colors.surfaceAlt }]}
                hitSlop={6}
              >
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </Pressable>
            </View>
          )}
          {bodyWeights.length === 0 && !showWeightForm ? (
            <EmptyState
              icon="scale"
              title="Registra tu peso"
              subtitle="Anota tu peso corporal cada semana para ver tu tendencia."
            />
          ) : bodyWeights.length > 0 ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm }}>
                <Text style={styles.weightNow}>
                  {lastWeight.weight} {profile.unit}
                </Text>
                {weightDelta !== null && weightDelta !== 0 && (
                  <Text
                    style={[
                      styles.weightDelta,
                      { color: weightDelta < 0 ? colors.accent : colors.warning },
                    ]}
                  >
                    {weightDelta > 0 ? '▲' : '▼'} {Math.abs(weightDelta).toFixed(1)} {profile.unit}
                  </Text>
                )}
              </View>
              {bodyWeights.length >= 2 && (
                <View style={styles.weightHistory}>
                  {bodyWeights.slice(-5).map((e) => (
                    <View key={e.date} style={styles.weightTile}>
                      <Text style={styles.weightTileValue}>{e.weight}</Text>
                      <Text style={styles.weightTileDate}>
                        {new Date(e.date).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          ) : null}
        </Card>
      </View>

      {/* History */}
      {logs.length > 0 && (
        <View style={{ marginTop: spacing.xl }}>
          <SectionHeader title="Historial" />
          <View style={{ gap: spacing.sm }}>
            {logs.slice(0, 15).map((l) => (
              <Card key={l.id} onPress={() => router.push(`/history/${l.id}`)}>
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
                  <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
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
  weightForm: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  weightInput: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  weightSave: {
    width: 42,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weightNow: { fontSize: 28, fontWeight: '900', color: colors.text },
  weightDelta: { fontSize: 14, fontWeight: '800' },
  weightHistory: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  weightTile: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingVertical: 8,
    alignItems: 'center',
    gap: 2,
  },
  weightTileValue: { fontSize: 14, fontWeight: '800', color: colors.text },
  weightTileDate: { fontSize: 9, color: colors.textFaint, fontWeight: '700' },
});
