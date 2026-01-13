import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";
import HomePage from "./pages/HomePage";
import FilePage from "./pages/FilePage";
import RecentView from "./pages/views/RecentView";
import SharedView from "./pages/views/SharedView";
import StarredView from "./pages/views/StarredView";
import TrashView from "./pages/views/TrashView";
//main app that handles routing
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* redirect /LandingPage to / */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/LandingPage" element={<Navigate to="/" replace />} />
        {/* login and register routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* protected routes */}
        <Route element={<ProtectedRoute />}>
          {/* main app layout route */}
          <Route path="/app" element={<MainLayout />}>
            {/* default to recent view */}
            <Route index element={<Navigate to="files" replace />} />
            <Route path="files" element={<HomePage />} />
            <Route path="files/:id" element={<FilePage />} />
            <Route path="recent" element={<RecentView />} />
            <Route path="shared" element={<SharedView />} />
            <Route path="starred" element={<StarredView />} />
            <Route path="trash" element={<TrashView />} />
          </Route>
          {/* redirect /HomePage to /app/recent */}
          <Route
            path="/HomePage"
            element={<Navigate to="/app/files" replace />}
          />
        </Route>
        {/* catch all route to redirect to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
