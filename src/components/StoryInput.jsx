import React, { useState } from 'react';
import { t } from '../i18n';

function StoryInput({ imagePreviewUrl, onSubmit, onBack, lang }) {
  const [story, setStory] = useState('');
  const [tone, setTone] = useState('warm');
  const [age, setAge] = useState('4-6');
  const [voice, setVoice] = useState('warm');

  const handleSubmit = () => {
    onSubmit(story, { tone, age, voice });
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white px-6 py-8">
      <button onClick={onBack} className="text-sm text-slate-400 mb-6">← 뒤로</button>
      <div className="max-w-md mx-auto">
        {imagePreviewUrl && (
          <img src={imagePreviewUrl} alt="preview" className="w-full rounded-2xl mb-6" />
        )}
        <h2 className="text-2xl font-bold mb-3">{t(lang, 'stepStory')}</h2>
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          className="w-full bg-white/5 border-none rounded-2xl p-4 text-base text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#ee9d2b] min-h-[120px] resize-none"
          placeholder={t(lang, 'storyPlaceholder')}
        />

        <div className="mt-6 space-y-4">
          <div>
            <p className="text-sm font-bold mb-2">{t(lang, 'tone')}</p>
            <div className="flex gap-2 flex-wrap">
              {['warm', 'adventure', 'comic'].map((v) => (
                <button
                  key={v}
                  onClick={() => setTone(v)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold border ${tone === v ? 'bg-[#ee9d2b] text-white border-[#ee9d2b]' : 'bg-white/5 text-white border-white/10'}`}
                >
                  {t(lang, v === 'warm' ? 'toneWarm' : v === 'adventure' ? 'toneAdventure' : 'toneComic')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold mb-2">{t(lang, 'age')}</p>
            <div className="flex gap-2 flex-wrap">
              {['4-6', '7-9', '10-12'].map((v) => (
                <button
                  key={v}
                  onClick={() => setAge(v)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold border ${age === v ? 'bg-[#ee9d2b] text-white border-[#ee9d2b]' : 'bg-white/5 text-white border-white/10'}`}
                >
                  {t(lang, v === '4-6' ? 'age4' : v === '7-9' ? 'age7' : 'age10')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold mb-2">{t(lang, 'voice')}</p>
            <div className="flex gap-2 flex-wrap">
              {['warm', 'bright', 'calm'].map((v) => (
                <button
                  key={v}
                  onClick={() => setVoice(v)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold border ${voice === v ? 'bg-[#ee9d2b] text-white border-[#ee9d2b]' : 'bg-white/5 text-white border-white/10'}`}
                >
                  {t(lang, v === 'warm' ? 'voiceWarm' : v === 'bright' ? 'voiceBright' : 'voiceCalm')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full h-14 mt-8 rounded-full bg-[#ee9d2b] text-white font-bold"
        >
          {t(lang, 'generateBtn')}
        </button>
      </div>
    </div>
  );
}

export default StoryInput;
