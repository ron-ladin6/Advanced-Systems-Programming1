import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import SideMenu from "./SideMenu";
import "./MainLayout.css";

//component that includes navigation bar, side menu and outlet
export default function MainLayout() {
  //the search state
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  // hide watermark on file view pages: /app/files/:id
  const hideWatermark = /^\/app\/files\/[^/]+$/.test(location.pathname);



  return (
    <div className="app-shell">
      <NavigationBar search={setSearchQuery} />
      <div className={`app-body ${hideWatermark ? "" : "has-watermark"}`}>
        {/* a side menu component */}
        <SideMenu />
        <main className="app-content">
          <Outlet context={{ searchQuery }} />
        </main>
      </div>
    </div>
  );
}