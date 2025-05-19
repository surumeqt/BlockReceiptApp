import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-between bg-[#004581] px-6 py-20">
      <View className="items-center mt-20">
        <Text className="text-4xl text-[#DDE8F0] font-monda font-bold">Block Receipt</Text>
        <Text className="text-xl text-[#DDE8F0] text-center font-monda mt-4">
          Verifiable Receipts for{'\n'}Small Businesses
        </Text>
        <Text className="text-lg text-[#DDE8F0] mt-10 text-center italic font-monda">
          "From Paper to Proof – Reinventing Receipts"
        </Text>
      </View>

      <View className="items-center">
        <TouchableOpacity 
          onPress={() => router.replace('/signUp')} 
          className="bg-[#018ADB] px-12 py-6 rounded-2xl shadow-lg active:scale-95"
        >
          <Text className="text-[#DDE8F0] text-xl font-monda font-semibold">Get Started</Text> 
        </TouchableOpacity>
      </View>
    </View>
  );
}
