import React, { useState } from "react";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase";

const Login = ({ setView }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerificationWarning, setShowVerificationWarning] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShowVerificationWarning(false);
    
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const user = res.user;

      // Check if email is verified
      if (!user.emailVerified) {
        setUserEmail(user.email);
        setShowVerificationWarning(true);
        await auth.signOut(); // Sign them out immediately
        setLoading(false);
        return;
      }

      // If verified, authentication is successful
      // The onAuthStateChanged in App.js will handle the redirect to home
      
    } catch (err) {
      setLoading(false);
      
      // Handle different error codes
      if (err.code === "auth/invalid-email") {
        setError("Invalid email address format.");
      } else if (err.code === "auth/user-not-found") {
        setError("No account found with this email. Please sign up first.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password. Please check your credentials.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed login attempts. Please try again later.");
      } else if (err.code === "auth/user-disabled") {
        setError("This account has been disabled. Please contact support.");
      } else {
        setError("Login failed. Please check your email and password.");
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(res.user);
      await auth.signOut();
      // alert("Verification email resent! Please check your inbox.");
    } catch (err) {
      alert("Failed to resend verification email. Please try again.");
    }
  };

  // Show verification warning screen
  if (showVerificationWarning) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.glowOrb1}></div>
        <div style={styles.glowOrb2}></div>

        <div style={styles.glassCard}>
          <div style={styles.header}>
            <div style={styles.warningIcon}>⚠️</div>
            <h2 style={styles.title}>Email Not Verified</h2>
            <p style={styles.subtitle}>
              Please verify your email to continue
            </p>
          </div>

          <div style={styles.verificationWarning}>
            <p style={styles.warningText}>
              We sent a verification link to <strong style={{color: '#fff'}}>{userEmail}</strong>
            </p>
            <p style={styles.warningText}>
              Please check your inbox (and spam folder) and click the verification link.
            </p>
          </div>

          <button 
            onClick={() => setShowVerificationWarning(false)} 
            style={styles.mainButton}
          >
            Back to Sign In
          </button>

          {/* <p style={styles.footer}>
            Didn't receive the email?{" "}
            <span onClick={handleResendVerification} style={styles.link}>
              Resend verification email
            </span>
          </p> */}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      {/* Matching Background Orbs */}
      <div style={styles.glowOrb1}></div>
      <div style={styles.glowOrb2}></div>

      <div style={styles.glassCard}>
        <div style={styles.header}>
          {/* Minimalist Wordmark Branding - Synced Style */}
          <div style={styles.brandWrapper}>
            <h1 style={styles.brandName}>Splitmint<span>.</span></h1>
            <div style={styles.brandUnderline}></div>
          </div>

          <h2 style={styles.title}>Sign In</h2>
          <p style={styles.subtitle}>Welcome back to Splitmint</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              style={styles.input}
              type="email"
              placeholder="name@splitmint.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <button type="submit" style={styles.mainButton} disabled={loading}>
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <p style={styles.footer}>
          New to Splitmint?{" "}
          <span onClick={() => setView("signup")} style={styles.link}>
            Create account
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#050505",
    overflow: "hidden",
    position: "relative",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
  },
  glowOrb1: {
    position: "absolute",
    width: "450px",
    height: "450px",
    background: "radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)",
    top: "-100px",
    right: "-50px",
  },
  glowOrb2: {
    position: "absolute",
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(45, 212, 191, 0.06) 0%, transparent 70%)",
    bottom: "-80px",
    left: "-50px",
  },
  glassCard: {
    background: "rgba(18, 18, 18, 0.85)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    borderRadius: "24px",
    padding: "35px 30px",
    width: "100%",
    maxWidth: "350px",
    boxShadow: "0 40px 80px rgba(0, 0, 0, 0.6)",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    textAlign: "center",
    marginBottom: "25px",
  },
  brandWrapper: {
    marginBottom: "15px",
    display: "inline-block",
  },
  brandName: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#fff",
    letterSpacing: "-1.2px",
    margin: 0,
    background: "linear-gradient(to bottom, #fff, #999)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  brandUnderline: {
    width: "30%",
    height: "1.5px",
    background: "linear-gradient(90deg, #6366f1, transparent)",
    margin: "2px auto 0 auto",
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#f8fafc",
    margin: "0 0 5px 0",
    letterSpacing: "-0.4px",
  },
  subtitle: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
  },
  mainButton: {
    background: "#ffffff",
    color: "#000",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "5px",
    transition: "opacity 0.2s",
    display:"flex",
    flexDirection:"row",
    justifyContent:"center",
  },
  errorBox: {
    background: "rgba(248, 113, 113, 0.08)",
    color: "#f87171",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "12px",
    border: "1px solid rgba(248, 113, 113, 0.15)",
    textAlign: "center",
  },
  footer: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "13px",
    color: "#475569",
  },
  link: {
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    marginLeft: "4px",
    textDecoration: "underline",
  },
  warningIcon: {
    fontSize: "48px",
    margin: "0 auto 15px auto",
  },
  verificationWarning: {
    background: "rgba(251, 191, 36, 0.05)",
    border: "1px solid rgba(251, 191, 36, 0.15)",
    borderRadius: "12px",
    padding: "15px",
    marginBottom: "20px",
  },
  warningText: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: "0 0 10px 0",
    lineHeight: "1.5",
  },
};

export default Login;