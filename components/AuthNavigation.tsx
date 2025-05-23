import { View, ActivityIndicator, Image } from 'react-native'
import { Stack, useRouter } from "expo-router"
import { useAuth } from "@clerk/clerk-expo"
import { useEffect } from 'react'

export default function AuthNavigation() {
    const { isLoaded, isSignedIn } = useAuth();
    const router = useRouter();
  
    useEffect(() => {
      if (!isLoaded) return;
  
        if (isSignedIn) {
          console.log("✅ User is signed in, redirecting to home...");
          router.replace("/(tabs)/home");
        } else if (!isSignedIn) {
          console.log("🔒 User is not signed in, redirecting to auth...");
          router.replace("/(auth)");
        }
    }, [isLoaded, isSignedIn]);
  
    if (!isLoaded) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#004581" }}>
          <Image 
            source={require("../assets/images/icon.png")}
            style={{
              resizeMode: 'contain',
              borderRadius: 8,
              marginBottom: 20,
              width: 300,
              height: 300,
            }}
          />
          <ActivityIndicator size="large" color="#000" />
        </View>
      );
    }
  
    return <Stack screenOptions={{ headerShown: false }} />;
}