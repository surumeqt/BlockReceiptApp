import { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { TransactionModal, LogoutModal } from "@/components/ModalView";

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
    <View className="flex-1 bg-gray-100">
      <View className="bg-white p-6 shadow-md rounded-b-2xl items-center">
        <Text className="text-2xl font-bold text-gray-900 font-monda">{user?.fullName}</Text>
        <View className="flex-row items-center space-x-2 mt-1">
          <Text className="font-bold text-dark-900 font-monda">{user?.primaryEmailAddress?.emailAddress} ✅</Text>
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
