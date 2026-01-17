import React from "react";
import { FlatList, View, Text, StyleSheet, RefreshControl } from "react-native";
import FileCard from "./FileCard";
import { useTheme } from "../context/ThemeContext";

const FileList = ({
  files = [], // The array of file objects
  onFilePress, // Function to handle clicking a file/folder
  onFileMenu, // Function to handle the "three dots" menu
  refreshing = false, // Is the list currently updating?
  onRefresh, // Function to call when user pulls down
}) => {
  const { theme } = useTheme();
  const { colors, spacing, font } = theme;

  //handle the case that there is no files
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text
        style={[styles.emptyText, { color: colors.muted, fontSize: font.body }]}
      >
        No files found
      </Text>
    </View>
  );

  return (
    <FlatList
      data={files} //this is loop that go over all the files
      keyExtractor={(item) => item.id || item._id} // Unique ID for each item
      //How to render a single item?
      renderItem={({ item }) => (
        //use the card component that we create to handle each file separately
        <FileCard
          file={item}
          onNavigate={() => onFilePress(item)}
          onMenuAction={() => onFileMenu(item)}
        />
      )}
      //Style related props
      contentContainerStyle={[
        styles.listContent,
        { padding: spacing.m },
        files.length === 0 && styles.emptyContent, // Center content if empty
      ]}
      //"Pull to Refresh" functionality
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]} // Loading spinner color (Android)
          tintColor={colors.primary} // Loading spinner color (iOS)
        />
      }
      //Handling empty list
      ListEmptyComponent={renderEmptyState}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    // We add padding at the bottom so the last item isn't hidden behind the Floating Button
    paddingBottom: 100,
  },
  emptyContent: {
    flexGrow: 1, // Takes up full height to center the text
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 10,
  },
});

export default FileList;
