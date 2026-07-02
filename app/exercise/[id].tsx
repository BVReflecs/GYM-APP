import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getExercise } from '@/data/exercises';
import { useStore } from '@/storage/store';
import { colors, muscleColors, radius, spacing } from '@/theme';
import { Card, Chip, EmptyState, MuscleChip, PrimaryButton } from '@/components/ui';

export default function ExerciseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { records, profile } = useStore();
  const ex = getExercise(id);

  if (!ex) {
    return <EmptyState icon="alert-circle" title="Ejercicio no encontrado" />;
  }

  const pr = records[ex.id];
  const accent = muscleColors[ex.muscleGroup] ?? colors.primary;

  const openVideo = () => {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      ex.videoQuery,
    )}`;
    Linking.openURL(url).catch(() => {});
  };

  const difficultyColor =
    ex.difficulty === 'Principiante'
      ? colors.accent
      : ex.difficulty === 'Intermedio'
        ? colors.warning
        : colors.danger;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}
    >
      {/* Video hero */}
      <View style={[styles.hero, { backgroundColor: accent + '18', borderColor: accent + '44' }]}>
        <View style={[styles.playCircle, { backgroundColor: accent }]}>
          <Ionicons name="play" size={30} color="#0B0F14" />
        </View>
        <Text style={styles.heroText}>Ver cómo se hace correctamente</Text>
        <PrimaryButton label="Ver video tutorial" icon="logo-youtube" onPress={openVideo} />
      </View>

      <Text style={styles.title}>{ex.name}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.sm }}>
        <MuscleChip group={ex.muscleGroup} />
        <Chip label={ex.difficulty} color={difficultyColor} />
        <Chip label={ex.equipment} color={colors.textMuted} />
      </View>

      {/* Target to beat */}
      {pr && (
        <Card style={{ marginTop: spacing.lg, borderColor: colors.accent + '55' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Ionicons name="flag" size={22} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.prTitle}>Tu meta a superar</Text>
              <Text style={styles.prSub}>
                La última vez lograste {pr.lastWeight} {profile.unit} × {pr.lastReps} reps
              </Text>
            </View>
            <Text style={styles.prTarget}>
              {pr.lastWeight}
              {'\n'}× {pr.lastReps + 1}
            </Text>
          </View>
        </Card>
      )}

      {/* Muscles worked */}
      <Section title="Músculo trabajado" icon="body">
        <Text style={styles.subLabel}>PRINCIPALES</Text>
        <View style={styles.muscleRow}>
          {ex.primaryMuscles.map((m) => (
            <Chip key={m} label={m} color={accent} filled />
          ))}
        </View>
        {ex.secondaryMuscles.length > 0 && (
          <>
            <Text style={[styles.subLabel, { marginTop: spacing.md }]}>SECUNDARIOS</Text>
            <View style={styles.muscleRow}>
              {ex.secondaryMuscles.map((m) => (
                <Chip key={m} label={m} color={colors.textMuted} />
              ))}
            </View>
          </>
        )}
      </Section>

      {/* Instructions */}
      <Section title="Cómo hacerlo" icon="list">
        {ex.instructions.map((step, i) => (
          <View key={i} style={styles.step}>
            <View style={[styles.stepNum, { backgroundColor: accent + '22' }]}>
              <Text style={[styles.stepNumText, { color: accent }]}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </Section>

      {/* Tips */}
      {ex.tips.length > 0 && (
        <Section title="Consejos clave" icon="bulb">
          {ex.tips.map((tip, i) => (
            <View key={i} style={styles.tip}>
              <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </Section>
      )}

      {/* Variations */}
      {ex.variations.length > 0 && (
        <Section title="Variaciones" icon="shuffle">
          <View style={{ gap: spacing.sm }}>
            {ex.variations.map((vid) => {
              const v = getExercise(vid);
              if (!v) return null;
              return (
                <Card key={vid} onPress={() => router.push(`/exercise/${v.id}`)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <View
                      style={[
                        styles.varIcon,
                        { backgroundColor: (muscleColors[v.muscleGroup] ?? colors.primary) + '22' },
                      ]}
                    >
                      <Ionicons name="swap-horizontal" size={18} color={muscleColors[v.muscleGroup] ?? colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.varName}>{v.name}</Text>
                      <Text style={styles.varMeta}>{v.equipment}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
                  </View>
                </Card>
              );
            })}
          </View>
        </Section>
      )}
    </ScrollView>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginTop: spacing.xl }}>
      <View style={styles.sectionHead}>
        <Ionicons name={icon} size={18} color={colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  heroText: { fontSize: 15, fontWeight: '600', color: colors.text },
  title: { fontSize: 26, fontWeight: '900', color: colors.text, marginTop: spacing.lg },
  prTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  prSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  prTarget: { fontSize: 16, fontWeight: '900', color: colors.accent, textAlign: 'right' },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  subLabel: { fontSize: 11, fontWeight: '800', color: colors.textFaint, letterSpacing: 1, marginBottom: 8 },
  muscleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  step: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md, alignItems: 'flex-start' },
  stepNum: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontSize: 13, fontWeight: '800' },
  stepText: { flex: 1, fontSize: 15, color: colors.text, lineHeight: 22 },
  tip: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm, alignItems: 'flex-start' },
  tipText: { flex: 1, fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  varIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  varName: { fontSize: 15, fontWeight: '700', color: colors.text },
  varMeta: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
});
