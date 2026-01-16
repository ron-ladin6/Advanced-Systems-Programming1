import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MainButton from "../components/MainButton";
import { Theme } from "../style/Theme";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();
  //get user info and logout function from context
  const { user, logout } = useAuth();
  const onLogout = () => {
    //clear token and user data
    logout();
    //navigate back to login screen
    router.replace("/login");
  };
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Home</Text>
      {/*display dynamic user name */}
      <Text style={styles.txt}>
        {user?.displayName ? `Hello, ${user.displayName}!` : "Hello!"}
      </Text>

      <View style={{ height: Theme.spacing.l }} />

      <MainButton title="Logout" onPress={onLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Theme.colors.bg,
    padding: Theme.spacing.l,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: Theme.font.title,
    fontWeight: "700",
    color: Theme.colors.text,
  },
  txt: {
    fontSize: Theme.font.body,
    color: Theme.colors.muted,
    marginTop: Theme.spacing.s,
  },
});
