import React from "react";
import "./pixelatedButton.css";

const PixelBubble = ({ onClick, type, children }) => {
  return (
    <div
      className={type === "large" ? `` : "eightbit-btn"}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default PixelBubble;
