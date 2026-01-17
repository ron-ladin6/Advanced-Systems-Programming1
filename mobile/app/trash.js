import React from "react";
import { Alert } from "react-native";
import GenericFileScreen from "../components/GenericFileScreen";
import { http } from "../api/http";

export default function TrashScreen() {
  return (
    //using the generic screen for trash
    <GenericFileScreen
      title="🗑️ Trash"
      queryParam="trash"
      allowOpen={false}
      buildMenuActions={(file, { token, fetchFiles }) => {
        const fileId = file.id || file._id;

        return [
          {
            text: "Restore",
            onPress: async () => {
              try {
                //restore file from trash
                await http.patch(`/files/${fileId}`, { isDeleted: false }, { token });
                fetchFiles();
              } catch (e) {
                Alert.alert("Error", e?.message || "Failed to restore");
              }
            },
          },
          {
            text: "Delete forever",
            style: "destructive",
            onPress: async () => {
              try {
                //permanently delete file
                await http.delete(`/files/${fileId}`, { token });
                fetchFiles();
              } catch (e) {
                Alert.alert("Error", e?.message || "Failed to delete forever");
              }
            },
          },
        ];
      }}
    />
  );
}