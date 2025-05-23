import { useCameraPermissions, CameraView } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Alert, Button, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const QRScan = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraActive, setCameraActive] = useState(false);
  const [receiptIdToCheck, setReceiptIdToCheck] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);
  const router = useRouter();
  const hasScannedRef = useRef(false);

  const duplicateReceipt = useQuery(
    api.UserReceipts.getByOrNumber,
    receiptIdToCheck ? { ORnumber: receiptIdToCheck } : "skip"
  );

  // Request permission on mount
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  // Reset camera when screen focuses
  useFocusEffect(
    useCallback(() => {
      setCameraActive(true);
      setScanned(false);
      setReceiptIdToCheck(null);
      hasScannedRef.current = false;
      return () => setCameraActive(false);
    }, [])
  );

  // Runs when a receiptId is set
  useEffect(() => {
    if (!receiptIdToCheck || hasScannedRef.current) return;

    if (duplicateReceipt === undefined) return;
    if (duplicateReceipt !== null) {
      Alert.alert("❌ Error", "Receipt already exists.");
      hasScannedRef.current = false;
      setTimeout(() => {
        setReceiptIdToCheck(null);
        setCameraActive(true);
      }, 1500);
      return;
    }

    hasScannedRef.current = true;
    setScanned(true);
    router.push({
      pathname: "/ReceiptPreview",
      params: { receiptId: receiptIdToCheck },
    });
  }, [receiptIdToCheck, duplicateReceipt]);

  const handleQRCodeScanned = async ({ data }: { data: string }) => {
    if (hasScannedRef.current) return;

    try {
      const parsed = JSON.parse(data);
      if (!parsed.receiptId) throw new Error("Missing receiptId");

      setCameraActive(false);
      setReceiptIdToCheck(parsed.receiptId);
    } catch (e) {
      Alert.alert("❌ Error", "Invalid QR code.");
      setTimeout(() => {
        hasScannedRef.current = false;
        setCameraActive(true);
      }, 1000);
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
    <View style={{ flex: 1, backgroundColor: "#004581" }}>
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
