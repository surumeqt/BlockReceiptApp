import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/clerk-expo";
import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system";
import { registerReceiptOnChain } from "@/utils/blockchain";
import { captureRef } from "react-native-view-shot";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ReceiptPreview = () => {
  const { user } = useUser();
  const userId = user?.id ?? "";
  const { receiptId } = useLocalSearchParams<{ receiptId: string }>();
  const receipt = useQuery(
    api.CompanyReceipts.getByReceiptId,
    receiptId ? { receiptId } : "skip"
  );
  const uploadImage = useMutation(api.UserReceipts.upload);
  const router = useRouter();

  const receiptRef = useRef<View | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageReady, setImageReady] = useState(false);

  const handleSaveReceipt = async () => {
    if (!receipt?.receiptUrl || !imageReady || loading) return;
    setLoading(true);

    try {
      const uri = await captureRef(receiptRef, {
        format: "png",
        quality: 1,
      });

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });

      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        base64
      );

      const formattedHash = `0x${hash}`;
      if (formattedHash.length !== 66) {
        Alert.alert("❌ Error", "Invalid hash length for blockchain.");
        return;
      }

      const numericId = parseInt(receipt?.ORnumber?.replace(/\D/g, ""), 10);
      if (isNaN(numericId)) {
        Alert.alert("❌ Error", "Invalid OR Number");
        return;
      }

      const txReceipt = await registerReceiptOnChain(formattedHash, numericId);

      await uploadImage({
        base64,
        owner: userId,
        txHash: txReceipt.hash,
        company: receipt?.company ?? "",
      });


      Alert.alert(
        "✅ Receipt Saved & Registered!",
        `Transaction Hash: ${txReceipt.hash}`,
        [
          {
            text: "OK",
            onPress: () => router.replace("/home"),
          },
        ]
      );
    } catch (error: any) {
        const msg =
          error?.reason === "Receipt already recorded" ||
          error?.message?.includes("Receipt already recorded")
            ? "This receipt is already registered on the blockchain."
            : error?.revert?.args?.[0] ||
              error?.response?.data?.message ||
              "Failed to save and register receipt.";

        Alert.alert("❌ Error Saving", msg);
    } finally {
      setLoading(false);
    }
  };

  if (!receipt) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center p-4">
      <View
        ref={receiptRef}
        collapsable={true}
        className="bg-[#97CBDC] p-2 rounded-lg w-full h-[50%] shadow-md"
      >
        <Image
          source={{ uri: receipt.receiptUrl }}
          onLoadEnd={() => setImageReady(true)}
          style={{
            width: "100%",
            height: "100%",
            resizeMode: "contain",
            borderRadius: 8,
          }}
        />
        <Text className="absolute bottom-2 right-2 text-white text-xs">
          {receipt?.ORnumber}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleSaveReceipt}
        disabled={loading || !imageReady}
        className={`${
          loading || !imageReady ? "opacity-50" : ""
        } bg-[#018ADB] mt-4 py-2 px-6 rounded-lg w-full items-center`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold">
            Save & Register Receipt
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ReceiptPreview;
