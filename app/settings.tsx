import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GOALS } from '@/data/goals';
import { useStore } from '@/storage/store';
import { colors, goalColors, radius, spacing } from '@/theme';
import { PrimaryButton } from '@/components/ui';
import { GoalId, Unit } from '@/types';

export default function Settings() {
  const router = useRouter();
  const { profile, saveProfile, exportData, importData } = useStore();

  const [name, setName] = useState(profile.name);
  const [goal, setGoal] = useState<GoalId>(profile.goal);
  const [unit, setUnit] = useState<Unit>(profile.unit);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  const save = () => {
    saveProfile({ name: name.trim(), goal, unit });
    router.back();
  };

  const doExport = async () => {
    try {
      await Share.share({ message: exportData() });
    } catch {
      // user dismissed the share sheet — nothing to do
    }
  };

  const doImport = () => {
    const text = importText.trim();
    if (!text) return;
    Alert.alert(
      'Importar respaldo',
      'Esto REEMPLAZA tus rutinas, historial y récords actuales por los del respaldo. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Importar',
          style: 'destructive',
          onPress: () => {
            try {
              importData(text);
              setImportText('');
              setShowImport(false);
              Alert.alert('✅ Datos restaurados', 'Tu respaldo se importó correctamente.');
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'El texto no es un respaldo válido.');
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}
    >
      <Text style={styles.label}>NOMBRE</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Tu nombre"
        placeholderTextColor={colors.textFaint}
        style={styles.input}
      />

      <Text style={styles.label}>OBJETIVO</Text>
      <View style={{ gap: spacing.sm }}>
        {GOALS.map((g) => {
          const selected = goal === g.id;
          const c = goalColors[g.id];
          return (
            <Pressable
              key={g.id}
              onPress={() => setGoal(g.id)}
              style={[styles.goal, selected && { borderColor: c, backgroundColor: c + '18' }]}
            >
              <Text style={{ fontSize: 24 }}>{g.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.goalTitle}>{g.title}</Text>
                <Text style={styles.goalDesc}>{g.repRange}</Text>
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

      <Text style={styles.label}>UNIDAD DE PESO</Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {(['lb', 'kg'] as Unit[]).map((u) => (
          <Pressable key={u} onPress={() => setUnit(u)} style={[styles.unit, unit === u && styles.unitActive]}>
            <Text style={[styles.unitText, unit === u && { color: '#0B0F14' }]}>
              {u === 'lb' ? 'Libras (lb)' : 'Kilos (kg)'}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={{ height: spacing.xl }} />
      <PrimaryButton label="Guardar cambios" icon="checkmark" onPress={save} />

      {/* Backup */}
      <Text style={styles.label}>RESPALDO DE DATOS</Text>
      <View style={{ gap: spacing.sm }}>
        <PrimaryButton
          label="Exportar mis datos"
          icon="share-outline"
          variant="outline"
          onPress={doExport}
        />
        {!showImport ? (
          <PrimaryButton
            label="Importar respaldo"
            icon="download-outline"
            variant="outline"
            onPress={() => setShowImport(true)}
          />
        ) : (
          <View style={styles.importBox}>
            <Text style={styles.importHint}>
              Pega aquí el texto del respaldo que exportaste:
            </Text>
            <TextInput
              value={importText}
              onChangeText={setImportText}
              multiline
              placeholder='{"app":"gymforge", ...}'
              placeholderTextColor={colors.textFaint}
              style={styles.importInput}
            />
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <PrimaryButton label="Importar" icon="checkmark" onPress={doImport} />
              </View>
              <View style={{ flex: 1 }}>
                <PrimaryButton
                  label="Cancelar"
                  variant="outline"
                  onPress={() => {
                    setShowImport(false);
                    setImportText('');
                  }}
                />
              </View>
            </View>
          </View>
        )}
      </View>

      <Pressable
        style={styles.reset}
        onPress={() =>
          Alert.alert(
            'Cambiar unidad',
            'El peso de tus registros anteriores no se convierte automáticamente; solo cambia la etiqueta que se muestra.',
          )
        }
      >
        <Ionicons name="information-circle-outline" size={16} color={colors.textFaint} />
        <Text style={styles.resetText}>Sobre el cambio de unidades</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
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
    padding: spacing.md,
  },
  goalTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  goalDesc: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
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
  reset: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: spacing.xl },
  resetText: { fontSize: 13, color: colors.textFaint },
  importBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  importHint: { fontSize: 13, color: colors.textMuted },
  importInput: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.md,
    color: colors.text,
    fontSize: 12,
    minHeight: 90,
    textAlignVertical: 'top',
  },
});
