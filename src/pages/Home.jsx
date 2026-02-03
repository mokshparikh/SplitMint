import React, { useState } from "react";
import { deleteGroupCascade } from "../utils/groupUtils";
import { calculateGroupTotal } from "../utils/groupSummary";

const Home = ({ user, groups, expenses, setView, setSelectedGroup }) => {
  // --- New State for Custom Popup ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);

  const handleEdit = (e, group) => {
    e.stopPropagation();
    setSelectedGroup(group);
    setView("add-group");
  };

  // Triggered when clicking the trash icon
  const openDeleteModal = (e, group) => {
    e.stopPropagation();
    setGroupToDelete(group);
    setShowDeleteModal(true);
  };

  // Final execution of delete
  const confirmDelete = async () => {
    if (groupToDelete) {
      await deleteGroupCascade(groupToDelete.id);
      setShowDeleteModal(false);
      setGroupToDelete(null);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.glowOrb1}></div>
      <div style={styles.glowOrb2}></div>

      {/* --- PREMIUM DELETE POPUP --- */}
      {showDeleteModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.warningIcon}>⚠️</div>
            <h3 style={styles.modalTitle}>Delete Group?</h3>
            <p style={styles.modalText}>
              Are you sure you want to delete <strong>"{groupToDelete?.name}"</strong>?
              This will permanently remove all associated expenses.
            </p>
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowDeleteModal(false)}>
                Go Back
              </button>
              <button style={styles.confirmBtn} onClick={confirmDelete}>
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.container}>
        <header style={styles.header}>
          <h2 style={styles.welcome}>Welcome, {user?.displayName?.split(" ")[0] || "User"} 👋</h2>
          <p style={styles.subtitle}>Track your shared expenses with style.</p>
        </header>

        <button style={styles.createBtn} onClick={() => { setSelectedGroup(null); setView("add-group"); }}>
          <span style={{ fontSize: "20px" }}>+</span> Create New Group
        </button>

        <div style={styles.grid}>
          {groups.map((group) => {
            const total = calculateGroupTotal(Array.isArray(expenses) ? expenses : [], group.id);
            return (
              <div key={group.id} style={styles.card} onClick={() => { setSelectedGroup(group); setView("expenses"); }}>
                <div style={styles.cardHeader}>
                  <div style={styles.groupMeta}>
                    <h3 style={styles.groupName}>{group.name}</h3>
                    <p style={styles.members}>{group.participants?.length || 0} members</p>
                  </div>
                  <div style={styles.actionIcons}>
                    <button style={styles.iconBtn} onClick={(e) => handleEdit(e, group)}>⚙️</button>
                    <button style={{ ...styles.iconBtn, color: '#ef4444' }} onClick={(e) => openDeleteModal(e, group)}>🗑</button>
                  </div>
                </div>

                <div style={styles.summaryBox}>
                  <span style={styles.summaryLabel}>Total Spent</span>
                  <strong style={styles.summaryAmount}>₹ {total.toFixed(2)}</strong>
                </div>

                <div style={styles.footerRow}>
                  <div style={styles.avatarRow}>
                    {group.participants?.slice(0, 4).map((p, i) => (
                      <div key={p.id || i} title={p.name} style={{ ...styles.avatar, background: p.color || "#333", marginLeft: i === 0 ? 0 : "-10px", zIndex: 10 - i }}>
                        {p.name[0].toUpperCase()}
                      </div>
                    ))}
                  </div>
                  <span style={styles.link}>Open Dashboard →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const styles = {
  // ... (keep previous styles and add these below)
  pageWrapper: { minHeight: "100vh", background: "#050505", color: "#fff", position: "relative", overflowX: "hidden", fontFamily: "'Inter', sans-serif" },
  glowOrb1: { position: "absolute", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)", top: "-100px", right: "-100px", zIndex: 0 },
  glowOrb2: { position: "absolute", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(45, 212, 191, 0.05) 0%, transparent 70%)", bottom: "-100px", left: "-100px", zIndex: 0 },
  container: { maxWidth: "1100px", margin: "auto", padding: "60px 20px", position: "relative", zIndex: 1 },
  header: { marginBottom: "40px" },
  welcome: { fontSize: "36px", fontWeight: 800, letterSpacing: "-1.5px", margin: "0 0 10px 0" },
  subtitle: { color: "#94a3b8", fontSize: "16px" },
  createBtn: { background: "#fff", color: "#000", padding: "16px 28px", borderRadius: "14px", border: "none", fontWeight: "800", fontSize: "15px", cursor: "pointer", marginBottom: "50px", display: "flex", alignItems: "center", gap: "10px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px, 1fr))", gap: "25px" },
  card: { padding: "26px", borderRadius: "24px", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", transition: "all 0.3s ease" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" },
  groupName: { fontSize: "19px", fontWeight: "750", margin: "0 0 4px 0" },
  members: { color: "#64748b", fontSize: "13px", margin: 0 },
  actionIcons: { display: "flex", gap: "8px" },
  iconBtn: { background: "rgba(255,255,255,0.05)", border: "none", padding: "8px", borderRadius: "10px", cursor: "pointer" },
  summaryBox: { background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "16px", display: "flex", justifyContent: "space-between", marginBottom: "24px" },
  summaryLabel: { color: "#94a3b8", fontSize: "12px", fontWeight: "600" },
  summaryAmount: { color: "#fff", fontSize: "17px", fontWeight: "800" },
  footerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "18px" },
  avatarRow: { display: "flex", alignItems: "center" },
  avatar: { width: "30px", height: "30px", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", border: "2px solid #050505" },
  link: { color: "#6366f1", fontWeight: "700", fontSize: "13px" },

  // --- POPUP MODAL STYLES ---
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalContent: { background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.1)", padding: "40px", borderRadius: "30px", maxWidth: "400px", width: "90%", textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" },
  warningIcon: { fontSize: "40px", marginBottom: "20px" },
  modalTitle: { fontSize: "24px", fontWeight: "800", marginBottom: "12px" },
  modalText: { color: "#94a3b8", fontSize: "15px", lineHeight: "1.6", marginBottom: "30px" },
  modalActions: { display: "flex", flexDirection: "column", gap: "12px" },
  confirmBtn: { background: "#ef4444", color: "#fff", padding: "14px", borderRadius: "14px", border: "none", fontWeight: "700", cursor: "pointer" },
  cancelBtn: { background: "transparent", color: "#94a3b8", padding: "14px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", fontWeight: "600", cursor: "pointer" }
};

export default Home;