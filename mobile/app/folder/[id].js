import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Alert, View } from "react-native"; // Added View just in case
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

// Custom components for UI consistency
import TopBar from "../../components/TopBar";
import FileList from "../../components/FileList";
import { useFocusEffect } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { http } from "../../api/http";

export default function FolderScreen() {
  const router = useRouter();
  // Get folder ID and name from the navigation parameters
  const { id, name } = useLocalSearchParams();
  const { token, logout } = useAuth();
  const { theme } = useTheme();

  const [files, setFiles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!token || !id) return;
    setRefreshing(true);
    try {
      // Fetch files specifically for this folder (parentId = id)
      const data = await http.get(`/files?parentId=${id}`, { token });
      setFiles(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e?.message || "Failed to load folder";
      // Handle session expiration
      if (msg.toLowerCase().includes("401")) {
        logout();
        router.replace("/login");
        return;
      }
      Alert.alert("Error", msg);
    } finally {
      setRefreshing(false);
    }
  }, [token, id, logout, router]);

  // Initial fetch when entering the screen
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useFocusEffect(
    useCallback(() => {
        fetchFiles();
    }, [fetchFiles])
  );

  const handleFilePress = (file) => {
    // 1. If it's a folder, navigate deeper (Recursive navigation)
    if (file.isFolder || file.type === "folder") {
      router.push({
        pathname: "/folder/[id]",
        params: { id: file.id || file._id, name: file.name },
      });
      return;
    }

    // 2. If it's a file, check if we can view it
    const ext = file.name ? file.name.split(".").pop().toLowerCase() : "";
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    
    const isImage = imageExtensions.includes(ext);
    const isText = ext === "txt";

    if (isImage || isText) {
      // Navigate to the File Viewer screen
      router.push({
        pathname: "/File/[id]", 
        params: {
          id: file.id || file._id,
          name: file.name,
          type: isImage ? "image" : "text",
        },
      });
    } else {
      Alert.alert("Not Supported", "Only Image and Text files are supported in this version.");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]} edges={["top"]}>
      {/* Top bar with a back button */}
      <TopBar 
        title={name || "Folder"} 
        isSearchMode={false} 
        onBack={() => router.back()} 
      />
      
      {/* Reusable list component */}
      <FileList
        files={files}
        onFilePress={handleFilePress}
        refreshing={refreshing}
        onRefresh={fetchFiles}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});