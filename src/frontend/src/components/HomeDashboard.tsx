import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DailyTasks, Identity } from "../hooks/useGrindMind";
import { haptic } from "../utils/haptic";
import { playTaskComplete } from "../utils/sound";

const QUOTES = [
  "Pain is temporary. Quitting lasts forever.",
  "Discipline is the bridge between goals and accomplishment.",
  "Your only limit is your mind.",
  "Champions are made when no one is watching.",
  "Either you run the day or the day runs you.",
  "Get comfortable being uncomfortable.",
  "The grind never stops.",
  "No days off.",
  "Be obsessed or be average.",
  "Iron sharpens iron.",
];

const TASK_META = [
  { key: "workout" as const, label: "WORKOUT", icon: "💪", xp: 20 },
  { key: "water" as const, label: "WATER INTAKE", icon: "💧", xp: 20 },
  { key: "meditation" as const, label: "MEDITATION", icon: "🧘", xp: 20 },
  { key: "diet" as const, label: "DIET", icon: "🥗", xp: 20 },
  { key: "sleep" as const, label: "SLEEP", icon: "😴", xp: 20 },
];

function getDailyQuote(): string {
  const day = Math.floor(Date.now() / 86400000);
  return QUOTES[day % QUOTES.length];
}

interface TaskCardProps {
  task: (typeof TASK_META)[number];
  done: boolean;
  index: number;
  soundEnabled: boolean;
  onToggle: () => void;
}

const TaskCard = ({
  task,
  done,
  index,
  soundEnabled,
  onToggle,
}: TaskCardProps) => {
  const [flashing, setFlashing] = useState(false);
  const [showXp, setShowXp] = useState(false);
  const xpKey = useRef(0);

  const handleClick = useCallback(() => {
    haptic();
    if (!done) {
      setFlashing(true);
      xpKey.current += 1;
      setShowXp(true);
      setTimeout(() => setFlashing(false), 500);
      setTimeout(() => setShowXp(false), 1200);
      if (soundEnabled) playTaskComplete();
    }
    onToggle();
  }, [done, onToggle, soundEnabled]);

  return (
    <div className="relative">
      <motion.button
        type="button"
        data-ocid={`home.task.${index + 1}`}
        onClick={handleClick}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center justify-between p-3 rounded-sm w-full glass-card card-hover ${
          flashing ? "task-flash" : ""
        }`}
        style={{
          borderLeft: done ? "3px solid #FF0000" : "3px solid #333",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{task.icon}</span>
          <span
            className="text-sm font-display font-bold uppercase tracking-wider"
            style={{
              color: done ? "#FF0000" : "#fff",
              textDecoration: done ? "line-through" : "none",
            }}
          >
            {task.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "#FF0000" }}>
            +{task.xp} XP
          </span>
          <div
            className="w-6 h-6 rounded-sm flex items-center justify-center transition-all duration-200"
            style={{
              backgroundColor: done ? "#FF0000" : "transparent",
              border: done ? "2px solid #FF0000" : "2px solid #444",
            }}
          >
            {done && <span className="text-white text-xs font-bold">✓</span>}
          </div>
        </div>
      </motion.button>

      {showXp && (
        <span key={xpKey.current} className="xp-pop">
          +{task.xp} XP
        </span>
      )}
    </div>
  );
};

interface Props {
  identity: Identity;
  tasks: DailyTasks;
  taskProgress: number;
  streak: number;
  xp: number;
  level: number;
  levelTitle: string;
  toggleTask: (task: keyof DailyTasks) => void;
  onStartWorkout: () => void;
  onStartFocus: () => void;
  soundEnabled: boolean;
  userName?: string;
}

export default function HomeDashboard({
  identity,
  tasks,
  taskProgress,
  streak,
  xp,
  level,
  levelTitle,
  toggleTask,
  onStartWorkout,
  onStartFocus,
  soundEnabled,
  userName,
}: Props) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (taskProgress / 100) * circumference;

  const identityColor =
    identity === "Alpha"
      ? "#FF0000"
      : identity === "Warrior"
        ? "#FF4444"
        : "#FF6666";

  const streakGlowClass =
    streak >= 7
      ? "streak-glow-high streak-glow-max"
      : streak >= 3
        ? "streak-glow-med"
        : "streak-glow-low";

  const disciplineScore = taskProgress;
  const allDone = taskProgress === 100;

  if (loading) {
    return (
      <div className="tab-fade pb-4 px-4 pt-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton
            className="h-4 w-24"
            style={{ backgroundColor: "#1a1a1a" }}
          />
          <Skeleton
            className="h-6 w-16"
            style={{ backgroundColor: "#1a1a1a" }}
          />
        </div>
        {/* Quote skeleton */}
        <Skeleton
          className="h-16 w-full rounded-sm mb-4"
          style={{ backgroundColor: "#0d0d0d" }}
        />
        {/* Ring + stats skeleton */}
        <div className="flex items-center justify-around mb-4">
          <Skeleton
            className="h-[200px] w-[200px] rounded-full"
            style={{ backgroundColor: "#0d0d0d" }}
          />
          <div className="flex flex-col gap-4">
            <Skeleton
              className="h-12 w-20"
              style={{ backgroundColor: "#0d0d0d" }}
            />
            <Skeleton
              className="h-10 w-20"
              style={{ backgroundColor: "#0d0d0d" }}
            />
            <Skeleton
              className="h-10 w-20"
              style={{ backgroundColor: "#0d0d0d" }}
            />
          </div>
        </div>
        {/* Score skeleton */}
        <Skeleton
          className="h-16 w-full rounded-sm mb-4"
          style={{ backgroundColor: "#0d0d0d" }}
        />
        {/* Tasks skeleton */}
        <div className="flex flex-col gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton
              key={i}
              className="h-14 w-full rounded-sm"
              style={{ backgroundColor: "#0d0d0d" }}
            />
          ))}
        </div>
        {/* Buttons skeleton */}
        <div className="flex flex-col gap-3">
          <Skeleton
            className="h-14 w-full rounded-sm"
            style={{ backgroundColor: "#1a0000" }}
          />
          <Skeleton
            className="h-14 w-full rounded-sm"
            style={{ backgroundColor: "#0d0d0d" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="tab-fade pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span
          className="text-xs font-display tracking-widest"
          style={{ color: "#FF0000" }}
        >
          {userName ? `WELCOME BACK, ${userName.toUpperCase()}` : "GRINDMIND"}
        </span>
        <span
          className="text-xs font-display font-bold uppercase tracking-wider px-2 py-1 rounded-sm"
          style={{
            backgroundColor: "#1a1a1a",
            color: identityColor,
            border: `1px solid ${identityColor}`,
          }}
        >
          {identity}
        </span>
      </div>

      {/* Perfect Day Banner */}
      {allDone && (
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          className="mx-4 mb-3 py-3 px-4 rounded-sm flex items-center justify-center gap-2 perfect-day-banner"
          style={{
            backgroundColor: "#1a0000",
            border: "1px solid #FF0000",
          }}
        >
          <span className="text-lg">⭐</span>
          <span
            className="text-xs font-display font-bold uppercase tracking-widest"
            style={{ color: "#FF0000" }}
          >
            PERFECT DAY — ELITE PERFORMANCE
          </span>
        </motion.div>
      )}

      {/* Daily Quote */}
      <div
        className="px-4 py-3 mx-4 rounded-sm mb-4 glass-card"
        style={{ borderLeft: "3px solid #FF0000" }}
      >
        <p
          className="text-xs uppercase tracking-widest mb-1"
          style={{ color: "#FF0000" }}
        >
          TODAY'S FUEL
        </p>
        <p className="text-sm font-bold text-white italic">
          "{getDailyQuote()}"
        </p>
      </div>

      {/* Progress Ring + Streak */}
      <div className="flex items-center justify-around px-4 mb-4">
        <div className="flex flex-col items-center">
          <svg
            width="200"
            height="200"
            aria-label="Daily progress ring"
            role="img"
            className="progress-ring"
            style={{ transform: "rotate(-90deg)" }}
          >
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="12"
            />
            <motion.circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#FF0000"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - strokeDash }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ filter: "drop-shadow(0 0 8px rgba(255,0,0,0.7))" }}
            />
          </svg>
          <div
            className="relative"
            style={{
              marginTop: "-118px",
              height: "200px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span className="text-4xl font-display font-bold text-white">
              {taskProgress}%
            </span>
            <span
              className="text-xs uppercase tracking-wider"
              style={{ color: "#888" }}
            >
              DAILY
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className={`flex flex-col items-center ${streakGlowClass}`}>
            <div className="flex items-center gap-1">
              <span className="flame-pulse text-2xl">🔥</span>
              <span className="text-3xl font-display font-bold text-white">
                {streak}
              </span>
            </div>
            <span
              className="text-xs font-display uppercase tracking-widest"
              style={{ color: "#FF0000" }}
            >
              DAY STREAK
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-display font-bold text-white">
              LVL {level}
            </span>
            <span
              className="text-xs font-display uppercase tracking-widest"
              style={{ color: "#888" }}
            >
              {levelTitle}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span
              className="text-xl font-display font-bold"
              style={{ color: "#FF0000" }}
            >
              {xp.toLocaleString()}
            </span>
            <span
              className="text-xs uppercase tracking-widest"
              style={{ color: "#888" }}
            >
              TOTAL XP
            </span>
          </div>
        </div>
      </div>

      {/* Discipline Score */}
      <div className="px-4 mb-4">
        <div className="glass-card rounded-sm p-4 flex items-center justify-between">
          <div>
            <p
              className="text-xs font-display uppercase tracking-widest"
              style={{ color: "#888" }}
            >
              TODAY'S DISCIPLINE SCORE
            </p>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className="text-4xl font-display font-bold"
              style={{ color: "#FF0000" }}
            >
              {disciplineScore}
            </span>
            <span className="text-xl font-display font-bold text-white">
              /100
            </span>
          </div>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="px-4 mb-6">
        <h2
          className="text-xs font-display uppercase tracking-widest mb-3"
          style={{ color: "#888" }}
        >
          TODAY'S TASKS
        </h2>
        <div className="flex flex-col gap-2">
          {TASK_META.map((task, i) => (
            <TaskCard
              key={task.key}
              task={task}
              done={tasks[task.key]}
              index={i}
              soundEnabled={soundEnabled}
              onToggle={() => toggleTask(task.key)}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 flex flex-col gap-3">
        <button
          type="button"
          data-ocid="home.workout.primary_button"
          onClick={() => {
            haptic();
            onStartWorkout();
          }}
          className="w-full py-4 rounded-sm btn-red text-sm"
          style={{
            backgroundColor: "#FF0000",
            boxShadow: "0 0 25px rgba(255,0,0,0.5), 0 0 50px rgba(255,0,0,0.2)",
          }}
        >
          START WORKOUT →
        </button>
        <button
          type="button"
          data-ocid="home.focus.primary_button"
          onClick={() => {
            haptic();
            onStartFocus();
          }}
          className="w-full py-4 rounded-sm btn-outline-red text-sm"
        >
          START FOCUS TIMER →
        </button>
      </div>
    </div>
  );
}
