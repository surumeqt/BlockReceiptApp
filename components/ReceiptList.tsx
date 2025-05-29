import { DateFilterModal, ImageModal } from "@/components/ModalView";
import { api } from "@/convex/_generated/api";
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from "convex/react";
import * as Clipboard from "expo-clipboard";
import React, { useState, useEffect } from "react";
import { Alert, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const ReceiptList = ({ userId }: { userId: string }) => {
  const [selectedFilterDate, setSelectedFilterDate] = useState<string | null>(null);
  const uniqueDates = useQuery(api.UserReceipts.getUniqueReceiptDatesByUser, { owner: userId });

  const queryArgs =
    selectedFilterDate !== null
      ? { owner: userId, selectedDate: selectedFilterDate }
      : { owner: userId };

  const queryFunction =
    selectedFilterDate !== null
      ? api.UserReceipts.getByUserAndSingleDay
      : api.UserReceipts.getByUser;

  const receipts = useQuery(
    queryFunction,
    queryArgs
  );

  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [dateFilterModalVisible, setDateFilterModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCompany === null) {
      setSelectedFilterDate(null);
    }
  }, [selectedCompany]);

  if (receipts === undefined || uniqueDates === undefined) {
    console.log("⌛ [ReceiptList] Still loading data...");
    return <Text className="text-white">Loading...</Text>;
  }

  if (receipts.length === 0 && selectedFilterDate !== null) {
    return (
      <View className="mt-1 flex-1">
        <Text className="text-2xl font-bold text-[#DDE8F0]">{selectedCompany || "Receipts"}</Text>
        <View className="flex-row items-center justify-between mt-4">
          <TouchableOpacity
            onPress={() => setSelectedCompany(null)}
            className="p-2 flex-row items-center gap-2"
          >
            <AntDesign name="leftcircle" size={24} color="white" />
            <Text className="text-white text-lg">Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setDateFilterModalVisible(true)}
            className="p-2 flex-row items-center gap-2"
          >
            <FontAwesome name="filter" size={24} color="white" />
            <Text className="text-white text-lg">filter</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-white text-center mt-8 text-lg">
          No receipts found for {selectedFilterDate}.
        </Text>
        <DateFilterModal
          visible={dateFilterModalVisible}
          onClose={() => setDateFilterModalVisible(false)}
          onApplyFilter={(dateString) => {
            setSelectedFilterDate(dateString);
            setDateFilterModalVisible(false);
          }}
          initialSelectedDate={selectedFilterDate}
          availableDates={uniqueDates}
        />
      </View>
    );
  }

  if (receipts.length === 0) {
    return <Text className="text-white">No scanned receipts yet.</Text>;
  }

  const groupedReceipts: { [company: string]: typeof receipts } = {};
  receipts.forEach((receipt) => {
    if (!groupedReceipts[receipt.company]) {
      groupedReceipts[receipt.company] = [];
    }
    groupedReceipts[receipt.company].push(receipt);
  });

  if (selectedCompany !== null) {
    if (!groupedReceipts[selectedCompany] || groupedReceipts[selectedCompany].length === 0) {
      return (
        <View className="mt-1 flex-1">
          <Text className="text-2xl font-bold text-[#DDE8F0]">{selectedCompany}</Text>
          <View className="flex-row items-center justify-between mt-4">
            <TouchableOpacity
              onPress={() => setSelectedCompany(null)}
              className="p-2 flex-row items-center gap-2"
            >
              <AntDesign name="leftcircle" size={24} color="white" />
              <Text className="text-white text-lg">Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDateFilterModalVisible(true)}
              className="p-2 flex-row items-center gap-2"
            >
              <FontAwesome name="filter" size={24} color="white" />
              <Text className="text-white text-lg">filter</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-white text-center mt-8 text-lg">
            No receipts found for "{selectedCompany}" for {selectedFilterDate || 'the selected date'}.
          </Text>
          <DateFilterModal
            visible={dateFilterModalVisible}
            onClose={() => setDateFilterModalVisible(false)}
            onApplyFilter={(dateString) => {
              setSelectedFilterDate(dateString);
              setDateFilterModalVisible(false);
            }}
            initialSelectedDate={selectedFilterDate}
            availableDates={uniqueDates}
          />
        </View>
      );
    }

    return (
      <View className="mt-1 flex-1">
        <Text className="text-2xl font-bold text-[#DDE8F0]">{selectedCompany}</Text>

        <View className="flex-row items-center justify-between mt-4">
          <TouchableOpacity
            onPress={() => setSelectedCompany(null)}
            className="p-2 flex-row items-center gap-2"
          >
            <AntDesign name="leftcircle" size={24} color="white" />
            <Text className="text-white text-lg">Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setDateFilterModalVisible(true)}
            className="p-2 flex-row items-center gap-2"
          >
            <FontAwesome name="filter" size={24} color="white" />
            <Text className="text-white text-lg">filter</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={groupedReceipts[selectedCompany]}
          numColumns={2}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View className="p-2 rounded-lg items-center mt-4"
            style={{ width: 160, height: 210}}
            >
              {item.imageUrl ? (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedImageUrl(item.imageUrl);
                    setImageModalVisible(true);
                  }}
                >
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={{ width: 130, height: 170, borderRadius: 8 }}
                  />
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
                className="mt-3 py-2 px-4 rounded-lg w-full"
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
        <DateFilterModal
          visible={dateFilterModalVisible}
          onClose={() => setDateFilterModalVisible(false)}
          onApplyFilter={(dateString) => {
            setSelectedFilterDate(dateString);
            setDateFilterModalVisible(false);
          }}
          initialSelectedDate={selectedFilterDate}
          availableDates={uniqueDates}
        />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 space-y-4">
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