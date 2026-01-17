import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

const InputModal = ({
  visible,
  onClose,
  onSubmit,
  title,
  defaultValue = "",
  placeholder = "",
}) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, font } = theme;
  const [text, setText] = useState("");

  useEffect(() => {
    if (visible) setText(defaultValue);
  }, [visible, defaultValue]);

  if (!visible) return null;

  return (
    //modal if floating component on the screen and make the focus on the new window
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      transparent={true}
    >
      {/* make sure the keyboard dont cover the text square */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View
          style={[
            styles.container,
            { backgroundColor: colors.card, borderRadius: radius.l },
          ]}
        >
          <Text
            style={[styles.title, { color: colors.text, fontSize: font.title }]}
          >
            {title} {/*show "new folder" or "rename file" */}
          </Text>

          {/* place for user to write the name that he */}
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.bg,
                color: colors.text,
                borderColor: colors.border,
                borderRadius: radius.m,
              },
            ]}
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor={colors.muted}
            autoFocus={true}
          />

          <View style={styles.buttonsRow}>
            {/* Cancel Button */}
            <TouchableOpacity onPress={onClose} style={styles.button}>
              <Text style={{ color: colors.muted, fontSize: font.body }}>
                Cancel
              </Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={() => {
                //handle the case the user try to submit file or folder with empty name.
                if (text.trim().length === 0) {
                  alert("Please enter a name");
                  return;
                }
                onSubmit(text);
                onClose();
              }}
              style={[
                styles.button,
                { backgroundColor: colors.primary, borderRadius: radius.m },
              ]}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: font.body,
                }}
              >
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: "100%",
    maxWidth: 340,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    padding: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});

export default InputModal;
