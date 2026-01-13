import React from "react";
import "./Components.css";
// the input component get the label,text,type of the input(text,password,email) and onChange function
const CustomInput = ({ label, value, type = "text", onChange, error }) => {
  return (
    <div className="input-container">
      <label className="input-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="custom-input"
      />
      {error && <div className="error-msg">{error}</div>}
    </div>
  );
};

export default CustomInput;
