# Donghwa AI (동화 공방)

아이 사진과 간단한 요청을 입력하면 AI가 9컷 동화 스토리보드를 생성하고, 내레이션(TTS)까지 제공하는 웹 앱입니다.

## 주요 기능
- 사진 업로드 (JPG/PNG/WebP)
- 동화 키워드 입력 (예: 모험/우정/바다)
- 스타일 톤 선택 (감성/모험/코믹)
- 연령대 선택 (4–6 / 7–9 / 10–12)
- 음성 톤 선택 (따뜻한/명랑한/차분한)
- 9컷 스토리보드 생성 + 동화 텍스트
- Web Speech API TTS 재생

## 설치
```bash
npm install
```

## 실행
```bash
npm run dev
```

## 환경변수
`.env` 파일을 만들고 API 키를 추가하세요:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## 구조
```
src/
  components/
  services/
  utils/
```
