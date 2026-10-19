# Indonesian and English

Indonesian is the default. The “Bahasa / Language” selector applies to customer and staff interface text, validation messages, accessibility labels, summaries and receipts. The preference is saved on the device. Switching languages preserves current form inputs. English translations load only when needed; no external translation service receives customer content.

Currency remains Indonesian rupiah. Human-readable dates and number formatting follow the language. Business-day accounting still uses Asia/Pontianak (WIB).

In Names & prices, expand the optional English product text section to supply English names, descriptions and units. The built-in catalog has English names, descriptions, units and option labels, including existing Firestore records with matching Indonesian text. Explicit English fields override these translations. New or rewritten custom content needs an English entry; otherwise its original text is shown. Customer notes, customer names, material names are not automatically translated. Known catalog names in historical records can display in English without changing the stored record. New order lines retain optional English product names as snapshots; changing a catalog name does not rewrite old orders. Size codes, status IDs, frame values and material recipes remain unchanged by translation.

No new Firebase claim or rules change is needed for the language feature. Previously documented authorization and release checks still apply.

Validation: unit tests check interpolation, currency, dates and data preservation. The language browser check exercises English/Indonesian navigation, frame pricing and stored values, retained checkout inputs, reload preferences and responsive layout. Staff and catalog browser checks cover changing language during sale entry and editing optional English product text. All browser checks block external requests or use fixtures; none validates production writes or bank payment processing.
