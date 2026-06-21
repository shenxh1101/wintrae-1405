import Taro from '@tarojs/taro';

export interface SpeakOptions {
  text: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

let characterVoiceMap: Record<string, { rate: number; pitch: number }> = {};
let webAudioElement: HTMLAudioElement | null = null;

const getWebSpeech = (): SpeechSynthesis | null => {
  if (typeof window === 'undefined') return null;
  if ('speechSynthesis' in window) {
    return window.speechSynthesis;
  }
  return null;
};

export const initCharacterVoices = (characters: string[]) => {
  const basePitch = 1.1;
  const baseRate = 0.95;

  characterVoiceMap = {};
  characters.forEach((char, idx) => {
    const pitch = basePitch + (idx % 5) * 0.15 - 0.3;
    const rate = baseRate + (idx % 3) * 0.05;
    characterVoiceMap[char] = {
      pitch: Math.max(0.5, Math.min(2, pitch)),
      rate: Math.max(0.7, Math.min(1.5, rate))
    };
  });

  console.log('[Speech] 角色语音映射:', characterVoiceMap);
};

const loadVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    const synth = getWebSpeech();
    if (!synth) { resolve([]); return; }

    let voices = synth.getVoices();
    if (voices.length > 0) { resolve(voices); return; }

    const onVoicesChanged = () => {
      voices = synth.getVoices();
      resolve(voices);
      synth.removeEventListener('voiceschanged', onVoicesChanged);
    };
    synth.addEventListener('voiceschanged', onVoicesChanged);

    setTimeout(() => {
      synth.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(synth.getVoices());
    }, 2000);
  });
};

export const speakWeb = async (options: SpeakOptions): Promise<boolean> => {
  const synth = getWebSpeech();
  if (!synth) {
    console.warn('[Speech] Web Speech API 不可用');
    return false;
  }

  try {
    synth.cancel();

    const voices = await loadVoices();
    const utter = new SpeechSynthesisUtterance(options.text);
    utter.lang = 'zh-CN';
    utter.rate = options.rate ?? 1;
    utter.pitch = options.pitch ?? 1;
    utter.volume = options.volume ?? 1;

    const zhVoice = voices.find(v =>
      v.lang === 'zh-CN' || v.lang === 'zh_CN' || v.lang === 'zh-Hans-CN'
    ) || voices.find(v =>
      v.lang.toLowerCase().includes('zh') || v.lang.includes('CN')
    );
    if (zhVoice) {
      utter.voice = zhVoice;
      console.log('[Speech] 使用语音:', zhVoice.name, zhVoice.lang);
    }

    return new Promise((resolve) => {
      utter.onend = () => {
        console.log('[Speech] Web朗读完成');
        resolve(true);
      };
      utter.onerror = (e) => {
        console.error('[Speech] Web朗读出错:', e);
        resolve(false);
      };
      synth.speak(utter);
      console.log('[Speech] 开始Web朗读:', options.text.substring(0, 20), '...');
    });
  } catch (e) {
    console.error('[Speech] Web朗读异常:', e);
    return false;
  }
};

const speakMiniProgramInnerAudio = async (text: string): Promise<boolean> => {
  try {
    const plugin = Taro.requirePlugin && Taro.requirePlugin('WechatSI');
    if (plugin && plugin.textToSpeech) {
      return new Promise((resolve) => {
        plugin.textToSpeech({
          lang: 'zh_CN',
          tts: true,
          content: text,
          success: (res: any) => {
            if (res.filename) {
              const audio = Taro.createInnerAudioContext();
              audio.src = res.filename;
              audio.onEnded(() => { resolve(true); });
              audio.onError(() => { resolve(false); });
              audio.play();
            } else {
              resolve(false);
            }
          },
          fail: () => { resolve(false); }
        });
      });
    }
  } catch (e) {
    console.warn('[Speech] 微信TTS插件不可用:', e);
  }
  return false;
};

const speakMiniProgramAudioContext = async (text: string): Promise<boolean> => {
  try {
    if (typeof wx === 'undefined' || !wx.createInnerAudioContext) return false;

    const encodedText = encodeURIComponent(text);
    const audioUrl = `https://tts.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=5&text=${encodedText}`;

    return new Promise((resolve) => {
      const audio = Taro.createInnerAudioContext();
      audio.src = audioUrl;
      audio.onEnded(() => { resolve(true); });
      audio.onError(() => { resolve(false); });
      audio.onPlay(() => { console.log('[Speech] 网络TTS播放中'); });
      audio.play();
    });
  } catch (e) {
    console.warn('[Speech] 网络TTS失败:', e);
    return false;
  }
};

export const speakMiniProgram = async (options: SpeakOptions): Promise<boolean> => {
  const pluginResult = await speakMiniProgramInnerAudio(options.text);
  if (pluginResult) return true;

  const networkResult = await speakMiniProgramAudioContext(options.text);
  if (networkResult) return true;

  console.warn('[Speech] 所有小程序TTS方案均失败');
  return false;
};

export const speak = async (text: string, character?: string): Promise<boolean> => {
  if (!text || !text.trim()) return false;

  let rate = 1;
  let pitch = 1;

  if (character && characterVoiceMap[character]) {
    rate = characterVoiceMap[character].rate;
    pitch = characterVoiceMap[character].pitch;
  }

  const options: SpeakOptions = { text: text.trim(), rate, pitch };
  const env = Taro.getEnv();

  if (env === Taro.ENV_TYPE.WEB) {
    return await speakWeb(options);
  } else {
    return await speakMiniProgram(options);
  }
};

export const stopSpeaking = () => {
  const env = Taro.getEnv();
  if (env === Taro.ENV_TYPE.WEB) {
    const synth = getWebSpeech();
    if (synth) {
      synth.cancel();
    }
    if (webAudioElement) {
      webAudioElement.pause();
      webAudioElement = null;
    }
  }
};

export const isSpeechSupported = (): boolean => {
  const env = Taro.getEnv();
  if (env === Taro.ENV_TYPE.WEB) {
    return !!getWebSpeech();
  }
  return true;
};
