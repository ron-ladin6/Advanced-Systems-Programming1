import React from "react";
import { Navigate, Outlet } from "react-router-dom";
//component that protects routes that require authentication
export default function ProtectedRoute() {
    //check for token in local storage
    const token = localStorage.getItem("token");
    //if no token, redirect to login
    if (!token) return <Navigate to="/login" replace />;
    //if token exists, render child routes
    return <Outlet />;
}