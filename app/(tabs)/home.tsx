import React from "react";
import { View, Text } from "react-native";
import ReceiptList from "@/components/ReceiptList";
import { useUser } from "@clerk/clerk-expo";

export default function HomeScreen() {
  const { user } = useUser();

  if (!user) {
     return (
      <View className="flex-1 justify-center items-center bg-[#004581]">
        <Text className="text-lg text-[#DDE8F0]">You must be logged in.</Text>
      </View>
    );
  }

  const userId = user.id || "";
  const username = user.fullName;

  return (
    <View className="flex-1 p-6 bg-[#004581]">
      <Text className="text-2xl font-bold text-[#DDE8F0] mb-4">
        Welcome, {username} !
      </Text>
      <ReceiptList userId={userId} />
    </View>
  );
};

