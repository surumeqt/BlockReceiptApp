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
import Web3 from 'web3';
import ReceiptRegistryABI from '../../contracts/abi/ReceiptRegistryABI.json';
import 'react-native-get-random-values';

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
  const receiptQuery = useQuery(api.CompanyReceipts.getByReceiptId, receiptId ? { receiptId } : "skip");

  // Blockchain setup
  const web3 = new Web3('https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID'); // Replace with your Infura Project ID or another provider
  const contractAddress = ''; // Replace with your deployed contract address
  const receiptRegistryContract = new web3.eth.Contract(ReceiptRegistryABI, contractAddress);
  const fromAccount = '0x74222a61262510Eb82B07d48d27D483799b5F3d6'; // Replace with the Ethereum address that will send transactions

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

      const companyName = receiptQuery?.company;


      // Encode the function call to storeReceipt on the blockchain
      const currency = "PHP"; // Assuming PHP for now, consider getting it from the QR code
      const encodedData = receiptRegistryContract.methods.storeReceipt(
        hash,
        receiptId,
        web3.utils.asciiToHex(currency)
      ).encodeABI();

      const gasEstimate = await web3.eth.estimateGas({
        to: contractAddress,
        data: encodedData,
        from: fromAccount,
      });

      const transactionReceipt = await web3.eth.sendTransaction({
        from: fromAccount,
        to: contractAddress,
        data: encodedData,
        gas: gasEstimate,
      });

      console.log("Transaction Receipt:", transactionReceipt);
      Alert.alert("✅ Receipt Saved & Registered!", `Transaction Hash: ${transactionReceipt.transactionHash}`, [
        {
          text: "OK", onPress: () => {
            setScanned(false);
            setReceiptData(null);
            router.replace("/home");
          }
        },
      ]);

      await uploadImage({
        base64,
        owner: userId,
        txHash: hash,
        company: companyName,
      });

    } catch (error) {
      console.error("❌ Error saving and registering receipt:", error);
      Alert.alert("Error", "Failed to save and register receipt on the blockchain.");
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
              source={{ uri: receiptQuery?.data?.receiptUrl }}
              onLoadEnd={() => setImageReady(true)}
              style={{ width: "100%", height: "100%", resizeMode: "contain", borderRadius: 8 }}
            />
            <Text className="absolute bottom-2 right-2 text-white text-xs">
              {receiptQuery?.data?.ORnumber}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSaveReceipt}
            disabled={loading || !imageReady || !receiptQuery?.data?.receiptUrl}
            className="bg-[#018ADB] mt-4 py-2 px-6 rounded-lg w-full items-center"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold">Save & Register Receipt</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default QRScan;