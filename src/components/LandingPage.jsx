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
    <div className="page landing">
      <nav className="topbar">
        <div className="brand">
          <div className="brand-badge">📚</div>
          <div>
            <div className="brand-title">{t(lang, 'appName')}</div>
            <div className="brand-sub">{t(lang, 'appTagline')}</div>
          </div>
        </div>
        <button className="ghost-btn" onClick={() => onLangChange(lang === 'en' ? 'ko' : 'en')}>
          🌐 {lang === 'en' ? '한국어' : 'English'}
        </button>
      </nav>

      <main className="container">
        <header className="hero">
          <h1>{t(lang, 'welcome')}</h1>
          <p>{t(lang, 'welcomeSub')}</p>
        </header>

        <section className="card">
          <div className="card-title">1. {t(lang, 'stepUpload')}</div>
          <div
            className="upload-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <div className="preview-wrap">
                <img src={previewUrl} alt="Uploaded" />
                <div className="hint">{t(lang, 'photoUploaded')}</div>
              </div>
            ) : (
              <>
                <div className="upload-icon">📷</div>
                <div className="upload-title">{t(lang, 'addPhoto')}</div>
                <div className="upload-desc">{t(lang, 'addPhotoDesc')}</div>
                <button
                  className="primary-btn"
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
              style={{ display: 'none' }}
            />
          </div>
          {error && <p className="error-text">{error}</p>}
        </section>

        <section className="card">
          <div className="card-title">2. {t(lang, 'stepStory')}</div>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            className="textarea"
            placeholder={t(lang, 'storyPlaceholder')}
          />
        </section>

        <section className="card">
          <div className="card-title">3. {t(lang, 'stepOptions')}</div>
          <div className="option-group">
            <div>
              <div className="label">{t(lang, 'tone')}</div>
              <div className="chip-row">
                {['warm', 'adventure', 'comic'].map((v) => (
                  <button
                    key={v}
                    className={`chip ${options.tone === v ? 'active' : ''}`}
                    onClick={() => setOptions({ ...options, tone: v })}
                  >
                    {t(lang, v === 'warm' ? 'toneWarm' : v === 'adventure' ? 'toneAdventure' : 'toneComic')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="label">{t(lang, 'age')}</div>
              <div className="chip-row">
                {['4-6', '7-9', '10-12'].map((v) => (
                  <button
                    key={v}
                    className={`chip ${options.age === v ? 'active' : ''}`}
                    onClick={() => setOptions({ ...options, age: v })}
                  >
                    {t(lang, v === '4-6' ? 'age4' : v === '7-9' ? 'age7' : 'age10')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="label">{t(lang, 'voice')}</div>
              <div className="chip-row">
                {['warm', 'bright', 'calm'].map((v) => (
                  <button
                    key={v}
                    className={`chip ${options.voice === v ? 'active' : ''}`}
                    onClick={() => setOptions({ ...options, voice: v })}
                  >
                    {t(lang, v === 'warm' ? 'voiceWarm' : v === 'bright' ? 'voiceBright' : 'voiceCalm')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="cta">
          <button className="primary-btn wide" onClick={handleGenerate} disabled={!uploadedFile}>
            ✨ {t(lang, 'generateBtn')}
          </button>
        </div>
      </main>
    </div>
  );
}

export default LandingPage;
