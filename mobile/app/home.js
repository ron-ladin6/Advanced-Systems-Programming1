import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import TopBar from "../components/TopBar";
import FileList from "../components/FileList";
import PlusBtnMenu from "../components/PlusBtnMenu";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { http } from "../api/http";
import { API_BASE } from "../api/config";
import ThreeDotsMenu from "../components/ThreeDotsMenu";
import RenameModal from "../components/RenameModal";
import SideMenu from "../components/SideMenu";

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
        handleFilePress(file);
        return;
      }

      if (actionId === "toggle_star") {
        const nextStar = !file.isStarred;
        //update star status on server
        await http.patch(
          `/files/${fileId}`,
          { isStarred: nextStar },
          { token }
        );
        await fetchFiles();
        return;
      }

      if (actionId === "delete") {
        //soft delete the file by updating the flag
        await http.patch(`/files/${fileId}`, { isDeleted: true }, { token });
        await fetchFiles();
        return;
      }

      if (actionId === "rename") {
        renameFile(file);
        return;
      }

      if (actionId === "share") {
        const fileId = file?.id || file?._id;
        router.push({
          pathname: "/share/[id]",
          params: { id: fileId, name: file?.name || "File" },
        });
        return;
      }
    } catch (e) {
      Alert.alert("Error", e?.message || "Action failed");
    }
  };
  // Convert Blob to Base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        // Returns a string like: "data:image/jpeg;base64,..."
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  };

  const handleUpload = async () => {
    try {
      //Pick a file from the device
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "text/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      const file = result.assets[0];

      setRefreshing(true);

      //Read local file as Blob and convert to Base64
      // We use 'fetch' to read the local URI provided by the picker
      const localResponse = await fetch(file.uri);
      const blob = await localResponse.blob();
      const base64Content = await blobToBase64(blob);

      // We send the file content as a string inside the JSON body
      const payload = {
        fileName: file.name,
        type: "file",
        parentId: null, // Or use the current folder ID if available
        content: base64Content, // This contains the full Base64 string
      };

      //Send to Node.js Server
      const response = await fetch(`${API_BASE}/files`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Upload failed");
      }

      Alert.alert("Success", "File uploaded successfully");
      await fetchFiles();
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Upload Error", err.message || "Something went wrong");
    } finally {
      setRefreshing(false);
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
          const fileId = selectedFile?.id || selectedFile?._id;

          const next = String(nextName || "").trim();
          if (!fileId) return;
          if (!next) {
            Alert.alert("Invalid", "Name is required.");
            return;
          }
          //check if name actually changed
          if (next === (selectedFile?.name || "")) {
            setRenameVisible(false);
            return;
          }

          try {
            //send patch request to server
            await http.patch(`/files/${fileId}`, { name: next }, { token });
            setRenameVisible(false);
            //refresh file list
            await fetchFiles();
          } catch (e) {
            Alert.alert("Error", e?.message || "Rename failed");
          }
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
        onPressUpload={handleUpload}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
