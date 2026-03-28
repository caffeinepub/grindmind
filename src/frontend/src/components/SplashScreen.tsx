import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface Props {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
    }, 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
          style={{ backgroundColor: "#000" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center gap-4"
          >
            {/* Logo */}
            <div className="flex flex-col items-center gap-2">
              <span
                className="text-6xl font-display font-black uppercase tracking-widest"
                style={{
                  color: "#fff",
                  textShadow:
                    "0 0 20px rgba(255,0,0,0.8), 0 0 40px rgba(255,0,0,0.4)",
                  letterSpacing: "0.15em",
                }}
              >
                GRINDMIND
              </span>
              <span
                className="text-xs font-display uppercase tracking-widest"
                style={{ color: "#FF0000", letterSpacing: "0.3em" }}
              >
                DISCIPLINE. GRIND. EVOLVE.
              </span>
            </div>

            {/* Animated underline bar */}
            <div
              className="overflow-hidden"
              style={{
                width: "240px",
                height: "2px",
                backgroundColor: "#1a1a1a",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                style={{ height: "100%", backgroundColor: "#FF0000" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
