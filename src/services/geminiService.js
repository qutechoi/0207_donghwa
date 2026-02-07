const PROXY_URL = '/api/gemini';

async function callGemini(contents, generationConfig) {
  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemini-3-pro-image-preview',
      contents,
      generationConfig,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || `API call failed: ${response.statusText}`);
  }

  return data;
}

export async function generateStoryboard(imageFile, userStory = '', lang = 'ko', opts = {}) {
  try {
    const imageData = await fileToGenerativePart(imageFile);

    const tone = opts.tone || 'warm';
    const age = opts.age || '4-6';

    const toneText = {
      warm: '따뜻하고 감성적인 동화 톤',
      adventure: '모험과 성장 중심의 동화 톤',
      comic: '코믹하고 유쾌한 동화 톤',
    }[tone] || '따뜻하고 감성적인 동화 톤';

    const ageText = {
      '4-6': '4–6세 어린이를 위한 아주 쉬운 문장',
      '7-9': '7–9세 어린이를 위한 쉬운 문장',
      '10-12': '10–12세 어린이를 위한 풍부한 표현',
    }[age] || '4–6세 어린이를 위한 아주 쉬운 문장';

    const storyContext = userStory
      ? `\n\n사용자 요청: "${userStory}"\n이 요청을 바탕으로 9컷 동화를 구성해줘.`
      : `\n\n9컷 구성: 1) 인물 소개 2) 사건의 시작 3) 작은 문제 4) 도움 5) 시도 6) 위기 7) 반전 8) 해결 9) 마무리`;

    const langInstruction = lang === 'ko'
      ? `\n\n모든 텍스트는 한국어로 작성.`
      : `\n\nAll text must be in English.`;

    const prompt = `You are a professional children's story writer.
Analyze the provided kid photo and create a 9-frame fairy-tale storyboard.
${toneText}. ${ageText}.

Each frame must include:
1. Frame number (1-9)
2. Scene title
3. Visual description
4. Action/movement
5. Narration (2-3 sentences)
6. Transition effect
${storyContext}${langInstruction}

Respond ONLY in JSON:
{
  "storyTitle": "...",
  "mainCharacter": "...",
  "frames": [
    {
      "frameNumber": 1,
      "title": "...",
      "visualDescription": "...",
      "action": "...",
      "dialogue": "...",
      "transition": "..."
    }
  ]
}`;

    const data = await callGemini(
      [{ role: 'user', parts: [{ text: prompt }, imageData] }],
      { responseModalities: ['TEXT'] }
    );

    const candidates = data.candidates;
    if (!candidates || candidates.length === 0) throw new Error('No response received.');

    const parts = candidates[0]?.content?.parts;
    if (!parts) throw new Error('Invalid response data.');

    const textPart = parts.find((part) => part.text);
    if (!textPart) throw new Error('No text response found.');

    const jsonMatch = textPart.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No valid JSON response received.');

    const storyboardData = JSON.parse(jsonMatch[0]);

    if (!storyboardData.frames || !Array.isArray(storyboardData.frames)) {
      throw new Error('Invalid storyboard frame data.');
    }

    return storyboardData;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(`Storyboard generation failed: ${error.message}`);
  }
}

export async function generateStoryboardGrid(referenceImage, mainCharacter = 'kid', userStory = '', frames = [], lang = 'ko', opts = {}) {
  try {
    const imageData = await fileToGenerativePart(referenceImage);

    const tone = opts.tone || 'warm';
    const toneStyle = {
      warm: 'soft, warm, storybook lighting',
      adventure: 'dynamic, cinematic lighting',
      comic: 'bright, playful lighting',
    }[tone] || 'soft, warm, storybook lighting';

    let frameDescriptions;
    if (frames.length === 9) {
      frameDescriptions = frames.map((f) =>
        `FRAME ${f.frameNumber}: ${f.title}. ${f.visualDescription} ${f.action}`
      ).join('\n\n');
    } else {
      frameDescriptions = `FRAME 1: Introduce the kid hero
FRAME 2: A small discovery
FRAME 3: A tiny problem
FRAME 4: A helper appears
FRAME 5: Trying a solution
FRAME 6: A bigger challenge
FRAME 7: A surprise twist
FRAME 8: The solution
FRAME 9: A happy ending`;
    }

    const storyContext = userStory
      ? `\n\nStory context: "${userStory}"\nEach frame should reflect this story's narrative and mood.`
      : '';

    const prompt = `Create ONE final image.
A clean 3×3 storyboard grid with nine equal sized panels on [4:5] ratio.

Use the reference image as the base character reference. Keep the same kid, hairstyle, facial features, and clothing style across all nine panels.
${storyContext}
${frameDescriptions}

STYLE:
${toneStyle}. High-end storybook illustration. Consistent visual language across all nine panels.

OUTPUT:
A clean 3×3 grid with no borders, no text, no captions, and no watermarks.`;

    const data = await callGemini(
      [{ role: 'user', parts: [{ text: prompt }, imageData] }],
      { responseModalities: ['IMAGE', 'TEXT'], imageConfig: { imageSize: '1K' } }
    );

    const candidates = data.candidates;
    if (!candidates || candidates.length === 0) throw new Error('No image generation result received.');

    const parts = candidates[0]?.content?.parts;
    if (!parts) throw new Error('Invalid response data.');

    const imagePart = parts.find((part) => part.inlineData);
    if (!imagePart || !imagePart.inlineData) throw new Error('No generated image found.');

    const { data: base64Data, mimeType } = imagePart.inlineData;
    return `data:${mimeType};base64,${base64Data}`;
  } catch (error) {
    console.error('Storyboard grid generation error:', error);
    throw new Error(`Storyboard grid generation failed: ${error.message}`);
  }
}

async function fileToGenerativePart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(',')[1];
      resolve({ inlineData: { data: base64Data, mimeType: file.type } });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function downloadImage(dataURL, filename) {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
