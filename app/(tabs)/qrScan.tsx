import { View, Button, Alert, Text, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { captureRef } from "react-native-view-shot";
import * as FileSystem from "expo-file-system";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as Crypto from "expo-crypto";

const QRScan = () => {
  const { user } = useUser();
  const userId = user?.fullName ?? "";
  const [scanned, setScanned] = useState(false);
  const [receiptId, setReceiptData] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const uploadImage = useMutation(api.UserReceipts.upload);
  const router = useRouter();
  const receiptRef = useRef<View | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const receipt = useQuery(api.CompanyReceipts.getByReceiptId, receiptId ? { receiptId } : "skip");

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
    })();
  }, [permission]);

  const handleQRCodeScanned = ({ data }: { data: string }) => {
    try {
      const parsedData = JSON.parse(data);
      console.log("Parsed QR Code Data:", parsedData);
      setReceiptData(parsedData.receiptId);
      console.log("Receipt ID:", parsedData.receiptId);
      setScanned(true);
    } catch (error) {
      Alert.alert("❌ Error", "Invalid QR code data.");
    }
  };
  
  const handleSaveReceipt = async () => {

    if (!receipt?.receiptUrl || !imageReady) return;
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const uri = await captureRef(receiptRef, {
        format: "png",
        quality: 1,
      });

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64"
      });

      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        base64
      );
      console.log("Hash:", hash);
      // if (receipt?.ORnumber) {
      //   await registerReceipt(userId, hash, receipt.ORnumber);
      // }
      
      await uploadImage({
        base64,
        owner: userId,
        txHash: hash,
        company: receipt?.company,
      });

      Alert.alert("✅ Receipt Saved!", "", [
        { text: "OK", onPress: () => {
            setScanned(false);
            setReceiptData(null);
            router.replace("/home");
        }},
      ]);

    } catch (error) {
      console.error("❌ Error saving receipt:", error);
      Alert.alert("Error", "Failed to save receipt.");
    } finally {
      setLoading(false);
      setScanned(false);
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center">
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {!scanned ? (
          <View style={{ flex: 1 }}>
          <CameraView
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={scanned ? undefined : handleQRCodeScanned}
            style={{ flex: 1 }}
          />
          <View
            style={{
              position: "absolute",
              top: "33%",
              left: "20%",
              width: "60%",
              height: 250,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderColor: "white",
              borderWidth: 1,
              borderRadius: 16,
            }}
          />
        </View>
      ) : (
        <View className="flex-1 items-center justify-center p-4 ">
          <View ref={receiptRef} collapsable={true} className="bg-[#97CBDC] p-2 rounded-lg w-full h-[50%] shadow-md">
          <Image
              source={{ uri: receipt?.receiptUrl }}
              onLoadEnd={() => setImageReady(true)}
              style={{ width: "100%", height: "100%", resizeMode: "contain", borderRadius: 8 }}
            />
            <Text className="absolute bottom-2 right-2 text-white text-xs">
              {receipt?.ORnumber}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSaveReceipt}
            disabled={loading || !imageReady}
            className="bg-[#018ADB] mt-4 py-2 px-6 rounded-lg w-full items-center"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold">Save Receipt</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default QRScan;
