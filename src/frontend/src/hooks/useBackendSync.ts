import { useCallback } from "react";
import type { Stats, Task, UserData } from "../backend.d";
import { useActor } from "./useActor";
import type {
  DailyTasks,
  JournalEntry,
  StrengthLog,
  WeightEntry,
} from "./useGrindMind";
import { useInternetIdentity } from "./useInternetIdentity";

export interface GrindMindData {
  tasks: DailyTasks;
  journal: JournalEntry[];
  weights: WeightEntry[];
  strengthLogs: StrengthLog[];
  achievements: string[];
  xp: number;
  streak: number;
  noExcuseMode: boolean;
  soundEnabled: boolean;
  lastCompletedDate: string;
  userName: string;
  userWeight: string;
  userGoal: string;
  userEmail: string;
}

function toBackendUserData(data: GrindMindData): UserData {
  const todayKey = new Date().toISOString().split("T")[0];
  const task: Task = {
    date: todayKey,
    workout: data.tasks.workout,
    water: data.tasks.water,
    meditation: data.tasks.meditation,
    diet: data.tasks.diet,
    sleep: data.tasks.sleep,
  };

  const stats: Stats = {
    xp: BigInt(Math.round(data.xp)),
    streak: BigInt(Math.round(data.streak)),
    lastCompletedDate: data.lastCompletedDate,
    noExcuseMode: data.noExcuseMode,
    soundEnabled: data.soundEnabled,
  };

  return {
    tasks: [task],
    journalEntries: data.journal,
    weightEntries: data.weights,
    stats,
    achievements: data.achievements,
    strengthLogs: data.strengthLogs.map((sl) => ({
      ...sl,
      sets: BigInt(Math.round(sl.sets)),
    })),
    profile: {
      name: data.userName,
      weight: data.userWeight,
      goal: data.userGoal,
    },
  };
}

export function fromBackendUserData(ud: UserData): Partial<GrindMindData> {
  const todayKey = new Date().toISOString().split("T")[0];
  const todayTask = ud.tasks.find((t) => t.date === todayKey);

  const tasks: DailyTasks = todayTask
    ? {
        workout: todayTask.workout,
        water: todayTask.water,
        meditation: todayTask.meditation,
        diet: todayTask.diet,
        sleep: todayTask.sleep,
      }
    : {
        workout: false,
        water: false,
        meditation: false,
        diet: false,
        sleep: false,
      };

  return {
    tasks,
    journal: ud.journalEntries,
    weights: ud.weightEntries,
    strengthLogs: ud.strengthLogs.map((sl) => ({
      ...sl,
      sets: Number(sl.sets),
    })),
    achievements: ud.achievements,
    xp: Number(ud.stats.xp),
    streak: Number(ud.stats.streak),
    noExcuseMode: ud.stats.noExcuseMode,
    soundEnabled: ud.stats.soundEnabled,
    lastCompletedDate: ud.stats.lastCompletedDate,
    userName: ud.profile.name,
    userWeight: ud.profile.weight,
    userGoal: ud.profile.goal,
  };
}

export function useBackendSync() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  const hasPrincipal = !!identity && !identity.getPrincipal().isAnonymous();

  const loadFromBackend =
    useCallback(async (): Promise<Partial<GrindMindData> | null> => {
      if (!actor || !hasPrincipal) return null;
      try {
        const [ud, userRecord, progressRecord] = await Promise.all([
          actor.getUserData(),
          actor.getUser(),
          actor.getProgress(),
        ]);

        const base: Partial<GrindMindData> = ud ? fromBackendUserData(ud) : {};

        // Merge separate collections — they take precedence for their fields
        if (userRecord) {
          base.userName = userRecord.name || base.userName;
          base.userEmail = userRecord.email;
        }
        if (progressRecord) {
          base.streak = Number(progressRecord.streak);
          // tasksCompleted from the progress collection is informational
        }

        return Object.keys(base).length > 0 ? base : null;
      } catch {
        return null;
      }
    }, [actor, hasPrincipal]);

  const syncToBackend = useCallback(
    (data: GrindMindData): void => {
      if (!actor || !hasPrincipal) return;
      const ud = toBackendUserData(data);
      actor.saveUserData(ud).catch(() => {});
    },
    [actor, hasPrincipal],
  );

  // Separate collection: save user profile
  const syncUserCollection = useCallback(
    (name: string, email: string): void => {
      if (!actor || !hasPrincipal) return;
      actor.saveUser(name, email).catch(() => {});
    },
    [actor, hasPrincipal],
  );

  // Separate collection: save progress
  const syncProgressCollection = useCallback(
    (tasksCompleted: number, streak: number, date: string): void => {
      if (!actor || !hasPrincipal) return;
      actor
        .saveProgress(BigInt(tasksCompleted), BigInt(streak), date)
        .catch(() => {});
    },
    [actor, hasPrincipal],
  );

  // Separate collection: add journal entry
  const addBackendJournalEntry = useCallback(
    (id: string, date: string, content: string): void => {
      if (!actor || !hasPrincipal) return;
      actor.addJournalEntry(id, date, content).catch(() => {});
    },
    [actor, hasPrincipal],
  );

  // Separate collection: delete journal entry
  const deleteBackendJournalEntry = useCallback(
    (id: string): void => {
      if (!actor || !hasPrincipal) return;
      actor.deleteJournalEntry(id).catch(() => {});
    },
    [actor, hasPrincipal],
  );

  return {
    loadFromBackend,
    syncToBackend,
    syncUserCollection,
    syncProgressCollection,
    addBackendJournalEntry,
    deleteBackendJournalEntry,
    hasPrincipal,
  };
}
