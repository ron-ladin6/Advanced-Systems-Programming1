import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import SideMenu from "./SideMenu";
import "./MainLayout.css";

import logo from "../components/logo.png";


//component that includes navigation bar, side menu and outlet
export default function MainLayout() {
  //the search state
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <div className="app-shell">
      <NavigationBar search={setSearchQuery} />
      <div className="app-body">
        <div className="watermark-container">
        <img className="watermark-img" src={logo} alt="watermark" />
      </div>
        {/* a side menu component */}
        <SideMenu />
        <main className="app-content">
          <Outlet context={{ searchQuery }} />
        </main>
      </div>
    </div>
  );
}
