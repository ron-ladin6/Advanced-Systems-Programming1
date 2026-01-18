import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Animated,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function SideMenu({ visible, onClose, onNavigate, onLogout, active }) {
  const { theme } = useTheme();
  const { colors, spacing, font } = theme;
  const w = 280;

  //animation value for drawer position
  const x = useRef(new Animated.Value(-w)).current;

  useEffect(() => {
    //animate drawer in or out based on visibility
    Animated.timing(x, {
      toValue: visible ? 0 : -w,
      duration: visible ? 180 : 160,
      useNativeDriver: true,
    }).start();
  }, [visible, x]);

  //menu items configuration
  const items = [
    { id: "home", label: "My Drive", icon: "folder-open", route: "/(tabs)" },
    { id: "recent", label: "Recent", icon: "history", route: "/recent" },
    { id: "starred", label: "Starred", icon: "star-border", route: "/starred" },
    { id: "shared", label: "Shared", icon: "people-outline", route: "/shared" },
    { id: "trash", label: "Trash", icon: "delete-outline", route: "/trash" },
  ];

  const go = (route) => {
    //navigate to route and close menu
    if (typeof onNavigate === "function") onNavigate(route);
    if (typeof onClose === "function") onClose();
  };

  const logout = () => {
    //handle logout and close menu
    if (typeof onLogout === "function") onLogout();
    if (typeof onClose === "function") onClose();
  };

  return (
    <Modal visible={!!visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.full}>
        {/*overlay to close menu when clicking outside*/}
        <Pressable style={styles.overlay} onPress={onClose} />
        <Animated.View
          style={[
            styles.drawer,
            {
              width: w,
              backgroundColor: colors.card,
              borderRightColor: colors.border,
              transform: [{ translateX: x }],
            },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: colors.border, padding: spacing.m }]}>
            <Text style={{ color: colors.text, fontSize: font.title, fontWeight: "700" }}>
              Drive
            </Text>
          </View>

          <View style={{ paddingTop: spacing.s }}>
            {items.map((it) => {
              const isActive = String(active || "") === it.id;
              return (
                <TouchableOpacity
                  key={it.id}
                  onPress={() => go(it.route)}
                  style={[
                    styles.item,
                    {
                      paddingHorizontal: spacing.m,
                      //highlight active item
                      backgroundColor: isActive ? "rgba(99,102,241,0.12)" : "transparent",
                    },
                  ]}>
                  <MaterialIcons name={it.icon} size={22} color={colors.text} />
                  <Text style={{ marginLeft: 12, color: colors.text, fontSize: font.body }}>
                    {it.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={logout}
            style={[styles.item, { paddingHorizontal: spacing.m, paddingBottom: spacing.l }]}>
            <MaterialIcons name="logout" size={22} color={colors.danger} />
            <Text style={{ marginLeft: 12, color: colors.danger, fontSize: font.body }}>
              Logout
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1, flexDirection: "row" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)" },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRightWidth: 1,
  },
  header: { borderBottomWidth: 1 },
  item: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
  },
});