import Taro from '@tarojs/taro';

export interface ReportImageData {
  childName: string;
  monthLabel: string;
  totalDays: number;
  totalBooks: number;
  totalMinutes: number;
  bookTitles: string[];
  themes: { theme: string; count: number }[];
  characters: { name: string; count: number }[];
  encouragement: string;
}

const W = 750;
const H = 1334;

const drawRoundRect = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
};

const drawGradientBg = (ctx: CanvasRenderingContext2D) => {
  const gradient = ctx.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, '#FFF3E0');
  gradient.addColorStop(0.5, '#FFE0B2');
  gradient.addColorStop(1, '#FFF8E1');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);
};

const drawHeader = (ctx: CanvasRenderingContext2D, data: ReportImageData) => {
  const gradient = ctx.createLinearGradient(0, 0, W, 320);
  gradient.addColorStop(0, '#FF9A56');
  gradient.addColorStop(0.5, '#FF6B6B');
  gradient.addColorStop(1, '#FF8E53');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, 320);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📚 阅读小报', W / 2, 120);

  ctx.font = '32px sans-serif';
  ctx.fillText(`${data.childName} · ${data.monthLabel}`, W / 2, 180);

  ctx.font = '24px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText('来自 睡前故事共读App 🌙', W / 2, 280);
};

const drawStats = (ctx: CanvasRenderingContext2D, data: ReportImageData) => {
  const statsY = 360;
  const cardW = 200;
  const gap = 37;
  const startX = (W - 3 * cardW - 2 * gap) / 2;

  const items = [
    { value: `${data.totalDays}`, unit: '天', label: '阅读天数' },
    { value: `${data.totalBooks}`, unit: '本', label: '读完绘本' },
    { value: `${data.totalMinutes}`, unit: '分', label: '总时长' }
  ];

  items.forEach((item, idx) => {
    const x = startX + idx * (cardW + gap);
    ctx.fillStyle = '#FFFFFF';
    drawRoundRect(ctx, x, statsY, cardW, 160, 16);
    ctx.fill();

    ctx.shadowColor = 'rgba(0,0,0,0.06)';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#FF8A65';
    ctx.font = 'bold 52px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.value, x + cardW / 2, statsY + 80);

    ctx.fillStyle = '#FF8A65';
    ctx.font = '24px sans-serif';
    ctx.fillText(item.unit, x + cardW / 2, statsY + 110);

    ctx.fillStyle = '#999999';
    ctx.font = '22px sans-serif';
    ctx.fillText(item.label, x + cardW / 2, statsY + 145);
  });
};

const drawBookList = (ctx: CanvasRenderingContext2D, data: ReportImageData) => {
  const startY = 560;
  ctx.fillStyle = '#666666';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('📖 读过的绘本', 40, startY);

  ctx.fillStyle = '#FFFFFF';
  drawRoundRect(ctx, 40, startY + 16, W - 80, 180, 16);
  ctx.fill();

  const books = data.bookTitles.slice(0, 5);
  ctx.fillStyle = '#333333';
  ctx.font = '26px sans-serif';
  ctx.textAlign = 'left';
  books.forEach((title, idx) => {
    const row = Math.floor(idx / 2);
    const col = idx % 2;
    const x = 70 + col * 320;
    const y = startY + 60 + row * 56;
    ctx.fillText(`📚 ${title}`, x, y);
  });
  if (data.bookTitles.length > 5) {
    ctx.fillStyle = '#999999';
    ctx.font = '22px sans-serif';
    ctx.fillText(`...还有${data.bookTitles.length - 5}本`, 70, startY + 60 + 3 * 56);
  }
};

const drawRankings = (ctx: CanvasRenderingContext2D, data: ReportImageData) => {
  const startY = 790;
  const colW = (W - 120) / 2;

  ctx.fillStyle = '#666666';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('🏆 喜欢主题', 40, startY);
  ctx.fillText('🎭 常听角色', 40 + colW + 40, startY);

  const themes = data.themes.slice(0, 3);
  const chars = data.characters.slice(0, 3);
  const medals = ['🥇', '🥈', '🥉'];

  const drawList = (items: { name: string; count: number }[], startX: number) => {
    ctx.fillStyle = '#FFFFFF';
    drawRoundRect(ctx, startX, startY + 16, colW, 180, 16);
    ctx.fill();

    items.forEach((item, idx) => {
      const y = startY + 60 + idx * 48;
      ctx.fillStyle = '#333333';
      ctx.font = '26px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${medals[idx]} ${item.name}`, startX + 20, y);
      ctx.fillStyle = '#FF8A65';
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${item.count}次`, startX + colW - 20, y);
    });
    if (items.length === 0) {
      ctx.fillStyle = '#CCCCCC';
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('暂无数据', startX + colW / 2, startY + 110);
    }
  };

  drawList(themes.map(t => ({ name: t.theme, count: t.count })), 40);
  drawList(chars.map(c => ({ name: c.name, count: c.count })), 40 + colW + 40);
};

const drawEncouragement = (ctx: CanvasRenderingContext2D, data: ReportImageData) => {
  const startY = 1030;
  ctx.fillStyle = '#FFFFFF';
  drawRoundRect(ctx, 40, startY, W - 80, 120, 16);
  ctx.fill();

  ctx.fillStyle = '#FF8A65';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(data.encouragement, W / 2, startY + 50);

  ctx.fillStyle = '#BBBBBB';
  ctx.font = '20px sans-serif';
  ctx.fillText('继续加油，每天进步一点点 ✨', W / 2, startY + 90);
};

const drawFooter = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = '#CCCCCC';
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🌙 睡前故事共读App · 让阅读成为习惯', W / 2, H - 40);
};

export const generateReportCanvas = async (data: ReportImageData): Promise<string | null> => {
  const env = Taro.getEnv();

  if (env === Taro.ENV_TYPE.WEB) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = W * 2;
      canvas.height = H * 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.scale(2, 2);

      drawGradientBg(ctx);
      drawHeader(ctx, data);
      drawStats(ctx, data);
      drawBookList(ctx, data);
      drawRankings(ctx, data);
      drawEncouragement(ctx, data);
      drawFooter(ctx);

      return canvas.toDataURL('image/png');
    } catch (e) {
      console.error('[ReportCanvas] H5生成失败:', e);
      return null;
    }
  }

  return null;
};

export const downloadImage = (dataUrl: string, filename: string) => {
  if (typeof document === 'undefined') return;

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const saveImageToAlbum = async (filePath: string): Promise<boolean> => {
  const env = Taro.getEnv();
  if (env === Taro.ENV_TYPE.WEB) return false;

  try {
    await Taro.authorize({ scope: 'scope.writePhotosAlbum' });
  } catch {
    try {
      await Taro.openSetting();
    } catch {
      return false;
    }
  }

  try {
    await Taro.saveImageToPhotosAlbum({ filePath });
    return true;
  } catch {
    return false;
  }
};
