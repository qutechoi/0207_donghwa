import React from 'react';

function LoadingSpinner({ message }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-[#ee9d2b]/40 border-t-[#ee9d2b] rounded-full animate-spin" />
      <p className="text-slate-300 text-sm">{message}</p>
    </div>
  );
}

export default LoadingSpinner;
