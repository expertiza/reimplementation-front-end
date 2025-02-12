import React from 'react';
import './Icon.css';

interface IconProps {
  src: string; // Path to the PNG
  alt: string; // Alt text for accessibility
  size?: number; // Optional size (e.g., 24px by default)
  className?: string; // Optional custom styles
}

export const Icon: React.FC<IconProps> = ({ src, alt, size = 24, className }) => {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`icon-base ${className}`}
    />
  );
};
