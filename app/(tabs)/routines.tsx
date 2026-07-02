import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/storage/store';
import { getGoal } from '@/data/goals';
import { getExercise } from '@/data/exercises';
import { colors, goalColors, radius, spacing } from '@/theme';
import { Card, Chip, EmptyState, PrimaryButton } from '@/components/ui';

export default function Routines() {
  const router = useRouter();
  const { routines, deleteRoutine } = useStore();

  const confirmDelete = (id: string, name: string) => {
    Alert.alert('Eliminar rutina', `¿Seguro que quieres eliminar "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteRoutine(id) },
    ]);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}
    >
      <View style={{ marginBottom: spacing.lg }}>
        <PrimaryButton label="Nueva rutina" icon="add" onPress={() => router.push('/routine/new')} />
      </View>

      {routines.length === 0 ? (
        <EmptyState
          icon="clipboard"
          title="Sin rutinas todavía"
          subtitle="Crea rutinas personalizadas eligiendo ejercicios y definiendo series y repeticiones."
        />
      ) : (
        <View style={{ gap: spacing.md }}>
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
                  <Pressable
                    hitSlop={10}
                    onPress={() => confirmDelete(r.id, r.name)}
                    style={styles.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.textFaint} />
                  </Pressable>
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 18, fontWeight: '800', color: colors.text },
  preview: { fontSize: 13, color: colors.textMuted, marginTop: 8, lineHeight: 18 },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
});
