import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export const deleteGroupCascade = async (groupId) => {
  const batch = writeBatch(db);

  const q = query(
    collection(db, "expenses"),
    where("groupId", "==", groupId)
  );
  const snap = await getDocs(q);

  snap.forEach((d) => batch.delete(d.ref));

  batch.delete(doc(db, "groups", groupId));

  await batch.commit();
};

export const removeParticipantFromGroup = async (
  groupId,
  participantId,
  fallbackPayerId
) => {
  const batch = writeBatch(db);

  const groupRef = doc(db, "groups", groupId);
  const groupSnap = await getDoc(groupRef);

  if (!groupSnap.exists()) return;

  const group = groupSnap.data();

  if (group.ownerId === participantId) {
    throw new Error("Group owner cannot be removed");
  }

  const updatedParticipants = group.participants.filter(
    (p) => p.id !== participantId
  );

  batch.update(groupRef, {
    participants: updatedParticipants,
  });

  const q = query(
    collection(db, "expenses"),
    where("groupId", "==", groupId)
  );
  const expenseSnap = await getDocs(q);

  expenseSnap.forEach((expDoc) => {
    const exp = expDoc.data();
    const expRef = doc(db, "expenses", expDoc.id);

    const remainingSplits = (exp.splits || []).filter(
      (s) => s.participantId !== participantId
    );

    if (remainingSplits.length <= 1) {
      batch.delete(expRef);
      return;
    }

    let newPayerId = exp.payerId;
    if (exp.payerId === participantId) {
      newPayerId =
        updatedParticipants.find((p) => p.id === fallbackPayerId)?.id ||
        updatedParticipants[0].id;
    }

    if (exp.splitMode === "equal") {
      const total = Number(exp.amount);
      const count = remainingSplits.length;
      const per = Math.floor((total / count) * 100) / 100;
      const remainder = Number((total - per * count).toFixed(2));

      remainingSplits.forEach((s, i) => {
        s.amount = i === 0 ? per + remainder : per;
      });
    }

    batch.update(expRef, {
      payerId: newPayerId,
      splits: remainingSplits,
      updatedAt: new Date(),
    });
  });

  await batch.commit();
};
