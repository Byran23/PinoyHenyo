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
  maxFontSize = 800,
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

    setReady(false);

    // Use almost the full width of the container
    const containerWidth = container.clientWidth * 0.95;
    
    // Give it a generous vertical limit (80% of container height or 55% of the viewport)
    const maxHeight = (container.clientHeight || window.innerHeight * 0.55) * 0.9;

    let lo = minFontSize;
    let hi = maxFontSize;
    let best = minFontSize;

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      textEl.style.fontSize = `${mid}px`;
      
      const fitsWidth = textEl.scrollWidth <= containerWidth;
      const fitsHeight = textEl.scrollHeight <= maxHeight;

      if (fitsWidth && fitsHeight) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    textEl.style.fontSize = `${best}px`;
    setFontSize(best);
    
    requestAnimationFrame(() => {
      setReady(true);
    });
  }, [maxFontSize, minFontSize]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    resize();

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
      className="w-full h-full min-h-[40vh] overflow-hidden flex items-center justify-center"
    >
      <span
        ref={textRef}
        className={className}
        style={{
          fontSize: `${fontSize}px`,
          fontFamily: 'Impact, "Arial Black", "Arial Bold", sans-serif',
          display: "inline-block",
          whiteSpace: "nowrap",
          lineHeight: "0.85", // Perfect vertical centering and compact size for Impact
          opacity: ready ? 1 : 0,
          transition: "opacity 0.08s ease-out",
        }}
      >
        {text}
      </span>
    </div>
  );
}