import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-[#004581] px-6">
      <Text className="text-4xl text-[#DDE8F0] font-monda font-bold">Block Receipt</Text>

      <Text className="text-lg text-[#DDE8F0] mt-2 text-center font-monda">
        Digitalized Your Receipt.
      </Text>

      <TouchableOpacity 
        onPress={() => router.push('/signUp')} 
        className="mt-8 bg-[#018ADB] px-6 py-3 rounded-2xl shadow-lg active:scale-95"
      >
        <Text className="text-[#DDE8F0] text-xl font-monda font-semibold">Get Started</Text> 
      </TouchableOpacity>
    </View>
  );
}
