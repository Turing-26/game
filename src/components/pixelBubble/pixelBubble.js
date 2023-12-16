import React from "react";
import "./pixelBubble.css";

const PixelBubble = ({ type, direction, style, refer, children }) => {
  return (
    <div
      style={style}
      className={`bubble grow ${type} ${direction}`}
      ref={refer}
    >
      {children}
    </div>
  );
};

export default PixelBubble;
