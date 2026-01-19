import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import TopBar from "../../components/TopBar";
import FileList from "../../components/FileList";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { http } from "../../api/http";

export default function SharedScreen() {
  //hook for navigation
  const router = useRouter();
  const { token, logout, user } = useAuth();
  const { theme } = useTheme();
  const [files, setFiles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  //state for custom menu
  const myId = user?.id || user?._id;

  const fetchFiles = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      //fetch all files to filter them locally
      const data = await http.get("/files/shared", { token });
      const list = Array.isArray(data) ? data : [];
      //filter files where i have permission but am not owner
      setFiles(list);
    } catch (e) {
      const msg = e?.message || "Failed to load shared files";
      if (String(msg).toLowerCase().includes("401")) {
        //handle token expiration
        logout();
        router.replace("/login");
        return;
      }
      console.log("Error fetching shared:", e);
    } finally {
      setRefreshing(false);
    }
  }, [token, logout, router, myId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  //refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchFiles();
    }, [fetchFiles]),
  );

  const handleFilePress = (file) => {
    //check if item is folder and navigate
    if (file.isFolder || file.type === "folder") {
      router.push({
        pathname: "/folder/[id]",
        params: { id: file.id || file._id, name: file.name },
      });
      return;
    }
    //extract file extension
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
          canEdit: "false",
        },
      });
    } else {
      //show alert for unsupported types
      Alert.alert("Not Supported", "Only Image and Text files are supported.");
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.bg }]}
      edges={["top"]}
    >
      <TopBar
        title="Shared"
        isSearchMode={false}
        onBack={() => router.replace("/(tabs)")}
      />
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
