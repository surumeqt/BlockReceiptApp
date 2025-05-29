import { ActivityIndicator, Alert, Image, Modal, Text, TextInput, TouchableOpacity, View, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import CustomDropdown from "./CustomDropdown";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/0f2b412917604f378b52068c34bb9f4d");

const TransactionModal = ({ visible, onClose }: { visible: boolean; onClose: () => void}) => {
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<string | null>(null);

   useEffect(() => {
    if (!visible) {
      setTxHash("");
      setTxStatus(null);
      setLoading(false);
    }
  }, [visible]);

  const verifyTransaction = async () => {
    setLoading(true);
    setTxStatus(null);

    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        setTxStatus("⏳ Transaction is still pending or not found.");
      } else if (receipt.status === 1) {
        setTxStatus(`✅ Transaction confirmed in block #${receipt.blockNumber}`);
      } else {
        setTxStatus("❌ Transaction failed.");
      }
    } catch (error) {
      setTxStatus("❌ Invalid transaction hash or network error.");
    }
    setLoading(false);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
        >
        <View className="w-80 bg-white p-6 rounded-2xl shadow-md">
          <Text className="text-xl font-bold text-[#333333] mb-4 text-center">
            Verify Transaction
          </Text>

          <TextInput
            className="w-full p-3 border border-[#CCCCCC] rounded-lg mb-4 text-[#333333]"
            placeholder="Enter Transaction Hash"
            placeholderTextColor="#999999"
            value={txHash}
            onChangeText={setTxHash}
            autoCapitalize="none"
            editable={!loading}
          />

          {txHash.length > 0 && (
            <TouchableOpacity
              onPress={verifyTransaction}
              disabled={loading}
              className={`py-3 items-center mb-2 ${
                loading ? "bg-[#018ADB]" : "bg-[#018ADB]"
              }`}
              style={{ borderRadius: 15 }}
            >
              <Text className="text-white font-semibold text-lg">
                {loading ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  "Verify"
                )}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={onClose}
            className="py-3 px-4 rounded-2xl"
            style={{ backgroundColor: '#ff0000' }}
          >
            <Text className="text-white font-semibold text-lg text-center">Close</Text>
          </TouchableOpacity>

          {txStatus && txHash.length > 0 && (
            <Text
              className={`mt-6 text-center text-base ${
                txStatus.startsWith("✅")
                  ? "text-[#28A745]"
                  : txStatus.startsWith("❌")
                  ? "text-[#DC3545]"
                  : "text-[#FFC107]"
              }`}
            >
              {txStatus}
            </Text>
          )}

        </View>
      </View>
    </Modal>
  );
};

const LogoutModal = ({ visible, onClose, handleLogout }: { visible: boolean; onClose: () => void; handleLogout: () => void }) => {
  const [loading, setLoading] = useState(false);
  const handleLogoutClick = () => {
    setLoading(true);
    handleLogout();
    setLoading(false);
  }
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
        <View className="w-80 bg-white p-6 rounded-2xl shadow-md">
          <Text className="text-xl font-bold text-[#333333] mb-4 text-center font-monda">
            Confirm Logout
          </Text>
          <Text className="text-[#333333] text-center mb-6 font-monda">
            Are you sure you want to log out?
          </Text>

          <View className="flex-row justify-center mt-4">
            <TouchableOpacity
              onPress={onClose}
              className={`py-3 px-6 rounded-xl flex-1 items-center mx-2 ${
                loading ? 'bg-gray-400' : 'bg-gray-300'
              }`}
              disabled={loading}
            >
              <Text className="text-[#333333] font-semibold text-lg font-monda">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogoutClick}
              className={`py-3 px-6 rounded-2xl flex-1 items-center mx-2 ${
                loading ? 'bg-red-400' : 'bg-[#DC3545]'
              }`}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-semibold text-lg font-monda">Logout</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const ImageModal = ({
  visible,
  onClose,
  imageUrl,
}: {
  visible: boolean;
  onClose: () => void;
  imageUrl: string | null;
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.8)" }}>
        <TouchableOpacity
          style={{ position: "absolute", top: 100, right: 20, zIndex: 10 }}
          onPress={onClose}
        >
          <Text style={{ color: "white", fontSize: 28 }}>✕</Text>
        </TouchableOpacity>

        <View style={{ width: "90%", height: "60%", backgroundColor: "white", borderRadius: 16, overflow: "hidden", justifyContent: "center", alignItems: "center" }}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          ) : (
            <Text style={{ color: "#333" }}>Image not available</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const AnalyticsModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const { user } = useUser();
  const currentUserId = user?.id || "";

  const analytics = useQuery(api.UserReceipts.getAnalytics, { owner: currentUserId });

  const isLoading = analytics === undefined;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
        <View className="w-11/12 max-w-sm bg-white p-6 rounded-2xl shadow-xl justify-between items-center">
          <View className="items-center mb-4 mt-8">
            <Text className="text-2xl font-bold text-[#333333] text-center font-monda">Analytics</Text>
            <Text>---------------------------------------------------------</Text>
          </View>

          <View className="justify-center items-center mb-4">
            {isLoading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <Text className="text-lg text-[#333333] text-left font-monda italic"
              numberOfLines={6}
              ellipsizeMode="tail"
              >
                Total Number of Receipts: <Text className="font-bold underline">{analytics.totalReceipts}</Text> {'\n'}
                Total Amount Spent: <Text className="font-bold underline">₱ {analytics.totalSpent.toFixed(2)}</Text> {'\n'}
                Average Amount per Receipt: <Text className="font-bold underline">₱ {analytics.averageAmount.toFixed(2)}</Text> {'\n'}
                Most Common Category: <Text className="font-bold underline">{analytics.mostCommonCategory}</Text> {'\n'}
                Most Common Merchant: {'\n'} <Text className="font-bold underline">{analytics.mostCommonMerchant}</Text>
              </Text>
            )}
          </View>

          <Text>---------------------------------------------------------</Text>

          <TouchableOpacity
            onPress={onClose}
            className="py-3 px-4 rounded-2xl"
            style={{ backgroundColor: '#ff0000', width: 100, marginTop: 20, height: 50 }}
          >
            <Text className="text-white font-semibold text-lg text-center">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const ResetPasswordModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const { user } = useUser()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const updatePassword = async () => {
    if (!user) return

    setLoading(true)
    try {
      await user.updatePassword({
        currentPassword,
        newPassword,
      })
      Alert.alert('Success', 'Password updated successfully.')
      setError('')
      setCurrentPassword('')
      setNewPassword('')
      onClose()
    } catch (err: any) {
      console.error(err)
      setError(err.errors?.[0]?.longMessage || 'Password update failed.')
    }
    setLoading(false)
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
        <View className="w-80 bg-white p-6 rounded-2xl shadow-xl">
          <Text className="text-2xl font-bold text-[#333333] text-center mb-4">
            Change Password
          </Text>

          <TextInput
            className="p-3 border border-[#CCCCCC] rounded-lg mb-2 text-[#333333]"
            placeholder="Current password"
            placeholderTextColor="#999999"
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TextInput
            className="p-3 border border-[#CCCCCC] rounded-lg mb-2 text-[#333333]"
            placeholder="New password"
            placeholderTextColor="#999999"
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <TouchableOpacity
            onPress={updatePassword}
            disabled={loading}
            className="py-3 px-4 rounded-2xl mt-4"
            style={{ backgroundColor: loading ? '#ccc' : '#018ADB' }}
          >
            <Text className="text-white font-semibold text-lg text-center">
              {loading ? 'Updating...' : 'Update Password'}
            </Text>
          </TouchableOpacity>

          {error && (
            <Text className="text-red-600 text-center mt-4 font-semibold">{error}</Text>
          )}

          <TouchableOpacity
            onPress={onClose}
            className="py-3 px-4 rounded-2xl"
            style={{ backgroundColor: '#ff0000', marginTop: 10 }}
          >
            <Text className="text-white font-semibold text-lg text-center">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const DateFilterModal = ({ visible, onClose, onApplyFilter, initialSelectedDate, availableDates } : { 
  visible: boolean; 
  onClose: () => void;
  onApplyFilter: (selectedDate: string | null) => void;
  initialSelectedDate: string | null; 
  availableDates: string[];
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(initialSelectedDate);

  const applyFilter = () => {
    onApplyFilter(selectedDate);
    onClose();
  };

  const clearFilter = () => {
    setSelectedDate(null);
    onApplyFilter(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
      >
        <View className="w-80 max-h-[80%] bg-white p-6 rounded-2xl shadow-lg">
          <ScrollView>
            <Text className="text-2xl font-bold text-[#333333] text-center mb-5">
              Filter by Date
            </Text>

            {availableDates.length > 0 ? (
              <CustomDropdown
                label="Select a Date:"
                options={availableDates}
                selectedValue={selectedDate}
                onValueChange={setSelectedDate}
                placeholder="-- Select Date --"
              />
            ) : (
              <Text className="text-base text-gray-500 text-center mb-5">No dates available to filter.</Text>
            )}

            <TouchableOpacity
              onPress={applyFilter}
              className="py-3 px-4 rounded-2xl mb-2 bg-[#018ADB]"
            >
              <Text className="text-white font-semibold text-lg text-center">Apply Filter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={clearFilter}
              className="py-3 px-4 rounded-2xl mb-2"
              style={{backgroundColor: '#FFC107'}}
            >
              <Text className="text-white font-semibold text-lg text-center">Clear Filter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              className="py-3 px-4 rounded-2xl"
              style={{ backgroundColor: '#ff0000' }}
            >
              <Text className="text-white font-semibold text-lg text-center">Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export { AnalyticsModal, DateFilterModal, ImageModal, LogoutModal, ResetPasswordModal, TransactionModal };