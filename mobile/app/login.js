import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import MainButton from "../components/MainButton";
import { Theme } from "../style/Theme";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const router = useRouter();
  //get auth functions and state from our Context
  const { login, loading, error, setError } = useAuth();
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = async () => {
    //ensure fields are not empty
    if (!loginValue.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    //attempt to login using the context function
    const ok = await login({ login: loginValue, password });
    //if login was successful, navigate to the home screen, replace so the user can't go back to login with the 'back' button
    if (ok) 
        router.replace("/(tabs)");
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Login</Text>
      {/* Display error message if it exists */}
      {!!error && <Text style={styles.err}>{error}</Text>}
      <TextInput
        style={styles.input}
        value={loginValue}
        onChangeText={(t) => {
          //Clear error when user types
          setError("");
          setLoginValue(t);
        }}
        placeholder="Username or email"
        placeholderTextColor={Theme.colors.muted}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        value={password}
        onChangeText={(t) => {
          setError("");
          setPassword(t);
        }}
        placeholder="Password"
        placeholderTextColor={Theme.colors.muted}
        //hide password characters
        secureTextEntry
      />

      <MainButton
        title={loading ? "Loading..." : "Login"}
        onPress={onLogin}
        disabled={loading}
      />

      <View style={{ height: Theme.spacing.m }} />
      {/* Button to navigate to Register screen we use push here so the user can go back to Login */}
      <MainButton
        title="Go to Register"
        onPress={() => router.push("/register")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Theme.colors.bg,
    padding: Theme.spacing.l,
    justifyContent: "center",
    //adds space between all elements
    gap: Theme.spacing.m,
  },
  title: {
    fontSize: Theme.font.title,
    fontWeight: "700",
    color: Theme.colors.text,
    marginBottom: Theme.spacing.s,
  },
  input: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.m,
    padding: Theme.spacing.m,
    fontSize: Theme.font.body,
    color: Theme.colors.text,
    backgroundColor: Theme.colors.card,
  },
  err: {
    color: Theme.colors.danger,
    fontSize: Theme.font.small,
  },
});
