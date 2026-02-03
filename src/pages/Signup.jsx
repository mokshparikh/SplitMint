import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const Signup = ({ setView }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile with name
      await updateProfile(user, {
        displayName: name,
      });

      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        createdAt: new Date().toISOString(),
      });

      // Send email verification
      await sendEmailVerification(user);

      // Sign out the user immediately after signup
      await signOut(auth);

      // Show success message briefly
      setShowSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        setView("login");
      }, 2000);

    } catch (error) {
      setLoading(false);
      console.error("Signup error:", error);
      
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please sign in instead.");
      } else if (error.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address format.");
      } else {
        setError(error.message);
      }
    }
  };

  // Show success popup
  if (showSuccess) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.glowOrb1}></div>
        <div style={styles.glowOrb2}></div>

        <div style={styles.successPopup}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.successTitle}>Account Created!</h2>
          <p style={styles.successText}>
            Verification email sent to <strong style={{color: '#fff'}}>{email}</strong>
          </p>
          <p style={styles.successSubtext}>
            Please check your inbox and verify your email.
          </p>
          <div style={styles.loadingDots}>
            <span style={styles.dot}>●</span>
            <span style={styles.dot}>●</span>
            <span style={styles.dot}>●</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.glowOrb1}></div>
      <div style={styles.glowOrb2}></div>

      <div style={styles.glassCard}>
        <div style={styles.header}>
          <div style={styles.brandWrapper}>
            <h1 style={styles.brandName}>Splitmint<span>.</span></h1>
            <div style={styles.brandUnderline}></div>
          </div>

          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join us in a few seconds</p>
        </div>

        <form onSubmit={handleSignup} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              style={styles.input}
              placeholder="Alex Carter"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
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
              minLength="6"
            />
            <p style={styles.passwordHint}>Minimum 6 characters</p>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <button type="submit" style={styles.mainButton} disabled={loading}>
            {loading ? "Creating Account..." : "Get Started"}
          </button>
        </form>

        <p style={styles.footer}>
          Already a member?{" "}
          <span onClick={() => setView("login")} style={styles.link}>
            Sign In
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
  },
  successPopup: {
    background: "rgba(18, 18, 18, 0.95)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    borderRadius: "24px",
    padding: "40px 30px",
    width: "100%",
    maxWidth: "350px",
    boxShadow: "0 40px 80px rgba(0, 0, 0, 0.6)",
    zIndex: 10,
    textAlign: "center",
    animation: "fadeIn 0.3s ease-in",
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
    transition: "border-color 0.2s",
  },
  passwordHint: {
    fontSize: "11px",
    color: "#64748b",
    margin: 0,
    marginTop: "-2px",
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
  successIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    margin: "0 auto 20px auto",
    fontWeight: "bold",
    animation: "scaleIn 0.4s ease-out",
  },
  successTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#f8fafc",
    margin: "0 0 10px 0",
  },
  successText: {
    fontSize: "14px",
    color: "#94a3b8",
    margin: "0 0 8px 0",
    lineHeight: "1.5",
  },
  successSubtext: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
  },
  loadingDots: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginTop: "25px",
  },
  dot: {
    fontSize: "20px",
    color: "#10b981",
    animation: "bounce 1.4s infinite ease-in-out both",
  },
};

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes scaleIn {
    from { transform: scale(0); }
    to { transform: scale(1); }
  }
  
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
  
  .loadingDots span:nth-child(1) { animation-delay: -0.32s; }
  .loadingDots span:nth-child(2) { animation-delay: -0.16s; }
`;
document.head.appendChild(styleSheet);

export default Signup;