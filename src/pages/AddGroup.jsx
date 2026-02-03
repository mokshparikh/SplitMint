import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444"];

const AddGroup = ({ user, setView, selectedGroup }) => {
  const isEditMode = Boolean(selectedGroup);

  const [groupName, setGroupName] = useState("");
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🧠 PREFILL FORM FOR EDIT MODE
  useEffect(() => {
    if (isEditMode && selectedGroup) {
      setGroupName(selectedGroup.name);

      const otherMembers =
        selectedGroup.participants
          ?.filter((p) => !p.isOwner)
          .map((p) => p.email) || [];

      setEmails(otherMembers.length ? otherMembers : [""]);
    } else {
      setGroupName("");
      setEmails([""]);
    }
  }, [selectedGroup, isEditMode]);

  const handleAddEmail = () => {
    if (emails.length >= 3) return;
    setEmails([...emails, ""]);
  };

  const handleEmailChange = (index, value) => {
    const updated = [...emails];
    updated[index] = value.trim();
    setEmails(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setLoading(true);

    // 🧼 Clean & Deduplicate Emails
    const cleanEmails = [
      ...new Set(
        emails
          .map((e) => e.toLowerCase().trim())
          .filter((e) => e)
      ),
    ].slice(0, 3);

    // 👥 Build Participants Array
    const participants = [
      {
        id: user.uid,
        name: user.displayName || "You",
        email: user.email.toLowerCase(),
        color: COLORS[0],
        isOwner: true,
      },
      ...cleanEmails.map((email, i) => ({
        id: `pending-${email}`,
        name: email.split("@")[0],
        email,
        color: COLORS[(i + 1) % COLORS.length],
        isOwner: false,
      })),
    ];

    // 🔥 IMPORTANT: Needed for App.jsx query
    const participantEmails = participants.map((p) =>
      p.email.toLowerCase()
    );

    try {
      if (isEditMode) {
        await updateDoc(doc(db, "groups", selectedGroup.id), {
          name: groupName.trim(),
          participants,
          participantEmails,
          updatedAt: Timestamp.now(),
        });
      } else {
        await addDoc(collection(db, "groups"), {
          name: groupName.trim(),
          ownerId: user.uid,
          participants,
          participantEmails,
          createdAt: Timestamp.now(),
        });
      }

      setView("home");
    } catch (err) {
      console.error("Error saving group:", err);
      alert("Failed to save group");
    }

    setLoading(false);
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.glowOrb1}></div>
      <div style={styles.glowOrb2}></div>

      <div style={styles.container}>
        <header style={styles.header}>
          <h2 style={styles.welcomeText}>
            {isEditMode ? "Edit Group ✏️" : "Create Group ➕"}
          </h2>
          <p style={styles.subtitle}>
            {isEditMode
              ? "Modify your group settings"
              : "Start a new expense circle"}
          </p>
        </header>

        <div style={styles.card}>
          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Group Name</label>
              <input
                style={styles.mainInput}
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Trip to Manali / Flat Expenses"
                required
              />
            </div>

            <div style={styles.memberSection}>
              <label style={styles.label}>
                Members (Max 3 others)
              </label>

              {/* Owner Row */}
              <div style={styles.memberRowStatic}>
                <div
                  style={{
                    ...styles.avatar,
                    background: COLORS[0],
                  }}
                >
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div style={styles.memberInfo}>
                  <span style={styles.mName}>
                    You (Owner)
                  </span>
                  <span style={styles.mEmail}>
                    {user.email}
                  </span>
                </div>
              </div>

              {/* Member Inputs */}
              {emails.map((email, i) => (
                <div key={i} style={styles.emailWrapper}>
                  <input
                    style={styles.emailInput}
                    value={email}
                    placeholder="friend@email.com"
                    onChange={(e) =>
                      handleEmailChange(i, e.target.value)
                    }
                    type="email"
                  />
                </div>
              ))}

              {emails.length < 3 && (
                <button
                  type="button"
                  onClick={handleAddEmail}
                  style={styles.addBtn}
                >
                  + Add Member
                </button>
              )}
            </div>

            <div style={styles.actionArea}>
              <button
                type="submit"
                disabled={loading}
                style={styles.primaryBtn}
              >
                {loading
                  ? "Saving..."
                  : isEditMode
                    ? "Update Group"
                    : "Create Group"}
              </button>

              <button
                type="button"
                onClick={() => setView("home")}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    background: "#050505",
    color: "#fff",
    position: "relative",
    overflowX: "hidden",
    fontFamily: "'Inter', sans-serif",
  },
  glowOrb1: {
    position: "absolute",
    width: "600px",
    height: "600px",
    background:
      "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)",
    top: "-100px",
    right: "-100px",
  },
  glowOrb2: {
    position: "absolute",
    width: "500px",
    height: "500px",
    background:
      "radial-gradient(circle, rgba(45, 212, 191, 0.05) 0%, transparent 70%)",
    bottom: "-100px",
    left: "-100px",
  },
  container: {
    maxWidth: "550px",
    margin: "0 auto",
    padding: "60px 20px",
    position: "relative",
    zIndex: 10,
  },
  header: { marginBottom: "32px" },
  welcomeText: {
    fontSize: "32px",
    fontWeight: "800",
    margin: "0 0 8px 0",
  },
  subtitle: { fontSize: "16px", color: "#94a3b8" },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "24px",
    padding: "32px",
  },
  label: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#64748b",
    marginBottom: "10px",
    textTransform: "uppercase",
  },
  mainInput: {
    width: "100%",
    background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "14px",
    borderRadius: "12px",
    color: "#fff",
    marginBottom: "24px",
  },
  memberSection: { marginBottom: "32px" },
  memberRowStatic: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.03)",
    marginBottom: "12px",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
  },
  memberInfo: { display: "flex", flexDirection: "column" },
  mName: { fontWeight: "700" },
  mEmail: { fontSize: "12px", color: "#64748b" },
  emailWrapper: { marginBottom: "10px" },
  emailInput: {
    width: "100%",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "12px",
    borderRadius: "12px",
    color: "#fff",
  },
  addBtn: {
    background: "rgba(99,102,241,0.1)",
    border: "none",
    color: "#818cf8",
    padding: "10px 16px",
    borderRadius: "10px",
    cursor: "pointer",
  },
  actionArea: { display: "flex", flexDirection: "column", gap: "12px" },
  primaryBtn: {
    background: "#fff",
    color: "#000",
    padding: "16px",
    borderRadius: "14px",
    border: "none",
    fontWeight: "800",
    cursor: "pointer",
  },
  cancelBtn: {
    background: "transparent",
    color: "#94a3b8",
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.1)",
    cursor: "pointer",
  },
};

export default AddGroup;
