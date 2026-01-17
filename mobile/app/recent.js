import React from "react";
import { Alert } from "react-native";
import GenericFileScreen from "../components/GenericFileScreen";
import { http } from "../api/http";

export default function RecentScreen() {
  return (
    //using the generic screen for recent files
    <GenericFileScreen
      title="🕒 Recent"
      queryParam="recent"
      allowOpen={true}
      buildMenuActions={(file, { token, fetchFiles }) => {
        const fileId = file.id || file._id;
        const nextStar = !file.isStarred;

        return [
          {
            text: nextStar ? "Star" : "Unstar",
            onPress: async () => {
              try {
                //toggle star status
                await http.patch(`/files/${fileId}`, { isStarred: nextStar }, { token });
                fetchFiles();
              } catch (e) {
                Alert.alert("Error", e?.message || "Failed to update star");
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