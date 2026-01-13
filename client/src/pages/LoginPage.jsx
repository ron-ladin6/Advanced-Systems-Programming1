import React from "react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import "../components/Components.css";
import "../components/AuthPages.css";

const LoginPage = () => {
  const navigate = useNavigate();
  // use states for user inputs and error message
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const loginAttempts = useRef(0);
  const [isLocked, setIsLocked] = useState(false);
  // check if the login is locked
  const checkLock = () => {
    const deadLine = localStorage.getItem("lockUntil");
    if (deadLine) {
      //check if and how much for the locked.
      const remainingTime = parseInt(deadLine) - Date.now();
      if (remainingTime > 0) {
        setIsLocked(true);
        setError(
          `Too many login attempts. Please wait ${Math.ceil(
            remainingTime / 1000
          )} seconds.`
        );
        return true;
      } else {
        //unlock login
        localStorage.removeItem("lockUntil");
        loginAttempts.current = 0;
        setIsLocked(false);
        setError("");
        return false;
      }
    }
  };
  /* run block check when page loads to catch refresh */
  useEffect(() => {
    checkLock();
  }, []);

  // check the inputs to save unnecessary requests
  const validateInput = () => {
    if (!userName || !password) {
      return "Enter user name and password.";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    return null;
  };

  const tryLogin = async (e) => {
    e.preventDefault();
    if (checkLock()) {
      return;
    }
    setError("");
    const errors = validateInput();
    if (errors) {
      setError(errors);
      return;
    }
    /* send user data to the server */
    try {
      const response = await fetch("http://localhost:5000/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userName, password: password }),
      });
      /* save token and go to home page if login works */
      if (response.ok) {
        const loginRes = await response.json();
        const userId = loginRes.userId;
        // save user data to local storage
        localStorage.setItem("userId", userId);
        localStorage.setItem("token", loginRes.token);
        localStorage.setItem("username", userName);
        localStorage.setItem("displayName", loginRes.displayName);
        localStorage.setItem("profilePic", loginRes.image);
        navigate("/HomePage");
        loginAttempts.current = 0;
      } else {
      // choose a clear message by status
      if (response.status === 401 || response.status === 403) {
        setError("Invalid user name or password.");
      } else if (response.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(`Login failed (${response.status}).`);
      }
      // count failed attempts and block after 5 times
      loginAttempts.current += 1;
      if (loginAttempts.current === 5) {
        const lockTime = Date.now() + 60000;
        localStorage.setItem("lockUntil", lockTime);
        setIsLocked(true);
        setError("Too many login attempts. Try again in 60 seconds.");
      }
    }
    } catch (err) {
      setError("Network error. Is the server running?");
    }
  };
  return (
    <div className="register-container">
      <h2>Login Page</h2>
      <form onSubmit={tryLogin}>
        <CustomInput
          label="User Name"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <CustomInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error-message">{error}</p>}
        <CustomButton type="submit" text="Login" disabled={isLocked} />
      </form>
      <div className="login-footer">
        Don't have an account?
      <span className="link-text"onClick={() => navigate("/register")}
      style={{ cursor: "pointer", color: "blue", marginLeft: "5px" }}>Sign up</span>
      </div>
    </div>
  );
};
export default LoginPage;
