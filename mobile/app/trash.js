import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import TopBar from "../components/TopBar";
import FileList from "../components/FileList";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { http } from "../api/http";

export default function TrashScreen() {
  const router = useRouter();
  const { token, logout } = useAuth();
  const { theme } = useTheme();

  const [files, setFiles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      //fetch only deleted files from server
      const data = await http.get("/files?trash=true", { token });
      setFiles(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e?.message || "Failed to load trash";
      if (String(msg).toLowerCase().includes("401")) {
        logout();
        router.replace("/login");
        return;
      }
      console.log("Error fetching trash:", e);
    } finally {
      setRefreshing(false);
    }
  }, [token, logout, router]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useFocusEffect(
    useCallback(() => {
      fetchFiles();
    }, [fetchFiles])
  );

  const handleFilePress = () => {
    Alert.alert("Trash", "Restore the item to open it.");
  };

  const handleMenu = (file) => {
    const fileId = file.id || file._id;

    Alert.alert(file.name || "File", "Choose an action", [
      {
        text: "Restore",
        onPress: async () => {
          try {
            //restore file from trash
            await http.patch(`/files/${fileId}`, { isDeleted: false }, { token });
            fetchFiles();
          } catch (e) {
            Alert.alert("Error", e?.message || "Failed to restore");
          }
        },
      },
      {
        text: "Delete forever",
        onPress: async () => {
          try {
            //hard delete from database
            await http.delete(`/files/${fileId}`, { token });
            fetchFiles();
          } catch (e) {
            Alert.alert("Error", e?.message || "Failed to delete forever");
          }
        },
        style: "destructive",
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]} edges={["top"]}>
      <TopBar title="Trash" isSearchMode={false} onBack={() => router.back()} />
      <FileList
        files={files}
        onFilePress={handleFilePress}
        onFileMenu={handleMenu}
        refreshing={refreshing}
        onRefresh={fetchFiles}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});