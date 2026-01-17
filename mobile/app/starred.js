import React from "react";
import { Alert } from "react-native";
import GenericFileScreen from "../components/GenericFileScreen";
import { http } from "../api/http";

export default function StarredScreen() {
  return (
    //using the generic screen for starred files
    <GenericFileScreen
      title="⭐ Starred"
      queryParam="starred"
      allowOpen={true}
      buildMenuActions={(file, { token, fetchFiles }) => {
        const fileId = file.id || file._id;

        return [
          {
            text: "Unstar",
            onPress: async () => {
              try {
                //remove star from file
                await http.patch(`/files/${fileId}`, { isStarred: false }, { token });
                fetchFiles();
              } catch (e) {
                Alert.alert("Error", e?.message || "Failed to unstar");
              }
            },
          },
          {
            text: "Move to Trash",
            style: "destructive",
            onPress: async () => {
              try {
                //move file to trash
                await http.delete(`/files/${fileId}`, { token });
                fetchFiles();
              } catch (e) {
                Alert.alert("Error", e?.message || "Failed to move to trash");
              }
            },
          },
        ];
      }}
    />
  );
}