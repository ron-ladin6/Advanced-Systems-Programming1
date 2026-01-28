import React, { useCallback, useEffect, useState } from "react";
import ThreeDotsMenu from "../../components/ThreeDotsMenu";
import RenameModal from "../../components/RenameModal";
import ShareModal from "../../components/ShareModal";
import { API_BASE } from "../../api/config";
import { Linking } from "react-native";
import { StyleSheet, Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import PlusBtnMenu from "../../components/PlusBtnMenu";
// Custom components for UI consistency
import TopBar from "../../components/TopBar";
import FileList from "../../components/FileList";
import { useFocusEffect } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { http } from "../../api/http";
import { useFileActions } from "../../Hooks/FileFuncs";

export default function FolderScreen() {
  const router = useRouter();
  // Get folder ID and name from the navigation parameters
  const { id, name } = useLocalSearchParams();
  const { token, logout } = useAuth();
  const { theme } = useTheme();
  const folderId = String(id || "").trim();
  const [files, setFiles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [renameVisible, setRenameVisible] = useState(false);
  const [renameInitial, setRenameInitial] = useState("");
  const [shareVisible, setShareVisible] = useState(false);

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

  const { handleUpload, handleToggleStar, handleDelete, handleRename, handleShare } =
  useFileActions(token, fetchFiles, setRefreshing);

  // Initial fetch when entering the screen
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useFocusEffect(
    useCallback(() => {
        fetchFiles();
    }, [fetchFiles])
  );

  const handleFileMenu = (file) => {
  setSelectedFile(file);
  setMenuVisible(true);
};

  const renameFile = (file) => {
    setSelectedFile(file);
    setRenameInitial(file?.name || "");
    setRenameVisible(true);
  };

  const onMenuAction = async (actionId, file) => {
    const fileId = file?.id || file?._id;
    if (!fileId) return;

    try {
      if (actionId === "download") {
        const url = `${API_BASE}/files/${fileId}/download?token=${encodeURIComponent(token)}`;
        await Linking.openURL(url);
        return;
      }

      if (actionId === "toggle_star") {
        await handleToggleStar(file);
        return;
      }

      if (actionId === "delete") {
        await handleDelete(fileId);
        return;
      }

      if (actionId === "rename") {
        setMenuVisible(false);
        renameFile(file);
        return;
      }

      if (actionId === "share") {
        setMenuVisible(false);
        setShareVisible(true);
        return;
      }
    } catch (e) {
      Alert.alert("Error", e?.message || "Action failed");
    }
  };

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
        onFileMenu={handleFileMenu}
        refreshing={refreshing}
        onRefresh={fetchFiles}
      />
    <View style={styles.fabWrap}>
      <PlusBtnMenu
        currentFolder={folderId}
        onPressCreateFolder={() =>
          router.push({
          pathname: "/(tabs)/create",
          params: { parentId: folderId, returnToId: folderId, returnToName: name || "Folder" },
        })
        }
        onPressUpload={() => handleUpload(folderId)}
      />
      </View>
      <RenameModal
        visible={renameVisible}
        initialValue={renameInitial}
        onClose={() => setRenameVisible(false)}
        onSave={async (nextName) => {
          const file = selectedFile;
          const fileId = file?.id || file?._id;
          if (!fileId) return;
          const next = String(nextName || "").trim();
          if (!next) {
            Alert.alert("Invalid", "Name is required.");
            return;
          }
          const isFolder = file?.isFolder || file?.type === "folder";
          await handleRename(fileId, next, file?.name || "", isFolder);
          setRenameVisible(false);
        }}
      />
      <ThreeDotsMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        file={selectedFile}
        onAction={onMenuAction}
        isTrashMode={false}
      />
      <ShareModal
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        onSubmit={(username) =>
          handleShare(selectedFile?.id || selectedFile?._id, username)
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fabWrap: {
    position: "absolute",
    right: 18,
    bottom: 80,
  },
});