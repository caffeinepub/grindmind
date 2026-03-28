import { Switch } from "@/components/ui/switch";
import { motion } from "motion/react";
import { useState } from "react";
import type { Achievement, Identity } from "../hooks/useGrindMind";
import { haptic } from "../utils/haptic";

interface Props {
  identity: Identity;
  level: number;
  levelTitle: string;
  xp: number;
  xpProgress: number;
  xpInLevel: number;
  xpForLevel: number;
  streak: number;
  noExcuseMode: boolean;
  setNoExcuseMode: (val: boolean) => void;
  unlockedAchievements: string[];
  allAchievements: Achievement[];
  onResetIdentity: () => void;
  userName: string;
  userEmail: string;
  userWeight: string;
  userGoal: string;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  onUpdateProfile: (
    weight: string,
    goal: string,
    name: string,
    email: string,
  ) => void;
  onLogout: () => void;
}

export default function ProfileTab({
  identity,
  level,
  levelTitle,
  xp,
  xpProgress,
  xpInLevel,
  xpForLevel,
  streak,
  noExcuseMode,
  setNoExcuseMode,
  unlockedAchievements,
  allAchievements,
  onResetIdentity,
  userName,
  userEmail,
  userWeight,
  userGoal,
  soundEnabled,
  setSoundEnabled,
  onUpdateProfile,
  onLogout,
}: Props) {
  const identityColors: Record<Identity, string> = {
    Beginner: "#FF6666",
    Warrior: "#FF4444",
    Alpha: "#FF0000",
  };

  const color = identityColors[identity];

  const [profileName, setProfileName] = useState(userName);
  const [profileEmail, setProfileEmail] = useState(userEmail);
  const [profileWeight, setProfileWeight] = useState(userWeight);
  const [profileGoal, setProfileGoal] = useState(userGoal);
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [profileSaved, setProfileSaved] = useState(false);

  const handleSaveProfile = () => {
    haptic(50);
    onUpdateProfile(profileWeight, profileGoal, profileName, profileEmail);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: "#111",
    border: "1px solid #333",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: "4px",
    fontSize: "14px",
    outline: "none",
    flex: 1,
  };

  const labelStyle: React.CSSProperties = {
    color: "#888",
    display: "block",
    marginBottom: "8px",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    fontWeight: "bold",
  };

  return (
    <div className="tab-fade pb-4">
      {/* Identity Header */}
      <div
        className="px-4 pt-6 pb-8 text-center relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #1a0000 0%, #000 100%)" }}
      >
        <div
          className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl"
          style={{
            backgroundColor: "#1a1a1a",
            border: `3px solid ${color}`,
            boxShadow: `0 0 20px ${color}40`,
          }}
        >
          {identity === "Alpha"
            ? "\uD83D\uDC80"
            : identity === "Warrior"
              ? "\u2694\uFE0F"
              : "\uD83C\uDF31"}
        </div>
        <h1
          className="text-4xl font-display font-bold uppercase tracking-widest"
          style={{ color }}
        >
          {profileName || identity}
        </h1>
        <p
          className="text-xs font-display uppercase tracking-widest mt-1"
          style={{ color: "#888" }}
        >
          LEVEL {level} — {levelTitle.toUpperCase()}
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="flame-pulse">\uD83D\uDD25</span>
          <span
            className="text-sm font-display font-bold"
            style={{ color: "#FF0000" }}
          >
            {streak} DAY STREAK
          </span>
        </div>
      </div>

      {/* My Profile Section */}
      <div className="px-4 mb-6">
        <h2
          className="text-xs font-display uppercase tracking-widest mb-3"
          style={{ color: "#888" }}
        >
          MY PROFILE
        </h2>
        <div
          className="p-4 rounded-sm flex flex-col gap-4"
          style={{ backgroundColor: "#111", border: "1px solid #222" }}
        >
          <div>
            <label htmlFor="profile-name" style={labelStyle}>
              DISPLAY NAME
            </label>
            <input
              id="profile-name"
              data-ocid="profile.name.input"
              type="text"
              placeholder="Your warrior name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              style={{ ...inputStyle, width: "100%" }}
            />
          </div>
          <div>
            <label htmlFor="profile-email" style={labelStyle}>
              EMAIL
            </label>
            <input
              id="profile-email"
              data-ocid="profile.email.input"
              type="email"
              placeholder="your@email.com"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              style={{ ...inputStyle, width: "100%" }}
            />
          </div>
          <div>
            <label htmlFor="profile-weight" style={labelStyle}>
              WEIGHT
            </label>
            <div className="flex gap-2">
              <input
                id="profile-weight"
                data-ocid="profile.weight.input"
                type="number"
                placeholder="e.g. 80"
                value={profileWeight}
                onChange={(e) => setProfileWeight(e.target.value)}
                style={inputStyle}
              />
              <div
                className="flex rounded-sm overflow-hidden"
                style={{ border: "1px solid #333" }}
              >
                {(["kg", "lbs"] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setWeightUnit(unit)}
                    className="px-3 py-2 text-xs font-display font-bold uppercase"
                    style={{
                      backgroundColor: weightUnit === unit ? "#FF0000" : "#111",
                      color: weightUnit === unit ? "#fff" : "#666",
                    }}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="profile-goal" style={labelStyle}>
              GOAL
            </label>
            <input
              id="profile-goal"
              data-ocid="profile.goal.input"
              type="text"
              placeholder="e.g. Lose fat, Build muscle"
              value={profileGoal}
              onChange={(e) => setProfileGoal(e.target.value)}
              style={{ ...inputStyle, width: "100%" }}
            />
          </div>
          <button
            type="button"
            data-ocid="profile.save_button"
            onClick={handleSaveProfile}
            className="w-full py-3 rounded-sm font-display font-black uppercase tracking-widest text-sm text-white transition-all"
            style={{
              backgroundColor: profileSaved ? "#006600" : "#FF0000",
              boxShadow: profileSaved
                ? "0 0 15px rgba(0,150,0,0.4)"
                : "0 0 15px rgba(255,0,0,0.3)",
            }}
          >
            {profileSaved ? "\u2713 SAVED" : "SAVE PROFILE"}
          </button>
        </div>
      </div>

      {/* XP Bar */}
      <div className="px-4 mb-6">
        <div className="p-4 rounded-sm" style={{ backgroundColor: "#111" }}>
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs font-display uppercase tracking-widest"
              style={{ color: "#888" }}
            >
              XP PROGRESS
            </span>
            <span
              className="text-xs font-display font-bold"
              style={{ color: "#FF0000" }}
            >
              {xpInLevel.toLocaleString()} / {xpForLevel.toLocaleString()} XP
            </span>
          </div>
          <div
            className="w-full h-3 rounded-full overflow-hidden"
            style={{ backgroundColor: "#1a1a1a" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                backgroundColor: "#FF0000",
                boxShadow: "0 0 10px rgba(255,0,0,0.5)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs" style={{ color: "#666" }}>
              LVL {level}
            </span>
            <span className="text-xs" style={{ color: "#666" }}>
              LVL {level + 1}
            </span>
          </div>
          <div className="text-center mt-1">
            <span className="text-xs font-display font-bold text-white">
              {xp.toLocaleString()} TOTAL XP
            </span>
          </div>
        </div>
      </div>

      {/* Sound Effects Toggle */}
      <div className="px-4 mb-6">
        <div
          className="p-4 rounded-sm flex items-center justify-between"
          style={{ backgroundColor: "#111", border: "1px solid #222" }}
        >
          <div>
            <p className="font-display font-bold uppercase tracking-wider text-sm text-white">
              SOUND EFFECTS
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#888" }}>
              Chime on task completion.
            </p>
          </div>
          <Switch
            data-ocid="profile.sound.switch"
            checked={soundEnabled}
            onCheckedChange={setSoundEnabled}
            className="data-[state=checked]:bg-red-600"
          />
        </div>
      </div>

      {/* No Excuse Mode */}
      <div className="px-4 mb-6">
        <div
          className="p-4 rounded-sm flex items-center justify-between"
          style={{
            backgroundColor: "#111",
            border: noExcuseMode ? "1px solid #FF0000" : "1px solid #222",
          }}
        >
          <div>
            <p className="font-display font-bold uppercase tracking-wider text-sm text-white">
              NO EXCUSE MODE
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#888" }}>
              Maximum accountability. No mercy.
            </p>
          </div>
          <Switch
            data-ocid="profile.noexcuse.switch"
            checked={noExcuseMode}
            onCheckedChange={setNoExcuseMode}
            className="data-[state=checked]:bg-red-600"
          />
        </div>
      </div>

      {/* Achievements */}
      <div className="px-4 mb-6">
        <h2
          className="text-xs font-display uppercase tracking-widest mb-3"
          style={{ color: "#888" }}
        >
          ACHIEVEMENTS
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {allAchievements.map((badge, i) => {
            const unlocked = unlockedAchievements.includes(badge.id);
            return (
              <motion.div
                key={badge.id}
                data-ocid={`profile.achievement.item.${i + 1}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="p-3 rounded-sm"
                style={{
                  backgroundColor: "#111",
                  border: unlocked ? "1px solid #FF0000" : "1px solid #222",
                  filter: unlocked ? "none" : "grayscale(100%) brightness(0.5)",
                  boxShadow: unlocked ? "0 0 10px rgba(255,0,0,0.2)" : "none",
                }}
              >
                <div className="text-2xl mb-1">
                  {unlocked ? badge.icon : "\uD83D\uDD12"}
                </div>
                <p
                  className="text-xs font-display font-bold uppercase tracking-wide"
                  style={{ color: unlocked ? "#FF0000" : "#666" }}
                >
                  {badge.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#888" }}>
                  {badge.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 flex flex-col gap-3">
        <button
          type="button"
          data-ocid="profile.change_identity.button"
          onClick={() => {
            haptic();
            onResetIdentity();
          }}
          className="w-full py-3 rounded-sm font-display font-bold uppercase tracking-widest text-sm btn-outline-red"
        >
          CHANGE IDENTITY
        </button>
        <button
          type="button"
          data-ocid="profile.logout.button"
          onClick={() => {
            haptic(60);
            onLogout();
          }}
          className="w-full py-3 rounded-sm font-display font-bold uppercase tracking-widest text-sm"
          style={{
            backgroundColor: "transparent",
            border: "1px solid #FF0000",
            color: "#FF0000",
          }}
        >
          LOGOUT
        </button>
      </div>
    </div>
  );
}
