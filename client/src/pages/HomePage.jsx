import React, { useEffect, useRef, useState } from "react";
import FileList from "../components/FileList";
import NewFolderModal from "../components/NewFolderModal";
import { useNavigate, useOutletContext } from "react-router-dom";
import ShareModal from "../components/ShareModal";
import "./HomePage.css";

const API_BASE = "http://localhost:5000/api";

const HomePage = () => {
  const navigate = useNavigate();
  // state for current folder
  const [parentId, setParentId] = useState(null);
  // state for files
  const [items, setItems] = useState([]);
  // state for breadcrumbs
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  // UI State
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  // ref for upload input
  const uploadRef = useRef(null);
  // get search query from context
  const { searchQuery } = useOutletContext() || { searchQuery: "" };
  // state for share modal
  const [fileToShare, setFileToShare] = useState(null);
  const [fileToMove, setFileToMove] = useState(null);
  const [error, setError] = useState("");

  // helper to get headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: "Bearer " + token } : {};
  };

  // helper for json headers
  const getJsonAuthHeaders = () => {
    return { ...getAuthHeaders(), "Content-Type": "application/json" };
  };
  // Convert HTTP status to a user-friendly message (minimal)
  const msgByStatus = (status, fallback) => {
    if (status === 401 || status === 403)
      return "Session expired. Please login again.";
    if (status === 404) return "Item not found (it may have been deleted).";
    if (status === 409) return "Name already exists in this folder.";
    if (status === 413) return "File is too large.";
    if (status >= 500) return "Server error. Please try again.";
    return `${fallback} (${status})`;
  };

  // load files from server
  const loadItems = async () => {
    setError(""); // clear previous error
    let url = API_BASE + "/files";
    if (searchQuery) {
      url = API_BASE + "/search?q=" + encodeURIComponent(searchQuery);
    } else if (parentId) {
      url = API_BASE + "/files?parentId=" + parentId;
    }
    try {
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) {
        // clear list to avoid showing stale items
        setItems([]);
        setError(msgByStatus(res.status, "Failed to load files"));
        return;
      }
      setItems(await res.json());
    } catch {
      setItems([]);
      setError("Network error. Is the server running?");
    }
  };

  useEffect(() => {
    //load items when search query or parentId changes
    loadItems();
    // eslint-disable-next-line
  }, [searchQuery, parentId]);

  // Navigation Logic
  const enterFolder = (folder) => {
    if (!folder || folder.type !== "folder") return;
    setParentId(folder.id);
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };
  // Breadcrumbs Logic
  const goToCrumb = (index) => {
    const next = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(next);
    setParentId(next[index].id);
  };
  //root breadcrumb
  const goRoot = () => {
    setBreadcrumbs([]);
    setParentId(null);
  };
  //navigate to file view
  const openFile = (file) => {
    navigate(`/app/files/${file.id}`);
  };
  // rename file/folder
  //function to handle renaming a file or folder
  const renameItem = async (item) => {
    //ask user for new name
    const newName = window.prompt("New name:", item.name);
    //if user cancelled, do nothing
    if (!newName) 
        return;
    //remove extra spaces
    const trimmed = newName.trim();
    //if empty or same name, stop here
    if (!trimmed || trimmed === item.name) 
        return;
    setError("");
    const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(item.name || "");
    if (isImage) {
      const oldExt = (item.name.match(/\.(png|jpg|jpeg|gif|webp)$/i) || [])[0];
      const newExt = (trimmed.match(/\.(png|jpg|jpeg|gif|webp)$/i) || [])[0];
      //if one is one of images above you can't erase the ending(png/jpg/..)
      if (!newExt || newExt.toLowerCase() !== oldExt.toLowerCase()) {
        alert(`Image files must keep the original extension (${oldExt}).`);
        return;
      }
    }
    try {
      //send update request to server
      const res = await fetch(`${API_BASE}/files/${item.id}`, {
        method: "PATCH",
        headers: getJsonAuthHeaders(),
        body: JSON.stringify({ name: trimmed }),
      });
      //show error if it fails
      if (!res.ok) {
        setError(msgByStatus(res.status, "Rename failed"));
        return;
      }
      //update the breadcrumbs immediately if we renamed a folder we are in
      setBreadcrumbs((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, name: trimmed } : c))
      );
      //refresh the list after rename
      loadItems();
    } catch {
      setError("Network error during rename.");
    }
  };
  //file upload handler
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) 
        return;
    //read file content
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const content = ev.target.result;
      setError(""); //clear previous error
      //upload to server
      try {
        const res = await fetch(API_BASE + "/files", {
          method: "POST",
          headers: getJsonAuthHeaders(),
          body: JSON.stringify({
            fileName: file.name,
            type: "file",
            content: content,
            parentId: parentId,
          }),
        });
        //if not ok, show error
        if (!res.ok) {
          setError(msgByStatus(res.status, "Upload failed"));
          return;
        }
        loadItems();
      } catch {
        setError("Network error during upload.");
      }
    };
    reader.readAsDataURL(file);
    if (uploadRef.current) uploadRef.current.value = "";
  };
  //file delete handler
  const deleteFile = async (item) => {
    if (!window.confirm("Delete " + item.name + "?")) return;
    setError("");
    try {
      const res = await fetch(`${API_BASE}/files/${item.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        setError(msgByStatus(res.status, "Delete failed"));
        return;
      }
      loadItems();
    } catch {
      setError("Network error during delete.");
    }
  };
  //toggle star handler
  const toggleStar = async (item) => {
    const token = localStorage.getItem("token");
    setError("");
    try {
      const res = await fetch(`${API_BASE}/files/${item.id}`, {
        method: "PATCH",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isStarred: !item.isStarred }),
      });
      if (!res.ok) {
        setError(msgByStatus(res.status, "Star toggle failed"));
        return;
      }
      //load items to reflect change
      loadItems();
    } catch (err) {
      console.error("Star toggle failed", err);
      setError("Network error during star toggle.");
    }
  };
  const startMove = (item) => {
    setFileToMove(item);
    alert(
      `Selected "${item.name}". Navigate to destination and click Move Here.`
    );
  };
  //complete move handler
  const completeMove = async () => {
    if (!fileToMove) return;
    setError("");
    try {
      const res = await fetch(`${API_BASE}/files/${fileToMove.id}`, {
        method: "PATCH",
        headers: getJsonAuthHeaders(),
        body: JSON.stringify({ parentId: parentId }),
      });
      if (!res.ok) {
        setError(msgByStatus(res.status, "Move failed"));
        return;
      }
      //refresh list and clear move state
      setFileToMove(null);
      loadItems();
      alert("File moved successfully!");
    } catch {
      setError("Network error during move.");
    }
  };
  return (
    //content wrapper
    <div className="content-area">
      {/* display error message box if needed */}
      {error && (
        <div style={{
            backgroundColor: "#ffeeee",
            color: "#c62828",
            padding: "10px",
            marginBottom: "10px",
            border: "1px solid red",
        }}>
          {error}
        </div>
      )}
      {/* banner that appears when we are moving a file */}
      {fileToMove && (
        <div className="move-banner">
          <span className="move-banner-text">
            Moving <b>{fileToMove.name}</b>. Navigate to destination & confirm.
          </span>
          <div className="move-actions">
            {/* button to confirm move to current location */}
            <button onClick={completeMove} className="unified-btn">
              Confirm - Move Here
            </button>
            {/* cancel the move operation */}
            <button
              onClick={() => setFileToMove(null)}
              className="unified-btn danger"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* toolbar for main actions */}
      <div className="toolbar">
        <button
          className="btn-action btn-new-folder"
          onClick={() => setIsNewFolderOpen(true)}
        >
          New Folder
        </button>
        {/* hidden input for file selection */}
        <input
          type="file"
          id="file-upload"
          ref={uploadRef}
          onChange={handleUpload}
          className="hidden-input"
        />
        {/* label acts as the button for the file input */}
        <label htmlFor="file-upload" className="btn-action btn-upload">
          Upload File
        </label>
      </div>
      {/* navigation path at the top */}
      <div className="breadcrumbs">
        {/* icon to go back to root */}
        <span className="crumb-item" onClick={goRoot}>
          Folder
        </span>
        {/* loop through path items */}
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={crumb.id}>
            <span className="crumb-separator">/</span>
            <span className="crumb-item" onClick={() => goToCrumb(i)}>
              {crumb.name}
            </span>
          </React.Fragment>
        ))}
      </div>
      {/* the actual list of files and folders */}
      <FileList
        items={items}
        onEnterFolder={enterFolder}
        onOpenFile={openFile}
        onDelete={deleteFile}
        onToggleStar={toggleStar}
        onShare={(file) => setFileToShare(file)}
        onMove={startMove}
        onRename={renameItem}
        deleteLabel="Delete"
      />
      {/* popup for creating new folder */}
      {isNewFolderOpen && (
        <NewFolderModal
          onClose={() => setIsNewFolderOpen(false)}
          parentId={parentId}
          onSuccess={loadItems}
          apiBase={API_BASE}
          headers={getJsonAuthHeaders()}
        />
      )}
      {/* popup for sharing files */}
      {fileToShare && (
        <ShareModal
          file={fileToShare}
          onClose={() => setFileToShare(null)}
          apiBase={API_BASE}
          headers={getJsonAuthHeaders()}
        />
      )}
    </div>
  );
};

export default HomePage;
