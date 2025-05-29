import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { getClerkErrorMessage } from "@/utils/clerkErrors";

export default function SignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
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

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      await signUp.create({
        emailAddress,
        password,
        firstName: fname,
        lastName: lname,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
    } catch (err: any) {
      const errorMsg = getClerkErrorMessage(err);
      Alert.alert("Sign-Up Error", errorMsg);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded || loading) return;

    setLoading(true);
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({ code });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/(tabs)/home");
      } else {
        Alert.alert("Verification Incomplete", "Please enter the correct code.");
      }
    } catch (err: any) {
      const errorMsg = getClerkErrorMessage(err);
      Alert.alert("Sign-Up Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#004581]"
      behavior={Platform.OS === "android" ? "padding" : "height"}
    >
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
        {pendingVerification ? (
          <View className="w-80 p-6 bg-white rounded-2xl shadow-md">
            <Text className="text-2xl font-semibold mb-4 text-center">
              Verify your email
            </Text>
            <TextInput
              className="border border-gray-300 rounded-md p-3 mb-4 text-center font-monda"
              value={code}
              placeholder="Enter your verification code"
              onChangeText={setCode}
            />
            <TouchableOpacity
              onPress={onVerifyPress}
              disabled={loading}
              className="bg-blue-500 py-3 rounded-2xl items-center"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-lg">
                  Verify
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View className="w-80 p-6 bg-white rounded-2xl shadow-md">
            <Text className="text-xl font-bold text-center font-monda">
              Don't have an Account ?
            </Text>
            <Text className="text-lg font-semibold mb-4 text-center font-monda">
              Sign-up
            </Text>
            <TextInput
              className="border border-gray-300 rounded-md p-3 mb-2 font-monda"
              value={fname}
              placeholder="First Name"
              placeholderTextColor="#666666"
              onChangeText={setFname}
            />
            <TextInput
              className="border border-gray-300 rounded-md p-3 mb-2 font-monda"
              value={lname}
              placeholder="Last Name"
              placeholderTextColor="#666666"
              onChangeText={setLname}
            />
            <TextInput
              className="border border-gray-300 rounded-md p-3 mb-2 font-monda"
              value={emailAddress}
              placeholder="Email Address"
              placeholderTextColor="#666666"
              onChangeText={setEmailAddress}
            />
            <View className="relative mb-4">
              <TextInput
                className="border border-gray-300 rounded-md p-3 pr-12 text-gray-900"
                value={password}
                placeholder="Password"
                placeholderTextColor="#666666"
                secureTextEntry={!showPassword}
                onChangeText={setPassword}
                autoCorrect={false}
                autoCapitalize="none"
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
              onPress={onSignUpPress}
              className="bg-black py-3 rounded-2xl items-center"
            >
              <Text className="text-white font-bold text-lg font-monda">
                Continue
              </Text>
            </TouchableOpacity>
            <View className="flex-row gap-2 mt-4 justify-center">
              <Text className="font-monda">Have an account?</Text>
              <TouchableOpacity onPress={() => router.replace("/login")}>
                <Text className="font-monda font-bold underline">login</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
