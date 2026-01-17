import React from "react";
import { Alert } from "react-native";
import GenericFileScreen from "../components/GenericFileScreen";
import { http } from "../api/http";

export default function SharedScreen() {
  return (
    //using the generic screen for shared files
    <GenericFileScreen
      title="👥 Shared"
      queryParam="shared"
      allowOpen={true}
      buildMenuActions={(file, { token, fetchFiles }) => {
        const fileId = file.id || file._id;

        return [
          {
            text: "Remove from view",
            style: "destructive",
            onPress: async () => {
              try {
                //custom endpoint to remove shared access
                await http.post(`/files/${fileId}/remove_shared`, {}, { token });
                fetchFiles();
              } catch (e) {
                Alert.alert("Error", e?.message || "Failed to remove from view");
              }
            },
          },
        ];
      }}
    />
  );
}