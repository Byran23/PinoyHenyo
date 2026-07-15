import { useEffect, useCallback, useRef, useState } from "react";
import { useTimer } from "../hooks/useTimer";
import { useFullscreen } from "../hooks/useFullscreen";
import type { TimerMode } from "../App";
import FitText from "./FitText";
import {
  XIcon, CheckIcon, SkipIcon, ArrowLeftIcon, RefreshIcon,
  ArrowRightIcon, TrophyIcon, ClockIcon,
} from "./Icons";

type GamePhase = "ready" | "playing" | "correct" | "timeout" | "finished";

interface GameScreenProps {
  words: string[];
  timerSeconds: number;
  timerMode: TimerMode;
  onExit: () => void;
}

interface WordResult {
  word: string;
  result: "correct" | "timeout" | "skip";
}

export default function GameScreen({ words, timerSeconds, timerMode, onExit }: GameScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("ready");
  const [results, setResults] = useState<WordResult[]>([]);
  const [countdownNum, setCountdownNum] = useState(3);
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const timerStartedRef = useRef(false);

  const currentWord = currentIndex < words.length ? words[currentIndex] : "";

  const handleTimeout = useCallback(() => {
    if (timerMode === "continuous") {
      setPhase("timeout");
      setResults((prev) => {
        const remaining: WordResult[] = [];
        remaining.push({ word: words[prev.length] || "", result: "timeout" });
        return [...prev, ...remaining];
      });
    } else {
      setPhase("timeout");
      setResults((prev) => [...prev, { word: words[currentIndex], result: "timeout" }]);
    }
  }, [timerMode, words, currentIndex]);

  const timer = useTimer({
    initialSeconds: timerSeconds,
    onTimeout: handleTimeout,
  });

  // Wake lock
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        }
      } catch { /* ignore */ }
    };
    requestWakeLock();
    return () => { wakeLockRef.current?.release(); };
  }, []);

  // Enter fullscreen on mount
  useEffect(() => {
    enterFullscreen();
  }, [enterFullscreen]);

  // Ready countdown
  useEffect(() => {
    if (phase !== "ready") return;
    if (countdownNum < 0) {
      setPhase("playing");
      if (!timerStartedRef.current) {
        timer.reset(timerSeconds);
        timer.start();
        timerStartedRef.current = true;
      }
      return;
    }
    const t = setTimeout(() => setCountdownNum((n) => n - 1), 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, countdownNum]);

  const handleCorrect = () => {
    setPhase("correct");
    setResults((prev) => [...prev, { word: currentWord, result: "correct" }]);
    timer.pause();
  };

  const handleSkip = () => {
    setResults((prev) => [...prev, { word: currentWord, result: "skip" }]);
    timer.pause();
    advanceToNext();
  };

  const advanceToNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= words.length) {
      setPhase("finished");
      timer.pause();
    } else {
      setCurrentIndex(nextIndex);
      setPhase("playing");
      if (timerMode === "reset") {
        timer.reset(timerSeconds);
        timer.start();
      } else {
        timer.start();
      }
    }
  }, [currentIndex, words.length, timer, timerSeconds, timerMode]);

  const handleExit = () => {
    exitFullscreen();
    timer.pause();
    onExit();
  };

  const handlePlayAgain = () => {
    setCurrentIndex(0);
    setResults([]);
    setCountdownNum(3);
    setPhase("ready");
    timerStartedRef.current = false;
    timer.reset(timerSeconds);
  };

  // Timer visual
  const pct = timerSeconds > 0 ? timer.secondsLeft / timerSeconds : 0;

  const getBarColor = () => {
    if (pct > 0.5) return "bg-cyan-500";
    if (pct > 0.25) return "bg-amber-500";
    return "bg-red-500";
  };

  const getBarGlow = () => {
    if (pct > 0.5) return "shadow-[0_0_20px_rgba(6,182,212,0.4)]";
    if (pct > 0.25) return "shadow-[0_0_20px_rgba(245,158,11,0.4)]";
    return "shadow-[0_0_20px_rgba(239,68,68,0.5)]";
  };

  const getDigitColor = () => {
    if (pct > 0.5) return "text-cyan-400";
    if (pct > 0.25) return "text-amber-400";
    return "text-red-500";
  };

  const getColonColor = () => {
    if (pct > 0.5) return "text-cyan-700";
    if (pct > 0.25) return "text-amber-700";
    return "text-red-800";
  };

  const getBgBar = () => {
    if (pct > 0.5) return "bg-cyan-950/50";
    if (pct > 0.25) return "bg-amber-950/50";
    return "bg-red-950/50";
  };

  const fmtTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return { min: String(m).padStart(2, "0"), sec: String(sec).padStart(2, "0") };
  };

  const timerDisplay = fmtTimer(timer.secondsLeft);
  const isUrgent = timer.secondsLeft <= 10 && timer.isRunning;

  // ── READY SCREEN ──
  if (phase === "ready") {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center space-y-8">
          <p className="text-gray-600 text-xs font-mono uppercase tracking-[0.4em]">Get Ready</p>
          <div key={countdownNum} className="animate-ping-once">
            {countdownNum > 0 ? (
              <span
                className="text-[12rem] sm:text-[16rem] font-black text-white leading-none block tabular-nums"
                style={{ fontFamily: "'Orbitron', monospace" }}
              >
                {countdownNum}
              </span>
            ) : (
              <span
                className="text-7xl sm:text-9xl font-black text-cyan-400 leading-none block tracking-[0.2em]"
                style={{ fontFamily: "'Orbitron', monospace" }}
              >
                GO
              </span>
            )}
          </div>
          <div className="flex items-center justify-center gap-4 text-gray-600 text-xs font-mono">
            <span>{words.length} word{words.length !== 1 ? "s" : ""}</span>
            <span className="w-px h-3 bg-gray-800" />
            <span>{fmtTimer(timerSeconds).min}:{fmtTimer(timerSeconds).sec}</span>
            <span className="w-px h-3 bg-gray-800" />
            <span>{timerMode === "reset" ? "per word" : "continuous"}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── FINISHED SCREEN ──
  if (phase === "finished") {
    const correct = results.filter((r) => r.result === "correct").length;
    const timeouts = results.filter((r) => r.result === "timeout").length;
    const skips = results.filter((r) => r.result === "skip").length;

    return (
      <div className="fixed inset-0 bg-[#060609] z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="max-w-md w-full space-y-6 py-8">
          <div className="text-center space-y-3">
            <TrophyIcon className="w-12 h-12 mx-auto text-cyan-400" />
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              GAME OVER
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-emerald-500/[0.08] border border-emerald-500/[0.15] rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-emerald-400 tabular-nums" style={{ fontFamily: "'Orbitron', monospace" }}>{correct}</div>
              <div className="text-emerald-500/60 text-[10px] font-semibold mt-0.5 uppercase tracking-wider">Correct</div>
            </div>
            <div className="bg-red-500/[0.08] border border-red-500/[0.15] rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-400 tabular-nums" style={{ fontFamily: "'Orbitron', monospace" }}>{timeouts}</div>
              <div className="text-red-500/60 text-[10px] font-semibold mt-0.5 uppercase tracking-wider">Timed Out</div>
            </div>
            <div className="bg-gray-500/[0.08] border border-gray-500/[0.15] rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-400 tabular-nums" style={{ fontFamily: "'Orbitron', monospace" }}>{skips}</div>
              <div className="text-gray-500/60 text-[10px] font-semibold mt-0.5 uppercase tracking-wider">Skipped</div>
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg divide-y divide-white/[0.04]">
            {results.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 px-4">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-gray-700 font-mono tabular-nums w-4 text-right">{i + 1}</span>
                  <span className="font-semibold text-sm text-gray-300">{r.word}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  r.result === "correct"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : r.result === "timeout"
                    ? "bg-red-500/10 text-red-400"
                    : "bg-gray-500/10 text-gray-500"
                }`}>
                  {r.result === "correct" ? "Correct" : r.result === "timeout" ? "Time Out" : "Skipped"}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <button onClick={handlePlayAgain} className="w-full py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2">
              <RefreshIcon className="w-4 h-4" />
              Play Again
            </button>
            <button onClick={handleExit} className="w-full py-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-gray-400 font-medium text-sm hover:bg-white/[0.08] hover:text-gray-300 transition-all flex items-center justify-center gap-2">
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING / CORRECT / TIMEOUT ──
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col select-none">
      {/* TIMEOUT overlay */}
      {phase === "timeout" && (
        <div
          className="absolute inset-0 z-30 flex flex-col items-center justify-center animate-fade-in"
          style={{ background: "radial-gradient(ellipse at center, rgba(127,29,29,0.95) 0%, rgba(0,0,0,0.98) 100%)" }}
        >
          <div className="space-y-8 text-center w-full px-6 max-w-2xl mx-auto">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-full border-2 border-red-500/30" />
              <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ClockIcon className="w-10 h-10 text-red-400" />
              </div>
            </div>

            <h2
              className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-wider uppercase"
              style={{ fontFamily: "'Orbitron', monospace", textShadow: "0 0 40px rgba(239,68,68,0.4)" }}
            >
              TIME OUT
            </h2>
            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-red-500 to-transparent" />

            <div>
              <p className="text-red-300/50 text-xs uppercase tracking-[0.25em] mb-3">The word was</p>
              <p
                className="text-3xl sm:text-5xl font-black text-red-200 tracking-widest"
                style={{ fontFamily: "'Orbitron', monospace" }}
              >
                {currentWord}
              </p>
            </div>

            <button
              onClick={() => {
                if (timerMode === "continuous") {
                  setPhase("finished");
                } else {
                  advanceToNext();
                }
              }}
              className="mt-4 px-8 py-3 rounded-lg bg-white/10 border border-white/[0.1] text-white font-semibold text-sm hover:bg-white/20 transition-all flex items-center gap-2 mx-auto"
            >
              {timerMode === "continuous" || currentIndex + 1 >= words.length ? (
                <>See Results</>
              ) : (
                <>
                  Next Word
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* CORRECT overlay */}
      {phase === "correct" && (
        <div
          className="absolute inset-0 z-30 flex flex-col items-center justify-center animate-fade-in"
          style={{ background: "radial-gradient(ellipse at center, rgba(6,78,59,0.95) 0%, rgba(0,0,0,0.98) 100%)" }}
        >
          <div className="space-y-8 text-center w-full px-6 max-w-2xl mx-auto">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckIcon className="w-10 h-10 text-emerald-400" />
              </div>
            </div>

            <h2
              className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-wider uppercase"
              style={{ fontFamily: "'Orbitron', monospace", textShadow: "0 0 40px rgba(16,185,129,0.4)" }}
            >
              CORRECT
            </h2>
            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />

            <p
              className="text-3xl sm:text-5xl font-black text-emerald-200 tracking-widest"
              style={{ fontFamily: "'Orbitron', monospace" }}
            >
              {currentWord}
            </p>

            <button
              onClick={advanceToNext}
              className="mt-4 px-8 py-3 rounded-lg bg-white/10 border border-white/[0.1] text-white font-semibold text-sm hover:bg-white/20 transition-all flex items-center gap-2 mx-auto"
            >
              {currentIndex + 1 < words.length ? (
                <>
                  Next Word
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              ) : (
                <>See Results</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── TOP BAR ── */}
      <div className="relative z-10 flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04]">
        <button
          onClick={handleExit}
          className="text-gray-700 hover:text-gray-400 transition-colors p-1.5 rounded-md hover:bg-white/[0.04] flex items-center gap-1.5 text-xs font-medium"
        >
          <XIcon className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-600 font-mono tabular-nums tracking-wider">
            {currentIndex + 1}
            <span className="text-gray-800"> / </span>
            {words.length}
          </span>
        </div>
        <div className="w-8" />
      </div>

      {/* ── WORD AREA ── */}
      {/* flex-[3] and min-h-[50vh] give the word the absolute maximum portion of the canvas */}
      <div className="relative z-10 flex-[3] flex flex-col items-center justify-center px-4 sm:px-8 w-full min-h-[50vh] overflow-hidden">
        <div className="w-full h-full flex items-center justify-center min-h-0">
          <FitText
            text={currentWord}
            className="text-white uppercase text-center tracking-normal whitespace-nowrap"
            maxFontSize={800}
            minFontSize={48}
          />
        </div>
      </div>

      {/* ── TIMER SECTION ── */}
      {phase === "playing" && (
        <div className="relative z-10">
          {/* Digital timer display */}
          <div className={`text-center pb-4 ${isUrgent ? "animate-pulse-fast" : ""}`}>
            <div className="inline-flex items-baseline gap-0.5" style={{ fontFamily: "'Orbitron', monospace" }}>
              <span className={`text-7xl sm:text-8xl md:text-9xl font-black tabular-nums ${getDigitColor()} transition-colors duration-500`}>
                {timerDisplay.min}
              </span>
              <span className={`text-6xl sm:text-7xl md:text-8xl font-black ${getColonColor()} transition-colors duration-500 ${timer.isRunning ? "animate-blink" : ""}`}>
                :
              </span>
              <span className={`text-7xl sm:text-8xl md:text-9xl font-black tabular-nums ${getDigitColor()} transition-colors duration-500`}>
                {timerDisplay.sec}
              </span>
            </div>
          </div>

          {/* Timer bar */}
          <div className={`w-full h-3 sm:h-4 ${getBgBar()} relative overflow-hidden`}>
            <div
              className={`absolute inset-y-0 left-0 ${getBarColor()} ${getBarGlow()} transition-all duration-1000 ease-linear`}
              style={{ width: `${pct * 100}%` }}
            />
            {/* Bright leading edge */}
            <div
              className="absolute inset-y-0 w-1 bg-white/60 transition-all duration-1000 ease-linear"
              style={{ left: `calc(${pct * 100}% - 2px)`, opacity: pct > 0.01 ? 1 : 0 }}
            />
          </div>

          {/* Bottom controls */}
          <div className="px-4 py-4 flex gap-3 max-w-lg mx-auto">
            <button
              onClick={handleSkip}
              className="flex-1 py-4 rounded-lg bg-white/[0.05] border border-white/[0.08] text-gray-400 font-semibold text-sm hover:bg-white/[0.1] hover:text-gray-300 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
            >
              <SkipIcon className="w-5 h-5" />
              PASS
            </button>
            <button
              onClick={handleCorrect}
              className="flex-1 py-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
            >
              <CheckIcon className="w-5 h-5" />
              CORRECT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}