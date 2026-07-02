import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useStore } from '@/storage/store';
import { colors } from '@/theme';

/** Entry gate: wait for storage, then route to onboarding or the app. */
export default function Index() {
  const { ready, profile } = useStore();

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return <Redirect href={profile.onboarded ? '/(tabs)' : '/onboarding'} />;
}
