// CircularProgress.tsx
import React from 'react';

interface CircularProgressProps {
  size: number; // Diameter of the progress bar
  progress: number; // Progress in percentage (0 to 100)
  strokeWidth: number; // Width of the stroke
}


const CircularProgress: React.FC<CircularProgressProps> = ({ size, progress, strokeWidth }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const circleStyle: React.CSSProperties = {
    fill: 'none',
    stroke: 'rgba(255, 193, 7)',
    strokeLinecap: 'round',
    strokeDasharray: `${circumference} ${circumference}`,
    strokeDashoffset: offset,
    strokeWidth,
  };

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="lightgrey"
          fill="transparent"
        />
        {/* Foreground circle */}
        <circle
          style={circleStyle}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} // Rotate circle to start from the top
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '1.5rem',
          color: 'black',
        }}
      >
        {progress}
      </div>
    </div>
  );
};

export default CircularProgress;
