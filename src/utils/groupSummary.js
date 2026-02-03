export const calculateGroupTotal = (expenses = [], groupId) => {
  return expenses
    .filter((e) => e.groupId === groupId)
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);
};
