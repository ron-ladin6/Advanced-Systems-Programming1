import { Drawer } from "expo-router/drawer";
import CustomDrawerContent from "../../components/CustomDrawerContent";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{ headerShown: true }}
      // use our custom component for the menu design
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      {/* screens inside the menu */}
      <Drawer.Screen 
        name="home" 
        options={{ title: "Home" }} 
      />
      
      <Drawer.Screen 
        name="files" 
        options={{ title: "My Files" }} 
      />
    </Drawer>
  );
}