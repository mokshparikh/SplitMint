import React, { useEffect, useState, useMemo } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const Expenses = ({ group, user, setView, setExpenses: setAppExpenses }) => {
  const participants = group.participants;

  // --- FORM STATE ---
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [payerId, setPayerId] = useState(user.uid);
  const [splitMode, setSplitMode] = useState("equal");
  const [selectedParticipants, setSelectedParticipants] = useState(participants.map((p) => p.id));
  const [splits, setSplits] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // --- UPDATED FILTER STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterParticipant, setFilterParticipant] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState({ start: "", end: "" }); // Added Range
  const [filterAmountRange, setFilterAmountRange] = useState({ min: "", max: "" }); // Added Range

  // 🔄 LOAD EXPENSES
  useEffect(() => {
    const q = query(collection(db, "expenses"), where("groupId", "==", group.id));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const sorted = data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
      setExpenses(sorted);
      setAppExpenses?.(sorted);
    });
    return () => unsub();
  }, [group.id, setAppExpenses]);

  // 🧮 AUTO SPLIT LOGIC
  useEffect(() => {
    if (!amount || Number(amount) <= 0 || selectedParticipants.length === 0) return;
    const total = Number(amount);
    if (splitMode === "equal") {
      const count = selectedParticipants.length;
      const per = Math.floor((total / count) * 100) / 100;
      const remainder = Number((total - per * count).toFixed(2));
      setSplits(selectedParticipants.map((pid, i) => ({
        participantId: pid,
        amount: i === 0 ? per + remainder : per,
      })));
    }
    if (splitMode !== "equal" && !editingId) {
      setSplits(selectedParticipants.map((pid) => ({ participantId: pid, amount: 0, percentage: 0 })));
    }
  }, [amount, splitMode, selectedParticipants, editingId]);

  // 🎛️ UPDATED FILTER LOGIC (Supports Range & Amount)
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesParticipant = filterParticipant === "all" || exp.payerId === filterParticipant;

      // Date Range Logic
      const expDate = exp.date; // "YYYY-MM-DD"
      const matchesDate =
        (!filterDateRange.start || expDate >= filterDateRange.start) &&
        (!filterDateRange.end || expDate <= filterDateRange.end);

      // Amount Range Logic
      const expAmt = Number(exp.amount);
      const matchesAmount =
        (!filterAmountRange.min || expAmt >= Number(filterAmountRange.min)) &&
        (!filterAmountRange.max || expAmt <= Number(filterAmountRange.max));

      return matchesSearch && matchesParticipant && matchesDate && matchesAmount;
    });
  }, [expenses, searchQuery, filterParticipant, filterDateRange, filterAmountRange]);

  // 💾 SAVE ACTION
  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!title || numAmount <= 0 || selectedParticipants.length === 0) return alert("Please fill all details");

    const finalSplits = splitMode === "percentage"
      ? splits.map((s) => ({ participantId: s.participantId, amount: Number(((numAmount * s.percentage) / 100).toFixed(2)) }))
      : splits;

    const expenseData = { title, amount: numAmount, date, groupId: group.id, payerId, splitMode, splits: finalSplits, updatedAt: Timestamp.now() };

    if (editingId) { await updateDoc(doc(db, "expenses", editingId), expenseData); }
    else { await addDoc(collection(db, "expenses"), { ...expenseData, createdAt: Timestamp.now() }); }
    resetForm();
  };

  const resetForm = () => {
    setTitle(""); setAmount(""); setEditingId(null);
    setSplitMode("equal"); setPayerId(user.uid);
    setSelectedParticipants(participants.map((p) => p.id));
  };

  const handleEdit = (exp) => {
    setEditingId(exp.id); setTitle(exp.title); setAmount(exp.amount);
    setDate(exp.date); setSplitMode(exp.splitMode); setPayerId(exp.payerId);
    setSplits(exp.splits); setSelectedParticipants(exp.splits.map((s) => s.participantId));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.glowOrb1}></div>
      <div style={styles.container}>

        <div style={styles.navBar}>
          <button style={styles.backLink} onClick={() => setView("home")}>← Back</button>
          <div style={styles.groupInfoTitle}>
            <h2 style={styles.groupMainName}>{group.name}</h2>
            <span style={styles.memberBadge}>{participants.length} Members</span>
          </div>
          {/* <button style={styles.dashBtn} onClick={() => setView("settlements")}>Summary</button> */}
<div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
  <button
    style={styles.dashBtn}
    onClick={() => setView("dashboard")}
  >
    📊 Dashboard
  </button>

  <button
    style={styles.secondaryBtn}
    onClick={() => setView("settlements")}
  >
    🔁 Settlements
  </button>
</div>


        </div>

        <div style={styles.mainGrid}>

          <div style={styles.formSide}>
            <div style={styles.glassCard}>
              <h3 style={styles.cardHeader}>{editingId ? "✏️ Edit Bill" : "➕ New Bill"}</h3>
              <form onSubmit={handleSubmit} style={styles.formLayout}>
                <input style={styles.heroInput} placeholder="What was this for?" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <div style={styles.inputRow}>
                  <div style={styles.inputStack}>
                    <label style={styles.miniLabel}>Amount</label>
                    <input style={styles.subInput} type="number" placeholder="₹ 0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                  </div>
                  <div style={styles.inputStack}>
                    <label style={styles.miniLabel}>Date</label>
                    <input style={styles.subInput} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                </div>

                <div style={styles.inputStack}>
                  <label style={styles.miniLabel}>Who Paid?</label>
                  <select style={styles.selectBox} value={payerId} onChange={(e) => setPayerId(e.target.value)}>
                    {participants.map((p) => <option key={p.id} value={p.id}>{p.id === user.uid ? "You" : p.name}</option>)}
                  </select>
                </div>

                <div style={styles.inputStack}>
                  <label style={styles.miniLabel}>Split with whom?</label>
                  <div style={styles.chipGrid}>
                    {participants.map((p) => (
                      <button type="button" key={p.id} onClick={() => setSelectedParticipants(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id])}
                        style={{ ...styles.chip, background: selectedParticipants.includes(p.id) ? "#6366f1" : "rgba(255,255,255,0.05)", border: selectedParticipants.includes(p.id) ? "1px solid #818cf8" : "1px solid transparent" }}>
                        {p.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={styles.inputStack}>
                  <label style={styles.miniLabel}>Split Strategy</label>
                  <select style={styles.selectBox} value={splitMode} onChange={(e) => setSplitMode(e.target.value)}>
                    <option value="equal">Equal</option>
                    <option value="custom">Manual</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>

                {splitMode !== "equal" && (
                  <div style={styles.customSplitArea}>
                    {splits.map((s) => (
                      <div key={s.participantId} style={styles.splitRow}>
                        <span style={styles.splitName}>{participants.find(p => p.id === s.participantId)?.name}</span>
                        <input style={styles.tinyInput} type="number" value={splitMode === "percentage" ? s.percentage : s.amount}
                          onChange={(e) => setSplits(prev => prev.map(x => x.participantId === s.participantId ? (splitMode === "percentage" ? { ...x, percentage: Number(e.target.value) } : { ...x, amount: Number(e.target.value) }) : x))} />
                      </div>
                    ))}
                  </div>
                )}

                <div style={styles.formFooter}>
                  <button type="submit" style={styles.saveBtn}>{editingId ? "Save Changes" : "Post Expense"}</button>
                  {editingId && <button type="button" onClick={resetForm} style={styles.cancelBtn}>Cancel</button>}
                </div>
              </form>
            </div>
          </div>

          <div style={styles.historySide}>
            <div style={styles.historyHeader}>
              <h4 style={styles.historyTitle}>Activity History</h4>
              <span style={styles.countBadge}>{filteredExpenses.length} bills</span>
            </div>

            {/* EXPANDED FILTER BOX */}
            <div style={styles.filterBox}>
              <input style={styles.filterSearch} placeholder="Search title..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

              <div style={styles.filterRow}>
                <select style={styles.filterSelect} value={filterParticipant} onChange={(e) => setFilterParticipant(e.target.value)}>
                  <option value="all">All Payers</option>
                  {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {/* Date Range Row */}
              <div style={styles.rangeGrid}>
                <div style={styles.inputStack}>
                  <label style={styles.rangeLabel}>From Date</label>
                  <input style={styles.filterSelect} type="date" value={filterDateRange.start} onChange={(e) => setFilterDateRange({ ...filterDateRange, start: e.target.value })} />
                </div>
                <div style={styles.inputStack}>
                  <label style={styles.rangeLabel}>To Date</label>
                  <input style={styles.filterSelect} type="date" value={filterDateRange.end} onChange={(e) => setFilterDateRange({ ...filterDateRange, end: e.target.value })} />
                </div>
              </div>

              {/* Amount Range Row */}
              <div style={styles.rangeGrid}>
                <div style={styles.inputStack}>
                  <label style={styles.rangeLabel}>Min (₹)</label>
                  <input style={styles.filterSelect} type="number" placeholder="0" value={filterAmountRange.min} onChange={(e) => setFilterAmountRange({ ...filterAmountRange, min: e.target.value })} />
                </div>
                <div style={styles.inputStack}>
                  <label style={styles.rangeLabel}>Max (₹)</label>
                  <input style={styles.filterSelect} type="number" placeholder="Max" value={filterAmountRange.max} onChange={(e) => setFilterAmountRange({ ...filterAmountRange, max: e.target.value })} />
                </div>
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
                    <span style={styles.expMeta}>{exp.date} • {participants.find(p => p.id === exp.payerId)?.name || "Member"} paid</span>
                    <div style={styles.expActions}>
                      <button onClick={() => handleEdit(exp)} style={styles.tinyAction}>✏️</button>
                      <button onClick={() => deleteDoc(doc(db, "expenses", exp.id))} style={styles.tinyAction}>🗑️</button>
                    </div>
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

const styles = {
  // ... (all existing styles) ...
  pageWrapper: { minHeight: "100vh", background: "#050505", color: "#fff", position: "relative", fontFamily: "'Inter', sans-serif" },
  glowOrb1: { position: "absolute", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)", top: "-100px", right: "-100px" },
  container: { maxWidth: "1100px", margin: "auto", padding: "40px 20px", position: "relative", zIndex: 1 },
  navBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" },
  backLink: { background: "none", border: "none", color: "#64748b", cursor: "pointer", fontWeight: "600" },
  groupInfoTitle: { textAlign: "center" },
  groupMainName: { fontSize: "28px", fontWeight: "800", margin: "0 0 5px 0" },
  memberBadge: { fontSize: "11px", color: "#818cf8", background: "rgba(99, 102, 241, 0.1)", padding: "4px 12px", borderRadius: "20px" },
  dashBtn: { background: "#fff", color: "#000", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" },
  mainGrid: { display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "40px", alignItems: "start" },
  formSide: {},
  glassCard: { background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "24px", padding: "30px", backdropFilter: "blur(10px)" },
  cardHeader: { fontSize: "18px", fontWeight: "700", marginBottom: "25px" },
  formLayout: { display: "flex", flexDirection: "column", gap: "20px" },
  heroInput: { background: "none", border: "none", borderBottom: "2px solid #222", fontSize: "22px", color: "#fff", padding: "10px 0", outline: "none", fontWeight: "600" },
  inputRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  inputStack: { display: "flex", flexDirection: "column", gap: "8px" },
  miniLabel: { fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" },
  subInput: { background: "rgba(255,255,255,0.03)", border: "1px solid #222", borderRadius: "10px", padding: "12px", color: "#fff", outline: "none" },
  selectBox: { background: "rgba(255,255,255,0.03)", border: "1px solid #222", borderRadius: "10px", padding: "12px", color: "#fff", outline: "none" },
  chipGrid: { display: "flex", flexWrap: "wrap", gap: "8px" },
  chip: { padding: "8px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: "600", color: "#fff", cursor: "pointer", transition: "0.2s" },
  customSplitArea: { background: "rgba(0,0,0,0.2)", padding: "15px", borderRadius: "12px" },
  splitRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  tinyInput: { width: "70px", background: "#111", border: "1px solid #333", borderRadius: "6px", color: "#fff", padding: "5px", textAlign: "right" },
  formFooter: { display: "flex", gap: "10px", marginTop: "10px" },
  saveBtn: { flex: 1, background: "#6366f1", border: "none", padding: "15px", borderRadius: "12px", color: "#fff", fontWeight: "700", cursor: "pointer" },
  cancelBtn: { padding: "15px", border: "1px solid #333", background: "none", color: "#64748b", borderRadius: "12px", cursor: "pointer" },
  historySide: {},
  historyHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
  historyTitle: { fontSize: "14px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" },
  countBadge: { fontSize: "10px", background: "#222", padding: "2px 8px", borderRadius: "10px", color: "#64748b" },

  // --- ADDED FILTER STYLES ---
  filterBox: { background: "rgba(255,255,255,0.02)", padding: "15px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" },
  filterSearch: { background: "rgba(0,0,0,0.2)", border: "1px solid #333", padding: "10px", borderRadius: "8px", color: "#fff", outline: "none", fontSize: "14px" },
  filterRow: { display: "flex", gap: "10px" },
  filterSelect: { flex: 1, background: "rgba(0,0,0,0.2)", border: "1px solid #333", padding: "8px", borderRadius: "8px", color: "#64748b", fontSize: "12px", outline: "none" },
  rangeGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  rangeLabel: { fontSize: "9px", color: "#444", textTransform: "uppercase", fontWeight: "700", marginBottom: "2px" },

  expenseScroll: { display: "flex", flexDirection: "column", gap: "12px", maxHeight: "600px", overflowY: "auto" },
  historyCard: { background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", padding: "20px", borderRadius: "16px" },
  historyTop: { display: "flex", justifyContent: "space-between", marginBottom: "10px" },
  expTitle: { fontWeight: "700", fontSize: "16px" },
  expPrice: { fontWeight: "800", color: "#fff" },
  historyBottom: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  expMeta: { fontSize: "12px", color: "#64748b" },
  expActions: { display: "flex", gap: "10px" },
  tinyAction: { background: "none", border: "none", cursor: "pointer", fontSize: "14px", opacity: 0.6 },
  dashBtn: { 
    background: "#fff", 
    color: "#000", 
    border: "none", 
    padding: "10px 20px", 
    borderRadius: "10px", 
    fontWeight: "700", 
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "transform 0.2s ease",
    fontSize: "14px"
  },
  secondaryBtn: { 
    background: "rgba(255, 255, 255, 0.05)", 
    color: "#fff", 
    border: "1px solid #222", 
    padding: "10px 20px", 
    borderRadius: "10px", 
    fontWeight: "600", 
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    transition: "background 0.2s ease"
  },
};

export default Expenses;