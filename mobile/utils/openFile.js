import { Alert } from "react-native";

//helper function to handle file navigation
export function openFileOrFolder(router, file) {
  if (!file) return;

//check if the item is a folder
  if (file.isFolder || file.type === "folder") {
//navigate to the dynamic folder route
    router.push({
      pathname: "/folder/[id]",
      params: { id: file.id || file._id, name: file.name },
    });
    return;
  }

//extract file extension
  const ext = file.name ? file.name.split(".").pop().toLowerCase() : "";
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
  const isImage = imageExtensions.includes(ext);
  const isText = ext === "txt";

//check if file type is supported for viewing
  if (isImage || isText) {
//navigate to file viewer screen
    router.push({
      pathname: "/File/[id]",
      params: {
        id: file.id || file._id,
        name: file.name,
        type: isImage ? "image" : "text",
      },
    });
  } else {
    Alert.alert("Not Supported", "Only Image and Text files are supported.");
  }
}