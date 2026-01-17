import React, { useState } from "react";
import { View, Text, TextInput, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Theme } from "../../style/Theme";
import MainButton from "../../components/MainButton";
import { useAuth } from "../../context/AuthContext";
import { http } from "../../api/http";

export default function Create() {
  const router = useRouter();
  //token to talk to the server
  const { token } = useAuth();
  const [name, setName] = useState("");

  const onCreate = async () => {
    //validation
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

    try {
      // Actual Server Request (Uses your http helper)
      await http.post(
        "/files", 
        { fileName: n, type: "folder", parentId: null }, 
        { token }
      );

      //Success & Navigate back
      Alert.alert("Success", `Created folder: ${n}`);
      setName("");
      // Go back to Home to see the new folder
      router.back();

    } catch (e) {
      // Simple error handling
      Alert.alert("Error", e?.message || "Failed to create folder");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Folder</Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter folder name..."
        placeholderTextColor={Theme.colors.muted}
        style={styles.input}
        autoCapitalize="none"
      />

      <MainButton title="Create" onPress={onCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.l,
    gap: Theme.spacing.m,
    backgroundColor: Theme.colors.bg,
    justifyContent: "center",
  },
  title: {
    fontSize: Theme.font.title,
    fontWeight: "700",
    color: Theme.colors.text,
    textAlign: "center",
    marginBottom: Theme.spacing.s,
  },
  input: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.m,
    padding: Theme.spacing.m,
    fontSize: Theme.font.body,
    color: Theme.colors.text,
    backgroundColor: Theme.colors.card,
  },
});