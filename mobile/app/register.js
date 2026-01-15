import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import MainButton from "../src/components/MainButton";
import { Theme } from "../src/styles/Theme";
import { useAuth } from "../src/context/AuthContext";
import * as ImagePicker from "expo-image-picker";

export default function Register() {
  const router = useRouter();
  const { register, loading, error, setError } = useAuth();

  //form state
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");

  const [profilePictureURL, setProfilePictureURL] = useState("");

  //function to open the phone's gallery and pick an image
  const pickImage = async () => {
    setError("");
    // ask for permission to access photos
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("Permission to access gallery was denied");
      return;
    }
    //open the picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      //compress the image a bit
      quality: 0.7,
      //let the user crop/edit
      allowsEditing: true,
      //square aspect ratio
      aspect: [1, 1],
    });
    //if the user didn't cancel, save the URI
    if (!result.canceled && result.assets?.[0]?.uri) {
      setProfilePictureURL(result.assets[0].uri);
    }
  };

  const onRegister = async () => {
    const finalDisplay = (displayName || "").trim() || username.trim();
    // default picture so user can choose not to upload one
    const finalProfilePictureURL = profilePictureURL || "";
    //check if all required fields are filled
    if (!username || !email || !password || !verifyPassword) {
        setError("Username, email and passwords are required");
        return;
    }
    //check password validity
    if (!password) {
      return "you must enter a password";
    }
    if (password.length > 0 && password.length < 8) {
        setError("password must be at least 8 characters");
        return;
    }
    if (password.length >= 8 && !/[A-Z]/.test(password)) {
        setError("password must contain at least one uppercase letter");
        return;
    }
    if (password.length >= 8 && !/[0-9]/.test(password)) {
        setError("password must contain at least one number");
        return;
    }
    //check password complexity (must contain letters and numbers)
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      setError("Password must contain both letters and numbers");
      return;
    }
    //verify passwords match
    if (password !== verifyPassword) {
      setError("Passwords do not match");
      return;
    }
    //call the register function from context
    const ok = await register({
        username: username.trim(),
        email: email.trim(),
        password: password,
        verifyPassword: verifyPassword,
        displayName: finalDisplay,
        profilePictureURL: finalProfilePictureURL,
    });
    //if registration succeeded, go to login page
    if (ok) 
        router.replace("/login");
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Register</Text>
      {/*show error message if something is wrong */}
      {!!error && <Text style={styles.err}>{error}</Text>}
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={(t) => {
          setError("");
          setUsername(t);
        }}
        placeholder="Username"
        placeholderTextColor={Theme.colors.muted}
        autoCapitalize="none"/>
      <TextInput
        style={styles.input}
        value={displayName}
        onChangeText={(t) => {
          setError("");
          setDisplayName(t);
        }}
        placeholder="Display Name(optional)"
        placeholderTextColor={Theme.colors.muted}/>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={(t) => {
          setError("");
          setEmail(t);
        }}
        placeholder="Email"
        placeholderTextColor={Theme.colors.muted}
        autoCapitalize="none"
        keyboardType="email-address"/>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={(t) => {
          setError("");
          setPassword(t);
        }}
        placeholder="Password"
        placeholderTextColor={Theme.colors.muted}
        secureTextEntry/>
      <TextInput
        style={styles.input}
        value={verifyPassword}
        onChangeText={(t) => {
          setError("");
          setVerifyPassword(t);
        }}
        placeholder="Verify Password"
        placeholderTextColor={Theme.colors.muted}
        secureTextEntry
      />
      {/*image Picker Section */}
      <View style={styles.row}>
        <MainButton title="Pick Profile Picture(optional)" onPress={pickImage} disabled={loading} />
      </View>
      {/*preview the selected image */}
      {!!profilePictureURL && (
        <Image source={{ uri: profilePictureURL }} style={styles.avatar} />
      )}
      <MainButton 
        title={loading ? "Creating Account..." : "Register"} 
        onPress={onRegister} 
        disabled={loading} 
      />
      <View style={{ height: Theme.spacing.m }} />
      <MainButton title="Back to Login" onPress={() => router.replace("/login")} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Theme.colors.bg,
    padding: Theme.spacing.l,
    justifyContent: "center",
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
  row: {
    flexDirection: "row",
    // center the button
    justifyContent: "center",
    gap: Theme.spacing.m,
  },
  avatar: {
    width: 100,
    height: 100,
    //circular
    borderRadius: 50,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
});