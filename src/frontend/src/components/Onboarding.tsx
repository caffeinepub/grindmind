import { motion } from "motion/react";
import { useState } from "react";
import type { Identity } from "../hooks/useGrindMind";

interface OnboardingProps {
  onSelect: (identity: Identity) => void;
}

const identities: {
  id: Identity;
  subtitle: string;
  desc: string;
  icon: string;
}[] = [
  {
    id: "Beginner",
    subtitle: "Starting The Journey",
    desc: "Every legend started somewhere. Build the foundation.",
    icon: "🌱",
  },
  {
    id: "Warrior",
    subtitle: "Built For Battle",
    desc: "You've tasted discipline. Now go deeper.",
    icon: "⚔️",
  },
  {
    id: "Alpha",
    subtitle: "Elite. Unstoppable.",
    desc: "No limits. No excuses. Pure execution.",
    icon: "💀",
  },
];

export default function Onboarding({ onSelect }: OnboardingProps) {
  const [selected, setSelected] = useState<Identity | null>(null);

  return (
    <div
      className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "#000" }}
    >
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <p className="text-red text-sm font-display tracking-widest uppercase mb-3">
          GRINDMIND
        </p>
        <h1 className="text-5xl font-display font-bold text-white uppercase tracking-widest mb-4">
          WHO ARE YOU?
        </h1>
        <p className="text-gray-400 text-sm uppercase tracking-wider">
          Choose your identity. This defines your path.
        </p>
      </motion.div>

      <div className="w-full max-w-sm flex flex-col gap-4 mb-10">
        {identities.map((item, i) => (
          <motion.button
            key={item.id}
            data-ocid={`onboarding.${item.id.toLowerCase()}.card`}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.15 }}
            onClick={() => setSelected(item.id)}
            className="relative text-left p-5 rounded-sm border-2 transition-all duration-200"
            style={{
              backgroundColor: "#111",
              borderColor: selected === item.id ? "#FF0000" : "#333",
              boxShadow:
                selected === item.id ? "0 0 20px rgba(255,0,0,0.3)" : "none",
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{item.icon}</span>
              <span
                className="text-xl font-display font-bold uppercase tracking-wider"
                style={{ color: selected === item.id ? "#FF0000" : "#fff" }}
              >
                {item.id}
              </span>
            </div>
            <p
              className="text-xs uppercase tracking-widest mb-1"
              style={{ color: "#FF0000" }}
            >
              {item.subtitle}
            </p>
            <p className="text-gray-400 text-sm">{item.desc}</p>
            {selected === item.id && (
              <div
                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                style={{
                  backgroundColor: "#FF0000",
                  boxShadow: "0 0 8px #FF0000",
                }}
              />
            )}
          </motion.button>
        ))}
      </div>

      <motion.button
        data-ocid="onboarding.claim_button"
        initial={{ opacity: 0 }}
        animate={{ opacity: selected ? 1 : 0.4 }}
        whileHover={selected ? { scale: 1.02 } : {}}
        whileTap={selected ? { scale: 0.98 } : {}}
        onClick={() => selected && onSelect(selected)}
        className="w-full max-w-sm py-4 rounded-sm font-display font-bold text-lg uppercase tracking-widest"
        style={{
          backgroundColor: selected ? "#FF0000" : "#330000",
          color: "#fff",
          boxShadow: selected ? "0 0 25px rgba(255,0,0,0.5)" : "none",
          cursor: selected ? "pointer" : "not-allowed",
        }}
      >
        CLAIM YOUR IDENTITY →
      </motion.button>
    </div>
  );
}
