import React, { useState, useRef } from 'react';
import { validateImageFile, fileToDataURL } from '../utils/imageProcessor';
import { t } from '../i18n';

function LandingPage({ onGetStarted, onStartWithData, lang, onLangChange }) {
  const [story, setStory] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState({
    tone: 'warm',
    age: '4-6',
    voice: 'warm',
  });
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    setError(null);
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }
    try {
      const dataUrl = await fileToDataURL(file);
      setUploadedFile(file);
      setPreviewUrl(dataUrl);
    } catch {
      setError('Failed to load image.');
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleGenerate = () => {
    if (uploadedFile && previewUrl) {
      onStartWithData(uploadedFile, previewUrl, story, options);
    }
  };

  return (
    <div className="min-h-screen bg-[#221a10] text-white font-['Plus_Jakarta_Sans',sans-serif] flex flex-col">
      <nav className="sticky top-0 z-50 bg-[#221a10]/80 backdrop-blur-md px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#ee9d2b] flex items-center justify-center text-white shadow-lg shadow-[#ee9d2b]/20">
            <span className="material-symbols-outlined">auto_stories</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">{t(lang, 'appName')}</h1>
            <p className="text-xs opacity-60">{t(lang, 'appTagline')}</p>
          </div>
        </div>
        <button
          onClick={() => onLangChange(lang === 'en' ? 'ko' : 'en')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/10 text-sm font-bold hover:bg-white/20 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">translate</span>
          {lang === 'en' ? '한국어' : 'English'}
        </button>
      </nav>

      <main className="flex-1 px-4 pb-28">
        <header className="py-6">
          <h2 className="text-3xl font-bold tracking-tight">{t(lang, 'welcome')}</h2>
          <p className="text-slate-400 mt-1">{t(lang, 'welcomeSub')}</p>
        </header>

        <section className="mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-[#ee9d2b]">1.</span> {t(lang, 'stepUpload')}
          </h3>
          <div
            className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-[#ee9d2b]/30 bg-[#ee9d2b]/5 px-6 py-10 transition-colors hover:border-[#ee9d2b]/50 cursor-pointer relative"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={previewUrl}
                  alt="Uploaded kid"
                  className="w-32 h-32 object-cover rounded-2xl border-2 border-[#ee9d2b]/40 shadow-lg"
                />
                <p className="text-sm font-semibold text-[#ee9d2b]">{t(lang, 'photoUploaded')}</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-[#ee9d2b]/20 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-[#ee9d2b] text-3xl">add_a_photo</span>
                </div>
                <p className="text-lg font-bold text-center">{t(lang, 'addPhoto')}</p>
                <p className="text-sm opacity-60 text-center max-w-[240px]">{t(lang, 'addPhotoDesc')}</p>
                <button
                  type="button"
                  className="flex min-w-[140px] cursor-pointer items-center justify-center rounded-full h-12 px-6 bg-[#ee9d2b] text-white text-sm font-bold shadow-lg shadow-[#ee9d2b]/25 hover:scale-105 active:scale-95 transition-transform"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  {t(lang, 'selectImage')}
                </button>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
          )}
        </section>

        <section className="mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-[#ee9d2b]">2.</span> {t(lang, 'stepStory')}
          </h3>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            className="w-full bg-white/5 border-none rounded-2xl p-4 text-base text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#ee9d2b] min-h-[120px] resize-none"
            placeholder={t(lang, 'storyPlaceholder')}
          />
        </section>

        <section className="mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-[#ee9d2b]">3.</span> {t(lang, 'stepOptions')}
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white/5 rounded-2xl p-4">
              <p className="text-sm font-bold mb-2">{t(lang, 'tone')}</p>
              <div className="flex gap-2 flex-wrap">
                {['warm', 'adventure', 'comic'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setOptions({ ...options, tone: v })}
                    className={`px-4 py-2 rounded-full text-xs font-semibold border ${options.tone === v ? 'bg-[#ee9d2b] text-white border-[#ee9d2b]' : 'bg-white/5 text-white border-white/10'}`}
                  >
                    {t(lang, v === 'warm' ? 'toneWarm' : v === 'adventure' ? 'toneAdventure' : 'toneComic')}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4">
              <p className="text-sm font-bold mb-2">{t(lang, 'age')}</p>
              <div className="flex gap-2 flex-wrap">
                {['4-6', '7-9', '10-12'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setOptions({ ...options, age: v })}
                    className={`px-4 py-2 rounded-full text-xs font-semibold border ${options.age === v ? 'bg-[#ee9d2b] text-white border-[#ee9d2b]' : 'bg-white/5 text-white border-white/10'}`}
                  >
                    {t(lang, v === '4-6' ? 'age4' : v === '7-9' ? 'age7' : 'age10')}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4">
              <p className="text-sm font-bold mb-2">{t(lang, 'voice')}</p>
              <div className="flex gap-2 flex-wrap">
                {['warm', 'bright', 'calm'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setOptions({ ...options, voice: v })}
                    className={`px-4 py-2 rounded-full text-xs font-semibold border ${options.voice === v ? 'bg-[#ee9d2b] text-white border-[#ee9d2b]' : 'bg-white/5 text-white border-white/10'}`}
                  >
                    {t(lang, v === 'warm' ? 'voiceWarm' : v === 'bright' ? 'voiceBright' : 'voiceCalm')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mb-12">
          <button
            onClick={handleGenerate}
            disabled={!uploadedFile}
            className={`w-full h-16 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-all ${
              uploadedFile
                ? 'bg-[#ee9d2b] text-white shadow-xl shadow-[#ee9d2b]/30 hover:brightness-110 active:scale-[0.98]'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined">auto_fix_high</span>
            {t(lang, 'generateBtn')}
          </button>
        </div>
      </main>
    </div>
  );
}

export default LandingPage;
