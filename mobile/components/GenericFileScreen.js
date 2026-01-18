import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import TopBar from "./TopBar";
import FileList from "./FileList";
import SideMenu from "./SideMenu";
import ShareModal from "./ShareModal";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { http } from "../api/http";
import { openFileOrFolder } from "../utils/openFile";
import { useFileActions } from "../hooks/useFileActions";

export default function GenericFileScreen({
  title,
  queryParam,
  endpoint,
  allowOpen = true,
  buildMenuActions,
}) {
  const router = useRouter();
  const { token, logout, user } = useAuth();
  const { theme } = useTheme();

  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [files, setFiles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  //Share Logic States
  const [shareVisible, setShareVisible] = useState(false);
  const [fileToShare, setFileToShare] = useState(null);

  // Initialize actions hook.
  // We pass 'fetchFiles' as the onRefresh callback, so list updates automatically.
  const { handleShare } = useFileActions(token, () => fetchFiles(), null);

  const fetchFiles = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      //If 'endpoint' prop is provided , use it.
      // Otherwise, fallback to the standard 'queryParam' logic ( Recent/Starred...).
      const url = endpoint ? endpoint : `/files?${queryParam}=true`;

      const data = await http.get(url, { token });
      setFiles(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e?.message || "Failed to load files";
      if (String(msg).toLowerCase().includes("401")) {
        logout();
        router.replace("/login");
        return;
      }
      console.log(`Error fetching files:`, e);
    } finally {
      setRefreshing(false);
    }
  }, [token, queryParam, endpoint, logout, router]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useFocusEffect(
    useCallback(() => {
      fetchFiles();
    }, [fetchFiles])
  );

  const handleFilePress = (file) => {
    if (!allowOpen) {
      Alert.alert(title, "Restore the item to open it.");
      return;
    }
    openFileOrFolder(router, file);
  };

  const handleMenu = (file) => {
    if (!file) return;

    // Only the owner can share a file.
    // 'file.ownerId' usually comes from DB, 'user.id' from AuthContext.
    const isOwner =
      String(file.ownerId || file.owner) === String(user?.id || user?._id);

    // Get specific actions for this view (restore from trash, unstar)
    let baseActions =
      typeof buildMenuActions === "function"
        ? buildMenuActions(file, { token, fetchFiles, router, logout })
        : [];

    // Inject "Share" action if user is owner and view allows interactions
    if (isOwner && allowOpen) {
      baseActions.unshift({
        text: "Share",
        onPress: () => {
          setFileToShare(file);
          setShareVisible(true);
        },
      });
    }

    Alert.alert(file.name || "File", "Choose an action", [
      ...baseActions,
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
        active={String(queryParam || endpoint || "")}
        onNavigate={(route) => router.replace(route)}
        onLogout={() => {
          try {
            logout();
          } finally {
            router.replace("/login");
          }
        }}
      />

      {/* --- Share Modal Component --- */}
      <ShareModal
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        // Calls the hook function with the selected file ID
        onSubmit={(username) =>
          handleShare(fileToShare?.id || fileToShare?._id, username)
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
