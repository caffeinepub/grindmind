import { motion } from "motion/react";

export type Tab = "home" | "body" | "mind" | "progress" | "profile";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "home", label: "HOME", icon: "🏠" },
  { id: "body", label: "BODY", icon: "💪" },
  { id: "mind", label: "MIND", icon: "🧠" },
  { id: "progress", label: "PROGRESS", icon: "📊" },
  { id: "profile", label: "PROFILE", icon: "👤" },
];

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function BottomNav({ activeTab, onTabChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around"
      style={{
        backgroundColor: "#000",
        borderTop: "1px solid #222",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        maxWidth: "480px",
        margin: "0 auto",
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            type="button"
            key={tab.id}
            data-ocid={`nav.${tab.id}.link`}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col items-center justify-center py-3 px-2 relative flex-1 transition-all"
            style={{ minHeight: "56px" }}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8"
                style={{
                  backgroundColor: "#FF0000",
                  boxShadow: "0 0 8px rgba(255,0,0,0.8)",
                }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="text-lg mb-0.5">{tab.icon}</span>
            <span
              className="text-[9px] font-display font-bold uppercase tracking-wider transition-colors"
              style={{ color: isActive ? "#FF0000" : "#555" }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
