import { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function ShareModal({ visible, onClose, onSubmit }) {
  const { theme } = useTheme();
  const { colors, radius, font, spacing } = theme;

  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset state whenever the modal opens to ensure a clean UI
  useEffect(() => {
    if (visible) {
      setUsername("");
      setLoading(false);
    }
  }, [visible]);

  const handleSubmit = async () => {
    const target = username.trim();
    if (!target) return;

    setLoading(true);
    // onSubmit refers to handleShare from the hook.
    // It returns true on success, allowing us to close the modal.
    const success = await onSubmit(target);
    setLoading(false);

    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* ensures the input isn't hidden by the keyboard */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.l,
              padding: spacing.l,
            },
          ]}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: font.title,
              fontWeight: "700",
              marginBottom: spacing.s,
              textAlign: "center",
            }}
          >
            Share File
          </Text>

          <Text
            style={{
              color: colors.muted,
              fontSize: font.body,
              marginBottom: spacing.m,
              textAlign: "center",
            }}
          >
            Enter the username of the person you want to share with:
          </Text>

          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.bg,
                borderColor: colors.border,
                borderRadius: radius.m,
                padding: spacing.m,
                fontSize: font.body,
              },
            ]}
          />

          <View style={styles.row}>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.btn,
                {
                  borderColor: colors.border,
                  borderRadius: radius.m,
                  marginRight: 10,
                },
              ]}
            >
              <Text style={{ color: colors.muted, fontWeight: "600" }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading || !username.trim()}
              style={[
                styles.btn,
                {
                  backgroundColor: colors.primary,
                  borderRadius: radius.m,
                  opacity: loading || !username.trim() ? 0.6 : 1,
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={{ color: "#fff", fontWeight: "700" }}>Share</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    borderWidth: 1,
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  input: {
    borderWidth: 1,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
});
