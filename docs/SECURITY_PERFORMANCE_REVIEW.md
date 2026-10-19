# Security and performance review — 2026-10-19

## Fixed in this release

- **Unverified website requests could contaminate payment summaries.** A customer could submit a `payments` array despite the order still being unpaid. Read normalization, `paidAmount` and receipt summaries now ignore customer-controlled verification metadata on initial online requests. New rules reject payment/staff/inventory audit fields on those requests. Existing malformed records are not edited or deleted: the UI identifies their document IDs, warns that totals are incomplete, and disables cash closing until reviewed.
- **Private survey results were cached in localStorage.** That cache is removed and cleared on startup. Survey subscriptions now run only in the owner's research view, with owner-only read permissions in the new rules. Staff email comes from Firebase rather than a browser-local/default account. Orders/private state are cleared on authentication changes and successful logout. A failed sign-out remains visible as a failure, rather than pretending the Firebase session ended.
- **Legacy browser TOTP was not Firebase-enforced MFA.** The unused generator, known default secret, emergency bypass, shared admin-profile subscription and local secret cache were removed. This does not enroll real MFA or change the user's existing Firebase password. `admins` and test documents are owner-only in the new rules. Owners can remove obsolete TOTP fields from the old admin document after backing it up; this release does not silently modify production data.
- **Stale authentication callbacks could restore an old UI role.** Authentication now observes token changes, clears private state, and rejects delayed results after an account switch/logout. Password-reset messages no longer identify whether an email exists. Enable Firebase email-enumeration protection in Authentication settings too; neutral application text alone cannot change Firebase API behavior.
- **Browser protections were absent from repository configuration.** `vercel.json` supplies CSP, anti-framing, MIME-sniffing prevention, referrer and permission policies. The CSP permits the Firebase project auth iframe, required Google API connections, local code, and images/fonts. It blocks arbitrary scripts, object embeds and third-party framing. Inline styles remain permitted because the application uses dynamic styles. Test deployment login before relying on the policy; Vercel applies these headers, Vite development does not.
- **Dependency advisory.** The lockfile had a high-severity `@grpc/grpc-js` advisory (GHSA-m9gg-hp2v-232j; vulnerable below 1.13.6). A transitive override resolves 1.14.6. This package is on the Node dependency path; the application uses Firebase's browser transport. The browser TOTP package and unused AI/server/animation dependencies were removed. The package audit reported no advisories afterward; this is not a guarantee against undisclosed issues.

## Measured loading improvements

The five referenced illustration assets fell from 4,215,475 bytes of JPEG to 647,622 bytes of WebP, about **85% smaller**. Original source images remain in the repository; the build references the optimized assets. Their visual contents were not regenerated.

The main production JS chunk dropped from roughly 1,056 kB / 308 kB gzip to 864 kB / 262 kB gzip. Staff pages, reports and ordering dialogs have separate chunks. A production browser test verifies that a customer homepage does not request staff page chunks, and ordering chunks arrive only when needed. Dialogs stay mounted after their first use so closing a form does not discard the existing in-session inputs. Loading failures have a recoverable screen rather than a blank page.

Stock movement history subscribes only in the owner's Inventory view and requests the newest 250 documents ordered by timestamp. Private ORDER_STATE documents lack that field and are excluded by the query. Older history remains in Firestore; the UI labels the 250-record scope. Inventory readiness distinguishes server-confirmed snapshots from cached values. The full order subscription is deliberately unchanged so monthly/historical reports are not silently truncated.

These are build/transfer measurements, not measured LCP or performance on a real shop phone. The Firebase SDK remains a large part of initial JavaScript.

## Remaining priorities

1. **Move authoritative financial and inventory writes to a trusted backend.** Existing cashier permissions still allow direct payment/status, balance and stock-state writes. UI validation and transactions protect against routine mistakes and collisions, not a malicious authorized employee. A backend should derive prices/recipes, validate receipt transitions, enforce append-only audit records, and use server timestamps. Admin credentials belong in server-managed secrets, never in the frontend or GitHub.
2. **Bound order reads without losing report completeness.** The current subscription loads all shop orders. Introduce date-range report queries, a separate active-job query, pagination and server-maintained summaries together. A simple `limit()` on the existing subscription would make totals incomplete.
3. **Add App Check / abuse controls and verified backups.** Anonymous request/survey creation can still be automated; anonymous sign-in is not rate limiting. Configure App Check with a real production registration, test it before enforcement, and plan backup/restore access and retention for customer details. No production App Check, backup or billing configuration was changed here.
4. **Use real Firebase MFA where supported.** Removing legacy TOTP does not provide a second factor. Configure Identity Platform/Firebase-supported MFA, enroll the owner, and implement its sign-in challenge before enforcing MFA. Do not treat a browser-stored secret as account protection.

## Rollout

1. Merge/deploy this commit through the existing Vercel `main` integration. No new secret or owner-claim assignment is needed.
2. Publish the updated `firestore.rules` to the existing named database. The frontend safely ignores forged initial receipt fields even before this, but server rejection, owner-only legacy profiles and private survey access require the new rules. Deploy the matching frontend before or together with the rules because survey submissions now include their authenticated owner UID.
3. Verify owner/cashier login, ordinary sale, deposit/settlement, survey submission, report dates and cash closing using clearly marked test records. No production transactions, account claims, permissions or hosting were modified by the local tests.
4. If invalid order IDs are reported, back up and inspect those exact records. Correct their structure using the actual receipt/order evidence. Do not delete records or invent a zero balance just to clear the warning.

## Verification scope

`npm test`, `npm run lint`, `npm run build` and `bun audit --json`. Browser scripts: `browser-smoke.mjs`, `staff-smoke.mjs`, `auth-smoke.mjs`, `ui-smoke.mjs`, `production-smoke.mjs`; supply Playwright/Chromium paths as in prior release checks. `auth-smoke` uses the real React provider with test-only mocked Firebase transports; `production-smoke` serves the built files with the actual Vercel header configuration so Chromium enforces CSP. Neither writes live data.

Firestore rule changes have been reviewed but not validated against a running emulator or production Firebase in this workspace. Transaction tests use a deterministic store double. These tests do not constitute a penetration test or establish production authorization, bank settlement, or restoration from backup.
