import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import AuthScreen from "./components/AuthScreen";
import BottomNav from "./components/BottomNav";
import type { Tab } from "./components/BottomNav";
import HomeDashboard from "./components/HomeDashboard";
import MindTab from "./components/MindTab";
import Onboarding from "./components/Onboarding";
import ProfileTab from "./components/ProfileTab";
import ProgressTab from "./components/ProgressTab";
import SplashScreen from "./components/SplashScreen";
import WorkoutTab from "./components/WorkoutTab";
import { useGrindMind } from "./hooks/useGrindMind";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

type AppState = "splash" | "auth" | "onboarding" | "main";

const NO_EXCUSE_MESSAGES = [
  "⚠️ NO EXCUSE MODE ACTIVE — NO MERCY. NO DAYS OFF.",
  "⚡ CHAMPIONS DON'T SKIP. GET IT DONE.",
  "💀 WEAK MEN MAKE EXCUSES. ARE YOU WEAK?",
  "🔥 NO EXCUSES. YOU CHOSE THIS LIFE.",
];

type NotificationBanner = {
  message: string;
  isAggressive: boolean;
};

function getSessionBannerOnMount(
  noExcuseMode: boolean,
  taskProgress: number,
): NotificationBanner | null {
  const flagKey = "grindmind_banner_shown";
  if (sessionStorage.getItem(flagKey)) return null;
  const hour = new Date().getHours();
  let banner: NotificationBanner | null = null;
  if (noExcuseMode && taskProgress < 100 && hour >= 20) {
    banner = {
      message: "⚠️ NO EXCUSES. YOU CHOSE THIS LIFE. FINISH YOUR TASKS NOW.",
      isAggressive: true,
    };
  } else if (hour >= 6 && hour < 10) {
    banner = {
      message: "☀️ MORNING. START STRONG. THE WEAK ARE STILL SLEEPING.",
      isAggressive: false,
    };
  } else if (hour >= 20 && hour < 23) {
    banner = {
      message: "🌙 EVENING CHECK-IN. DID YOU FINISH YOUR GRIND TODAY?",
      isAggressive: false,
    };
  }
  if (banner) sessionStorage.setItem(flagKey, "1");
  return banner;
}

function isLoggedIn(): boolean {
  try {
    return !!JSON.parse(localStorage.getItem("grindmind_user") || "null");
  } catch {
    return false;
  }
}

export default function App() {
  const grind = useGrindMind();
  const { identity: iiIdentity, clear: clearII } = useInternetIdentity();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [noExcuseMsgIdx, setNoExcuseMsgIdx] = useState(0);

  const [appState, setAppState] = useState<AppState>("splash");

  const [notifBanner, setNotifBanner] = useState<NotificationBanner | null>(
    () => getSessionBannerOnMount(grind.noExcuseMode, grind.taskProgress),
  );

  const prevLevelRef = useRef<number | null>(null);
  const [levelUpData, setLevelUpData] = useState<{
    level: number;
    title: string;
  } | null>(null);

  useEffect(() => {
    if (prevLevelRef.current !== null && grind.level > prevLevelRef.current) {
      setLevelUpData({ level: grind.level, title: grind.levelTitle });
      const t = setTimeout(() => setLevelUpData(null), 3000);
      return () => clearTimeout(t);
    }
    prevLevelRef.current = grind.level;
  }, [grind.level, grind.levelTitle]);

  useEffect(() => {
    if (!grind.noExcuseMode) return;
    const t = setInterval(() => {
      setNoExcuseMsgIdx((i) => (i + 1) % NO_EXCUSE_MESSAGES.length);
    }, 4000);
    return () => clearInterval(t);
  }, [grind.noExcuseMode]);

  const handleSplashComplete = () => {
    const hasLocalAuth = isLoggedIn();
    const hasIIAuth = iiIdentity && !iiIdentity.getPrincipal().isAnonymous();

    if (hasLocalAuth && hasIIAuth) {
      setAppState(grind.identity ? "main" : "onboarding");
    } else {
      setAppState("auth");
    }
  };

  const handleAuthSuccess = (name: string) => {
    grind.updateProfile(grind.userWeight, grind.userGoal, name);
    setAppState(grind.identity ? "main" : "onboarding");
  };

  const handleLogout = () => {
    grind.logout();
    clearII();
    setAppState("auth");
  };

  if (appState === "splash") {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (appState === "auth") {
    return <AuthScreen onSuccess={handleAuthSuccess} />;
  }

  if (appState === "onboarding") {
    return (
      <Onboarding
        onSelect={(id) => {
          grind.setIdentity(id);
          setAppState("main");
        }}
      />
    );
  }

  const handleWorkoutComplete = () => {
    grind.toggleTask("workout");
  };

  return (
    <div
      className="flex flex-col"
      style={{
        backgroundColor: "#000",
        minHeight: "100dvh",
        maxWidth: "480px",
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* Smart Notification Banner */}
      <AnimatePresence>
        {notifBanner && (
          <motion.div
            data-ocid="app.notification.toast"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="sticky top-0 z-50 overflow-hidden"
          >
            <div
              className="flex items-center justify-between px-3 py-2 text-xs font-display font-bold uppercase tracking-wide"
              style={{
                backgroundColor: notifBanner.isAggressive
                  ? "#CC0000"
                  : "#1a0000",
                color: "#fff",
                borderBottom: notifBanner.isAggressive
                  ? "2px solid #FF0000"
                  : "1px solid #FF0000",
                letterSpacing: "0.08em",
              }}
            >
              <span className="flex-1 text-center">{notifBanner.message}</span>
              <button
                type="button"
                data-ocid="app.notification.close_button"
                onClick={() => setNotifBanner(null)}
                className="ml-2 text-white opacity-70 hover:opacity-100 text-base leading-none flex-shrink-0"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Excuse Banner */}
      <AnimatePresence>
        {grind.noExcuseMode && (
          <motion.div
            data-ocid="app.noexcuse.toast"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="sticky top-0 z-50 overflow-hidden"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={noExcuseMsgIdx}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="px-3 py-2 text-center text-xs font-display font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: "#FF0000",
                  color: "#fff",
                  letterSpacing: "0.1em",
                }}
              >
                {NO_EXCUSE_MESSAGES[noExcuseMsgIdx]}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollable Content */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: "72px" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {activeTab === "home" && (
              <HomeDashboard
                identity={grind.identity!}
                tasks={grind.tasks}
                taskProgress={grind.taskProgress}
                streak={grind.streak}
                xp={grind.xp}
                level={grind.level}
                levelTitle={grind.levelTitle}
                toggleTask={grind.toggleTask}
                onStartWorkout={() => setActiveTab("body")}
                onStartFocus={() => setActiveTab("mind")}
                soundEnabled={grind.soundEnabled}
                userName={grind.userName}
              />
            )}
            {activeTab === "body" && (
              <WorkoutTab
                strengthLogs={grind.strengthLogs}
                addStrengthLog={grind.addStrengthLog}
                onSessionComplete={handleWorkoutComplete}
              />
            )}
            {activeTab === "mind" && (
              <MindTab
                journal={grind.journal}
                saveJournal={grind.saveJournal}
              />
            )}
            {activeTab === "progress" && (
              <ProgressTab
                weights={grind.weights}
                strengthLogs={grind.strengthLogs}
                addWeight={grind.addWeight}
                taskProgress={grind.taskProgress}
              />
            )}
            {activeTab === "profile" && (
              <ProfileTab
                identity={grind.identity!}
                level={grind.level}
                levelTitle={grind.levelTitle}
                xp={grind.xp}
                xpProgress={grind.xpProgress}
                xpInLevel={grind.xpInLevel}
                xpForLevel={grind.xpForLevel}
                streak={grind.streak}
                noExcuseMode={grind.noExcuseMode}
                setNoExcuseMode={grind.setNoExcuseMode}
                unlockedAchievements={grind.unlockedAchievements}
                allAchievements={grind.ALL_ACHIEVEMENTS}
                onResetIdentity={grind.resetIdentity}
                userName={grind.userName}
                userEmail={grind.userEmail}
                userWeight={grind.userWeight}
                userGoal={grind.userGoal}
                soundEnabled={grind.soundEnabled}
                setSoundEnabled={grind.setSoundEnabled}
                onUpdateProfile={grind.updateProfile}
                onLogout={handleLogout}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Level Up Overlay */}
      <AnimatePresence>
        {levelUpData && (
          <motion.div
            data-ocid="app.levelup.modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
            style={{
              backgroundColor: "rgba(0,0,0,0.96)",
              maxWidth: "480px",
              margin: "0 auto",
            }}
          >
            <div
              className="level-up-border rounded-sm px-10 py-10 flex flex-col items-center gap-4"
              style={{ border: "4px solid #FF0000" }}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
                className="text-6xl"
              >
                ⚡
              </motion.div>
              <p
                className="text-2xl font-display font-bold uppercase tracking-widest"
                style={{ color: "#FF0000" }}
              >
                LEVEL UP!
              </p>
              <p className="text-6xl font-display font-bold text-white">
                {levelUpData.level}
              </p>
              <p
                className="text-lg font-display font-bold uppercase tracking-widest"
                style={{ color: "#FF0000" }}
              >
                {levelUpData.title}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
