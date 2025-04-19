import QRCode from "qrcode";

/**
 * 生成二维码
 * @param {string} url 需要生成二维码的URL
 * @returns {Promise<string>} 返回生成的二维码DataURL
 */
export const generateQRCode = async (url) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      margin: 1,
      width: 100, // 减小尺寸
      errorCorrectionLevel: 'M', // 降低纠错级别以加快生成
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    return qrDataUrl;
  } catch (error) {
    console.error("生成二维码失败:", error);
    throw error;
  }
};

/**
 * 生成分享文本内容
 * @param {Object} params 分享参数
 * @param {string} params.phrase 名字
 * @param {number} params.score 分数
 * @param {Array<string>} params.emojis 用户选择的表情
 * @param {string} params.suggestedEmojis AI推荐的表情
 * @param {Object} params.scoreLevel 评分等级信息
 * @returns {string} 格式化的分享文本
 */
export const generateShareText = ({ phrase, score, emojis, suggestedEmojis, scoreLevel }) => {
  return `我在make-it-emoji.tech中表达"${phrase}"，获得了${score}分！\n成功晋级【${scoreLevel.level}】🎉\n我的表达：${emojis.join(" ")}\nAI的表达：${suggestedEmojis}\n\n有本事你也来挑战一下？👉 make-it-emoji.tech #名字挑战`;
};

/**
 * 分享文本内容
 * @param {string} shareText 分享的文本内容
 * @returns {Promise<void>}
 */
export const shareTextContent = async (shareText) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: '🎮 make-it-emoji.tech挑战结果',
        text: shareText,
      });
    } catch (error) {
      console.error('使用分享API失败', error);
      fallbackCopyToClipboard(shareText);
    }
  } else {
    fallbackCopyToClipboard(shareText);
  }
};

/**
 * 复制文本到剪贴板的兼容方法
 * @param {string} text 要复制的文本
 */
const fallbackCopyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      alert('已复制到剪贴板，请分享给朋友！');
    })
    .catch((error) => {
      console.error('复制到剪贴板失败', error);
      alert('分享失败，请手动复制以下文本：\n\n' + text);
    });
};

/**
 * 复制挑战链接
 * @param {Object} params 链接参数
 * @param {string} params.phrase 名字
 * @param {number} params.score 分数
 * @returns {string} 生成的挑战链接
 */
export const generateChallengeLink = ({ phrase, score }) => {
  return `${window.location.origin}/game?phrase=${encodeURIComponent(phrase)}&score=${score}`;
};

/**
 * 复制挑战链接到剪贴板
 * @param {string} url 要复制的URL
 */
export const copyToClipboard = async (url) => {
  try {
    await navigator.clipboard.writeText(url);
    alert("已复制挑战链接，快发给好友！");
  } catch (err) {
    console.error("复制失败:", err);
    alert("复制失败，请手动复制: " + url);
  }
}; 