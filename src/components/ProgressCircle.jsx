import React from "react";

const ProgressCircle = ({ percentage, size = 80, color = "#3B82F6", strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const dash = `${Math.min(100, Math.max(0, percentage)) / 100 * circumference} ${circumference}`;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E7EB" strokeWidth={strokeWidth} fill="transparent" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="transparent" strokeDasharray={dash} strokeLinecap="round" className="transition-all duration-300" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-gray-800">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

export default ProgressCircle;
