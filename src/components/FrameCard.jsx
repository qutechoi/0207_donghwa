import React from 'react';

function FrameCard({ frame, frameImage }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
      {frameImage && (
        <img src={frameImage} alt={frame.title} className="w-full aspect-square object-cover" />
      )}
      <div className="p-4">
        <h3 className="text-white font-bold text-base">{frame.title}</h3>
        <p className="text-slate-400 text-sm mt-2">{frame.dialogue}</p>
      </div>
    </div>
  );
}

export default FrameCard;
