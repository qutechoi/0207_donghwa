import React from 'react';

function ImageUploader({ onImageSelect, onGenerate, isLoading }) {
  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center text-white px-6">
      <div className="text-center max-w-sm">
        <h2 className="text-2xl font-bold mb-3">사진을 먼저 업로드해요</h2>
        <p className="text-slate-400 mb-8">아이 사진을 선택하면 동화 입력 단계로 넘어가요.</p>
        <label className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#ee9d2b] text-white font-bold cursor-pointer">
          이미지 선택
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const previewUrl = URL.createObjectURL(file);
                onImageSelect(file, previewUrl);
              }
            }}
          />
        </label>
        <div className="mt-6">
          <button
            onClick={onGenerate}
            disabled={isLoading}
            className="text-sm text-slate-400 underline"
          >
            다음 단계로
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageUploader;
