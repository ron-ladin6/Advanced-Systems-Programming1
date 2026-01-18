import React from "react";
import GenericFileScreen from "../../components/GenericFileScreen";

// View for displaying files shared with the current user.
// It uses the generic screen but points to the '/files/shared' endpoint.
export default function SharedView() {
  return (
    <GenericFileScreen
      title="👥 Shared with me"
      endpoint="/files/shared" // Custom endpoint for this view
      allowOpen={true}
      buildMenuActions={(file) => {
        // Since I am a viewer (not owner), I have limited actions.
        // Currently, no specific actions are required
        // Download is handled by the default viewer if needed.
        return [];
      }}
    />
  );
}
