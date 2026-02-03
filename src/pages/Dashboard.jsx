import React, { useMemo, useState } from "react";
import { calculateBalances } from "../utils/balanceEngine";

const Dashboard = ({ group, expenses = [], user, setView }) => {
  const balances = calculateBalances(expenses, group.participants);
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const myNet = balances[user.uid]?.net || 0;

  const youGet = myNet > 0 ? myNet : 0;
  const youOwe = myNet < 0 ? Math.abs(myNet) : 0;

  /* ---------------- FILTER STATE ---------------- */
  const [search, setSearch] = useState("");
  const [payerFilter, setPayerFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [amountRange, setAmountRange] = useState({ min: "", max: "" }); // Added Amount Range State

  /* ---------------- FILTER LOGIC ---------------- */
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesText = e.title.toLowerCase().includes(search.toLowerCase());
      const matchesPayer = payerFilter === "all" || e.payerId === payerFilter;
      const matchesDate = (!dateRange.start || e.date >= dateRange.start) &&
        (!dateRange.end || e.date <= dateRange.end);
      
      const expAmt = Number(e.amount);
      const matchesAmount = (!amountRange.min || expAmt >= Number(amountRange.min)) &&
                            (!amountRange.max || expAmt <= Number(amountRange.max));

      return matchesText && matchesPayer && matchesDate && matchesAmount;
    });
  }, [expenses, search, payerFilter, dateRange, amountRange]);

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.glowOrb1}></div>

      <div style={styles.container}>
        
        {/* 1. TOP-LEVEL BACK NAVIGATION */}
        <div style={{ marginBottom: "20px" }}>
           <button style={styles.backLink} onClick={() => setView("home")}>
             ← Back to Groups
           </button>
        </div>

        {/* 2. MAIN HEADER */}
        <div style={styles.navBar}>
          <div>
            <h2 style={styles.groupMainName}>{group.name}</h2>
            <span style={styles.memberBadge}>Dashboard Overview</span>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => setView("expenses")} style={styles.dashBtn}>Manage Bills</button>
            <button onClick={() => setView("settlements")} style={styles.secondaryBtn}>Settlements</button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div style={styles.summaryGrid}>
          <div style={styles.glassCardSmall}>
            <span style={styles.miniLabel}>Total Spent</span>
            <div style={styles.heroValue}>₹{totalSpent.toLocaleString()}</div>
          </div>
          <div style={styles.glassCardSmall}>
            <span style={styles.miniLabel}>You Receive</span>
            <div style={{ ...styles.heroValue, color: "#818cf8" }}>₹{youGet.toLocaleString()}</div>
          </div>
          <div style={styles.glassCardSmall}>
            <span style={styles.miniLabel}>You Owe</span>
            <div style={{ ...styles.heroValue, color: "#ef4444" }}>₹{youOwe.toLocaleString()}</div>
          </div>
        </div>

        <div style={styles.mainGrid}>
          {/* LEDGER COLUMN */}
          <div style={styles.formSide}>
            <div style={styles.glassCard}>
              <h3 style={styles.cardHeader}>Balance Ledger</h3>
              <div style={styles.listScroll}>
                {Object.values(balances).map((b) => (
                  <div key={b.id} style={styles.ledgerRow}>
                    <div>
                      <div style={styles.nameText}>
                        {b.name} {b.id === user.uid && <span style={styles.youBadge}>YOU</span>}
                      </div>
                      <div style={styles.subText}>Paid ₹{b.paid} • Share ₹{b.owes}</div>
                    </div>
                    <div style={{
                      fontWeight: "800",
                      color: b.net > 0 ? "#818cf8" : b.net < 0 ? "#ef4444" : "#444"
                    }}>
                      {b.net > 0 ? `+₹${b.net}` : b.net < 0 ? `-₹${Math.abs(b.net)}` : "Settled"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* HISTORY COLUMN */}
          <div style={styles.historySide}>
            <div style={styles.historyHeader}>
              <h4 style={styles.historyTitle}>Recent Activity</h4>
              <span style={styles.countBadge}>{filteredExpenses.length} records</span>
            </div>

            {/* UPDATED FILTER UI WITH AMOUNT RANGE */}
            <div style={styles.filterBox}>
              <input
                style={styles.filterSearch}
                placeholder="Search title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              
              <div style={styles.filterRow}>
                <select style={styles.filterSelect} value={payerFilter} onChange={(e) => setPayerFilter(e.target.value)}>
                  <option value="all">All Payers</option>
                  {group.participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input style={styles.filterSelect} type="date" onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
              </div>

              {/* Amount Range Row */}
              <div style={styles.filterRow}>
                <input 
                  style={styles.filterSelect} 
                  type="number" 
                  placeholder="Min ₹" 
                  value={amountRange.min}
                  onChange={(e) => setAmountRange({...amountRange, min: e.target.value})}
                />
                <input 
                  style={styles.filterSelect} 
                  type="number" 
                  placeholder="Max ₹" 
                  value={amountRange.max}
                  onChange={(e) => setAmountRange({...amountRange, max: e.target.value})}
                />
              </div>
            </div>

            <div style={styles.expenseScroll}>
              {filteredExpenses.map((exp) => (
                <div key={exp.id} style={styles.historyCard}>
                  <div style={styles.historyTop}>
                    <span style={styles.expTitle}>{exp.title}</span>
                    <span style={styles.expPrice}>₹{exp.amount}</span>
                  </div>
                  <div style={styles.historyBottom}>
                    <span style={styles.expMeta}>{exp.date} • {group.participants.find(p => p.id === exp.payerId)?.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= STYLES ================= */
const styles = {
  pageWrapper: { minHeight: "100vh", background: "#050505", color: "#fff", position: "relative", fontFamily: "'Inter', sans-serif", overflowX: "hidden" },
  glowOrb1: { position: "absolute", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)", top: "-100px", right: "-100px", zIndex: 0 },
  container: { maxWidth: "1100px", margin: "auto", padding: "40px 20px", position: "relative", zIndex: 1 },

  navBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" },
  
  backLink: { 
    background: "rgba(255,255,255,0.03)", 
    border: "1px solid #222", 
    color: "#64748b", 
    cursor: "pointer", 
    fontWeight: "600", 
    fontSize: "12px",
    padding: "6px 14px",
    borderRadius: "8px",
    transition: "all 0.2s",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },

  groupMainName: { fontSize: "28px", fontWeight: "800", margin: 0 },
  memberBadge: { fontSize: "11px", color: "#818cf8", background: "rgba(99, 102, 241, 0.1)", padding: "4px 12px", borderRadius: "20px" },

  dashBtn: { background: "#fff", color: "#000", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" },
  secondaryBtn: { background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid #222", padding: "10px 20px", borderRadius: "10px", fontWeight: "600", cursor: "pointer" },

  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "40px" },
  glassCardSmall: { background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "20px", padding: "20px", backdropFilter: "blur(10px)" },
  heroValue: { fontSize: "28px", fontWeight: "800", marginTop: "10px" },

  mainGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "start" },
  formSide: {},
  glassCard: { background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "24px", padding: "30px" },
  cardHeader: { fontSize: "18px", fontWeight: "700", marginBottom: "25px" },

  listScroll: { display: "flex", flexDirection: "column", gap: "15px" },
  ledgerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "15px", borderBottom: "1px solid #111" },
  nameText: { fontWeight: "700", fontSize: "15px", display: "flex", alignItems: "center", gap: "10px" },
  youBadge: { fontSize: "9px", background: "#818cf8", padding: "2px 6px", borderRadius: "4px", color: "#000", fontWeight: "900" },

  historySide: {},
  historyHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
  historyTitle: { fontSize: "14px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" },
  countBadge: { fontSize: "10px", background: "#222", padding: "2px 8px", borderRadius: "10px", color: "#64748b" },

  filterBox: { background: "rgba(255,255,255,0.02)", padding: "15px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" },
  filterSearch: { background: "rgba(0,0,0,0.2)", border: "1px solid #222", padding: "10px", borderRadius: "8px", color: "#fff", outline: "none", fontSize: "14px" },
  filterRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  filterSelect: { background: "rgba(0,0,0,0.2)", border: "1px solid #222", padding: "8px", borderRadius: "8px", color: "#64748b", fontSize: "12px", outline: "none" },

  expenseScroll: { display: "flex", flexDirection: "column", gap: "12px", maxHeight: "400px", overflowY: "auto" },
  historyCard: { background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", padding: "18px", borderRadius: "16px" },
  historyTop: { display: "flex", justifyContent: "space-between", marginBottom: "8px" },
  expTitle: { fontWeight: "700", fontSize: "15px" },
  expPrice: { fontWeight: "800" },
  historyBottom: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  expMeta: { fontSize: "11px", color: "#64748b" },
  miniLabel: { fontSize: "10px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" },
  subText: { fontSize: "12px", color: "#444" }
};

export default Dashboard;