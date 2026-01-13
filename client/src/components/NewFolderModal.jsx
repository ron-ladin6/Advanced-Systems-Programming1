import React, { useState } from "react";

const NewFolderModal = ({ onClose, parentId, onSuccess, apiBase, headers }) => {
  //state for name
  const [folderName, setFolderName] = useState("");
  //state for error
  const [error, setError] = useState("");

  //function to create
  const createFolder = async () => {
  const name = folderName.trim();
  if (!name) {
    setError("Folder name is required.");
    return;
  }
  setError("");
  try {
    const res = await fetch(apiBase + "/files", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        fileName: name,
        type: "folder",
        parentId: parentId,
      }),
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        setError("Session expired. Please login again.");
      } else if (res.status === 409) {
        setError("Folder name already exists in this folder.");
      } else {
        setError(`Failed to create folder (${res.status}).`);
      }
      return;
    }
    onSuccess();
    onClose();
  } catch {
    setError("Network error. Is the server running?");
  }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          color: "black",
          padding: "16px",
          width: "300px",
          border: "1px solid #ccc"
        }}
        //prevent close on click inside
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: "10px", fontWeight: "bold" }}>New Folder</div>
        <input
          style={{ width: "100%", marginBottom: "10px" }}
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="Folder name"
        />
        {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={createFolder}>Create</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default NewFolderModal;