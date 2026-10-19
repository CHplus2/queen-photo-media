# Ordering and reporting release

This change is not a Firebase deployment. Prepare Firebase before deploying the web build; the old application must not be paired with the new rules.

1. Back up the existing Firestore database and inspect its orders. Old demonstration records and records incorrectly marked paid need manual reconciliation against receipts; this release intentionally does not delete or relabel them.
2. Enable Anonymous sign-in in Firebase Authentication. Customers use an anonymous Firebase identity without a registration screen. Tracking is limited to that identity/browser. Clearing browser data or switching devices requires studio assistance; phone numbers are not an access credential.
3. Create employee accounts using Firebase Authentication administration. In a trusted Admin SDK environment, assign the custom claim `staff: true` to authorized employee UIDs, preserving any existing claims. Do not put Admin SDK credentials in this frontend. Employees must sign out and in after claim changes. Public account creation and hardcoded fallback passwords no longer grant staff access. Legacy browser TOTP has been removed because it did not enforce MFA; configure Firebase-supported MFA separately if required.
4. Deploy `firestore.rules` to the named database in `firebase-applet-config.json`, using the Firebase console or an authorized Firebase CLI configuration. Confirm the database ID; do not accidentally deploy only to `(default)`. Rules permit public service reads, anonymous-owner order creation/reads, staff order workflow/payment changes, and owner-only pricing/settings/material configuration. Assign owner:true as described in STAFF_WORKFLOW.md before deploying these rules. The new cash_closings collection also requires these rules. The browser no longer reads every customer's orders.
5. Set the public build variable `VITE_STUDIO_WHATSAPP` to the studio's real international phone number (digits only). If omitted, WhatsApp opens a share/recipient chooser. No number has been invented. Set authorized Firebase Authentication domains for the actual deployment.
6. Run `bun install --frozen-lockfile` (Bun 1.4.3), `npm test`, `npm run lint`, and `npm run build`. Deploy the build together with the rules/auth configuration. Test an unpaid online order, staff confirmation of actual payment, a walk-in purchase, cancellation, and cross-device customer-data isolation using test accounts before accepting real orders.

## Behavior

Service options lead to one cart and one checkout. Customers can use defaults or reveal optional customization. Complex edits, banners, and studio sessions also offer WhatsApp consultation. Original photo files are explicitly sent through WhatsApp; the interface does not pretend to upload files. Full-resolution base64 files are no longer put into browser storage or Firestore documents. Private Firebase Storage upload, multi-file mapping, and retention are future work.

An online submission is an unpaid request pending staff confirmation, not verified payment or a confirmed studio time slot. QRIS/bank selection does not establish payment. Previously embedded unverified QRIS payload and bank details were removed; staff sends verified payment instructions after checking the request. Staff must verify prices, original photos, schedule and payment before production. Payment gateway webhooks and authoritative server-side pricing are not implemented. Do not automate fulfillment from customer-supplied totals. Rules prevent customers from marking orders paid or updating other customers' records, but are not an anti-spam or full financial-validation backend.

Checkout returns success only after Firestore acknowledges the write, preserves the cart on failure, and uses UUID document IDs. Stock is not consumed by unverified online requests. Staff workflows now use shared inventory transactions and a private movement record. Configure measured balances and per-service material usage before relying on deductions; see STAFF_WORKFLOW.md. Unknown usage is flagged rather than guessed. Cancellation replaces deletion to preserve the sales record.

Monthly reports use paid, non-cancelled orders created within the current WIB month. This is a sales-by-order-date view, not cash accounting by payment date. Delivery fees are excluded and discounts allocated proportionately in category totals. Gross profit is estimated before rent, wages and other operating expenses. Deposits and partial payments retain individual receipt records; refunds still require manual review. See STAFF_WORKFLOW.md for payment-day reporting.

Production images are imported through Vite so they are included in builds. The customer-research page shows actual survey responses and an explicit empty state; it does not infer local demand without data.

## Validation

Automated sales tests cover unpaid/cancelled exclusions, WIB month boundaries, discounted revenue, delivery costs, and WhatsApp daily recap consistency. Browser checks use intercepted external requests and do not submit production records. Firestore emulator validation requires downloading Google's emulator artifact; if network policy blocks it, rules authorization tests must be completed in an environment with that access before deployment.

The browser smoke script is `tests/browser-smoke.mjs`. Install Playwright in your development tooling, start the Vite server on port 3000, and run `node tests/browser-smoke.mjs`. `PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` can select existing installations. It intercepts external requests, so it does not write to production Firebase.

The current staff update and configuration steps are documented in [STAFF_WORKFLOW.md](STAFF_WORKFLOW.md). The supervision view distinguishes payment-date receipts from order-date sales. It does not implement bank reconciliation or automated refunds.

## Security and loading follow-up

See [SECURITY_PERFORMANCE_REVIEW.md](SECURITY_PERFORMANCE_REVIEW.md) for fixes, measured asset reductions, remaining backend/accounting risks and the updated rule-publication step. Existing owner claims remain valid; no new account setup is required.
