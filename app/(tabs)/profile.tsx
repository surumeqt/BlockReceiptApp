import { useState } from "react";
import { View, TouchableOpacity, Text, Image } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { TransactionModal, LogoutModal } from "@/components/ModalView";
import { Ionicons } from "@expo/vector-icons";

export default function Profile() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const [txModalVisible, setTxModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("❌ Logout failed:", error);
    }
  };

  return (
    <View className="flex-1 bg-[#004581] p-6">
      <View className="bg-white p-12 shadow-md rounded-2xl items-center">
        <Image 
          source={{ uri: user?.imageUrl}}
          className="w-24 h-24 rounded-full border-2 border-blue-500"
          alt="Profile Picture"
          resizeMode="cover"
        />
        <View className="flex-col items-center space-x-2 mt-1">
          <Text className="text-2xl font-bold text-gray-900 font-monda">{user?.fullName}</Text>
          <Text className="font-bold text-dark-900 font-monda">{user?.primaryEmailAddress?.emailAddress} 
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          </Text>
        </View>
      </View>

      <View className="w-full mt-6 p-6 bg-white rounded-2xl shadow-md">
        <TouchableOpacity onPress={() => setTxModalVisible(true)} className="bg-blue-500 py-3 rounded-2xl items-center">
          <Text className="text-white font-semibold text-lg">Verify Transaction</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setLogoutModalVisible(true)} className="bg-red-500 py-3 rounded-2xl items-center mt-4">
          <Text className="text-white font-semibold text-lg">Logout</Text>
        </TouchableOpacity>
      </View>

      <TransactionModal visible={txModalVisible} onClose={() => setTxModalVisible(false)} />
      <LogoutModal visible={logoutModalVisible} onClose={() => setLogoutModalVisible(false)} handleLogout={handleLogout} />
    </View>
  );
}
