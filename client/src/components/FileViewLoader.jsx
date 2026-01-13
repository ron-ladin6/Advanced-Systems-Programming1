import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FileList from "./FileList";

const API_BASE = "http://localhost:5000/api";
//a component to load and display files/folders with update capabilities
const FileViewLoader = ({ fetchUrl, viewMode, onShare }) => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  //fetch Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(fetchUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    loadData();
  }, [fetchUrl, token]);

  const handlePermanentDelete = async (item) => {
    // ask for double confirmation because this is permanent
    if (!window.confirm(`Permanently delete "${item.name}"? This cannot be undone.`)) 
        return;

    try {
      // call the api to remove the file from DB
      const res = await fetch(`${API_BASE}/files/${item.id}`, {
        method: "DELETE",
        // pass the token for authorization
        headers: { Authorization: `Bearer ${token}` },
      });

      // 204 means no content (success), res.ok checks 200-299
      if (res.ok || res.status === 204) {
        // remove the item from the local state list
        setItems((prev) => prev.filter((f) => f.id !== item.id));
      } else {
        console.error("Permanent delete failed:", res.status);
      }
    } catch (err) {
      // handle network errors
      console.error("Permanent delete failed:", err);
    }
  };
  //universal Update Handler
  const handleUpdate = async (item, fields) => {
    try {
      const res = await fetch(`${API_BASE}/files/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(fields),
      });

      if (res.ok || res.status === 204) {
        //Decide if we need to remove the item from the view instantly
        const shouldRemove =
          //Remove from Starred if Unstarred OR Deleted
          (viewMode === "starred" &&
            (fields.isStarred === false || fields.isDeleted === true)) ||
          //Remove from Trash if Restored (isDeleted becomes false)
          (viewMode === "trash" && fields.isDeleted === false);

        if (shouldRemove) {
          // Remove item from list
          setItems((prev) => prev.filter((f) => f.id !== item.id));
        } else {
          // Update item in place
          setItems((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, ...fields } : f))
          );
        }
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };
  //FileList makes use of onToggleStar and onDelete props
  return (
    <div>
      <FileList
        items={items}
        onToggleStar={(item) =>
          handleUpdate(item, { isStarred: !item.isStarred })
        }
        onRestore={ viewMode === "trash" && ((item) => handleUpdate(item, { isDeleted: false })) }
        onDelete={ viewMode !== "trash" && ((item) => handleUpdate(item, { isDeleted: true })) }
        onPermanentDelete={viewMode === "trash" ? handlePermanentDelete : undefined}
        onEnterFolder={null}
        onOpenFile={(item) => navigate(`/app/files/${item.id}`)}
        onShare={onShare}
        onMove={null}
        deleteLabel={viewMode === "trash" ? "Restore" : "Delete"}/>
    </div>
  );
};
export default FileViewLoader;
