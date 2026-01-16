import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import MainButton from "../../components/MainButton";
import { Theme } from "../../style/Theme";
import { useAuth } from "../../context/AuthContext";

export default function Account() {
  const router = useRouter();
  // Get the logout function from context
  const { logout } = useAuth();
  const onLogout = () => {
    // 1. Clear the user token and data
    logout();
    // 2. Navigate back to the login screen
    router.replace("/login");
  };

  return (
    <View style={{ 
      flex: 1, 
      padding: Theme.spacing.l, 
      gap: Theme.spacing.m, 
      backgroundColor: Theme.colors.bg 
    }}>
      <Text style={{ 
        fontSize: Theme.font.title, 
        fontWeight: "700", 
        color: Theme.colors.text 
      }}>
        Account
      </Text>
      {/* Button to sign out */}
      <MainButton title="Logout" onPress={onLogout} />
    </View>
  );
}