import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/storage/store';
import { getGoal } from '@/data/goals';
import { getExercise } from '@/data/exercises';
import { TEMPLATES, RoutineTemplate } from '@/data/templates';
import { colors, goalColors, radius, spacing } from '@/theme';
import { Card, Chip, PrimaryButton, SectionHeader } from '@/components/ui';
import { Routine } from '@/types';

export default function Routines() {
  const router = useRouter();
  const { routines, addRoutine, deleteRoutine } = useStore();

  const confirmDelete = (id: string, name: string) => {
    Alert.alert('Eliminar rutina', `¿Seguro que quieres eliminar "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteRoutine(id) },
    ]);
  };

  const duplicate = (r: Routine) => {
    addRoutine({
      ...r,
      id: `r_${Date.now()}`,
      name: `${r.name} (copia)`,
      createdAt: Date.now(),
    });
  };

  const useTemplate = (t: RoutineTemplate) => {
    const routine: Routine = {
      id: `r_${Date.now()}`,
      name: t.name,
      goal: t.goal,
      exercises: t.exercises.map((e) => ({ ...e })),
      createdAt: Date.now(),
    };
    addRoutine(routine);
    router.push(`/routine/${routine.id}`);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}
    >
      <View style={{ marginBottom: spacing.lg }}>
        <PrimaryButton label="Nueva rutina" icon="add" onPress={() => router.push('/routine/new')} />
      </View>

      {/* My routines */}
      {routines.length > 0 && (
        <View style={{ gap: spacing.md, marginBottom: spacing.xl }}>
          {routines.map((r) => {
            const c = goalColors[r.goal];
            const preview = r.exercises
              .slice(0, 3)
              .map((e) => getExercise(e.exerciseId)?.name)
              .filter(Boolean)
              .join(' · ');
            return (
              <Card key={r.id} onPress={() => router.push(`/routine/${r.id}`)}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{r.name}</Text>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                      <Chip label={getGoal(r.goal).title} color={c} small />
                      <Chip label={`${r.exercises.length} ejercicios`} color={colors.textMuted} small />
                    </View>
                    {preview ? <Text style={styles.preview}>{preview}</Text> : null}
                  </View>
                  <View style={{ gap: spacing.sm }}>
                    <Pressable
                      hitSlop={8}
                      onPress={() => router.push(`/routine/new?edit=${r.id}`)}
                      style={styles.iconBtn}
                    >
                      <Ionicons name="pencil" size={16} color={colors.textMuted} />
                    </Pressable>
                    <Pressable hitSlop={8} onPress={() => duplicate(r)} style={styles.iconBtn}>
                      <Ionicons name="copy-outline" size={16} color={colors.textMuted} />
                    </Pressable>
                    <Pressable
                      hitSlop={8}
                      onPress={() => confirmDelete(r.id, r.name)}
                      style={styles.iconBtn}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.textFaint} />
                    </Pressable>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      )}

      {/* Templates */}
      <SectionHeader
        title={routines.length === 0 ? 'Empieza con una plantilla' : 'Plantillas'}
      />
      {routines.length === 0 && (
        <Text style={styles.tplIntro}>
          Rutinas listas para usar. Elige una y ajústala a tu gusto.
        </Text>
      )}
      <View style={{ gap: spacing.sm }}>
        {TEMPLATES.map((t) => {
          const c = goalColors[t.goal];
          return (
            <Card key={t.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View style={[styles.tplIcon, { backgroundColor: c + '22' }]}>
                  <Text style={{ fontSize: 22 }}>{t.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tplName}>{t.name}</Text>
                  <Text style={styles.tplDesc}>{t.description}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                    <Chip label={getGoal(t.goal).title} color={c} small />
                    <Chip label={`${t.exercises.length} ejercicios`} color={colors.textMuted} small />
                  </View>
                </View>
                <Pressable onPress={() => useTemplate(t)} style={styles.useBtn} hitSlop={6}>
                  <Text style={styles.useBtnText}>Usar</Text>
                </Pressable>
              </View>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 18, fontWeight: '800', color: colors.text },
  preview: { fontSize: 13, color: colors.textMuted, marginTop: 8, lineHeight: 18 },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  tplIntro: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.md, lineHeight: 20 },
  tplIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tplName: { fontSize: 15, fontWeight: '800', color: colors.text },
  tplDesc: { fontSize: 12, color: colors.textMuted, marginTop: 2, lineHeight: 17 },
  useBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  useBtnText: { fontSize: 13, fontWeight: '800', color: '#0B0F14' },
});
