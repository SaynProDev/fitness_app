import React from "react";

const Button = ({ children, onClick, variant = "primary", icon, className = "", disabled }) => {
  const base = "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    success: "bg-green-600 text-white hover:bg-green-700",
    warning: "bg-orange-600 text-white hover:bg-orange-700"
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} onClick={onClick} disabled={disabled}>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
