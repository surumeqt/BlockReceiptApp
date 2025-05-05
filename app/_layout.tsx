import { SafeAreaProvider } from "react-native-safe-area-context";
import ClerkAndConvexProvider from "@/providers/ClerkAndConvexProvider"
import AuthNavigation from "@/components/AuthNavigation";
import SafeAreaAlias from "@/components/SafeAreaAlias";
import { StatusBar } from "expo-status-bar";
import './globals.css';

export default function RootLayout() {
  return (
    <ClerkAndConvexProvider>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#000"/>
        <SafeAreaAlias>
          <AuthNavigation />
        </SafeAreaAlias>
      </SafeAreaProvider>
    </ClerkAndConvexProvider>
  );
}
