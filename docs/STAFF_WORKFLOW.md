# Staff workflow and supervision

## Daily operation

- Kasir opens a multi-item sale. Choose services, adjust quantity/price, choose cash, QRIS or transfer, and save once. Enter cash tendered or tap Uang pas / a denomination to calculate change. Bayar sebagian / DP records the amount actually received and shows the remaining balance. A paid immediate sale defaults to SELESAI. No production-status clicks or customer account are required. Customer name defaults to Pelanggan umum and phone stays empty rather than being invented.
- Selecting QRIS or transfer clears the payment-received checkbox. Check it only after inspecting actual incoming funds in the bank or merchant app. Otherwise the transaction remains unpaid. Deferred or unpaid jobs require a customer name; phone and promised date are optional.
- Dikerjakan / diambil nanti creates a follow-up job. Pesanan has the queue and a history filter. Staff can verify payment, mark work ready, and record handover. Completed but unpaid sales remain in the follow-up queue.
- Saving is guarded against repeated clicks and uses a stable request ID for retry within a persistent, per-account device draft. A changed payload cannot silently reuse an already committed sale ID. Failed saves keep the draft across browser restarts on the same device. This is not an offline sales queue: a sale counts as recorded only after a confirmed database save. Receipts are optional after saving.
- Use separate Firebase accounts for employees. The app records staff UID/name, payment verification time, and order change history. New code reads owner: true in addition to staff: true for supervisor navigation. The updated rules protect service prices, settings, material configuration and order deletion; publish them to enforce these restrictions. Cashiers still read shop totals and write order payment/status, material balances and shared stock state as part of their work. This does not provide tamper-proof financial or inventory accounting against a malicious authorized cashier; that requires a trusted server for those operations.

## Shared inventory

The old browser-local stock engine and automatic example balances were removed. Inventory and logs subscribe to the shared database. Walk-in creation, inventory movements and audit records commit together using Firestore transactions. Competing staff writes retry against the current balance; normal shortages reject rather than being clamped to zero. If a sale has actually happened and the book stock is wrong, expand Stok tidak cocok? on an immediate sale and give a reason. This saves the sale with NEEDS_REVIEW and no material deduction; the owner must reconcile it. If a later physical count already includes that usage, use Saldo fisik sudah mencakup pesanan ini in the order with a count note; this records COUNTED without subtracting stock again. Otherwise correct the balance/recipe and use Catat pemakaian. It never changes a zero stock into fictitious available stock.

Before relying on deductions, open Inventaris:

1. Inspect existing materials and use Cocokkan dengan hitungan fisik to record measured balances and a reason. Pause other production while physically counting. For new materials use Tambah bahan / saldo awal. Do not treat old demonstration values as measured stock.
2. For each service, set either Jasa tanpa bahan fisik or measured materials per one catalog unit/package. Roll usage must use the stock unit (for example meters, not centimeters). Existing recipes are not guessed. Nonstandard sizes and added frames are flagged for review; create separate services when their material usage differs.
3. Test one known service, verify the exact stock reduction, and test cancellation with unused materials before using it throughout the shop.

An immediate walk-in sale consumes configured materials on save. A deferred or website order consumes them when staff marks production/ready/completed, without requiring another printing-start click. An unpaid customer submission does not block stock. Orders with unknown recipes remain saved and show NEEDS_REVIEW, with no partial deductions. After configuring the recipe, use Bahan sudah diatur — catat pemakaian in the order detail. Legacy orders without trustworthy movement records require a physical/manual review; they are not automatically deducted twice.

Cancellation asks for a reason and whether materials are unused. Only recorded unused deductions are restored, exactly once. Used print materials stay consumed as WASTED. This does not issue a bank refund. Cancelled orders cannot be reopened; create a new order for a reprint.

Authoritative order movement state is stored in staff-only stock_logs documents with type ORDER_STATE. It is not trusted from customer-created order fields and is omitted from the visible movement log. Private order state includes verified payment entries. This release also adds cash_closings and revised role permissions: publish the included rules before rollout.

## Remote supervision and payments

Ringkasan toko separates sales by order date from recorded receipts by verification date, in WIB. It shows pending payments, ready jobs, cancellations, refund checks and material exceptions. Gross receipts include shipping and have not had refunds subtracted. They are not a bank balance or a cash-drawer reconciliation. Historical paid orders without paidAt use their order date and are explicitly counted as legacy estimates.

Staff can copy/share the prepared recap to the existing WhatsApp group; the app never sends messages automatically. Deposits and later payments are separate immutable-in-the-UI receipts with amount, method, staff and timestamp. Repeated retries use the same receipt ID; overpayments are rejected. Do not turn bank screenshots into verified receipts. Refund execution, bank reconciliation and receipt-file uploads remain manual/outside this release. Cancelled orders with any received payment are flagged for refund review. Payment proof can be sent through WhatsApp; a screenshot or PDF alone must never mark an order paid. No bank account number, QRIS payload or contact number has been invented. Set VITE_STUDIO_WHATSAPP to the verified studio number to enable direct contact links.

## End-of-day cash

Penjualan hari ini / Ringkasan toko includes Tutup kas for one shared shop drawer per WIB date. Pause transactions, enter opening cash, cash expenses/refunds, and the physically counted cash. The app computes expected cash and difference using that day's recorded cash receipts, including deposits and later settlements. Expenses/refunds entered here are a reconciliation amount, not a second payment or refund transaction. Notes are required for cash out. A closing cannot be overwritten by a cashier; later changed cash receipts flag the snapshot for owner review. Multiple drawers, shifts, formal expense/refund ledgers and automatic bank settlement are not supported.

## Owner access and release order

1. In the trusted Cloud Shell directory where firebase-admin is already installed, copy `scripts/grant-owner.mjs` from this repository. Run `node grant-owner.mjs OWNER_UID owner@example.com` with the actual owner UID and matching email. It preserves existing custom claims, verifies the email, and adds staff:true and owner:true. Never give owner access to ordinary cashier accounts or put Admin SDK credentials in the web project.
2. Publish the updated `firestore.rules` to database `ai-studio-queenphotostudio-009ecc42-7075-40e2-bda1-c76643f190a5` in project `gen-lang-client-0346719757`. Existing staff-only rules do not enforce the new owner restrictions and do not permit cash_closings.
3. Deploy the matching web build. Sign out/in to refresh claims. Confirm the owner sees Pengaturan/Inventaris and a cashier sees Kasir/Pesanan/Penjualan hari ini. Use separate accounts; no shared owner login.
4. With test records, verify a cash sale/change, a cash deposit followed by QRIS settlement, a shortage exception, and a cash closing. Check receipts across two devices before replacing the WhatsApp record.

No live Firebase permissions, claims or hosting have been changed by this code release.

## Validation

Run npm test, npm run lint and npm run build. Tests cover recipes, shortages, transactions/rollback using a deterministic store double, competing sales, retries, restoration/waste, fabricated customer stock fields, payment audit stamps and supervision date handling. They do not establish production Firebase authorization or emulator conformance.

With Vite on port 3000, run tests/staff-smoke.mjs with Playwright tooling. Its context module is replaced only in the test browser; it exercises staff UI without granting real access or writing production records. Customer browser-smoke.mjs and ui-smoke.mjs remain applicable. Verify a test sale against the configured production permissions and measured materials before relying on stock balances operationally.
