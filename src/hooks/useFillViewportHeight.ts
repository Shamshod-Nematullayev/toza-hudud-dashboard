import { useCallback, useEffect, useState } from 'react';

/**
 * Element tepasidan ekran pastigacha qolgan balandlikni qaytaradi (sahifa scroll bo'lmasligi uchun).
 * Qattiq '65vh' kabi qiymatlar yuqoridagi kontent balandligiga qarab jadval pastini (pagination tugmalarini)
 * ekrandan chiqarib yuborardi.
 * @example const { ref, height } = useFillViewportHeight<HTMLDivElement>(); <Paper ref={ref} sx={{ height }} />
 */
export function useFillViewportHeight<T extends HTMLElement>({ bottomGap = 24, minHeight = 320 } = {}) {
  const [node, setNode] = useState<T | null>(null);
  const [height, setHeight] = useState<number>(minHeight);
  const ref = useCallback((el: T | null) => setNode(el), []);

  useEffect(() => {
    if (!node) return;
    const update = () => {
      const top = node.getBoundingClientRect().top + window.scrollY;
      setHeight(Math.max(minHeight, Math.floor(window.innerHeight - top - bottomGap)));
    };
    update();
    // Yuqoridagi filtrlar/kartalar balandligi o'zgarsa ham qayta hisoblanadi
    const observer = new ResizeObserver(update);
    if (node.parentElement) observer.observe(node.parentElement);
    observer.observe(document.body);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [node, bottomGap, minHeight]);

  return { ref, height };
}
