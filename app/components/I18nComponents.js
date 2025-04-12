'use client';

import { useTranslation } from '../utils/i18n';

// 使用钩子直接翻译文本
export function TranslatedText({ textKey, fallback }) {
  const { t } = useTranslation();
  return t(textKey) || fallback || textKey;
}

// 支持变量替换的翻译组件
export function TranslatedTextWithVars({ textKey, vars, fallback }) {
  const { t } = useTranslation();
  let translated = t(textKey) || fallback || textKey;
  
  // 替换变量
  if (vars) {
    Object.entries(vars).forEach(([key, value]) => {
      translated = translated.replace(`{${key}}`, value);
    });
  }
  
  return translated;
} 