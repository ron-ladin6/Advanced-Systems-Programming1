import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  Alert,
  Linking,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { API_BASE } from "../../api/config";
import { http } from "../../api/http";
import { useFileActions } from "../../Hooks/FileFuncs";

export default function FileViewer() {
  /*Hooks & Configuration
     Initialize navigation, user authentication, and theme.
     "useLocalSearchParams" retrieves the file ID/Name passed from the Home screen.*/
  const router = useRouter();
  // We added 'canEdit' to the params to check permissions
  const { id, name, type, canEdit } = useLocalSearchParams();
  const { token } = useAuth();
  const { theme } = useTheme();
  const isEditable = canEdit == null ? true : canEdit === "true";
  /* State Management
     content: Stores the text of a .txt file.
    imageUrl: Stores the full link to the image.
     UI States: 'loading' (initial fetch), 'saving' (uploading changes), 
       and 'isEditing' (shows the save button) */
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { handleReplaceContent } = useFileActions(token, null, setSaving);


  /* Component Lifecycle Safety (isMounted)
     This prevents the app from crashing if the user leaves the screen 
     before the server responds. We check 'isMounted.current' before 
     updating any state.*/
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false; // Cleanup when screen closes
    };
  }, []);

  /* Data Fetching Logic
     The "Brain" of the component. It runs once when the component mounts.
      IF IMAGE: We construct the URL directly (no fetch needed).
      IF TEXT: We perform a GET request to download the text content.*/
  useEffect(() => {
    const fetchFileContent = async () => {
      if (!token || !id) return;

      try {
        setLoading(true);
        const fileData = await http.get(`/files/${id}`, { token });
        if (isMounted.current) {
          setContent(fileData.content || "");
          setIsEditing(false);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading file:", error);
        if (isMounted.current) {
          Alert.alert("Error", "Could not load file content");
          setLoading(false);
        }
      }
    };

    fetchFileContent();
  }, [id, token, type]);

  const handleDownload = async () => {
  try {
    if (!token || !id) return;

    const url = `${API_BASE}/files/${id}/download?token=${encodeURIComponent(token)}`;
    const can = await Linking.canOpenURL(url);
    if (!can) throw new Error("Device can't open this URL");

    await Linking.openURL(url);
  } catch (e) {
    Alert.alert("Download failed", e?.message || "Download failed");
  }
};

  /* Save Action (Text Only)
     This function sends the updated text back to the server using a PUT request.
     It handles the 'saving' spinner and error alerts.*/
  const handleSave = async () => {
    if (!token || !id) return;

    setSaving(true);
    try {
      await http.patch(`/files/${id}`, { content }, { token });
      if (isMounted.current) {
        Alert.alert("Success", "File saved successfully");
        setIsEditing(false); // Hide the save button after success
      }
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "Failed to save changes");
    } finally {
      if (isMounted.current) {
        setSaving(false);
      }
    }
  };

  /*Loading View
     Displays a spinner while the initial data is being fetched.*/
  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.bg }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  /* Header
     Displays the Top Bar with:
     1. Back Button
     2. File Name (Title)
     3. Save Button (Conditional: only shows if text was edited AND user is owner)*/
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.bg }]}
    >
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.titleWrap}>
          <Text
            style={[styles.title, { color: theme.colors.text }]}
            numberOfLines={1}
            ellipsizeMode="middle">
            {String(name || "")}
          </Text>
        </View>

        <View style={styles.rightActions}>
          {type === "text" && isEditing && isEditable ? (
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={[styles.actionBtn, saving && styles.actionBtnDisabled]}
            >
              {saving ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <MaterialIcons name="save" size={22} color={theme.colors.primary} />
              )}
              <Text style={[styles.actionText, { color: theme.colors.primary }]}>Save</Text>
            </TouchableOpacity>
          ) : (
            <>
              {isEditable && (type === "image" || type === "text") && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={async () => {
                    if (!id) return;
                    const pickerType = type === "image" ? ["image/*"] : ["text/*"];
                    const next = await handleReplaceContent(id, pickerType);
                    if (typeof next === "string") {
                      setContent(next);
                      setIsEditing(false);
                    }
                  }}
                >
                  <MaterialIcons name="swap-horiz" size={22} color={theme.colors.primary} />
                  <Text style={[styles.actionText, { color: theme.colors.primary }]}>Replace</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.actionBtn} onPress={handleDownload}>
                <MaterialIcons name="download" size={22} color={theme.colors.primary} />
                <Text style={[styles.actionText, { color: theme.colors.primary }]}>Download</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Content Area
          Dynamically renders either an Image Viewer or a Text Editor.
          - Images include Authorization headers.
          - Text Input is wrapped in KeyboardAvoidingView for iOS support. 
          - Text Input is locked (editable=false) if permission is denied. */}
      <View style={styles.contentContainer}>
        {type === "image" ? (
          !content ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <Image
              source={{ uri: content }}
              style={styles.image}
              resizeMode="contain"
            />
          )
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
          >
            <TextInput
              style={[
                styles.textArea,
                {
                  color: theme.colors.text,
                  // Visual cue: Change background if read-only
                  backgroundColor: isEditable
                    ? theme.colors.surface
                    : theme.colors.bg,
                  borderColor: theme.colors.border,
                },
              ]}
              multiline
              value={content}
              // Lock keyboard if not owner
              editable={isEditable}
              onChangeText={(text) => {
                setContent(text);
                setIsEditing(true); // Enable save button on user input
              }}
              // Dynamic placeholder based on permission
              placeholder={isEditable ? "Start typing..." : "Read only view"}
              placeholderTextColor={theme.colors.muted}
              textAlignVertical="top"
            />
          </KeyboardAvoidingView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 64,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
    maxWidth: "90%",
    marginHorizontal: 10,
  },
   rightActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionBtn: {
    width: 74,
    height: 50,
    marginLeft: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  actionText: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "600",
  },
  actionBtnDisabled: {
    opacity: 0.6,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textArea: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
});
