import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

const palette = {
  primary: '#018ADB', // Blue
  background: '#f0f0f0', // Light Gray
  icon: '#2c3e50', // Dark Gray
};

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: palette.background,
          borderTopWidth: 1,
          borderTopColor: '#ddd',
          height: 50,
        },
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.icon,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" color={color} size={30} />
          ),
        }}
      />
      <Tabs.Screen
        name="qrScan"
        options={{
          tabBarIcon: ({color}) => (
            <View style={[styles.circleButton, { backgroundColor: palette.background }]}>
              <Ionicons name="qr-code" color={color} size={40} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" color={color} size={30} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  circleButtonContainer: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 50,
  },
  circleButton: {
    width: 150,
    height: 100,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
});