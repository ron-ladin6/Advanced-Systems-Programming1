import React from "react";
import { View } from "react-native";
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from "@react-navigation/drawer";
import { useAuth } from "../context/AuthContext";
import { router } from "expo-router";

export default function CustomDrawerContent(props) {
  const { logout } = useAuth();

  return (
    <DrawerContentScrollView {...props}>
      {/* standard list of screens (home, files...) */}
      <DrawerItemList {...props} />
      {/* custom logout button at the bottom */}
      <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: '#ccc' }}>
        <DrawerItem
          label="Logout"
          onPress={() => {
            // clear token and go back to login
            logout();
            router.replace("/login");
          }}
        />
      </View>
    </DrawerContentScrollView>
  );
}