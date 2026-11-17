import { Tabs } from 'expo-router';
import { BookOpenCheck, CircleUserRound, HeartPulse, House, ShoppingBag } from 'lucide-react-native';
import { Platform, StyleSheet } from 'react-native';
import { useApp } from '@/lib/AppContext';
import { FONT } from '@/lib/theme';

export default function TabLayout() {
  const { theme } = useApp();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.strong,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.OS === 'web' ? 64 : undefined,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'web' ? 10 : undefined,
        },
        tabBarLabelStyle: { fontSize: 11, fontFamily: FONT.semibold, marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <House size={size} color={color} strokeWidth={2.25} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} strokeWidth={2.25} />,
        }}
      />
      <Tabs.Screen
        name="care"
        options={{
          title: 'Doctors',
          tabBarIcon: ({ color, size }) => <HeartPulse size={size} color={color} strokeWidth={2.25} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, size }) => <BookOpenCheck size={size} color={color} strokeWidth={2.25} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <CircleUserRound size={size} color={color} strokeWidth={2.25} />,
        }}
      />
    </Tabs>
  );
}
