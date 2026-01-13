import React, { useEffect, useState } from "react";
import FileList from "../../components/FileList";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";

const SharedView = () => {
  // store the list of shared files
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // function to fetch data from backend
    const loadShared = async () => {
      // get token from local storage
      const token = localStorage.getItem("token");
      try {
        // request files with shared flag
        const res = await fetch(`${API_BASE}/files?shared=true`, {
          headers: { Authorization: "Bearer " + token }
        });
        // if success, update state
        if (res.ok) setItems(await res.json());
      } catch {}
    };
    // call it immediately
    loadShared();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Shared with me</h2>
      {/* display the list of files */}
      <FileList 
        items={items}
        onEnterFolder={() => {}}
        // navigate to file view when clicked
        onOpenFile={(item) => navigate(`/app/files/${item.id}`)}
        // prevent deletion of shared files
        onDelete={() => alert("Cannot delete shared files")}
        onToggleStar={() => {}} 
        deleteLabel=""/>
    </div>
  );
};

export default SharedView;