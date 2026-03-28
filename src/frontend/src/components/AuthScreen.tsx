import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface Account {
  email: string;
  password: string;
  name: string;
}

interface Props {
  onSuccess: (name: string) => void;
}

function getAccounts(): Account[] {
  try {
    return JSON.parse(localStorage.getItem("grindmind_accounts") || "[]");
  } catch {
    return [];
  }
}

export default function AuthScreen({ onSuccess }: Props) {
  const { login, identity, isLoggingIn } = useInternetIdentity();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleMsg, setGoogleMsg] = useState("");
  const [awaitingII, setAwaitingII] = useState(false);
  const pendingNameRef = useRef("");

  // When II identity becomes non-anonymous after we triggered login, fire onSuccess
  useEffect(() => {
    if (!awaitingII) return;
    if (!identity) return;
    if (identity.getPrincipal().isAnonymous()) return;
    setAwaitingII(false);
    setLoading(false);
    onSuccess(pendingNameRef.current);
  }, [identity, awaitingII, onSuccess]);

  const handleSubmit = () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const accounts = getAccounts();
      let resolvedName = "";

      if (mode === "login") {
        const found = accounts.find(
          (a) => a.email === email.trim() && a.password === password,
        );
        if (!found) {
          setLoading(false);
          setError("Invalid email or password.");
          return;
        }
        localStorage.setItem(
          "grindmind_user",
          JSON.stringify({ email: found.email, name: found.name }),
        );
        resolvedName = found.name;
      } else {
        const exists = accounts.find((a) => a.email === email.trim());
        if (exists) {
          setLoading(false);
          setError("Account already exists.");
          return;
        }
        const newAccount: Account = {
          email: email.trim(),
          password,
          name: name.trim() || email.split("@")[0],
        };
        const updated = [...accounts, newAccount];
        localStorage.setItem("grindmind_accounts", JSON.stringify(updated));
        localStorage.setItem(
          "grindmind_user",
          JSON.stringify({ email: newAccount.email, name: newAccount.name }),
        );
        resolvedName = newAccount.name;
      }

      // Store pending name and trigger Internet Identity auth
      pendingNameRef.current = resolvedName;
      setAwaitingII(true);
      login();
    }, 600);
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: "#111",
    border: "1px solid #333",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: "4px",
    width: "100%",
    fontSize: "14px",
    outline: "none",
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

  const isSubmitting = loading || isLoggingIn;

  return (
    <div
      className="flex flex-col items-center justify-center min-h-dvh px-6"
      style={{ backgroundColor: "#000" }}
    >
      <div className="w-full" style={{ maxWidth: "400px" }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <span
            className="text-4xl font-display font-black uppercase"
            style={{
              color: "#fff",
              textShadow:
                "0 0 15px rgba(255,0,0,0.7), 0 0 30px rgba(255,0,0,0.3)",
              letterSpacing: "0.15em",
            }}
          >
            GRINDMIND
          </span>
          <span
            className="text-xs font-display uppercase tracking-widest mt-1"
            style={{ color: "#FF0000", letterSpacing: "0.25em" }}
          >
            {mode === "login" ? "WELCOME BACK" : "BEGIN YOUR JOURNEY"}
          </span>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-sm p-6 flex flex-col gap-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,0,0,0.3)",
          }}
        >
          {mode === "signup" && (
            <div>
              <label htmlFor="auth-name" style={labelStyle}>
                DISPLAY NAME
              </label>
              <input
                id="auth-name"
                data-ocid="auth.name.input"
                type="text"
                placeholder="Your warrior name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" style={labelStyle}>
              EMAIL
            </label>
            <input
              id="auth-email"
              data-ocid="auth.email.input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="auth-password" style={labelStyle}>
              PASSWORD
            </label>
            <input
              id="auth-password"
              data-ocid="auth.password.input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={inputStyle}
            />
          </div>

          {error && (
            <p
              data-ocid="auth.error_state"
              className="text-xs font-display uppercase tracking-wide"
              style={{ color: "#FF0000" }}
            >
              ⚠ {error}
            </p>
          )}

          {/* II instructional message */}
          {awaitingII && (
            <motion.p
              data-ocid="auth.loading_state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-center font-display uppercase tracking-wide"
              style={{ color: "#FF8800" }}
            >
              🔐 You'll be prompted to authenticate securely — complete the
              popup to continue
            </motion.p>
          )}

          <button
            type="button"
            data-ocid="auth.submit_button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 font-display font-black uppercase tracking-widest text-sm text-white rounded-sm transition-all"
            style={{
              backgroundColor: isSubmitting ? "#8B0000" : "#FF0000",
              boxShadow: isSubmitting
                ? "none"
                : "0 0 20px rgba(255,0,0,0.5), 0 0 40px rgba(255,0,0,0.2)",
            }}
          >
            {isSubmitting
              ? awaitingII
                ? "AUTHENTICATING..."
                : "VERIFYING..."
              : mode === "login"
                ? "LOGIN"
                : "CREATE ACCOUNT"}
          </button>

          {/* Google */}
          <button
            type="button"
            data-ocid="auth.google.button"
            onClick={() => setGoogleMsg("Google login coming soon.")}
            className="w-full py-3 font-display font-bold uppercase tracking-widest text-sm rounded-sm flex items-center justify-center gap-3"
            style={{
              backgroundColor: "transparent",
              border: "1px solid #333",
              color: "#888",
            }}
          >
            <span
              className="text-base font-black"
              style={{ color: "#FF4444", fontFamily: "sans-serif" }}
            >
              G
            </span>
            CONTINUE WITH GOOGLE
          </button>

          {googleMsg && (
            <p className="text-xs text-center" style={{ color: "#888" }}>
              {googleMsg}
            </p>
          )}
        </motion.div>

        {/* Toggle */}
        <p className="text-center mt-6 text-xs" style={{ color: "#666" }}>
          {mode === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            type="button"
            data-ocid="auth.toggle.button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
            }}
            className="font-display font-bold uppercase tracking-wide"
            style={{ color: "#FF0000" }}
          >
            {mode === "login" ? "Sign Up" : "Log In"}
          </button>
        </p>
      </div>
    </div>
  );
}
