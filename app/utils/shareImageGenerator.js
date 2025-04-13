/**
 * 生成分享图片 - SVG版本
 * @param {Object} params 分享图片所需参数
 * @param {string} params.phrase 成语
 * @param {number} params.score 分数
 * @param {Array<string>} params.emojis 用户选择的表情
 * @param {string} params.suggestedEmojis AI推荐的表情
 * @param {string} params.qrCodeUrl 二维码URL
 * @param {Function} params.getScoreLevel 获取评分等级的函数
 * @param {string} params.aiComment AI评语
 * @returns {Promise<Blob>} 分享图片的Blob对象
 */
export const generateShareImage = async ({
  phrase,
  score,
  emojis,
  suggestedEmojis,
  qrCodeUrl,
  getScoreLevel,
  aiComment
}) => {
  // 固定宽度
  const width = 600;
  
  // 高度将基于内容计算
  let dynamicHeight = 0;
  
  // 内边距和间距
  const padding = {
    outer: 30,     // 外边距
    inner: 20,     // 内边距
    section: 15    // 段落间距
  };
  
  // 计算每个部分的内容尺寸和位置
  // 称号部分
  const titleSection = (() => {
    const levelInfo = getScoreLevel(score);
    const levelText = levelInfo.level.replace(/[\p{Emoji}\u200D]+/gu, '');
    const levelEmojis = Array.from(levelInfo.level.match(/[\p{Emoji}\u200D]+/gu) || []).join(' ');
    
    // 文字宽度计算
    const getTextWidth = (text) => {
      let width = 0;
      for (const char of text) {
        if (/[\u4e00-\u9fa5]/.test(char)) width += 26;
        else if (/[A-Za-z]/.test(char)) width += 16;
        else width += 20;
      }
      return width;
    };
    
    const textWidth = getTextWidth(levelText);
    const emojiWidth = levelEmojis ? levelEmojis.split(' ').length * 30 : 0;
    const contentWidth = textWidth + emojiWidth;
    
    // 称号框宽度 (文字宽度 + 内边距)
    const boxWidth = Math.max(180, contentWidth + 60);
    const boxX = width/2 - boxWidth/2;
    
    // 标签宽度和位置
    const labelWidth = 60;
    const labelX = boxX;
    
    // 起始Y坐标
    const startY = 40;
    const boxHeight = 60;
    
    // 更新动态高度
    dynamicHeight = startY + boxHeight + padding.section;
    
    return {
      boxX, boxY: startY, boxWidth, boxHeight,
      labelX, labelY: startY - 10, labelWidth,
      textX: width/2, textY: startY + boxHeight/2,
      level: levelText, 
      emojis: levelEmojis
    };
  })();
  
  // 成语区域
  const idiomSection = (() => {
    const startY = dynamicHeight;
    const boxHeight = 110; // 增加高度，提供更好的视觉空间
    const boxWidth = width - padding.outer * 2;
    
    // 成语显示区域
    const phraseBoxWidth = 360;
    const phraseBoxHeight = 50; // 增加高度，让成语更加突出
    
    // 计算成语文本宽度 - 新增函数
    const getPhraseWidth = (text) => {
      let width = 0;
      for (const char of text) {
        if (/[\u4e00-\u9fa5]/.test(char)) width += 26; // 中文
        else if (/[A-Za-z]/.test(char)) width += 16; // 英文
        else width += 20; // 其他字符
      }
      return width;
    };
    
    // 计算成语宽度
    const phraseWidth = getPhraseWidth(phrase);
    // 添加少量内边距
    const textMargin = 15;
    
    // 更新动态高度
    dynamicHeight += boxHeight + padding.section;
    
    return {
      boxX: padding.outer, 
      boxY: startY, 
      boxWidth, 
      boxHeight,
      titleY: startY + 35,
      phraseBoxX: width/2 - phraseBoxWidth/2,
      phraseBoxY: startY + 45,
      phraseBoxWidth,
      phraseBoxHeight,
      phraseTextY: startY + 70, // 调整文本位置
      phraseWidth, // 添加实际文本宽度
      quoteLeftX: width/2 - phraseWidth/2 - textMargin, // 左引号位置
      quoteRightX: width/2 + phraseWidth/2 + textMargin // 右引号位置
    };
  })();
  
  // 表情对比区域
  const emojiSection = (() => {
    const startY = dynamicHeight;
    const boxHeight = 190;
    const boxWidth = width - padding.outer * 2;
    
    // 左右两侧表情区域
    const sideWidth = (boxWidth - padding.inner) / 2;
    const emojiBoxHeight = 105;
    const emojiBoxY = startY + 65;
    const titleY = startY + 35;
    const emojiY = startY + 120;
    
    // 更新动态高度
    dynamicHeight += boxHeight + padding.section;
    
    return {
      boxX: padding.outer, 
      boxY: startY, 
      boxWidth, 
      boxHeight,
      leftTitleX: padding.outer + padding.inner,
      rightTitleX: width - padding.outer - padding.inner,
      titleY,
      leftBoxX: padding.outer + padding.inner,
      rightBoxX: width/2 + padding.inner/2,
      emojiBoxY,
      emojiBoxWidth: sideWidth - padding.inner * 2,
      emojiBoxHeight,
      emojiY,
      dividerX: width/2
    };
  })();
  
  // AI评语区域
  let commentSection = null;
  if (aiComment) {
    const startY = dynamicHeight;
    // 评估文本长度来确定高度
    const lines = Math.min(4, Math.ceil(aiComment.length / 30)); // 简单估算
    const boxHeight = Math.max(120, lines * 24 + 60); // 至少120px高
    const boxWidth = width - padding.outer * 2;
    
    // 更新动态高度
    dynamicHeight += boxHeight + padding.section;
    
    commentSection = {
      boxX: padding.outer, 
      boxY: startY, 
      boxWidth, 
      boxHeight,
      titleY: startY + 24,
      contentX: padding.outer + padding.inner,
      contentY: startY + 50
    };
  }
  
  // 二维码区域
  const qrSection = (() => {
    const startY = dynamicHeight;
    const boxHeight = 180;
    const boxWidth = width - padding.outer * 2;
    
    // 二维码尺寸和位置
    const qrSize = 100;
    const qrX = width/2 - qrSize/2;
    const qrY = startY + 70;
    
    // 更新最终高度
    dynamicHeight += boxHeight;
    
    return {
      boxX: padding.outer, 
      boxY: startY, 
      boxWidth, 
      boxHeight,
      titleY: startY + 25,
      subtitleY: startY + 55,
      qrX, qrY, qrSize,
      footerY: qrY + qrSize + 30,
      arrowGap: 35
    };
  })();
  
  // 最终SVG高度
  const height = dynamicHeight + padding.outer;
  
  // 创建SVG基础结构
  let svgContent = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <!-- 定义渐变 -->
        <linearGradient id="levelBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="rgba(224, 231, 255, 0.6)" />
          <stop offset="100%" stop-color="rgba(236, 233, 253, 0.6)" />
        </linearGradient>
        
        <linearGradient id="challengeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#d97706" />
        </linearGradient>
        
        <linearGradient id="phraseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#10b981" />
          <stop offset="33%" stop-color="#0d9488" />
          <stop offset="66%" stop-color="#0891b2" />
          <stop offset="100%" stop-color="#2563eb" />
        </linearGradient>
        
        <!-- 顶部卡片渐变背景 -->
        <linearGradient id="topCardGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#F5F7FF" />
          <stop offset="100%" stop-color="#F9FAFB" />
        </linearGradient>
        
        <!-- 侧边栏渐变 -->
        <linearGradient id="sidebarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#9061F9" />
          <stop offset="100%" stop-color="#7E3AF2" />
        </linearGradient>
        
        <!-- 根据分数创建进度环渐变 -->
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          ${getScoreGradient(score)}
        </linearGradient>
        
        <!-- 阴影滤镜 -->
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" flood-opacity="0.1" />
        </filter>
        
        <filter id="lightShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.1" />
        </filter>
      </defs>
      
      <!-- 背景 -->
      <rect width="${width}" height="${height}" fill="#f9fafb" />
      
      <!-- 集成卡片：称号展示 -->
      <g>
        <!-- 称号背景 - 精确适配文字长度 -->
        <rect x="${titleSection.boxX}" y="${titleSection.boxY}" width="${titleSection.boxWidth}" height="${titleSection.boxHeight}" rx="12" ry="12" fill="url(#levelBgGradient)" />
        
        <!-- 称号标识 -->
        <rect x="${titleSection.labelX}" y="${titleSection.labelY}" width="${titleSection.labelWidth}" height="20" rx="10" ry="10" fill="#8b5cf6" />
        <text x="${titleSection.labelX + titleSection.labelWidth/2}" y="${titleSection.labelY + 10}" font-family="Arial" font-weight="bold" font-size="12" fill="white" 
              text-anchor="middle" dominant-baseline="central">称号</text>
        
        <!-- 称号装饰 -->
        <text x="${titleSection.boxX - 5}" y="${titleSection.textY}" font-family="Arial" font-size="18" 
              text-anchor="middle" dominant-baseline="central">✨</text>
        <text x="${titleSection.boxX + titleSection.boxWidth + 5}" y="${titleSection.textY}" font-family="Arial" font-size="18" 
              text-anchor="middle" dominant-baseline="central">✨</text>
        
        <!-- 称号文字和表情 -->
        <text x="${titleSection.textX}" y="${titleSection.textY}" font-family="Arial" font-weight="bold" font-size="26" fill="#4c1d95" 
              text-anchor="middle" dominant-baseline="central">${titleSection.level} ${titleSection.emojis || '🔍'}</text>
      </g>
      
      <!-- 成语展示区域 -->
      <g>
        <rect x="${idiomSection.boxX}" y="${idiomSection.boxY}" width="${idiomSection.boxWidth}" height="${idiomSection.boxHeight}" rx="16" ry="16" fill="white" filter="url(#shadow)" />
        
        <!-- 顶部装饰元素 -->
        <rect x="${idiomSection.boxX}" y="${idiomSection.boxY}" width="${idiomSection.boxWidth}" height="4" rx="2" ry="2" fill="url(#phraseGradient)" />
        
        <!-- 成语表达提示 -->
        <text x="${width / 2}" y="${idiomSection.titleY}" font-family="Arial" font-weight="bold" font-size="20" fill="#4B5563" 
              text-anchor="middle" dominant-baseline="middle">用表情表达成语</text>
        
        <!-- 成语展示 - 现代风格 -->
        <rect x="${idiomSection.phraseBoxX}" y="${idiomSection.phraseBoxY}" width="${idiomSection.phraseBoxWidth}" height="${idiomSection.phraseBoxHeight}" rx="12" ry="12" fill="#F3F4F6" />
        <text x="${width / 2}" y="${idiomSection.phraseTextY}" font-family="Arial" font-weight="bold" font-size="26" fill="#111827" 
              text-anchor="middle" dominant-baseline="central">${phrase}</text>
              
        <!-- 添加左右装饰符号 - 精确跟随文字边缘 -->
        <text x="${idiomSection.quoteLeftX}" y="${idiomSection.phraseTextY}" font-family="Arial" font-size="18" fill="#9061F9" 
              text-anchor="middle" dominant-baseline="central">「</text>
        <text x="${idiomSection.quoteRightX}" y="${idiomSection.phraseTextY}" font-family="Arial" font-size="18" fill="#9061F9" 
              text-anchor="middle" dominant-baseline="central">」</text>
      </g>
      
      <!-- 表情对比区域 -->
      <g>
        <rect x="${emojiSection.boxX}" y="${emojiSection.boxY}" width="${emojiSection.boxWidth}" height="${emojiSection.boxHeight}" rx="12" ry="12" fill="white" filter="url(#shadow)" />
        
        <!-- 中央分隔线 -->
        <line x1="${emojiSection.dividerX}" y1="${emojiSection.boxY + 25}" x2="${emojiSection.dividerX}" y2="${emojiSection.boxY + emojiSection.boxHeight - 25}" stroke="#E5E7EB" stroke-width="2" stroke-dasharray="4,4" />
        
        <!-- 左侧：玩家表情 -->
        <text x="${emojiSection.leftTitleX}" y="${emojiSection.titleY}" font-family="Arial" font-weight="bold" font-size="18" fill="#EF4444" dominant-baseline="middle">你的表达：</text>
        
        <!-- 绘制左侧表情背景 - 增加圆角 -->
        <rect x="${emojiSection.leftBoxX}" y="${emojiSection.emojiBoxY}" width="${emojiSection.emojiBoxWidth}" height="${emojiSection.emojiBoxHeight}" rx="10" ry="10" fill="rgba(254, 226, 226, 0.3)" />
        
        <!-- 绘制玩家选择的表情 - 使表情居中显示 -->
        ${(() => {
          const centerX = emojiSection.leftBoxX + emojiSection.emojiBoxWidth / 2;
          const emojiSpacing = Math.min(40, emojiSection.emojiBoxWidth / emojis.length);
          const startX = centerX - ((emojis.length - 1) * emojiSpacing) / 2;
          
          let emojiSvg = '';
          emojis.forEach((emoji, index) => {
            const x = startX + index * emojiSpacing;
            emojiSvg += `<text x="${x}" y="${emojiSection.emojiY}" font-family="Arial" font-size="38" text-anchor="middle" dominant-baseline="middle">${emoji}</text>`;
          });
          
          return emojiSvg;
        })()}
        
        <!-- 右侧：AI表情 -->
        <text x="${emojiSection.rightTitleX}" y="${emojiSection.titleY}" font-family="Arial" font-weight="bold" font-size="18" fill="#3B82F6" text-anchor="end" dominant-baseline="middle">AI的答案：</text>
        
        <!-- 绘制右侧表情背景 - 增加圆角 -->
        <rect x="${emojiSection.rightBoxX}" y="${emojiSection.emojiBoxY}" width="${emojiSection.emojiBoxWidth}" height="${emojiSection.emojiBoxHeight}" rx="10" ry="10" fill="rgba(219, 234, 254, 0.3)" />
        
        <!-- 绘制AI的表情 - 使表情居中显示 -->
        ${(() => {
          const centerX = emojiSection.rightBoxX + emojiSection.emojiBoxWidth / 2;
          
          const aiEmojis = suggestedEmojis.split(' ');
          const emojiSpacing = Math.min(40, emojiSection.emojiBoxWidth / aiEmojis.length);
          const startX = centerX - ((aiEmojis.length - 1) * emojiSpacing) / 2;
          
          let aiEmojiSvg = '';
          aiEmojis.forEach((emoji, index) => {
            const x = startX + index * emojiSpacing;
            aiEmojiSvg += `<text x="${x}" y="${emojiSection.emojiY}" font-family="Arial" font-size="38" text-anchor="middle" dominant-baseline="middle">${emoji}</text>`;
          });
          
          return aiEmojiSvg;
        })()}
      </g>`;
  
  // AI评语区域
  if (commentSection) {
    svgContent += `
      <!-- AI评语区域 -->
      <g>
        <rect x="${commentSection.boxX}" y="${commentSection.boxY}" width="${commentSection.boxWidth}" height="${commentSection.boxHeight}" rx="10" ry="10" fill="white" filter="url(#shadow)" />
        
        <!-- AI评语标题 -->
        <text x="${commentSection.contentX}" y="${commentSection.titleY}" font-family="Arial" font-weight="bold" font-size="18" fill="#111827" dominant-baseline="middle">🤖 AI点评：</text>
        
        <!-- AI评语内容 - 更智能的换行和间距 -->
        ${wrapTextSVG(aiComment, commentSection.contentX, commentSection.contentY, width - padding.outer * 2 - padding.inner * 2, 24)}
      </g>`;
  }
  
  // 二维码区域
  svgContent += `
      <!-- 二维码区域 -->
      <g>
        <rect x="${qrSection.boxX}" y="${qrSection.boxY}" width="${qrSection.boxWidth}" height="${qrSection.boxHeight}" rx="15" ry="15" fill="white" filter="url(#shadow)" />
        
        <!-- 挑战标题 -->
        <text x="${width / 2}" y="${qrSection.titleY}" font-family="Arial" font-weight="bold" font-size="24" fill="url(#challengeGradient)" 
              text-anchor="middle" dominant-baseline="middle">扫码挑战我的高分！</text>
        
        <!-- 提示文字 -->
        <text x="${width / 2}" y="${qrSection.subtitleY}" font-family="Arial" font-size="16" fill="#4b5563" 
              text-anchor="middle" dominant-baseline="middle">你能超越我的创意表达吗？</text>
        
        <!-- 二维码区域 -->
        <!-- 二维码白色背景 -->
        <rect x="${qrSection.qrX - 5}" y="${qrSection.qrY - 5}" width="${qrSection.qrSize + 10}" height="${qrSection.qrSize + 10}" rx="5" ry="5" fill="white" filter="url(#lightShadow)" />
        
        <!-- 实际二维码（如果有） -->
        ${qrCodeUrl ? `<image x="${qrSection.qrX}" y="${qrSection.qrY}" width="${qrSection.qrSize}" height="${qrSection.qrSize}" href="${qrCodeUrl}" />` : ''}
        
        <!-- 箭头指示 -->
        <text x="${qrSection.qrX - qrSection.arrowGap}" y="${qrSection.qrY + qrSection.qrSize / 2}" font-family="Arial" font-size="30" fill="#f59e0b" 
              text-anchor="middle" dominant-baseline="middle">👉</text>
        <text x="${qrSection.qrX + qrSection.qrSize + qrSection.arrowGap}" y="${qrSection.qrY + qrSection.qrSize / 2}" font-family="Arial" font-size="30" fill="#f59e0b" 
              text-anchor="middle" dominant-baseline="middle">👈</text>
              
        <!-- 站点名称 -->
        <text x="${width / 2}" y="${qrSection.footerY}" font-family="Arial" font-size="16" fill="#6b7280" 
              text-anchor="middle" dominant-baseline="middle">emoji-master.com · 成语表情挑战</text>
      </g>`;
  
  // 结束SVG
  svgContent += `</svg>`;
  
  // 返回SVG的Blob对象
  const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
  return svgBlob;
};

/**
 * 根据分数获取渐变颜色
 * @param {number} score 分数
 * @returns {string} 渐变定义
 */
function getScoreGradient(score) {
  let color1, color2;
  
  if (score >= 90) {
    color1 = '#10b981'; // 绿色
    color2 = '#059669';
  } else if (score >= 75) {
    color1 = '#6366f1'; // 靛蓝色
    color2 = '#4f46e5';
  } else if (score >= 60) {
    color1 = '#8b5cf6'; // 紫色
    color2 = '#7c3aed';
  } else {
    color1 = '#f59e0b'; // 琥珀色
    color2 = '#d97706';
  }
  
  return `
    <stop offset="0%" stop-color="${color1}" />
    <stop offset="100%" stop-color="${color2}" />
  `;
}

/**
 * 文本自动换行函数 (SVG版本)
 * @param {string} text 需要绘制的文本
 * @param {number} x 起始X坐标
 * @param {number} y 起始Y坐标
 * @param {number} maxWidth 每行最大宽度
 * @param {number} lineHeight 行高
 * @returns {string} SVG文本元素
 */
function wrapTextSVG(text, x, y, maxWidth, lineHeight) {
  if (!text) return '';
  
  // 根据文本类型调整估算宽度
  // 中文字符和表情符号宽度更大
  const getEstimatedWidth = (char) => {
    if (/[\u4e00-\u9fa5]/.test(char)) return 18; // 中文
    if (/[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(char)) return 18; // 表情符号
    if (/[A-Za-z]/.test(char)) return 9; // 英文字母
    return 12; // 其他字符
  };
  
  // 使用更精确的宽度估算来分行
  const lines = [];
  let currentLine = '';
  let currentWidth = 0;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charWidth = getEstimatedWidth(char);
    
    if (currentWidth + charWidth > maxWidth) {
      // 当前行已满，添加到lines并重置
      lines.push(currentLine);
      currentLine = char;
      currentWidth = charWidth;
      
      // 最多显示4行，提高内容可见性
      if (lines.length >= 3) {
        if (i < text.length - 1) {
          currentLine += '...';
        }
        lines.push(currentLine);
        break;
      }
    } else {
      currentLine += char;
      currentWidth += charWidth;
    }
  }
  
  // 添加最后一行（如果有）
  if (currentLine && lines.length < 4) {
    lines.push(currentLine);
  }
  
  // 生成SVG文本元素，优化字体和样式
  let svgText = '';
  lines.forEach((line, index) => {
    const lineY = y + index * lineHeight;
    // 使用更深的颜色和稍微大一点的字体增加可读性
    svgText += `<text x="${x}" y="${lineY}" font-family="Arial" font-size="17" fill="#1f2937" dominant-baseline="hanging">${line}</text>`;
  });
  
  return svgText;
}

/**
 * 将SVG转换为PNG图片
 * @param {Blob} svgBlob SVG的Blob对象
 * @param {number} width 图片宽度
 * @param {number} height 图片高度
 * @returns {Promise<Blob>} PNG的Blob对象
 */
const convertSvgToPng = async (svgBlob, width, height) => {
  return new Promise((resolve, reject) => {
    // 创建URL
    const url = URL.createObjectURL(svgBlob);
    
    // 创建Image对象
    const img = new Image();
    img.onload = () => {
      // 创建canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // 绘制图像
      ctx.drawImage(img, 0, 0, width, height);
      
      // 转换为PNG
      canvas.toBlob(blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas to Blob conversion failed'));
        }
        // 释放URL
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG'));
    };
    
    // 设置图像源
    img.src = url;
  });
};

/**
 * 下载或分享图片
 * @param {Blob} svgBlob 图片SVG blob对象
 * @param {Object} options 选项
 * @param {string} options.phrase 成语
 * @param {number} options.score 分数
 * @param {boolean} options.isMobile 是否移动设备
 * @returns {Promise<void>}
 */
export const handleImageOutput = async (svgBlob, { phrase, score, isMobile }) => {
  const isMobileDevice = isMobile || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  try {
    // 从SVG数据中提取宽高
    const svgText = await svgBlob.text();
    const widthMatch = svgText.match(/width="(\d+)"/);
    const heightMatch = svgText.match(/height="(\d+)"/);
    const width = widthMatch ? parseInt(widthMatch[1]) : 600;
    const height = heightMatch ? parseInt(heightMatch[1]) : 800;
    
    // 转换SVG到PNG以提高兼容性
    const pngBlob = await convertSvgToPng(svgBlob, width, height);
    
    if (!isMobileDevice) {
      // Web端：直接下载图片
      const url = URL.createObjectURL(pngBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `emoji-${phrase}-${score}分.png`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      
      alert(`图片已保存！您可以在下载文件夹中查看。`);
    } else {
      // 移动端：尝试使用分享API
      try {
        if (navigator.share && navigator.canShare && 
            navigator.canShare({ 
              files: [new File([pngBlob], `emoji-${phrase}-${score}分.png`, { type: 'image/png' })] 
            })) {
          await navigator.share({
            title: '我的成语表情挑战结果',
            text: `我在emoji-master.com中表达"${phrase}"，获得了${score}分！快来挑战我的高分吧！`,
            files: [new File([pngBlob], `emoji-${phrase}-${score}分.png`, { type: 'image/png' })],
          });
        } else {
          // 移动端但不支持分享API：提供下载链接
          const url = URL.createObjectURL(pngBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `emoji-${phrase}-${score}分.png`;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 60000);
          
          alert(`图片已保存！您可以在相册中查看并分享给好友。`);
        }
      } catch (shareError) {
        console.error('分享API失败，回退到下载', shareError);
        const url = URL.createObjectURL(pngBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `emoji-${phrase}-${score}分.png`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        
        alert(`图片已保存！您可以在相册中查看并分享给好友。`);
      }
    }
  } catch (error) {
    console.error('转换图片失败，使用原始SVG格式', error);
    // 发生错误时回退到原始SVG分享
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `emoji-${phrase}-${score}分.svg`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    
    alert(`图片已保存！您可以在下载文件夹中查看。`);
  }
}; 