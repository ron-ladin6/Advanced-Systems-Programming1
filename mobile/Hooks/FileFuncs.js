import { useCallback } from "react";
import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { http } from "../api/http";
export const useFileActions = (token, onRefresh, setLoading) => {
  const validateName = (name) => {
    if (!name || !name.trim()) {
      Alert.alert("Invalid Name", "Name cannot be empty.");
      return false;
    }
    return true;
  };

  // Converts a binary Blob object into a Base64 string.
  // This is required because our C++ backend expects the file content as a string.
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  // Centralized error handling to avoid code duplication.
  const handleError = (e, defaultMsg) => {
    console.error(defaultMsg, e);
    Alert.alert("Error", e?.message || defaultMsg);
    if (setLoading) setLoading(false);
  };

  //Upload File
  const handleUpload = useCallback(
    async (parentId = null) => {
      try {
        //Open the device's document picker
        const result = await DocumentPicker.getDocumentAsync({
          type: ["image/*", "text/*"], // Restrict to images and text files
          copyToCacheDirectory: true,
        });

        if (result.canceled) return;
        const file = result.assets[0]; //DocumentPicker retrun file object
        if (!validateName(file.name)) return;
        if (setLoading) setLoading(true);

        //Read the file from the local URI and convert to Base64
        const localResponse = await fetch(file.uri);
        const blob = await localResponse.blob();
        const base64Content = await blobToBase64(blob);

        //Prepare the payload
        const payload = {
          fileName: file.name,
          type: "file",
          parentId: parentId, // If null, uploads to Root. If ID exists, uploads to that folder.
          content: base64Content,
        };

        //Send to Server
        await http.post("/files", payload, { token });

        Alert.alert("Success", "File uploaded successfully");

        //Refresh the list
        if (onRefresh) await onRefresh();
      } catch (err) {
        handleError(err, "Upload failed");
      } finally {
        if (setLoading) setLoading(false);
      }
    },
    [token, onRefresh, setLoading]
  );

  // Create Folder
  const handleCreateFolder = useCallback(
    async (folderName, parentId = null) => {
      if (!validateName(folderName)) return;
      if (!folderName.trim()) return;

      try {
        if (setLoading) setLoading(true);

        await http.post(
          "/files",
          {
            fileName: folderName,
            type: "folder",
            parentId: parentId,
          },
          { token }
        );

        Alert.alert("Success", "Folder created");
        if (onRefresh) await onRefresh();
      } catch (e) {
        handleError(e, "Failed to create folder");
      } finally {
        if (setLoading) setLoading(false);
      }
    },
    [token, onRefresh, setLoading]
  );

  //Rename File/Folder
  const handleRename = useCallback(
    async (fileId, newName) => {
      if (!fileId || !newName.trim()) return;
      try {
        if (setLoading) setLoading(true);

        // We use PATCH to update only specific fields (the name)
        await http.patch(`/files/${fileId}`, { name: newName }, { token });

        if (onRefresh) await onRefresh();
      } catch (e) {
        handleError(e, "Rename failed");
      } finally {
        if (setLoading) setLoading(false);
      }
    },
    [token, onRefresh, setLoading]
  );

  //Toggle Star
  const handleToggleStar = useCallback(
    async (file) => {
      if (!file) return;
      const fileId = file.id || file._id;
      const nextStatus = !file.isStarred;

      try {
        await http.patch(
          `/files/${fileId}`,
          { isStarred: nextStatus },
          { token }
        );

        if (onRefresh) await onRefresh();
      } catch (e) {
        handleError(e, "Failed to update star");
      }
    },
    [token, onRefresh]
  );

  //Delete (Soft Delete)
  const handleDelete = useCallback(
    async (fileId) => {
      if (!fileId) return;
      try {
        if (setLoading) setLoading(true);

        // Soft Delete: We don't remove the record, we just mark isDeleted = true.
        // This allows moving items to the "Trash" instead of permanent deletion.
        await http.patch(`/files/${fileId}`, { isDeleted: true }, { token });

        if (onRefresh) await onRefresh();
      } catch (e) {
        handleError(e, "Delete failed");
      } finally {
        if (setLoading) setLoading(false);
      }
    },
    [token, onRefresh, setLoading]
  );

  const handleShare = useCallback(
    async (fileId, targetUsername) => {
      if (!fileId || !targetUsername.trim()) return false;

      try {
        if (setLoading) setLoading(true);

        // Send request to add permission
        await http.post(
          `/files/${fileId}/permissions`,
          {
            userId: targetUsername,
            role: "viewer",
          },
          { token }
        );

        Alert.alert(
          "Success",
          `File shared successfully with ${targetUsername}`
        );

        // Refresh list to reflect changes
        if (onRefresh) await onRefresh();

        return true; // Indicate success to the caller.
      } catch (e) {
        // Provide user-friendly error messages
        const msg = e.message.includes("404")
          ? "User not found. Please check the username."
          : e.message || "Share failed";

        handleError(e, msg);
        return false;
      } finally {
        if (setLoading) setLoading(false);
      }
    },
    [token, onRefresh, setLoading]
  );

  return {
    handleUpload,
    handleCreateFolder,
    handleRename,
    handleToggleStar,
    handleDelete,
  };
};
