import * as LocalAuthentication from 'expo-local-authentication';
import { Link, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Platform, StyleSheet, View, type TextInputInstance } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { showToast } from '@/components/Feedback';
import { TextField } from '@/components/Field';
import { PressableScale } from '@/components/PressableScale';
import { Header, Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { isValidEmail } from '@/lib/format';
import { error as hapticError, success } from '@/lib/haptics';
import { useStore } from '@/store';
import { colors } from '@/theme';

export default function LogIn() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const biometric = useStore((s) => s.settings.biometric);
  const logIn = useStore((s) => s.logIn);
  const startReset = useStore((s) => s.startReset);
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(false);
  const passRef = useRef<TextInputInstance>(null);

  const submit = () => {
    const e: typeof errors = {};
    if (!isValidEmail(email)) e.email = 'Enter the email you signed up with.';
    if (password.length < 8) e.password = 'Passwords are at least 8 characters.';
    setErrors(e);
    setAttempt((a) => a + 1);
    if (Object.keys(e).length) {
      hapticError();
      return;
    }
    setLoading(true);
    // Accounts live on this device for now; swap this for your auth API.
    setTimeout(() => {
      success();
      logIn(email.trim().toLowerCase());
    }, 450);
  };

  const fingerprint = async () => {
    if (Platform.OS === 'web') {
      showToast('Fingerprint unlock works in the mobile app.', { icon: 'fingerprint' });
      return;
    }
    const [hardware, enrolled] = await Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()]);
    if (!hardware || !enrolled) {
      showToast('Set up a fingerprint or face in your phone settings first.', { icon: 'alert' });
      return;
    }
    const res = await LocalAuthentication.authenticateAsync({ promptMessage: 'Log in to fintracker' });
    if (res.success) {
      success();
      logIn(user?.email ?? email);
    }
  };

  const canBiometric = !!user && biometric;

  return (
    <Screen
      header={router.canGoBack() ? <Header /> : undefined}
      footer={
        <View style={styles.footRow}>
          <Txt variant="body" color={colors.muted} style={{ fontSize: 15 }}>
            New to fintracker?
          </Txt>
          <Link href="/sign-up" replace accessibilityRole="link" style={styles.link}>
            <Txt variant="body" weight="semibold" color={colors.emerald} style={{ fontSize: 15 }}>
              Create account
            </Txt>
          </Link>
        </View>
      }>
      <Animated.View entering={FadeInDown.duration(360)} style={{ gap: 8 }}>
        <Txt variant="h1" accessibilityRole="header">
          {user ? `Welcome back, ${user.name.split(' ')[0]}` : 'Welcome back'}
        </Txt>
        <Txt variant="body" color={colors.muted}>
          Log in to pick up where you left off.
        </Txt>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(360)} style={{ gap: 18, marginTop: 12 }}>
        <TextField
          label="Email"
          icon="mail"
          placeholder="salman@example.com"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          autoCapitalize="none"
          returnKeyType="next"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
          }}
          onSubmitEditing={() => passRef.current?.focus()}
          error={errors.email}
          shakeKey={attempt}
        />
        <TextField
          ref={passRef}
          label="Password"
          icon="lock"
          placeholder="Your password"
          password
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
          }}
          onSubmitEditing={submit}
          error={errors.password}
          shakeKey={attempt}
          labelRight={
            <PressableScale
              accessibilityRole="link"
              accessibilityLabel="Forgot password?"
              onPress={() => {
                startReset(email || user?.email || '');
                router.push('/verify');
              }}
              style={styles.forgot}>
              <Txt variant="label" color={colors.emerald}>
                Forgot password?
              </Txt>
            </PressableScale>
          }
        />
        <Button label="Log in" onPress={submit} loading={loading} style={{ marginTop: 6 }} />
      </Animated.View>

      {canBiometric || !user ? (
        <Animated.View entering={FadeInDown.delay(160).duration(360)} style={{ gap: 20 }}>
          <View style={styles.or} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <View style={styles.rule} />
            <Txt variant="label" color={colors.muted}>
              or
            </Txt>
            <View style={styles.rule} />
          </View>
          <Button label="Log in with fingerprint" icon="fingerprint" variant="secondary" onPress={fingerprint} />
        </Animated.View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  footRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 },
  link: { paddingVertical: 12, paddingHorizontal: 4 },
  forgot: { height: 32, justifyContent: 'center' },
  or: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rule: { flex: 1, height: 1, backgroundColor: '#DCE5E0' },
});
