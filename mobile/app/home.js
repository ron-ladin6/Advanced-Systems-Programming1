import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import TopBar from "../components/TopBar";
import FileList from "../components/FileList";
import PlusBtnMenu from "../components/PlusBtnMenu";
import ThreeDotsMenu from "../components/ThreeDotsMenu";
import RenameModal from "../components/RenameModal";
import SideMenu from "../components/SideMenu";
import ShareModal from "../components/ShareModal";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { http } from "../api/http";
import { API_BASE } from "../api/config";
import { useFileActions } from "../Hooks/FileFuncs";

export default function Home() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [files, setFiles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [renameVisible, setRenameVisible] = useState(false);
  const [renameInitial, setRenameInitial] = useState("");
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  //Fetch Logic (Get list of files)
  const fetchFiles = useCallback(async () => {
    if (!token) return; //check if we have user token

    setRefreshing(true);
    try {
      // first we want all the file the have in the root.
      const endpoint = debouncedQuery
        ? `/search?q=${encodeURIComponent(debouncedQuery)}`
        : `/files`;
      const data = await http.get(endpoint, { token });
      setFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Error fetching root:", error);
    } finally {
      setRefreshing(false);
    }
  }, [token, debouncedQuery]); //execute the func only if the token change
  const { handleShare, handleUpload, handleToggleStar, handleDelete, handleRename } =
  useFileActions(token, fetchFiles, setRefreshing);
  // Initial load
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(String(searchQuery || "").trim());
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleFileMenu = (file) => {
    setSelectedFile(file);
    setMenuVisible(true);
  };

  // Reload when screen gets focus (e.g. coming back from Create folder)
  useFocusEffect(
    useCallback(() => {
      fetchFiles();
    }, [fetchFiles])
  );

  //function to open rename modal
  const renameFile = (file) => {
    const fileId = file?.id || file?._id;
    if (!fileId) return;
    //set state for modal
    setSelectedFile(file);
    setRenameInitial(file?.name || "");
    setRenameVisible(true);
  };

  const onMenuAction = async (actionId, file) => {
    const fileId = file?.id || file?._id;
    if (!fileId) return;

    try {
      if (actionId === "download") {
        //simulating download by opening the file viewer
        const url = `${API_BASE}/files/${fileId}/download?token=${encodeURIComponent(token)}`;
        const can = await Linking.canOpenURL(url);
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

  //Navigation Logic
  const handleFilePress = (file) => {
    // Check if it's a folder
    if (file.isFolder || file.type === "folder") {
      router.push({
        pathname: "/folder/[id]",
        params: { id: file.id || file._id, name: file.name },
      });
      return;
    }

    // Check extensions for Files
    const ext = file.name ? file.name.split(".").pop().toLowerCase() : "";
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    const textExtensions = ["txt"];
    const isImage = imageExtensions.includes(ext);
    const isText = textExtensions.includes(ext);

    if (isImage || isText) {
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.bg }]}
      edges={[]}
    >
      <TopBar
        title="My Drive"
        isSearchMode={true} // Only Home has search
        showMenu={true}
        onSearch={setSearchQuery}
        onBack={() => {}} // No back action on Home
        profileImage={user?.image || user?.profilePictureURL}
        onMenuPress={() => setSideMenuVisible(true)}
        onProfilePress={() => router.push("/(tabs)/account")}
      />

      <RenameModal
        visible={renameVisible}
        initialValue={renameInitial}
        onClose={() => setRenameVisible(false)}
        onSave={async (nextName) => {
          const file = selectedFile;
          const fileId = file?.id || file?._id;
          if (!fileId) 
              return;
          const next = String(nextName || "").trim();
          if (!next) {
            Alert.alert("Invalid", "Name is required.");
            return;
          }
          //check if name actually changed
          if (next === (file?.name || "")) {
            setRenameVisible(false);
            return;
          }
          const isFolder = file?.isFolder || file?.type === "folder";
          await handleRename(fileId, next, file?.name || "", isFolder);
          setRenameVisible(false);
        }}
      />

      <FileList
        files={files}
        onFilePress={handleFilePress}
        onFileMenu={handleFileMenu}
        refreshing={refreshing}
        onRefresh={fetchFiles}
      />

      {/* The New Menu Button */}
      <PlusBtnMenu
        currentFolder={null}
        onPressCreateFolder={() => router.push("/(tabs)/create")}
        onPressUpload={() => handleUpload(null)}
      />
      <ThreeDotsMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        file={selectedFile}
        onAction={onMenuAction}
        isTrashMode={false}
      />
      <SideMenu
        visible={sideMenuVisible}
        onClose={() => setSideMenuVisible(false)}
        active="home"
        onNavigate={(route) => router.replace(route)}
        onLogout={() => {
          try {
            logout();
          } finally {
            router.replace("/login");
          }
        }}
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
});
