import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import logoImg from "./logo.png";
import sunIcon from "./sun.png";
import moonIcon from "./Moon.png";

const NavigationBar = ({ search }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [colorMode, setColorMode] = useState(localStorage.getItem("color") || "light");
  useEffect(() => {
    //load user data from local storage to display in navigation bar.
    const Name = localStorage.getItem("displayName");
    const Image = localStorage.getItem("profilePic");
    setDisplayName(Name);
    setProfilePic(Image);
  }, []);
  // handle color mode changes so the color mode will stay even if the user refresh the page.
  //and change the mode every time the coloerMode state change.
  useEffect(() => {
    if (colorMode === "dark") {
      document.body.classList.add("dark-mode");
      localStorage.setItem("color", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("color", "light");
    }
  }, [colorMode]);

  const logOut = () => {
    //delete all the data from local storage when logging out
    localStorage.clear();
    navigate("/");
  };
  // handle search input change
  const Search = (e) => {
    const text = e.target.value;
    //we want the user can see what the string that he search
    setQuery(text);
    //send the search text to the parent component
    search(text);
  };
  const changeColorMode = () => {
    //toggle dark mode class on body
    setColorMode(colorMode === "light" ? "dark" : "light");
  };
  return (
    <nav className="navbar">
      <div className="logo-img">
        <Link to="/HomePage">
          <img src={logoImg} alt="app-logo" className="app-logo" />
        </Link>
      </div>
      <div>
        <input
          type="text"
          className="search-input"
          value={query}
          onChange={Search}
          placeholder="Search files"
        />
      </div>

      <div className="user-area">
        <button
          onClick={changeColorMode}
          className="theme-btn"
          title="Toggle Dark Mode"
        >
          <img
            src={colorMode === "dark" ? sunIcon : moonIcon}
            alt="Theme Toggle"
            className="theme-icon-img"
          />
        </button>
        <span> Hello ,{displayName}!</span>
        <img src={profilePic} alt="Avatar" className="user-img"></img>
        <button onClick={logOut} className="logout">
          Log Out
        </button>
      </div>
    </nav>
  );
};
export default NavigationBar;
