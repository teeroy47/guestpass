# GuestPass Feature Implementation Plan

## Goal
Build a production-ready guest management and check-in workflow that pulls live data from Firestore, includes admin-only invite creation + download/export, and supports synchronized QR-based check-in across multiple usher devices.

## Architecture
- **Firestore collections**
  - `guests`: stores guest profile, invitation and attendance metadata
  - `events`: future-proofing for multiple events, each referencing `guests`
  - `checkins`: historical check-in records (optional aggregate for analytics)
- **Firebase Functions**
  - `createInvite`: Admin-only callable; generates guest invite payload, saves QR assets to Storage, and returns signed URLs/metadata
  - `regenerateInvite`: Admin-only callable; regenerates QR code assets for existing guest
  - `recordCheckIn`: Callable https to toggle guest status atomically and emit real-time notifications (via Firestore listeners)
  - `syncGuest`: HTTP trigger to bulk upsert guests from CSV upload
- **Frontend modules**
  - `useGuests` hook: React Query to fetch and subscribe to `guests`
  - `InviteBuilder` component: Form to create new guest invite, preview, download QR (PNG/PDF)
  - `Scanner` page: Replace mock logic with Firestore/Callable integration + local dedupe
  - `Upload` page: Parse CSV, call backend to save guests, show progress + errors
  - `Guests` page: Fetch real data, filter by status, show QR regenerate/download actions

## Tasks
1. **Data model + Firestore rules**
   - Define TypeScript types for guest/invite/check-in
   - Update security rules to allow admin reads/writes, usher read-only
2. **Backend functions**
   - Implement callable functions with Admin SDK
   - Generate signed QR assets via `qrcode` or `canvas` libs
3. **Frontend data fetching**
   - Replace mock arrays with Firestore queries or callable responses
   - Store state in React Query + context for check-in status
4. **Invite workflow**
   - Admin-only page/section with form (guest name, email, plus optional extras)
   - Generate shareable links, email template, download options (PNG/PDF) using libraries like `pdf-lib`
5. **Check-in synchronization**
   - Real-time updates via Firestore snapshot listener
   - Scanner page updates UI based on backend response
6. **Polish + QA**
   - Loading/error states, skeletons
   - Ensure sign-in guard persists across reloads
   - Add sample environment docs for admin vs usher roles

## Next Steps
- Scaffold Firestore service modules
- Implement guests query + mutation hooks
- Build admin invite creation UI and tests