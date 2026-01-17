import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import FloatingButton from "./FloatingButton";
const PlusBtnMenu = ({
  currentFolder, // To check if we are in Root
  onPressCreateFolder, // Parent should handle folder creation logic
  onPressUpload, // parent should handle file upload logic
}) => {
  const { theme } = useTheme();
  const { colors, radius, font } = theme;

  const [visible, setVisible] = useState(false);

  //
  // If we are NOT in the root folder (currentFolder exists),
  // we do not render anything. The button disappears.
  if (currentFolder) {
    return null;
  }

  const handleAction = (action) => {
    setVisible(false); // Close menu
    if (action == "folder") onPressCreateFolder();
    if (action == "upload") onPressUpload();
  };

  return (
    <>
      {/* 1. The Floating Button */}
      {/* Clicking it opens the modal menu */}
      <FloatingButton onPress={() => setVisible(true)} />

      {/* 2. The Bottom Sheet Menu */}
      <Modal
        visible={visible}
        transparent
        animationType="slide" // Slides up like the 3-dots menu
        onRequestClose={() => setVisible(false)}
      >
        {/* Dark Overlay */}
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          {/*Bottom Sheet */}
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
            {/* Header / Title */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Text
                style={[
                  styles.title,
                  { color: colors.muted, fontSize: font.small },
                ]}
              >
                CREATE NEW
              </Text>
            </View>

            {/* Upload file */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => handleAction("upload")}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: colors.bg }]}
              >
                <MaterialIcons
                  name="file-upload"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <Text
                style={[
                  styles.optionText,
                  { color: colors.text, fontSize: font.body },
                ]}
              >
                Upload File
              </Text>
            </TouchableOpacity>

            {/* create New Folder */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => handleAction("folder")}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: colors.bg }]}
              >
                <MaterialIcons
                  name="create-new-folder"
                  size={24}
                  color="#F59E0B"
                />
              </View>
              <Text
                style={[
                  styles.optionText,
                  { color: colors.text, fontSize: font.body },
                ]}
              >
                New Folder
              </Text>
            </TouchableOpacity>

            {/* Cancel Button*/}
            <TouchableOpacity
              onPress={() => setVisible(false)}
              style={[styles.cancelBtn, { borderTopColor: colors.border }]}
            >
              <Text style={{ color: colors.muted, fontSize: font.body }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end", // Push content to bottom
  },
  sheet: {
    width: "100%",
    paddingBottom: 20, // Safe area for bottom
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    letterSpacing: 1,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionText: {
    fontWeight: "600",
  },
  cancelBtn: {
    marginTop: 8,
    paddingVertical: 16,
    alignItems: "center",
    borderTopWidth: 1,
  },
});

export default PlusBtnMenu;
