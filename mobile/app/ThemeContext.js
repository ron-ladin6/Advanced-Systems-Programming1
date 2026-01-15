import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { LightTheme, DarkTheme } from "../styles/Theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

//Create the Context object
// This acts as a "pipe" to pass data through the component tree without props drilling.
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  //Detect System Preference
  //Check if the user's phone is currently in Dark Mode (system settings).
  const systemScheme = useColorScheme();

  //Initialize State
  // Set the initial state based on the system preference.
  const [isDark, setIsDark] = useState(systemScheme == "dark");

  //Load Saved Preference (Persistence)
  // This effect runs only once when the app starts.
  useEffect(() => {
    const loadTheme = async () => {
      try {
        // Try to get a saved theme value from the phone's storage.
        const savedTheme = await AsyncStorage.getItem("theme");

        // If a value exists, override the default system preference.
        if (savedTheme) {
          setIsDark(savedTheme === "dark");
        }
      } catch (error) {
        console.log("Failed to load theme", error);
      }
    };
    loadTheme();
  }, []);

  //Toggle Function
  // This function switches between light and dark modes and saves the choice.
  const toggleTheme = async () => {
    const newMode = !isDark; // Flip the boolean value
    setIsDark(newMode); // Update the state immediately

    // Save the new preference to storage so it remembers next time.
    await AsyncStorage.setItem("theme", newMode ? "dark" : "light");
  };

  //Select the Active Theme
  // Choose the correct color palette object based on the current state.
  const theme = isDark ? DarkTheme : LightTheme;

  // Provide the Data
  // Wrap the children (the app) with the Provider.
  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

//Custom Hook
// A helper function to easily access the context data from any component.
// Instead of writing useContext(ThemeContext) everywhere, we just call useTheme().
export const useTheme = () => useContext(ThemeContext);
