import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./SideMenu.css";

const SideMenu = () => {
  //get current path to highlight active menu item
  const { pathname } = useLocation();
  //helper to add 'active' class if path matches current location
  const itemClass = (path) =>
    "menu-item" + (pathname === path ? " active" : "");
  return (
    <div className="side-menu-container"> 
      <div className="menu-label">Location</div>
            {/* navigation links for different sections */}
            <Link className={itemClass("/app/files")} to="/app/files">
        📁 My Files
      </Link>
      <Link className={itemClass("/app/recent")} to="/app/recent">
        🕒 Recent
      </Link>
      <Link className={itemClass("/app/starred")} to="/app/starred">
        ⭐ Starred
      </Link>
      <Link className={itemClass("/app/shared")} to="/app/shared">
        👥 Shared
      </Link>
      <Link className={itemClass("/app/trash")} to="/app/trash">
        🗑️ Trash
      </Link>
      {/*divide the menu items*/}
      <hr style={{ margin: "10px 0", border: "0", borderTop: "1px solid #ddd" }} />
      {/*clear local storage and reload to force logout */}
      <div className="menu-item" onClick={() => {
          localStorage.clear();
          window.location.reload();
      }} style={{ cursor: "pointer", color: "red" }}>
          🚪 Log Out
      </div>
    </div>
  );
};

export default SideMenu;