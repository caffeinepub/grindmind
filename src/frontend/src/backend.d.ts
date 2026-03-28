import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface JournalEntry {
    conquered: string;
    date: string;
    dominate: string;
}
export interface StrengthLog {
    weight: number;
    date: string;
    reps: string;
    sets: bigint;
    exercise: string;
}
export interface Task {
    meditation: boolean;
    date: string;
    diet: boolean;
    sleep: boolean;
    workout: boolean;
    water: boolean;
}
export interface Stats {
    xp: bigint;
    streak: bigint;
    lastCompletedDate: string;
    noExcuseMode: boolean;
    soundEnabled: boolean;
}
export interface Profile {
    weight: string;
    goal: string;
    name: string;
}
export interface UserData {
    tasks: Array<Task>;
    journalEntries: Array<JournalEntry>;
    weightEntries: Array<WeightEntry>;
    stats: Stats;
    achievements: Array<string>;
    strengthLogs: Array<StrengthLog>;
    profile: Profile;
}
export interface UserProfile {
    weight: string;
    goal: string;
    name: string;
}
export interface WeightEntry {
    weight: number;
    date: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addJournalEntry(id: string, date: string, content: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteAllData(): Promise<void>;
    deleteJournalEntry(id: string): Promise<void>;
    deleteUserData(): Promise<void>;
    getAllUsers(): Promise<Array<UserData>>;
    getAllUsersAdmin(): Promise<Array<{
        streak: bigint;
        principal: string;
        name: string;
        journalCount: bigint;
        tasksCompleted: bigint;
        email: string;
    }>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrentTime(): Promise<bigint>;
    getJournalEntries(): Promise<Array<{
        id: string;
        content: string;
        date: string;
    }>>;
    getProgress(): Promise<{
        streak: bigint;
        lastUpdated: string;
        tasksCompleted: bigint;
    } | null>;
    getUser(): Promise<{
        name: string;
        email: string;
    } | null>;
    getUserData(): Promise<UserData | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveProgress(tasksCompleted: bigint, streak: bigint, lastUpdated: string): Promise<void>;
    saveUser(name: string, email: string): Promise<void>;
    saveUserData(userData: UserData): Promise<void>;
    searchUserByName(name: string): Promise<UserData | null>;
    updateUserStreak(streak: bigint): Promise<void>;
}
