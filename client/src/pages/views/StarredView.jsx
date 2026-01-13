import React from "react";
import FileViewLoader from "../../components/FileViewLoader";

const API_BASE = "http://localhost:5000/api";

const StarredView = () => {
  return (
    <div className="view-container">
      <h2 className="view-title">⭐ Starred Files</h2>
      {/* load files that are marked as starred */}
      <FileViewLoader
        fetchUrl={`${API_BASE}/files?starred=true`}
        viewMode="starred"/>
    </div>
  );
};

export default StarredView;