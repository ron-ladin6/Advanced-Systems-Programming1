import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import TopBar from "../components/TopBar";
import FileList from "../components/FileList";
import FloatingButton from "../components/FloatingButton";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { http } from "../api/http";

export default function Home() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { theme } = useTheme();

  const [files, setFiles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  //Fetch Root Files (No ID needed)
  const fetchFiles = useCallback(async () => {
    if (!token) return; //check if we have user token

    setRefreshing(true); //spinner visual for the person who use the app.
    try {
      // first we want all the file the have in the root.
      const endpoint = `/files`;
      const data = await http.get(endpoint, { token });
      setFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Error fetching root:", error);
    } finally {
      setRefreshing(false); //when we finish stop the spinner.
    }
  }, [token]); //execute the func only if the token change

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useFocusEffect(
    useCallback(() => {
      fetchFiles();
    }, [fetchFiles])
  );

  const handleFilePress = (file) => {
    // 1. Handle Folders
    if (file.isFolder || file.type === "folder") {
      const fileName = file.name || file.fileName || "";
      router.push({
        pathname: "/folder/[id]",
        params: { id: file.id || file._id, name: file.name },
      });
      return;
    }

    // 2. Identify File Extension
    const fileName = file.name || file.fileName || "";
    const ext = file.name ? file.name.split(".").pop().toLowerCase() : "";

    // Define supported formats
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    const textExtensions = ["txt"];

    const isImage = imageExtensions.includes(ext);
    const isText = textExtensions.includes(ext); // Now this exists!

    // 3. Handle Supported Files -> Navigate to Internal Viewer (Black Box)
    if (isImage || isText) {
      router.push({
        pathname: "/File/[id]",
        params: {
          id: file.id || file._id,
          name: file.name,
          type: isImage ? "image" : "text",
        },
      });
    }
    //Handle Unsupported Files
    else {
      Alert.alert(
        "Not Supported",
        "We currently only support Image and Text files."
      );
    }
  };
  const handleAddPress = () => {
    router.push("/(tabs)/create");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.bg }]}
      edges={["top"]}
    >
      <TopBar
        title="My Drive"
        isSearchMode={true} // Only Home has search
        onBack={() => {}} // No back action on Home
        profileImage={user?.image || user?.profilePictureURL}
        onMenuPress={() => router.push("/(tabs)/create")}
        onProfilePress={() => router.push("/(tabs)/account")}
      />
      <FileList
        files={files}
        onFilePress={handleFilePress} // Uses the new router.push logic
        onFileMenu={() => {}}
        refreshing={refreshing}
        onRefresh={fetchFiles}
      />
      <FloatingButton onPress={handleAddPress} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});