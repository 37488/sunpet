import crypto from 'crypto';
import type { AppSettings, TranslationProvider, TranslationResultPayload } from '../shared/types';

type BaiduTranslateResponse = {
  error_code?: string;
  error_msg?: string;
  trans_result?: Array<{ src: string; dst: string }>;
};

type OpenAICompatibleResponse = {
  error?: { message?: string };
  choices?: Array<{ message?: { content?: string } }>;
};

const baiduLanguageMap: Record<string, string> = {
  'zh-CN': 'zh',
  'en-US': 'en',
};

function mapBaiduLanguage(language: string) {
  if (language === 'auto') return 'auto';
  return baiduLanguageMap[language] ?? language;
}

function getOpenAIChatCompletionsUrl(baseUrl: string) {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  if (trimmed.endsWith('/chat/completions')) return trimmed;
  return `${trimmed}/chat/completions`;
}

function buildPrompt(text: string, sourceLanguage: string, targetLanguage: string) {
  const source = sourceLanguage === 'auto' ? 'auto-detect the source language' : `translate from ${sourceLanguage}`;
  return [
    `Please ${source} and translate it into ${targetLanguage}.`,
    'Return only the translated text. Preserve names, code, URLs, and formatting where reasonable.',
    '',
    text,
  ].join('\n');
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(text || `HTTP ${response.status}`);
  }
}

async function translateWithBaidu(text: string, settings: AppSettings): Promise<string> {
  const config = settings.translation.baidu;
  if (!config.appId.trim() || !config.secretKey.trim()) {
    throw new Error('请先配置百度翻译 appId 和 secretKey。');
  }

  const salt = Date.now().toString();
  const from = mapBaiduLanguage(settings.translation.sourceLanguage);
  const to = mapBaiduLanguage(settings.translation.targetLanguage);
  const sign = crypto.createHash('md5').update(`${config.appId}${text}${salt}${config.secretKey}`).digest('hex');
  const body = new URLSearchParams({
    q: text,
    from,
    to,
    appid: config.appId,
    salt,
    sign,
  });

  const response = await fetch('https://fanyi-api.baidu.com/api/trans/vip/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const payload = await parseJsonResponse<BaiduTranslateResponse>(response);
  if (!response.ok || payload.error_code) {
    throw new Error(payload.error_msg || `百度翻译请求失败：${payload.error_code ?? response.status}`);
  }

  const translated = payload.trans_result?.map((item) => item.dst).join('\n').trim();
  if (!translated) throw new Error('百度翻译没有返回译文。');
  return translated;
}

async function translateWithOpenAICompatible(text: string, settings: AppSettings): Promise<string> {
  const config = settings.translation.openaiCompatible;
  if (!config.baseUrl.trim() || !config.apiKey.trim() || !config.model.trim()) {
    throw new Error('请先配置 OpenAI-compatible 的 baseUrl、apiKey 和 model。');
  }

  const response = await fetch(getOpenAIChatCompletionsUrl(config.baseUrl), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: 'You are a precise translation engine. Return only the translated text.',
        },
        {
          role: 'user',
          content: buildPrompt(text, settings.translation.sourceLanguage, settings.translation.targetLanguage),
        },
      ],
    }),
  });
  const payload = await parseJsonResponse<OpenAICompatibleResponse>(response);
  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message || `OpenAI-compatible 翻译请求失败：${response.status}`);
  }

  const translated = payload.choices?.[0]?.message?.content?.trim();
  if (!translated) throw new Error('OpenAI-compatible 没有返回译文。');
  return translated;
}

export async function translateText(text: string, settings: AppSettings): Promise<TranslationResultPayload> {
  const sourceText = text.trim();
  if (!sourceText) throw new Error('没有读取到选中文本。');

  const providers: Record<TranslationProvider, () => Promise<string>> = {
    baidu: () => translateWithBaidu(sourceText, settings),
    'openai-compatible': () => translateWithOpenAICompatible(sourceText, settings),
  };
  const translatedText = await providers[settings.translation.provider]();
  return {
    sourceText,
    translatedText,
    provider: settings.translation.provider,
  };
}
