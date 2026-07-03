import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider } from '@/storage/store';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '800' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.bg },
            headerBackTitle: 'Atrás',
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="exercise/[id]"
            options={{ title: 'Ejercicio', presentation: 'card' }}
          />
          <Stack.Screen name="settings" options={{ title: 'Ajustes', presentation: 'modal' }} />
          <Stack.Screen name="routine/new" options={{ title: 'Nueva rutina' }} />
          <Stack.Screen name="routine/[id]" options={{ title: 'Rutina' }} />
          <Stack.Screen
            name="workout/[id]"
            options={{ title: 'Entrenamiento', headerBackVisible: false }}
          />
          <Stack.Screen name="history/[id]" options={{ title: 'Detalle' }} />
        </Stack>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
