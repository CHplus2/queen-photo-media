# Usability and accuracy review

This review covers the local application, not a production acceptance test.

## Changes

- Added Indonesian/English interface support and optional English product text; see LANGUAGES.md. Language switches retain drafts and stable option values.
- Customer research now shows actual response counts and honest empty states, instead of speculative demographic conclusions and default perfect ratings. Survey responses alone cannot establish demand across Pontianak.
- Cost simulation now calls its result estimated gross profit. Roll capacity accounts for width and optional rotation in a simple grid, and returns zero for dimensions that cannot fit. It explicitly excludes cutting gaps, borders and waste; it is not a production cutting plan.
- The existing direct catalog editor reduces clicks for name, size and frame changes and preserves independent frame surcharges/costs. Renaming a size flags old unprocessed orders for material review instead of guessing consumption.

## Evidence and limits

Unit tests cover stock transactions and retries, cancellation, deposits, verified payments, report dates and exclusions, malformed records, frame pricing, localization and roll yield. Browser scripts cover customer ordering and failure recovery, responsive navigation, accessibility scans, staff sales/payment/cancellation screens, catalog edits, login/logout isolation and the production build with CSP.

Staff browser tests use fixtures. They verify UI behavior, not production authorization. Live Firebase rules, concurrent writes against the real database, real staff accounts, printers and bank settlement still require acceptance checks with test accounts. Bank transfers are manually verified; there is no payment gateway, automatic bank reconciliation or automatic refund. Customer order totals require staff confirmation before fulfillment.

Automatic stock handling depends on measured inventory and configured usage. Special sizes/frames without a reliable recipe require review. The cost simulator uses local device settings and estimated costs; it does not establish audited net profit. Firebase remains a large main bundle dependency despite lazy staff pages and English text.

For staff adoption, keep Indonesian as the default, use Cashier for immediate walk-in sales and use the queue only for unfinished work. Observe real employees completing a sale, correcting a quantity and recording a later payment before declaring the interface friction-free. Automated checks cannot establish ease of use for every employee.
