import Taro from '@tarojs/taro';

export interface SpeakOptions {
  text: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceIndex?: number;
}

export interface SpeechVoices {
  voices: SpeechSynthesisVoice[];
  selectedIndex: number;
}

let speechSynthesisInst: SpeechSynthesis | null = null;
let innerAudioInst: any = null;
let characterVoiceMap: Record<string, { rate: number; pitch: number }> = {};

const getWebSpeech = (): SpeechSynthesis | null => {
  if (typeof window === 'undefined') return null;
  if ('speechSynthesis' in window) {
    speechSynthesisInst = window.speechSynthesis;
    return speechSynthesisInst;
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

export const speakWeb = (options: SpeakOptions): Promise<void> => {
  return new Promise((resolve) => {
    const synth = getWebSpeech();
    if (!synth) {
      console.warn('[Speech] Web Speech API 不可用');
      resolve();
      return;
    }

    try {
      synth.cancel();

      const utter = new SpeechSynthesisUtterance(options.text);
      utter.lang = 'zh-CN';
      utter.rate = options.rate ?? 1;
      utter.pitch = options.pitch ?? 1;
      utter.volume = options.volume ?? 1;

      const voices = synth.getVoices();
      const zhVoice = voices.find(v => v.lang.toLowerCase().includes('zh') || v.lang.includes('CN'));
      if (zhVoice) {
        utter.voice = zhVoice;
      }

      utter.onend = () => {
        console.log('[Speech] 朗读完成');
        resolve();
      };
      utter.onerror = (e) => {
        console.error('[Speech] 朗读出错:', e);
        resolve();
      };

      synth.speak(utter);
      console.log('[Speech] 开始朗读:', options.text, 'rate:', utter.rate, 'pitch:', utter.pitch);
    } catch (e) {
      console.error('[Speech] 朗读异常:', e);
      resolve();
    }
  });
};

export const speakMiniProgram = (options: SpeakOptions): Promise<void> => {
  return new Promise((resolve) => {
    try {
      if (innerAudioInst) {
        try { innerAudioInst.stop(); } catch (e) {}
        try { innerAudioInst.destroy(); } catch (e) {}
        innerAudioInst = null;
      }

      const plugin = Taro.requirePlugin && Taro.requirePlugin('WechatSI');
      if (plugin && plugin.textToSpeech) {
        const manager = plugin.getRecordRecognitionManager && plugin.getRecordRecognitionManager();
        plugin.textToSpeech({
          lang: 'zh_CN',
          tts: true,
          content: options.text,
          success: (res: any) => {
            console.log('[Speech] 微信插件TTS成功:', res);
            if (res.filename) {
              const audio = Taro.createInnerAudioContext();
              innerAudioInst = audio;
              audio.src = res.filename;
              audio.onEnded(() => resolve());
              audio.onError(() => resolve());
              audio.play();
            } else {
              resolve();
            }
          },
          fail: (err: any) => {
            console.warn('[Speech] 微信插件TTS失败:', err, '降级到振动提示');
            Taro.vibrateShort({ type: 'medium' });
            resolve();
          }
        });
        return;
      }

      console.warn('[Speech] 小程序TTS插件不可用，降级振动提示');
      Taro.vibrateShort({ type: 'medium' });
      resolve();
    } catch (e) {
      console.error('[Speech] 小程序朗读异常:', e);
      resolve();
    }
  });
};

export const speak = async (text: string, character?: string): Promise<void> => {
  if (!text || !text.trim()) return;

  let rate = 1;
  let pitch = 1;

  if (character && characterVoiceMap[character]) {
    rate = characterVoiceMap[character].rate;
    pitch = characterVoiceMap[character].pitch;
    console.log('[Speech] 使用角色语音:', character, 'rate:', rate, 'pitch:', pitch);
  }

  const options: SpeakOptions = { text: text.trim(), rate, pitch };
  const env = Taro.getEnv();

  if (env === Taro.ENV_TYPE.WEB) {
    await speakWeb(options);
  } else {
    await speakMiniProgram(options);
  }
};

export const stopSpeaking = () => {
  const env = Taro.getEnv();
  if (env === Taro.ENV_TYPE.WEB) {
    const synth = getWebSpeech();
    if (synth) {
      synth.cancel();
      console.log('[Speech] 停止Web朗读');
    }
  } else {
    if (innerAudioInst) {
      try { innerAudioInst.stop(); } catch (e) {}
      try { innerAudioInst.destroy(); } catch (e) {}
      innerAudioInst = null;
      console.log('[Speech] 停止小程序朗读');
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
