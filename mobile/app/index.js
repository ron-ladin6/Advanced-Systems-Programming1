import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";

//it decides which screen to show based on the user's login status.
export default function Index() {
  //get the token from our AuthContext
  const { token } = useAuth();
  //if the user has a token, they are logged in -> go to home page.
  //otherwise, send them to the login page.
  return <Redirect href={token ? "/(tabs)/index" : "/login"} />;

}
