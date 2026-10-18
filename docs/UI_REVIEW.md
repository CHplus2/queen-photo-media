# UI and UX update

The previous interface had a crowded header, long marketing copy, small text and controls, competing product actions, misleading upload affordances, mixed customer/staff navigation, and inconsistent financial labels.

## Changes

- Shared forest-green and warm-neutral palette, typography, spacing, button, input, card, and modal styles. System fonts remove the external font dependency and layout shifts.
- Customer navigation separates shopping from staff tools. Mobile navigation has an explicit open/closed state; staff navigation has its own workspace. A skip link, page titles, and focus on navigation support keyboard use.
- Shorter home and service copy, consistent photography, useful category names, search, filter counts, and a recoverable empty state. Disabled services stay out of the catalog. The footer no longer displays a placeholder telephone number or unrelated staff links.
- Service options use clear defaults, a progressive optional section, and a persistent price/action footer. The file picker that merely recorded a filename has been removed. The interface explains that originals are sent via WhatsApp after checkout.
- Cart review and checkout are separate steps. Contact, delivery and payment preferences have labels and grouped inputs. Pickup is the default, shipping costs are explicit, totals remain visible, and submission failures appear inline without losing the cart. The interface never suggests that selecting a payment method establishes payment.
- Modal focus trapping, Escape handling, focus restoration, scroll locking, large controls, and reduced-motion support. Receipt, service editing, and stock dialogs reuse the focus behavior.
- Clearer tracking states and private-device history instead of demo search examples or phone-number search.
- A quieter staff workspace, readable table/form text, labelled controls, consistent monetary typography, and improved contrast. Sales reports offer a period selector, category/channel breakdowns, CSV export and honest empty states. Daily POS figures use the same paid-order/WIB reporting rules as the main report.
- A shorter, neutral customer survey without preselected responses or fabricated success on a failed save.

## Validation scope

`npm test`, `npm run lint`, and `npm run build` validate the application. With Vite on port 3000, run `tests/browser-smoke.mjs` for the order flow and `tests/ui-smoke.mjs` for responsive navigation, filtering and empty states. Both scripts accept `PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` for development tooling and intercept external requests so no production records are created.

Customer screens were checked at 320, 390, 768 and 1440 pixel widths. Automated axe checks cover WCAG A/AA rules on the customer pages, ordering dialogs, survey and staff login. Staff screens are checked with an isolated browser fixture that replaces the context module only in the test browser; it is not a production login mechanism and does not validate real Firebase authorization. Automated accessibility checks complement visual/keyboard checks and do not establish full accessibility conformance.

Existing Firebase deployment requirements in RELEASE.md still apply. This update does not deploy Firebase rules, authenticate as an employee, or verify production order/payment processing. Existing inventory and costing behavior is preserved.
