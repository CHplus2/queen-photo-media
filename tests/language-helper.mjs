// Reach the language control through the mobile menu when it is collapsed.
export async function selectLanguage(page, language) {
  const selector = page.getByRole('combobox', { name: 'Bahasa / Language' });
  const menu = page.locator('button[aria-controls="mobile-navigation"]');
  if (!(await selector.isVisible())) await menu.click();
  await selector.selectOption(language);
  await page.waitForFunction(
    (lang) => document.documentElement.lang === lang,
    language,
  );
  if (
    (await menu.isVisible()) &&
    (await menu.getAttribute('aria-expanded')) === 'true'
  )
    await menu.click();
}
