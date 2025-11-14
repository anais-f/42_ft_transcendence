export const BUTTON_CLASSES = 'inline-flex items-center rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700'

// Newspaper style helpers
export const HEADLINE_CLASSES = 'font-serif text-4xl md:text-5xl tracking-tight'
export const SUBHEAD_CLASSES = 'text-xs uppercase tracking-wide text-gray-500 dark:text-neutral-400'
export const SECTION_TITLE_CLASSES = 'font-serif text-xl tracking-tight'
export const DIVIDER_CLASSES = 'border-t border-gray-200 dark:border-neutral-800'

export function createGoogleButton(id?: string) {
  const a = document.createElement('a')
  if (id) a.id = id
  a.href = '/auth-google/login/google'
  a.className = BUTTON_CLASSES
  a.textContent = 'Continuer avec Google'
  return a
}

export function createCancelAnchor(href = '#/') {
  const a = document.createElement('a')
  a.href = href
  a.className = BUTTON_CLASSES
  a.textContent = 'Annuler'
  return a
}
