import { useState, useCallback } from "react";
import Dashboard from "./components/Dashboard";
import GameScreen from "./components/GameScreen";

export type TimerMode = "reset" | "continuous";
type AppView = "dashboard" | "game";

export default function App() {
  const [view, setView] = useState<AppView>("dashboard");
  const [words, setWords] = useState<string[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerMode, setTimerMode] = useState<TimerMode>("reset");

  const handleAddWord = useCallback((word: string) => {
    setWords((prev) => [...prev, word]);
  }, []);

  const handleRemoveWord = useCallback((index: number) => {
    setWords((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearAll = useCallback(() => {
    setWords([]);
  }, []);

  const handleSetTimer = useCallback((seconds: number) => {
    setTimerSeconds(seconds);
  }, []);

  const handleSetTimerMode = useCallback((mode: TimerMode) => {
    setTimerMode(mode);
  }, []);

  const handleStartGame = useCallback(() => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
    setView("game");
  }, [words]);

  const handleExitGame = useCallback(() => {
    setView("dashboard");
  }, []);

  if (view === "game") {
    return (
      <GameScreen
        words={shuffledWords}
        timerSeconds={timerSeconds}
        timerMode={timerMode}
        onExit={handleExitGame}
      />
    );
  }

  return (
    <Dashboard
      words={words}
      timerSeconds={timerSeconds}
      timerMode={timerMode}
      onAddWord={handleAddWord}
      onRemoveWord={handleRemoveWord}
      onClearAll={handleClearAll}
      onSetTimer={handleSetTimer}
      onSetTimerMode={handleSetTimerMode}
      onStartGame={handleStartGame}
    />
  );
}
