# Repository Quick Reference

## Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State / Auth**: Firebase Auth (client SDK)
- **Routing**: React Router

## Backend
- **Platform**: Firebase Functions (TypeScript)
- **Runtime**: Node.js 20 (v2 modular APIs)
- **Database**: Firestore (rules configured)
- **Auth Triggers**: `onUserCreated`
- **Callable Functions**: `onCall`

## Key Scripts
- **Frontend Dev**: `npm run dev` (in `guestpass/`)
- **Frontend Build**: `npm run build`
- **Functions Build**: `npm run build` (in `functions/`)
- **Functions Deploy**: `firebase deploy --only functions`

## Testing / Linting
- **Lint**: `npm run lint` (frontend)
- Currently no automated test suite.

## Notes
- Admin email gate enforced: `chiunye16@gmail.com`
- Layout component handles auth/redirect logic.
- Home page expects authenticated session when `requireAuth` is passed.
- Invite workflow powered by Firebase callable function + Storage for QR assets.