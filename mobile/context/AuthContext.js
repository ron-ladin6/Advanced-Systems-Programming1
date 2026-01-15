import React, { createContext, useContext, useMemo, useState } from "react";
import { http } from "../api/http";

//create a Context to share authentication state globally
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //clear state when user logs out
  const logout = () => {
    setToken("");
    setUser(null);
    setError("");
  };
  const login = async ({ login, password }) => {
    setLoading(true);
    setError("");
    try {
        const identifier = String(login || "").trim();
        //send login request to server (POST /tokens)
        const data = await http.post("/tokens", {
            login: identifier,
            username: identifier,
            email: identifier,
            password,
        });
        //handle different token field names
        const nextToken = data?.token || data?.accessToken || "";
        const nextUser =
            data?.user ||
            (data?.userId
                ? {
                    id: data.userId,
                    //comes from the server
                    displayName: data.displayName,
                    image: data.image,
                }: null);

            setUser(nextUser);
        //if the server returned the user object, save it.
        //otherwise, if we got a userId, fetch the user details separately.
        if (nextUser) {
            setUser(nextUser);
        } else if (data?.userId) {
            const u = await http.get(`/users/${data.userId}`, { token: nextToken });
            setUser(u);
        } else {
            setUser(null);
        }
        return true;
    } catch (e) {
        setError(e?.message || "login failed");
        setToken("");
        setUser(null);
        return false;
    } finally {
        setLoading(false);
    }
  };
  const register = async ({
    username,
    email,
    password,
    verifyPassword,
    displayName,
    profilePictureURL,
  }) => {
    setLoading(true);
    setError("");
    try {
      //send register request to server (POST /users)
      await http.post("/users", {
        username,
        email,
        password,
        verifyPassword,
        displayName,
        profilePictureURL,
      });
      return true;
    } catch (e) {
        setError(e?.message || "register failed");
        return false;
    } finally {
        setLoading(false);
    }
  };
  //memoize values to avoid unnecessary re-renders
  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      error,
      setError,
      login,
      register,
      logout,
      setUser,
      setToken,
    }),
    [token, user, loading, error]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
//custom hook to easily access auth data
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}