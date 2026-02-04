import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const Header = ({ user }) => {
  return (
    <nav style={styles.navBar}>
      <div style={styles.brandSection}>
        <h2 style={styles.brandName}>
          Splitmint<span style={styles.dot}>.</span>
        </h2>
      </div>

      {/* Profile & Logout Section */}
      <div style={styles.userSection}>
        <div style={styles.profileBox}>
          <div style={styles.avatar}>
            {user?.displayName?.charAt(0) || "U"}
          </div>
          <div style={styles.userDetails}>
            <span style={styles.userName}>{user?.displayName || "User"}</span>
            <span style={styles.statusBadge}>Online</span>
          </div>
        </div>
        
        <div style={styles.divider}></div>

        <button
          onClick={() => signOut(auth)}
          style={styles.logoutBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.7";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.background = "transparent";
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

const styles = {
  navBar: {
    padding: "0 40px",
    height: "72px",
    background: "rgba(5, 5, 5, 0.9)",
    backdropFilter: "blur(15px)",
    WebkitBackdropFilter: "blur(15px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  brandSection: {
    display: "flex",
    alignItems: "center",
  },
  brandName: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "800",
    letterSpacing: "-1.2px",
    color: "#ffffff", // Pure White Logo
  },
  dot: {
    color: "#6366f1",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  profileBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "6px 10px",
  },
  avatar: {
    width: "34px",
    height: "34px",
    background: "#ffffff", // Solid white avatar for "Pop" effect
    borderRadius: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "14px",
    fontWeight: "800",
    color: "#000", // Black text on white avatar
    boxShadow: "0 0 15px rgba(255, 255, 255, 0.1)",
  },
  userDetails: {
    display: "flex",
    flexDirection: "column",
  },
  userName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#ffffff", // Pure White Name
    letterSpacing: "0.2px",
  },
  statusBadge: {
    fontSize: "10px",
    color: "#4ade80",
    fontWeight: "600",
    marginTop: "1px",
  },
  divider: {
    width: "1px",
    height: "20px",
    background: "rgba(255, 255, 255, 0.2)",
    margin: "0 8px",
  },
  logoutBtn: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.2)", // Subtle white border
    background: "transparent",
    color: "#ffffff", // Pure White Button Text
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
};

export default Header;