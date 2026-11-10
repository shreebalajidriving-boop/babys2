import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { FONT, type Palette } from '@/lib/theme';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';

const CITIES = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune'];
const DEMO_OTP = '1234';

type Step = 'city' | 'phone' | 'otp';
const STEPS: Step[] = ['city', 'phone', 'otp'];

export default function LoginScreen() {
  const { theme, signIn } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [step, setStep] = useState<Step>('city');
  const [city, setCity] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);

  const back = () => {
    setError(null);
    if (step === 'city') router.back();
    else setStep(step === 'otp' ? 'phone' : 'city');
  };

  const sendOtp = () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    setError(null);
    setStep('otp');
  };

  const verify = () => {
    if (otp !== DEMO_OTP) {
      setError(`That code is not right. In demo mode, use ${DEMO_OTP}.`);
      return;
    }
    if (!city) return;
    signIn(phone, city);
    router.replace('/setup');
  };

  const titles: Record<Step, { title: string; subtitle: string }> = {
    city: { title: 'Where are you?', subtitle: 'We show delivery, doctors and services available in your city.' },
    phone: { title: 'Your mobile number', subtitle: 'We will send a one-time code to verify it is you.' },
    otp: { title: 'Enter the code', subtitle: `We sent a 4-digit code to +91 ${phone}.` },
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Sign in" onBack={back} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.progress}>
          {STEPS.map((s, i) => (
            <View key={s} style={[styles.progressBar, i <= STEPS.indexOf(step) && styles.progressActive]} />
          ))}
        </View>

        <View style={styles.heading}>
          <Text style={styles.title}>{titles[step].title}</Text>
          <Text style={styles.subtitle}>{titles[step].subtitle}</Text>
        </View>

        {step === 'city' ? (
          <View style={styles.cityList}>
            {CITIES.map((name) => {
              const active = city === name;
              return (
                <Pressable
                  key={name}
                  onPress={() => setCity(name)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={[styles.cityRow, active && { borderColor: theme.strong, backgroundColor: theme.secondary }]}
                >
                  <Text style={styles.cityText}>{name}</Text>
                  {active ? <Check size={18} color={theme.strong} /> : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {step === 'phone' ? (
          <View style={styles.inputRow}>
            <View style={styles.prefix}>
              <Text style={styles.prefixText}>+91</Text>
            </View>
            <TextInput
              value={phone}
              onChangeText={(v) => setPhone(v.replace(/\D/g, '').slice(0, 10))}
              keyboardType="number-pad"
              placeholder="98765 43210"
              placeholderTextColor={theme.muted}
              style={styles.input}
              maxLength={10}
            />
          </View>
        ) : null}

        {step === 'otp' ? (
          <TextInput
            value={otp}
            onChangeText={(v) => setOtp(v.replace(/\D/g, '').slice(0, 4))}
            keyboardType="number-pad"
            placeholder="0000"
            placeholderTextColor={theme.muted}
            style={[styles.input, styles.otpInput]}
            maxLength={4}
            autoFocus
          />
        ) : null}

        {step === 'otp' ? <Text style={styles.hint}>Demo mode: use code {DEMO_OTP}.</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        {step === 'city' ? (
          <PrimaryButton label="Continue" disabled={!city} onPress={() => setStep('phone')} />
        ) : null}
        {step === 'phone' ? <PrimaryButton label="Send code" onPress={sendOtp} /> : null}
        {step === 'otp' ? (
          <>
            <PrimaryButton label="Verify and continue" disabled={otp.length !== 4} onPress={verify} />
            <Pressable onPress={() => setStep('phone')} style={styles.linkRow} accessibilityRole="button">
              <Text style={styles.link}>Change number</Text>
            </Pressable>
          </>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24, gap: 24 },
    progress: { flexDirection: 'row', gap: 8 },
    progressBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: t.border },
    progressActive: { backgroundColor: t.strong },
    heading: { gap: 8 },
    title: { fontFamily: FONT.bold, fontSize: 26, color: t.ink, lineHeight: 32 },
    subtitle: { fontFamily: FONT.regular, fontSize: 15, color: t.muted, lineHeight: 22 },
    cityList: { gap: 10 },
    cityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 56,
      paddingHorizontal: 18,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.card,
    },
    cityText: { fontFamily: FONT.semibold, fontSize: 16, color: t.ink },
    inputRow: { flexDirection: 'row', gap: 10 },
    prefix: {
      justifyContent: 'center',
      paddingHorizontal: 16,
      borderRadius: 14,
      backgroundColor: t.secondary,
    },
    prefixText: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    input: {
      flex: 1,
      minHeight: 56,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.card,
      paddingHorizontal: 16,
      fontFamily: FONT.semibold,
      fontSize: 18,
      color: t.ink,
      letterSpacing: 1,
    },
    otpInput: { flex: 0, width: 180, alignSelf: 'center', textAlign: 'center', fontSize: 26 },
    hint: { fontFamily: FONT.regular, fontSize: 13, color: t.muted, textAlign: 'center' },
    error: { fontFamily: FONT.semibold, fontSize: 14, color: t.error, textAlign: 'center' },
    footer: { paddingHorizontal: 24, paddingVertical: 16, gap: 12 },
    linkRow: { alignItems: 'center', paddingVertical: 8 },
    link: { fontFamily: FONT.semibold, fontSize: 15, color: t.strong },
  });
}
