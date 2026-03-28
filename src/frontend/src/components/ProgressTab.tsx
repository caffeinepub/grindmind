import { motion } from "motion/react";
import { useState } from "react";
import type { StrengthLog, WeightEntry } from "../hooks/useGrindMind";
import { haptic } from "../utils/haptic";

interface Props {
  weights: WeightEntry[];
  strengthLogs: StrengthLog[];
  addWeight: (weight: number) => void;
  taskProgress: number;
}

function WeightGraph({ weights }: { weights: WeightEntry[] }) {
  if (weights.length < 2) {
    return (
      <div
        className="w-full flex items-center justify-center py-8 rounded-sm"
        style={{ backgroundColor: "#1a1a1a", height: "120px" }}
      >
        <p
          className="text-xs uppercase tracking-wider"
          style={{ color: "#444" }}
        >
          LOG MORE ENTRIES TO SEE GRAPH
        </p>
      </div>
    );
  }

  const recent = weights.slice(-14);
  const values = recent.map((w) => w.weight);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const W = 320;
  const H = 100;
  const padX = 30;
  const padY = 10;

  const points = recent.map((w, i) => {
    const x = padX + (i / (recent.length - 1)) * (W - padX * 2);
    const y = padY + (1 - (w.weight - min) / range) * (H - padY * 2);
    return `${x},${y}`;
  });

  const polyline = points.join(" ");
  const lastPoint = points[points.length - 1]?.split(",");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      aria-label="Weight progress graph"
      role="img"
      className="w-full"
      style={{
        height: "120px",
        backgroundColor: "#1a1a1a",
        borderRadius: "4px",
      }}
    >
      {[0, 0.5, 1].map((t) => (
        <line
          key={t}
          x1={padX}
          y1={padY + t * (H - padY * 2)}
          x2={W - padX}
          y2={padY + t * (H - padY * 2)}
          stroke="#333"
          strokeWidth="1"
        />
      ))}
      <text x="4" y={padY + 5} fill="#666" fontSize="8">
        {max.toFixed(0)}
      </text>
      <text x="4" y={H - padY + 3} fill="#666" fontSize="8">
        {min.toFixed(0)}
      </text>
      <polyline
        points={polyline}
        fill="none"
        stroke="#FF0000"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((pt) => {
        const [x, y] = pt.split(",");
        return <circle key={pt} cx={x} cy={y} r="3" fill="#FF0000" />;
      })}
      {lastPoint && (
        <text
          x={Number.parseFloat(lastPoint[0]) - 12}
          y={Number.parseFloat(lastPoint[1]) - 6}
          fill="#FF0000"
          fontSize="9"
          fontWeight="bold"
        >
          {recent[recent.length - 1]?.weight}
        </text>
      )}
    </svg>
  );
}

function WeeklyGraph() {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const today = new Date();

  const barData = days.map((_, i) => {
    const d = new Date(today);
    // Calculate offset: today is the last day (index 6)
    d.setDate(today.getDate() - (6 - i));
    const key = `grindmind_tasks_${d.toISOString().split("T")[0]}`;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return { day: days[i], pct: 0 };
      const tasks = JSON.parse(raw) as Record<string, boolean>;
      const count = Object.values(tasks).filter(Boolean).length;
      return { day: days[i], pct: Math.round((count / 5) * 100) };
    } catch {
      return { day: days[i], pct: 0 };
    }
  });

  const maxH = 80;

  return (
    <div
      className="flex items-end justify-around gap-1"
      style={{ height: "100px" }}
    >
      {barData.map(({ day, pct }, i) => {
        const isToday = i === 6;
        const barH = Math.max(4, (pct / 100) * maxH);
        return (
          <div
            key={day}
            className="flex flex-col items-center gap-1"
            style={{ flex: 1 }}
          >
            <span
              className="text-[9px] font-display font-bold"
              style={{ color: pct > 0 ? "#FF0000" : "#444" }}
            >
              {pct > 0 ? `${pct}%` : ""}
            </span>
            <div
              style={{
                height: `${maxH}px`,
                width: "100%",
                backgroundColor: "#1a1a1a",
                borderRadius: "3px",
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${barH}px` }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
                style={{
                  width: "100%",
                  backgroundColor:
                    pct === 100 ? "#FF0000" : pct > 0 ? "#882200" : "#222",
                  borderRadius: "3px",
                  boxShadow: pct === 100 ? "0 0 8px rgba(255,0,0,0.5)" : "none",
                }}
              />
            </div>
            <span
              className="text-[8px] font-display uppercase tracking-wide"
              style={{ color: isToday ? "#FF0000" : "#555" }}
            >
              {day}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function ProgressTab({
  weights,
  strengthLogs,
  addWeight,
  taskProgress,
}: Props) {
  const [weightInput, setWeightInput] = useState("");

  const handleAddWeight = () => {
    const w = Number.parseFloat(weightInput);
    if (Number.isNaN(w) || w <= 0) return;
    addWeight(w);
    setWeightInput("");
  };

  const completedCount = Object.values(
    weights.length > 0 ? { a: true } : {},
  ).length;

  // Recent strength improvements
  const latestByExercise: Record<string, StrengthLog> = {};
  for (const log of strengthLogs) {
    if (
      !latestByExercise[log.exercise] ||
      log.date > latestByExercise[log.exercise].date
    ) {
      latestByExercise[log.exercise] = log;
    }
  }
  const recentStrength = Object.values(latestByExercise).slice(-4);
  void completedCount;

  return (
    <div className="tab-fade pb-4">
      <div className="px-4 pt-4 mb-6">
        <h1 className="text-2xl font-display font-bold uppercase tracking-widest text-white">
          YOUR PROGRESS
        </h1>
        <div
          className="h-0.5 w-16 mt-1"
          style={{ backgroundColor: "#FF0000" }}
        />
      </div>

      {/* Weekly Consistency Graph */}
      <div className="px-4 mb-6">
        <h2
          className="text-xs font-display uppercase tracking-widest mb-3"
          style={{ color: "#888" }}
        >
          WEEKLY CONSISTENCY
        </h2>
        <div className="p-4 rounded-sm glass-card">
          <WeeklyGraph />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-4 mb-6 grid grid-cols-2 gap-3">
        <motion.div
          data-ocid="progress.streak.card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-sm glass-card"
        >
          <p
            className="text-xs font-display uppercase tracking-widest mb-1"
            style={{ color: "#888" }}
          >
            TODAY
          </p>
          <p
            className="text-2xl font-display font-bold"
            style={{ color: taskProgress === 100 ? "#FF0000" : "#fff" }}
          >
            {taskProgress}%
          </p>
          <p className="text-xs" style={{ color: "#666" }}>
            COMPLETION
          </p>
        </motion.div>
        <motion.div
          data-ocid="progress.weight.card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-sm glass-card"
        >
          <p
            className="text-xs font-display uppercase tracking-widest mb-1"
            style={{ color: "#888" }}
          >
            ENTRIES
          </p>
          <p className="text-2xl font-display font-bold text-white">
            {weights.length}
          </p>
          <p className="text-xs" style={{ color: "#666" }}>
            WEIGHT LOGS
          </p>
        </motion.div>
      </div>

      {/* Weight Tracking */}
      <div className="px-4 mb-6">
        <h2
          className="text-xs font-display uppercase tracking-widest mb-3"
          style={{ color: "#888" }}
        >
          WEIGHT TRACKING
        </h2>
        <div className="glass-card rounded-sm p-4">
          <div className="flex gap-2 mb-4">
            <input
              data-ocid="progress.weight.input"
              type="number"
              placeholder="Enter weight (kg)"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddWeight()}
              className="flex-1 px-3 py-2 text-sm rounded-sm text-white"
              style={{ backgroundColor: "#111", border: "1px solid #333" }}
            />
            <button
              type="button"
              data-ocid="progress.weight.save_button"
              onClick={() => {
                haptic();
                handleAddWeight();
              }}
              className="px-4 py-2 text-xs font-display font-bold uppercase rounded-sm btn-red"
            >
              LOG
            </button>
          </div>
          <WeightGraph weights={weights} />
        </div>
      </div>

      {/* Progress Photos placeholder */}
      <div className="px-4 mb-6">
        <h2
          className="text-xs font-display uppercase tracking-widest mb-3"
          style={{ color: "#888" }}
        >
          PROGRESS PHOTOS
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {["BEFORE", "AFTER"].map((label) => (
            <div
              key={label}
              className="rounded-sm flex flex-col items-center justify-center gap-2 glass-card"
              style={{ height: "120px" }}
            >
              <span className="text-2xl">📷</span>
              <span
                className="text-xs font-display font-bold uppercase tracking-wider"
                style={{ color: "#444" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Strength Stats */}
      {recentStrength.length > 0 && (
        <div className="px-4">
          <h2
            className="text-xs font-display uppercase tracking-widest mb-3"
            style={{ color: "#888" }}
          >
            STRENGTH STATS
          </h2>
          <div className="flex flex-col gap-2">
            {recentStrength.map((log, i) => (
              <div
                key={`${log.exercise}-${i}`}
                data-ocid={`progress.strength.item.${i + 1}`}
                className="flex items-center justify-between p-3 rounded-sm glass-card"
              >
                <span className="text-xs font-display font-bold uppercase tracking-wide text-white">
                  {log.exercise}
                </span>
                <span
                  className="text-sm font-display font-bold"
                  style={{ color: "#FF0000" }}
                >
                  {log.weight} kg
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
