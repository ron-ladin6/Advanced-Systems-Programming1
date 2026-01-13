import React from "react";
import FileViewLoader from "../../components/FileViewLoader";

const API_BASE = "http://localhost:5000/api";

const TrashView = () => {
  return (
    <div className="view-container">
      <h2 className="view-title">🗑️ Trash</h2>
      {/* load files that are in the trash bin */}
      <FileViewLoader
        fetchUrl={`${API_BASE}/files?trash=true`}
        viewMode="trash"/>
    </div>
  );
};

export default TrashView;
