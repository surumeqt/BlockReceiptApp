import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, Image, ActivityIndicator } from "react-native";
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
      <View className="flex-1 justify-center items-center bg-black/50">
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
              className={`py-3 rounded-xl items-center mb-4 ${
                loading ? "bg-gray-400" : "bg-[#018ADB]"
              }`}
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

          {txStatus && (
            <Text
              className={`mt-2 text-center text-base ${
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

          <TouchableOpacity
            onPress={onClose}
            className={`mt-4 items-center ${loading ? 'opacity-50' : ''}`}
            disabled={loading}
          >
            <Text className="text-[#DC3545] font-semibold text-lg">Close</Text>
          </TouchableOpacity>
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
      <View className="flex-1 justify-center items-center bg-black/50">
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
              className={`py-3 px-6 rounded-xl flex-1 items-center mx-2 ${
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

export { TransactionModal, LogoutModal, ImageModal };

