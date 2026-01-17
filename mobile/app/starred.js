import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import TopBar from "../components/TopBar";
import FileList from "../components/FileList";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { http } from "../api/http";

export default function StarredScreen() {
//hook for navigation
  const router = useRouter();
  const { token, logout } = useAuth();
  const { theme } = useTheme();

//state management for files and refresh
  const [files, setFiles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    try {
//get request to filter only starred files
      const data = await http.get("/files?starred=true", { token });
      setFiles(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e?.message || "Failed to load starred files";
      if (String(msg).toLowerCase().includes("401")) {
//handle unauthorized user
        logout();
        router.replace("/login");
        return;
      }
      console.log("Error fetching starred:", e);
    } finally {
      setRefreshing(false);
    }
  }, [token, logout, router]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

//refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchFiles();
    }, [fetchFiles])
  );

  const handleFilePress = (file) => {
//check if file is a folder to navigate differently
    if (file.isFolder || file.type === "folder") {
//push to dynamic route for folder
      router.push({
        pathname: "/folder/[id]",
        params: { id: file.id || file._id, name: file.name },
      });
      return;
    }

    const ext = file.name ? file.name.split(".").pop().toLowerCase() : "";
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

    const isImage = imageExtensions.includes(ext);
    const isText = ext === "txt";

    if (isImage || isText) {
//passing params to file viewer
      router.push({
        pathname: "/File/[id]",
        params: {
          id: file.id || file._id,
          name: file.name,
          type: isImage ? "image" : "text",
        },
      });
    } else {
      Alert.alert("Not Supported", "Only Image and Text files are supported.");
    }
  };

  const handleMenu = (file) => {
    const fileId = file.id || file._id;

    Alert.alert(file.name || "File", "Choose an action", [
      {
        text: "Unstar",
        onPress: async () => {
          try {
//patch request to update file status
            await http.patch(`/files/${fileId}`, { isStarred: false }, { token });
            fetchFiles();
          } catch (e) {
            Alert.alert("Error", e?.message || "Failed to unstar");
          }
        },
      },
      {
        text: "Move to Trash",
        onPress: async () => {
          try {
//logic to delete file
            await http.delete(`/files/${fileId}`, { token });
            fetchFiles();
          } catch (e) {
            Alert.alert("Error", e?.message || "Failed to move to trash");
          }
        },
        style: "destructive",
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]} edges={["top"]}>
      <TopBar title="Starred" isSearchMode={false} onBack={() => router.back()} />
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