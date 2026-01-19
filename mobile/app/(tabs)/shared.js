import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";

import TopBar from "../../components/TopBar";
import FileList from "../../components/FileList";
import ThreeDotsMenu from "../../components/ThreeDotsMenu";

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
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
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

  const handleFileMenu = (file) => {
    //open custom bottom sheet menu
    setSelectedFile(file);
    setMenuVisible(true);
  };

  const handleMenuAction = async (actionId, file) => {
    const fileId = file?.id || file?._id;
    if (!fileId) return;

    try {
      if (actionId === "toggle_star") {
        //toggle star status
        const nextStar = !file.isStarred;
        await http.patch(
          `/files/${fileId}`,
          { isStarred: nextStar },
          { token },
        );
        fetchFiles();
        return;
      }

      if (actionId === "remove_shared") {
        //get all permissions for this file
        const perms = await http.get(`/files/${fileId}/permissions`, { token });
        const arr = Array.isArray(perms) ? perms : [];
        //find the permission object belonging to me
        const mine = arr.find((p) => String(p?.userId) === String(myId));
        if (!mine) throw new Error("No permission record found for this user.");
        const pId = mine.id || mine._id;
        //delete the specific permission
        await http.delete(`/files/${fileId}/permissions/${pId}`, { token });
        await fetchFiles();
        return;
      }
    } catch (e) {
      Alert.alert("Error", e?.message || "Action failed");
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
        onBack={() => router.back()}
      />
      <FileList
        files={files}
        onFilePress={handleFilePress}
        onFileMenu={handleFileMenu}
        refreshing={refreshing}
        onRefresh={fetchFiles}
      />

      <ThreeDotsMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        file={selectedFile}
        onAction={handleMenuAction}
        isTrashMode={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
