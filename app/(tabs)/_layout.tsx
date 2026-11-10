import { Tabs } from 'expo-router';
import { BookOpen, HeartPulse, Home, ShoppingBag, User } from 'lucide-react-native';
import { useApp } from '@/lib/AppContext';

export default function TabLayout() {
  const { theme } = useApp();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.strong,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: { backgroundColor: theme.card, borderTopColor: theme.border },
        tabBarLabelStyle: { fontSize: 12, fontFamily: 'Nunito-SemiBold' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Home size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="shop"
        options={{ title: 'Shop', tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="care"
        options={{ title: 'Care', tabBarIcon: ({ color, size }) => <HeartPulse size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="learn"
        options={{ title: 'Learn', tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <User size={size} color={color} /> }}
      />
    </Tabs>
  );
}
