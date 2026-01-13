import React from "react";
import "./Components.css";
// the button component get the text to display,onClick function and type of the button(submit,reset()
const CustomButton = ({ text, onClick, type = "button", disabled = false }) => {
  return (
    <button
      type={type}
      className="custom-btn"
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default CustomButton;
