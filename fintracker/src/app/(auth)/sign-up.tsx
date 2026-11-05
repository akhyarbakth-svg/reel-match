import { Link, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View, type TextInputInstance } from 'react-native';
import Animated, { FadeInDown, interpolateColor, useAnimatedStyle } from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { CheckRow } from '@/components/Controls';
import { TextField } from '@/components/Field';
import { Header, Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { useSpringValue } from '@/lib/anim';
import { isValidEmail } from '@/lib/format';
import { error as hapticError } from '@/lib/haptics';
import { useStore } from '@/store';
import { colors } from '@/theme';

function strength(pw: string): number {
  let s = 0;
  if (pw.length >= 8) s += 1;
  if (/\d/.test(pw)) s += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s += 1;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) s += 1;
  return pw.length === 0 ? 0 : Math.max(1, s);
}
const LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

function StrengthMeter({ score }: { score: number }) {
  const p = useSpringValue(score);
  const bar = useAnimatedStyle(() => ({
    width: `${(p.value / 4) * 100}%`,
    backgroundColor: interpolateColor(p.value, [1, 2, 3, 4], [colors.danger, colors.warning, colors.emeraldSoft, colors.emerald]),
  }));
  return (
    <View style={{ gap: 6 }} accessible accessibilityLabel={`Password strength: ${LABELS[score] || 'none'}`}>
      <View style={styles.meterTrack}>
        <Animated.View style={[styles.meterFill, bar]} />
      </View>
      <Txt variant="small" color={colors.muted}>
        {score ? `${LABELS[score]} password` : 'At least 8 characters, including a number.'}
      </Txt>
    </View>
  );
}

export default function SignUp() {
  const router = useRouter();
  const startSignUp = useStore((s) => s.startSignUp);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; agree?: string }>({});
  const [attempt, setAttempt] = useState(0);
  const emailRef = useRef<TextInputInstance>(null);
  const passRef = useRef<TextInputInstance>(null);

  const submit = () => {
    const e: typeof errors = {};
    if (name.trim().length < 2) e.name = 'Please enter your name.';
    if (!isValidEmail(email)) e.email = 'Enter a valid email, like you@example.com.';
    if (password.length < 8 || !/\d/.test(password)) e.password = 'Use at least 8 characters, including a number.';
    if (!agree) e.agree = 'Please accept the Terms to continue.';
    setErrors(e);
    setAttempt((a) => a + 1);
    if (Object.keys(e).length) {
      hapticError();
      return;
    }
    startSignUp({ name: name.trim(), email: email.trim().toLowerCase() });
    router.push('/verify');
  };

  return (
    <Screen
      header={<Header onBack={() => (router.canGoBack() ? router.back() : router.replace('/log-in'))} />}
      footer={
        <>
          <Button label="Create account" onPress={submit} />
          <View style={styles.footRow}>
            <Txt variant="body" color={colors.muted} style={{ fontSize: 15 }}>
              Already have an account?
            </Txt>
            <Link href="/log-in" replace accessibilityRole="link" style={styles.link}>
              <Txt variant="body" weight="semibold" color={colors.emerald} style={{ fontSize: 15 }}>
                Log in
              </Txt>
            </Link>
          </View>
        </>
      }>
      <Animated.View entering={FadeInDown.duration(360)} style={{ gap: 8 }}>
        <Txt variant="h1" accessibilityRole="header">
          Create your account
        </Txt>
        <Txt variant="body" color={colors.muted}>
          Start tracking your spending in under a minute.
        </Txt>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(360)} style={{ gap: 18, marginTop: 8 }}>
        <TextField
          label="Full name"
          icon="user"
          placeholder="Mohammad Salman"
          autoComplete="name"
          textContentType="name"
          autoCapitalize="words"
          returnKeyType="next"
          value={name}
          onChangeText={(t) => {
            setName(t);
            if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
          }}
          onSubmitEditing={() => emailRef.current?.focus()}
          error={errors.name}
          shakeKey={attempt}
        />
        <TextField
          ref={emailRef}
          label="Email"
          icon="mail"
          placeholder="you@example.com"
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
        <View style={{ gap: 10 }}>
          <TextField
            ref={passRef}
            label="Password"
            icon="lock"
            placeholder="Create a password"
            password
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="done"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
            }}
            onSubmitEditing={submit}
            error={errors.password}
            shakeKey={attempt}
          />
          {!errors.password ? <StrengthMeter score={strength(password)} /> : null}
        </View>
        <View>
          <CheckRow label="I agree to the Terms and Privacy Policy" checked={agree} onToggle={() => setAgree((a) => !a)} />
          {errors.agree ? (
            <Txt variant="small" color={colors.danger}>
              {errors.agree}
            </Txt>
          ) : null}
        </View>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 },
  link: { paddingVertical: 12, paddingHorizontal: 4 },
  meterTrack: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  meterFill: { height: '100%', borderRadius: 3 },
});
