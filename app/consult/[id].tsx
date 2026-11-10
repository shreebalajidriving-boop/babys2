import { router, useLocalSearchParams } from 'expo-router';
import { Mic, MicOff, PhoneOff, Video as VideoIcon, VideoOff } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { getDoctor } from '@/lib/doctors';
import { FONT, type Palette } from '@/lib/theme';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';

type Phase = 'waiting' | 'live' | 'ended';

// Demo content only: the video call is simulated and this summary is not a real prescription.
const DEMO_NOTES = [
  'Feeding looks on track. Keep offering small, frequent feeds.',
  'Monitor temperature every 4 hours and note any changes.',
  'Book a follow-up in 1 week if symptoms continue.',
];

export default function ConsultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, appointments, children } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const appointment = appointments.find((a) => a.id === id);
  const [phase, setPhase] = useState<Phase>('waiting');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (phase !== 'waiting') return;
    const timer = setTimeout(() => setPhase('live'), 3000);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'live') return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [phase]);

  if (!appointment || appointment.status !== 'confirmed' || appointment.mode !== 'online') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Video consult" />
        <EmptyState title="Consultation unavailable" message="Only confirmed online appointments can be joined." actionLabel="Back to Care" onAction={() => router.navigate('/care')} />
      </SafeAreaView>
    );
  }

  const doctor = getDoctor(appointment.doctorId);
  const child = children.find((c) => c.id === appointment.childId);
  const clock = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  if (phase === 'ended') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Consultation summary" />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{doctor?.name}</Text>
            <Text style={styles.meta}>
              {child?.name}  |  Call length {clock}
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Doctor's notes</Text>
            {DEMO_NOTES.map((note) => (
              <Text key={note} style={styles.note}>
                {'\u2022'}  {note}
              </Text>
            ))}
            <Text style={styles.disclaimer}>Demo summary. Not a real medical record.</Text>
          </View>
          <PrimaryButton label="Back to appointment" onPress={() => router.replace(`/appointment/${appointment.id}`)} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.room} edges={['top', 'bottom']}>
      <View style={styles.roomHeader}>
        <Text style={styles.roomTitle}>{doctor?.name}</Text>
        <Text style={styles.roomMeta}>
          {phase === 'waiting' ? 'Waiting room' : `Live  |  ${clock}`}
        </Text>
      </View>

      <View style={styles.stage}>
        {phase === 'waiting' ? (
          <View style={styles.waiting}>
            <Text style={styles.waitingTitle}>Your doctor will join shortly</Text>
            <Text style={styles.waitingBody}>Please keep this screen open. Your camera and microphone are ready.</Text>
          </View>
        ) : (
          <Image source={{ uri: doctor?.image }} style={styles.doctorVideo} />
        )}

        <View style={styles.selfTile}>
          {camOn ? (
            <Text style={styles.selfText}>{child?.name ?? 'You'}</Text>
          ) : (
            <VideoOff size={22} color="#FFFFFF" />
          )}
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable
          onPress={() => setMicOn((v) => !v)}
          style={[styles.control, !micOn && styles.controlOff]}
          accessibilityRole="button"
          accessibilityLabel={micOn ? 'Mute microphone' : 'Unmute microphone'}
        >
          {micOn ? <Mic size={22} color="#FFFFFF" /> : <MicOff size={22} color="#FFFFFF" />}
        </Pressable>
        <Pressable
          onPress={() => setCamOn((v) => !v)}
          style={[styles.control, !camOn && styles.controlOff]}
          accessibilityRole="button"
          accessibilityLabel={camOn ? 'Turn camera off' : 'Turn camera on'}
        >
          {camOn ? <VideoIcon size={22} color="#FFFFFF" /> : <VideoOff size={22} color="#FFFFFF" />}
        </Pressable>
        <Pressable
          onPress={() => setPhase('ended')}
          style={[styles.control, styles.end]}
          accessibilityRole="button"
          accessibilityLabel="End call"
        >
          <PhoneOff size={22} color="#FFFFFF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    room: { flex: 1, backgroundColor: '#15202E' },
    roomHeader: { paddingHorizontal: 20, paddingVertical: 12, gap: 2 },
    roomTitle: { fontFamily: FONT.bold, fontSize: 18, color: '#FFFFFF' },
    roomMeta: { fontFamily: FONT.semibold, fontSize: 13, color: '#CBD5E0' },
    stage: { flex: 1, marginHorizontal: 16, borderRadius: 20, overflow: 'hidden', backgroundColor: '#243247' },
    doctorVideo: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, width: '100%', height: '100%' },
    waiting: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
    waitingTitle: { fontFamily: FONT.bold, fontSize: 18, color: '#FFFFFF', textAlign: 'center' },
    waitingBody: { fontFamily: FONT.regular, fontSize: 14, color: '#CBD5E0', textAlign: 'center', lineHeight: 21 },
    selfTile: {
      position: 'absolute',
      right: 12,
      bottom: 12,
      width: 96,
      height: 128,
      borderRadius: 14,
      backgroundColor: '#1A2536',
      borderWidth: 1,
      borderColor: '#3D4F68',
      alignItems: 'center',
      justifyContent: 'center',
    },
    selfText: { fontFamily: FONT.semibold, fontSize: 13, color: '#FFFFFF' },
    controls: { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingVertical: 24 },
    control: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#334155',
      alignItems: 'center',
      justifyContent: 'center',
    },
    controlOff: { backgroundColor: '#64748B' },
    end: { backgroundColor: t.error },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 16 },
    card: { padding: 16, borderRadius: 18, backgroundColor: t.card, borderWidth: 1, borderColor: t.border, gap: 8 },
    cardTitle: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    meta: { fontFamily: FONT.regular, fontSize: 13, color: t.muted },
    note: { fontFamily: FONT.regular, fontSize: 14, color: t.ink, lineHeight: 21 },
    disclaimer: { fontFamily: FONT.semibold, fontSize: 12, color: t.muted, marginTop: 4 },
  });
}
