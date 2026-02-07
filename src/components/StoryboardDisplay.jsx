import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { t } from '../i18n';

function splitGridImage(gridImageSrc) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const cols = 3;
      const rows = 3;
      const cellW = Math.floor(img.width / cols);
      const cellH = Math.floor(img.height / rows);
      const frames = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const canvas = document.createElement('canvas');
          canvas.width = cellW;
          canvas.height = cellH;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, c * cellW, r * cellH, cellW, cellH, 0, 0, cellW, cellH);
          frames.push(canvas.toDataURL('image/png'));
        }
      }
      resolve(frames);
    };
    img.src = gridImageSrc;
  });
}

function speakText(text, voiceTone = 'warm', lang = 'ko') {
  if (!('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang === 'ko' ? 'ko-KR' : 'en-US';
  if (voiceTone === 'bright') utter.rate = 1.05;
  if (voiceTone === 'calm') utter.rate = 0.95;
  utter.pitch = voiceTone === 'warm' ? 1.0 : voiceTone === 'bright' ? 1.2 : 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

function StoryboardDisplay({ storyboard, originalImage, gridImage, onReset, lang, options }) {
  const { storyTitle, mainCharacter, frames } = storyboard;
  const [frameImages, setFrameImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (gridImage) {
      splitGridImage(gridImage).then(setFrameImages);
    }
  }, [gridImage]);

  const captureContent = async () => {
    const el = contentRef.current;
    if (!el) return null;

    const prevOverflow = el.style.overflow;
    const prevHeight = el.style.height;
    const prevMaxHeight = el.style.maxHeight;
    el.style.overflow = 'visible';
    el.style.height = 'auto';
    el.style.maxHeight = 'none';

    try {
      const canvas = await html2canvas(el, {
        backgroundColor: '#121212',
        scale: 2,
        useCORS: true,
        scrollY: 0,
        windowHeight: el.scrollHeight,
      });
      return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    } finally {
      el.style.overflow = prevOverflow;
      el.style.height = prevHeight;
      el.style.maxHeight = prevMaxHeight;
    }
  };

  const fallbackDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadGrid = async () => {
    setSaving(true);
    try {
      const blob = await captureContent();
      if (!blob) return;
      const filename = `donghwa-${mainCharacter || 'child'}.png`;
      fallbackDownload(blob, filename);
    } finally {
      setSaving(false);
    }
  };

  const displayTitle = storyTitle || (lang === 'ko' ? `${mainCharacter || '아이'}의 이야기` : `The Story of ${mainCharacter || 'Your Kid'}`);
  const fullNarration = frames.map((f) => f.dialogue).join('\n');

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-[#121212] text-white font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="fixed top-0 z-50 w-full max-w-md flex items-center p-4 pb-2 justify-between">
        <button
          onClick={onReset}
          className="flex size-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </div>

      <div ref={contentRef} className="flex-1 overflow-y-auto pb-48" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {gridImage && (
          <div className="relative w-full aspect-[4/5]">
            <img src={gridImage} alt="Storyboard grid" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(18,18,18,0) 60%, rgba(18,18,18,1) 100%)' }} />
          </div>
        )}

        <div className="px-6 pt-8">
          <h1 className="text-white tracking-tight text-[28px] font-extrabold leading-tight mb-4">{displayTitle}</h1>
          <button
            onClick={() => speakText(fullNarration, options?.voice, lang)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-bold border border-white/10"
          >
            <span className="material-symbols-outlined">volume_up</span>
            {t(lang, 'voicePlay')}
          </button>
        </div>

        <div className="px-6 space-y-8 mt-6">
          {frames.map((frame, index) => (
            <div key={frame.frameNumber}>
              {frameImages[index] && (
                <img src={frameImages[index]} alt={frame.title} className="w-full aspect-square object-cover rounded-2xl shadow-lg border border-white/10 mb-4" />
              )}
              {frame.dialogue && (
                <p className="text-slate-300 text-base leading-relaxed">{frame.dialogue}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-gradient-to-t from-[#121212] via-[#121212]/90 to-transparent pt-10 pb-6 px-6">
        <div className="flex flex-col gap-3">
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 rounded-full h-14 bg-[#ee9d2b] text-[#121212] text-base font-bold tracking-tight shadow-lg shadow-[#ee9d2b]/20"
          >
            <span className="material-symbols-outlined font-bold">magic_button</span>
            <span>{t(lang, 'generateNewVariant')}</span>
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadGrid}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 rounded-full h-14 bg-white/10 text-white text-base font-bold border border-white/10 disabled:opacity-50"
            >
              <span className="material-symbols-outlined">download</span>
              <span>{t(lang, 'saveStory')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoryboardDisplay;
