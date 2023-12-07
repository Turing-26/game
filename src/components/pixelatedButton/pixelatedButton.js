import React from "react";
import "./pixelatedButton.css";

const PixelatedButton = ({ onClick, type, children }) => {
  return (
    <button
      className={type ? `eightbit-btn eightbit-btn--${type}` : "eightbit-btn"}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default PixelatedButton;
