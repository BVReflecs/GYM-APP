import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EXERCISES, MUSCLE_GROUPS } from '@/data/exercises';
import { colors, muscleColors, radius, spacing } from '@/theme';
import { Card, EmptyState, MuscleChip } from '@/components/ui';

export default function Library() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter((e) => {
      if (group && e.muscleGroup !== group) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.primaryMuscles.some((m) => m.toLowerCase().includes(q)) ||
        e.equipment.toLowerCase().includes(q)
      );
    });
  }, [query, group]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textFaint} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar ejercicio o músculo..."
            placeholderTextColor={colors.textFaint}
            style={styles.searchInput}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textFaint} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Muscle filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={{ flexGrow: 0 }}
      >
        <FilterPill label="Todos" active={group === null} onPress={() => setGroup(null)} color={colors.primary} />
        {MUSCLE_GROUPS.map((g) => (
          <FilterPill
            key={g}
            label={g}
            active={group === g}
            onPress={() => setGroup(group === g ? null : g)}
            color={muscleColors[g] ?? colors.primary}
          />
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.count}>{results.length} ejercicios</Text>
        {results.length === 0 ? (
          <EmptyState icon="search" title="Sin resultados" subtitle="Prueba con otro término o filtro." />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {results.map((e) => (
              <Card key={e.id} onPress={() => router.push(`/exercise/${e.id}`)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <View
                    style={[
                      styles.thumb,
                      { backgroundColor: (muscleColors[e.muscleGroup] ?? colors.primary) + '22' },
                    ]}
                  >
                    <Ionicons
                      name="fitness"
                      size={22}
                      color={muscleColors[e.muscleGroup] ?? colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exName}>{e.name}</Text>
                    <Text style={styles.exMeta}>
                      {e.equipment} · {e.difficulty}
                    </Text>
                    <View style={{ marginTop: 6, flexDirection: 'row' }}>
                      <MuscleChip group={e.muscleGroup} small />
                    </View>
                  </View>
                  <Ionicons name="play-circle" size={26} color={colors.textFaint} />
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function FilterPill({
  label,
  active,
  onPress,
  color,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  color: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        active ? { backgroundColor: color, borderColor: color } : { borderColor: colors.border },
      ]}
    >
      <Text style={[styles.pillText, active && { color: '#0B0F14' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  searchWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 46,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 15 },
  filters: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingVertical: spacing.xs },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  pillText: { fontSize: 13, fontWeight: '700', color: colors.text },
  count: { fontSize: 13, color: colors.textFaint, fontWeight: '700', marginBottom: spacing.sm },
  thumb: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  exName: { fontSize: 16, fontWeight: '700', color: colors.text },
  exMeta: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
});
