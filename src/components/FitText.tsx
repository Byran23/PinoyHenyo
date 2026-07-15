import { useRef, useEffect, useState, useCallback } from "react";

interface FitTextProps {
  text: string;
  className?: string;
  maxFontSize?: number;
  minFontSize?: number;
}

export default function FitText({
  text,
  className = "",
  maxFontSize = 500,
  minFontSize = 24,
}: FitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(minFontSize);
  const [ready, setReady] = useState(false);

  const resize = useCallback(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    // Temporarily hide text during the binary search calculation to prevent visual jumping
    setReady(false);

    const containerWidth = container.clientWidth;
    // Fallback to a viewport-relative calculation if height isn't fully initialized
    const maxHeight = container.clientHeight || window.innerHeight * 0.4;

    let lo = minFontSize;
    let hi = maxFontSize;
    let best = minFontSize;

    // Binary search to find the perfect fitting font size
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      textEl.style.fontSize = `${mid}px`;
      
      const fits = textEl.scrollWidth <= containerWidth && textEl.scrollHeight <= maxHeight;
      if (fits) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    // Set final font styles
    textEl.style.fontSize = `${best}px`;
    setFontSize(best);
    
    // Smoothly fade in the beautifully sized word
    requestAnimationFrame(() => {
      setReady(true);
    });
  }, [maxFontSize, minFontSize]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Trigger calculation when the word text changes
    resize();

    // Use ResizeObserver to catch any size adjustments of the parent container
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => resize());
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [resize, text]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-0 overflow-hidden flex items-center justify-center"
    >
      <span
        ref={textRef}
        className={className}
        style={{
          fontSize: `${fontSize}px`,
          display: "inline-block",
          whiteSpace: "nowrap",
          lineHeight: 0.9, // Tighter line-height keeps tall uppercase letters vertically centered
          opacity: ready ? 1 : 0,
          transition: "opacity 0.1s ease-out",
        }}
      >
        {text}
      </span>
    </div>
  );
}