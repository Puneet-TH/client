import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium' }) => {
  return (
    <div className={`loading-container ${size}`}>
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingSpinner;
