import React, { useEffect, useState } from "react";
//a modal component to share a file with other users by managing permissions
const ShareModal = ({ file, onClose, apiBase, headers }) => {
  const [userId, setUserId] = useState("");
  const [role] = useState("viewer");
  const [permissions, setPermissions] = useState([]);
  const [error, setError] = useState("");
  //fetch current permissions for the file
  const fetchPermissions = async () => {
    if (!file) return;
    setError("");
    try {
      //fetch permissions
      const res = await fetch(`${apiBase}/files/${file.id}/permissions`, {
        headers,
      });
      //handle errors
      if (!res.ok) {
        setPermissions([]);
        setError(`Failed to load permissions (${res.status}).`);
        return;
      }
      //set permissions
      setPermissions(await res.json());
    } catch {
      setPermissions([]);
      setError("Network error. Is the server running?");
    }
  };
  //fetch permissions when file changes
  useEffect(() => {
    fetchPermissions();
    // eslint-disable-next-line
  }, [file?.id]);
  //add a new permission
  const addPermission = async () => {
    const trimmed = String(userId || "").trim();
    if (!trimmed) {
      setError("Please enter a userId.");
      return;
    }
    //reset error
    setError("");
    try {
      const res = await fetch(`${apiBase}/files/${file.id}/permissions`, {
        method: "POST",
        headers,
        body: JSON.stringify({ userId: trimmed, role }),
      });

      if (res.status === 404) {
        setError("User not found.");
        return;
      }
      if (res.status === 409) {
        setError("This user already has permission.");
        return;
      }
      if (!res.ok) {
        setError(`Failed to add permission (${res.status}).`);
        return;
      }
      //if everything ok, clear input and refresh permissions
      setUserId("");
      await fetchPermissions();
    } catch {
      setError("Network error. Is the server running?");
    }
  };
  //remove a permission
  const removePermission = async (permId) => {
    setError("");
    try {
      const res = await fetch(
        `${apiBase}/files/${file.id}/permissions/${permId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!res.ok) {
        setError(`Failed to remove permission (${res.status}).`);
        return;
      }
      //refresh permissions
      await fetchPermissions();
    } catch {
      setError("Network error. Is the server running?");
    }
  };
  //don't render if no file
  if (!file) 
      return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 8,
          width: 420,
        }}
      >
        <h3>Share "{file.name}"</h3>

        {error && (
          <div style={{ color: "#c62828", background: "#ffeeee", border: "1px solid red", padding: 8, marginBottom: 10 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Enter userId (username)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{ flex: 1, padding: 8 }}
          />

          <select value={role} disabled style={{ padding: 8 }}>
            <option value="viewer">viewer</option>
          </select>

          <button onClick={addPermission} className="btn-action btn-new-folder">
            Share
          </button>
        </div>

        <h4>Shared with:</h4>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {permissions.map((p) => (
            <li
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span>
                {p.userId} ({p.role})
              </span>
              <button
                onClick={() => removePermission(p.id)}
                style={{
                  color: "red",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </li>
          ))}
          {permissions.length === 0 && (
            <li style={{ color: "#999" }}>Not shared with anyone</li>
          )}
        </ul>

        <button
          onClick={onClose}
          style={{ marginTop: 16, width: "100%", padding: 10 }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ShareModal;