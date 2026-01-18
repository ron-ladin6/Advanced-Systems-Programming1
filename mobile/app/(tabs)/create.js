import React, { useState } from "react";
import { View, Text, TextInput, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import MainButton from "../../components/MainButton";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { http } from "../../api/http";

export default function Create() {
  const router = useRouter();
  const { token } = useAuth();
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const onCreate = async () => {
    if (!token) {
      Alert.alert("Error", "Session expired. Please login again.");
      router.replace("/login");
      return;
    }

    const n = (name || "").trim();
    if (!n) {
      Alert.alert("Error", "Name is required");
      return;
    }

    setLoading(true);
    try {
      await http.post("/files", { fileName: n, type: "folder", parentId: null }, { token });
      setName("");
      // return to home page
      Alert.alert("Success", `Created folder: ${n}`, [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to create folder");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <Text style={[styles.title, { color: theme.colors.text, fontSize: theme.font.title }]}>
        Create New Folder
      </Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter folder name..."
        placeholderTextColor={theme.colors.muted}
        style={[
          styles.input,
          {
            borderColor: theme.colors.border,
            color: theme.colors.text,
            backgroundColor: theme.colors.card,
            borderRadius: theme.radius.m,
            padding: theme.spacing.m,
            fontSize: theme.font.body,
          },
        ]}
        autoCapitalize="none"
      />

      <MainButton title={loading ? "Creating..." : "Create"} onPress={onCreate} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", gap: 16, padding: 24 },
  title: { fontWeight: "700", textAlign: "center", marginBottom: 8 },
  input: { borderWidth: 1 },
});