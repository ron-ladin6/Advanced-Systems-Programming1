import React from "react";
import { Tabs, Redirect } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Theme } from "../../style/Theme"; // Added for icon colors if needed
import { useTheme } from "../../context/ThemeContext";

export default function TabsLayout() {
  const { token } = useAuth();
  const { theme } = useTheme();
  // Security check: if user is not logged in, go to login screen
  if (!token) return <Redirect href="/login" />;

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: Theme.colors.primary }}>
      {/* Home screen (File list) */}
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      
      {/* Create / Upload screen */}
      <Tabs.Screen name="create" options={{ title: "Create" }} />
      
      {/* Account settings */}
      <Tabs.Screen name="account" options={{ title: "Account" }} />
    </Tabs>
  );
}