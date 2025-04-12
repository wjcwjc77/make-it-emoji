'use client';

import { useTranslation } from '@/app/utils/i18n';

/**
 * 渲染翻译文本的组件
 * @param {Object} props 组件属性
 * @param {string} props.textKey 翻译键
 * @param {string} [props.className] 可选的CSS类名
 * @param {string} [props.fallback] 回退文本，当翻译不存在时显示
 * @returns {JSX.Element|null} 翻译后的文本元素或null
 */
export function TranslatedText({ textKey, className = '', fallback }) {
  const { t } = useTranslation();
  
  if (!textKey) return null;
  
  return (
    <span className={className}>
      {t(textKey) || fallback || textKey}
    </span>
  );
}

/**
 * 渲染包含变量的翻译文本的组件
 * @param {Object} props 组件属性
 * @param {string} props.textKey 翻译键
 * @param {Object} props.vars 要替换的变量对象
 * @param {string} [props.className] 可选的CSS类名
 * @param {string} [props.fallback] 回退文本，当翻译不存在时显示
 * @returns {JSX.Element|null} 翻译后的文本元素或null
 */
export function TranslatedTextWithVars({ textKey, vars = {}, className = '', fallback }) {
  const { t } = useTranslation();
  
  if (!textKey) return null;
  
  let text = t(textKey) || fallback || textKey;
  
  // 替换形如 {varName} 的变量 (匹配翻译文件中的格式)
  if (vars && Object.keys(vars).length > 0) {
    Object.entries(vars).forEach(([key, value]) => {
      // 使用全局替换正则
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      text = text.replace(regex, value);
    });
  }
  
  return (
    <span className={className}>
      {text}
    </span>
  );
} 