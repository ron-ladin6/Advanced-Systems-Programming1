import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
//using expo router params
import { useLocalSearchParams, useRouter } from "expo-router";
import TopBar from "../../components/TopBar";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { http } from "../../api/http";

export default function ShareScreen() {
  const router = useRouter();
  //get id and name from navigation
  const { id, name } = useLocalSearchParams();
  const fileId = useMemo(() => String(id || ""), [id]);

  const { token, user, logout } = useAuth();
  const { theme } = useTheme();
  const { colors, spacing, radius, font } = theme;

  const myId = String(user?.id || user?._id || "").trim();

  //state for form and data
  const [loading, setLoading] = useState(false);
  const [perms, setPerms] = useState([]);
  const [newUserId, setNewUserId] = useState("");
  const [canEdit, setCanEdit] = useState(false);

  const fetchPermissions = useCallback(async () => {
    if (!token || !fileId) return;
    setLoading(true);
    try {
      //get current permissions list
      const data = await http.get(`/files/${fileId}/permissions`, { token });
      setPerms(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e?.message || "Failed to load permissions";
      if (String(msg).toLowerCase().includes("401")) {
        //handle logout on 401
        logout();
        router.replace("/login");
        return;
      }
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  }, [token, fileId, logout, router]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const handleAdd = async () => {
    const target = String(newUserId || "").trim();
    if (!target) {
      Alert.alert("Missing", "Enter userId to share with.");
      return;
    }
    if (target === myId) {
      Alert.alert("Nope", "You cannot share with yourself.");
      return;
    }

    try {
      setLoading(true);
      //post new permission to server
      await http.post(
        `/files/${fileId}/permissions`,
        { userId: target, canEdit },
        { token }
      );
      setNewUserId("");
      setCanEdit(false);
      await fetchPermissions();
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to add permission");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (perm) => {
    const permId = perm?.id || perm?._id;
    if (!permId) {
      Alert.alert("Error", "Permission id missing from server response.");
      return;
    }

    Alert.alert("Remove access?", "This user will lose access.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            //delete permission from server
            await http.delete(`/files/${fileId}/permissions/${permId}`, {
              token,
            });
            await fetchPermissions();
          } catch (e) {
            Alert.alert("Error", e?.message || "Failed to remove permission");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const uid = String(item?.userId || item?.user || "").trim();
    const editable =
      item?.canEdit === true ||
      item?.permission === "editor" ||
      item?.role === "editor";

    return (
      <View
        style={[
          styles.row,
          {
            backgroundColor: colors.card,
            borderRadius: radius.m,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: font.body,
              fontWeight: "700",
            }}
          >
            {uid || "Unknown user"}
          </Text>
          <Text
            style={{ color: colors.muted, fontSize: font.small, marginTop: 4 }}
          >
            {editable ? "Editor" : "Viewer"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => handleRemove(item)}
          style={[
            styles.removeBtn,
            { borderColor: colors.border, borderRadius: radius.s },
          ]}
        >
          <Text
            style={{
              color: colors.danger,
              fontSize: font.body,
              fontWeight: "700",
            }}
          >
            Remove
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg }}
      edges={["top"]}
    >
      <TopBar
        title={name ? `🤝 Share: ${name}` : "🤝 Share"}
        isSearchMode={false}
        onBack={() => router.back()}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "android" ? undefined : "padding"}
      >
        <View style={{ padding: spacing.m, gap: spacing.m }}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderRadius: radius.m,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: font.body,
                fontWeight: "800",
              }}
            >
              Add access
            </Text>

            <Text
              style={{
                color: colors.muted,
                fontSize: font.small,
                marginTop: 6,
              }}
            >
              Enter the target user's userId
            </Text>

            <TextInput
              value={newUserId}
              onChangeText={setNewUserId}
              placeholder="userId (e.g. 65f... or uuid...)"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  borderRadius: radius.s,
                },
              ]}
            />

            <View style={styles.switchRow}>
              <Text style={{ color: colors.text, fontSize: font.body }}>
                Can edit?
              </Text>
              <Switch value={canEdit} onValueChange={setCanEdit} />
            </View>

            <TouchableOpacity
              onPress={handleAdd}
              disabled={loading}
              style={[
                styles.primaryBtn,
                {
                  backgroundColor: colors.primary,
                  borderRadius: radius.s,
                  opacity: loading ? 0.6 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "800",
                  fontSize: font.body,
                }}
              >
                Share
              </Text>
            </TouchableOpacity>
          </View>

          <Text
            style={{
              color: colors.text,
              fontSize: font.body,
              fontWeight: "800",
            }}
          >
            People with access
          </Text>

          <FlatList
            data={perms}
            keyExtractor={(item, idx) => String(item?.id || item?._id || idx)}
            renderItem={renderItem}
            contentContainerStyle={{ gap: spacing.s, paddingBottom: 30 }}
            ListEmptyComponent={
              <Text style={{ color: colors.muted, fontSize: font.body }}>
                No one has access yet.
              </Text>
            }
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  primaryBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  row: {
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  removeBtn: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
