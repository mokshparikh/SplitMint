import {
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  collection,
} from "firebase/firestore";
import { db } from "../firebase";

// Remove participant with cascade handling
export const removeParticipantCascade = async (
  group,
  participantId,
  expenses
) => {
  const batch = writeBatch(db);

  // 1️⃣ Handle expenses
  expenses.forEach((exp) => {
    // If participant is payer → delete expense
    if (exp.payerId === participantId) {
      batch.delete(doc(db, "expenses", exp.id));
      return;
    }

    // Else remove participant from splits
    const newSplits = exp.splits?.filter(
      (s) => s.participantId !== participantId
    );

    if (newSplits?.length !== exp.splits?.length) {
      batch.update(doc(db, "expenses", exp.id), {
        splits: newSplits,
      });
    }
  });

  // 2️⃣ Remove participant from group
  const updatedParticipants = group.participants.filter(
    (p) => p.id !== participantId
  );

  batch.update(doc(db, "groups", group.id), {
    participants: updatedParticipants,
  });

  await batch.commit();
};
