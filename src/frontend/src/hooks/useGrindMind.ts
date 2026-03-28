import { useCallback, useEffect, useRef, useState } from "react";
import { useBackendSync } from "./useBackendSync";

export type Identity = "Beginner" | "Warrior" | "Alpha";

export interface DailyTasks {
  workout: boolean;
  water: boolean;
  meditation: boolean;
  diet: boolean;
  sleep: boolean;
}

export interface JournalEntry {
  date: string;
  conquered: string;
  dominate: string;
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface StrengthLog {
  date: string;
  exercise: string;
  weight: number;
  sets: number;
  reps: string;
}

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "7day_streak",
    name: "7-Day Streak",
    icon: "🔥",
    description: "Complete all tasks 7 days in a row",
  },
  {
    id: "first_workout",
    name: "First Workout",
    icon: "💪",
    description: "Complete your first workout",
  },
  {
    id: "mind_master",
    name: "Mind Master",
    icon: "🧘",
    description: "Complete 10 meditation sessions",
  },
  {
    id: "no_excuse_week",
    name: "No Excuse Week",
    icon: "🛡️",
    description: "7 days with No Excuse Mode on",
  },
  {
    id: "speed_demon",
    name: "Speed Demon",
    icon: "⚡",
    description: "Complete all tasks before noon",
  },
  {
    id: "legend_status",
    name: "Legend Status",
    icon: "🏆",
    description: "Reach Level 100",
  },
  {
    id: "iron_will",
    name: "Iron Will",
    icon: "💀",
    description: "Complete a 30-day streak",
  },
  {
    id: "precision",
    name: "Precision",
    icon: "🎯",
    description: "Log workouts 20 times",
  },
];

function todayKey(): string {
  return new Date().toISOString().split("T")[0];
}

function getLS<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    if (val === null) return fallback;
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

function setLS(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function getLevelTitle(level: number): string {
  if (level >= 100) return "Legend";
  if (level >= 50) return "Alpha";
  if (level >= 10) return "Warrior";
  return "Beginner";
}

function xpToLevel(xp: number): number {
  return Math.min(100, Math.floor(xp / 500) + 1);
}

function xpForNextLevel(level: number): number {
  return level * 500;
}

export function useGrindMind() {
  const {
    loadFromBackend,
    syncToBackend,
    syncUserCollection,
    syncProgressCollection,
    addBackendJournalEntry,
    deleteBackendJournalEntry,
    hasPrincipal,
  } = useBackendSync();

  const [identity, setIdentityState] = useState<Identity | null>(() =>
    getLS<Identity | null>("grindmind_identity", null),
  );
  const [tasks, setTasksState] = useState<DailyTasks>(() =>
    getLS<DailyTasks>(`grindmind_tasks_${todayKey()}`, {
      workout: false,
      water: false,
      meditation: false,
      diet: false,
      sleep: false,
    }),
  );
  const [streak, setStreakState] = useState<number>(() =>
    getLS<number>("grindmind_streak", 0),
  );
  const [xp, setXpState] = useState<number>(() =>
    getLS<number>("grindmind_xp", 0),
  );
  const [noExcuseMode, setNoExcuseModeState] = useState<boolean>(() =>
    getLS<boolean>("grindmind_noexcuse", false),
  );
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(
    () => getLS<string[]>("grindmind_achievements", []),
  );
  const [weights, setWeightsState] = useState<WeightEntry[]>(() =>
    getLS<WeightEntry[]>("grindmind_weights", []),
  );
  const [strengthLogs, setStrengthLogsState] = useState<StrengthLog[]>(() =>
    getLS<StrengthLog[]>("grindmind_strength_logs", []),
  );
  const [journal, setJournalState] = useState<JournalEntry[]>(() =>
    getLS<JournalEntry[]>("grindmind_journal", []),
  );

  // Profile
  const [userName, setUserNameState] = useState<string>(() => {
    try {
      const u = JSON.parse(localStorage.getItem("grindmind_user") || "null");
      return u?.name || "";
    } catch {
      return "";
    }
  });
  const [userEmail, setUserEmailState] = useState<string>(() =>
    getLS<string>("grindmind_email", ""),
  );
  const [userWeight, setUserWeightState] = useState<string>(() => {
    try {
      const p = JSON.parse(localStorage.getItem("grindmind_profile") || "null");
      return p?.weight || "";
    } catch {
      return "";
    }
  });
  const [userGoal, setUserGoalState] = useState<string>(() => {
    try {
      const p = JSON.parse(localStorage.getItem("grindmind_profile") || "null");
      return p?.goal || "";
    } catch {
      return "";
    }
  });
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() =>
    getLS<boolean>("grindmind_sound", true),
  );

  // Refs for building snapshot for syncToBackend without stale closures
  const stateRef = useRef({
    tasks,
    journal,
    weights,
    strengthLogs,
    achievements: unlockedAchievements,
    xp,
    streak,
    noExcuseMode,
    soundEnabled,
    lastCompletedDate: getLS<string>("grindmind_last_completed_date", ""),
    userName,
    userWeight,
    userGoal,
    userEmail,
  });

  // Keep ref in sync
  useEffect(() => {
    stateRef.current = {
      tasks,
      journal,
      weights,
      strengthLogs,
      achievements: unlockedAchievements,
      xp,
      streak,
      noExcuseMode,
      soundEnabled,
      lastCompletedDate: getLS<string>("grindmind_last_completed_date", ""),
      userName,
      userWeight,
      userGoal,
      userEmail,
    };
  });

  // Load from backend on mount when principal becomes available
  const backendLoadedRef = useRef(false);
  useEffect(() => {
    if (!hasPrincipal || backendLoadedRef.current) return;
    backendLoadedRef.current = true;
    loadFromBackend()
      .then((data) => {
        if (!data) return;
        if (data.tasks) {
          setTasksState(data.tasks);
          setLS(`grindmind_tasks_${todayKey()}`, data.tasks);
        }
        if (data.journal !== undefined) {
          setJournalState(data.journal);
          setLS("grindmind_journal", data.journal);
        }
        if (data.weights !== undefined) {
          setWeightsState(data.weights);
          setLS("grindmind_weights", data.weights);
        }
        if (data.strengthLogs !== undefined) {
          setStrengthLogsState(data.strengthLogs);
          setLS("grindmind_strength_logs", data.strengthLogs);
        }
        if (data.achievements !== undefined) {
          setUnlockedAchievements(data.achievements);
          setLS("grindmind_achievements", data.achievements);
        }
        if (data.xp !== undefined) {
          setXpState(data.xp);
          setLS("grindmind_xp", data.xp);
        }
        if (data.streak !== undefined) {
          setStreakState(data.streak);
          setLS("grindmind_streak", data.streak);
        }
        if (data.noExcuseMode !== undefined) {
          setNoExcuseModeState(data.noExcuseMode);
          setLS("grindmind_noexcuse", data.noExcuseMode);
        }
        if (data.soundEnabled !== undefined) {
          setSoundEnabledState(data.soundEnabled);
          setLS("grindmind_sound", data.soundEnabled);
        }
        if (data.lastCompletedDate !== undefined) {
          setLS("grindmind_last_completed_date", data.lastCompletedDate);
        }
        if (data.userName) {
          setUserNameState(data.userName);
          try {
            const u = JSON.parse(
              localStorage.getItem("grindmind_user") || "null",
            );
            if (u) {
              localStorage.setItem(
                "grindmind_user",
                JSON.stringify({ ...u, name: data.userName }),
              );
            }
          } catch {}
        }
        if (data.userEmail !== undefined) {
          setUserEmailState(data.userEmail);
          setLS("grindmind_email", data.userEmail);
        }
        if (data.userWeight !== undefined) {
          setUserWeightState(data.userWeight);
        }
        if (data.userGoal !== undefined) {
          setUserGoalState(data.userGoal);
          setLS("grindmind_profile", {
            weight: data.userWeight ?? "",
            goal: data.userGoal,
          });
        }
      })
      .catch(() => {});
  }, [hasPrincipal, loadFromBackend]);

  // Helper to fire sync after state updates settle
  const fireSync = useCallback(
    (overrides?: Partial<typeof stateRef.current>) => {
      setTimeout(() => {
        const s = { ...stateRef.current, ...overrides };
        syncToBackend(s);
      }, 0);
    },
    [syncToBackend],
  );

  const level = xpToLevel(xp);
  const levelTitle = getLevelTitle(level);
  const nextLevelXp = xpForNextLevel(level);
  const prevLevelXp = xpForNextLevel(level - 1);
  const xpInLevel = xp - prevLevelXp;
  const xpForLevel = nextLevelXp - prevLevelXp;
  const xpProgress = Math.min(100, (xpInLevel / xpForLevel) * 100);

  const taskCount = Object.values(tasks).filter(Boolean).length;
  const taskProgress = Math.round((taskCount / 5) * 100);
  const allTasksDone = taskCount === 5;

  const setIdentity = useCallback((id: Identity) => {
    setIdentityState(id);
    setLS("grindmind_identity", id);
  }, []);

  const unlockAchievement = useCallback((id: string) => {
    setUnlockedAchievements((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      setLS("grindmind_achievements", next);
      return next;
    });
  }, []);

  const toggleTask = useCallback(
    (task: keyof DailyTasks) => {
      setTasksState((prev) => {
        const wasChecked = prev[task];
        const next = { ...prev, [task]: !wasChecked };
        setLS(`grindmind_tasks_${todayKey()}`, next);

        if (!wasChecked) {
          setXpState((prevXp) => {
            let gained = 20;
            const newCount = Object.values(next).filter(Boolean).length;
            if (newCount === 5) gained += 50;
            const newXp = prevXp + gained;
            setLS("grindmind_xp", newXp);
            return newXp;
          });

          if (Object.values(next).filter(Boolean).length === 5) {
            const lastDate = getLS<string | null>(
              "grindmind_last_completed_date",
              null,
            );
            const today = todayKey();
            if (lastDate !== today) {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayKey = yesterday.toISOString().split("T")[0];
              let newStreak = 1;
              if (lastDate === yesterdayKey) {
                setStreakState((s) => {
                  newStreak = s + 1;
                  setLS("grindmind_streak", newStreak);
                  // Sync streak and task count to progress collection
                  setTimeout(() => {
                    syncProgressCollection(
                      Object.values(next).filter(Boolean).length,
                      newStreak,
                      today,
                    );
                  }, 100);
                  return newStreak;
                });
              } else {
                setStreakState(1);
                setLS("grindmind_streak", 1);
                syncProgressCollection(
                  Object.values(next).filter(Boolean).length,
                  1,
                  today,
                );
              }
              setLS("grindmind_last_completed_date", today);
            }
          } else {
            // Save progress incrementally
            const newCount = Object.values(next).filter(Boolean).length;
            const currentStreak = stateRef.current.streak;
            syncProgressCollection(newCount, currentStreak, todayKey());
          }

          if (task === "workout") unlockAchievement("first_workout");
        } else {
          setXpState((prevXp) => {
            const newXp = Math.max(0, prevXp - 20);
            setLS("grindmind_xp", newXp);
            return newXp;
          });
        }

        return next;
      });
      fireSync();
    },
    [unlockAchievement, fireSync, syncProgressCollection],
  );

  useEffect(() => {
    if (streak >= 7) unlockAchievement("7day_streak");
    if (streak >= 30) unlockAchievement("iron_will");
  }, [streak, unlockAchievement]);

  useEffect(() => {
    if (level >= 100) unlockAchievement("legend_status");
  }, [level, unlockAchievement]);

  const setNoExcuseMode = useCallback(
    (val: boolean) => {
      setNoExcuseModeState(val);
      setLS("grindmind_noexcuse", val);
      fireSync({ noExcuseMode: val });
    },
    [fireSync],
  );

  const addWeight = useCallback(
    (weight: number) => {
      setWeightsState((prev) => {
        const entry: WeightEntry = { date: todayKey(), weight };
        const next = [...prev, entry].slice(-30);
        setLS("grindmind_weights", next);
        fireSync({ weights: next });
        return next;
      });
    },
    [fireSync],
  );

  const addStrengthLog = useCallback(
    (log: Omit<StrengthLog, "date">) => {
      setStrengthLogsState((prev) => {
        const entry: StrengthLog = { ...log, date: todayKey() };
        const next = [...prev, entry].slice(-50);
        setLS("grindmind_strength_logs", next);
        fireSync({ strengthLogs: next });
        return next;
      });
      unlockAchievement("first_workout");
    },
    [unlockAchievement, fireSync],
  );

  const saveJournal = useCallback(
    (conquered: string, dominate: string) => {
      const id = `journal_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const date = todayKey();
      const content = conquered
        ? `CONQUERED: ${conquered}${dominate ? ` | TOMORROW: ${dominate}` : ""}`
        : dominate
          ? `TOMORROW: ${dominate}`
          : "";

      // Sync to separate journal collection
      addBackendJournalEntry(id, date, content);

      setJournalState((prev) => {
        const entry: JournalEntry = { date, conquered, dominate };
        const next = [entry, ...prev].slice(-30);
        setLS("grindmind_journal", next);
        fireSync({ journal: next });
        return next;
      });
    },
    [fireSync, addBackendJournalEntry],
  );

  const resetIdentity = useCallback(() => {
    setIdentityState(null);
    localStorage.removeItem("grindmind_identity");
  }, []);

  const updateProfile = useCallback(
    (weight: string, goal: string, name: string, email = "") => {
      const profile = { weight, goal };
      setLS("grindmind_profile", profile);
      setUserWeightState(weight);
      setUserGoalState(goal);
      setUserNameState(name);
      setUserEmailState(email);
      setLS("grindmind_email", email);
      try {
        const u = JSON.parse(localStorage.getItem("grindmind_user") || "null");
        if (u) {
          localStorage.setItem(
            "grindmind_user",
            JSON.stringify({ ...u, name }),
          );
        }
      } catch {}
      // Sync to both monolithic and separate user collection
      syncUserCollection(name, email);
      fireSync({
        userName: name,
        userWeight: weight,
        userGoal: goal,
        userEmail: email,
      });
    },
    [fireSync, syncUserCollection],
  );

  const setSoundEnabled = useCallback(
    (val: boolean) => {
      setSoundEnabledState(val);
      setLS("grindmind_sound", val);
      fireSync({ soundEnabled: val });
    },
    [fireSync],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("grindmind_user");
    setUserNameState("");
  }, []);

  return {
    identity,
    setIdentity,
    resetIdentity,
    tasks,
    toggleTask,
    taskProgress,
    allTasksDone,
    taskCount,
    streak,
    xp,
    level,
    levelTitle,
    xpProgress,
    xpInLevel,
    xpForLevel,
    noExcuseMode,
    setNoExcuseMode,
    unlockedAchievements,
    ALL_ACHIEVEMENTS,
    weights,
    addWeight,
    strengthLogs,
    addStrengthLog,
    journal,
    saveJournal,
    deleteBackendJournalEntry,
    // Profile
    userName,
    userEmail,
    userWeight,
    userGoal,
    soundEnabled,
    updateProfile,
    setSoundEnabled,
    logout,
  };
}
