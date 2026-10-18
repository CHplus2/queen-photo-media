# Staff workflow and supervision

## Daily operation

- Kasir opens a multi-item sale. Choose services, adjust quantity/price, choose cash, QRIS or transfer, and save once. A paid immediate sale defaults to SELESAI. No production-status clicks or customer account are required. Customer name defaults to Pelanggan umum and phone stays empty rather than being invented.
- Selecting QRIS or transfer clears the payment-received checkbox. Check it only after inspecting actual incoming funds in the bank or merchant app. Otherwise the transaction remains unpaid. Deferred or unpaid jobs require a customer name; phone and promised date are optional.
- Dikerjakan / diambil nanti creates a follow-up job. Pesanan has the queue and a history filter. Staff can verify payment, mark work ready, and record handover. Completed but unpaid sales remain in the follow-up queue.
- Saving is guarded against repeated clicks and uses a stable request ID for retry within a saved session draft. A changed payload cannot silently reuse an already committed sale ID. Failed saves keep the draft. Receipts are optional after saving.
- Use separate Firebase accounts for employees. The app records staff UID/name, payment verification time, and order change history. The current deployed staff claim still authorizes all staff; Ringkasan toko is a supervision view, not a new owner-only security role.

## Shared inventory

The old browser-local stock engine and automatic example balances were removed. Inventory and logs subscribe to the shared database. Walk-in creation, inventory movements and audit records commit together using Firestore transactions. Competing staff writes retry against the current balance; shortages reject rather than being clamped to zero.

Before relying on deductions, open Inventaris:

1. Inspect existing materials and use Cocokkan dengan hitungan fisik to record measured balances and a reason. Pause other production while physically counting. For new materials use Tambah bahan / saldo awal. Do not treat old demonstration values as measured stock.
2. For each service, set either Jasa tanpa bahan fisik or measured materials per one catalog unit/package. Roll usage must use the stock unit (for example meters, not centimeters). Existing recipes are not guessed. Nonstandard sizes and added frames are flagged for review; create separate services when their material usage differs.
3. Test one known service, verify the exact stock reduction, and test cancellation with unused materials before using it throughout the shop.

An immediate walk-in sale consumes configured materials on save. A deferred or website order consumes them when staff marks production/ready/completed, without requiring another printing-start click. An unpaid customer submission does not block stock. Orders with unknown recipes remain saved and show NEEDS_REVIEW, with no partial deductions. After configuring the recipe, use Bahan sudah diatur — catat pemakaian in the order detail. Legacy orders without trustworthy movement records require a physical/manual review; they are not automatically deducted twice.

Cancellation asks for a reason and whether materials are unused. Only recorded unused deductions are restored, exactly once. Used print materials stay consumed as WASTED. This does not issue a bank refund. Cancelled orders cannot be reopened; create a new order for a reprint.

Authoritative order movement state is stored in staff-only stock_logs documents with type ORDER_STATE. It is not trusted from customer-created order fields and is omitted from the visible movement log. This uses the already deployed stock_logs permissions; no new collection or rule deployment is needed for this release.

## Remote supervision and payments

Ringkasan toko separates sales by order date from recorded receipts by verification date, in WIB. It shows pending payments, ready jobs, cancellations, refund checks and material exceptions. Gross receipts include shipping and have not had refunds subtracted. They are not a bank balance or a cash-drawer reconciliation. Historical paid orders without paidAt use their order date and are explicitly counted as legacy estimates.

Staff can copy/share the prepared recap to the existing WhatsApp group; the app never sends messages automatically. Refunds, deposits/partial payments, bank reconciliation and receipt-file uploads remain manual/outside this release. Payment proof can be sent through WhatsApp; a screenshot or PDF alone must never mark an order paid. No bank account number, QRIS payload or contact number has been invented. Set VITE_STUDIO_WHATSAPP to the verified studio number to enable direct contact links.

## Validation

Run npm test, npm run lint and npm run build. Tests cover recipes, shortages, transactions/rollback using a deterministic store double, competing sales, retries, restoration/waste, fabricated customer stock fields, payment audit stamps and supervision date handling. They do not establish production Firebase authorization or emulator conformance.

With Vite on port 3000, run tests/staff-smoke.mjs with Playwright tooling. Its context module is replaced only in the test browser; it exercises staff UI without granting real access or writing production records. Customer browser-smoke.mjs and ui-smoke.mjs remain applicable. Verify a test sale against the configured production permissions and measured materials before relying on stock balances operationally.
