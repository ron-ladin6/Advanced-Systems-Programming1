import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Theme } from "../styles/Theme.js";

//it accepts a title, an onPress function, and an optional disabled state.
export default function MainButton({ title, onPress, disabled = false }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      //change opacity when pressed to give visual feedback
      style={({ pressed }) => [
        styles.btn,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={styles.txt}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.m,
    borderRadius: Theme.radius.m,
    alignItems: "center",
    width: "100%",
  },
  pressed: {
    //transparent when clicked
    opacity: 0.85,
  },
  disabled: {
    //grayed out when disabled
    opacity: 0.5,
  },
  txt: {
    color: "white",
    fontSize: Theme.font.body,
    fontWeight: "600",
  },
});