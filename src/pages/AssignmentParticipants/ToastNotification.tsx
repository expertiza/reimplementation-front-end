import React, { useCallback, useEffect, useState } from 'react';
import './ToastNotification.css';

interface ToastNotificationProps {
  message: string;
  onUndo: () => void;
  onClose: () => void;
}

function ToastNotification({ message, onUndo, onClose }: ToastNotificationProps) {
  const [visible, setVisible] = useState(true);
  const [isSlidingOut, setIsSlidingOut] = useState(false);
  const [progress, setProgress] = useState(100); // 100% progress initially
  const duration = 5000; // Duration in milliseconds

  const handleSlideOut = useCallback(() => {
    setIsSlidingOut(true);
    setTimeout(() => {
      setVisible(false);
      onClose();
    }, 300); // Wait for slide-out animation to complete
  }, [onClose]);

  const handleUndo = useCallback(() => {
    setIsSlidingOut(true);
    setTimeout(() => {
      onUndo(); // Execute undo action
      onClose(); // Close toast after undo
    }, 300); // Delay to allow the slide-out animation
  }, [onUndo, onClose]);

  useEffect(() => {
    const interval = 50; // Update progress every 50ms
    const decrement = 100 / (duration / interval); // Calculate decrement step

    const timer = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - decrement));
    }, interval);

    // Auto-dismiss the toast after the specified duration
    const timeout = setTimeout(() => {
      handleSlideOut();
    }, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [handleSlideOut]);

  if (!visible) return null;

  return (
    <div className={`toast-notification ${isSlidingOut ? 'slide-out' : ''}`}>
      <span>{message}</span>
      <button onClick={handleUndo} className="undo-button">Undo</button>
      <button onClick={handleSlideOut} className="close-button">✕</button>
      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
    </div>
  );
}

export default ToastNotification;
