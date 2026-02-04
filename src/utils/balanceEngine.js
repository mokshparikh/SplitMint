// expenses: [{ payerId, amount, splits: [{ participantId, amount }] }]
// participants: [{ id, name }]

export const calculateBalances = (expenses = [], participants = []) => {
  const balances = {};

  // Init balances
  participants.forEach((p) => {
    balances[p.id] = {
      id: p.id,
      name: p.name,
      paid: 0,
      owes: 0,
      net: 0,
    };
  });

  // Calculate paid & owes
  expenses.forEach((exp) => {
    if (!balances[exp.payerId]) return;

    balances[exp.payerId].paid += Number(exp.amount || 0);

    (exp.splits || []).forEach((s) => {
      if (balances[s.participantId]) {
        balances[s.participantId].owes += Number(s.amount || 0);
      }
    });
  });

  // Net = paid - owes
  Object.values(balances).forEach((b) => {
    b.net = Number((b.paid - b.owes).toFixed(2));
  });

  return balances;
};

// ===============================
// MINIMAL SETTLEMENT SUGGESTIONS
// ===============================

export const calculateSettlements = (balances) => {
  const creditors = [];
  const debtors = [];
  const settlements = [];

  Object.values(balances).forEach((b) => {
    if (b.net > 0.01) {
      creditors.push({ ...b, amount: b.net });
    } else if (b.net < -0.01) {
      debtors.push({ ...b, amount: Math.abs(b.net) });
    }
  });

  // Sort for optimal matching
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  let i = 0,
    j = 0;

  while (i < creditors.length && j < debtors.length) {
    const pay = Math.min(creditors[i].amount, debtors[j].amount);

    settlements.push({
      from: debtors[j].name,
      to: creditors[i].name,
      amount: Number(pay.toFixed(2)),
    });

    creditors[i].amount -= pay;
    debtors[j].amount -= pay;

    if (creditors[i].amount < 0.01) i++;
    if (debtors[j].amount < 0.01) j++;
  }

  return settlements;
};
