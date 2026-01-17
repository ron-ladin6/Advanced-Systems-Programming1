import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const ThreeDotsMenu = ({ visible, onClose, file, onAction, isTrashMode }) => {
  //Extract values from context
  const { theme } = useTheme();
  const { colors, radius, font } = theme;
  const { user } = useAuth();

  if (!file) 
      return null;

  //Build menu based on permission
  const getOptions = () => {
    const options = [];

    //ownership check: Am I the owner of this file?
    // (Adjust 'id' or 'username' based on the backend response)
    const me = String(user?.id || user?._id || user?.username || "").trim();
    const owner = String(file.ownerId || file.owner || "").trim();
    const isOwner = owner && me && owner === me;

    //File is in Trash
    // In Trash, permissions are allow: Restore or Delete Forever only.
    if (isTrashMode) {
      options.push({
        id: "restore",
        label: "Restore",
        icon: "restore",
        color: colors.text,
      });
      options.push({
        id: "delete_forever",
        label: "Delete Forever",
        icon: "delete-forever",
        color: colors.danger,
      });
      return options;
    }
    //Regular file (Active)
    //Download - Available for everyone (Owner & Viewer)
    options.push({
      id: "download",
      label: "Download",
      icon: "file-download",
      color: colors.text,
    });

    //Star - Available for everyone (Local to user preference)
    options.push({
      id: "toggle_star",
      label: file.isStarred ? "Remove from Starred" : "Add to Starred",
      icon: file.isStarred ? "star" : "star-border",
      color: file.isStarred ? "#fc8505ff" : colors.text,
    });

    // 3. Permission Split (Owner and Viewer)
    if (isOwner) {
      //Owner Menu (Full Access)
      options.push({
        id: "rename",
        label: "Rename",
        icon: "edit",
        color: colors.text,
      });
      options.push({
        id: "share",
        label: "Share",
        icon: "share",
        color: colors.text,
      });
      // "Soft" delete to Trash
      options.push({
        id: "delete",
        label: "Move to Trash",
        icon: "delete",
        color: colors.danger,
      });
    } else {
      //Viewer Menu
      // Viewers cannot delete or edit the original file, only remove it from their view
      options.push({
        id: "remove_shared",
        label: "Remove from view",
        icon: "close",
        color: colors.danger,
      });
    }

    return options;
  };

  const options = getOptions();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Layer 1: Dark Overlay */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Layer 2: White Sheet (Bottom Sheet) */}
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              borderTopLeftRadius: radius.l,
              borderTopRightRadius: radius.l,
            },
          ]}
        >
          {/* Header with Icon and Filename */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <MaterialIcons
              name={file.isFolder ? "folder" : "insert-drive-file"}
              size={24}
              color={file.isFolder ? "#F59E0B" : colors.primary}
            />
            <Text
              numberOfLines={1}
              style={[
                styles.title,
                { color: colors.text, fontSize: font.body },
              ]}
            >
              {file.name}
            </Text>
          </View>

          {/* Options List */}
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={styles.optionRow}
                onPress={() => {
                  onClose(); // Close menu first
                  onAction(opt.id, file); // Report action to parent
                }}
              >
                <View
                  style={[styles.iconContainer, { backgroundColor: colors.bg }]}
                >
                  <MaterialIcons name={opt.icon} size={20} color={opt.color} />
                </View>
                <Text
                  style={[
                    styles.optionText,
                    { color: opt.color, fontSize: font.body },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={onClose}
            style={[styles.cancelBtn, { borderTopColor: colors.border }]}
          >
            <Text style={{ color: colors.muted, fontSize: font.body }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    width: "100%",
    paddingBottom: 20,
    maxHeight: "70%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  title: {
    fontWeight: "bold",
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionText: {
    fontWeight: "500",
  },
  cancelBtn: {
    marginTop: 8,
    paddingVertical: 16,
    alignItems: "center",
    borderTopWidth: 1,
  },
});

export default ThreeDotsMenu;
