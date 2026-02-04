import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";

import { auth, db } from "./firebase";

import Header from "./components/Header";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import AddGroup from "./pages/AddGroup";
import Expenses from "./pages/Expenses";
import Dashboard from "./pages/Dashboard";
import Settlements from "./pages/Settlements";

const App = () => {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("login");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        // Check if email is verified
        if (u.emailVerified) {
          setUser(u);
          setView("home");
        } else {
          // If email is not verified, sign them out and keep them on login
          setUser(null);
          setView("login");
          setGroups([]);
          setSelectedGroup(null);
          setExpenses([]);
          
        }
      } else {
        setUser(null);
        setView("login");
        setGroups([]);
        setSelectedGroup(null);
        setExpenses([]);
      }
    });

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "groups"),
      where("participantEmails", "array-contains", user.email)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userGroups = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setGroups(userGroups);
    });

    return () => unsubscribe();
  }, [user]);

  // 🔑 AUTH SCREENS
  if (!user) {
    return view === "login" ? (
      <Login setView={setView} />
    ) : (
      <Signup setView={setView} />
    );
  }

  // 🧭 MAIN APP
  return (
    <>
      <Header user={user} />

      {view === "home" && (
        <Home
          user={user}
          groups={groups}
          expenses={expenses}
          setView={setView}
          setSelectedGroup={setSelectedGroup}
        />
      )}

      {view === "add-group" && (
        <AddGroup
          user={user}
          selectedGroup={selectedGroup}
          setView={setView}
        />
      )}

      {view === "expenses" && selectedGroup && (
        <Expenses
          group={selectedGroup}
          user={user}
          setView={setView}
          setExpenses={setExpenses}
        />
      )}

      {view === "dashboard" && selectedGroup && (
        <Dashboard
          group={selectedGroup}
          expenses={expenses}
          user={user}
          setView={setView}
        />
      )}

      {view === "settlements" && selectedGroup && (
        <Settlements
          group={selectedGroup}
          expenses={expenses}
          setView={setView}
        />
      )}
    </>
  );
};

export default App;