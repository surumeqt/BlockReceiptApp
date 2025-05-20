import { useState } from "react";
import { View, TouchableOpacity, Text, Image, Alert } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { TransactionModal, LogoutModal } from "@/components/ModalView";
import { Ionicons } from "@expo/vector-icons";

export default function Profile() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const [txModalVisible, setTxModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const getClerkErrorMessage = (err: any) => {
    if (err?.errors && err.errors.length > 0) {
      const { message, meta } = err.errors[0];
      const field = meta?.paramName ? meta.paramName.replace(/_/g, ' ') : null;

      return field ? `${field.charAt(0).toUpperCase() + field.slice(1)} ${message}` : message;
    }

    return "Something went wrong. Please try again.";
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      const errorMsg = getClerkErrorMessage(error);
      Alert.alert("Logout Error", errorMsg);
    }
  };

  return (
    <View className="flex-1 bg-[#004581] p-6">
      <View className="bg-white p-12 shadow-md rounded-2xl items-center">
        <Image
          source={{ uri: user?.imageUrl }}
          className="w-24 h-24 rounded-full border-2 border-[#018ADB]"
          alt="Profile Picture"
          resizeMode="cover"
        />
        <View className="flex-col items-center space-x-2 mt-1">
          <Text className="text-2xl font-bold text-[#333333] font-monda">
            {user?.fullName}
          </Text>
          <View className="flex-row items-center">
            <Text
              className="font-bold text-[#333333] font-monda"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
            <Ionicons name="checkmark-circle" size={20} color="#28A745" />
          </View>
        </View>
      </View>

      <View className="w-full mt-6 p-6 bg-white rounded-2xl shadow-md">
        <TouchableOpacity
          onPress={() => setTxModalVisible(true)}
          className="bg-[#018ADB] py-3 rounded-2xl items-center"
        >
          <Text className="text-white font-semibold text-lg font-monda">
            Verify Transaction
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setLogoutModalVisible(true)}
          className="bg-[#DC3545] py-3 rounded-2xl items-center mt-4"
        >
          <Text className="text-white font-semibold text-lg font-monda">Logout</Text>
        </TouchableOpacity>
      </View>

      <TransactionModal visible={txModalVisible} onClose={() => setTxModalVisible(false)} />
      <LogoutModal visible={logoutModalVisible} onClose={() => setLogoutModalVisible(false)} handleLogout={handleLogout} />
    </View>
  );
}