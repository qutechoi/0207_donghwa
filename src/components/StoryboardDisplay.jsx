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

function StoryboardDisplay({ storyboard, gridImage, onReset, lang, options }) {
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
        backgroundColor: '#0f1115',
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

  const handleDownloadGrid = async () => {
    setSaving(true);
    try {
      const blob = await captureContent();
      if (!blob) return;
      const filename = `donghwa-${mainCharacter || 'child'}.png`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setSaving(false);
    }
  };

  const displayTitle = storyTitle || (lang === 'ko' ? `${mainCharacter || '아이'}의 이야기` : `The Story of ${mainCharacter || 'Your Kid'}`);
  const fullNarration = frames.map((f) => f.dialogue).join('\n');

  return (
    <div className="page results">
      <div className="results-topbar">
        <button className="ghost-btn" onClick={onReset}>← Back</button>
      </div>

      <div ref={contentRef} className="results-content">
        {gridImage && (
          <div className="hero-image">
            <img src={gridImage} alt="Storyboard grid" />
          </div>
        )}

        <div className="results-header">
          <h1>{displayTitle}</h1>
          <div className="pill-row">
            <span className="pill">Tone: {options?.tone}</span>
            <span className="pill">Age: {options?.age}</span>
            <span className="pill">Voice: {options?.voice}</span>
          </div>
          <button className="primary-btn" onClick={() => speakText(fullNarration, options?.voice, lang)}>
            🔊 {t(lang, 'voicePlay')}
          </button>
        </div>

        <div className="frame-grid">
          {frames.map((frame, index) => (
            <div key={frame.frameNumber} className="frame-card">
              {frameImages[index] && <img src={frameImages[index]} alt={frame.title} />}
              <div className="frame-text">{frame.dialogue}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="results-actions">
        <button className="primary-btn wide" onClick={onReset}>✨ {t(lang, 'generateNewVariant')}</button>
        <button className="ghost-btn wide" onClick={handleDownloadGrid} disabled={saving}>⬇️ {t(lang, 'saveStory')}</button>
      </div>
    </div>
  );
}

export default StoryboardDisplay;
