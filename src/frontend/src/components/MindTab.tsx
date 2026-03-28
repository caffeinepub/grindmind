import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { JournalEntry } from "../hooks/useGrindMind";
import { haptic } from "../utils/haptic";

const AFFIRMATIONS = [
  "I AM DISCIPLINED",
  "I DON'T QUIT",
  "I AM BUILT DIFFERENT",
  "I CONTROL MY MIND",
  "I EARN EVERYTHING I GET",
  "WEAKNESS IS A CHOICE",
  "I AM THE STANDARD",
];

const MEDITATION_SESSIONS = [
  {
    id: "clarity-focus",
    duration: "5 MIN",
    title: "Clarity Focus",
    desc: "Clear your mind, lock in your focus.",
  },
  {
    id: "deep-reset",
    duration: "10 MIN",
    title: "Deep Reset",
    desc: "Full reset for peak performance.",
  },
  {
    id: "body-scan",
    duration: "10 MIN",
    title: "Body Scan",
    desc: "Release tension, gain body awareness.",
  },
];

function useTypingAnimation(text: string, speed = 50) {
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setDisplayed("");
    setTyping(true);
    let i = 0;
    timerRef.current = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timerRef.current!);
        setTyping(false);
      }
    }, speed);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, speed]);

  return { displayed, typing };
}

interface Props {
  journal: JournalEntry[];
  saveJournal: (conquered: string, dominate: string) => void;
}

export default function MindTab({ journal, saveJournal }: Props) {
  // Pomodoro
  const [timerMode, setTimerMode] = useState<"focus" | "break">("focus");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        setIsRunning(false);
        if (timerMode === "focus") {
          setTimerMode("break");
          setTimeLeft(5 * 60);
          setSessionCount((s) => s + 1);
        } else {
          setTimerMode("focus");
          setTimeLeft(25 * 60);
        }
        return prev;
      }
      return prev - 1;
    });
  }, [timerMode]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, tick]);

  const resetTimer = () => {
    setIsRunning(false);
    setTimerMode("focus");
    setTimeLeft(25 * 60);
    setSessionCount(1);
  };

  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  // Affirmations with typing animation
  const [affirmIndex, setAffirmIndex] = useState(0);
  const { displayed: typedAffirm, typing: isTyping } = useTypingAnimation(
    AFFIRMATIONS[affirmIndex],
    50,
  );

  useEffect(() => {
    const t = setInterval(() => {
      setAffirmIndex((i) => (i + 1) % AFFIRMATIONS.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  // Journal
  const [conquered, setConquered] = useState("");
  const [dominate, setDominate] = useState("");
  const [saved, setSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSoundNote, setShowSoundNote] = useState(false);

  const handleSave = () => {
    if (!conquered.trim() && !dominate.trim()) return;
    saveJournal(conquered, dominate);
    setSaved(true);
    setConquered("");
    setDominate("");
    setTimeout(() => setSaved(false), 3000);
  };

  const recentJournal = journal.slice(0, 5);

  return (
    <div className="tab-fade pb-4">
      <div className="px-4 pt-4 mb-6">
        <h1 className="text-2xl font-display font-bold uppercase tracking-widest text-white">
          SHARPEN YOUR MIND
        </h1>
        <div
          className="h-0.5 w-16 mt-1"
          style={{ backgroundColor: "#FF0000" }}
        />
      </div>

      {/* Pomodoro Timer */}
      <div className="px-4 mb-6">
        <div className="p-5 rounded-sm glass-card">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-xs font-display uppercase tracking-widest"
              style={{ color: "#888" }}
            >
              FOCUS TIMER
            </h2>
            <span
              className="text-xs font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm"
              style={{
                backgroundColor: timerMode === "focus" ? "#FF0000" : "#1a1a1a",
                color: timerMode === "break" ? "#FF0000" : "#fff",
                border: timerMode === "break" ? "1px solid #FF0000" : "none",
              }}
            >
              {timerMode === "focus" ? "FOCUS" : "BREAK"}
            </span>
          </div>

          <div className="text-center mb-4">
            <div
              className="text-6xl font-display font-bold text-white mb-1"
              style={{
                fontVariantNumeric: "tabular-nums",
                textShadow: isRunning ? "0 0 30px rgba(255,0,0,0.4)" : "none",
              }}
            >
              {minutes}:{seconds}
            </div>
            <p className="text-xs" style={{ color: "#888" }}>
              Session {sessionCount} of 4
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              data-ocid="mind.timer.start_button"
              onClick={() => {
                haptic();
                setIsRunning((v) => !v);
              }}
              className="flex-1 py-3 rounded-sm font-display font-bold uppercase tracking-wider text-sm"
              style={{
                backgroundColor: isRunning ? "#1a1a1a" : "#FF0000",
                color: isRunning ? "#FF0000" : "#fff",
                border: isRunning ? "2px solid #FF0000" : "none",
                boxShadow: !isRunning ? "0 0 15px rgba(255,0,0,0.4)" : "none",
              }}
            >
              {isRunning ? "PAUSE" : "START"}
            </button>
            <button
              type="button"
              data-ocid="mind.timer.reset_button"
              onClick={() => {
                haptic();
                resetTimer();
              }}
              className="px-4 py-3 rounded-sm font-display font-bold uppercase tracking-wider text-sm btn-outline-red"
            >
              RESET
            </button>
          </div>
        </div>
      </div>

      {/* Affirmations with typing animation */}
      <div className="px-4 mb-6">
        <h2
          className="text-xs font-display uppercase tracking-widest mb-3"
          style={{ color: "#888" }}
        >
          TODAY'S AFFIRMATION
        </h2>
        <div
          className="p-5 rounded-sm text-center relative overflow-hidden glass-card"
          style={{ minHeight: "120px" }}
        >
          <div
            className="flex flex-col items-center justify-center"
            style={{ minHeight: "60px" }}
          >
            <p className="text-xl font-display font-bold uppercase tracking-widest text-white mb-4">
              {typedAffirm}
              {isTyping && <span className="typing-cursor">|</span>}
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              data-ocid="mind.affirmation.prev_button"
              onClick={() =>
                setAffirmIndex(
                  (i) => (i - 1 + AFFIRMATIONS.length) % AFFIRMATIONS.length,
                )
              }
              className="px-4 py-2 text-xs font-display font-bold rounded-sm btn-outline-red"
            >
              ← PREV
            </button>
            <button
              type="button"
              data-ocid="mind.affirmation.next_button"
              onClick={() =>
                setAffirmIndex((i) => (i + 1) % AFFIRMATIONS.length)
              }
              className="px-4 py-2 text-xs font-display font-bold rounded-sm btn-red"
            >
              NEXT →
            </button>
          </div>
          <div className="flex justify-center gap-1 mt-3">
            {AFFIRMATIONS.map((affirm, i) => (
              <div
                key={affirm}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{
                  backgroundColor: i === affirmIndex ? "#FF0000" : "#333",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Focus Sound Toggle */}
      <div className="px-4 mb-6">
        <div className="glass-card rounded-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-display font-bold uppercase tracking-widest text-white">
              🎵 FOCUS SOUND
            </p>
            {showSoundNote && (
              <p className="text-xs mt-1" style={{ color: "#888" }}>
                Ambient sound requires audio — use your preferred app
              </p>
            )}
          </div>
          <button
            type="button"
            data-ocid="mind.sound.toggle"
            onClick={() => setShowSoundNote((v) => !v)}
            className="px-3 py-1.5 text-xs font-display font-bold uppercase rounded-sm transition-all"
            style={{
              backgroundColor: showSoundNote ? "rgba(255,0,0,0.15)" : "#1a1a1a",
              color: "#FF0000",
              border: "1px solid #FF0000",
            }}
          >
            {showSoundNote ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* Meditation Sessions */}
      <div className="px-4 mb-6">
        <h2
          className="text-xs font-display uppercase tracking-widest mb-3"
          style={{ color: "#888" }}
        >
          MEDITATION SESSIONS
        </h2>
        <div className="flex flex-col gap-2">
          {MEDITATION_SESSIONS.map((session, i) => (
            <div
              key={session.id}
              data-ocid={`mind.meditation.item.${i + 1}`}
              className="flex items-center justify-between p-4 rounded-sm card-hover glass-card"
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  data-ocid={`mind.meditation.play.${i + 1}.button`}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: "#1a1a1a",
                    border: "2px solid #FF0000",
                  }}
                >
                  <span
                    style={{
                      color: "#FF0000",
                      fontSize: "14px",
                      marginLeft: "2px",
                    }}
                  >
                    ▶
                  </span>
                </button>
                <div>
                  <p className="text-sm font-display font-bold uppercase tracking-wide text-white">
                    {session.title}
                  </p>
                  <p className="text-xs" style={{ color: "#888" }}>
                    {session.desc}
                  </p>
                </div>
              </div>
              <span
                className="text-xs font-display font-bold px-2 py-1 rounded-sm"
                style={{
                  backgroundColor: "#1a1a1a",
                  color: "#FF0000",
                  border: "1px solid #FF0000",
                }}
              >
                {session.duration}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Journal */}
      <div className="px-4">
        <h2
          className="text-xs font-display uppercase tracking-widest mb-3"
          style={{ color: "#888" }}
        >
          DAILY DEBRIEF
        </h2>
        <div className="p-4 rounded-sm glass-card">
          <div className="flex flex-col gap-3 mb-4">
            <div>
              <label
                htmlFor="journal-conquered"
                className="text-xs font-display uppercase tracking-wider mb-1 block"
                style={{ color: "#FF0000" }}
              >
                WHAT DID YOU CONQUER TODAY?
              </label>
              <textarea
                id="journal-conquered"
                data-ocid="mind.journal.conquered.textarea"
                value={conquered}
                onChange={(e) => setConquered(e.target.value)}
                placeholder="What did you conquer today?"
                rows={3}
                className="w-full px-3 py-2 text-sm text-white rounded-sm resize-none"
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid #333",
                }}
              />
            </div>
            <div>
              <label
                htmlFor="journal-dominate"
                className="text-xs font-display uppercase tracking-wider mb-1 block"
                style={{ color: "#FF0000" }}
              >
                WHAT WILL YOU DOMINATE TOMORROW?
              </label>
              <textarea
                id="journal-dominate"
                data-ocid="mind.journal.dominate.textarea"
                value={dominate}
                onChange={(e) => setDominate(e.target.value)}
                placeholder="What will you dominate tomorrow?"
                rows={3}
                className="w-full px-3 py-2 text-sm text-white rounded-sm resize-none"
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid #333",
                }}
              />
            </div>
          </div>
          <button
            type="button"
            data-ocid="mind.journal.save_button"
            onClick={() => {
              haptic(40);
              handleSave();
            }}
            className="w-full py-3 rounded-sm font-display font-bold uppercase tracking-wider text-sm"
            style={{
              backgroundColor: saved ? "#1a1a1a" : "#FF0000",
              color: saved ? "#FF0000" : "#fff",
              border: saved ? "2px solid #FF0000" : "none",
              boxShadow: !saved ? "0 0 15px rgba(255,0,0,0.3)" : "none",
            }}
          >
            {saved ? "SAVED ✓" : "SAVE ENTRY →"}
          </button>
        </div>

        {/* Journal History */}
        {recentJournal.length > 0 && (
          <div className="mt-4">
            <button
              type="button"
              data-ocid="mind.journal.history.toggle"
              onClick={() => setShowHistory((v) => !v)}
              className="w-full text-xs font-display font-bold uppercase tracking-widest py-2 flex items-center justify-center gap-2"
              style={{ color: "#888" }}
            >
              VIEW HISTORY {showHistory ? "▲" : "▼"}
            </button>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-2 pt-2">
                    {recentJournal.map((entry, i) => (
                      <div
                        key={`${entry.date}-${i}`}
                        data-ocid={`mind.journal.history.item.${i + 1}`}
                        className="p-3 rounded-sm glass-card"
                        style={{ borderLeft: "2px solid #333" }}
                      >
                        <p
                          className="text-xs font-display font-bold uppercase tracking-wider mb-2"
                          style={{ color: "#FF0000" }}
                        >
                          {entry.date}
                        </p>
                        {entry.conquered && (
                          <div className="mb-1">
                            <span
                              className="text-xs uppercase"
                              style={{ color: "#555" }}
                            >
                              CONQUERED:{" "}
                            </span>
                            <span className="text-xs text-white">
                              {entry.conquered}
                            </span>
                          </div>
                        )}
                        {entry.dominate && (
                          <div>
                            <span
                              className="text-xs uppercase"
                              style={{ color: "#555" }}
                            >
                              TOMORROW:{" "}
                            </span>
                            <span className="text-xs text-white">
                              {entry.dominate}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
