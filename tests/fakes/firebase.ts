export const db = {};
export const auth = {
  currentUser: {
    getIdTokenResult: async () => ({ claims: { owner: true } }),
    uid: 'staff-1',
    email: 'cashier@example.test',
    displayName: 'Test cashier',
  },
};
