# Faster product editing

Owner navigation now includes **Produk & harga** directly. Common edits no longer require Settings → menu → Edit → a long form.

- **Nama & harga:** type into the name, price, unit or group field and press Enter or Simpan on that product. A product with one size also shows its size directly here: rename 10R to 8R and save without opening another screen. Names and size options are independent; update both fields when both labels should change.
- **Ukuran foto:** edit each size on its own row; add/remove options without comma-separated text. The first option remains the default. Search matches product names, units, size labels and frame names.
- **Bingkai:** edit each frame's name, additional price and material cost together. Renaming preserves the numbers; pricing no longer depends only on matching a hardcoded Indonesian label. The system's Tanpa Bingkai option stays free. Optional frame surcharges are added only when a frame is selected; quick-add uses the base product with no optional frame, matching the configurator's initial selection. If a base product already includes a frame, keep its included price/materials in that product and use the modifier only for optional extras.
- **Detail lainnya:** retains the full form for descriptions, production costs, paper type, finishing, and background choices. Save/cancel any inline changes before opening it. Hide a discontinued product with the visibility checkbox rather than deleting its history. The distracting destructive bulk-reset control was removed from the main editing screen.

Each save has explicit success/failure feedback. Failed inline saves retain input, repeated submit clicks are locked, and page refresh warns about unsaved changes. Tabs preserve pending row edits, but save before changing the search/filter or leaving the page because rows that disappear are unmounted. A visible change from another device blocks saving a dirty row until its current data is reloaded; this is a UI conflict warning, not a server-side revision lock.

Service creation is now shown as successful only after Firestore accepts it. Edits use updateDoc patches, preserving unrelated top-level fields and failing if the service has been deleted. Options are replaced together so removing a frame/size does not leave old hidden options in the database. Existing order line items and prices are not rewritten.

## Size and inventory safety

Changing a size for an automatically tracked service pauses that service's automatic recipe until its measured material usage is reviewed in Inventaris. For a spelling-only correction with unchanged physical dimensions and material use, the owner can explicitly tick the label-only checkbox. Existing pending orders whose size no longer matches a catalog size are flagged for material review, including a renamed single-size service; a new recipe is not blindly applied to an older physical size.

Different size options still share a service's base price and standard material recipe. Use separate products when sizes have different prices or material usage. This release does not create per-size price tiers or rename the fixed top-level category taxonomy; it makes assigning a product to those groups and editing product/size/frame labels faster.

## Rollout and validation

No new Firebase rules or claims are required. Deploy the matching `main` build through Vercel and refresh. This release does not modify catalog records until an owner saves an edit.

Unit tests cover frame rename pricing, invalid/duplicate labels and an old size versus a changed material recipe. The catalog browser smoke test covers mobile/desktop direct edits, Enter save, failed-save recovery, size review and frame pricing. Its context is a fixture and external requests are blocked; no production records are changed by tests.
