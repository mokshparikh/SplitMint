import React from "react";
import {
  calculateBalances,
  calculateSettlements,
} from "../utils/balanceEngine";

const Settlements = ({ group, expenses = [], setView }) => {

  const activeParticipants = Array.isArray(group.participants)
    ? group.participants
    : [];

  const safeExpenses = expenses.filter((exp) =>
    exp.splits?.every((s) =>
      activeParticipants.some((p) => p.id === s.participantId)
    )
  );

  const balances = calculateBalances(safeExpenses, activeParticipants);

  const visibleBalances = Object.values(balances).filter(
    (b) => Math.abs(b.net) > 0.009 || b.paid > 0
  );

  const settlements = calculateSettlements(balances);

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.glowOrb1}></div>

      <div style={styles.container}>
        {/* HEADER */}
        <header style={styles.header}>
          <button
            style={styles.backLink}
            onClick={() => setView("expenses")}
          >
            ← Back to Expenses
          </button>
          <h2 style={styles.title}>Group Settlement 🔁</h2>
          <p style={styles.subtitle}>{group.name} • Final Balances</p>
        </header>

        {/* BALANCE TABLE */}
        <div style={styles.section}>
          <h3 style={styles.sectionLabel}>Participant Summary</h3>

          <div style={styles.glassCard}>
            <div style={styles.tableHeader}>
              <span style={{ flex: 2 }}>Member</span>
              <span style={{ flex: 1, textAlign: "right" }}>Paid</span>
              <span style={{ flex: 1, textAlign: "right" }}>Net</span>
            </div>

            {visibleBalances.map((b) => {
              const participant = activeParticipants.find(
                (p) => p.id === b.id
              );

              return (
                <div key={b.id} style={styles.tableRow}>
                  <div
                    style={{
                      flex: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        ...styles.avatar,
                        background: participant?.color || "#333",
                      }}
                    >
                      {(participant?.name || "U")[0]}
                    </div>
                    <span style={styles.memberName}>
                      {participant?.name || "Removed User"}
                    </span>
                  </div>

                  <span
                    style={{
                      flex: 1,
                      textAlign: "right",
                      color: "#94a3b8",
                      fontSize: "14px",
                    }}
                  >
                    ₹{b.paid.toFixed(2)}
                  </span>

                  <span
                    style={{
                      flex: 1,
                      textAlign: "right",
                      fontWeight: "800",
                      color: b.net >= 0 ? "#22c55e" : "#ef4444",
                    }}
                  >
                    {b.net >= 0 ? "+" : "-"}₹
                    {Math.abs(b.net).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SETTLEMENTS */}
        <div style={styles.section}>
          <h3 style={styles.sectionLabel}>Suggested Payments</h3>

          {settlements.length === 0 ? (
            <div style={styles.settledCard}>
              <span style={{ fontSize: "26px" }}>🎉</span>
              <div>
                <h4 style={{ margin: 0 }}>All Settled!</h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    opacity: 0.8,
                  }}
                >
                  No outstanding balances.
                </p>
              </div>
            </div>
          ) : (
            settlements.map((s, i) => (
              <div key={i} style={styles.settlementCard}>
                <div style={styles.settlementFlow}>
                  <div style={styles.memberBox}>
                    <span style={styles.payerName}>{s.from}</span>
                    <span style={styles.roleLabel}>Payer</span>
                  </div>

                  <div style={styles.arrowBox}>
                    <span style={styles.amountText}>
                      ₹{Number(s.amount).toFixed(2)}
                    </span>
                    <div style={styles.arrowLine}></div>
                  </div>

                  <div style={styles.memberBox}>
                    <span style={styles.receiverName}>{s.to}</span>
                    <span style={styles.roleLabel}>Receiver</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={() => setView("home")}
          style={styles.homeBtn}
        >
          Exit to Groups
        </button>
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
    fontFamily: "'Inter', sans-serif",
  },
  glowOrb1: {
    position: "absolute",
    width: "600px",
    height: "600px",
    background:
      "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
    top: "-100px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 0,
  },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "60px 20px",
    position: "relative",
    zIndex: 1,
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  backLink: {
    background: "none",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    fontWeight: "600",
    marginBottom: "20px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    margin: "0 0 10px 0",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "16px",
  },
  section: {
    marginBottom: "32px",
  },
  sectionLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "16px",
    marginLeft: "10px",
  },

  glassCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "24px",
    padding: "10px",
  },
  tableHeader: {
    display: "flex",
    padding: "15px 20px",
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "700",
  },
  tableRow: {
    display: "flex",
    alignItems: "center",
    padding: "15px 20px",
    borderTop: "1px solid rgba(255,255,255,0.05)",
  },
  avatar: {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
  },
  memberName: {
    fontWeight: "600",
    fontSize: "15px",
  },

  settlementCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "20px",
    padding: "24px",
    marginBottom: "12px",
  },
  settlementFlow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  memberBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100px",
  },
  payerName: {
    fontWeight: "700",
    fontSize: "14px",
  },
  receiverName: {
    fontWeight: "700",
    color: "#22c55e",
    fontSize: "14px",
  },
  roleLabel: {
    fontSize: "10px",
    color: "#64748b",
    textTransform: "uppercase",
    marginTop: "4px",
  },
  arrowBox: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 20px",
  },
  amountText: {
    fontSize: "18px",
    fontWeight: "900",
    marginBottom: "8px",
  },
  arrowLine: {
    width: "100%",
    height: "2px",
    background:
      "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)",
  },

  settledCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    background: "rgba(34,197,94,0.1)",
    border: "1px solid rgba(34,197,94,0.2)",
    padding: "20px",
    borderRadius: "20px",
    color: "#22c55e",
  },
  homeBtn: {
    width: "100%",
    background: "#fff",
    color: "#000",
    border: "none",
    padding: "16px",
    borderRadius: "16px",
    fontWeight: "800",
    cursor: "pointer",
    marginTop: "20px",
  },
};

export default Settlements;
