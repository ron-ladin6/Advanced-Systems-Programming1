import React from "react";
import "./FileList.css";

//component that renders the grid of files and folders
const FileList = ({
  items,
  onEnterFolder,
  onOpenFile,
  onDelete,
  onToggleStar,
  onShare,
  onMove,
  onRename,
  onRestore,
  onPermanentDelete,
  deleteLabel = "Delete",
}) => {
  //handle item click - enter if folder, open if file
  const openItem = (item) => {
    if (item.type === "folder") 
        onEnterFolder(item);
    else onOpenFile(item);
  };
  //check file extension to determine the type
  const getFileKind = (name = "") => {
    const n = String(name || "").toLowerCase();
    if (/\.(png|jpg|jpeg|gif|webp)$/.test(n)) 
        return "image";
    if (/\.(pdf)$/.test(n)) 
        return "pdf";
    if (/\.(txt|md)$/.test(n)) 
        return "text";
    return "file";
  };

  //return the correct emoji icon based on type
  const getIcon = (item) => {
    const isFolder = item.type === "folder";
    if (isFolder) 
        return "📁";
    const kind = getFileKind(item.name);
    if (kind === "image") 
        return "🖼️";
    if (kind === "pdf") 
        return "📕";
    if (kind === "text") 
        return "📝";
    return "📄";
  };

  return (
    //wrapper for the grid layout
    <div className="file-grid-wrap">
      <div className="file-grid">
        {/* loop through all items to render them */}
        {items.map((item) => {
          const isFolder = item.type === "folder";
          const icon = getIcon(item);
          return (
            <div
              key={item.id}
              className="file-card"
              role="button"
              tabIndex={0}
              //clicking the card opens the item
              onClick={() => openItem(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter") openItem(item);
              }}
              title={item.name}>
              {/* top row: star + type */}
              <div className="file-card-top">
                <button
                  className={"star-btn" + (item.isStarred ? " starred" : "")}
                  onClick={(e) => {
                    //prevent triggering the card click
                    e.stopPropagation();
                    onToggleStar(item);
                  }}
                  title={item.isStarred ? "Remove star" : "Add star"}>
                  {item.isStarred ? "★" : "☆"}
                </button>
                <div className="file-kind" aria-hidden="true">
                  {icon}
                </div>
              </div>
              {/* icon area */}
              <div className={"file-thumb " + (isFolder ? "folder" : "file")}>
                <span className="file-big-icon" aria-hidden="true">
                  {icon}
                </span>
                <div
                  className="file-actions"
                  //prevent clicks on actions from bubbling up
                  onClick={(e) => e.stopPropagation()}>
                  {/* show move button only for files */}
                  {!isFolder && onMove && (
                    <button
                      className="mini-btn"
                      onClick={() => onMove(item)}
                      title="Change Path">
                      ↔
                    </button>
                  )}
                  {/* restoree button */}
                  {onRestore && (
                    <button
                      className="mini-btn"
                      onClick={() => onRestore(item)}
                      title="Restore"
                    >
                      ↩
                    </button>
                  )}
                  {/* show share button only for files */}
                  {!isFolder && onShare && (
                    <button
                      className="mini-btn"
                      onClick={() => onShare(item)}
                      title="Share">
                      ⤴
                    </button>
                  )}
                  {/* edit button for files */}
                  {!isFolder && (
                    <button
                      className="mini-btn"
                      onClick={() => onOpenFile(item)}
                      title="Edit">
                      ✎
                    </button>
                  )}
                  {/* rename button */}
                  {onRename && (
                    <button
                      className="mini-btn"
                      onClick={() => onRename(item)}
                      title="Rename">
                      ✏️
                    </button>
                  )}
                  {/* delete button if allowed */}
                  {onDelete && deleteLabel && (
                    <button
                      className="mini-btn danger"
                      onClick={() => onDelete(item)}
                      title="Delete">
                      🗑
                    </button>
                  )}
                  {onPermanentDelete && (
                  <button
                    className="mini-btn danger"
                    onClick={() => onPermanentDelete(item)}
                    title="Delete permanently">
                    🧨
                  </button>
                )}
                </div>
              </div>
              {/* name displayed at the bottom */}
              <div className="file-name">{item.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileList;