'use client';

import { useEffect } from 'react';
import { useTranslation, LanguageSwitcher } from '../utils/i18n';

export function LanguageSwitcherClient() {
  const { t, language } = useTranslation();

  // 处理文档中的翻译标记
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    // 查找所有带有翻译标记的元素
    const elements = document.querySelectorAll('[data-i18n-key]');
    
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n-key');
      const fallback = el.getAttribute('data-i18n-default');
      const varsAttr = el.getAttribute('data-i18n-vars');
      
      let translated = t(key);
      
      // 处理变量替换
      if (varsAttr) {
        try {
          const vars = JSON.parse(varsAttr);
          Object.entries(vars).forEach(([varKey, value]) => {
            translated = translated.replace(`{${varKey}}`, value);
          });
        } catch (error) {
          console.error('Error parsing i18n vars:', error);
        }
      }
      
      // 如果没有找到翻译，使用回退值
      el.textContent = translated || fallback || key;
    });
  }, [t, language]);

  return <LanguageSwitcher />;
} 