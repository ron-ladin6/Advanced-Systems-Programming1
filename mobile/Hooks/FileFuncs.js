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

//ךist of extensions that is forbidden to change
const LOCKED_EXTS = new Set(["png", "jpg", "jpeg", "gif", "webp", "txt"]);

//Helper function to safely split a filename into base name and extension.
const splitExt = (filename) => {
  const s = String(filename || "").trim();
  //the last dot to separate extension
  const i = s.lastIndexOf(".");

  //no dot found or dot ia at start or end
  if (i <= 0 || i === s.length - 1) {
    return { base: s, ext: "" };
  }
  //for example "image.png" -> base: "image" and ext is the png
  return { base: s.slice(0, i), ext: s.slice(i + 1).toLowerCase() };
};

//this ensures the new name keeps that extension, ignoring what the user typed
const enforceLockedExt = (nextName, originalName) => {
  const original = splitExt(originalName);
  const raw = String(nextName || "").trim();

  //if original file has no extension OR isn't in our locked list allow change
  if (!original.ext || !LOCKED_EXTS.has(original.ext)) {
    return raw;
  }
  // If we are here, the file is in locked list
  const next = splitExt(raw);
  const base = String(next.base || "").trim();
  //if empty name or just whitespace
  if (!base) 
      return null;
  // Force the original extension onto the new base name.
  return `${base}.${original.ext}`;
  };

  // Converts a binary Blob object into a Base64 string.
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const readPickedContent = async (pickedFile) => {
      const fileName = String(pickedFile?.name || "");
      //extract extension to determine how to read the file
      const ext = fileName.split(".").pop().toLowerCase();
      //define which extensions are treated as plain text
      const isText = ext === "txt" || ext === "md";
      if (isText) {
        //for text files, we fetch the URI and extract the text directly.
        const res = await fetch(pickedFile.uri);
        return await res.text();
      }
      // For images and other binary files, we convert them to Base64
      const res = await fetch(pickedFile.uri);
      //get the binary large object
      const blob = await res.blob();
      return await blobToBase64(blob);
  };

  const handleReplaceContent = useCallback(
    async (fileId, pickerType) => {
      if (!fileId) 
        return;
      try {
        //open Device Document Picker
        const result = await DocumentPicker.getDocumentAsync({
          type: pickerType,
          copyToCacheDirectory: true,
        });
        if (result.canceled) return;
        const picked = result.assets[0];
        //validate the new file name (optional safety check)
        if (!validateName(picked.name)) return;
        if (setLoading) setLoading(true);
        //read the file content (Text or Base64) using the helper function
        const content = await readPickedContent(picked);
        //send PATCH request to update ONLY the content
        await http.patch(`/files/${fileId}`, { content }, { token });
        Alert.alert("Success", "File updated successfully");
        //refresh the list to reflect changes
        if (onRefresh) 
            await onRefresh();
        //return content so the calling component can update its state locally
        return content; 
      } catch (e) {
          handleError(e, "Update failed");
      } finally {
          if (setLoading) setLoading(false);
      }
    },
    [token, onRefresh, setLoading]
  );

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
        const content = await readPickedContent(file);

        //Prepare the payload
        const payload = {
          fileName: file.name,
          type: "file",
          parentId: parentId, // If null, uploads to Root. If ID exists, uploads to that folder.
          content,
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
    async (fileId, newName, originalName = "", isFolder = false) => {
      const raw = String(newName || "").trim();
      if (!fileId || !raw) return;
      let fixed = raw;
      if (!isFolder) {
        const enforced = enforceLockedExt(raw, originalName);
        if (!enforced) {
          Alert.alert("Invalid Name", "Name cannot be empty.");
          return;
        }
        fixed = enforced;
      }
      try {
        if (setLoading) 
            setLoading(true);
        // We use PATCH to update only specific fields (the name)
        await http.patch(`/files/${fileId}`, { name: fixed }, { token });

        if (onRefresh) await onRefresh();
      } catch (e) {
          handleError(e, "Rename failed");
      } finally {
          if (setLoading) 
              setLoading(false);
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
    handleShare,
    handleReplaceContent,
  };
};
