import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Switch } from '@/components/Controls';
import { ConfirmDialog, showToast } from '@/components/Feedback';
import { TextField } from '@/components/Field';
import { Card } from '@/components/Finance';
import { Icon, type IconName } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { Header, Screen } from '@/components/Screen';
import { Sheet } from '@/components/Sheet';
import { Txt } from '@/components/Txt';
import { shareCsv, transactionsCsv } from '@/lib/export';
import { formatTk, initials, isValidEmail, parseAmount, sanitizeAmountInput } from '@/lib/format';
import { error as hapticError, success } from '@/lib/haptics';
import { useCategoryMap, useWalletMap } from '@/lib/hooks';
import { useStore } from '@/store';
import { colors } from '@/theme';

function Section({ title, children, delay }: { title: string; children: ReactNode; delay: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(320)} style={{ gap: 6 }}>
      <Txt variant="small" weight="semibold" color={colors.muted} accessibilityRole="header" style={styles.sectionTitle}>
        {title.toUpperCase()}
      </Txt>
      <Card padded={false} style={{ paddingHorizontal: 16 }}>
        {children}
      </Card>
    </Animated.View>
  );
}

function LinkRow({ icon, label, value, onPress, first }: { icon?: IconName; label: string; value?: string; onPress: () => void; first?: boolean }) {
  return (
    <PressableScale accessibilityRole="button" accessibilityLabel={value ? `${label}, ${value}` : label} onPress={onPress} scaleTo={0.985} style={[styles.row, !first ? styles.rowBorder : null]}>
      {icon ? <Icon name={icon} size={20} color={colors.emerald} /> : null}
      <Txt variant="body" style={{ flex: 1, fontSize: 15 }}>
        {label}
      </Txt>
      {value ? (
        <Txt variant="body" color={colors.muted} style={{ fontSize: 15 }}>
          {value}
        </Txt>
      ) : null}
      <Icon name="chevronRight" size={18} color={colors.muted} />
    </PressableScale>
  );
}

function SwitchRow({ label, value, onChange, first }: { label: string; value: boolean; onChange: (v: boolean) => void; first?: boolean }) {
  return (
    <View style={[styles.row, !first ? styles.rowBorder : null]}>
      <Txt variant="body" style={{ flex: 1, fontSize: 15 }}>
        {label}
      </Txt>
      <Switch value={value} onChange={onChange} label={label} />
    </View>
  );
}

export default function Profile() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const settings = useStore((s) => s.settings);
  const wallets = useStore((s) => s.wallets);
  const categories = useStore((s) => s.categories);
  const txns = useStore((s) => s.transactions);
  const setSetting = useStore((s) => s.setSetting);
  const updateUser = useStore((s) => s.updateUser);
  const logOut = useStore((s) => s.logOut);
  const clearData = useStore((s) => s.clearData);
  const loadSample = useStore((s) => s.loadSampleData);
  const cats = useCategoryMap();
  const walletMap = useWalletMap();

  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [attempt, setAttempt] = useState(0);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [budget, setBudget] = useState(String(settings.monthlyBudget));
  const [confirm, setConfirm] = useState<null | 'logout' | 'clear'>(null);

  const saveProfile = () => {
    setAttempt((a) => a + 1);
    const e: typeof errors = {};
    if (name.trim().length < 2) e.name = 'Please enter your name.';
    if (!isValidEmail(email)) e.email = 'Enter a valid email.';
    setErrors(e);
    if (Object.keys(e).length) {
      hapticError();
      return;
    }
    updateUser({ name: name.trim(), email: email.trim().toLowerCase() });
    success();
    setEditOpen(false);
    showToast('Profile updated');
  };

  const toggleBiometric = async (v: boolean) => {
    if (v && Platform.OS !== 'web') {
      const [hw, enrolled] = await Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()]);
      if (!hw || !enrolled) {
        showToast('Set up a fingerprint or face in your phone settings first.', { icon: 'alert' });
        return;
      }
      const res = await LocalAuthentication.authenticateAsync({ promptMessage: 'Confirm to turn on fingerprint unlock' });
      if (!res.success) return;
    }
    setSetting('biometric', v);
  };

  return (
    <Screen header={<Header title="Profile & settings" />}>
      <Animated.View entering={FadeInDown.duration(320)}>
        <Card style={styles.profile}>
          <View style={styles.avatar}>
            <Txt variant="title" color={colors.forest} style={{ fontSize: 20 }}>
              {initials(user?.name ?? '')}
            </Txt>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Txt variant="title" numberOfLines={1}>
              {user?.name}
            </Txt>
            <Txt variant="label" color={colors.muted} numberOfLines={1} style={{ fontFamily: 'Outfit_400Regular' }}>
              {user?.email}
            </Txt>
          </View>
          <Button
            label="Edit"
            variant="soft"
            size="md"
            onPress={() => {
              setName(user?.name ?? '');
              setEmail(user?.email ?? '');
              setErrors({});
              setEditOpen(true);
            }}
          />
        </Card>
      </Animated.View>

      <Section title="Money" delay={60}>
        <View style={[styles.row]} accessible accessibilityLabel="Currency, Bangladeshi Taka">
          <Txt variant="label" weight="semibold" color={colors.emerald} style={{ width: 20, textAlign: 'center' }}>
            Tk
          </Txt>
          <Txt variant="body" style={{ flex: 1, fontSize: 15 }}>
            Currency
          </Txt>
          <Txt variant="body" color={colors.muted} style={{ fontSize: 15 }}>
            Bangladeshi Taka
          </Txt>
        </View>
        <LinkRow icon="target" label="Monthly budget" value={formatTk(settings.monthlyBudget, { decimals: false })} onPress={() => { setBudget(String(settings.monthlyBudget)); setBudgetOpen(true); }} />
        <LinkRow icon="wallet" label="Wallets" value={`${wallets.length}`} onPress={() => router.push('/wallets')} />
        <LinkRow icon="grid" label="Categories" value={`${categories.length}`} onPress={() => router.push('/categories')} />
      </Section>

      <Section title="Alerts & security" delay={120}>
        <SwitchRow first label="Budget alerts" value={settings.budgetAlerts} onChange={(v) => setSetting('budgetAlerts', v)} />
        <SwitchRow label="Bill reminders" value={settings.billReminders} onChange={(v) => setSetting('billReminders', v)} />
        <SwitchRow label="Unlock with fingerprint" value={settings.biometric} onChange={toggleBiometric} />
      </Section>

      <Section title="Data" delay={180}>
        <LinkRow
          first
          icon="download"
          label="Export all transactions"
          value="CSV"
          onPress={async () => {
            await shareCsv(transactionsCsv(txns, cats, walletMap));
            showToast(`${txns.length} transactions exported`, { icon: 'download' });
          }}
        />
        <LinkRow
          icon="star"
          label="Load sample data"
          onPress={() => {
            loadSample();
            success();
            showToast('Sample data loaded');
          }}
        />
        <LinkRow icon="trash" label="Clear all data" onPress={() => setConfirm('clear')} />
      </Section>

      <Animated.View entering={FadeInDown.delay(240).duration(320)}>
        <Button label="Log out" icon="logout" variant="danger" onPress={() => setConfirm('logout')} />
      </Animated.View>
      <Txt variant="caption" color={colors.muted} align="center">
        fintracker 1.0 · Your data is stored on this device.
      </Txt>

      <Sheet visible={editOpen} onClose={() => setEditOpen(false)} title="Edit profile" footer={<Button label="Save" onPress={saveProfile} />}>
        <TextField label="Full name" icon="user" value={name} onChangeText={setName} error={errors.name} shakeKey={attempt} autoCapitalize="words" />
        <TextField label="Email" icon="mail" value={email} onChangeText={setEmail} error={errors.email} shakeKey={attempt} keyboardType="email-address" autoCapitalize="none" />
      </Sheet>

      <Sheet
        visible={budgetOpen}
        onClose={() => setBudgetOpen(false)}
        title="Monthly budget"
        footer={
          <Button
            label="Save budget"
            disabled={parseAmount(budget) <= 0}
            onPress={() => {
              setSetting('monthlyBudget', parseAmount(budget));
              success();
              setBudgetOpen(false);
              showToast('Monthly budget updated');
            }}
          />
        }>
        <TextField label="Total you plan to spend each month" prefix="Tk" keyboardType="decimal-pad" value={budget} onChangeText={(t) => setBudget(sanitizeAmountInput(t))} autoFocus />
      </Sheet>

      <ConfirmDialog
        visible={confirm === 'logout'}
        title="Log out?"
        message="Your data stays on this device, so you can pick up where you left off when you log back in."
        confirmLabel="Log out"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          setConfirm(null);
          logOut();
        }}
      />
      <ConfirmDialog
        visible={confirm === 'clear'}
        title="Clear all data?"
        message="This removes every transaction, budget, goal and notification. Wallets and categories stay. This can’t be undone."
        confirmLabel="Clear data"
        destructive
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          setConfirm(null);
          clearData();
          showToast('All data cleared', { icon: 'trash' });
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { marginHorizontal: 4, letterSpacing: 0.5 },
  row: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.divider },
});

