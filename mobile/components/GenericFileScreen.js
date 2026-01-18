import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import TopBar from "./TopBar";
import FileList from "./FileList";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { http } from "../api/http";
import { openFileOrFolder } from "../utils/openFile";
import SideMenu from "./SideMenu";

//reusable screen component to avoid code duplication
export default function GenericFileScreen({
  title,
  queryParam, // "recent" | "starred" | "trash" | "shared"
  allowOpen = true,
  buildMenuActions, // (file, ctx) => Alert buttons array
}) {
  const router = useRouter();
  const { token, logout, user } = useAuth();
  const { theme } = useTheme();
  const [sideMenuVisible, setSideMenuVisible] = useState(false)
  const [files, setFiles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    try {
//fetch files dynamically based on the prop passed
      const data = await http.get(`/files?${queryParam}=true`, { token });
      setFiles(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e?.message || "Failed to load files";
      if (String(msg).toLowerCase().includes("401")) {
//handle token expiration
        logout();
        router.replace("/login");
        return;
      }
      console.log(`Error fetching ${queryParam}:`, e);
    } finally {
      setRefreshing(false);
    }
  }, [token, queryParam, logout, router]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

//refresh list when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchFiles();
    }, [fetchFiles])
  );

  const handleFilePress = (file) => {
//prevent opening files if disabled (e.g. in trash)
    if (!allowOpen) {
      Alert.alert(title, "Restore the item to open it.");
      return;
    }
    openFileOrFolder(router, file);
  };

  const handleMenu = (file) => {
    if (!file) return;
//generate menu actions dynamically
    const buttons =
      typeof buildMenuActions === "function"
        ? buildMenuActions(file, { token, fetchFiles, router, logout })
        : [{ text: "Cancel", style: "cancel" }];

    Alert.alert(file.name || "File", "Choose an action", [
      ...buttons,
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.bg }]}
      edges={[]}
    >
      <TopBar
        title={title}
        isSearchMode={false}
        showMenu={true}
        onMenuPress={() => setSideMenuVisible(true)}
        profileImage={user?.image || user?.profilePictureURL}
        onProfilePress={() => router.push("/(tabs)/account")}
      />
      <FileList
        files={files}
        onFilePress={handleFilePress}
        onFileMenu={handleMenu}
        refreshing={refreshing}
        onRefresh={fetchFiles}
      />
      <SideMenu
        visible={sideMenuVisible}
        onClose={() => setSideMenuVisible(false)}
        active={String(queryParam || "")}
        onNavigate={(route) => router.replace(route)}
        onLogout={() => {
          try {
            logout();
          } finally {
            router.replace("/login");
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});