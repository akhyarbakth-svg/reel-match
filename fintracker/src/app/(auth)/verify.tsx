import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputInstance } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { showToast } from '@/components/Feedback';
import { TextField } from '@/components/Field';
import { Icon } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { Header, Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { error as hapticError, success, tap } from '@/lib/haptics';
import { useStore } from '@/store';
import { colors, fonts, springs } from '@/theme';

const LENGTH = 6;

function CodeBox({ digit, active, done }: { digit: string; active: boolean; done: boolean }) {
  const pop = useSharedValue(1);
  const caret = useSharedValue(1);
  useEffect(() => {
    if (digit) pop.value = withSequence(withTiming(1.12, { duration: 90 }), withSpring(1, springs.bouncy));
  }, [digit, pop]);
  useEffect(() => {
    caret.value = active ? withRepeat(withSequence(withTiming(0, { duration: 450 }), withTiming(1, { duration: 450 })), -1) : 0;
  }, [active, caret]);
  const boxStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const caretStyle = useAnimatedStyle(() => ({ opacity: caret.value }));
  return (
    <Animated.View
      style={[
        styles.box,
        { borderColor: done ? colors.emerald : active ? colors.emerald : digit ? '#A7C9B7' : colors.borderStrong, backgroundColor: done ? colors.mint : colors.surface },
        boxStyle,
      ]}>
      {digit ? (
        <Txt variant="h2" style={{ fontSize: 26 }} tabular>
          {digit}
        </Txt>
      ) : active ? (
        <Animated.View style={[styles.caret, caretStyle]} />
      ) : null}
    </Animated.View>
  );
}

export default function Verify() {
  const router = useRouter();
  const pending = useStore((s) => s.pendingUser);
  const intent = useStore((s) => s.verifyIntent);
  const logIn = useStore((s) => s.logIn);
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(42);
  const [verified, setVerified] = useState(false);
  const [phase, setPhase] = useState<'code' | 'password'>('code');
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const input = useRef<TextInputInstance>(null);
  const email = pending?.email || 'your email';

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  useEffect(() => {
    const t = setTimeout(() => input.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  const onChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, LENGTH);
    if (digits.length > code.length) tap();
    setCode(digits);
    if (digits.length === LENGTH) {
      input.current?.blur();
      setTimeout(() => {
        success();
        setVerified(true);
        setTimeout(() => {
          if (intent === 'reset') setPhase('password');
          else router.push('/setup');
        }, 650);
      }, 250);
    } else {
      setVerified(false);
    }
  };

  const savePassword = () => {
    setAttempt((a) => a + 1);
    if (pw.length < 8 || !/\d/.test(pw)) {
      setPwError('Use at least 8 characters, including a number.');
      hapticError();
      return;
    }
    success();
    showToast('Password updated');
    logIn(pending?.email ?? '');
  };

  if (phase === 'password') {
    return (
      <Screen header={<Header onBack={() => setPhase('code')} />} footer={<Button label="Save and log in" onPress={savePassword} />}>
        <Animated.View entering={FadeInRight.duration(320)} exiting={FadeOutLeft} style={{ gap: 18 }}>
          <View style={styles.badge}>
            <Icon name="lock" size={30} color={colors.emerald} />
          </View>
          <View style={{ gap: 8 }}>
            <Txt variant="h1" accessibilityRole="header">
              Choose a new password
            </Txt>
            <Txt variant="body" color={colors.muted}>
              You’ll use it the next time you log in on a new device.
            </Txt>
          </View>
          <TextField label="New password" icon="lock" password value={pw} onChangeText={setPw} error={pwError} shakeKey={attempt} hint="At least 8 characters, including a number." autoComplete="new-password" />
        </Animated.View>
      </Screen>
    );
  }

  return (
    <Screen
      header={<Header />}
      footer={
        <Button
          label={verified ? 'Verified' : 'Verify and continue'}
          icon={verified ? 'check' : undefined}
          disabled={code.length !== LENGTH}
          onPress={() => onChange(code)}
        />
      }>
      <Animated.View entering={FadeInDown.duration(320)} style={styles.badge}>
        <Icon name="mail" size={30} color={colors.emerald} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(60).duration(320)} style={{ gap: 8 }}>
        <Txt variant="h1" accessibilityRole="header">
          Check your email
        </Txt>
        <Txt variant="body" color={colors.muted}>
          Enter the 6-digit code we sent to{' '}
          <Txt variant="body" weight="medium">
            {email}
          </Txt>
          .
        </Txt>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(320)} style={{ gap: 10, marginTop: 8 }}>
        <Txt variant="label">Verification code</Txt>
        <Pressable accessibilityLabel="Verification code" onPress={() => input.current?.focus()} style={styles.boxes}>
          {Array.from({ length: LENGTH }).map((_, i) => (
            <CodeBox key={i} digit={code[i] ?? ''} active={!verified && i === Math.min(code.length, LENGTH - 1) && code.length < LENGTH} done={verified} />
          ))}
          <TextInput
            ref={input}
            value={code}
            onChangeText={onChange}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            maxLength={LENGTH}
            accessibilityLabel="Verification code"
            caretHidden
            style={styles.hiddenInput}
          />
        </Pressable>
        {verified ? (
          <Animated.View entering={ZoomIn.springify()} style={styles.verifiedRow}>
            <Icon name="check" size={16} color={colors.emerald} strokeWidth={2.6} />
            <Txt variant="label" weight="semibold" color={colors.emerald}>
              Email verified
            </Txt>
          </Animated.View>
        ) : (
          <View style={styles.resendRow}>
            <Txt variant="label" color={colors.muted} style={{ fontFamily: fonts.regular }}>
              Didn’t get it?
            </Txt>
            {seconds > 0 ? (
              <Txt variant="label" tabular>
                Resend in 0:{seconds.toString().padStart(2, '0')}
              </Txt>
            ) : (
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel="Resend code"
                onPress={() => {
                  setSeconds(60);
                  showToast(`New code sent to ${email}`, { icon: 'mail' });
                }}
                style={{ height: 44, justifyContent: 'center' }}>
                <Txt variant="label" weight="semibold" color={colors.emerald}>
                  Resend code
                </Txt>
              </PressableScale>
            )}
          </View>
        )}
      </Animated.View>

      <Animated.View entering={FadeIn.delay(300)} style={styles.note}>
        <Icon name="lock" size={20} color={colors.emerald} />
        <Txt variant="label" color={colors.body} style={{ flex: 1, fontFamily: fonts.regular, lineHeight: 21 }}>
          {intent === 'reset'
            ? 'After the code, you’ll choose a new password.'
            : 'This prototype has no email server yet, so any 6 digits will verify.'}
        </Txt>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: { width: 64, height: 64, borderRadius: 20, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  boxes: { flexDirection: 'row', gap: 8 },
  box: { flex: 1, height: 60, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  caret: { width: 2, height: 26, borderRadius: 1, backgroundColor: colors.emerald },
  hiddenInput: { position: 'absolute', opacity: 0.011, width: '100%', height: '100%', color: 'transparent' },
  resendRow: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 },
  note: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginTop: 8 },
});
