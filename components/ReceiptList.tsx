import { View, Text, FlatList, Image, TouchableOpacity, Alert, ScrollView } from "react-native";
import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as Clipboard from "expo-clipboard";
import { ImageModal } from "@/components/ModalView";

const ReceiptList = ({ userId }: { userId: string }) => {
  const receipts = useQuery(api.UserReceipts.getByUser, { owner: userId });
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  if (!receipts) return <Text className="text-white">Loading...</Text>;
  if (receipts.length === 0) return <Text className="text-white">No scanned receipts yet.</Text>;

  const groupedReceipts: { [company: string]: typeof receipts } = {};
  receipts.forEach((receipt) => {
    if (!groupedReceipts[receipt.company]) {
      groupedReceipts[receipt.company] = [];
    }
    groupedReceipts[receipt.company].push(receipt);
  });

  if (selectedCompany !== null) {
    return (
      <View className="mt-4">
        <TouchableOpacity
          onPress={() => setSelectedCompany(null)}
          className="bg-[#004581] p-2 rounded-lg w-24 mb-4"
        >
          {/* <Image 
            source={backIcon}
            style={{ width: 20, height: 20, marginRight: 8 }}
            resizeMode="contain"
          /> */}
          <Text className="text-white text-lg">⬅ Back</Text>
        </TouchableOpacity>

        <FlatList
          data={groupedReceipts[selectedCompany]}
          numColumns={2}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View className="bg-[#DDE8F0] w-[45%] m-2 p-3 rounded-lg items-center space-y-4">
              {item.imageUrl ? (
                  <TouchableOpacity
                  onPress={() => {
                    setSelectedImageUrl(item.imageUrl);
                    setImageModalVisible(true);
                  }}
                >
                  <Image source={{ uri: item.imageUrl }} style={{ width: 130, height: 170, borderRadius: 8 }} />
                </TouchableOpacity>
              ) : (
                <Text className="text-gray-600 text-center mt-2">Image not available</Text>
              )}
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Transaction Hash",
                    item.txHash || "Not available",
                    [
                      {
                        text: "Copy",
                        onPress: async () => {
                          await Clipboard.setStringAsync(item.txHash || "Not available");
                          Alert.alert("Copied!", "Transaction hash copied to clipboard.");
                        },
                      },
                      { text: "Close", style: "cancel" },
                    ]
                  )
                }
                className="bg-[#004581] mt-3 py-2 px-4 rounded-lg w-full"
              >
                <Text className="text-white text-center font-semibold text-sm">🔗 View Tx</Text>
              </TouchableOpacity>
            </View>
          )}
        />
            <ImageModal
            visible={imageModalVisible}
            onClose={() => setImageModalVisible(false)}
            imageUrl={selectedImageUrl}
            />
      </View>
    );
  }

  return (
    <ScrollView className="space-y-4">
      {Object.keys(groupedReceipts).map((company) => (
        <TouchableOpacity
          key={company}
          onPress={() => setSelectedCompany(company)}
          className="bg-[#018ADB] rounded-2xl p-4 shadow-lg mt-4"
        >
          <Text className="text-xl font-bold text-[#DDE8F0]">{company} 📁</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default ReceiptList;
