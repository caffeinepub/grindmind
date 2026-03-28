import { AnimatePresence, motion } from "motion/react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { StrengthLog } from "../hooks/useGrindMind";
import { haptic } from "../utils/haptic";

type Plan = "Beginner" | "Intermediate" | "Advanced";
type Category = "Push" | "Pull" | "Legs" | "Full Body";

interface Exercise {
  name: string;
  sets: number;
  reps: string;
}

const EXERCISES: Record<Plan, Record<Category, Exercise[]>> = {
  Beginner: {
    Push: [
      { name: "Push-Up", sets: 3, reps: "12" },
      { name: "Dumbbell Press", sets: 3, reps: "10" },
      { name: "Tricep Dips", sets: 3, reps: "10" },
    ],
    Pull: [
      { name: "Assisted Pull-Up", sets: 3, reps: "8" },
      { name: "Dumbbell Row", sets: 3, reps: "10" },
      { name: "Bicep Curl", sets: 3, reps: "12" },
    ],
    Legs: [
      { name: "Bodyweight Squat", sets: 3, reps: "15" },
      { name: "Lunges", sets: 3, reps: "12" },
      { name: "Glute Bridge", sets: 3, reps: "15" },
    ],
    "Full Body": [
      { name: "Burpees", sets: 3, reps: "10" },
      { name: "Mountain Climbers", sets: 3, reps: "20" },
      { name: "Plank", sets: 3, reps: "60s" },
    ],
  },
  Intermediate: {
    Push: [
      { name: "Bench Press", sets: 4, reps: "8" },
      { name: "Overhead Press", sets: 4, reps: "8" },
      { name: "Tricep Pushdown", sets: 4, reps: "12" },
    ],
    Pull: [
      { name: "Pull-Up", sets: 4, reps: "8" },
      { name: "Barbell Row", sets: 4, reps: "8" },
      { name: "Face Pull", sets: 4, reps: "15" },
    ],
    Legs: [
      { name: "Barbell Squat", sets: 4, reps: "8" },
      { name: "Romanian Deadlift", sets: 4, reps: "10" },
      { name: "Leg Press", sets: 4, reps: "12" },
    ],
    "Full Body": [
      { name: "Deadlift", sets: 4, reps: "5" },
      { name: "Clean & Press", sets: 4, reps: "6" },
      { name: "Farmers Carry", sets: 4, reps: "40m" },
    ],
  },
  Advanced: {
    Push: [
      { name: "Competition Bench", sets: 5, reps: "5" },
      { name: "Weighted Dips", sets: 5, reps: "8" },
      { name: "Arnold Press", sets: 4, reps: "10" },
    ],
    Pull: [
      { name: "Weighted Pull-Up", sets: 5, reps: "6" },
      { name: "Pendlay Row", sets: 5, reps: "5" },
      { name: "Kroc Row", sets: 3, reps: "20" },
    ],
    Legs: [
      { name: "Front Squat", sets: 5, reps: "5" },
      { name: "Bulgarian Split Squat", sets: 4, reps: "8" },
      { name: "Nordic Curl", sets: 3, reps: "8" },
    ],
    "Full Body": [
      { name: "Snatch", sets: 5, reps: "3" },
      { name: "Thruster", sets: 4, reps: "6" },
      { name: "Devil Press", sets: 3, reps: "12" },
    ],
  },
};

// Rest Timer — isolated component with stable onDismiss via ref
function RestTimerPill({ onDismiss }: { onDismiss: () => void }) {
  const [secs, setSecs] = useState(60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          onDismissRef.current();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const m = Math.floor(secs / 60);
  const s = secs % 60;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer"
      style={{ backgroundColor: "#1a0000", border: "1px solid #FF0000" }}
      onClick={() => {
        haptic();
        onDismiss();
      }}
    >
      <span
        className="text-xs font-display font-bold tracking-wide"
        style={{ color: "#FF0000" }}
      >
        REST: {m}:{s.toString().padStart(2, "0")}
      </span>
      <span className="text-xs" style={{ color: "#888" }}>
        ✕
      </span>
    </motion.div>
  );
}

interface ExerciseCardProps {
  ex: Exercise;
  index: number;
  logInput: string;
  logOpen: boolean;
  onLogToggle: () => void;
  onLogChange: (val: string) => void;
  onLogSave: () => void;
  setChecks: boolean[];
  onSetCheck: (setIdx: number) => void;
  restTimer: { exerciseName: string; setIdx: number } | null;
  onDismissRest: () => void;
}

const ExerciseCard = memo(function ExerciseCard({
  ex,
  index,
  logInput,
  logOpen,
  onLogToggle,
  onLogChange,
  onLogSave,
  setChecks,
  onSetCheck,
  restTimer,
  onDismissRest,
}: ExerciseCardProps) {
  return (
    <motion.div
      data-ocid={`workout.exercise.item.${index + 1}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-sm overflow-hidden glass-card"
    >
      {/* Image Placeholder */}
      <div
        className="w-full flex items-center justify-center py-6"
        style={{
          backgroundColor: "rgba(255,255,255,0.02)",
          aspectRatio: "16/7",
        }}
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl">🏋️</span>
          <span
            className="text-xs uppercase tracking-wider"
            style={{ color: "#444" }}
          >
            {ex.name}
          </span>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-display font-bold uppercase text-sm tracking-wide text-white">
              {ex.name}
            </h3>
            <p className="text-xs" style={{ color: "#FF0000" }}>
              {ex.sets} × {ex.reps} reps
            </p>
          </div>
          <button
            type="button"
            data-ocid={`workout.log.${index + 1}.button`}
            onClick={() => {
              haptic();
              onLogToggle();
            }}
            className="px-3 py-1.5 text-xs font-display font-bold uppercase tracking-wide rounded-sm transition-all"
            style={{
              backgroundColor: "#1a1a1a",
              color: "#FF0000",
              border: "1px solid #FF0000",
            }}
          >
            LOG WEIGHT
          </button>
        </div>

        {/* Set Checkboxes */}
        <div className="flex flex-wrap gap-2 mb-3">
          {Array.from({ length: ex.sets }).map((_, si) => (
            <button
              type="button"
              key={`set-${si + 1}`}
              data-ocid={`workout.set.${index + 1}.checkbox.${si + 1}`}
              onClick={() => onSetCheck(si)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-display font-bold uppercase tracking-wide transition-all"
              style={{
                backgroundColor: setChecks[si]
                  ? "rgba(255,0,0,0.15)"
                  : "rgba(255,255,255,0.04)",
                border: setChecks[si] ? "1px solid #FF0000" : "1px solid #333",
                color: setChecks[si] ? "#FF0000" : "#666",
              }}
            >
              <span
                className="w-4 h-4 rounded-sm flex items-center justify-center"
                style={{
                  backgroundColor: setChecks[si] ? "#FF0000" : "transparent",
                  border: setChecks[si] ? "none" : "1px solid #444",
                }}
              >
                {setChecks[si] && (
                  <span className="text-white" style={{ fontSize: "10px" }}>
                    ✓
                  </span>
                )}
              </span>
              SET {si + 1}
            </button>
          ))}
        </div>

        {/* Rest Timer for this exercise */}
        <AnimatePresence>
          {restTimer && restTimer.exerciseName === ex.name && (
            <div className="mb-2">
              <RestTimerPill onDismiss={onDismissRest} />
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {logOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex gap-2 overflow-hidden"
            >
              <input
                data-ocid={`workout.weight.${index + 1}.input`}
                type="number"
                placeholder="kg/lbs"
                value={logInput}
                onChange={(e) => onLogChange(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-sm text-white"
                style={{ backgroundColor: "#222", border: "1px solid #444" }}
              />
              <button
                type="button"
                data-ocid={`workout.weight.${index + 1}.save_button`}
                onClick={onLogSave}
                className="px-4 py-2 text-xs font-display font-bold uppercase rounded-sm"
                style={{ backgroundColor: "#FF0000", color: "#fff" }}
              >
                SAVE
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

interface Props {
  strengthLogs: StrengthLog[];
  addStrengthLog: (log: Omit<StrengthLog, "date">) => void;
  onSessionComplete: () => void;
}

export default function WorkoutTab({
  strengthLogs,
  addStrengthLog,
  onSessionComplete,
}: Props) {
  const [plan, setPlan] = useState<Plan>("Beginner");
  const [category, setCategory] = useState<Category>("Push");
  const [logInputs, setLogInputs] = useState<Record<string, string>>({});
  const [logOpen, setLogOpen] = useState<string | null>(null);
  const [sessionDone, setSessionDone] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [setChecks, setSetChecks] = useState<Record<string, boolean[]>>({});
  const [restTimer, setRestTimer] = useState<{
    exerciseName: string;
    setIdx: number;
  } | null>(null);

  const exercises = EXERCISES[plan][category];
  const plans: Plan[] = ["Beginner", "Intermediate", "Advanced"];
  const categories: Category[] = ["Push", "Pull", "Legs", "Full Body"];

  const handleLogWeight = useCallback(
    (exercise: string) => {
      const val = logInputs[exercise];
      if (!val || Number.isNaN(Number.parseFloat(val))) return;
      const ex = exercises.find((e) => e.name === exercise);
      if (!ex) return;
      addStrengthLog({
        exercise,
        weight: Number.parseFloat(val),
        sets: ex.sets,
        reps: ex.reps,
      });
      setLogInputs((prev) => ({ ...prev, [exercise]: "" }));
      setLogOpen(null);
    },
    [logInputs, exercises, addStrengthLog],
  );

  const handleSetCheck = useCallback((exerciseName: string, setIdx: number) => {
    setSetChecks((prev) => {
      const current = prev[exerciseName] ?? Array(10).fill(false);
      const updated = [...current];
      updated[setIdx] = !updated[setIdx];
      if (updated[setIdx]) {
        setRestTimer({ exerciseName, setIdx });
      }
      return { ...prev, [exerciseName]: updated };
    });
  }, []);

  const handleSessionComplete = () => {
    setShowCelebration(true);
    onSessionComplete();
    setSessionDone(true);
    setTimeout(() => setShowCelebration(false), 2500);
  };

  return (
    <div className="tab-fade pb-4">
      <div className="px-4 pt-4 mb-4">
        <h1 className="text-2xl font-display font-bold uppercase tracking-widest text-white">
          FORGE YOUR BODY
        </h1>
        <div
          className="h-0.5 w-16 mt-1"
          style={{ backgroundColor: "#FF0000" }}
        />
      </div>

      {/* Plan selector */}
      <div className="px-4 mb-4">
        <div
          className="flex rounded-sm overflow-hidden"
          style={{ border: "1px solid #333" }}
        >
          {plans.map((p) => (
            <button
              type="button"
              key={p}
              data-ocid={`workout.plan.${p.toLowerCase()}.tab`}
              onClick={() => setPlan(p)}
              className="flex-1 py-2 text-xs font-display font-bold uppercase tracking-wider transition-all"
              style={{
                backgroundColor: plan === p ? "#FF0000" : "#111",
                color: "#fff",
                borderBottom: plan === p ? "2px solid #FF0000" : "none",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="px-4 mb-4 flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            type="button"
            key={cat}
            data-ocid={`workout.category.${cat.replace(" ", "_").toLowerCase()}.toggle`}
            onClick={() => setCategory(cat)}
            className="px-3 py-1 rounded-full text-xs font-display font-bold uppercase tracking-wide transition-all"
            style={{
              backgroundColor: category === cat ? "#FF0000" : "#1a1a1a",
              color: "#fff",
              border: category === cat ? "1px solid #FF0000" : "1px solid #333",
              boxShadow:
                category === cat ? "0 0 10px rgba(255,0,0,0.3)" : "none",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Exercise Cards */}
      <div className="px-4 flex flex-col gap-3 mb-4">
        {exercises.map((ex, i) => (
          <ExerciseCard
            key={`${ex.name}-${plan}-${category}`}
            ex={ex}
            index={i}
            logInput={logInputs[ex.name] || ""}
            logOpen={logOpen === ex.name}
            onLogToggle={() => setLogOpen(logOpen === ex.name ? null : ex.name)}
            onLogChange={(val) =>
              setLogInputs((prev) => ({ ...prev, [ex.name]: val }))
            }
            onLogSave={() => handleLogWeight(ex.name)}
            setChecks={setChecks[ex.name] ?? Array(ex.sets).fill(false)}
            onSetCheck={(si) => handleSetCheck(ex.name, si)}
            restTimer={restTimer}
            onDismissRest={() => setRestTimer(null)}
          />
        ))}
      </div>

      {/* Mark Session Complete */}
      <div className="px-4 mb-6">
        <button
          type="button"
          data-ocid="workout.session.complete_button"
          onClick={() => {
            haptic(50);
            handleSessionComplete();
          }}
          className="w-full py-4 rounded-sm font-display font-bold uppercase tracking-widest text-sm transition-all"
          style={{
            backgroundColor: sessionDone ? "#1a1a1a" : "#FF0000",
            color: sessionDone ? "#FF0000" : "#fff",
            border: sessionDone ? "2px solid #FF0000" : "none",
            boxShadow: sessionDone ? "none" : "0 0 20px rgba(255,0,0,0.4)",
          }}
        >
          {sessionDone ? "SESSION COMPLETE ✓" : "MARK SESSION COMPLETE ✓"}
        </button>
      </div>

      {/* Strength Log */}
      {strengthLogs.length > 0 && (
        <div className="px-4">
          <h2
            className="text-xs font-display uppercase tracking-widest mb-3"
            style={{ color: "#888" }}
          >
            RECENT LOGS
          </h2>
          <div className="flex flex-col gap-2">
            {strengthLogs
              .slice(-8)
              .reverse()
              .map((log, i) => (
                <div
                  key={`${log.date}-${log.exercise}-${i}`}
                  data-ocid={`workout.log.item.${i + 1}`}
                  className="flex items-center justify-between p-3 rounded-sm glass-card"
                >
                  <div>
                    <p className="text-xs font-bold text-white uppercase">
                      {log.exercise}
                    </p>
                    <p className="text-xs" style={{ color: "#888" }}>
                      {log.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-sm font-display font-bold"
                      style={{ color: "#FF0000" }}
                    >
                      {log.weight} kg
                    </p>
                    <p className="text-xs" style={{ color: "#888" }}>
                      {log.sets}×{log.reps}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            data-ocid="workout.celebration.modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
            style={{
              backgroundColor: "#000",
              maxWidth: "480px",
              margin: "0 auto",
            }}
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="particle p1" />
              <div className="particle p2" />
              <div className="particle p3" />
              <div className="particle p4" />
              <div className="particle p5" />
              <div className="particle p6" />
            </div>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
              className="flex flex-col items-center gap-4 z-10"
            >
              <span className="text-7xl">💪</span>
              <p
                className="text-3xl font-display font-bold uppercase tracking-widest text-center"
                style={{
                  color: "#FF0000",
                  textShadow: "0 0 30px rgba(255,0,0,0.8)",
                }}
              >
                SESSION
              </p>
              <p className="text-3xl font-display font-bold uppercase tracking-widest text-white">
                COMPLETE
              </p>
              <p
                className="text-sm font-display uppercase tracking-widest"
                style={{ color: "#888" }}
              >
                YOU EARNED IT
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
