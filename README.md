# SplitMint

SplitMint is a sleek, Firebase-backed expense splitting app for small groups. Create a group, add expenses, and get clear settlement suggestions so everyone knows who owes whom.

**Highlights**
- Email/password auth with email verification.
- Create groups with up to 4 participants (owner + 3 members).
- Add expenses with equal, manual, or percentage splits.
- Filter expenses by title, payer, date range, and amount range.
- Dashboard with per-member balances and your net position.
- Settlement recommendations to zero out balances quickly.

**Tech Stack**
- React 19 + Vite (Rolldown Vite)
- Firebase Auth + Firestore
- React Router, React Icons

**Getting Started**
1. Install dependencies:
```bash
npm install
```
2. Start the dev server:
```bash
npm run dev
```
3. Open the app at the URL Vite prints in the terminal.

**Firebase Setup**
This project currently uses a Firebase config in `src/firebase.js`. To point it at your own Firebase project:
- Create a Firebase project and enable Email/Password auth.
- Create a Firestore database.
- Replace the config object in `src/firebase.js` with your own values.

**Project Structure**
- `src/App.jsx` app flow and auth gating
- `src/pages/` screens (Home, AddGroup, Expenses, Dashboard, Settlements, Login, Signup)
- `src/utils/` balance and group helpers
- `src/firebase.js` Firebase initialization

**Scripts**
- `npm run dev` start dev server
- `npm run build` build for production
- `npm run preview` preview production build
- `npm run lint` run ESLint

**Notes**
- Currency display is currently INR (₹). Update UI labels if you want another currency.
