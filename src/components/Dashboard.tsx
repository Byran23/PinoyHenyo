import { useState } from "react";
import type { TimerMode } from "../App";
import {
  PlayIcon, PlusIcon, TrashIcon, XIcon, ClockIcon, ListIcon,
  ShuffleIcon, PackageIcon, EyeIcon, TimerResetIcon, RepeatIcon, InboxIcon,
} from "./Icons";

interface DashboardProps {
  words: string[];
  timerSeconds: number;
  timerMode: TimerMode;
  onAddWord: (word: string) => void;
  onRemoveWord: (index: number) => void;
  onClearAll: () => void;
  onSetTimer: (seconds: number) => void;
  onSetTimerMode: (mode: TimerMode) => void;
  onStartGame: () => void;
}

const presetTimers = [
  { label: "30s", value: 30 },
  { label: "1 min", value: 60 },
  { label: "1.5 min", value: 90 },
  { label: "2 min", value: 120 },
  { label: "3 min", value: 180 },
  { label: "5 min", value: 300 },
];

const sampleWords = [
  "ADOBO", "SINIGANG", "LECHON", "HALO-HALO", "LUMPIA",
  "KALABAW", "TARSIER", "EAGLE", "PUSA", "ASO",
  "BORACAY", "MANILA", "CEBU", "BAGUIO", "PALAWAN",
  "CELLPHONE", "TSINELAS", "PAYONG", "WALIS", "LIBRO",
  "MANNY PACQUIAO", "JOSE RIZAL", "LEA SALONGA",
  "BAHAGHARI", "BULKAN", "DAGAT", "BUNDOK",
  "PIZZA", "HAMBURGER", "BASKETBALL", "GUITAR",
  "SPAGHETTI", "TELEVISION", "COMPUTER", "CAMERA",
];

export default function Dashboard({
  words,
  timerSeconds,
  timerMode,
  onAddWord,
  onRemoveWord,
  onClearAll,
  onSetTimer,
  onSetTimerMode,
  onStartGame,
}: DashboardProps) {
  const [input, setInput] = useState("");
  const [customMinutes, setCustomMinutes] = useState("");
  const [customSeconds, setCustomSeconds] = useState("");

  const handleAdd = () => {
    const trimmed = input.trim().toUpperCase();
    if (trimmed && !words.includes(trimmed)) {
      onAddWord(trimmed);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  const handleAddRandom = () => {
    const available = sampleWords.filter((w) => !words.includes(w));
    if (available.length === 0) return;
    const pick = available[Math.floor(Math.random() * available.length)];
    onAddWord(pick);
  };

  const handleAddAll = () => {
    sampleWords.forEach((w) => {
      if (!words.includes(w)) onAddWord(w);
    });
  };

  const handleCustomTimer = () => {
    const mins = parseInt(customMinutes) || 0;
    const secs = parseInt(customSeconds) || 0;
    const total = mins * 60 + secs;
    if (total > 0 && total <= 3600) {
      onSetTimer(total);
      setCustomMinutes("");
      setCustomSeconds("");
    }
  };

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    if (m === 0) return `${sec}s`;
    if (sec === 0) return `${m} min`;
    return `${m}m ${sec}s`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-[#0f0f18]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Pinoy Henyo
              </h1>
              <p className="text-[11px] text-gray-500 font-medium tracking-wider uppercase">
                Game Setup
              </p>
            </div>
          </div>
          <button
            onClick={onStartGame}
            disabled={words.length === 0}
            className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm shadow-lg shadow-cyan-600/20 hover:shadow-cyan-500/30 transition-all disabled:opacity-25 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <PlayIcon className="w-4 h-4" />
            Start Game
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column: Words (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Add Word */}
            <section className="bg-[#13131f] border border-white/[0.06] rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-sm flex items-center gap-2 text-gray-300 uppercase tracking-wider">
                <EditIcon className="w-4 h-4 text-gray-500" />
                Add Words
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a word and press Enter..."
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 focus:border-cyan-500/30 transition-all"
                  autoComplete="off"
                />
                <button
                  onClick={handleAdd}
                  disabled={!input.trim()}
                  className="px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-all disabled:opacity-25 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleAddRandom}
                  className="px-3 py-1.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-gray-500 text-xs font-medium hover:bg-white/[0.08] hover:text-gray-300 transition-all flex items-center gap-1.5"
                >
                  <ShuffleIcon className="w-3 h-3" />
                  Random
                </button>
                <button
                  onClick={handleAddAll}
                  className="px-3 py-1.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-gray-500 text-xs font-medium hover:bg-white/[0.08] hover:text-gray-300 transition-all flex items-center gap-1.5"
                >
                  <PackageIcon className="w-3 h-3" />
                  Load Samples
                </button>
                {words.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="px-3 py-1.5 rounded-md bg-red-500/[0.08] border border-red-500/[0.12] text-red-400/80 text-xs font-medium hover:bg-red-500/[0.15] hover:text-red-400 transition-all flex items-center gap-1.5"
                  >
                    <TrashIcon className="w-3 h-3" />
                    Clear All
                  </button>
                )}
              </div>
            </section>

            {/* Word List */}
            <section className="bg-[#13131f] border border-white/[0.06] rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm flex items-center gap-2 text-gray-300 uppercase tracking-wider">
                  <ListIcon className="w-4 h-4 text-gray-500" />
                  Word List
                </h2>
                <span className="text-[11px] bg-white/[0.06] text-gray-500 px-2 py-0.5 rounded font-mono font-bold tabular-nums">
                  {words.length}
                </span>
              </div>
              {words.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  <InboxIcon className="w-10 h-10 mx-auto mb-3 text-gray-700" />
                  <p className="text-sm">No words added yet</p>
                  <p className="text-xs text-gray-700 mt-1">Type a word above or load sample words</p>
                </div>
              ) : (
                <div className="max-h-[420px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {words.map((word, index) => (
                    <div
                      key={`${word}-${index}`}
                      className="group flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] rounded-lg px-3 py-2 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-gray-700 font-mono w-5 text-right tabular-nums">
                          {index + 1}
                        </span>
                        <span className="font-medium text-sm text-gray-300 tracking-wide">
                          {word}
                        </span>
                      </div>
                      <button
                        onClick={() => onRemoveWord(index)}
                        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all p-1 rounded"
                        title="Remove"
                      >
                        <XIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Timer & Settings (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Timer Settings */}
            <section className="bg-[#13131f] border border-white/[0.06] rounded-xl p-5 space-y-5">
              <h2 className="font-semibold text-sm flex items-center gap-2 text-gray-300 uppercase tracking-wider">
                <ClockIcon className="w-4 h-4 text-gray-500" />
                Timer
              </h2>

              {/* Timer display */}
              <div className="text-center py-3">
                <div
                  className="text-5xl font-black text-white tracking-widest tabular-nums"
                  style={{ fontFamily: "'Orbitron', monospace" }}
                >
                  {String(Math.floor(timerSeconds / 60)).padStart(2, "0")}
                  <span className="text-gray-700">:</span>
                  {String(timerSeconds % 60).padStart(2, "0")}
                </div>
                <p className="text-gray-600 text-xs mt-2 font-mono">
                  {fmtTime(timerSeconds)} {timerMode === "reset" ? "per word" : "total"}
                </p>
              </div>

              {/* Timer Mode Toggle */}
              <div>
                <p className="text-[11px] text-gray-600 font-medium mb-2 uppercase tracking-wider">Mode</p>
                <div className="grid grid-cols-2 gap-1.5 bg-white/[0.03] p-1 rounded-lg">
                  <button
                    onClick={() => onSetTimerMode("reset")}
                    className={`py-2 px-3 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      timerMode === "reset"
                        ? "bg-cyan-600 text-white shadow-md"
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]"
                    }`}
                  >
                    <TimerResetIcon className="w-3.5 h-3.5" />
                    Reset Each Word
                  </button>
                  <button
                    onClick={() => onSetTimerMode("continuous")}
                    className={`py-2 px-3 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      timerMode === "continuous"
                        ? "bg-cyan-600 text-white shadow-md"
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]"
                    }`}
                  >
                    <RepeatIcon className="w-3.5 h-3.5" />
                    Continuous
                  </button>
                </div>
                <p className="text-[10px] text-gray-700 mt-1.5 leading-relaxed">
                  {timerMode === "reset"
                    ? "Timer resets for each new word."
                    : "Timer keeps running across all words."}
                </p>
              </div>

              {/* Presets */}
              <div>
                <p className="text-[11px] text-gray-600 font-medium mb-2 uppercase tracking-wider">Presets</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {presetTimers.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => onSetTimer(preset.value)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        timerSeconds === preset.value
                          ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                          : "bg-white/[0.04] border border-white/[0.06] text-gray-500 hover:bg-white/[0.08] hover:text-gray-300"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom */}
              <div>
                <p className="text-[11px] text-gray-600 font-medium mb-2 uppercase tracking-wider">Custom</p>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(e.target.value)}
                      placeholder="0"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-2 text-sm text-white text-center placeholder:text-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 font-mono tabular-nums"
                    />
                    <span className="text-gray-600 text-[10px] shrink-0">min</span>
                  </div>
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={customSeconds}
                      onChange={(e) => setCustomSeconds(e.target.value)}
                      placeholder="0"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-2 text-sm text-white text-center placeholder:text-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 font-mono tabular-nums"
                    />
                    <span className="text-gray-600 text-[10px] shrink-0">sec</span>
                  </div>
                  <button
                    onClick={handleCustomTimer}
                    className="px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-gray-400 text-xs font-semibold hover:bg-white/[0.1] transition-all shrink-0"
                  >
                    Set
                  </button>
                </div>
              </div>
            </section>

            {/* Preview */}
            <section className="bg-[#13131f] border border-white/[0.06] rounded-xl p-5 space-y-3">
              <h2 className="font-semibold text-sm flex items-center gap-2 text-gray-300 uppercase tracking-wider">
                <EyeIcon className="w-4 h-4 text-gray-500" />
                Preview
              </h2>
              <div className="bg-black rounded-lg overflow-hidden border border-white/[0.04]">
                <div className="p-6 text-center space-y-3">
                  <div
                    className="font-black text-white tracking-wider uppercase"
                    style={{
                      fontSize: (words.length > 0 ? words[0] : "WORD").length > 10 ? "1.25rem" : "1.75rem",
                    }}
                  >
                    {words.length > 0 ? words[0] : "YOUR WORD"}
                  </div>
                  <div
                    className="text-2xl font-black text-cyan-400 tabular-nums tracking-widest"
                    style={{ fontFamily: "'Orbitron', monospace" }}
                  >
                    {String(Math.floor(timerSeconds / 60)).padStart(2, "0")}
                    <span className="text-cyan-700">:</span>
                    {String(timerSeconds % 60).padStart(2, "0")}
                  </div>
                </div>
                <div className="w-full h-1.5 bg-cyan-950/50">
                  <div className="h-full w-full bg-cyan-500" />
                </div>
              </div>
              <p className="text-gray-700 text-[11px] text-center">
                Fullscreen preview of the game display
              </p>
            </section>

            {/* Start */}
            <button
              onClick={onStartGame}
              disabled={words.length === 0}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-sm shadow-lg shadow-cyan-600/15 hover:shadow-cyan-600/25 hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <PlayIcon className="w-5 h-5" />
              Start Game
              {words.length > 0 && (
                <span className="text-cyan-200/70 font-mono text-xs ml-1">
                  ({words.length} {words.length === 1 ? "word" : "words"})
                </span>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function EditIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
