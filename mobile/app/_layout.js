import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

export default function RootLayout() {
  return (
    // Wrap the app with AuthProvider to share login state
    <AuthProvider>
     <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Define the main screens of the app */}
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
      </Stack>
     </ThemeProvider>
    </AuthProvider>
  );
}