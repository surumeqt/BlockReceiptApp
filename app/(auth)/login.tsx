import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useState } from "react";

export default function Login() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getClerkErrorMessage = (err: any) => {
    if (err?.errors && err.errors.length > 0) {
      const { message, meta } = err.errors[0];
      const field = meta?.paramName ? meta.paramName.replace(/_/g, ' ') : null;
      return field ? `${field.charAt(0).toUpperCase() + field.slice(1)} ${message}` : message;
    }
    return "Something went wrong. Please try again.";
  };

  const onSignInPress = async () => {
    if (!isLoaded || loading) return;
    setLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(tabs)/home");
      }
    } catch (err : any) {
      const errorMsg = getClerkErrorMessage(err);
      Alert.alert("Login Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "android" ? "padding" : "height"} className="flex-1 bg-[#004581]">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center justify-center mb-8">
          <Text className="text-2xl text-[#DDE8F0] font-monda font-bold text-center">
            Abans's General Upholstery
          </Text>
          <Text className="text-lg text-[#DDE8F0] mt-2 text-center font-monda">
            Digitalized Your Receipt.
          </Text>
        </View>

        <View className="w-80 p-6 rounded-2xl shadow-md bg-white">
          <Text className="text-2xl font-bold text-center font-monda">
            Welcome Back!
          </Text>
          <Text className="text-xl mb-4 text-center font-monda font-semibold">
            Login
          </Text>

          <TextInput
            className="border border-gray-300 rounded-md p-3 mb-2 text-gray-900"
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Enter email"
            placeholderTextColor="#666666"
            onChangeText={setEmailAddress}
          />

          <View className="relative mb-4">
            <TextInput
              className="border border-gray-300 rounded-md p-3 pr-12 text-gray-900"
              autoCapitalize="none"
              value={password}
              placeholder="Enter password"
              placeholderTextColor="#666666"
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              className="absolute right-3 top-2.5"
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={24}
                color="#666666"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={onSignInPress}
            disabled={loading}
            className="bg-black py-3 rounded-2xl items-center"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg font-monda">
                Login
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row gap-2 mt-4 justify-center">
            <Text className="text-gray-700 font-monda">
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => router.replace("/signUp")}>
              <Text className="font-monda font-bold underline">Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
