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

    const containerWidth = container.clientWidth;
    const maxHeight = container.clientHeight || window.innerHeight * 0.4;

    let lo = minFontSize;
    let hi = maxFontSize;
    let best = minFontSize;

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

    setFontSize(best);
    textEl.style.fontSize = `${best}px`;
    setReady(true);
  }, [maxFontSize, minFontSize]);

  useEffect(() => {
    // Small delay to let layout settle
    const raf = requestAnimationFrame(() => resize());
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [resize, text]);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden flex items-center justify-center"
    >
      <span
        ref={textRef}
        className={className}
        style={{
          fontSize: `${fontSize}px`,
          display: "inline-block",
          whiteSpace: "nowrap",
          lineHeight: 1.1,
          opacity: ready ? 1 : 0,
          transition: "opacity 0.15s ease",
        }}
      >
        {text}
      </span>
    </div>
  );
}
