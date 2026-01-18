import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

export default function Account() {
  //hook for navigation
  const router = useRouter();
  //access global auth state
  const { logout, user } = useAuth();
  const { theme } = useTheme();
  const { colors, spacing, font, radius } = theme;

  //fallback for missing user name
  const displayName =
    user?.displayName ||
    user?.username ||
    user?.name ||
    "User";

  const email = user?.email || "";

  //calculate first letter for avatar
  const avatarLetter = (String(displayName || "").trim()[0] || "U").toUpperCase();

  const onLogout = () => {
    //handle logout logic
    logout();
    router.replace("/login");
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, padding: spacing.l }]}>
      <Text style={[styles.title, { color: colors.text, fontSize: font.title }]}>
        Account
      </Text>

      {/*profile card section*/}
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
        <View style={styles.row}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={[styles.name, { color: colors.text, fontSize: font.big }]}
              numberOfLines={1}
            >
              {displayName}
            </Text>

            <Text style={[styles.sub, { color: colors.muted, fontSize: font.body }]}>
              {email ? email : "Signed in"}
            </Text>
          </View>
        </View>
      </View>

      {/*actions card section*/}
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
        <Text style={[styles.section, { color: colors.muted, fontSize: font.small }]}>
          ACTIONS
        </Text>

        <View style={{ height: spacing.m }} />

{/*logout button*/}
        <Pressable
          onPress={onLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            {
              borderRadius: radius.m,
              borderColor: colors.border,
              opacity: pressed ? 0.88 : 1,
            },
          ]}
        >
          <Text style={[styles.logoutText, { fontSize: font.body }]}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: 16,
  },
  title: {
    fontWeight: "700",
  },
  card: {
    borderWidth: 1,
//add shadow for depth
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
  },
  name: {
    fontWeight: "700",
  },
  sub: {
    marginTop: 2,
    fontWeight: "500",
  },
  section: {
    fontWeight: "700",
    letterSpacing: 1,
  },
  logoutBtn: {
    width: "100%",
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    backgroundColor: "#DC2626",
  },
  logoutText: {
    color: "white",
    fontWeight: "700",
  },
});