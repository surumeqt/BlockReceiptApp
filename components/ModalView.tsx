import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, Image } from "react-native";
// import { ethers } from "ethers";

// const provider = new ethers.JsonRpcProvider("http://10.0.2.2:8545");

const TransactionModal = ({ visible, onClose }: { visible: boolean; onClose: () => void}) => {
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // const verifyTransaction = async () => {
  //   setLoading(true);
  //   try {
  //     const receipt = await provider.getTransactionReceipt(txHash);
  //     if (receipt) {
  //       setTxStatus(`✅ Confirmed in Block: ${receipt.blockNumber}`);
  //     } else {
  //       setTxStatus("⏳ Transaction pending or not found.");
  //     }
  //   } catch (error) {
  //     setTxStatus("❌ Invalid transaction hash.");
  //   }
  //   setLoading(false);
  // };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-80 bg-white p-6 rounded-2xl shadow-md">
          <Text className="text-lg font-bold text-gray-900 mb-4">Verify Transaction</Text>

          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg mb-4"
            placeholder="Enter Transaction Hash"
            value={txHash}
            onChangeText={setTxHash}
            autoCapitalize="none"
          />

          <TouchableOpacity
            // onPress={verifyTransaction}
            // disabled={!txHash}
            className={`py-3 rounded-xl items-center ${txHash ? "bg-blue-500" : "bg-gray-300"}`}
          >
            <Text className="text-white font-semibold text-lg">
              {loading ? "Verifying..." : "Verify"}
            </Text>
          </TouchableOpacity>

          {txStatus && <Text className="mt-4 text-center text-lg">{txStatus}</Text>}

          <TouchableOpacity onPress={onClose} className="mt-1 items-center">
            <Text className="text-red-500 font-semibold text-lg">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const LogoutModal = ({ visible, onClose, handleLogout }: { visible: boolean; onClose: () => void; handleLogout: () => void }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-80 bg-white p-6 rounded-2xl shadow-md">
          <Text className="text-lg font-bold text-gray-1000 mb-4 text-center">Confirm Logout</Text>
          <Text className="text-gray-600 text-center mb-4">Are you sure you want to log out?</Text>

          <View className="flex-row justify-center mt-4">
            <TouchableOpacity onPress={onClose} className="bg-gray-300 py-3 px-6 rounded-lg">
              <Text className="text-gray-800 font-semibold text-lg">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout} className="bg-red-500 py-3 px-6 rounded-lg">
              <Text className="text-white font-semibold text-lg">Logout</Text>
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

