import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastHost } from '@/components/Feedback';
import { SplashOverlay } from '@/components/SplashOverlay';
import { useStore } from '@/store';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold });
  const hydrated = useStore((s) => s.hydrated);
  const signedIn = useStore((s) => s.signedIn);
  const ready = (fontsLoaded || !!fontError) && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.mist }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: colors.mist },
            gestureEnabled: true,
          }}>
          <Stack.Screen name="index" options={{ animation: 'none' }} />
          <Stack.Protected guard={!signedIn}>
            <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
          </Stack.Protected>
          <Stack.Protected guard={signedIn}>
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen name="add" options={{ presentation: 'modal', animation: 'slide_from_bottom', gestureDirection: 'vertical' }} />
            <Stack.Screen name="budget-edit" options={{ presentation: 'modal', animation: 'slide_from_bottom', gestureDirection: 'vertical' }} />
            <Stack.Screen name="transaction/[id]" />
            <Stack.Screen name="goals" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="wallets" />
            <Stack.Screen name="categories" />
            <Stack.Screen name="profile" />
          </Stack.Protected>
        </Stack>
        <ToastHost />
        <SplashOverlay />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
