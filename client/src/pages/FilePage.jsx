import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";
//page to display file content
const FilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [content, setContent] = useState("");
  const [replacing, setReplacing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editName, setEditName] = useState("");
  const [renaming, setRenaming] = useState(false);
  const replaceInputRef = useRef(null);

  //fetch file data on mount
  useEffect(() => {
    const fetchFile = async () => {
      const token = localStorage.getItem("token");
      setSuccess("");
      setError("");
      //fetch file details
      try {
        //fetch file metadata
        const res = await fetch(`${API_BASE}/files/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        //if not ok, redirect back
        if (!res.ok) {
          setError(`Failed to load file (${res.status}).`);
          return;
        }
        //parse json
        const data = await res.json();
        //set file state
        setFile(data);
        setEditName(data.name || "");
        let fileContent = data.content || "";
        const lowerName = (data.name || "").toLowerCase();
        //check file type
        const isImage = lowerName.match(/\.(jpg|jpeg|png|gif)$/);
        const isDoc = lowerName.match(/\.(doc|docx|pdf)$/);
        //if text file and content is data URL, decode it
        if (!isImage && !isDoc && typeof fileContent === "string" && fileContent.startsWith("data:")) {
          try {
            fileContent = decodeURIComponent(escape(window.atob(fileContent.split(",")[1])));
          } catch {}
        }
        //set content state
        setContent(fileContent);
      } catch {
        setError("Network error. Is the server running?");
      }
    };
    //run fetch
    fetchFile();
  }, [id, navigate]);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    setSuccess("");
    setError("");
    let finalContent = "";
    try {
      const base64Content = window.btoa(unescape(encodeURIComponent(content)));
      finalContent = `data:text/plain;base64,${base64Content}`;
    } catch {
      setError("Failed to encode text. Please use plain text only.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/files/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: finalContent }),
      });

      if (res.ok || res.status === 204) {
        navigate(-1);
        return;
      } else {
        setError(`Failed to save file (${res.status}).`);
      }
    } catch (err) {
      console.error(err);
      setError("Network error during save.");
    }
  };

  const handleRename = async () => {
  if (!file) return;

  const token = localStorage.getItem("token");
  const next = String(editName || "").trim();

  setSuccess("");
  setError("");

  if (!next) {
    setError("Name is required.");
    return;
  }

  // no change
  if (next === file.name) {
    setSuccess("Name is already up to date.");
    return;
  }

  setRenaming(true);
  try {
    // Try "name" first, then fallback to "fileName"
    let res = await fetch(`${API_BASE}/files/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: next }),
    });

    if (!res.ok) {
      res = await fetch(`${API_BASE}/files/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileName: next }),
      });
    }

    if (res.ok || res.status === 204) {
      setFile((prev) => (prev ? { ...prev, name: next } : prev));
      setSuccess("Name updated successfully!");
    } else if (res.status === 409) {
      setError("Name already exists in this folder.");
    } else if (res.status === 401 || res.status === 403) {
      setError("Session expired. Please login again.");
    } else {
      setError(`Failed to update name (${res.status}).`);
    }
  } catch (err) {
    console.error(err);
    setError("Network error during rename.");
  } finally {
    setRenaming(false);
  }
};

  const openReplacePicker = () => {
    if (!replaceInputRef.current) return;
    replaceInputRef.current.value = "";
    replaceInputRef.current.click();
  };

  const handleReplaceChosen = async (e) => {
    const chosen = e.target.files?.[0];
    if (!chosen || !file) return;

    const token = localStorage.getItem("token");
    setSuccess("");
    setError("");
    setReplacing(true);

    const lowerName = (file.name || "").toLowerCase();
    const isImage = lowerName.match(/\.(jpg|jpeg|png|gif)$/);
    const isDoc = lowerName.match(/\.(doc|docx|pdf)$/);

    // documents are not previewed here - keep it minimal
    if (isDoc) {
      setError("Replace is not supported for documents in this view.");
      setReplacing(false);
      return;
    }

    try {
      if (isImage) {
        //for images: read as data URL and send to server
        if (!chosen.type.startsWith("image/")) {
          setError("Please choose an image file.");
          setReplacing(false);
          return;
        }

        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = reject;
          reader.readAsDataURL(chosen);
        });

        const res = await fetch(`${API_BASE}/files/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: dataUrl }),
        });

        if (res.ok || res.status === 204) {
          setContent(dataUrl);
          setSuccess("Image replaced successfully!");
        } else {
          setError(`Failed to replace image (${res.status}).`);
        }
      } else {
        //for text: read as text -> encode to base64 data URL -> send to server
        const text = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = reject;
          reader.readAsText(chosen);
        });

        let finalContent = "";
        try {
          const base64Content = window.btoa(unescape(encodeURIComponent(text)));
          finalContent = `data:text/plain;base64,${base64Content}`;
        } catch {
          setError("Failed to encode text. Please use plain text only.");
          return;
        }

        const res = await fetch(`${API_BASE}/files/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: finalContent }),
        });

        if (res.ok || res.status === 204) {
          setContent(text);
          setSuccess("File replaced successfully!");
        } else {
          setError(`Failed to replace file (${res.status}).`);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Network error during replace.");
    } finally {
      setReplacing(false);
      if (replaceInputRef.current) replaceInputRef.current.value = "";
    }
  };

  //if no file yet, show loading
  if (!file) return <div>Loading...</div>;

  //determine file type
  const lowerName = file.name.toLowerCase();
  const isImage = lowerName.match(/\.(jpg|jpeg|png|gif)$/);
  const isDoc = lowerName.match(/\.(doc|docx|pdf)$/);

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <button
        onClick={() => navigate(-1)}
        style={{ marginBottom: "20px", padding: "5px 15px", cursor: "pointer" }}
      >
        Back
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
      <input
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        style={{ fontSize: "18px", padding: "6px 8px", minWidth: "260px" }}
      />
      <button
        onClick={handleRename}
        disabled={renaming}
        style={{ padding: "8px 14px", cursor: renaming ? "not-allowed" : "pointer" }}
      >
        {renaming ? "Saving..." : "Save Name"}
      </button>
      </div>
      <hr />

      {/* error banner (minimal) */}
      {error && (
        <div style={{ backgroundColor: "#ffeeee", color: "#c62828", padding: "10px", marginBottom: "10px", border: "1px solid red" }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ backgroundColor: "#e7f7ea", color: "#1b5e20", padding: "10px", marginBottom: "10px", border: "1px solid #1b5e20" }}>
          {success}
        </div>
      )}
      {/* hidden file input for replace */}
      <input
        ref={replaceInputRef}
        type="file"
        accept={isImage ? "image/*" : ".txt,text/plain"}
        style={{ display: "none" }}
        onChange={handleReplaceChosen}
      />

      <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "20px", minHeight: "300px", background: "white" }}>
        {isImage ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <img src={content} alt={file.name} style={{ maxWidth: "100%" }} />
            <button
              onClick={openReplacePicker}
              disabled={replacing}
              style={{ alignSelf: "flex-start", padding: "10px 20px", cursor: replacing ? "not-allowed" : "pointer" }}
            >
              {replacing ? "Replacing..." : "Replace Image"}
            </button>
          </div>
        ) : isDoc ? (
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <p>Preview not available for documents.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <textarea
              style={{ width: "100%", height: "400px", fontFamily: "monospace", padding: "10px" }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleSave}
                style={{ alignSelf: "flex-start", padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
              >
                Save Changes
              </button>

              <button
                onClick={openReplacePicker}
                disabled={replacing}
                style={{ alignSelf: "flex-start", padding: "10px 20px", cursor: replacing ? "not-allowed" : "pointer" }}
              >
                {replacing ? "Replacing..." : "Replace File"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilePage;