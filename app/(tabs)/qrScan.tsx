import { useCameraPermissions, CameraView } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import { Alert, Button, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

const QRScan = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const router = useRouter();

  // Request permission on mount if not granted
  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
    })();
  }, [permission]);

  // Use useFocusEffect to manage camera lifecycle
  useFocusEffect(
    useCallback(() => {
      setCameraActive(true);
      setScanned(false); // reset scan state when screen focused

      return () => {
        setCameraActive(false);
      };
    }, [])
  );

  const handleQRCodeScanned = ({ data }: { data: string }) => {
    try {
      const parsedData = JSON.parse(data);
      if (!parsedData.receiptId) throw new Error("Missing receiptId");
      setScanned(true);
      router.push({
        pathname: "/ReceiptPreview",
        params: { receiptId: parsedData.receiptId },
      });
    } catch (error) {
      Alert.alert("❌ Error", "Invalid QR code data.");
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
      {cameraActive && (
        <CameraView
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={scanned ? undefined : handleQRCodeScanned}
          style={{ flex: 1 }}
        />
      )}
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
  );
};

export default QRScan;
