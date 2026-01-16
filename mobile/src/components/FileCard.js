import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

//func to manage how to show the file card (in the real docs for example the pfd is red , word blue...)
const getFileSettings = (file) => {
  if (file.isFolder || file.type === "folder") {
    return { color: "#F59E0B", label: "FOL" };
  }
  //check the end of the file (png, txt...)
  const fileName = file.name || "";
  const ext = fileName.split(".").pop().toLowerCase();
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
  if (imageExtensions.includes(ext)) return { color: "#3B82F6", label: "IMG" };
  if (ext === "txt") return { color: "#64748B", label: "TXT" };
  return { color: "#94A3B8", label: "?" };
};

const FileCard = ({ file, onNavigate, onMenuAction }) => {
  //connect to the theme
  const { theme } = useTheme();
  const { colors, spacing, radius, font } = theme;

  const { color, label } = getFileSettings(file);

  return (
    <TouchableOpacity
      onPress={onNavigate} //press on the file bring us to the file page and open the text, pic..
      style={[
        styles.cardLayout,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radius.m,
          padding: spacing.s + 4,
          marginVertical: spacing.s,
        },
      ]}
    >
      {/*Left Section: Color Badge */}
      <View
        style={[
          styles.badgeLayout,
          {
            backgroundColor: color,
            borderRadius: radius.m - 4,
            marginRight: spacing.m,
          },
        ]}
      >
        <Text
          style={{
            color: "white",
            fontWeight: "800",
            fontSize: font.small,
          }}
        >
          {label} {/* Displays: IMG, FOL, or TXT */}
        </Text>
      </View>
      {/*Middle Section: File Information*/}
      <View style={styles.info}>
        <Text
          numberOfLines={1}
          style={{
            color: colors.text,
            fontSize: font.body,
            fontWeight: "600",
            marginBottom: 2,
          }}
        >
          {file.name}
        </Text>

        <Text
          style={{
            color: colors.muted,
            fontSize: font.small,
          }}
        >
          {/* Conditional Logic: Show "Folder" for directories, or Size (KB) for files */}
          {label === "FOL"
            ? "Folder"
            : file.size
            ? (file.size / 1024).toFixed(2) + " KB"
            : "Unknown"}
        </Text>
      </View>
      {/*Right Section: Action Menu*/}
      {/*Stops propagation so we don't trigger onNavigate and dont go  inside the file */}
      <TouchableOpacity onPress={onMenuAction} style={styles.menuBtn}>
        <Text
          style={{
            color: colors.text,
            fontSize: font.title,
            fontWeight: "bold",
            lineHeight: font.title,
          }}
        >
          ⋮
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardLayout: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  badgeLayout: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  menuBtn: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FileCard;
