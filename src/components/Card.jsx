import React from "react";

const Card = ({ children, className = "", onClick }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all hover:shadow-md ${onClick ? "cursor-pointer" : ""} ${className}`} onClick={onClick}>
    {children}
  </div>
);

export default Card;
