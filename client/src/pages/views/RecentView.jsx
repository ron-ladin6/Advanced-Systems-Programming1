import FileViewLoader from "../../components/FileViewLoader";

const API_BASE = "http://localhost:5000/api";

const RecentView = () => {
  // component to display recently accessed files
  return (
    <div className="view-container">
      <div className="view-header" style={{ marginBottom: "20px" }}>
        <h2 className="view-title">🕒 Recent Files</h2>
      </div>
      {/* reuse the file loader but fetch only recent files */}
      <FileViewLoader
        fetchUrl={`${API_BASE}/files?recent=true`}
        viewMode="recent"
        allowUpload={false}/>
    </div>
  );
};

export default RecentView;