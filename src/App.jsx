import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import ImageUploader from './components/ImageUploader';
import StoryInput from './components/StoryInput';
import StoryboardDisplay from './components/StoryboardDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import { generateStoryboard, generateStoryboardGrid } from './services/geminiService';
import { t } from './i18n';
import './App.css';

function App() {
  const [lang, setLang] = useState('ko');
  const [showLanding, setShowLanding] = useState(true);
  const [showStoryInput, setShowStoryInput] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [userStory, setUserStory] = useState('');
  const [options, setOptions] = useState({
    tone: 'warm',
    age: '4-6',
    voice: 'warm',
  });
  const [storyboard, setStoryboard] = useState(null);
  const [gridImage, setGridImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageSelect = (file, previewUrl) => {
    setUploadedImage(file);
    setImagePreviewUrl(previewUrl);
    setError(null);
    setStoryboard(null);
    setGridImage(null);
  };

  const handleImageDone = () => {
    setShowStoryInput(true);
  };

  const handleStorySubmit = async (story, opts) => {
    setUserStory(story);
    setOptions(opts);
    setShowStoryInput(false);
    setLoading(true);
    setError(null);

    try {
      const result = await generateStoryboard(uploadedImage, story, lang, opts);
      setStoryboard(result);

      const imageURL = await generateStoryboardGrid(
        uploadedImage,
        result.mainCharacter || 'child',
        story,
        result.frames,
        lang,
        opts
      );
      setGridImage(imageURL);
    } catch (err) {
      setError(err.message || t(lang, 'errorTitle'));
      console.error('Generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setImagePreviewUrl(null);
    setUserStory('');
    setShowStoryInput(false);
    setStoryboard(null);
    setGridImage(null);
    setError(null);
    setShowLanding(true);
  };

  const handleGetStarted = () => {
    setShowLanding(false);
  };

  const handleStartWithData = async (file, previewUrl, story, opts) => {
    setUploadedImage(file);
    setImagePreviewUrl(previewUrl);
    setUserStory(story);
    setOptions(opts);
    setShowLanding(false);
    setLoading(true);
    setError(null);

    try {
      const result = await generateStoryboard(file, story, lang, opts);
      setStoryboard(result);

      const imageURL = await generateStoryboardGrid(
        file,
        result.mainCharacter || 'child',
        story,
        result.frames,
        lang,
        opts
      );
      setGridImage(imageURL);
    } catch (err) {
      setError(err.message || t(lang, 'errorTitle'));
      console.error('Generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (showLanding) {
    return (
      <LandingPage
        onGetStarted={handleGetStarted}
        onStartWithData={handleStartWithData}
        lang={lang}
        onLangChange={setLang}
      />
    );
  }

  if (showStoryInput && !loading && !error) {
    return (
      <StoryInput
        imagePreviewUrl={imagePreviewUrl}
        onSubmit={handleStorySubmit}
        onBack={() => setShowStoryInput(false)}
        lang={lang}
      />
    );
  }

  if (!storyboard && !loading && !error) {
    return (
      <ImageUploader
        onImageSelect={handleImageSelect}
        onGenerate={handleImageDone}
        isLoading={loading}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <LoadingSpinner message={t(lang, 'loadingMessage')} />
      </div>
    );
  }

  if (error && !storyboard) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center px-6">
        <div className="max-w-sm w-full bg-white/5 rounded-2xl p-8 text-center border border-white/10">
          <span className="material-symbols-outlined text-red-400 text-5xl mb-4 block">error</span>
          <h3 className="text-white text-lg font-bold mb-2">{t(lang, 'errorTitle')}</h3>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button
            onClick={handleReset}
            className="px-8 py-3 rounded-full bg-[#ee9d2b] text-[#121212] font-bold text-sm shadow-lg shadow-[#ee9d2b]/20"
          >
            {t(lang, 'tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <StoryboardDisplay
      storyboard={storyboard}
      originalImage={imagePreviewUrl}
      originalFile={uploadedImage}
      gridImage={gridImage}
      onReset={handleReset}
      lang={lang}
      options={options}
    />
  );
}

export default App;
