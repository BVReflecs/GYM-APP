import { useState } from 'react';
import {
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
import { GOALS } from '@/data/goals';
import { useStore } from '@/storage/store';
import { colors, goalColors, radius, spacing } from '@/theme';
import { PrimaryButton } from '@/components/ui';
import { GoalId, Unit } from '@/types';

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { saveProfile } = useStore();

  const [name, setName] = useState('');
  const [goal, setGoal] = useState<GoalId>('general');
  const [unit, setUnit] = useState<Unit>('lb');

  const finish = () => {
    saveProfile({ name: name.trim(), goal, unit, onboarded: true });
    router.replace('/(tabs)');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{
        padding: spacing.xl,
        paddingTop: insets.top + spacing.xl,
        paddingBottom: insets.bottom + spacing.xl,
      }}
    >
      <View style={styles.logoRow}>
        <View style={styles.logo}>
          <Ionicons name="barbell" size={28} color={colors.primary} />
        </View>
        <Text style={styles.brand}>GymForge</Text>
      </View>

      <Text style={styles.title}>Arma tu entrenamiento a tu medida</Text>
      <Text style={styles.subtitle}>
        Personaliza la app según tu objetivo y empieza a superar tus marcas.
      </Text>

      <Text style={styles.label}>¿Cómo te llamas?</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Tu nombre"
        placeholderTextColor={colors.textFaint}
        style={styles.input}
      />

      <Text style={styles.label}>¿Cuál es tu objetivo?</Text>
      <View style={{ gap: spacing.sm }}>
        {GOALS.map((g) => {
          const selected = goal === g.id;
          const c = goalColors[g.id];
          return (
            <Pressable
              key={g.id}
              onPress={() => setGoal(g.id)}
              style={[
                styles.goal,
                selected && { borderColor: c, backgroundColor: c + '18' },
              ]}
            >
              <Text style={styles.goalEmoji}>{g.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.goalTitle}>{g.title}</Text>
                <Text style={styles.goalDesc}>{g.description}</Text>
              </View>
              <Ionicons
                name={selected ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={selected ? c : colors.textFaint}
              />
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Unidad de peso</Text>
      <View style={styles.unitRow}>
        {(['lb', 'kg'] as Unit[]).map((u) => (
          <Pressable
            key={u}
            onPress={() => setUnit(u)}
            style={[styles.unit, unit === u && styles.unitActive]}
          >
            <Text style={[styles.unitText, unit === u && { color: '#0B0F14' }]}>
              {u === 'lb' ? 'Libras (lb)' : 'Kilos (kg)'}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={{ height: spacing.xl }} />
      <PrimaryButton label="Empezar" icon="arrow-forward" onPress={finish} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.xl },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { fontSize: 24, fontWeight: '900', color: colors.text, letterSpacing: 0.5 },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, lineHeight: 34 },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    lineHeight: 21,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  goal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  goalEmoji: { fontSize: 26 },
  goalTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  goalDesc: { fontSize: 13, color: colors.textMuted, marginTop: 2, lineHeight: 18 },
  unitRow: { flexDirection: 'row', gap: spacing.sm },
  unit: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  unitActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  unitText: { fontSize: 15, fontWeight: '700', color: colors.text },
});
