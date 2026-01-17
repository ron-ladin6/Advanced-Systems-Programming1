import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import TopBar from "../components/TopBar";
import FileList from "../components/FileList";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { http } from "../api/http";

export default function RecentScreen() {
  const router = useRouter();
  const { token, logout } = useAuth();
  const { theme } = useTheme();

  const [files, setFiles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      //fetching recent files from backend
      const data = await http.get("/files?recent=true", { token });
      setFiles(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e?.message || "Failed to load recent files";
      if (String(msg).toLowerCase().includes("401")) {
        logout();
        router.replace("/login");
        return;
      }
      console.log("Error fetching recent:", e);
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

  const handleFilePress = (file) => {
    if (file.isFolder || file.type === "folder") {
      //navigate to folder screen
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
      //navigate to file preview
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
    const nextStar = !file.isStarred;

    Alert.alert(file.name || "File", "Choose an action", [
      {
        text: nextStar ? "Star" : "Unstar",
        onPress: async () => {
          try {
            //toggle star status on server
            await http.patch(`/files/${fileId}`, { isStarred: nextStar }, { token });
            fetchFiles();
          } catch (e) {
            Alert.alert("Error", e?.message || "Failed to update star");
          }
        },
      },
      {
        text: "Move to Trash",
        onPress: async () => {
          try {
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
      <TopBar title="Recent" isSearchMode={false} onBack={() => router.back()} />
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