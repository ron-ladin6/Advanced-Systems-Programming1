import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TopBar = ({
  title = "Drive",
  isSearchMode = false,
  onSearch,
  onBack,
  profileImage,
}) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, font } = theme;

  //fit the safe area for each phone (the are different between types of phones)
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          //Apply dynamic padding for the status bar
          paddingTop: insets.top,
          // The total height will be 60 + the status bar height
          height: 60 + insets.top,
        },
      ]}
    >
      {/* --- LEFT SECTION --- */}
      {/* if we are on search mode (in the home page) show menu page , esle show button to go back */}
      {isSearchMode ? (
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialIcons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      )}

      {/*CENTER SECTION*/}
      {/* like in real drive the is up and middle thee search bar that we put query and get all the fit files*/}
      <View style={styles.centerContent}>
        {isSearchMode ? (
          <TextInput
            placeholder="Search in Drive"
            placeholderTextColor={colors.muted}
            style={[
              styles.searchInput,
              { color: colors.text, fontSize: font.body },
            ]}
            onChangeText={onSearch}
            returnKeyType="search" // Shows "Search" on keyboard instead of "Enter"
            autoCapitalize="none"
            clearButtonMode="while-editing" // iOS only: shows 'X' to clear text
          />
        ) : (
          <Text
            style={[styles.title, { color: colors.text, fontSize: font.title }]}
          >
            {title}
          </Text>
        )}
      </View>

      {/* --- RIGHT SECTION --- */}
      <TouchableOpacity style={styles.profileBtn}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.avatar} />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>U</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: 1,

    // Shadows
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconBtn: {
    padding: 8,
  },
  centerContent: {
    flex: 1,
    marginHorizontal: 8,
    justifyContent: "center",
    height: 40, // Fixed height for the input area
  },
  searchInput: {
    flex: 1, // Fill the centerContent height
    paddingVertical: 0, // Fix alignment on Android
  },
  title: {
    fontWeight: "600",
  },
  profileBtn: {
    padding: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TopBar;
